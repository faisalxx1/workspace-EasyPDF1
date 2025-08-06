import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb } from 'pdf-lib'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth-config'
import * as fs from 'fs'
import * as path from 'path'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    const { fileId, signatureData, options = {} } = await request.json()
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      )
    }

    if (!signatureData) {
      return NextResponse.json(
        { error: 'Signature data is required' },
        { status: 400 }
      )
    }

    // Check if user has premium subscription (simplified check)
    const isPremium = session?.user?.email?.includes('premium') || false // In real app, check subscription status
    
    if (!isPremium) {
      return NextResponse.json(
        { error: 'E-Signature is a premium feature. Please upgrade your plan.' },
        { status: 403 }
      )
    }

    // Create processing job
    const processingJob = await db.processingJob.create({
      data: {
        fileIds: JSON.stringify([fileId]),
        operation: 'esign',
        status: 'processing',
        parameters: JSON.stringify({ ...options, hasSignature: true }),
        userId: session?.user?.id || null
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

      // Process e-signature
      const result = await addESignature(file.filePath, signatureData, options)

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
          userId: session?.user?.id || null,
          jobId: processingJob.id,
          fileId: fileId,
          operation: 'esign',
          status: result.success ? 'completed' : 'failed',
          parameters: JSON.stringify({ ...options, hasSignature: true }),
          result: result.success ? JSON.stringify({ 
            filePath: result.filePath,
            fileSize: result.fileSize,
            signatureInfo: {
              signerName: session?.user?.name || 'Unknown',
              signedAt: new Date().toISOString(),
              position: options.position || 'bottom-right'
            }
          }) : null,
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
        signatureInfo: {
          signerName: session?.user?.name || 'Unknown',
          signedAt: new Date().toISOString(),
          position: options.position || 'bottom-right'
        },
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
    console.error('E-Sign PDF error:', error)
    return NextResponse.json(
      { error: 'Failed to add e-signature to PDF' },
      { status: 500 }
    )
  }
}

async function addESignature(filePath: string, signatureData: string, options: any) {
  try {
    // Read the existing PDF
    const existingPdfBytes = fs.readFileSync(filePath)
    const pdfDoc = await PDFDocument.load(existingPdfBytes)

    // Get the first page (or specified page)
    const pages = pdfDoc.getPages()
    const firstPage = pages[0] || await pdfDoc.addPage()

    // For demo purposes, we'll add a text signature
    // In a real application, you would:
    // 1. Convert signatureData (base64 image) to actual image
    // 2. Embed the image in the PDF
    // 3. Position it correctly

    const { width, height } = firstPage.getSize()
    
    // Calculate position based on options
    let x = width - 200, y = 50 // Default bottom-right
    
    switch (options.position) {
      case 'top-left':
        x = 50
        y = height - 50
        break
      case 'top-right':
        x = width - 200
        y = height - 50
        break
      case 'bottom-left':
        x = 50
        y = 50
        break
      case 'center':
        x = width / 2 - 100
        y = height / 2
        break
      default: // bottom-right
        break
    }

    // Add signature text (in real app, this would be the signature image)
    firstPage.drawText('Digitally signed by EasyPDF Tools', {
      x: x,
      y: y,
      size: 12,
      color: rgb(0, 0, 0),
    })

    firstPage.drawText(`Signed on: ${new Date().toLocaleDateString()}`, {
      x: x,
      y: y - 20,
      size: 10,
      color: rgb(0.5, 0.5, 0.5),
    })

    // Save the modified PDF
    const pdfBytes = await pdfDoc.save()
    
    // Create output file
    const outputFileName = `signed_${Date.now()}.pdf`
    const outputPath = path.join(process.cwd(), 'outputs', outputFileName)
    
    if (!fs.existsSync(path.join(process.cwd(), 'outputs'))) {
      fs.mkdirSync(path.join(process.cwd(), 'outputs'), { recursive: true })
    }
    
    fs.writeFileSync(outputPath, pdfBytes)

    return {
      success: true,
      filePath: outputPath,
      fileSize: pdfBytes.length
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'E-signature processing failed'
    }
  }
}