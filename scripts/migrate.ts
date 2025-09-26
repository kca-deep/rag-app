#!/usr/bin/env npx tsx

import { initializeDatabase } from '../lib/db'
import { validateEnv } from '../lib/env'

async function main() {
  try {
    console.log('Starting database migration...')

    // Validate environment variables
    validateEnv()

    // Initialize database and run migrations
    await initializeDatabase()

    console.log('Migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

main()