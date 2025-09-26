import Database from 'better-sqlite3'
import { env } from './env'
import * as path from 'path'
import * as fs from 'fs'

export interface DatabaseConfig {
  url: string
  poolSize: number
  maxOverflow: number
}

class DatabaseManager {
  private static instance: DatabaseManager
  private db: Database.Database | null = null
  private isInitialized = false

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager()
    }
    return DatabaseManager.instance
  }

  public initialize(): Database.Database {
    if (this.db && this.isInitialized) {
      return this.db
    }

    try {
      // Parse database URL to get file path
      const dbUrl = env.DATABASE_URL
      const dbPath = this.parseDatabaseUrl(dbUrl)

      // Ensure database directory exists
      const dbDir = path.dirname(dbPath)
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true })
        console.log(`Created database directory: ${dbDir}`)
      }

      // Create database connection
      this.db = new Database(dbPath, {
        verbose: env.NODE_ENV === 'development' ? console.log : undefined
      })

      // Configure database with optimal settings
      this.configurePragmas()

      console.log(`Database initialized successfully at: ${dbPath}`)
      this.isInitialized = true

      return this.db
    } catch (error) {
      console.error('Failed to initialize database:', error)
      throw new Error(`Database initialization failed: ${error}`)
    }
  }

  private parseDatabaseUrl(url: string): string {
    // Handle sqlite:///./path/to/db.db format
    if (url.startsWith('sqlite:///')) {
      const filePath = url.substring(10) // Remove 'sqlite:///'
      return path.resolve(filePath)
    }

    // Handle sqlite://path/to/db.db format
    if (url.startsWith('sqlite://')) {
      const filePath = url.substring(9) // Remove 'sqlite://'
      return path.resolve(filePath)
    }

    // Handle direct file path
    return path.resolve(url)
  }

  private configurePragmas(): void {
    if (!this.db) throw new Error('Database not initialized')

    try {
      // Enable WAL mode for better performance and concurrency
      this.db.pragma('journal_mode = WAL')

      // Set synchronous mode to NORMAL for better performance
      // FULL is safer but slower, NORMAL is good balance
      this.db.pragma('synchronous = NORMAL')

      // Increase cache size (negative value = KB, positive = pages)
      this.db.pragma('cache_size = -64000') // 64MB cache

      // Enable foreign key constraints
      this.db.pragma('foreign_keys = ON')

      // Set page size (must be power of 2, between 512 and 65536)
      // Larger page size can improve performance for larger databases
      this.db.pragma('page_size = 4096')

      // Set temp store to memory for better performance
      this.db.pragma('temp_store = MEMORY')

      // Set mmap size for memory-mapped I/O (64MB)
      this.db.pragma('mmap_size = 67108864')

      // Set busy timeout to prevent immediate failures on locks
      this.db.pragma('busy_timeout = 30000') // 30 seconds

      console.log('Database pragmas configured successfully')

      // Log current pragma values for verification
      if (env.NODE_ENV === 'development') {
        this.logPragmaValues()
      }
    } catch (error) {
      console.error('Failed to configure database pragmas:', error)
      throw error
    }
  }

  private logPragmaValues(): void {
    if (!this.db) return

    const pragmas = [
      'journal_mode',
      'synchronous',
      'cache_size',
      'foreign_keys',
      'page_size',
      'temp_store',
      'mmap_size',
      'busy_timeout'
    ]

    console.log('Current database pragma values:')
    pragmas.forEach(pragma => {
      try {
        const result = this.db!.pragma(pragma)
        console.log(`  ${pragma}: ${JSON.stringify(result)}`)
      } catch (error) {
        console.log(`  ${pragma}: Error reading value`)
      }
    })
  }

  public getDatabase(): Database.Database {
    if (!this.db || !this.isInitialized) {
      return this.initialize()
    }
    return this.db
  }

  public close(): void {
    if (this.db) {
      try {
        // Checkpoint WAL file before closing
        this.db.pragma('wal_checkpoint(FULL)')
        this.db.close()
        console.log('Database connection closed successfully')
      } catch (error) {
        console.error('Error closing database:', error)
      } finally {
        this.db = null
        this.isInitialized = false
      }
    }
  }

  public vacuum(): void {
    if (!this.db) throw new Error('Database not initialized')

    try {
      console.log('Starting database vacuum...')
      this.db.exec('VACUUM')
      console.log('Database vacuum completed')
    } catch (error) {
      console.error('Database vacuum failed:', error)
      throw error
    }
  }

  public analyze(): void {
    if (!this.db) throw new Error('Database not initialized')

    try {
      console.log('Starting database analyze...')
      this.db.exec('ANALYZE')
      console.log('Database analyze completed')
    } catch (error) {
      console.error('Database analyze failed:', error)
      throw error
    }
  }

  public getDatabaseInfo(): object {
    if (!this.db) throw new Error('Database not initialized')

    try {
      const info = {
        file_size: this.db.pragma('page_count') * this.db.pragma('page_size'),
        page_count: this.db.pragma('page_count'),
        page_size: this.db.pragma('page_size'),
        cache_size: this.db.pragma('cache_size'),
        journal_mode: this.db.pragma('journal_mode'),
        synchronous: this.db.pragma('synchronous'),
        foreign_keys: this.db.pragma('foreign_keys'),
        temp_store: this.db.pragma('temp_store'),
        mmap_size: this.db.pragma('mmap_size'),
        busy_timeout: this.db.pragma('busy_timeout'),
      }
      return info
    } catch (error) {
      console.error('Failed to get database info:', error)
      throw error
    }
  }
}

// Export singleton instance
export const dbManager = DatabaseManager.getInstance()

// Export convenience function
export function getDb(): Database.Database {
  return dbManager.getDatabase()
}

// Graceful shutdown handler
process.on('SIGINT', () => {
  console.log('Received SIGINT, closing database connection...')
  dbManager.close()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, closing database connection...')
  dbManager.close()
  process.exit(0)
})