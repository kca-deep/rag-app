import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import * as zlib from 'zlib'
import { dbManager, getDb } from './database'
import { env } from './env'
import { CryptoUtils, EncryptionResult } from './crypto'

export interface BackupMetadata {
  id: string
  timestamp: Date
  dbPath: string
  size: number
  compressed: boolean
  encrypted: boolean
  checksum: string
  version: string
  description?: string
}

export interface BackupConfig {
  backupDir: string
  maxBackups: number
  compressionLevel: number
  encrypt: boolean
  scheduleEnabled: boolean
  scheduleInterval: string // cron format
}

export interface RestoreOptions {
  backupId: string
  validateChecksum: boolean
  createDbBackup: boolean
  targetPath?: string
}

export class DatabaseBackup {
  private static readonly DEFAULT_CONFIG: BackupConfig = {
    backupDir: './data/backups',
    maxBackups: 30,
    compressionLevel: 6,
    encrypt: true,
    scheduleEnabled: false,
    scheduleInterval: '0 2 * * *' // Daily at 2 AM
  }

  private config: BackupConfig
  private backupMetadataPath: string

  constructor(config?: Partial<BackupConfig>) {
    this.config = { ...DatabaseBackup.DEFAULT_CONFIG, ...config }
    this.backupMetadataPath = path.join(this.config.backupDir, 'backup-metadata.json')
    this.ensureBackupDirectory()
  }

  private ensureBackupDirectory(): void {
    try {
      if (!fs.existsSync(this.config.backupDir)) {
        fs.mkdirSync(this.config.backupDir, { recursive: true })
        console.log(`Created backup directory: ${this.config.backupDir}`)
      }
    } catch (error) {
      throw new Error(`Failed to create backup directory: ${error}`)
    }
  }

