import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

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

    const uploadedFiles = []

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
      
      uploadedFiles.push({
        originalName: file.name,
        fileName: fileName,
        filePath: filePath,
        size: file.size,
        type: file.type
      })
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