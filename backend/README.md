# RAG Pipeline Backend API

FastAPI-based backend for the enterprise-grade RAG pipeline with collection-based document separation.

## Features

- **Collection Management**: Organize documents into separate collections
- **Database Integration**: SQLite for metadata + Milvus for vector storage + Redis for caching
- **Async Architecture**: High-performance asynchronous processing
- **API Documentation**: Auto-generated OpenAPI/Swagger documentation
- **Health Monitoring**: Comprehensive health checks for all services

## Setup

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Services** (Development):
   ```bash
   # Start Redis
   redis-server

   # Start Milvus (using Docker)
   # Follow Milvus installation guide

   # Start the API
   python run.py
   ```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/api/v1/docs
- ReDoc: http://localhost:8000/api/v1/redoc

## Architecture

```
backend/
├── app/
│   ├── core/           # Core configuration and services
│   ├── models/         # SQLAlchemy models
│   ├── schemas/        # Pydantic schemas
│   ├── repositories/   # Data access layer
│   ├── api/            # API endpoints
│   └── main.py         # FastAPI application
├── requirements.txt
└── run.py
```

## Current Implementation Status

✅ **Phase 1-3 Complete**:
- Project structure and configuration
- Database connection layer (SQLite, Redis, Milvus)
- Collection management API

### Collections API

- `GET /api/v1/collections` - List collections with filtering
- `POST /api/v1/collections` - Create new collection
- `GET /api/v1/collections/{id}` - Get collection details
- `PUT /api/v1/collections/{id}` - Update collection
- `DELETE /api/v1/collections/{id}` - Delete collection
- `GET /api/v1/collections/{id}/stats` - Collection statistics
- `GET /api/v1/collections/{id}/health` - Health check
- `POST /api/v1/collections/{id}/sync` - Manual sync with Milvus

## Next Steps

- Phase 4: Document management API
- Phase 5: RAG search API
- Phase 6: API key management system

## Health Check

Visit `GET /health` to check system status.