import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from './schema'
import { dbManager } from './database'

// Initialize Drizzle ORM with better-sqlite3 driver
export const db = drizzle(dbManager.getDatabase(), {
  schema,
  logger: process.env.NODE_ENV === 'development'
})

// Export schema for external use
export { schema }

// Migration helper function
export async function runMigrations() {
  try {
    console.log('Running database migrations...')
    await migrate(db, { migrationsFolder: './drizzle' })
    console.log('Database migrations completed successfully')
  } catch (error) {
    console.error('Failed to run database migrations:', error)
    throw error
  }
}

// Database initialization function
export async function initializeDatabase() {
  try {
    // Initialize database connection
    dbManager.initialize()

    // Run migrations
    await runMigrations()

    console.log('Database initialization completed successfully')
    return db
  } catch (error) {
    console.error('Database initialization failed:', error)
    throw error
  }
}