import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'

export class SecurityManager {
  private algorithm = 'aes-256-gcm'
  private key: Buffer
  private uploadDir: string
  private outputDir: string

  constructor() {
    // In production, this should come from environment variables
    this.key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-secret-key', 'salt', 32)
    this.uploadDir = path.join(process.cwd(), 'uploads')
    this.outputDir = path.join(process.cwd(), 'outputs')
  }

  /**
   * Encrypt file data
   */
  encryptFileData(data: Buffer): { encryptedData: Buffer; iv: Buffer; authTag: Buffer } {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(this.algorithm, this.key)
    cipher.setAAD(Buffer.from('additional-data')) // Additional authenticated data
    
    const encryptedData = Buffer.concat([
      cipher.update(data),
      cipher.final()
    ])
    
    const authTag = cipher.getAuthTag()
    
    return { encryptedData, iv, authTag }
  }

  /**
   * Decrypt file data
   */
  decryptFileData(encryptedData: Buffer, iv: Buffer, authTag: Buffer): Buffer {
    const decipher = crypto.createDecipher(this.algorithm, this.key)
    decipher.setAAD(Buffer.from('additional-data'))
    decipher.setAuthTag(authTag)
    
    return Buffer.concat([
      decipher.update(encryptedData),
      decipher.final()
    ])
  }

  /**
   * Encrypt and save file
   */
  async encryptAndSaveFile(data: Buffer, filename: string): Promise<{
    filePath: string
    iv: string
    authTag: string
  }> {
    const { encryptedData, iv, authTag } = this.encryptFileData(data)
    
    // Ensure directory exists
    await fs.mkdir(this.uploadDir, { recursive: true })
    
    const encryptedFilename = `encrypted_${Date.now()}_${filename}`
    const filePath = path.join(this.uploadDir, encryptedFilename)
    
    await fs.writeFile(filePath, encryptedData)
    
    return {
      filePath,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    }
  }

  /**
   * Read and decrypt file
   */
  async readAndDecryptFile(filePath: string, iv: string, authTag: string): Promise<Buffer> {
    const encryptedData = await fs.readFile(filePath)
    const ivBuffer = Buffer.from(iv, 'hex')
    const authTagBuffer = Buffer.from(authTag, 'hex')
    
    return this.decryptFileData(encryptedData, ivBuffer, authTagBuffer)
  }

  /**
   * Generate secure filename
   */
  generateSecureFilename(originalName: string): string {
    const timestamp = Date.now()
    const random = crypto.randomBytes(8).toString('hex')
    const extension = path.extname(originalName)
    const sanitizedName = path.basename(originalName, extension)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase()
    
    return `${timestamp}_${random}_${sanitizedName}${extension}`
  }

  /**
   * Validate file type
   */
  validateFileType(file: File, allowedTypes: string[] = ['application/pdf']): boolean {
    return allowedTypes.includes(file.type)
  }

  /**
   * Sanitize user input
   */
  sanitizeInput(input: string): string {
    // Remove potentially dangerous characters
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim()
  }

  /**
   * Generate CSRF token
   */
  generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  /**
   * Validate CSRF token
   */
  validateCSRFToken(token: string, sessionToken: string): boolean {
    return crypto.timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(sessionToken, 'hex')
    )
  }

  /**
   * Hash password
   */
  hashPassword(password: string): string {
    return crypto
      .createHash('sha256')
      .update(password + process.env.PASSWORD_SALT || 'default-salt')
      .digest('hex')
  }

  /**
   * Clean up old files
   */
  async cleanupOldFiles(maxAge: number = 3600000): Promise<void> {
    const now = Date.now()
    const directories = [this.uploadDir, this.outputDir]

    for (const dir of directories) {
      try {
        const files = await fs.readdir(dir)
        
        for (const file of files) {
          const filePath = path.join(dir, file)
          const stats = await fs.stat(filePath)
          
          if (now - stats.mtime.getTime() > maxAge) {
            await fs.unlink(filePath)
            console.log(`Cleaned up old file: ${filePath}`)
          }
        }
      } catch (error) {
        console.error(`Error cleaning up directory ${dir}:`, error)
      }
    }
  }

  /**
   * Secure file deletion
   */
  async secureDeleteFile(filePath: string): Promise<void> {
    try {
      // Overwrite the file with random data multiple times
      const stats = await fs.stat(filePath)
      const fileSize = stats.size
      
      for (let i = 0; i < 3; i++) {
        const randomData = crypto.randomBytes(fileSize)
        await fs.writeFile(filePath, randomData)
      }
      
      // Finally, delete the file
      await fs.unlink(filePath)
      console.log(`Securely deleted file: ${filePath}`)
    } catch (error) {
      console.error(`Error securely deleting file ${filePath}:`, error)
      throw error
    }
  }

  /**
   * Rate limiting check
   */
  checkRateLimit(ip: string, action: string, limit: number = 100, windowMs: number = 3600000): boolean {
    // This is a simple in-memory rate limiter
    // In production, use Redis or similar
    const key = `${ip}:${action}`
    const now = Date.now()
    const windowStart = now - windowMs
    
    // Store rate limit data in memory (not persistent)
    if (!global.rateLimits) {
      global.rateLimits = new Map()
    }
    
    const requests = global.rateLimits.get(key) || []
    const recentRequests = requests.filter(time => time > windowStart)
    
    if (recentRequests.length >= limit) {
      return false // Rate limited
    }
    
    recentRequests.push(now)
    global.rateLimits.set(key, recentRequests)
    
    return true // Allowed
  }

  /**
   * Validate file size
   */
  validateFileSize(file: File, maxSize: number = 50 * 1024 * 1024): boolean {
    return file.size <= maxSize
  }

  /**
   * Generate secure download token
   */
  generateDownloadToken(filePath: string, userId?: string): string {
    const payload = {
      filePath,
      userId,
      expires: Date.now() + 3600000, // 1 hour expiry
      nonce: crypto.randomBytes(16).toString('hex')
    }
    
    return crypto
      .createHmac('sha256', this.key)
      .update(JSON.stringify(payload))
      .digest('hex')
  }

  /**
   * Validate download token
   */
  validateDownloadToken(token: string, filePath: string, userId?: string): boolean {
    const payload = {
      filePath,
      userId,
      expires: Date.now() + 3600000,
      nonce: 'placeholder' // In real implementation, store nonce
    }
    
    const expectedToken = crypto
      .createHmac('sha256', this.key)
      .update(JSON.stringify(payload))
      .digest('hex')
    
    return crypto.timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(expectedToken, 'hex')
    )
  }
}

// Export singleton instance
export const securityManager = new SecurityManager()

// Start automatic cleanup
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    securityManager.cleanupOldFiles()
  }, 600000) // Clean up every 10 minutes
}