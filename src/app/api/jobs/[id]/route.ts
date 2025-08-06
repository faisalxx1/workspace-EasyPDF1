import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id

    const job = await db.processingJob.findUnique({
      where: { id: jobId },
      include: {
        resultFile: true
      }
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Parse result if it exists
    let result = null
    if (job.resultFileId) {
      result = {
        filePath: job.resultFile.filePath,
        fileSize: job.resultFile.fileSize
      }
    } else if (job.status === 'completed') {
      // Try to parse result from history
      const history = await db.processingHistory.findFirst({
        where: { jobId: jobId, status: 'completed' },
        orderBy: { createdAt: 'desc' }
      })
      
      if (history?.result) {
        try {
          result = JSON.parse(history.result)
        } catch {
          // Ignore parse errors
        }
      }
    }

    return NextResponse.json({
      job: {
        id: job.id,
        operation: job.operation,
        status: job.status,
        progress: job.progress,
        error: job.error,
        startedAt: job.startedAt?.toISOString(),
        completedAt: job.completedAt?.toISOString(),
        result: result
      }
    })

  } catch (error) {
    console.error('Failed to fetch job status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job status' },
      { status: 500 }
    )
  }
}