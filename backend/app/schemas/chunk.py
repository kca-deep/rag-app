from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

from app.models.chunk import ChunkStatus


class ChunkResponse(BaseModel):
    id: str
    document_id: str
    collection_id: str
    content: str
    content_hash: str
    chunk_index: int
    start_char: int
    end_char: int
    character_count: int
    word_count: int
    token_count: Optional[int]
    status: ChunkStatus
    embedding_model: Optional[str]
    embedding_generated_at: Optional[datetime]
    embedding_error: Optional[str]
    content_quality_score: Optional[float]
    embedding_quality_score: Optional[float]
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any]
    milvus_synced: bool
    milvus_sync_at: Optional[datetime]
    previous_chunk_id: Optional[str]
    next_chunk_id: Optional[str]

    class Config:
        from_attributes = True


class ChunkListResponse(BaseModel):
    chunks: List[ChunkResponse]
    total: int
    page: int
    size: int
    has_next: bool
    has_previous: bool

    class Config:
        from_attributes = True