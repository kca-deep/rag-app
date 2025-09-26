from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, asc
from datetime import datetime
import uuid

from app.models.chunk import Chunk, ChunkStatus
from app.core.exceptions import RAGException


class ChunkRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_chunks(self, chunks_data: List[Dict[str, Any]]) -> List[Chunk]:
        chunks = []
        for chunk_data in chunks_data:
            chunk = Chunk(
                id=str(uuid.uuid4()),
                **chunk_data
            )
            chunks.append(chunk)

        self.session.add_all(chunks)
        await self.session.commit()

        # Refresh all chunks
        for chunk in chunks:
            await self.session.refresh(chunk)

        return chunks

    async def get_by_id(self, chunk_id: str) -> Optional[Chunk]:
        stmt = select(Chunk).where(Chunk.id == chunk_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_document(
        self,
        document_id: str,
        skip: int = 0,
        limit: int = 50,
        status: Optional[ChunkStatus] = None
    ) -> tuple[List[Chunk], int]:

        filters = [Chunk.document_id == document_id]
        if status:
            filters.append(Chunk.status == status)

        stmt = select(Chunk).where(and_(*filters))

        # Count total
        count_stmt = select(func.count()).select_from(stmt.alias())
        total_result = await self.session.execute(count_stmt)
        total = total_result.scalar()

        # Apply pagination and ordering
        stmt = stmt.order_by(Chunk.chunk_index).offset(skip).limit(limit)

        result = await self.session.execute(stmt)
        chunks = result.scalars().all()

        return list(chunks), total

    async def get_by_collection(
        self,
        collection_id: str,
        skip: int = 0,
        limit: int = 50,
        status: Optional[ChunkStatus] = None
    ) -> tuple[List[Chunk], int]:

        filters = [Chunk.collection_id == collection_id]
        if status:
            filters.append(Chunk.status == status)

        stmt = select(Chunk).where(and_(*filters))

        # Count total
        count_stmt = select(func.count()).select_from(stmt.alias())
        total_result = await self.session.execute(count_stmt)
        total = total_result.scalar()

        # Apply pagination and ordering
        stmt = stmt.order_by(desc(Chunk.created_at)).offset(skip).limit(limit)

        result = await self.session.execute(stmt)
        chunks = result.scalars().all()

        return list(chunks), total

    async def update_status(
        self,
        chunk_id: str,
        status: ChunkStatus,
        error_message: Optional[str] = None,
        embedding_model: Optional[str] = None,
        quality_score: Optional[float] = None
    ) -> Optional[Chunk]:

        chunk = await self.get_by_id(chunk_id)
        if not chunk:
            return None

        chunk.status = status
        chunk.updated_at = datetime.utcnow()

        if status == ChunkStatus.EMBEDDING:
            chunk.embedding_model = embedding_model
            chunk.embedding_error = None
        elif status == ChunkStatus.COMPLETED:
            chunk.embedding_generated_at = datetime.utcnow()
            chunk.embedding_error = None
            if quality_score is not None:
                chunk.embedding_quality_score = quality_score
        elif status == ChunkStatus.FAILED:
            chunk.embedding_error = error_message

        await self.session.commit()
        await self.session.refresh(chunk)

        return chunk

    async def mark_synced(self, chunk_ids: List[str]) -> int:
        if not chunk_ids:
            return 0

        stmt = select(Chunk).where(Chunk.id.in_(chunk_ids))
        result = await self.session.execute(stmt)
        chunks = result.scalars().all()

        count = 0
        for chunk in chunks:
            chunk.mark_synced()
            count += 1

        await self.session.commit()
        return count

    async def get_pending_embedding_chunks(self, limit: int = 100) -> List[Chunk]:
        stmt = select(Chunk).where(
            Chunk.status == ChunkStatus.PENDING
        ).limit(limit)

        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_unsynced_chunks(self, limit: int = 100) -> List[Chunk]:
        stmt = select(Chunk).where(
            and_(
                Chunk.status == ChunkStatus.COMPLETED,
                Chunk.milvus_synced == False
            )
        ).limit(limit)

        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def delete_by_document(self, document_id: str) -> int:
        stmt = select(Chunk).where(Chunk.document_id == document_id)
        result = await self.session.execute(stmt)
        chunks = result.scalars().all()

        count = len(chunks)
        for chunk in chunks:
            await self.session.delete(chunk)

        await self.session.commit()
        return count

    async def delete_by_collection(self, collection_id: str) -> int:
        stmt = select(Chunk).where(Chunk.collection_id == collection_id)
        result = await self.session.execute(stmt)
        chunks = result.scalars().all()

        count = len(chunks)
        for chunk in chunks:
            await self.session.delete(chunk)

        await self.session.commit()
        return count

    async def get_stats_by_document(self, document_id: str) -> Dict[str, Any]:
        base_filter = Chunk.document_id == document_id

        total_chunks = await self.session.scalar(
            select(func.count(Chunk.id)).where(base_filter)
        )

        completed_chunks = await self.session.scalar(
            select(func.count(Chunk.id)).where(
                and_(base_filter, Chunk.status == ChunkStatus.COMPLETED)
            )
        )

        pending_chunks = await self.session.scalar(
            select(func.count(Chunk.id)).where(
                and_(base_filter, Chunk.status == ChunkStatus.PENDING)
            )
        )

        failed_chunks = await self.session.scalar(
            select(func.count(Chunk.id)).where(
                and_(base_filter, Chunk.status == ChunkStatus.FAILED)
            )
        )

        synced_chunks = await self.session.scalar(
            select(func.count(Chunk.id)).where(
                and_(base_filter, Chunk.milvus_synced == True)
            )
        )

        avg_quality = await self.session.scalar(
            select(func.avg(Chunk.content_quality_score)).where(
                and_(base_filter, Chunk.content_quality_score.is_not(None))
            )
        )

        return {
            "total_chunks": total_chunks or 0,
            "completed_chunks": completed_chunks or 0,
            "pending_chunks": pending_chunks or 0,
            "failed_chunks": failed_chunks or 0,
            "synced_chunks": synced_chunks or 0,
            "average_quality_score": float(avg_quality) if avg_quality else None
        }

    async def get_stats_by_collection(self, collection_id: str) -> Dict[str, Any]:
        base_filter = Chunk.collection_id == collection_id

        total_chunks = await self.session.scalar(
            select(func.count(Chunk.id)).where(base_filter)
        )

        completed_chunks = await self.session.scalar(
            select(func.count(Chunk.id)).where(
                and_(base_filter, Chunk.status == ChunkStatus.COMPLETED)
            )
        )

        synced_chunks = await self.session.scalar(
            select(func.count(Chunk.id)).where(
                and_(base_filter, Chunk.milvus_synced == True)
            )
        )

        total_chars = await self.session.scalar(
            select(func.sum(Chunk.character_count)).where(base_filter)
        )

        total_words = await self.session.scalar(
            select(func.sum(Chunk.word_count)).where(base_filter)
        )

        avg_quality = await self.session.scalar(
            select(func.avg(Chunk.content_quality_score)).where(
                and_(base_filter, Chunk.content_quality_score.is_not(None))
            )
        )

        return {
            "total_chunks": total_chunks or 0,
            "completed_chunks": completed_chunks or 0,
            "synced_chunks": synced_chunks or 0,
            "total_characters": total_chars or 0,
            "total_words": total_words or 0,
            "average_quality_score": float(avg_quality) if avg_quality else None
        }

    async def get_chunk_context(self, chunk_id: str, context_size: int = 2) -> Dict[str, Any]:
        chunk = await self.get_by_id(chunk_id)
        if not chunk:
            return {}

        # Get previous chunks
        prev_stmt = select(Chunk).where(
            and_(
                Chunk.document_id == chunk.document_id,
                Chunk.chunk_index < chunk.chunk_index
            )
        ).order_by(desc(Chunk.chunk_index)).limit(context_size)

        prev_result = await self.session.execute(prev_stmt)
        previous_chunks = list(reversed(prev_result.scalars().all()))

        # Get next chunks
        next_stmt = select(Chunk).where(
            and_(
                Chunk.document_id == chunk.document_id,
                Chunk.chunk_index > chunk.chunk_index
            )
        ).order_by(Chunk.chunk_index).limit(context_size)

        next_result = await self.session.execute(next_stmt)
        next_chunks = list(next_result.scalars().all())

        return {
            "current_chunk": chunk,
            "previous_chunks": previous_chunks,
            "next_chunks": next_chunks
        }

    async def search_chunks_by_content(
        self,
        collection_id: str,
        query: str,
        limit: int = 20
    ) -> List[Chunk]:
        search_pattern = f"%{query}%"
        stmt = select(Chunk).where(
            and_(
                Chunk.collection_id == collection_id,
                Chunk.content.ilike(search_pattern),
                Chunk.status == ChunkStatus.COMPLETED
            )
        ).limit(limit)

        result = await self.session.execute(stmt)
        return list(result.scalars().all())