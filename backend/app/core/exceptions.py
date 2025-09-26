from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class RAGException(Exception):
    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class CollectionNotFoundError(RAGException):
    def __init__(self, collection_id: str):
        super().__init__(
            message=f"Collection with id '{collection_id}' not found",
            status_code=status.HTTP_404_NOT_FOUND,
            details={"collection_id": collection_id}
        )


class CollectionAlreadyExistsError(RAGException):
    def __init__(self, collection_name: str):
        super().__init__(
            message=f"Collection with name '{collection_name}' already exists",
            status_code=status.HTTP_409_CONFLICT,
            details={"collection_name": collection_name}
        )


class DocumentNotFoundError(RAGException):
    def __init__(self, document_id: str):
        super().__init__(
            message=f"Document with id '{document_id}' not found",
            status_code=status.HTTP_404_NOT_FOUND,
            details={"document_id": document_id}
        )


class InvalidFileTypeError(RAGException):
    def __init__(self, file_type: str, allowed_types: list):
        super().__init__(
            message=f"File type '{file_type}' not supported. Allowed types: {', '.join(allowed_types)}",
            status_code=status.HTTP_400_BAD_REQUEST,
            details={"file_type": file_type, "allowed_types": allowed_types}
        )


class FileSizeExceededError(RAGException):
    def __init__(self, file_size: int, max_size: int):
        super().__init__(
            message=f"File size {file_size} bytes exceeds maximum allowed size of {max_size} bytes",
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            details={"file_size": file_size, "max_size": max_size}
        )


class DatabaseConnectionError(RAGException):
    def __init__(self, details: str = ""):
        super().__init__(
            message=f"Database connection failed: {details}",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            details={"error": details}
        )


class VectorDatabaseError(RAGException):
    def __init__(self, operation: str, details: str = ""):
        super().__init__(
            message=f"Vector database operation '{operation}' failed: {details}",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            details={"operation": operation, "error": details}
        )


class EmbeddingGenerationError(RAGException):
    def __init__(self, text_length: int = 0, details: str = ""):
        super().__init__(
            message=f"Failed to generate embedding for text (length: {text_length}): {details}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details={"text_length": text_length, "error": details}
        )


class RateLimitExceededError(RAGException):
    def __init__(self, limit_type: str, reset_time: Optional[int] = None):
        message = f"Rate limit exceeded for {limit_type}"
        if reset_time:
            message += f". Try again after {reset_time} seconds"

        super().__init__(
            message=message,
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            details={"limit_type": limit_type, "reset_time": reset_time}
        )


class UnauthorizedError(RAGException):
    def __init__(self, message: str = "Invalid or missing API key"):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            details={"auth_error": True}
        )


class ForbiddenError(RAGException):
    def __init__(self, resource: str, action: str):
        super().__init__(
            message=f"Access forbidden: insufficient permissions for {action} on {resource}",
            status_code=status.HTTP_403_FORBIDDEN,
            details={"resource": resource, "action": action}
        )


class ValidationError(RAGException):
    def __init__(self, field: str, message: str):
        super().__init__(
            message=f"Validation error for field '{field}': {message}",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details={"field": field, "validation_error": message}
        )