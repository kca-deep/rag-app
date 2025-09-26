import * as crypto from 'crypto'
import { env } from './env'

export interface EncryptionResult {
  encrypted: string
  iv: string
}

export class CryptoUtils {
  private static readonly ALGORITHM = 'aes-256-gcm'
  private static readonly KEY_LENGTH = 32 // 256 bits
  private static readonly IV_LENGTH = 16  // 128 bits
  private static readonly TAG_LENGTH = 16 // 128 bits
  private static readonly SALT_LENGTH = 32 // 256 bits

  private static encryptionKey: Buffer | null = null

  private static getEncryptionKey(): Buffer {
    if (!this.encryptionKey) {
      try {
        // Convert hex string to buffer
        this.encryptionKey = Buffer.from(env.ENCRYPTION_KEY, 'hex')

        if (this.encryptionKey.length !== this.KEY_LENGTH) {
          throw new Error(`Invalid encryption key length: expected ${this.KEY_LENGTH} bytes, got ${this.encryptionKey.length}`)
        }
      } catch (error) {
        throw new Error(`Failed to initialize encryption key: ${error}`)
      }
    }
    return this.encryptionKey
  }

  /**
   * Encrypts sensitive data using AES-256-GCM
   */
  public static encrypt(plaintext: string): EncryptionResult {
    try {
      const key = this.getEncryptionKey()
      const iv = crypto.randomBytes(this.IV_LENGTH)

      const cipher = crypto.createCipher(this.ALGORITHM, key)
      cipher.setAutoPadding(true)

      let encrypted = cipher.update(plaintext, 'utf8', 'hex')
      encrypted += cipher.final('hex')

      // Get the authentication tag
      const tag = (cipher as any).getAuthTag()

      // Combine encrypted data with tag
      const encryptedWithTag = encrypted + tag.toString('hex')

      return {
        encrypted: encryptedWithTag,
        iv: iv.toString('hex')
      }
    } catch (error) {
      throw new Error(`Encryption failed: ${error}`)
    }
  }

  /**
   * Decrypts data encrypted with encrypt() method
   */
  public static decrypt(encryptedData: EncryptionResult): string {
    try {
      const key = this.getEncryptionKey()
      const iv = Buffer.from(encryptedData.iv, 'hex')

      // Extract the authentication tag (last 16 bytes as hex = 32 hex characters)
      const encryptedHex = encryptedData.encrypted
      const encrypted = encryptedHex.slice(0, -32)
      const tag = Buffer.from(encryptedHex.slice(-32), 'hex')

      const decipher = crypto.createDecipher(this.ALGORITHM, key)
      ;(decipher as any).setAuthTag(tag)

      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')

      return decrypted
    } catch (error) {
      throw new Error(`Decryption failed: ${error}`)
    }
  }

  /**
   * Hashes API keys with salt for secure storage
   */
  public static hashApiKey(apiKey: string): string {
    try {
      const salt = env.API_KEY_SALT
      return crypto.createHash('sha256')
        .update(apiKey + salt)
        .digest('hex')
    } catch (error) {
      throw new Error(`API key hashing failed: ${error}`)
    }
  }

  /**
   * Generates a cryptographically secure random API key
   */
  public static generateApiKey(prefix: string = 'rag'): string {
    try {
      const randomBytes = crypto.randomBytes(32)
      const keyBody = randomBytes.toString('base64url') // URL-safe base64
      return `${prefix}_${keyBody}`
    } catch (error) {
      throw new Error(`API key generation failed: ${error}`)
    }
  }

