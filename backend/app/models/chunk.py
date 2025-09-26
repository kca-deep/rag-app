from sqlalchemy import Column, String, DateTime, Text, Integer, JSON, ForeignKey, Float, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
import datetime
from typing import Optional, Dict, Any, List
from enum import Enum

from app.core.database import Base


class ChunkStatus(str, Enum):
    PENDING = "pending"
    EMBEDDING = "embedding"
    COMPLETED = "completed"
    FAILED = "failed"
    DELETED = "deleted"


class Chunk(Base):
    __tablename__ = "chunks"

    id: Mapped[str] = mapped_column(String(255), primary_key=True)
    document_id: Mapped[str] = mapped_column(String(255), ForeignKey("documents.id"), nullable=False, index=True)
    collection_id: Mapped[str] = mapped_column(String(255), ForeignKey("collections.id"), nullable=False, index=True)

    # Chunk content and positioning
    content: Mapped[str] = mapped_column(Text, nullable=False)
    content_hash: Mapped[str] = mapped_column(String(32), nullable=False, index=True)  # MD5 hash for deduplication
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)  # Position in document
    start_char: Mapped[int] = mapped_column(Integer, nullable=False)
    end_char: Mapped[int] = mapped_column(Integer, nullable=False)

    # Content statistics
    character_count: Mapped[int] = mapped_column(Integer, nullable=False)
    word_count: Mapped[int] = mapped_column(Integer, nullable=False)
    token_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Embedding information
    status: Mapped[ChunkStatus] = mapped_column(
        String(20),
        nullable=False,
        default=ChunkStatus.PENDING,
        index=True
    )
    embedding_model: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    embedding_generated_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)
    embedding_error: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Quality scores
    content_quality_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    embedding_quality_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Metadata
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now()
    )

    # Chunk metadata (e.g., page number, section, etc.)
    chunk_metadata: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True, default=dict)

    # Vector database synchronization
    milvus_synced: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    milvus_sync_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)

    # Context information
    previous_chunk_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    next_chunk_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relationships
    # document = relationship("Document", back_populates="chunks")
    # collection = relationship("Collection")

    def __repr__(self):
        return f"<Chunk(id='{self.id}', doc_id='{self.document_id}', index={self.chunk_index}, status='{self.status}')>"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "document_id": self.document_id,
            "collection_id": self.collection_id,
            "content": self.content,
            "content_hash": self.content_hash,
            "chunk_index": self.chunk_index,
            "start_char": self.start_char,
            "end_char": self.end_char,
            "character_count": self.character_count,
            "word_count": self.word_count,
            "token_count": self.token_count,
            "status": self.status.value,
            "embedding_model": self.embedding_model,
            "embedding_generated_at": self.embedding_generated_at.isoformat() if self.embedding_generated_at else None,
            "embedding_error": self.embedding_error,
            "content_quality_score": self.content_quality_score,
            "embedding_quality_score": self.embedding_quality_score,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "metadata": self.chunk_metadata or {},
            "milvus_synced": self.milvus_synced,
            "milvus_sync_at": self.milvus_sync_at.isoformat() if self.milvus_sync_at else None,
            "previous_chunk_id": self.previous_chunk_id,
            "next_chunk_id": self.next_chunk_id
        }

    @property
    def is_ready_for_embedding(self) -> bool:
        return self.status == ChunkStatus.PENDING and bool(self.content.strip())

    @property
    def has_embedding(self) -> bool:
        return self.status == ChunkStatus.COMPLETED and self.embedding_generated_at is not None

    @property
    def needs_sync(self) -> bool:
        return self.has_embedding and not self.milvus_synced

    def start_embedding(self, model: str):
        self.status = ChunkStatus.EMBEDDING
        self.embedding_model = model
        self.embedding_error = None

    def complete_embedding(self, quality_score: Optional[float] = None):
        self.status = ChunkStatus.COMPLETED
        self.embedding_generated_at = datetime.datetime.utcnow()
        self.embedding_error = None
        if quality_score is not None:
            self.embedding_quality_score = quality_score

    def fail_embedding(self, error_message: str):
        self.status = ChunkStatus.FAILED
        self.embedding_error = error_message

    def mark_synced(self):
        self.milvus_synced = True
        self.milvus_sync_at = datetime.datetime.utcnow()

    def calculate_content_quality(self) -> float:
        # Simple content quality heuristic
        score = 0.0

        # Length score (0-40 points)
        if self.character_count > 50:
            score += min(40, self.character_count / 25)

        # Word count score (0-30 points)
        if self.word_count > 10:
            score += min(30, self.word_count / 2)

        # Content variety score (0-30 points)
        unique_chars = len(set(self.content.lower()))
        score += min(30, unique_chars)

        self.content_quality_score = min(100, score)
        return self.content_quality_score