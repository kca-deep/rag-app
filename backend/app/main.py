from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import structlog
import time

from app.core.config import settings
from app.core.database import database_manager
from app.core.redis_client import redis_manager
from app.core.milvus_client import milvus_manager
from app.core.exceptions import RAGException
from app.api.v1.api import api_router

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Enterprise-grade RAG Pipeline API with collection-based document separation",
    openapi_url=f"{settings.API_V1_STR}/openapi.json" if settings.DEBUG else None,
    docs_url=f"{settings.API_V1_STR}/docs" if settings.DEBUG else None,
    redoc_url=f"{settings.API_V1_STR}/redoc" if settings.DEBUG else None,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Trusted host middleware for security
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"] if settings.DEBUG else ["localhost", "127.0.0.1"]
)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()

    # Log request
    logger.info(
        "Request started",
        method=request.method,
        url=str(request.url),
        client_ip=request.client.host,
    )

    # Process request
    response = await call_next(request)

    # Calculate duration
    duration = time.time() - start_time

    # Log response
    logger.info(
        "Request completed",
        method=request.method,
        url=str(request.url),
        status_code=response.status_code,
        duration=f"{duration:.3f}s"
    )

    return response


# Exception handlers
@app.exception_handler(RAGException)
async def rag_exception_handler(request: Request, exc: RAGException):
    logger.error(
        "RAG exception occurred",
        error=exc.message,
        status_code=exc.status_code,
        details=exc.details,
        url=str(request.url)
    )

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.message,
            "details": exc.details,
            "status_code": exc.status_code
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(
        "Validation error",
        errors=exc.errors(),
        url=str(request.url)
    )

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation failed",
            "details": exc.errors()
        }
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    logger.error(
        "HTTP exception",
        status_code=exc.status_code,
        detail=exc.detail,
        url=str(request.url)
    )

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(
        "Unexpected error",
        error=str(exc),
        error_type=type(exc).__name__,
        url=str(request.url),
        exc_info=True
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred"
        }
    )


# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("Starting RAG Pipeline API...")

    try:
        # Initialize database (required)
        await database_manager.initialize()
        logger.info("Database initialized successfully")

        # Initialize Redis (optional)
        try:
            await redis_manager.initialize()
            logger.info("Redis initialized successfully")
        except Exception as e:
            logger.warning(f"Redis initialization failed (will continue without Redis): {e}")

        # Initialize Milvus (optional)
        try:
            await milvus_manager.initialize()
            logger.info("Milvus initialized successfully")
        except Exception as e:
            logger.warning(f"Milvus initialization failed (will continue without Milvus): {e}")

        logger.info("Service initialization completed")

    except Exception as e:
        logger.error(f"Failed to initialize required services: {e}")
        raise


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down RAG Pipeline API...")

    try:
        # Close database connections
        await database_manager.close()

        # Close Redis connection (if initialized)
        try:
            await redis_manager.close()
        except Exception as e:
            logger.warning(f"Error closing Redis connection: {e}")

        # Close Milvus connection (if initialized)
        try:
            await milvus_manager.close()
        except Exception as e:
            logger.warning(f"Error closing Milvus connection: {e}")

        logger.info("Service shutdown completed")

    except Exception as e:
        logger.error(f"Error during shutdown: {e}")


# Health check endpoint
@app.get("/health")
async def health_check():
    try:
        # Check database (required)
        db_healthy = await database_manager.health_check()

        # Check Redis (optional)
        try:
            redis_healthy = await redis_manager.health_check()
            redis_status = "healthy" if redis_healthy else "unhealthy"
        except Exception:
            redis_status = "unavailable"
            redis_healthy = None

        # Check Milvus (optional)
        try:
            milvus_healthy = await milvus_manager.health_check()
            milvus_status = "healthy" if milvus_healthy else "unhealthy"
        except Exception:
            milvus_status = "unavailable"
            milvus_healthy = None

        # Overall status is healthy if database is healthy (Redis/Milvus are optional)
        overall_status = "healthy" if db_healthy else "unhealthy"

        return {
            "status": overall_status,
            "services": {
                "database": "healthy" if db_healthy else "unhealthy",
                "redis": redis_status,
                "milvus": milvus_status
            },
            "version": settings.APP_VERSION
        }

    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "error": str(e)
            }
        )


# Include API routes
app.include_router(api_router, prefix=settings.API_V1_STR)


# Root endpoint
@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "api_docs": f"{settings.API_V1_STR}/docs" if settings.DEBUG else None
    }