import { NextRequest, NextResponse } from 'next/server'
import { pdfProcessor } from '@/lib/pdf-utils'
import { db } from '@/lib/db'
import { PDFFile, ProcessingJob, ProcessingHistory } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const { fileIds, options = {} } = await request.json()
    
    if (!fileIds || !Array.isArray(fileIds) || fileIds.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 files are required for merging' },
        { status: 400 }
      )
    }

    // Create processing job
    const processingJob = await db.processingJob.create({
      data: {
        fileIds: JSON.stringify(fileIds),
        operation: 'merge',
        status: 'processing',
        parameters: JSON.stringify(options),
        userId: request.headers.get('user-id') || null
      }
    })

    try {
      // Get file paths from database
      const files = await db.pDFFile.findMany({
        where: {
          id: {
            in: fileIds
          }
        }
      })

      if (files.length !== fileIds.length) {
        throw new Error('Some files not found')
      }

      const filePaths = files.map(file => file.filePath)
      
      // Process PDF merge
      const result = await pdfProcessor.mergePDFs(filePaths, options)

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
          operation: 'merge',
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
    console.error('Merge PDF error:', error)
    return NextResponse.json(
      { error: 'Failed to merge PDFs' },
      { status: 500 }
    )
  }
}