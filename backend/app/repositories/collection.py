from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, asc
from sqlalchemy.orm import selectinload
import uuid
from datetime import datetime

from app.models.collection import Collection, CollectionStatus
from app.schemas.collection import CollectionCreate, CollectionUpdate
from app.core.exceptions import CollectionNotFoundError, CollectionAlreadyExistsError


class CollectionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, collection_data: CollectionCreate) -> Collection:
        # Check if collection name already exists
        existing = await self.get_by_name(collection_data.name)
        if existing:
            raise CollectionAlreadyExistsError(collection_data.name)

        # Generate Milvus collection name (alphanumeric only)
        milvus_name = f"collection_{uuid.uuid4().hex[:16]}"

        # Create new collection
        collection = Collection(
            id=str(uuid.uuid4()),
            name=collection_data.name,
            description=collection_data.description,
            embedding_model=collection_data.embedding_model,
            chunk_size=collection_data.chunk_size,
            chunk_overlap=collection_data.chunk_overlap,
            settings=collection_data.settings,
            tags=collection_data.tags,
            milvus_collection_name=milvus_name,
            status=CollectionStatus.ACTIVE
        )

        self.session.add(collection)
        await self.session.commit()
        await self.session.refresh(collection)

        return collection

    async def get_by_id(self, collection_id: str) -> Optional[Collection]:
        stmt = select(Collection).where(Collection.id == collection_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_name(self, name: str) -> Optional[Collection]:
        stmt = select(Collection).where(Collection.name == name)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_milvus_name(self, milvus_name: str) -> Optional[Collection]:
        stmt = select(Collection).where(Collection.milvus_collection_name == milvus_name)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        status: Optional[CollectionStatus] = None,
        tags: Optional[List[str]] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> tuple[List[Collection], int]:

        # Build base query
        stmt = select(Collection)

        # Apply filters
        filters = []

        if search:
            search_pattern = f"%{search}%"
            filters.append(
                or_(
                    Collection.name.ilike(search_pattern),
                    Collection.description.ilike(search_pattern)
                )
            )

        if status:
            filters.append(Collection.status == status)

        if tags:
            # Check if any of the provided tags exist in the collection's tags
            for tag in tags:
                filters.append(Collection.tags.contains([tag]))

        if filters:
            stmt = stmt.where(and_(*filters))

        # Count total results
        count_stmt = select(func.count()).select_from(stmt.alias())
        total_result = await self.session.execute(count_stmt)
        total = total_result.scalar()

        # Apply sorting
        sort_column = getattr(Collection, sort_by, Collection.created_at)
        if sort_order.lower() == "desc":
            stmt = stmt.order_by(desc(sort_column))
        else:
            stmt = stmt.order_by(asc(sort_column))

        # Apply pagination
        stmt = stmt.offset(skip).limit(limit)

        # Execute query
        result = await self.session.execute(stmt)
        collections = result.scalars().all()

        return list(collections), total

    async def update(self, collection_id: str, collection_data: CollectionUpdate) -> Optional[Collection]:
        collection = await self.get_by_id(collection_id)
        if not collection:
            raise CollectionNotFoundError(collection_id)

        # Check name uniqueness if name is being updated
        if collection_data.name and collection_data.name != collection.name:
            existing = await self.get_by_name(collection_data.name)
            if existing:
                raise CollectionAlreadyExistsError(collection_data.name)

        # Update fields
        update_data = collection_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(collection, field, value)

        collection.updated_at = datetime.utcnow()

        await self.session.commit()
        await self.session.refresh(collection)

        return collection

    async def delete(self, collection_id: str) -> bool:
        collection = await self.get_by_id(collection_id)
        if not collection:
            raise CollectionNotFoundError(collection_id)

        await self.session.delete(collection)
        await self.session.commit()

        return True

    async def update_stats(
        self,
        collection_id: str,
        document_count: Optional[int] = None,
        chunk_count: Optional[int] = None,
        total_size: Optional[int] = None
    ) -> Optional[Collection]:
        collection = await self.get_by_id(collection_id)
        if not collection:
            return None

        if document_count is not None:
            collection.document_count = document_count
        if chunk_count is not None:
            collection.chunk_count = chunk_count
        if total_size is not None:
            collection.total_size_bytes = total_size

        collection.updated_at = datetime.utcnow()

        await self.session.commit()
        await self.session.refresh(collection)

        return collection

    async def mark_sync_status(
        self,
        collection_id: str,
        synced: bool,
        error_message: Optional[str] = None
    ) -> Optional[Collection]:
        collection = await self.get_by_id(collection_id)
        if not collection:
            return None

        if synced:
            collection.mark_sync_success()
        else:
            collection.mark_sync_error(error_message or "Unknown sync error")

        await self.session.commit()
        await self.session.refresh(collection)

        return collection

    async def get_unsynced_collections(self) -> List[Collection]:
        stmt = select(Collection).where(
            or_(
                Collection.milvus_synced == False,
                Collection.status == CollectionStatus.SYNCING
            )
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_collections_by_status(self, status: CollectionStatus) -> List[Collection]:
        stmt = select(Collection).where(Collection.status == status)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_stats_summary(self) -> Dict[str, Any]:
        # Get total counts
        total_collections = await self.session.scalar(select(func.count(Collection.id)))

        active_collections = await self.session.scalar(
            select(func.count(Collection.id)).where(Collection.status == CollectionStatus.ACTIVE)
        )

        syncing_collections = await self.session.scalar(
            select(func.count(Collection.id)).where(Collection.status == CollectionStatus.SYNCING)
        )

        error_collections = await self.session.scalar(
            select(func.count(Collection.id)).where(Collection.status == CollectionStatus.ERROR)
        )

        # Get total documents and chunks across all collections
        total_documents = await self.session.scalar(select(func.sum(Collection.document_count)))
        total_chunks = await self.session.scalar(select(func.sum(Collection.chunk_count)))
        total_size = await self.session.scalar(select(func.sum(Collection.total_size_bytes)))

        # Get synced collections count
        synced_collections = await self.session.scalar(
            select(func.count(Collection.id)).where(Collection.milvus_synced == True)
        )

        return {
            "total_collections": total_collections or 0,
            "active_collections": active_collections or 0,
            "syncing_collections": syncing_collections or 0,
            "error_collections": error_collections or 0,
            "synced_collections": synced_collections or 0,
            "total_documents": total_documents or 0,
            "total_chunks": total_chunks or 0,
            "total_size_bytes": total_size or 0
        }

    async def search_collections(self, query: str, limit: int = 10) -> List[Collection]:
        search_pattern = f"%{query}%"
        stmt = select(Collection).where(
            or_(
                Collection.name.ilike(search_pattern),
                Collection.description.ilike(search_pattern)
            )
        ).limit(limit)

        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_collections_with_tags(self, tags: List[str]) -> List[Collection]:
        # Get collections that have any of the specified tags
        filters = []
        for tag in tags:
            filters.append(Collection.tags.contains([tag]))

        stmt = select(Collection).where(or_(*filters))
        result = await self.session.execute(stmt)
        return list(result.scalars().all())