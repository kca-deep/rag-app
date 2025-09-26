from sqlalchemy import Column, String, DateTime, Text, Integer, JSON, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
import datetime
from typing import Optional, Dict, Any, List
from enum import Enum

from app.core.database import Base


class APIKeyStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    EXPIRED = "expired"
    REVOKED = "revoked"


class APIKeyRole(str, Enum):
    ADMIN = "admin"
    USER = "user"
    READONLY = "readonly"


class APIKey(Base):
    __tablename__ = "api_keys"

    id: Mapped[str] = mapped_column(String(255), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Key information
    key_hash: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)  # SHA-256 hash
    key_prefix: Mapped[str] = mapped_column(String(10), nullable=False)  # First 8 chars for identification

    # Status and role
    status: Mapped[APIKeyStatus] = mapped_column(
        String(20),
        nullable=False,
        default=APIKeyStatus.ACTIVE,
        index=True
    )
    role: Mapped[APIKeyRole] = mapped_column(
        String(20),
        nullable=False,
        default=APIKeyRole.USER,
        index=True
    )

    # Permissions and restrictions
    allowed_collections: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)  # None = all collections
    allowed_operations: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)  # None = all operations
    ip_whitelist: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)  # None = all IPs

    # Rate limiting
    rate_limit_per_minute: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    rate_limit_per_hour: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    rate_limit_per_day: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Usage tracking
    total_requests: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_tokens_used: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_used_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)

    # Lifecycle
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now()
    )
    expires_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)
    revoked_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)
    revoked_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Creator information
    created_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Additional metadata
    key_metadata: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True, default=dict)

    def __repr__(self):
        return f"<APIKey(id='{self.id}', name='{self.name}', status='{self.status}', role='{self.role}')>"

    def to_dict(self, include_sensitive: bool = False) -> Dict[str, Any]:
        data = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "key_prefix": self.key_prefix,
            "status": self.status.value,
            "role": self.role.value,
            "allowed_collections": self.allowed_collections,
            "allowed_operations": self.allowed_operations,
            "ip_whitelist": self.ip_whitelist,
            "rate_limit_per_minute": self.rate_limit_per_minute,
            "rate_limit_per_hour": self.rate_limit_per_hour,
            "rate_limit_per_day": self.rate_limit_per_day,
            "total_requests": self.total_requests,
            "total_tokens_used": self.total_tokens_used,
            "last_used_at": self.last_used_at.isoformat() if self.last_used_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "revoked_at": self.revoked_at.isoformat() if self.revoked_at else None,
            "revoked_reason": self.revoked_reason,
            "created_by": self.created_by,
            "metadata": self.key_metadata or {}
        }

        if include_sensitive:
            data["key_hash"] = self.key_hash

        return data

    @property
    def is_active(self) -> bool:
        if self.status != APIKeyStatus.ACTIVE:
            return False

        if self.expires_at and self.expires_at < datetime.datetime.utcnow():
            return False

        return True

    @property
    def is_expired(self) -> bool:
        return self.expires_at and self.expires_at < datetime.datetime.utcnow()

    @property
    def days_until_expiry(self) -> Optional[int]:
        if not self.expires_at:
            return None

        delta = self.expires_at - datetime.datetime.utcnow()
        return max(0, delta.days)

    def has_permission(self, operation: str) -> bool:
        # Admin role has all permissions
        if self.role == APIKeyRole.ADMIN:
            return True

        # Readonly role restrictions
        if self.role == APIKeyRole.READONLY:
            readonly_ops = ["read", "search", "get", "list"]
            return any(op in operation.lower() for op in readonly_ops)

        # Check explicit operation permissions
        if self.allowed_operations:
            return operation in self.allowed_operations

        return True

    def can_access_collection(self, collection_id: str) -> bool:
        # Admin role can access all collections
        if self.role == APIKeyRole.ADMIN:
            return True

        # Check explicit collection permissions
        if self.allowed_collections:
            return collection_id in self.allowed_collections

        return True

    def is_ip_allowed(self, ip_address: str) -> bool:
        if not self.ip_whitelist:
            return True

        return ip_address in self.ip_whitelist

    def record_usage(self, tokens_used: int = 0):
        self.total_requests += 1
        self.total_tokens_used += tokens_used
        self.last_used_at = datetime.datetime.utcnow()

    def revoke(self, reason: str = "Manual revocation"):
        self.status = APIKeyStatus.REVOKED
        self.revoked_at = datetime.datetime.utcnow()
        self.revoked_reason = reason

    def activate(self):
        if self.status == APIKeyStatus.REVOKED:
            return False  # Cannot reactivate revoked keys

        self.status = APIKeyStatus.ACTIVE
        return True

    def deactivate(self):
        if self.status == APIKeyStatus.REVOKED:
            return False

        self.status = APIKeyStatus.INACTIVE
        return True