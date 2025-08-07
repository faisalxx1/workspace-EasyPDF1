import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const files: File[] = data.getAll('files') as unknown as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files received' },
        { status: 400 }
      )
    }

    const uploadDir = path.join('/tmp', 'uploads')
    
    // Ensure upload directory exists
    const { mkdir } = await import('fs/promises')
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Directory already exists
    }

    const uploadedFiles: { id: string; originalName: string; fileName: string; filePath: string; size: number; type: string; }[] = []

    for (const file of files) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        return NextResponse.json(
          { error: 'Only PDF files are allowed' },
          { status: 400 }
        )
      }

      // Validate file size (50MB limit)
      const maxSize = 50 * 1024 * 1024 // 50MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: 'File size exceeds 50MB limit' },
          { status: 400 }
        )
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Generate unique filename
      const fileName = `${uuidv4()}_${file.name}`
      const filePath = path.join(uploadDir, fileName)
      
      // Save file
      await writeFile(filePath, buffer)
      
      // Save file info to database
      try {
        const dbFile = await db.pDFFile.create({
          data: {
            originalName: file.name,
            fileName: fileName,
            filePath: filePath,
            fileSize: file.size,
            mimeType: file.type,
            status: 'uploaded',
            userId: request.headers.get('user-id') || null
          }
        })
        
        uploadedFiles.push({
          id: dbFile.id,
          originalName: file.name,
          fileName: fileName,
          filePath: filePath,
          size: file.size,
          type: file.type
        })
      } catch (dbError) {
        console.error('Database error:', dbError)
        // If database fails, still return the file info but without database ID
        uploadedFiles.push({
          id: fileName, // Use fileName as fallback ID
          originalName: file.name,
          fileName: fileName,
          filePath: filePath,
          size: file.size,
          type: file.type
        })
      }
    }

    return NextResponse.json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed: ' + (error as Error).message },
      { status: 500 }
    )
  }
}