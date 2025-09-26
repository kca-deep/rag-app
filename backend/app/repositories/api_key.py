from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, asc
from datetime import datetime, timedelta
import uuid

from app.models.api_key import APIKey, APIKeyStatus, APIKeyRole
from app.schemas.api_key import APIKeyCreate, APIKeyUpdate
from app.core.security import generate_api_key, hash_api_key
from app.core.exceptions import RAGException


class APIKeyRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, api_key_data: APIKeyCreate, created_by: Optional[str] = None) -> tuple[APIKey, str]:
        # Generate API key
        api_key = generate_api_key()
        key_hash = hash_api_key(api_key)
        key_prefix = api_key[:8]

        # Create API key record
        api_key_record = APIKey(
            id=str(uuid.uuid4()),
            name=api_key_data.name,
            description=api_key_data.description,
            key_hash=key_hash,
            key_prefix=key_prefix,
            role=api_key_data.role,
            allowed_collections=api_key_data.allowed_collections,
            allowed_operations=api_key_data.allowed_operations,
            ip_whitelist=api_key_data.ip_whitelist,
            rate_limit_per_minute=api_key_data.rate_limit_per_minute,
            rate_limit_per_hour=api_key_data.rate_limit_per_hour,
            rate_limit_per_day=api_key_data.rate_limit_per_day,
            expires_at=api_key_data.expires_at,
            metadata=api_key_data.metadata,
            created_by=created_by,
            status=APIKeyStatus.ACTIVE
        )

        self.session.add(api_key_record)
        await self.session.commit()
        await self.session.refresh(api_key_record)

        return api_key_record, api_key

    async def get_by_id(self, api_key_id: str) -> Optional[APIKey]:
        stmt = select(APIKey).where(APIKey.id == api_key_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_hash(self, key_hash: str) -> Optional[APIKey]:
        stmt = select(APIKey).where(APIKey.key_hash == key_hash)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_key(self, api_key: str) -> Optional[APIKey]:
        key_hash = hash_api_key(api_key)
        return await self.get_by_hash(key_hash)

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 20,
        status: Optional[APIKeyStatus] = None,
        role: Optional[APIKeyRole] = None,
        search: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> tuple[List[APIKey], int]:

        # Build base query
        stmt = select(APIKey)

        # Apply filters
        filters = []

        if status:
            filters.append(APIKey.status == status)

        if role:
            filters.append(APIKey.role == role)

        if search:
            search_pattern = f"%{search}%"
            filters.append(
                or_(
                    APIKey.name.ilike(search_pattern),
                    APIKey.description.ilike(search_pattern),
                    APIKey.key_prefix.ilike(search_pattern)
                )
            )

        if filters:
            stmt = stmt.where(and_(*filters))

        # Count total results
        count_stmt = select(func.count()).select_from(stmt.alias())
        total_result = await self.session.execute(count_stmt)
        total = total_result.scalar()

        # Apply sorting
        sort_column = getattr(APIKey, sort_by, APIKey.created_at)
        if sort_order.lower() == "desc":
            stmt = stmt.order_by(desc(sort_column))
        else:
            stmt = stmt.order_by(asc(sort_column))

        # Apply pagination
        stmt = stmt.offset(skip).limit(limit)

        # Execute query
        result = await self.session.execute(stmt)
        api_keys = result.scalars().all()

        return list(api_keys), total

    async def update(self, api_key_id: str, api_key_data: APIKeyUpdate) -> Optional[APIKey]:
        api_key = await self.get_by_id(api_key_id)
        if not api_key:
            return None

        # Update fields
        update_data = api_key_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(api_key, field, value)

        api_key.updated_at = datetime.utcnow()

        await self.session.commit()
        await self.session.refresh(api_key)

        return api_key

    async def delete(self, api_key_id: str) -> bool:
        api_key = await self.get_by_id(api_key_id)
        if not api_key:
            return False

        await self.session.delete(api_key)
        await self.session.commit()

        return True

    async def revoke(self, api_key_id: str, reason: str = "Manual revocation") -> Optional[APIKey]:
        api_key = await self.get_by_id(api_key_id)
        if not api_key:
            return None

        api_key.revoke(reason)
        await self.session.commit()
        await self.session.refresh(api_key)

        return api_key

    async def regenerate(self, api_key_id: str) -> Optional[tuple[APIKey, str]]:
        api_key_record = await self.get_by_id(api_key_id)
        if not api_key_record:
            return None

        # Cannot regenerate revoked keys
        if api_key_record.status == APIKeyStatus.REVOKED:
            raise RAGException("Cannot regenerate revoked API key")

        # Generate new API key
        new_api_key = generate_api_key()
        new_key_hash = hash_api_key(new_api_key)
        new_key_prefix = new_api_key[:8]

        # Update record
        api_key_record.key_hash = new_key_hash
        api_key_record.key_prefix = new_key_prefix
        api_key_record.updated_at = datetime.utcnow()

        # Reset usage stats
        api_key_record.total_requests = 0
        api_key_record.total_tokens_used = 0

        await self.session.commit()
        await self.session.refresh(api_key_record)

        return api_key_record, new_api_key

    async def record_usage(self, api_key_id: str, tokens_used: int = 0) -> Optional[APIKey]:
        api_key = await self.get_by_id(api_key_id)
        if not api_key:
            return None

        api_key.record_usage(tokens_used)
        await self.session.commit()

        return api_key

    async def get_active_keys(self) -> List[APIKey]:
        stmt = select(APIKey).where(APIKey.status == APIKeyStatus.ACTIVE)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_expired_keys(self) -> List[APIKey]:
        now = datetime.utcnow()
        stmt = select(APIKey).where(
            and_(
                APIKey.expires_at < now,
                APIKey.status == APIKeyStatus.ACTIVE
            )
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_usage_stats(
        self,
        api_key_id: Optional[str] = None,
        days: int = 30
    ) -> Dict[str, Any]:

        base_filter = APIKey.created_at >= (datetime.utcnow() - timedelta(days=days))
        if api_key_id:
            base_filter = and_(base_filter, APIKey.id == api_key_id)

        total_keys = await self.session.scalar(
            select(func.count(APIKey.id)).where(base_filter)
        )

        active_keys = await self.session.scalar(
            select(func.count(APIKey.id)).where(
                and_(base_filter, APIKey.status == APIKeyStatus.ACTIVE)
            )
        )

        total_requests = await self.session.scalar(
            select(func.sum(APIKey.total_requests)).where(base_filter)
        )

        total_tokens = await self.session.scalar(
            select(func.sum(APIKey.total_tokens_used)).where(base_filter)
        )

        # Get most active keys
        most_active_stmt = select(APIKey).where(base_filter).order_by(
            desc(APIKey.total_requests)
        ).limit(10)

        most_active_result = await self.session.execute(most_active_stmt)
        most_active_keys = list(most_active_result.scalars().all())

        return {
            "period_days": days,
            "total_keys": total_keys or 0,
            "active_keys": active_keys or 0,
            "total_requests": total_requests or 0,
            "total_tokens_used": total_tokens or 0,
            "most_active_keys": [
                {
                    "id": key.id,
                    "name": key.name,
                    "requests": key.total_requests,
                    "tokens": key.total_tokens_used
                }
                for key in most_active_keys
            ]
        }

    async def cleanup_expired_keys(self) -> int:
        expired_keys = await self.get_expired_keys()
        count = 0

        for key in expired_keys:
            key.status = APIKeyStatus.EXPIRED
            count += 1

        if count > 0:
            await self.session.commit()

        return count

    async def get_keys_by_role(self, role: APIKeyRole) -> List[APIKey]:
        stmt = select(APIKey).where(APIKey.role == role)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def search_keys(self, query: str, limit: int = 10) -> List[APIKey]:
        search_pattern = f"%{query}%"
        stmt = select(APIKey).where(
            or_(
                APIKey.name.ilike(search_pattern),
                APIKey.description.ilike(search_pattern),
                APIKey.key_prefix.ilike(search_pattern)
            )
        ).limit(limit)

        result = await self.session.execute(stmt)
        return list(result.scalars().all())