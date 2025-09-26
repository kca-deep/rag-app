// Collection types based on backend schema
export interface Collection {
  id: string
  name: string
  description?: string
  embedding_model: string
  chunk_size: number
  chunk_overlap: number
  settings: Record<string, any>
  tags: string[]
  milvus_collection_name: string
  status: 'active' | 'inactive' | 'syncing' | 'error'
  document_count: number
  chunk_count: number
  total_size_bytes: number
  milvus_synced: boolean
  milvus_sync_error?: string
  last_sync_at?: string
  created_at: string
  updated_at: string
}

export interface CollectionCreate {
  name: string
  description?: string
  embedding_model?: string
  chunk_size?: number
  chunk_overlap?: number
  settings?: Record<string, any>
  tags?: string[]
}

export interface CollectionUpdate {
  name?: string
  description?: string
  embedding_model?: string
  chunk_size?: number
  chunk_overlap?: number
  settings?: Record<string, any>
  tags?: string[]
  status?: 'active' | 'inactive' | 'syncing' | 'error'
}

export interface CollectionListResponse {
  collections: Collection[]
  total: number
  page: number
  size: number
  has_next: boolean
  has_previous: boolean
}

export interface CollectionStats {
  id: string
  name: string
  document_count: number
  chunk_count: number
  total_size_bytes: number
  average_document_size: number
  average_chunk_count_per_document: number
  status: string
  milvus_synced: boolean
  last_activity: string
}

export interface CollectionHealthCheck {
  collection_id: string
  collection_name: string
  database_status: string
  milvus_status: string
  sync_status: string
  last_check: string
  issues: string[]
}

export interface CollectionSyncRequest {
  force?: boolean
}

export interface OperationResponse {
  operation_id: string
  status: string
  message: string
  started_at: string
  completed_at?: string
  progress: number
  result: Record<string, any>
}

export interface MessageResponse {
  message: string
  success: boolean
}

// API Error types
export interface APIError {
  error: string
  details?: any
  status_code: number
}

// Common query parameters
export interface CollectionFilters {
  skip?: number
  limit?: number
  search?: string
  status?: 'active' | 'inactive' | 'syncing' | 'error'
  tags?: string[]
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

// Document types (for future use)
export interface Document {
  id: string
  collection_id: string
  filename: string
  original_name: string
  file_size: number
  file_hash: string
  mime_type: string
  encoding: string
  language: string
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'
  processing_error?: string
  total_chunks: number
  total_tokens: number
  metadata: Record<string, any>
  tags: string[]
  uploaded_at: string
  processed_at?: string
  created_at: string
  updated_at: string
}

// Pagination helper type
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  size: number
  has_next: boolean
  has_previous: boolean
}