  /**
   * Creates a secure hash of a password with salt
   */
  public static async hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
    return new Promise((resolve, reject) => {
      try {
        const actualSalt = salt || crypto.randomBytes(this.SALT_LENGTH).toString('hex')
        const iterations = 100000 // PBKDF2 iterations
        const keyLength = 64 // 512 bits

        crypto.pbkdf2(password, actualSalt, iterations, keyLength, 'sha256', (err, derivedKey) => {
          if (err) {
            reject(new Error(`Password hashing failed: ${err}`))
            return
          }

          resolve({
            hash: derivedKey.toString('hex'),
            salt: actualSalt
          })
        })
      } catch (error) {
        reject(new Error(`Password hashing setup failed: ${error}`))
      }
    })
  }

  /**
   * Verifies a password against a hash
   */
  public static async verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    try {
      const result = await this.hashPassword(password, salt)
      return crypto.timingSafeEqual(
        Buffer.from(result.hash, 'hex'),
        Buffer.from(hash, 'hex')
      )
    } catch (error) {
      console.error('Password verification failed:', error)
      return false
    }
  }

  /**
   * Generates a secure JWT secret
   */
  public static generateJwtSecret(length: number = 64): string {
    try {
      return crypto.randomBytes(length).toString('base64url')
    } catch (error) {
      throw new Error(`JWT secret generation failed: ${error}`)
    }
  }

  /**
   * Creates a HMAC signature for data integrity
   */
  public static createSignature(data: string, secret?: string): string {
    try {
      const signingKey = secret || env.JWT_SECRET
      return crypto.createHmac('sha256', signingKey)
        .update(data)
        .digest('hex')
    } catch (error) {
      throw new Error(`Signature creation failed: ${error}`)
    }
  }

  /**
   * Verifies a HMAC signature
   */
  public static verifySignature(data: string, signature: string, secret?: string): boolean {
    try {
      const expectedSignature = this.createSignature(data, secret)
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      )
    } catch (error) {
      console.error('Signature verification failed:', error)
      return false
    }
  }

  /**
   * Generates a secure random token for various purposes
   */
  public static generateSecureToken(length: number = 32): string {
    try {
      return crypto.randomBytes(length).toString('hex')
    } catch (error) {
      throw new Error(`Secure token generation failed: ${error}`)
    }
  }

  /**
   * Derives a key from a password using PBKDF2
   */
  public static deriveKey(password: string, salt: string, iterations: number = 100000): Buffer {
    try {
      return crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256')
    } catch (error) {
      throw new Error(`Key derivation failed: ${error}`)
    }
  }

  /**
   * Sanitizes and validates encryption keys
   */
  public static validateEncryptionKey(key: string): boolean {
    try {
      // Check if it's a valid hex string of correct length
      if (!/^[0-9a-fA-F]{64}$/.test(key)) {
        return false
      }

      // Try to create a buffer from it
      const keyBuffer = Buffer.from(key, 'hex')
      return keyBuffer.length === this.KEY_LENGTH
    } catch {
      return false
    }
  }

  /**
   * Generates a new encryption key
   */
  public static generateEncryptionKey(): string {
    try {
      return crypto.randomBytes(this.KEY_LENGTH).toString('hex')
    } catch (error) {
      throw new Error(`Encryption key generation failed: ${error}`)
    }
  }

  /**
   * Securely wipes sensitive data from memory
   */
  public static wipeSensitiveData(data: Buffer): void {
    try {
      if (data && data.length > 0) {
        crypto.randomFillSync(data)
        data.fill(0)
      }
    } catch (error) {
      console.error('Failed to wipe sensitive data:', error)
    }
  }

  /**
   * Creates a fingerprint of data for integrity checking
   */
  public static createFingerprint(data: string | Buffer): string {
    try {
      return crypto.createHash('sha256')
        .update(data)
        .digest('hex')
    } catch (error) {
      throw new Error(`Fingerprint creation failed: ${error}`)
    }
  }
}

// Export commonly used functions
export const {
  encrypt,
  decrypt,
  hashApiKey,
  generateApiKey,
  hashPassword,
  verifyPassword,
  generateJwtSecret,
  createSignature,
  verifySignature,
  generateSecureToken,
  validateEncryptionKey,
  generateEncryptionKey,
  createFingerprint
} = CryptoUtils