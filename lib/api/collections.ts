import { apiClient, withRetry } from '../api-client'
import type {
  Collection,
  CollectionCreate,
  CollectionUpdate,
  CollectionListResponse,
  CollectionStats,
  CollectionHealthCheck,
  CollectionSyncRequest,
  OperationResponse,
  MessageResponse,
  CollectionFilters,
} from '../types'

export class CollectionsAPI {
  // Get all collections with filtering and pagination
  async getAll(filters: CollectionFilters = {}): Promise<CollectionListResponse> {
    return withRetry(() =>
      apiClient.get<CollectionListResponse>('/collections', filters)
    )
  }

  // Get a specific collection by ID
  async getById(id: string): Promise<Collection> {
    return withRetry(() =>
      apiClient.get<Collection>(`/collections/${id}`)
    )
  }

  // Create a new collection
  async create(data: CollectionCreate): Promise<Collection> {
    return apiClient.post<Collection>('/collections', data)
  }

  // Update an existing collection
  async update(id: string, data: CollectionUpdate): Promise<Collection> {
    return apiClient.put<Collection>(`/collections/${id}`, data)
  }

  // Delete a collection
  async delete(id: string): Promise<MessageResponse> {
    return apiClient.delete<MessageResponse>(`/collections/${id}`)
  }

  // Get collection statistics
  async getStats(id: string): Promise<CollectionStats> {
    return withRetry(() =>
      apiClient.get<CollectionStats>(`/collections/${id}/stats`)
    )
  }

  // Perform health check on a collection
  async healthCheck(id: string): Promise<CollectionHealthCheck> {
    return withRetry(() =>
      apiClient.get<CollectionHealthCheck>(`/collections/${id}/health`)
    )
  }

  // Sync collection with Milvus
  async sync(id: string, options: CollectionSyncRequest = {}): Promise<OperationResponse> {
    return apiClient.post<OperationResponse>(`/collections/${id}/sync`, options)
  }

  // Search collections by name or description
  async search(query: string, limit = 10): Promise<Collection[]> {
    return withRetry(() =>
      apiClient.get<CollectionListResponse>('/collections', {
        search: query,
        limit,
      })
    ).then(response => response.collections)
  }

  // Get collections by status
  async getByStatus(status: Collection['status']): Promise<Collection[]> {
    return withRetry(() =>
      apiClient.get<CollectionListResponse>('/collections', {
        status,
        limit: 100, // Get all collections with this status
      })
    ).then(response => response.collections)
  }

  // Get collections by tags
  async getByTags(tags: string[]): Promise<Collection[]> {
    return withRetry(() =>
      apiClient.get<CollectionListResponse>('/collections', {
        tags,
        limit: 100,
      })
    ).then(response => response.collections)
  }

  // Get paginated collections (convenience method)
  async getPaginated(
    page = 1,
    size = 20,
    options: Omit<CollectionFilters, 'skip' | 'limit'> = {}
  ): Promise<CollectionListResponse> {
    const skip = (page - 1) * size
    return this.getAll({
      ...options,
      skip,
      limit: size,
    })
  }

  // Batch operations
  async batchDelete(ids: string[]): Promise<MessageResponse[]> {
    return Promise.all(ids.map(id => this.delete(id)))
  }

  // Check if collection name is available
  async isNameAvailable(name: string, excludeId?: string): Promise<boolean> {
    try {
      const results = await this.search(name, 1)
      const exactMatch = results.find(c =>
        c.name.toLowerCase() === name.toLowerCase() &&
        c.id !== excludeId
      )
      return !exactMatch
    } catch (error) {
      // If search fails, assume name is available
      return true
    }
  }

  // Get collection summary statistics
  async getSummaryStats(): Promise<{
    total: number
    active: number
    syncing: number
    error: number
    total_documents: number
    total_chunks: number
    total_size: number
  }> {
    const response = await withRetry(() =>
      apiClient.get<CollectionListResponse>('/collections', {
        limit: 1000, // Get all collections for statistics
      })
    )

    const collections = response.collections

    return {
      total: collections.length,
      active: collections.filter(c => c.status === 'active').length,
      syncing: collections.filter(c => c.status === 'syncing').length,
      error: collections.filter(c => c.status === 'error').length,
      total_documents: collections.reduce((sum, c) => sum + c.document_count, 0),
      total_chunks: collections.reduce((sum, c) => sum + c.chunk_count, 0),
      total_size: collections.reduce((sum, c) => sum + c.total_size_bytes, 0),
    }
  }
}

// Create and export a singleton instance
export const collectionsApi = new CollectionsAPI()

// Export individual methods as named functions for easier imports
export const {
  getAll: getAllCollections,
  getById: getCollectionById,
  create: createCollection,
  update: updateCollection,
  delete: deleteCollection,
  getStats: getCollectionStats,
  healthCheck: checkCollectionHealth,
  sync: syncCollection,
  search: searchCollections,
  getByStatus: getCollectionsByStatus,
  getByTags: getCollectionsByTags,
  getPaginated: getPaginatedCollections,
  batchDelete: batchDeleteCollections,
  isNameAvailable: isCollectionNameAvailable,
  getSummaryStats: getCollectionSummaryStats,
} = collectionsApi