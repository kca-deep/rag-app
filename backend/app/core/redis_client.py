import json
from typing import Any, Optional, Union
import redis.asyncio as redis
import structlog
from app.core.config import settings

logger = structlog.get_logger(__name__)


class RedisManager:
    def __init__(self):
        self.client = None
        self._initialized = False

    async def initialize(self):
        if self._initialized:
            return

        try:
            self.client = redis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                max_connections=settings.REDIS_MAX_CONNECTIONS,
                retry_on_timeout=True,
                socket_keepalive=True,
                socket_keepalive_options={},
            )

            # Test connection
            await self.client.ping()
            self._initialized = True
            logger.info("Redis initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize Redis: {e}")
            raise

    async def close(self):
        if self.client:
            await self.client.close()
            logger.info("Redis connection closed")

    async def set(self, key: str, value: Any, expire: Optional[int] = None) -> bool:
        try:
            if not self._initialized:
                await self.initialize()

            if isinstance(value, (dict, list)):
                value = json.dumps(value)

            result = await self.client.set(key, value)
            if expire:
                await self.client.expire(key, expire)
            return result
        except Exception as e:
            logger.error(f"Redis set error: {e}")
            return False

    async def get(self, key: str) -> Optional[Any]:
        try:
            if not self._initialized:
                await self.initialize()

            value = await self.client.get(key)
            if value is None:
                return None

            # Try to parse as JSON, fallback to string
            try:
                return json.loads(value)
            except (json.JSONDecodeError, TypeError):
                return value
        except Exception as e:
            logger.error(f"Redis get error: {e}")
            return None

    async def delete(self, key: str) -> bool:
        try:
            if not self._initialized:
                await self.initialize()

            result = await self.client.delete(key)
            return bool(result)
        except Exception as e:
            logger.error(f"Redis delete error: {e}")
            return False

    async def exists(self, key: str) -> bool:
        try:
            if not self._initialized:
                await self.initialize()

            result = await self.client.exists(key)
            return bool(result)
        except Exception as e:
            logger.error(f"Redis exists error: {e}")
            return False

    async def increment(self, key: str, amount: int = 1) -> Optional[int]:
        try:
            if not self._initialized:
                await self.initialize()

            result = await self.client.incr(key, amount)
            return result
        except Exception as e:
            logger.error(f"Redis increment error: {e}")
            return None

    async def health_check(self) -> bool:
        try:
            if not self._initialized:
                await self.initialize()

            await self.client.ping()
            return True
        except Exception as e:
            logger.error(f"Redis health check failed: {e}")
            return False

    async def cache_embedding(self, text_hash: str, embedding: list, expire: int = 3600):
        cache_key = f"embedding:{text_hash}"
        return await self.set(cache_key, embedding, expire)

    async def get_cached_embedding(self, text_hash: str) -> Optional[list]:
        cache_key = f"embedding:{text_hash}"
        return await self.get(cache_key)


# Global Redis manager instance
redis_manager = RedisManager()