CREATE TABLE `api_keys` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`key_hash` text NOT NULL,
	`key_prefix` text NOT NULL,
	`role` text DEFAULT 'read' NOT NULL,
	`permissions` text,
	`rate_limit` integer DEFAULT 1000,
	`monthly_limit` integer,
	`daily_limit` integer,
	`allowed_collections` text,
	`is_active` integer DEFAULT true NOT NULL,
	`last_used` integer,
	`metadata` text,
	`expires_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `api_keys_hash_unique_idx` ON `api_keys` (`key_hash`);--> statement-breakpoint
CREATE INDEX `api_keys_prefix_idx` ON `api_keys` (`key_prefix`);--> statement-breakpoint
CREATE INDEX `api_keys_role_idx` ON `api_keys` (`role`);--> statement-breakpoint
CREATE INDEX `api_keys_active_idx` ON `api_keys` (`is_active`);--> statement-breakpoint
CREATE INDEX `api_keys_last_used_idx` ON `api_keys` (`last_used`);--> statement-breakpoint
CREATE TABLE `api_usage_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`api_key_id` text NOT NULL,
	`endpoint` text NOT NULL,
	`method` text NOT NULL,
	`status_code` integer NOT NULL,
	`request_tokens` integer DEFAULT 0,
	`response_tokens` integer DEFAULT 0,
	`total_tokens` integer DEFAULT 0,
	`response_time` integer,
	`user_agent` text,
	`ip_address` text,
	`metadata` text,
	`timestamp` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`api_key_id`) REFERENCES `api_keys`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `usage_logs_api_key_idx` ON `api_usage_logs` (`api_key_id`);--> statement-breakpoint
CREATE INDEX `usage_logs_timestamp_idx` ON `api_usage_logs` (`timestamp`);--> statement-breakpoint
CREATE INDEX `usage_logs_endpoint_idx` ON `api_usage_logs` (`endpoint`);--> statement-breakpoint
CREATE INDEX `usage_logs_status_idx` ON `api_usage_logs` (`status_code`);--> statement-breakpoint
CREATE INDEX `usage_logs_key_timestamp_idx` ON `api_usage_logs` (`api_key_id`,`timestamp`);--> statement-breakpoint
CREATE TABLE `collections` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`metadata` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `collections_name_idx` ON `collections` (`name`);--> statement-breakpoint
CREATE INDEX `collections_active_idx` ON `collections` (`is_active`);--> statement-breakpoint
CREATE TABLE `document_chunks` (
	`id` text PRIMARY KEY NOT NULL,
	`document_id` text NOT NULL,
	`chunk_index` integer NOT NULL,
	`content` text NOT NULL,
	`content_hash` text NOT NULL,
	`token_count` integer NOT NULL,
	`milvus_id` text,
	`embedding_model` text DEFAULT 'text-embedding-3-small' NOT NULL,
	`embedding_dimensions` integer DEFAULT 1536 NOT NULL,
	`start_position` integer DEFAULT 0 NOT NULL,
	`end_position` integer DEFAULT 0 NOT NULL,
	`metadata` text,
	`semantic_quality` real,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `chunks_document_idx` ON `document_chunks` (`document_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `chunks_document_chunk_idx` ON `document_chunks` (`document_id`,`chunk_index`);--> statement-breakpoint
CREATE INDEX `chunks_content_hash_idx` ON `document_chunks` (`content_hash`);--> statement-breakpoint
CREATE UNIQUE INDEX `chunks_milvus_idx` ON `document_chunks` (`milvus_id`);--> statement-breakpoint
CREATE INDEX `chunks_token_count_idx` ON `document_chunks` (`token_count`);--> statement-breakpoint
CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`collection_id` text NOT NULL,
	`filename` text NOT NULL,
	`original_name` text NOT NULL,
	`file_size` integer NOT NULL,
	`file_hash` text NOT NULL,
	`mime_type` text NOT NULL,
	`encoding` text DEFAULT 'utf-8',
	`language` text DEFAULT 'en',
	`processing_status` text DEFAULT 'pending' NOT NULL,
	`processing_error` text,
	`total_chunks` integer DEFAULT 0 NOT NULL,
	`total_tokens` integer DEFAULT 0 NOT NULL,
	`metadata` text,
	`tags` text,
	`uploaded_at` integer DEFAULT (unixepoch()) NOT NULL,
	`processed_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `documents_collection_idx` ON `documents` (`collection_id`);--> statement-breakpoint
CREATE INDEX `documents_filename_idx` ON `documents` (`filename`);--> statement-breakpoint
CREATE UNIQUE INDEX `documents_hash_unique_idx` ON `documents` (`file_hash`);--> statement-breakpoint
CREATE INDEX `documents_status_idx` ON `documents` (`processing_status`);--> statement-breakpoint
CREATE INDEX `documents_uploaded_idx` ON `documents` (`uploaded_at`);--> statement-breakpoint
CREATE TABLE `job_queue` (
	`id` text PRIMARY KEY NOT NULL,
	`job_type` text NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`priority` integer DEFAULT 100 NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`max_attempts` integer DEFAULT 3 NOT NULL,
	`payload` text NOT NULL,
	`result` text,
	`error` text,
	`available_at` integer DEFAULT (unixepoch()) NOT NULL,
	`reserved_at` integer,
	`completed_at` integer,
	`metadata` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `job_queue_status_idx` ON `job_queue` (`status`);--> statement-breakpoint
CREATE INDEX `job_queue_type_idx` ON `job_queue` (`job_type`);--> statement-breakpoint
CREATE INDEX `job_queue_priority_idx` ON `job_queue` (`priority`);--> statement-breakpoint
CREATE INDEX `job_queue_available_idx` ON `job_queue` (`available_at`);--> statement-breakpoint
CREATE INDEX `job_queue_processing_idx` ON `job_queue` (`status`,`priority`,`available_at`);--> statement-breakpoint
CREATE TABLE `sync_operations` (
	`id` text PRIMARY KEY NOT NULL,
	`operation` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`max_attempts` integer DEFAULT 3 NOT NULL,
	`error` text,
	`error_details` text,
	`scheduled_at` integer NOT NULL,
	`started_at` integer,
	`completed_at` integer,
	`next_retry_at` integer,
	`payload` text,
	`result` text,
	`priority` integer DEFAULT 100 NOT NULL,
	`metadata` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `sync_ops_status_idx` ON `sync_operations` (`status`);--> statement-breakpoint
CREATE INDEX `sync_ops_entity_idx` ON `sync_operations` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `sync_ops_scheduled_idx` ON `sync_operations` (`scheduled_at`);--> statement-breakpoint
CREATE INDEX `sync_ops_priority_idx` ON `sync_operations` (`priority`);--> statement-breakpoint
CREATE INDEX `sync_ops_retry_idx` ON `sync_operations` (`next_retry_at`);--> statement-breakpoint
CREATE INDEX `sync_ops_status_scheduled_idx` ON `sync_operations` (`status`,`scheduled_at`);