from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, asc
from sqlalchemy.orm import selectinload
import uuid
from datetime import datetime, timedelta

from app.models.document import Document, DocumentStatus
from app.core.exceptions import DocumentNotFoundError


class DocumentRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(
        self,
        collection_id: str,
        filename: str,
        original_filename: str,
        file_path: str,
        file_size: int,
        file_type: str,
        file_hash: str,
        metadata: Optional[Dict[str, Any]] = None,
        processing_config: Optional[Dict[str, Any]] = None
    ) -> Document:

        document = Document(
            id=str(uuid.uuid4()),
            collection_id=collection_id,
            filename=filename,
            original_filename=original_filename,
            file_path=file_path,
            file_size=file_size,
            file_type=file_type,
            file_hash=file_hash,
            metadata=metadata or {},
            processing_config=processing_config or {},
            status=DocumentStatus.UPLOADING
        )

        self.session.add(document)
        await self.session.commit()
        await self.session.refresh(document)

        return document

    async def get_by_id(self, document_id: str) -> Optional[Document]:
        stmt = select(Document).where(and_(Document.id == document_id, Document.is_deleted == False))
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_hash(self, file_hash: str, collection_id: str) -> Optional[Document]:
        stmt = select(Document).where(
            and_(
                Document.file_hash == file_hash,
                Document.collection_id == collection_id,
                Document.is_deleted == False
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_collection(
        self,
        collection_id: str,
        skip: int = 0,
        limit: int = 20,
        status: Optional[DocumentStatus] = None,
        search: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> tuple[List[Document], int]:

        # Build base query
        stmt = select(Document).where(
            and_(Document.collection_id == collection_id, Document.is_deleted == False)
        )

        # Apply filters
        filters = []

        if status:
            filters.append(Document.status == status)

        if search:
            search_pattern = f"%{search}%"
            filters.append(
                or_(
                    Document.filename.ilike(search_pattern),
                    Document.original_filename.ilike(search_pattern)
                )
            )

        if filters:
            stmt = stmt.where(and_(*filters))

        # Count total results
        count_stmt = select(func.count()).select_from(stmt.alias())
        total_result = await self.session.execute(count_stmt)
        total = total_result.scalar()

        # Apply sorting
        sort_column = getattr(Document, sort_by, Document.created_at)
        if sort_order.lower() == "desc":
            stmt = stmt.order_by(desc(sort_column))
        else:
            stmt = stmt.order_by(asc(sort_column))

        # Apply pagination
        stmt = stmt.offset(skip).limit(limit)

        # Execute query
        result = await self.session.execute(stmt)
        documents = result.scalars().all()

        return list(documents), total

    async def update_status(
        self,
        document_id: str,
        status: DocumentStatus,
        error_message: Optional[str] = None
    ) -> Optional[Document]:

        document = await self.get_by_id(document_id)
        if not document:
            return None

        document.status = status
        document.updated_at = datetime.utcnow()

        if status == DocumentStatus.PROCESSING:
            document.processing_started_at = datetime.utcnow()
            document.processing_error = None
        elif status == DocumentStatus.COMPLETED:
            document.processing_completed_at = datetime.utcnow()
            document.processing_error = None
        elif status == DocumentStatus.FAILED:
            document.processing_completed_at = datetime.utcnow()
            document.processing_error = error_message

        await self.session.commit()
        await self.session.refresh(document)

        return document

    async def update_processing_stats(
        self,
        document_id: str,
        chunk_count: int,
        character_count: int,
        word_count: int,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[Document]:

        document = await self.get_by_id(document_id)
        if not document:
            return None

        document.chunk_count = chunk_count
        document.character_count = character_count
        document.word_count = word_count
        if metadata:
            document.metadata.update(metadata)
        document.updated_at = datetime.utcnow()

        await self.session.commit()
        await self.session.refresh(document)

        return document

    async def soft_delete(self, document_id: str) -> bool:
        document = await self.get_by_id(document_id)
        if not document:
            raise DocumentNotFoundError(document_id)

        document.soft_delete()
        await self.session.commit()

        return True

    async def get_processing_documents(self) -> List[Document]:
        stmt = select(Document).where(
            and_(
                Document.status.in_([DocumentStatus.UPLOADING, DocumentStatus.PROCESSING]),
                Document.is_deleted == False
            )
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_failed_documents(self, collection_id: Optional[str] = None) -> List[Document]:
        filters = [Document.status == DocumentStatus.FAILED, Document.is_deleted == False]
        if collection_id:
            filters.append(Document.collection_id == collection_id)

        stmt = select(Document).where(and_(*filters))
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_stats_by_collection(self, collection_id: str) -> Dict[str, Any]:
        base_filter = and_(Document.collection_id == collection_id, Document.is_deleted == False)

        # Count documents by status
        total_docs = await self.session.scalar(
            select(func.count(Document.id)).where(base_filter)
        )

        completed_docs = await self.session.scalar(
            select(func.count(Document.id)).where(
                and_(base_filter, Document.status == DocumentStatus.COMPLETED)
            )
        )

        processing_docs = await self.session.scalar(
            select(func.count(Document.id)).where(
                and_(base_filter, Document.status == DocumentStatus.PROCESSING)
            )
        )

        failed_docs = await self.session.scalar(
            select(func.count(Document.id)).where(
                and_(base_filter, Document.status == DocumentStatus.FAILED)
            )
        )

        # Sum statistics
        total_size = await self.session.scalar(
            select(func.sum(Document.file_size)).where(base_filter)
        )

        total_chunks = await self.session.scalar(
            select(func.sum(Document.chunk_count)).where(base_filter)
        )

        total_chars = await self.session.scalar(
            select(func.sum(Document.character_count)).where(base_filter)
        )

        # Average processing time for completed documents
        avg_processing_time = await self.session.scalar(
            select(func.avg(
                func.extract('epoch', Document.processing_completed_at - Document.processing_started_at)
            )).where(
                and_(
                    base_filter,
                    Document.status == DocumentStatus.COMPLETED,
                    Document.processing_started_at.is_not(None),
                    Document.processing_completed_at.is_not(None)
                )
            )
        )

        return {
            "total_documents": total_docs or 0,
            "completed_documents": completed_docs or 0,
            "processing_documents": processing_docs or 0,
            "failed_documents": failed_docs or 0,
            "total_size_bytes": total_size or 0,
            "total_chunks": total_chunks or 0,
            "total_characters": total_chars or 0,
            "average_processing_time_seconds": float(avg_processing_time) if avg_processing_time else None
        }

    async def get_documents_by_status(self, status: DocumentStatus, limit: int = 100) -> List[Document]:
        stmt = select(Document).where(
            and_(Document.status == status, Document.is_deleted == False)
        ).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_documents_needing_reprocessing(self) -> List[Document]:
        # Documents that failed processing and might need retry
        stmt = select(Document).where(
            and_(
                Document.status == DocumentStatus.FAILED,
                Document.is_deleted == False,
                # Only include recent failures (within last 24 hours)
                Document.processing_completed_at > datetime.utcnow() - timedelta(hours=24)
            )
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def search_documents(
        self,
        collection_id: str,
        query: str,
        limit: int = 10
    ) -> List[Document]:
        search_pattern = f"%{query}%"
        stmt = select(Document).where(
            and_(
                Document.collection_id == collection_id,
                Document.is_deleted == False,
                or_(
                    Document.filename.ilike(search_pattern),
                    Document.original_filename.ilike(search_pattern)
                )
            )
        ).limit(limit)

        result = await self.session.execute(stmt)
        return list(result.scalars().all())