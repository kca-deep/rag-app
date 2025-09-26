import { sql } from 'drizzle-orm'
import { sqliteTable, text, integer, real, blob, index, uniqueIndex } from 'drizzle-orm/sqlite-core'

// Collections table - organize documents into collections for separation
export const collections = sqliteTable('collections', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, any>>(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  nameIdx: index('collections_name_idx').on(table.name),
  activeIdx: index('collections_active_idx').on(table.isActive),
}))

// Documents table - store document metadata and file information
export const documents = sqliteTable('documents', {
  id: text('id').primaryKey(),
  collectionId: text('collection_id').notNull().references(() => collections.id, { onDelete: 'cascade' }),
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  fileSize: integer('file_size').notNull(),
  fileHash: text('file_hash').notNull(), // SHA-256 hash for deduplication
  mimeType: text('mime_type').notNull(),
  encoding: text('encoding').default('utf-8'),
  language: text('language').default('en'),

  // Processing status
  processingStatus: text('processing_status').notNull().default('pending'), // pending, processing, completed, failed
  processingError: text('processing_error'),

  // Content metadata
  totalChunks: integer('total_chunks').notNull().default(0),
  totalTokens: integer('total_tokens').notNull().default(0),

  // Additional metadata
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, any>>(),
  tags: text('tags', { mode: 'json' }).$type<string[]>(),

  // Timestamps
  uploadedAt: integer('uploaded_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  processedAt: integer('processed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  collectionIdx: index('documents_collection_idx').on(table.collectionId),
  filenameIdx: index('documents_filename_idx').on(table.filename),
  hashUniqueIdx: uniqueIndex('documents_hash_unique_idx').on(table.fileHash),
  statusIdx: index('documents_status_idx').on(table.processingStatus),
  uploadedIdx: index('documents_uploaded_idx').on(table.uploadedAt),
}))

// Document chunks table - store text chunks for RAG processing
export const documentChunks = sqliteTable('document_chunks', {
  id: text('id').primaryKey(),
  documentId: text('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  chunkIndex: integer('chunk_index').notNull(), // Sequential chunk number within document

  // Content
  content: text('content').notNull(),
  contentHash: text('content_hash').notNull(), // SHA-256 hash of content for deduplication
  tokenCount: integer('token_count').notNull(),

  // Vector embedding info (stored in Milvus, referenced here)
  milvusId: text('milvus_id'), // ID in Milvus vector database
  embeddingModel: text('embedding_model').notNull().default('text-embedding-3-small'),
  embeddingDimensions: integer('embedding_dimensions').notNull().default(1536),

  // Chunk metadata
  startPosition: integer('start_position').notNull().default(0),
  endPosition: integer('end_position').notNull().default(0),
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, any>>(),

  // Quality metrics
  semanticQuality: real('semantic_quality'), // 0.0 - 1.0 quality score

  // Timestamps
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  documentIdx: index('chunks_document_idx').on(table.documentId),
  documentChunkIdx: uniqueIndex('chunks_document_chunk_idx').on(table.documentId, table.chunkIndex),
  contentHashIdx: index('chunks_content_hash_idx').on(table.contentHash),
  milvusIdx: uniqueIndex('chunks_milvus_idx').on(table.milvusId),
  tokenCountIdx: index('chunks_token_count_idx').on(table.tokenCount),
}))

// API keys table - manage API access keys with role-based permissions
export const apiKeys = sqliteTable('api_keys', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),

  // Key information (store hashed version for security)
  keyHash: text('key_hash').notNull(), // SHA-256 hash of the API key
  keyPrefix: text('key_prefix').notNull(), // First 8 characters for identification

  // Permissions and limits
  role: text('role').notNull().default('read'), // read, write, admin
  permissions: text('permissions', { mode: 'json' }).$type<string[]>(),

  // Usage limits
  rateLimit: integer('rate_limit').default(1000), // requests per hour
  monthlyLimit: integer('monthly_limit'), // requests per month
  dailyLimit: integer('daily_limit'), // requests per day

  // Collections access
  allowedCollections: text('allowed_collections', { mode: 'json' }).$type<string[]>(),

  // Status
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  lastUsed: integer('last_used', { mode: 'timestamp' }),

  // Metadata
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, any>>(),

  // Timestamps
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  keyHashUniqueIdx: uniqueIndex('api_keys_hash_unique_idx').on(table.keyHash),
  keyPrefixIdx: index('api_keys_prefix_idx').on(table.keyPrefix),
  roleIdx: index('api_keys_role_idx').on(table.role),
  activeIdx: index('api_keys_active_idx').on(table.isActive),
  lastUsedIdx: index('api_keys_last_used_idx').on(table.lastUsed),
}))