  private loadBackupMetadata(): BackupMetadata[] {
    try {
      if (!fs.existsSync(this.backupMetadataPath)) {
        return []
      }
      const data = fs.readFileSync(this.backupMetadataPath, 'utf8')
      const metadata = JSON.parse(data)

      // Convert timestamp strings back to Date objects
      return metadata.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }))
    } catch (error) {
      console.error('Failed to load backup metadata:', error)
      return []
    }
  }

  private saveBackupMetadata(metadata: BackupMetadata[]): void {
    try {
      const data = JSON.stringify(metadata, null, 2)
      fs.writeFileSync(this.backupMetadataPath, data, 'utf8')
    } catch (error) {
      throw new Error(`Failed to save backup metadata: ${error}`)
    }
  }

  private generateBackupId(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const random = crypto.randomBytes(4).toString('hex')
    return `backup-${timestamp}-${random}`
  }

  private calculateFileChecksum(filePath: string): string {
    try {
      const fileBuffer = fs.readFileSync(filePath)
      return crypto.createHash('sha256').update(fileBuffer).digest('hex')
    } catch (error) {
      throw new Error(`Failed to calculate checksum: ${error}`)
    }
  }

  private compressFile(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(inputPath)
      const writeStream = fs.createWriteStream(outputPath)
      const gzipStream = zlib.createGzip({ level: this.config.compressionLevel })

      readStream.pipe(gzipStream).pipe(writeStream)

      writeStream.on('finish', resolve)
      writeStream.on('error', reject)
      readStream.on('error', reject)
      gzipStream.on('error', reject)
    })
  }

  private decompressFile(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(inputPath)
      const writeStream = fs.createWriteStream(outputPath)
      const gunzipStream = zlib.createGunzip()

      readStream.pipe(gunzipStream).pipe(writeStream)

      writeStream.on('finish', resolve)
      writeStream.on('error', reject)
      readStream.on('error', reject)
      gunzipStream.on('error', reject)
    })
  }

  private encryptFile(inputPath: string, outputPath: string): void {
    try {
      const data = fs.readFileSync(inputPath, 'utf8')
      const encrypted = CryptoUtils.encrypt(data)

      // Store encryption result as JSON
      const encryptedData = JSON.stringify(encrypted)
      fs.writeFileSync(outputPath, encryptedData, 'utf8')
    } catch (error) {
      throw new Error(`File encryption failed: ${error}`)
    }
  }

  private decryptFile(inputPath: string, outputPath: string): void {
    try {
      const encryptedData = fs.readFileSync(inputPath, 'utf8')
      const encryptionResult: EncryptionResult = JSON.parse(encryptedData)
      const decrypted = CryptoUtils.decrypt(encryptionResult)

      fs.writeFileSync(outputPath, decrypted)
    } catch (error) {
      throw new Error(`File decryption failed: ${error}`)
    }
  }

  /**
   * Creates a backup of the current database
   */
  public async createBackup(description?: string): Promise<BackupMetadata> {
    console.log('Starting database backup...')

    try {
      const db = getDb()
      const dbPath = this.getDbFilePath()

      if (!fs.existsSync(dbPath)) {
        throw new Error(`Database file not found: ${dbPath}`)
      }

      // Force checkpoint to ensure WAL is written to main database
      db.pragma('wal_checkpoint(FULL)')

      const backupId = this.generateBackupId()
      const timestamp = new Date()

      let currentPath = dbPath
      let backupPath = path.join(this.config.backupDir, `${backupId}.db`)

      // Step 1: Copy database file
      fs.copyFileSync(currentPath, backupPath)
      currentPath = backupPath

      // Step 2: Compress if enabled
      let compressed = false
      if (this.config.compressionLevel > 0) {
        const compressedPath = `${backupPath}.gz`
        await this.compressFile(currentPath, compressedPath)
        if (currentPath !== dbPath) fs.unlinkSync(currentPath) // Remove uncompressed copy
        currentPath = compressedPath
        compressed = true
      }

      // Step 3: Encrypt if enabled
      let encrypted = false
      if (this.config.encrypt) {
        const encryptedPath = `${backupPath}.enc`
        this.encryptFile(currentPath, encryptedPath)
        if (currentPath !== dbPath) fs.unlinkSync(currentPath) // Remove unencrypted copy
        currentPath = encryptedPath
        encrypted = true
      }

      // Step 4: Calculate final file size and checksum
      const stats = fs.statSync(currentPath)
      const checksum = this.calculateFileChecksum(currentPath)

      // Step 5: Create metadata
      const metadata: BackupMetadata = {
        id: backupId,
        timestamp,
        dbPath: currentPath,
        size: stats.size,
        compressed,
        encrypted,
        checksum,
        version: '1.0',
        description
      }

      // Step 6: Update metadata and cleanup old backups
      const allMetadata = this.loadBackupMetadata()
      allMetadata.push(metadata)
      allMetadata.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

      // Remove old backups if exceed maxBackups limit
      if (allMetadata.length > this.config.maxBackups) {
        const oldBackups = allMetadata.splice(this.config.maxBackups)
        for (const oldBackup of oldBackups) {
          try {
            if (fs.existsSync(oldBackup.dbPath)) {
              fs.unlinkSync(oldBackup.dbPath)
            }
          } catch (error) {
            console.error(`Failed to remove old backup ${oldBackup.id}:`, error)
          }
        }
      }

      this.saveBackupMetadata(allMetadata)

      console.log(`Backup created successfully: ${backupId}`)
      console.log(`Backup size: ${(metadata.size / 1024 / 1024).toFixed(2)} MB`)
      console.log(`Compressed: ${compressed}, Encrypted: ${encrypted}`)

      return metadata
    } catch (error) {
      console.error('Backup creation failed:', error)
      throw new Error(`Backup creation failed: ${error}`)
    }
  }

  /**
   * Restores a database from backup
   */
  public async restoreBackup(options: RestoreOptions): Promise<void> {
    console.log(`Starting database restore: ${options.backupId}`)

    try {
      const metadata = this.getBackupMetadata(options.backupId)
      if (!metadata) {
        throw new Error(`Backup not found: ${options.backupId}`)
      }

      if (!fs.existsSync(metadata.dbPath)) {
        throw new Error(`Backup file not found: ${metadata.dbPath}`)
      }

      // Verify checksum if requested
      if (options.validateChecksum) {
        const currentChecksum = this.calculateFileChecksum(metadata.dbPath)
        if (currentChecksum !== metadata.checksum) {
          throw new Error('Backup file checksum validation failed')
        }
      }

      // Create backup of current database if requested
      if (options.createDbBackup) {
        await this.createBackup(`Pre-restore backup - ${new Date().toISOString()}`)
      }

      const targetPath = options.targetPath || this.getDbFilePath()
      let currentPath = metadata.dbPath

      // Create temporary file for restoration process
      const tempDir = path.join(this.config.backupDir, 'temp')
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
      }

      const tempPath = path.join(tempDir, `restore-${Date.now()}.db`)

      // Step 1: Decrypt if needed
      if (metadata.encrypted) {
        const decryptedPath = path.join(tempDir, `decrypted-${Date.now()}.db`)
        this.decryptFile(currentPath, decryptedPath)
        currentPath = decryptedPath
      }

      // Step 2: Decompress if needed
      if (metadata.compressed) {
        const decompressedPath = path.join(tempDir, `decompressed-${Date.now()}.db`)
        await this.decompressFile(currentPath, decompressedPath)
        if (currentPath !== metadata.dbPath) fs.unlinkSync(currentPath)
        currentPath = decompressedPath
      }

      // Close current database connection
      dbManager.close()

      // Step 3: Replace database file
      if (fs.existsSync(targetPath)) {
        const backupCurrentPath = `${targetPath}.restore-backup-${Date.now()}`
        fs.renameSync(targetPath, backupCurrentPath)
        console.log(`Current database backed up to: ${backupCurrentPath}`)
      }

      fs.copyFileSync(currentPath, targetPath)

      // Step 4: Clean up temporary files
      if (currentPath !== metadata.dbPath && fs.existsSync(currentPath)) {
        fs.unlinkSync(currentPath)
      }

      // Step 5: Reinitialize database
      dbManager.initialize()

      console.log(`Database restored successfully from backup: ${options.backupId}`)
    } catch (error) {
      console.error('Database restore failed:', error)
      throw new Error(`Database restore failed: ${error}`)
    }
  }

  /**
   * Lists all available backups
   */
  public listBackups(): BackupMetadata[] {
    return this.loadBackupMetadata()
  }

  /**
   * Gets metadata for a specific backup
   */
  public getBackupMetadata(backupId: string): BackupMetadata | null {
    const metadata = this.loadBackupMetadata()
    return metadata.find(item => item.id === backupId) || null
  }

  /**
   * Deletes a specific backup
   */
  public deleteBackup(backupId: string): boolean {
    try {
      const metadata = this.loadBackupMetadata()
      const backupIndex = metadata.findIndex(item => item.id === backupId)

      if (backupIndex === -1) {
        console.warn(`Backup not found: ${backupId}`)
        return false
      }

      const backup = metadata[backupIndex]

      // Remove backup file
      if (fs.existsSync(backup.dbPath)) {
        fs.unlinkSync(backup.dbPath)
      }

      // Update metadata
      metadata.splice(backupIndex, 1)
      this.saveBackupMetadata(metadata)

      console.log(`Backup deleted: ${backupId}`)
      return true
    } catch (error) {
      console.error(`Failed to delete backup ${backupId}:`, error)
      return false
    }
  }

  /**
   * Validates the integrity of a backup
   */
  public validateBackup(backupId: string): boolean {
    try {
      const metadata = this.getBackupMetadata(backupId)
      if (!metadata) {
        console.error(`Backup not found: ${backupId}`)
        return false
      }

      if (!fs.existsSync(metadata.dbPath)) {
        console.error(`Backup file not found: ${metadata.dbPath}`)
        return false
      }

      const currentChecksum = this.calculateFileChecksum(metadata.dbPath)
      if (currentChecksum !== metadata.checksum) {
        console.error(`Checksum mismatch for backup ${backupId}`)
        return false
      }

      console.log(`Backup validation successful: ${backupId}`)
      return true
    } catch (error) {
      console.error(`Backup validation failed for ${backupId}:`, error)
      return false
    }
  }

  /**
   * Gets database file path from environment or database manager
   */
  private getDbFilePath(): string {
    const dbUrl = env.DATABASE_URL

    // Parse SQLite URL to get file path
    if (dbUrl.startsWith('sqlite:///')) {
      return path.resolve(dbUrl.substring(10))
    } else if (dbUrl.startsWith('sqlite://')) {
      return path.resolve(dbUrl.substring(9))
    } else {
      return path.resolve(dbUrl)
    }
  }

  /**
   * Gets backup statistics
   */
  public getBackupStats(): {
    totalBackups: number
    totalSize: number
    oldestBackup?: Date
    newestBackup?: Date
    averageSize: number
  } {
    const metadata = this.loadBackupMetadata()

    if (metadata.length === 0) {
      return { totalBackups: 0, totalSize: 0, averageSize: 0 }
    }

    const totalSize = metadata.reduce((sum, backup) => sum + backup.size, 0)
    const timestamps = metadata.map(backup => backup.timestamp).sort()

    return {
      totalBackups: metadata.length,
      totalSize,
      oldestBackup: timestamps[0],
      newestBackup: timestamps[timestamps.length - 1],
      averageSize: totalSize / metadata.length
    }
  }

  /**
   * Cleans up old backups based on retention policy
   */
  public cleanupOldBackups(): number {
    try {
      const metadata = this.loadBackupMetadata()
      const currentCount = metadata.length

      if (currentCount <= this.config.maxBackups) {
        return 0
      }

      metadata.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      const toRemove = metadata.splice(this.config.maxBackups)

      let removedCount = 0
      for (const backup of toRemove) {
        if (this.deleteBackup(backup.id)) {
          removedCount++
        }
      }

      console.log(`Cleaned up ${removedCount} old backups`)
      return removedCount
    } catch (error) {
      console.error('Backup cleanup failed:', error)
      return 0
    }
  }
}

// Export singleton instance with default configuration
export const backupManager = new DatabaseBackup()

// Export commonly used functions
export const createBackup = (description?: string) => backupManager.createBackup(description)
export const restoreBackup = (options: RestoreOptions) => backupManager.restoreBackup(options)
export const listBackups = () => backupManager.listBackups()
export const deleteBackup = (backupId: string) => backupManager.deleteBackup(backupId)
export const validateBackup = (backupId: string) => backupManager.validateBackup(backupId)