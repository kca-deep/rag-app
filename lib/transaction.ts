import Database from 'better-sqlite3'
import { getDb } from './database'

export interface TransactionOptions {
  timeout?: number
  retries?: number
  retryDelay?: number
  readOnly?: boolean
  isolationLevel?: 'READ_UNCOMMITTED' | 'READ_COMMITTED' | 'REPEATABLE_READ' | 'SERIALIZABLE'
}

export interface LockInfo {
  lockId: string
  type: 'READ' | 'WRITE' | 'EXCLUSIVE'
  resource: string
  acquiredAt: Date
  timeout: number
}

export class DatabaseLockManager {
  private static instance: DatabaseLockManager
  private activeLocks = new Map<string, LockInfo>()
  private lockQueue = new Map<string, Array<{
    resolve: (value: boolean) => void
    reject: (error: Error) => void
    timeout: NodeJS.Timeout
  }>>()

  private constructor() {}

  public static getInstance(): DatabaseLockManager {
    if (!DatabaseLockManager.instance) {
      DatabaseLockManager.instance = new DatabaseLockManager()
    }
    return DatabaseLockManager.instance
  }

  /**
   * Acquires a lock on a resource
   */
  public async acquireLock(
    resource: string,
    type: 'READ' | 'WRITE' | 'EXCLUSIVE' = 'WRITE',
    timeout: number = 30000
  ): Promise<string> {
    const lockId = this.generateLockId()

    return new Promise<string>((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        this.cleanupLockRequest(resource, resolve)
        reject(new Error(`Lock acquisition timeout for resource: ${resource}`))
      }, timeout)

      const tryAcquire = () => {
        if (this.canAcquireLock(resource, type)) {
          clearTimeout(timeoutHandle)
          const lockInfo: LockInfo = {
            lockId,
            type,
            resource,
            acquiredAt: new Date(),
            timeout
          }
          this.activeLocks.set(lockId, lockInfo)
          resolve(lockId)
        } else {
          // Add to queue
          if (!this.lockQueue.has(resource)) {
            this.lockQueue.set(resource, [])
          }
          this.lockQueue.get(resource)!.push({
            resolve: (acquired: boolean) => {
              if (acquired) {
                clearTimeout(timeoutHandle)
                const lockInfo: LockInfo = {
                  lockId,
                  type,
                  resource,
                  acquiredAt: new Date(),
                  timeout
                }
                this.activeLocks.set(lockId, lockInfo)
                resolve(lockId)
              }
            },
            reject,
            timeout: timeoutHandle
          })
        }
      }

      tryAcquire()
    })
  }

  /**
   * Releases a lock
   */
  public releaseLock(lockId: string): boolean {
    const lockInfo = this.activeLocks.get(lockId)
    if (!lockInfo) {
      console.warn(`Attempted to release non-existent lock: ${lockId}`)
      return false
    }

    this.activeLocks.delete(lockId)
    this.processLockQueue(lockInfo.resource)
    return true
  }

  /**
   * Checks if a lock can be acquired
   */
  private canAcquireLock(resource: string, type: 'READ' | 'WRITE' | 'EXCLUSIVE'): boolean {
    const existingLocks = Array.from(this.activeLocks.values())
      .filter(lock => lock.resource === resource)

    if (existingLocks.length === 0) {
      return true
    }

    // EXCLUSIVE locks block everything
    if (existingLocks.some(lock => lock.type === 'EXCLUSIVE')) {
      return false
    }

    // WRITE locks block WRITE and EXCLUSIVE
    if (type === 'WRITE' || type === 'EXCLUSIVE') {
      return !existingLocks.some(lock => lock.type === 'WRITE')
    }

    // READ locks can coexist with other READ locks
    if (type === 'READ') {
      return !existingLocks.some(lock => lock.type === 'WRITE' || lock.type === 'EXCLUSIVE')
    }

    return false
  }

  /**
   * Processes the lock queue for a resource
   */
  private processLockQueue(resource: string): void {
    const queue = this.lockQueue.get(resource)
    if (!queue || queue.length === 0) {
      return
    }

    const waitingRequest = queue.shift()!
    if (waitingRequest) {
      waitingRequest.resolve(true)
    }

    if (queue.length === 0) {
      this.lockQueue.delete(resource)
    }
  }

  /**
   * Cleans up a lock request from the queue
   */
  private cleanupLockRequest(resource: string, resolve: (value: boolean) => void): void {
    const queue = this.lockQueue.get(resource)
    if (queue) {
      const index = queue.findIndex(req => req.resolve === resolve)
      if (index >= 0) {
        const request = queue[index]
        clearTimeout(request.timeout)
        queue.splice(index, 1)
        if (queue.length === 0) {
          this.lockQueue.delete(resource)
        }
      }
    }
  }

  /**
   * Generates a unique lock ID
   */
  private generateLockId(): string {
    return `lock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Gets information about active locks
   */
  public getActiveLocks(): LockInfo[] {
    return Array.from(this.activeLocks.values())
  }

  /**
   * Forces release of all locks (emergency cleanup)
   */
  public releaseAllLocks(): void {
    console.warn('Force releasing all database locks')
    this.activeLocks.clear()

    // Reject all queued lock requests
    for (const [resource, queue] of this.lockQueue.entries()) {
      for (const request of queue) {
        clearTimeout(request.timeout)
        request.reject(new Error('Lock manager reset - all locks released'))
      }
    }
    this.lockQueue.clear()
  }

  /**
   * Cleans up expired locks
   */
  public cleanupExpiredLocks(): number {
    const now = new Date()
    let cleanedCount = 0

    for (const [lockId, lockInfo] of this.activeLocks.entries()) {
      const age = now.getTime() - lockInfo.acquiredAt.getTime()
      if (age > lockInfo.timeout) {
        console.warn(`Cleaning up expired lock: ${lockId}`)
        this.activeLocks.delete(lockId)
        this.processLockQueue(lockInfo.resource)
        cleanedCount++
      }
    }

    return cleanedCount
  }
}

export class TransactionManager {
  private static readonly DEFAULT_OPTIONS: Required<TransactionOptions> = {
    timeout: 30000,
    retries: 3,
    retryDelay: 100,
    readOnly: false,
    isolationLevel: 'READ_COMMITTED'
  }

  /**
   * Executes a function within a database transaction with automatic retry and lock management
   */
  public static async withTransaction<T>(
    operation: (db: Database.Database) => T,
    options: TransactionOptions = {}
  ): Promise<T> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options }
    const db = getDb()
    const lockManager = DatabaseLockManager.getInstance()

    let lastError: Error | null = null
    let lockId: string | null = null

    for (let attempt = 1; attempt <= opts.retries; attempt++) {
      try {
        // Acquire database lock
        const lockType = opts.readOnly ? 'READ' : 'WRITE'
        lockId = await lockManager.acquireLock('database', lockType, opts.timeout)

        // Set isolation level
        if (opts.isolationLevel !== 'READ_COMMITTED') {
          switch (opts.isolationLevel) {
            case 'READ_UNCOMMITTED':
              db.pragma('read_uncommitted = ON')
              break
            case 'REPEATABLE_READ':
            case 'SERIALIZABLE':
              db.pragma('read_uncommitted = OFF')
              break
          }
        }

        // Execute transaction
        if (opts.readOnly) {
          // Read-only transaction doesn't need explicit transaction management
          const result = operation(db)
          lockManager.releaseLock(lockId)
          return result
        } else {
          // Write transaction with explicit management
          const transaction = db.transaction((db: Database.Database) => {
            return operation(db)
          })

          const result = transaction.immediate()(db)
          lockManager.releaseLock(lockId)
          return result
        }
      } catch (error) {
        if (lockId) {
          lockManager.releaseLock(lockId)
          lockId = null
        }

        lastError = error as Error
        const errorMessage = error instanceof Error ? error.message : String(error)

        // Check if error is retryable
        if (this.isRetryableError(errorMessage) && attempt < opts.retries) {
          const delay = opts.retryDelay * Math.pow(2, attempt - 1) // Exponential backoff
          console.warn(`Transaction attempt ${attempt} failed: ${errorMessage}. Retrying in ${delay}ms...`)
          await this.sleep(delay)
          continue
        }

        throw error
      }
    }

    throw lastError || new Error('Transaction failed after all retry attempts')
  }

  /**
   * Creates a savepoint within a transaction
   */
  public static createSavepoint(db: Database.Database, name: string): void {
    try {
      db.exec(`SAVEPOINT ${name}`)
    } catch (error) {
      throw new Error(`Failed to create savepoint ${name}: ${error}`)
    }
  }

  /**
   * Rolls back to a savepoint
   */
  public static rollbackToSavepoint(db: Database.Database, name: string): void {
    try {
      db.exec(`ROLLBACK TO SAVEPOINT ${name}`)
    } catch (error) {
      throw new Error(`Failed to rollback to savepoint ${name}: ${error}`)
    }
  }

  /**
   * Releases a savepoint
   */
  public static releaseSavepoint(db: Database.Database, name: string): void {
    try {
      db.exec(`RELEASE SAVEPOINT ${name}`)
    } catch (error) {
      throw new Error(`Failed to release savepoint ${name}: ${error}`)
    }
  }

  /**
   * Executes a batch of operations with rollback support
   */
  public static async withSavepoint<T>(
    db: Database.Database,
    savepointName: string,
    operation: (db: Database.Database) => T
  ): Promise<T> {
    this.createSavepoint(db, savepointName)

    try {
      const result = operation(db)
      this.releaseSavepoint(db, savepointName)
      return result
    } catch (error) {
      try {
        this.rollbackToSavepoint(db, savepointName)
      } catch (rollbackError) {
        console.error(`Failed to rollback to savepoint ${savepointName}:`, rollbackError)
      }
      throw error
    }
  }

  /**
   * Checks if an error is retryable
   */
  private static isRetryableError(errorMessage: string): boolean {
    const retryableErrors = [
      'SQLITE_BUSY',
      'SQLITE_LOCKED',
      'database is locked',
      'database table is locked',
      'locking protocol',
      'disk I/O error'
    ]

    return retryableErrors.some(pattern =>
      errorMessage.toLowerCase().includes(pattern.toLowerCase())
    )
  }

  /**
   * Sleep utility for retry delays
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Gets current transaction state
   */
  public static isInTransaction(db: Database.Database): boolean {
    try {
      // Try to start an immediate transaction - if we're already in one, this will fail
      db.exec('BEGIN IMMEDIATE')
      db.exec('ROLLBACK')
      return false
    } catch {
      return true
    }
  }

  /**
   * Gets database lock information
   */
  public static getDatabaseInfo(db: Database.Database): {
    inTransaction: boolean
    readOnly: boolean
    autocommit: boolean
    journalMode: string
    lockingMode: string
  } {
    try {
      return {
        inTransaction: this.isInTransaction(db),
        readOnly: db.readonly,
        autocommit: db.pragma('auto_vacuum') !== 0,
        journalMode: db.pragma('journal_mode') as string,
        lockingMode: db.pragma('locking_mode') as string
      }
    } catch (error) {
      throw new Error(`Failed to get database info: ${error}`)
    }
  }
}

// Export singleton instances
export const lockManager = DatabaseLockManager.getInstance()

// Export commonly used functions
export const withTransaction = TransactionManager.withTransaction
export const withSavepoint = TransactionManager.withSavepoint
export const createSavepoint = TransactionManager.createSavepoint
export const rollbackToSavepoint = TransactionManager.rollbackToSavepoint
export const releaseSavepoint = TransactionManager.releaseSavepoint