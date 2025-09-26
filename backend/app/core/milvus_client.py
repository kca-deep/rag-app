from typing import List, Dict, Any, Optional
import structlog
from pymilvus import (
    connections,
    FieldSchema,
    CollectionSchema,
    DataType,
    Collection,
    utility
)
from app.core.config import settings

logger = structlog.get_logger(__name__)


class MilvusManager:
    def __init__(self):
        self._initialized = False
        self.collections = {}

    async def initialize(self):
        if self._initialized:
            return

        try:
            connections.connect(
                alias="default",
                host=settings.MILVUS_HOST,
                port=settings.MILVUS_PORT,
                user=settings.MILVUS_USER,
                password=settings.MILVUS_PASSWORD,
                db_name=settings.MILVUS_DB_NAME,
            )

            self._initialized = True
            logger.info("Milvus initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize Milvus: {e}")
            raise

    async def close(self):
        try:
            connections.disconnect("default")
            logger.info("Milvus connection closed")
        except Exception as e:
            logger.error(f"Error closing Milvus connection: {e}")

    def create_collection_schema(self) -> CollectionSchema:
        fields = [
            FieldSchema(
                name="chunk_id",
                dtype=DataType.VARCHAR,
                max_length=255,
                is_primary=True,
                description="Unique identifier for the chunk"
            ),
            FieldSchema(
                name="document_id",
                dtype=DataType.VARCHAR,
                max_length=255,
                description="Document identifier"
            ),
            FieldSchema(
                name="collection_id",
                dtype=DataType.VARCHAR,
                max_length=255,
                description="Collection identifier"
            ),
            FieldSchema(
                name="content",
                dtype=DataType.VARCHAR,
                max_length=65535,
                description="Text content of the chunk"
            ),
            FieldSchema(
                name="metadata",
                dtype=DataType.JSON,
                description="Additional metadata"
            ),
            FieldSchema(
                name="embedding",
                dtype=DataType.FLOAT_VECTOR,
                dim=settings.OPENAI_EMBEDDING_DIMENSIONS,
                description="Text embedding vector"
            )
        ]

        schema = CollectionSchema(
            fields=fields,
            description="RAG pipeline document chunks with embeddings",
            enable_dynamic_field=True
        )

        return schema

    async def create_collection(self, collection_name: str) -> bool:
        try:
            if not self._initialized:
                await self.initialize()

            if utility.has_collection(collection_name):
                logger.info(f"Collection {collection_name} already exists")
                return True

            schema = self.create_collection_schema()
            collection = Collection(
                name=collection_name,
                schema=schema,
                using='default'
            )

            # Create index for vector search
            index_params = {
                "metric_type": "COSINE",
                "index_type": "IVF_FLAT",
                "params": {"nlist": 1024}
            }

            collection.create_index("embedding", index_params)
            self.collections[collection_name] = collection

            logger.info(f"Collection {collection_name} created successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to create collection {collection_name}: {e}")
            return False

    async def delete_collection(self, collection_name: str) -> bool:
        try:
            if not self._initialized:
                await self.initialize()

            if utility.has_collection(collection_name):
                utility.drop_collection(collection_name)
                if collection_name in self.collections:
                    del self.collections[collection_name]
                logger.info(f"Collection {collection_name} deleted successfully")
                return True

            return True

        except Exception as e:
            logger.error(f"Failed to delete collection {collection_name}: {e}")
            return False

    def get_collection(self, collection_name: str) -> Optional[Collection]:
        try:
            if collection_name not in self.collections:
                if utility.has_collection(collection_name):
                    self.collections[collection_name] = Collection(collection_name)
                else:
                    return None

            return self.collections[collection_name]

        except Exception as e:
            logger.error(f"Failed to get collection {collection_name}: {e}")
            return None

    async def insert_vectors(self, collection_name: str, data: List[Dict[str, Any]]) -> bool:
        try:
            collection = self.get_collection(collection_name)
            if not collection:
                logger.error(f"Collection {collection_name} not found")
                return False

            collection.insert(data)
            collection.flush()
            logger.info(f"Inserted {len(data)} vectors into {collection_name}")
            return True

        except Exception as e:
            logger.error(f"Failed to insert vectors into {collection_name}: {e}")
            return False

    async def search_vectors(
        self,
        collection_name: str,
        query_vectors: List[List[float]],
        top_k: int = 10,
        filters: Optional[str] = None
    ) -> List[List[Dict[str, Any]]]:
        try:
            collection = self.get_collection(collection_name)
            if not collection:
                logger.error(f"Collection {collection_name} not found")
                return []

            collection.load()

            search_params = {"metric_type": "COSINE", "params": {"nprobe": 10}}

            results = collection.search(
                data=query_vectors,
                anns_field="embedding",
                param=search_params,
                limit=top_k,
                expr=filters,
                output_fields=["chunk_id", "document_id", "collection_id", "content", "metadata"]
            )

            formatted_results = []
            for result in results:
                hits = []
                for hit in result:
                    hits.append({
                        "chunk_id": hit.entity.get("chunk_id"),
                        "document_id": hit.entity.get("document_id"),
                        "collection_id": hit.entity.get("collection_id"),
                        "content": hit.entity.get("content"),
                        "metadata": hit.entity.get("metadata"),
                        "score": hit.score
                    })
                formatted_results.append(hits)

            return formatted_results

        except Exception as e:
            logger.error(f"Failed to search vectors in {collection_name}: {e}")
            return []

    async def delete_vectors(self, collection_name: str, chunk_ids: List[str]) -> bool:
        try:
            collection = self.get_collection(collection_name)
            if not collection:
                logger.error(f"Collection {collection_name} not found")
                return False

            ids_expr = f"chunk_id in {chunk_ids}"
            collection.delete(ids_expr)
            collection.flush()

            logger.info(f"Deleted {len(chunk_ids)} vectors from {collection_name}")
            return True

        except Exception as e:
            logger.error(f"Failed to delete vectors from {collection_name}: {e}")
            return False

    async def get_collection_stats(self, collection_name: str) -> Optional[Dict[str, Any]]:
        try:
            collection = self.get_collection(collection_name)
            if not collection:
                return None

            stats = utility.get_query_segment_info(collection_name)
            return {
                "name": collection_name,
                "num_entities": collection.num_entities,
                "segments": len(stats)
            }

        except Exception as e:
            logger.error(f"Failed to get stats for {collection_name}: {e}")
            return None

    async def health_check(self) -> bool:
        try:
            if not self._initialized:
                await self.initialize()

            # Test connection by listing collections
            utility.list_collections()
            return True

        except Exception as e:
            logger.error(f"Milvus health check failed: {e}")
            return False


# Global Milvus manager instance
milvus_manager = MilvusManager()