import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './drizzle',
  schema: './lib/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: './data/rag_pipeline.db'
  },
  verbose: true,
  strict: true,
  migrations: {
    prefix: 'supabase'
  }
})