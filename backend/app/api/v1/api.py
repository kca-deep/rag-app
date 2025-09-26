from fastapi import APIRouter

from app.api.v1.endpoints import collections

api_router = APIRouter()

# Include collection routes
api_router.include_router(
    collections.router,
    prefix="/collections",
    tags=["Collections"],
)

# Future endpoint includes will go here:
# api_router.include_router(documents.router, prefix="/documents", tags=["Documents"])
# api_router.include_router(chunks.router, prefix="/chunks", tags=["Chunks"])
# api_router.include_router(api_keys.router, prefix="/api-keys", tags=["API Keys"])
# api_router.include_router(rag.router, prefix="/rag", tags=["RAG Search"])
# api_router.include_router(system.router, prefix="/system", tags=["System"])