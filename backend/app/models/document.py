from sqlalchemy import Column, String, DateTime, Text, Integer, JSON, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
import datetime
from typing import Optional, Dict, Any, List
from enum import Enum

from app.core.database import Base


class DocumentStatus(str, Enum):
    UPLOADING = "uploading"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    DELETED = "deleted"


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(255), primary_key=True)
    collection_id: Mapped[str] = mapped_column(String(255), ForeignKey("collections.id"), nullable=False, index=True)

    # File information
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False)
    file_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)  # SHA-256 hash

    # Processing information
    status: Mapped[DocumentStatus] = mapped_column(
        String(20),
        nullable=False,
        default=DocumentStatus.UPLOADING,
        index=True
    )
    processing_started_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)
    processing_completed_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)
    processing_error: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Content statistics
    chunk_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    character_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    word_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Metadata
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now()
    )

    # Document metadata extracted during processing
    doc_metadata: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True, default=dict)

    # Processing configuration
    processing_config: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True, default=dict)

    # Soft delete
    is_deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    deleted_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    # collection = relationship("Collection", back_populates="documents")
    # chunks = relationship("Chunk", back_populates="document", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Document(id='{self.id}', filename='{self.filename}', status='{self.status}')>"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "collection_id": self.collection_id,
            "filename": self.filename,
            "original_filename": self.original_filename,
            "file_size": self.file_size,
            "file_type": self.file_type,
            "file_hash": self.file_hash,
            "status": self.status.value,
            "processing_started_at": self.processing_started_at.isoformat() if self.processing_started_at else None,
            "processing_completed_at": self.processing_completed_at.isoformat() if self.processing_completed_at else None,
            "processing_error": self.processing_error,
            "chunk_count": self.chunk_count,
            "character_count": self.character_count,
            "word_count": self.word_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "metadata": self.doc_metadata or {},
            "processing_config": self.processing_config or {},
            "is_deleted": self.is_deleted,
            "deleted_at": self.deleted_at.isoformat() if self.deleted_at else None
        }

    @property
    def is_processing(self) -> bool:
        return self.status in [DocumentStatus.UPLOADING, DocumentStatus.PROCESSING]

    @property
    def is_completed(self) -> bool:
        return self.status == DocumentStatus.COMPLETED

    @property
    def is_failed(self) -> bool:
        return self.status == DocumentStatus.FAILED

    @property
    def processing_duration(self) -> Optional[datetime.timedelta]:
        if self.processing_started_at and self.processing_completed_at:
            return self.processing_completed_at - self.processing_started_at
        return None

    def start_processing(self):
        self.status = DocumentStatus.PROCESSING
        self.processing_started_at = datetime.datetime.utcnow()
        self.processing_error = None

    def complete_processing(self, chunk_count: int, character_count: int, word_count: int, metadata: Dict[str, Any] = None):
        self.status = DocumentStatus.COMPLETED
        self.processing_completed_at = datetime.datetime.utcnow()
        self.chunk_count = chunk_count
        self.character_count = character_count
        self.word_count = word_count
        if metadata:
            self.doc_metadata = metadata
        self.processing_error = None

    def fail_processing(self, error_message: str):
        self.status = DocumentStatus.FAILED
        self.processing_completed_at = datetime.datetime.utcnow()
        self.processing_error = error_message

    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = datetime.datetime.utcnow()
        self.status = DocumentStatus.DELETED