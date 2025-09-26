from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
import secrets
import hashlib
import structlog

from app.core.config import settings
from app.core.exceptions import UnauthorizedError

logger = structlog.get_logger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError as e:
        logger.error(f"JWT verification failed: {e}")
        raise UnauthorizedError("Invalid token")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def generate_api_key() -> str:
    return secrets.token_urlsafe(32)


def hash_api_key(api_key: str) -> str:
    return hashlib.sha256(api_key.encode()).hexdigest()


def verify_api_key_hash(api_key: str, hashed_key: str) -> bool:
    return hash_api_key(api_key) == hashed_key


def generate_secure_filename(original_filename: str) -> str:
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    random_suffix = secrets.token_hex(8)

    # Extract file extension
    if "." in original_filename:
        name, ext = original_filename.rsplit(".", 1)
        return f"{timestamp}_{random_suffix}.{ext}"
    else:
        return f"{timestamp}_{random_suffix}"


def create_text_hash(text: str) -> str:
    return hashlib.md5(text.encode('utf-8')).hexdigest()


class APIKeyValidator:
    @staticmethod
    def validate_key_format(api_key: str) -> bool:
        if not api_key:
            return False

        if not isinstance(api_key, str):
            return False

        if len(api_key) < 32:
            return False

        return True

    @staticmethod
    def extract_bearer_token(authorization: str) -> str:
        if not authorization:
            raise UnauthorizedError("Authorization header missing")

        parts = authorization.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise UnauthorizedError("Invalid authorization header format")

        return parts[1]