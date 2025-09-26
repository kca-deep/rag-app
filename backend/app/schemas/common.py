from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Generic, TypeVar
from datetime import datetime

T = TypeVar('T')


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int = Field(description="Total number of items")
    page: int = Field(description="Current page number (1-based)")
    size: int = Field(description="Page size")
    pages: int = Field(description="Total number of pages")
    has_next: bool = Field(description="Whether there is a next page")
    has_previous: bool = Field(description="Whether there is a previous page")


class ErrorResponse(BaseModel):
    error: str = Field(description="Error message")
    details: Optional[Dict[str, Any]] = Field(default=None, description="Additional error details")
    status_code: int = Field(description="HTTP status code")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class HealthResponse(BaseModel):
    status: str = Field(description="Overall health status")
    services: Dict[str, str] = Field(description="Individual service health status")
    version: str = Field(description="API version")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ServiceHealthDetail(BaseModel):
    name: str = Field(description="Service name")
    status: str = Field(description="Service status (healthy/unhealthy)")
    response_time_ms: Optional[float] = Field(description="Response time in milliseconds")
    last_check: datetime = Field(description="Last health check timestamp")
    error: Optional[str] = Field(description="Error message if unhealthy")
    metadata: Optional[Dict[str, Any]] = Field(description="Additional service metadata")


class DetailedHealthResponse(BaseModel):
    status: str = Field(description="Overall health status")
    services: List[ServiceHealthDetail] = Field(description="Detailed service health information")
    version: str = Field(description="API version")
    uptime_seconds: int = Field(description="System uptime in seconds")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# Generic response models
class MessageResponse(BaseModel):
    message: str = Field(description="Response message")
    success: bool = Field(default=True, description="Operation success status")
    data: Optional[Dict[str, Any]] = Field(default=None, description="Additional response data")


class OperationResponse(BaseModel):
    operation_id: str = Field(description="Unique operation identifier")
    status: str = Field(description="Operation status")
    message: str = Field(description="Operation message")
    started_at: datetime = Field(description="Operation start time")
    completed_at: Optional[datetime] = Field(description="Operation completion time")
    progress: Optional[int] = Field(description="Operation progress percentage (0-100)")
    result: Optional[Dict[str, Any]] = Field(description="Operation result data")


# Validation models
class ValidationError(BaseModel):
    field: str = Field(description="Field name with validation error")
    message: str = Field(description="Validation error message")
    code: str = Field(description="Error code")


class ValidationErrorResponse(BaseModel):
    error: str = Field(default="Validation failed")
    validation_errors: List[ValidationError] = Field(description="List of validation errors")
    status_code: int = Field(default=422)


# Search and filter models
class FilterCriteria(BaseModel):
    field: str = Field(description="Field to filter by")
    operator: str = Field(description="Filter operator (eq, ne, gt, lt, gte, lte, in, contains)")
    value: Any = Field(description="Filter value")


class SortCriteria(BaseModel):
    field: str = Field(description="Field to sort by")
    direction: str = Field(default="asc", description="Sort direction (asc/desc)")


class QueryParameters(BaseModel):
    page: int = Field(default=1, ge=1, description="Page number (1-based)")
    size: int = Field(default=20, ge=1, le=100, description="Page size")
    search: Optional[str] = Field(None, description="Search query")
    filters: Optional[List[FilterCriteria]] = Field(None, description="Filter criteria")
    sort: Optional[List[SortCriteria]] = Field(None, description="Sort criteria")


# Rate limiting response
class RateLimitInfo(BaseModel):
    limit: int = Field(description="Rate limit maximum")
    remaining: int = Field(description="Remaining requests")
    reset_time: int = Field(description="Reset time (Unix timestamp)")
    retry_after: Optional[int] = Field(description="Retry after seconds")


class RateLimitExceededResponse(BaseModel):
    error: str = Field(default="Rate limit exceeded")
    rate_limit: RateLimitInfo = Field(description="Rate limit information")
    status_code: int = Field(default=429)