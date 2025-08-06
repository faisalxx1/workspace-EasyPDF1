import { PrismaClient } from '@prisma/client'
import { mkdir } from 'fs/promises'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Ensure database directory exists
async function ensureDbDir() {
  const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './db/custom.db'
  const dbDir = path.dirname(dbPath)
  
  try {
    await mkdir(dbDir, { recursive: true })
  } catch (error) {
    // Directory already exists or other error
    console.log('Database directory check:', error)
  }
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

// Initialize database directory
ensureDbDir().catch(console.error)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db