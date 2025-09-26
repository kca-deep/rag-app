from sqlalchemy import Column, String, DateTime, Text, Boolean, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
import datetime
from typing import Optional, List, Dict, Any
from enum import Enum

from app.core.database import Base


class CollectionStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SYNCING = "syncing"
    ERROR = "error"


class Collection(Base):
    __tablename__ = "collections"

    id: Mapped[str] = mapped_column(String(255), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[CollectionStatus] = mapped_column(
        String(20),
        nullable=False,
        default=CollectionStatus.ACTIVE,
        index=True
    )

    # Metadata
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now()
    )

    # Configuration
    embedding_model: Mapped[str] = mapped_column(String(100), nullable=False, default="text-embedding-3-small")
    chunk_size: Mapped[int] = mapped_column(Integer, nullable=False, default=1000)
    chunk_overlap: Mapped[int] = mapped_column(Integer, nullable=False, default=200)

    # Statistics
    document_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    chunk_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Milvus integration
    milvus_collection_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, unique=True)
    milvus_synced: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    last_sync_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)
    sync_error: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Additional settings
    settings: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True, default=dict)
    tags: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True, default=list)

    # Relationships will be added when Document model is created
    # documents = relationship("Document", back_populates="collection", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Collection(id='{self.id}', name='{self.name}', status='{self.status}')>"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "status": self.status.value,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "embedding_model": self.embedding_model,
            "chunk_size": self.chunk_size,
            "chunk_overlap": self.chunk_overlap,
            "document_count": self.document_count,
            "chunk_count": self.chunk_count,
            "total_size_bytes": self.total_size_bytes,
            "milvus_collection_name": self.milvus_collection_name,
            "milvus_synced": self.milvus_synced,
            "last_sync_at": self.last_sync_at.isoformat() if self.last_sync_at else None,
            "sync_error": self.sync_error,
            "settings": self.settings or {},
            "tags": self.tags or []
        }

    @property
    def is_active(self) -> bool:
        return self.status == CollectionStatus.ACTIVE

    @property
    def needs_sync(self) -> bool:
        return not self.milvus_synced or self.status == CollectionStatus.SYNCING

    def update_stats(self, document_count: int = None, chunk_count: int = None, total_size: int = None):
        if document_count is not None:
            self.document_count = document_count
        if chunk_count is not None:
            self.chunk_count = chunk_count
        if total_size is not None:
            self.total_size_bytes = total_size
        self.updated_at = datetime.datetime.utcnow()

    def mark_sync_success(self):
        self.milvus_synced = True
        self.status = CollectionStatus.ACTIVE
        self.last_sync_at = datetime.datetime.utcnow()
        self.sync_error = None

    def mark_sync_error(self, error_message: str):
        self.milvus_synced = False
        self.status = CollectionStatus.ERROR
        self.sync_error = error_message
        self.last_sync_at = datetime.datetime.utcnow()