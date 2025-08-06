import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { securityManager } from '@/lib/security'
import { withSecurity } from '@/lib/security-middleware'

async function downloadHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')
    const token = searchParams.get('token')
    
    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      )
    }

    // Security check - ensure file is within allowed directories
    const allowedDirs = [
      path.join(process.cwd(), 'outputs'),
      path.join(process.cwd(), 'uploads')
    ]

    const resolvedPath = path.resolve(filePath)
    const isAllowed = allowedDirs.some(dir => 
      resolvedPath.startsWith(path.resolve(dir))
    )

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Check if file exists
    if (!existsSync(resolvedPath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Validate download token if provided
    if (token) {
      const isValid = securityManager.validateDownloadToken(token, filePath)
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid or expired download token' },
          { status: 403 }
        )
      }
    }

    // Read file
    const fileBuffer = await readFile(resolvedPath)
    const fileName = path.basename(resolvedPath)

    // Determine content type
    const ext = path.extname(fileName).toLowerCase()
    let contentType = 'application/octet-stream'
    
    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf'
        break
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg'
        break
      case '.png':
        contentType = 'image/png'
        break
      case '.txt':
        contentType = 'text/plain'
        break
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        break
    }

    // Generate secure download token for future requests
    const downloadToken = securityManager.generateDownloadToken(filePath)

    // Return file with security headers
    const response = new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Download-Token': downloadToken
      }
    })

    return response

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    )
  }
}

export const GET = withSecurity(downloadHandler, {
  rateLimit: {
    limit: 50,
    windowMs: 300000 // 5 minutes
  }
})