from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

from app.models.collection import CollectionStatus


class CollectionCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Collection name (must be unique)")
    description: Optional[str] = Field(None, max_length=2000, description="Collection description")
    embedding_model: str = Field(default="text-embedding-3-small", description="Embedding model to use")
    chunk_size: int = Field(default=1000, ge=100, le=8000, description="Chunk size in characters")
    chunk_overlap: int = Field(default=200, ge=0, le=1000, description="Chunk overlap in characters")
    settings: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional settings")
    tags: Optional[List[str]] = Field(default_factory=list, description="Collection tags")

    @validator("name")
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError("Collection name cannot be empty")
        # Only allow alphanumeric, spaces, hyphens, underscores
        if not all(c.isalnum() or c in " -_" for c in v):
            raise ValueError("Collection name can only contain letters, numbers, spaces, hyphens, and underscores")
        return v.strip()

    @validator("chunk_overlap")
    def validate_chunk_overlap(cls, v, values):
        if "chunk_size" in values and v >= values["chunk_size"]:
            raise ValueError("Chunk overlap must be less than chunk size")
        return v

    @validator("tags")
    def validate_tags(cls, v):
        if v:
            # Remove duplicates and empty tags
            v = list(set(tag.strip() for tag in v if tag.strip()))
            if len(v) > 20:
                raise ValueError("Maximum 20 tags allowed")
            for tag in v:
                if len(tag) > 50:
                    raise ValueError("Tag length cannot exceed 50 characters")
        return v


class CollectionUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    chunk_size: Optional[int] = Field(None, ge=100, le=8000)
    chunk_overlap: Optional[int] = Field(None, ge=0, le=1000)
    settings: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None

    @validator("name")
    def validate_name(cls, v):
        if v is not None:
            if not v.strip():
                raise ValueError("Collection name cannot be empty")
            if not all(c.isalnum() or c in " -_" for c in v):
                raise ValueError("Collection name can only contain letters, numbers, spaces, hyphens, and underscores")
            return v.strip()
        return v

    @validator("tags")
    def validate_tags(cls, v):
        if v is not None:
            v = list(set(tag.strip() for tag in v if tag.strip()))
            if len(v) > 20:
                raise ValueError("Maximum 20 tags allowed")
            for tag in v:
                if len(tag) > 50:
                    raise ValueError("Tag length cannot exceed 50 characters")
        return v


class CollectionResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    status: CollectionStatus
    created_at: datetime
    updated_at: datetime
    embedding_model: str
    chunk_size: int
    chunk_overlap: int
    document_count: int
    chunk_count: int
    total_size_bytes: int
    milvus_collection_name: Optional[str]
    milvus_synced: bool
    last_sync_at: Optional[datetime]
    sync_error: Optional[str]
    settings: Dict[str, Any]
    tags: List[str]

    class Config:
        from_attributes = True


class CollectionStats(BaseModel):
    id: str
    name: str
    document_count: int
    chunk_count: int
    total_size_bytes: int
    average_document_size: float = Field(description="Average document size in bytes")
    average_chunk_count_per_document: float = Field(description="Average chunks per document")
    status: CollectionStatus
    milvus_synced: bool
    last_activity: Optional[datetime] = Field(description="Last document upload or modification")

    class Config:
        from_attributes = True


class CollectionHealthCheck(BaseModel):
    collection_id: str
    collection_name: str
    database_status: str = Field(description="SQLite database status")
    milvus_status: str = Field(description="Milvus vector database status")
    sync_status: str = Field(description="Synchronization status between databases")
    last_check: datetime
    issues: List[str] = Field(default_factory=list, description="List of detected issues")

    class Config:
        from_attributes = True


class CollectionListResponse(BaseModel):
    collections: List[CollectionResponse]
    total: int
    page: int
    size: int
    has_next: bool
    has_previous: bool

    class Config:
        from_attributes = True


# Request models for specific operations
class CollectionSyncRequest(BaseModel):
    force: bool = Field(default=False, description="Force resync even if already synced")


class CollectionBulkDeleteRequest(BaseModel):
    collection_ids: List[str] = Field(..., min_items=1, max_items=100)
    confirm: bool = Field(..., description="Confirmation flag for bulk delete")

    @validator("confirm")
    def validate_confirm(cls, v):
        if not v:
            raise ValueError("Bulk delete requires explicit confirmation")
        return v