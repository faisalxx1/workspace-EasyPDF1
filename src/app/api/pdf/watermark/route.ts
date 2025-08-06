import { NextRequest, NextResponse } from 'next/server'
import { pdfProcessor } from '@/lib/pdf-utils'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { fileId, options } = await request.json()
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      )
    }

    if (!options || !options.text) {
      return NextResponse.json(
        { error: 'Watermark text is required' },
        { status: 400 }
      )
    }

    // Create processing job
    const processingJob = await db.processingJob.create({
      data: {
        fileIds: JSON.stringify([fileId]),
        operation: 'watermark',
        status: 'processing',
        parameters: JSON.stringify(options),
        userId: request.headers.get('user-id') || null
      }
    })

    try {
      // Get file path from database
      const file = await db.pDFFile.findUnique({
        where: { id: fileId }
      })

      if (!file) {
        throw new Error('File not found')
      }

      // Process PDF watermarking
      const result = await pdfProcessor.addWatermark(file.filePath, options)

      // Update processing job
      await db.processingJob.update({
        where: { id: processingJob.id },
        data: {
          status: result.success ? 'completed' : 'failed',
          progress: 100,
          error: result.error,
          completedAt: new Date()
        }
      })

      // Create processing history
      await db.processingHistory.create({
        data: {
          userId: request.headers.get('user-id') || null,
          jobId: processingJob.id,
          fileId: fileId,
          operation: 'watermark',
          status: result.success ? 'completed' : 'failed',
          parameters: JSON.stringify(options),
          result: result.success ? JSON.stringify({ filePath: result.filePath, fileSize: result.fileSize }) : null,
          error: result.error,
          ipAddress: request.headers.get('x-forwarded-for') || request.ip || null,
          userAgent: request.headers.get('user-agent') || null
        }
      })

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        jobId: processingJob.id,
        filePath: result.filePath,
        fileSize: result.fileSize,
        downloadUrl: `/api/download?path=${encodeURIComponent(result.filePath)}`
      })

    } catch (error) {
      // Update processing job with error
      await db.processingJob.update({
        where: { id: processingJob.id },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date()
        }
      })

      throw error
    }

  } catch (error) {
    console.error('Watermark PDF error:', error)
    return NextResponse.json(
      { error: 'Failed to add watermark to PDF' },
      { status: 500 }
    )
  }
}