from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime

from app.models.api_key import APIKeyStatus, APIKeyRole


class APIKeyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="API key name")
    description: Optional[str] = Field(None, max_length=2000, description="API key description")
    role: APIKeyRole = Field(default=APIKeyRole.USER, description="API key role")
    allowed_collections: Optional[List[str]] = Field(None, description="Allowed collection IDs (None = all)")
    allowed_operations: Optional[List[str]] = Field(None, description="Allowed operations (None = all)")
    ip_whitelist: Optional[List[str]] = Field(None, description="Allowed IP addresses (None = all)")
    rate_limit_per_minute: Optional[int] = Field(None, ge=1, description="Requests per minute limit")
    rate_limit_per_hour: Optional[int] = Field(None, ge=1, description="Requests per hour limit")
    rate_limit_per_day: Optional[int] = Field(None, ge=1, description="Requests per day limit")
    expires_at: Optional[datetime] = Field(None, description="Expiration timestamp")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata")

    @validator("name")
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError("API key name cannot be empty")
        return v.strip()


class APIKeyUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    status: Optional[APIKeyStatus] = None
    allowed_collections: Optional[List[str]] = None
    allowed_operations: Optional[List[str]] = None
    ip_whitelist: Optional[List[str]] = None
    rate_limit_per_minute: Optional[int] = Field(None, ge=1)
    rate_limit_per_hour: Optional[int] = Field(None, ge=1)
    rate_limit_per_day: Optional[int] = Field(None, ge=1)
    expires_at: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None

    @validator("name")
    def validate_name(cls, v):
        if v is not None and not v.strip():
            raise ValueError("API key name cannot be empty")
        return v.strip() if v else v


class APIKeyResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    key_prefix: str
    status: APIKeyStatus
    role: APIKeyRole
    allowed_collections: Optional[List[str]]
    allowed_operations: Optional[List[str]]
    ip_whitelist: Optional[List[str]]
    rate_limit_per_minute: Optional[int]
    rate_limit_per_hour: Optional[int]
    rate_limit_per_day: Optional[int]
    total_requests: int
    total_tokens_used: int
    last_used_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    expires_at: Optional[datetime]
    revoked_at: Optional[datetime]
    revoked_reason: Optional[str]
    created_by: Optional[str]
    metadata: Dict[str, Any]

    class Config:
        from_attributes = True


class APIKeyCreateResponse(BaseModel):
    api_key: APIKeyResponse
    key: str = Field(description="The actual API key (only shown once)")

    class Config:
        from_attributes = True


class APIKeyListResponse(BaseModel):
    api_keys: List[APIKeyResponse]
    total: int
    page: int
    size: int
    has_next: bool
    has_previous: bool

    class Config:
        from_attributes = True