import { NextRequest, NextResponse } from 'next/server'
import { pdfProcessor } from '@/lib/pdf-utils'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth-config'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    const { fileIds, operation, options = {} } = await request.json()
    
    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json(
        { error: 'File IDs are required' },
        { status: 400 }
      )
    }

    if (!operation) {
      return NextResponse.json(
        { error: 'Operation is required' },
        { status: 400 }
      )
    }

    // Check if user has premium subscription (simplified check)
    const isPremium = session?.user?.email?.includes('premium') || false // In real app, check subscription status
    
    if (!isPremium) {
      return NextResponse.json(
        { error: 'Batch processing is a premium feature. Please upgrade your plan.' },
        { status: 403 }
      )
    }

    // Validate operation
    const validOperations = ['compress', 'rotate', 'watermark', 'unlock']
    if (!validOperations.includes(operation)) {
      return NextResponse.json(
        { error: `Invalid operation. Valid operations: ${validOperations.join(', ')}` },
        { status: 400 }
      )
    }

    // Create processing job
    const processingJob = await db.processingJob.create({
      data: {
        fileIds: JSON.stringify(fileIds),
        operation: `batch_${operation}`,
        status: 'processing',
        parameters: JSON.stringify({ ...options, fileCount: fileIds.length }),
        userId: session?.user?.id || null
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

      // Process batch operation
      const results = await processBatchOperation(files, operation, options)

      // Calculate success rate
      const successfulResults = results.filter(r => r.success)
      const successRate = (successfulResults.length / results.length) * 100

      // Update processing job
      await db.processingJob.update({
        where: { id: processingJob.id },
        data: {
          status: successRate === 100 ? 'completed' : 'partial',
          progress: 100,
          error: successRate < 100 ? `${results.length - successfulResults.length} files failed` : null,
          completedAt: new Date()
        }
      })

      // Create processing history entries for each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const result = results[i]

        await db.processingHistory.create({
          data: {
            userId: session?.user?.id || null,
            jobId: processingJob.id,
            fileId: file.id,
            operation: `batch_${operation}`,
            status: result.success ? 'completed' : 'failed',
            parameters: JSON.stringify(options),
            result: result.success ? JSON.stringify({ 
              filePath: result.filePath,
              fileSize: result.fileSize,
              batchIndex: i + 1,
              totalFiles: files.length
            }) : null,
            error: result.error,
            ipAddress: request.headers.get('x-forwarded-for') || request.ip || null,
            userAgent: request.headers.get('user-agent') || null
          }
        })
      }

      return NextResponse.json({
        success: true,
        jobId: processingJob.id,
        results: results.map((result, index) => ({
          fileId: fileIds[index],
          success: result.success,
          filePath: result.filePath,
          fileSize: result.fileSize,
          error: result.error,
          downloadUrl: result.success ? `/api/download?path=${encodeURIComponent(result.filePath)}` : null
        })),
        summary: {
          totalFiles: files.length,
          successfulFiles: successfulResults.length,
          failedFiles: results.length - successfulResults.length,
          successRate: successRate.toFixed(2) + '%'
        }
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
    console.error('Batch processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process batch operation' },
      { status: 500 }
    )
  }
}

async function processBatchOperation(files: any[], operation: string, options: any) {
  const results = []

  for (const file of files) {
    try {
      let result

      switch (operation) {
        case 'compress':
          result = await pdfProcessor.compressPDF(file.filePath, options)
          break
        case 'rotate':
          result = await pdfProcessor.rotatePDF(file.filePath, options)
          break
        case 'watermark':
          result = await pdfProcessor.addWatermark(file.filePath, options)
          break
        case 'unlock':
          result = await pdfProcessor.unlockPDF(file.filePath, options)
          break
        default:
          throw new Error(`Unsupported operation: ${operation}`)
      }

      results.push(result)
    } catch (error) {
      results.push({
        success: false,
        error: error instanceof Error ? error.message : 'Processing failed'
      })
    }
  }

  return results
}