import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { securityManager } from '@/lib/security'
import { withSecurity } from '@/lib/security-middleware'

async function uploadHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const data = await request.formData()
    const files: File[] = data.getAll('files') as unknown as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files received' },
        { status: 400 }
      )
    }

    const uploadDir = path.join(process.cwd(), 'uploads')
    
    // Ensure upload directory exists
    const { mkdir } = await import('fs/promises')
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Directory already exists
    }

    const uploadedFiles = []

    for (const file of files) {
      // Validate file type
      if (!securityManager.validateFileType(file)) {
        return NextResponse.json(
          { error: 'Only PDF files are allowed' },
          { status: 400 }
        )
      }

      // Validate file size (50MB limit)
      const maxSize = 50 * 1024 * 1024 // 50MB
      if (!securityManager.validateFileSize(file, maxSize)) {
        return NextResponse.json(
          { error: 'File size exceeds 50MB limit' },
          { status: 400 }
        )
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Generate secure filename
      const fileName = securityManager.generateSecureFilename(file.name)
      
      // Encrypt and save file
      const { filePath, iv, authTag } = await securityManager.encryptAndSaveFile(buffer, fileName)
      
      uploadedFiles.push({
        originalName: file.name,
        fileName: fileName,
        filePath: filePath,
        size: file.size,
        type: file.type,
        encrypted: true,
        iv: iv,
        authTag: authTag
      })
    }

    return NextResponse.json({
      message: 'Files uploaded and encrypted successfully',
      files: uploadedFiles
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}

export const POST = withSecurity(uploadHandler, {
  rateLimit: {
    limit: 10,
    windowMs: 60000 // 1 minute
  },
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedTypes: ['application/pdf']
})