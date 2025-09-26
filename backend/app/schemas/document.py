from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

from app.models.document import DocumentStatus


class DocumentResponse(BaseModel):
    id: str
    collection_id: str
    filename: str
    original_filename: str
    file_size: int
    file_type: str
    file_hash: str
    status: DocumentStatus
    processing_started_at: Optional[datetime]
    processing_completed_at: Optional[datetime]
    processing_error: Optional[str]
    chunk_count: int
    character_count: int
    word_count: int
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any]
    processing_config: Dict[str, Any]
    is_deleted: bool
    deleted_at: Optional[datetime]

    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]
    total: int
    page: int
    size: int
    has_next: bool
    has_previous: bool

    class Config:
        from_attributes = True


class DocumentStats(BaseModel):
    id: str
    filename: str
    file_size: int
    status: DocumentStatus
    chunk_count: int
    character_count: int
    word_count: int
    processing_duration_seconds: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True