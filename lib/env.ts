import { z } from 'zod'

const envSchema = z.object({
  // Database connections
  DATABASE_URL: z.string().default('sqlite:///./data/rag_pipeline.db'),
  DATABASE_POOL_SIZE: z.coerce.number().default(10),
  DATABASE_MAX_OVERFLOW: z.coerce.number().default(20),

  // Milvus
  MILVUS_HOST: z.string().default('localhost'),
  MILVUS_PORT: z.coerce.number().default(19530),
  MILVUS_USER: z.string().optional(),
  MILVUS_PASSWORD: z.string().optional(),
  MILVUS_TIMEOUT: z.coerce.number().default(30),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),
  REDIS_DB: z.coerce.number().default(0),
  REDIS_MAX_CONNECTIONS: z.coerce.number().default(100),

  // OpenAI API
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required').optional(),
  OPENAI_ORGANIZATION: z.string().optional(),
  OPENAI_EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),
  OPENAI_MAX_RETRIES: z.coerce.number().default(3),
  OPENAI_TIMEOUT: z.coerce.number().default(30),

  // Security settings
  SECRET_KEY: z.string().min(32, 'Secret key must be at least 32 characters').default('development-secret-key-change-for-production-32chars'),
  API_KEY_SALT: z.string().min(16, 'API key salt must be at least 16 characters').default('dev-salt-16-chars'),
  ENCRYPTION_KEY: z.string().length(64, 'Encryption key must be exactly 64 characters (32 bytes hex)').default('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'),
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters').default('development-jwt-secret-change-for-production-32chars'),

  // Performance settings
  CACHE_TTL: z.coerce.number().default(3600),
  SEARCH_CACHE_TTL: z.coerce.number().default(1800),
  EMBEDDING_CACHE_TTL: z.coerce.number().default(86400),
  BATCH_SIZE: z.coerce.number().default(100),
  MAX_CONCURRENT_REQUESTS: z.coerce.number().default(10),

  // Application settings
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
})

export type Env = z.infer<typeof envSchema>

function getEnv(): Env {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    console.error('Environment validation failed:', error)
    throw new Error('Invalid environment configuration')
  }
}

export const env = getEnv()

// Validate on module load
export function validateEnv(): void {
  try {
    envSchema.parse(process.env)
    console.log('Environment validation successful')
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Environment validation errors:')
      error.errors.forEach(err => {
        console.error(`- ${err.path.join('.')}: ${err.message}`)
      })
    }
    throw new Error('Environment validation failed')
  }
}