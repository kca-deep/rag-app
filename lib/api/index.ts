// Export all API modules
export * from './collections'

// Re-export common types and utilities
export * from '../types'
export * from '../api-client'

// API client instance for direct usage
export { apiClient as api } from '../api-client'

// Centralized API object for organized usage
import { collectionsApi } from './collections'

export const API = {
  collections: collectionsApi,
  // Future APIs will be added here:
  // documents: documentsApi,
  // search: searchApi,
  // apiKeys: apiKeysApi,
  // health: healthApi,
} as const