// API usage logs table - track API key usage for monitoring and billing
export const apiUsageLogs = sqliteTable('api_usage_logs', {
  id: text('id').primaryKey(),
  apiKeyId: text('api_key_id').notNull().references(() => apiKeys.id, { onDelete: 'cascade' }),

  // Request information
  endpoint: text('endpoint').notNull(),
  method: text('method').notNull(),
  statusCode: integer('status_code').notNull(),

  // Usage metrics
  requestTokens: integer('request_tokens').default(0),
  responseTokens: integer('response_tokens').default(0),
  totalTokens: integer('total_tokens').default(0),

  // Performance metrics
  responseTime: integer('response_time'), // milliseconds

  // Request metadata
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, any>>(),

  // Timestamps
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  apiKeyIdx: index('usage_logs_api_key_idx').on(table.apiKeyId),
  timestampIdx: index('usage_logs_timestamp_idx').on(table.timestamp),
  endpointIdx: index('usage_logs_endpoint_idx').on(table.endpoint),
  statusIdx: index('usage_logs_status_idx').on(table.statusCode),
  // Compound index for efficient queries
  apiKeyTimestampIdx: index('usage_logs_key_timestamp_idx').on(table.apiKeyId, table.timestamp),
}))

// Sync operations table - track synchronization between SQLite and Milvus
export const syncOperations = sqliteTable('sync_operations', {
  id: text('id').primaryKey(),

  // Operation details
  operation: text('operation').notNull(), // insert, update, delete, bulk_insert
  entityType: text('entity_type').notNull(), // document, chunk, collection
  entityId: text('entity_id').notNull(),

  // Status tracking
  status: text('status').notNull().default('pending'), // pending, processing, completed, failed, retrying
  attempts: integer('attempts').notNull().default(0),
  maxAttempts: integer('max_attempts').notNull().default(3),

  // Error information
  error: text('error'),
  errorDetails: text('error_details', { mode: 'json' }).$type<Record<string, any>>(),

  // Timing
  scheduledAt: integer('scheduled_at', { mode: 'timestamp' }).notNull(),
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  nextRetryAt: integer('next_retry_at', { mode: 'timestamp' }),

  // Operation data
  payload: text('payload', { mode: 'json' }).$type<Record<string, any>>(),
  result: text('result', { mode: 'json' }).$type<Record<string, any>>(),

  // Metadata
  priority: integer('priority').notNull().default(100), // Higher number = higher priority
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, any>>(),

  // Timestamps
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  statusIdx: index('sync_ops_status_idx').on(table.status),
  entityIdx: index('sync_ops_entity_idx').on(table.entityType, table.entityId),
  scheduledIdx: index('sync_ops_scheduled_idx').on(table.scheduledAt),
  priorityIdx: index('sync_ops_priority_idx').on(table.priority),
  retryIdx: index('sync_ops_retry_idx').on(table.nextRetryAt),
  // Compound indexes for efficient queries
  statusScheduledIdx: index('sync_ops_status_scheduled_idx').on(table.status, table.scheduledAt),
}))

// Job queue table - general purpose job queue for background processing
export const jobQueue = sqliteTable('job_queue', {
  id: text('id').primaryKey(),

  // Job details
  jobType: text('job_type').notNull(), // document_processing, embedding_generation, cleanup
  status: text('status').notNull().default('queued'), // queued, processing, completed, failed, cancelled
  priority: integer('priority').notNull().default(100),

  // Retry logic
  attempts: integer('attempts').notNull().default(0),
  maxAttempts: integer('max_attempts').notNull().default(3),

  // Job data
  payload: text('payload', { mode: 'json' }).$type<Record<string, any>>().notNull(),
  result: text('result', { mode: 'json' }).$type<Record<string, any>>(),
  error: text('error'),

  // Timing
  availableAt: integer('available_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  reservedAt: integer('reserved_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),

  // Metadata
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, any>>(),

  // Timestamps
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  statusIdx: index('job_queue_status_idx').on(table.status),
  jobTypeIdx: index('job_queue_type_idx').on(table.jobType),
  priorityIdx: index('job_queue_priority_idx').on(table.priority),
  availableIdx: index('job_queue_available_idx').on(table.availableAt),
  // Compound index for job processing
  statusPriorityAvailableIdx: index('job_queue_processing_idx')
    .on(table.status, table.priority, table.availableAt),
}))

// Export all table types for TypeScript inference
export type Collection = typeof collections.$inferSelect
export type NewCollection = typeof collections.$inferInsert

export type Document = typeof documents.$inferSelect
export type NewDocument = typeof documents.$inferInsert

export type DocumentChunk = typeof documentChunks.$inferSelect
export type NewDocumentChunk = typeof documentChunks.$inferInsert

export type ApiKey = typeof apiKeys.$inferSelect
export type NewApiKey = typeof apiKeys.$inferInsert

export type ApiUsageLog = typeof apiUsageLogs.$inferSelect
export type NewApiUsageLog = typeof apiUsageLogs.$inferInsert

export type SyncOperation = typeof syncOperations.$inferSelect
export type NewSyncOperation = typeof syncOperations.$inferInsert

export type JobQueue = typeof jobQueue.$inferSelect
export type NewJobQueue = typeof jobQueue.$inferInsert