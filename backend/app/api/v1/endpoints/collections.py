from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.core.milvus_client import milvus_manager
from app.repositories.collection import CollectionRepository
from app.schemas.collection import (
    CollectionCreate,
    CollectionUpdate,
    CollectionResponse,
    CollectionListResponse,
    CollectionStats,
    CollectionHealthCheck,
    CollectionSyncRequest
)
from app.schemas.common import MessageResponse, OperationResponse
from app.models.collection import CollectionStatus
from app.core.exceptions import CollectionNotFoundError, VectorDatabaseError
import structlog
import uuid
from datetime import datetime

logger = structlog.get_logger(__name__)
router = APIRouter()


@router.get("/", response_model=CollectionListResponse)
async def list_collections(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of items to return"),
    search: Optional[str] = Query(None, description="Search query for collection name or description"),
    status: Optional[CollectionStatus] = Query(None, description="Filter by collection status"),
    tags: Optional[List[str]] = Query(None, description="Filter by tags"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Retrieve a paginated list of collections with optional filtering and sorting.
    """
    try:
        repo = CollectionRepository(db)
        collections, total = await repo.get_all(
            skip=skip,
            limit=limit,
            search=search,
            status=status,
            tags=tags,
            sort_by=sort_by,
            sort_order=sort_order
        )

        # Calculate pagination info
        page = (skip // limit) + 1
        has_next = (skip + limit) < total
        has_previous = skip > 0

        return CollectionListResponse(
            collections=[CollectionResponse.from_orm(c) for c in collections],
            total=total,
            page=page,
            size=limit,
            has_next=has_next,
            has_previous=has_previous
        )

    except Exception as e:
        logger.error(f"Failed to list collections: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve collections"
        )


@router.post("/", response_model=CollectionResponse, status_code=status.HTTP_201_CREATED)
async def create_collection(
    collection_data: CollectionCreate,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Create a new collection with automatic Milvus collection setup.
    """
    try:
        repo = CollectionRepository(db)

        # Create collection in database
        collection = await repo.create(collection_data)

        # Create corresponding Milvus collection
        milvus_success = await milvus_manager.create_collection(collection.milvus_collection_name)

        if milvus_success:
            await repo.mark_sync_status(collection.id, synced=True)
            logger.info(f"Created collection {collection.name} with Milvus integration")
        else:
            await repo.mark_sync_status(
                collection.id,
                synced=False,
                error_message="Failed to create Milvus collection"
            )
            logger.warning(f"Created collection {collection.name} but Milvus integration failed")

        # Refresh to get updated sync status
        collection = await repo.get_by_id(collection.id)

        return CollectionResponse.from_orm(collection)

    except Exception as e:
        logger.error(f"Failed to create collection: {e}")
        if "already exists" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create collection"
        )


@router.get("/{collection_id}", response_model=CollectionResponse)
async def get_collection(
    collection_id: str,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Retrieve detailed information about a specific collection.
    """
    try:
        repo = CollectionRepository(db)
        collection = await repo.get_by_id(collection_id)

        if not collection:
            raise CollectionNotFoundError(collection_id)

        return CollectionResponse.from_orm(collection)

    except CollectionNotFoundError:
        raise
    except Exception as e:
        logger.error(f"Failed to get collection {collection_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve collection"
        )


@router.put("/{collection_id}", response_model=CollectionResponse)
async def update_collection(
    collection_id: str,
    collection_data: CollectionUpdate,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Update collection information and settings.
    """
    try:
        repo = CollectionRepository(db)
        collection = await repo.update(collection_id, collection_data)

        return CollectionResponse.from_orm(collection)

    except CollectionNotFoundError:
        raise
    except Exception as e:
        logger.error(f"Failed to update collection {collection_id}: {e}")
        if "already exists" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update collection"
        )


@router.delete("/{collection_id}", response_model=MessageResponse)
async def delete_collection(
    collection_id: str,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Delete a collection and its associated Milvus collection.
    """
    try:
        repo = CollectionRepository(db)
        collection = await repo.get_by_id(collection_id)

        if not collection:
            raise CollectionNotFoundError(collection_id)

        # Delete Milvus collection first
        if collection.milvus_collection_name:
            milvus_success = await milvus_manager.delete_collection(collection.milvus_collection_name)
            if not milvus_success:
                logger.warning(f"Failed to delete Milvus collection {collection.milvus_collection_name}")

        # Delete from database
        await repo.delete(collection_id)

        logger.info(f"Deleted collection {collection.name}")

        return MessageResponse(
            message=f"Collection '{collection.name}' has been successfully deleted",
            success=True
        )

    except CollectionNotFoundError:
        raise
    except Exception as e:
        logger.error(f"Failed to delete collection {collection_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete collection"
        )


@router.get("/{collection_id}/stats", response_model=CollectionStats)
async def get_collection_stats(
    collection_id: str,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Retrieve detailed statistics for a collection.
    """
    try:
        repo = CollectionRepository(db)
        collection = await repo.get_by_id(collection_id)

        if not collection:
            raise CollectionNotFoundError(collection_id)

        # Calculate additional stats
        avg_doc_size = (
            collection.total_size_bytes / collection.document_count
            if collection.document_count > 0 else 0
        )

        avg_chunks_per_doc = (
            collection.chunk_count / collection.document_count
            if collection.document_count > 0 else 0
        )

        return CollectionStats(
            id=collection.id,
            name=collection.name,
            document_count=collection.document_count,
            chunk_count=collection.chunk_count,
            total_size_bytes=collection.total_size_bytes,
            average_document_size=avg_doc_size,
            average_chunk_count_per_document=avg_chunks_per_doc,
            status=collection.status,
            milvus_synced=collection.milvus_synced,
            last_activity=collection.updated_at
        )

    except CollectionNotFoundError:
        raise
    except Exception as e:
        logger.error(f"Failed to get collection stats {collection_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve collection statistics"
        )


@router.get("/{collection_id}/health", response_model=CollectionHealthCheck)
async def check_collection_health(
    collection_id: str,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Perform a health check on a collection, verifying database and Milvus status.
    """
    try:
        repo = CollectionRepository(db)
        collection = await repo.get_by_id(collection_id)

        if not collection:
            raise CollectionNotFoundError(collection_id)

        issues = []

        # Check database status
        db_status = "healthy"

        # Check Milvus status
        milvus_status = "unknown"
        if collection.milvus_collection_name:
            milvus_stats = await milvus_manager.get_collection_stats(collection.milvus_collection_name)
            if milvus_stats:
                milvus_status = "healthy"
            else:
                milvus_status = "unhealthy"
                issues.append("Milvus collection not accessible")

        # Check sync status
        sync_status = "synced" if collection.milvus_synced else "out_of_sync"
        if not collection.milvus_synced:
            issues.append("Collection not synchronized with Milvus")

        if collection.status != CollectionStatus.ACTIVE:
            issues.append(f"Collection status is {collection.status}")

        return CollectionHealthCheck(
            collection_id=collection.id,
            collection_name=collection.name,
            database_status=db_status,
            milvus_status=milvus_status,
            sync_status=sync_status,
            last_check=datetime.utcnow(),
            issues=issues
        )

    except CollectionNotFoundError:
        raise
    except Exception as e:
        logger.error(f"Failed to check collection health {collection_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to perform health check"
        )


@router.post("/{collection_id}/sync", response_model=OperationResponse)
async def sync_collection(
    collection_id: str,
    sync_request: CollectionSyncRequest = CollectionSyncRequest(),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Manually trigger synchronization between database and Milvus for a collection.
    """
    try:
        repo = CollectionRepository(db)
        collection = await repo.get_by_id(collection_id)

        if not collection:
            raise CollectionNotFoundError(collection_id)

        # Set collection to syncing status
        await repo.mark_sync_status(collection.id, synced=False)
        collection.status = CollectionStatus.SYNCING
        await repo.update(collection.id, CollectionUpdate(status=CollectionStatus.SYNCING))

        operation_id = str(uuid.uuid4())

        try:
            # Create or recreate Milvus collection if needed
            if sync_request.force or not collection.milvus_collection_name:
                if collection.milvus_collection_name:
                    await milvus_manager.delete_collection(collection.milvus_collection_name)

                success = await milvus_manager.create_collection(collection.milvus_collection_name)
                if not success:
                    raise VectorDatabaseError("create_collection", "Failed to create Milvus collection")

            # Mark as successfully synced
            await repo.mark_sync_status(collection.id, synced=True)

            logger.info(f"Successfully synced collection {collection.name}")

            return OperationResponse(
                operation_id=operation_id,
                status="completed",
                message=f"Collection '{collection.name}' synchronized successfully",
                started_at=datetime.utcnow(),
                completed_at=datetime.utcnow(),
                progress=100,
                result={"synced": True, "collection_id": collection.id}
            )

        except Exception as sync_error:
            # Mark sync as failed
            await repo.mark_sync_status(
                collection.id,
                synced=False,
                error_message=str(sync_error)
            )

            logger.error(f"Failed to sync collection {collection.name}: {sync_error}")

            return OperationResponse(
                operation_id=operation_id,
                status="failed",
                message=f"Failed to sync collection '{collection.name}': {str(sync_error)}",
                started_at=datetime.utcnow(),
                completed_at=datetime.utcnow(),
                progress=0,
                result={"synced": False, "error": str(sync_error)}
            )

    except CollectionNotFoundError:
        raise
    except Exception as e:
        logger.error(f"Failed to sync collection {collection_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initiate collection sync"
        )