import { PrismaClient } from '@prisma/client'
import { mkdirSync, existsSync } from 'fs'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Ensure database directory exists synchronously
function ensureDbDirSync() {
  const dbPath = process.env.DATABASE_URL?.replace('file:', '') || '/tmp/custom.db'
  const dbDir = path.dirname(dbPath)
  
  // Try to create directory synchronously
  try {
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true })
      console.log('Database directory created:', dbDir)
    } else {
      console.log('Database directory exists:', dbDir)
    }
  } catch (error) {
    console.error('Error creating database directory:', error)
    // Fallback to /tmp directory
    const fallbackDir = '/tmp'
    if (!existsSync(fallbackDir)) {
      mkdirSync(fallbackDir, { recursive: true })
    }
    console.log('Using fallback database directory:', fallbackDir)
  }
}

// Ensure database directory exists before creating client
ensureDbDirSync()

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'file:/tmp/custom.db'
      }
    }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Wrapper function to ensure database is connected before operations
export async function withDb<T>(operation: () => Promise<T>): Promise<T> {
  try {
    // Ensure database is connected
    await db.$connect()
    console.log('Database connected for operation')
    return await operation()
  } catch (error) {
    console.error('Database operation error:', error)
    
    // Try to reconnect and retry operation once
    try {
      console.log('Attempting to reconnect to database...')
      await db.$disconnect()
      await db.$connect()
      console.log('Database reconnected, retrying operation...')
      return await operation()
    } catch (retryError) {
      console.error('Database retry failed:', retryError)
      throw new Error(`Database operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

// Initialize database connection
async function initializeDatabase() {
  try {
    await db.$connect()
    console.log('Database connected successfully')
  } catch (error) {
    console.error('Database connection error:', error)
    // Try to reconnect with fallback URL
    try {
      const fallbackDb = new PrismaClient({
        log: ['query'],
        datasources: {
          db: {
            url: 'file:/tmp/custom.db'
          }
        }
      })
      await fallbackDb.$connect()
      console.log('Database connected with fallback URL')
      return fallbackDb
    } catch (fallbackError) {
      console.error('Fallback database connection failed:', fallbackError)
      throw error
    }
  }
}

// Initialize database on module load
initializeDatabase().catch(console.error)