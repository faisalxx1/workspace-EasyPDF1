import { PrismaClient } from '@prisma/client'
import { mkdirSync } from 'fs'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Ensure database directory exists synchronously
function ensureDbDirSync() {
  const dbPath = process.env.DATABASE_URL?.replace('file:', '') || '/tmp/db/custom.db'
  const dbDir = path.dirname(dbPath)
  
  // Try to create directory synchronously
  try {
    mkdirSync(dbDir, { recursive: true })
    console.log('Database directory created/verified:', dbDir)
  } catch (error) {
    // Directory already exists or other error
    console.log('Database directory check:', error)
  }
}

// Ensure database directory exists before creating client
ensureDbDirSync()

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db