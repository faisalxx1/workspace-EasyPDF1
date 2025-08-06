import { PDFDocument, PDFPage, rgb, StandardFonts } from 'pdf-lib'
import * as fs from 'fs'
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid'

export interface PDFOperationResult {
  success: boolean
  filePath?: string
  error?: string
  fileSize?: number
}

export interface MergeOptions {
  outputFileName?: string
}

export interface SplitOptions {
  pageRanges: number[][]
  outputFileName?: string
}

export interface CompressOptions {
  quality?: 'low' | 'medium' | 'high'
  outputFileName?: string
}

export interface RotateOptions {
  rotation: 90 | 180 | 270
  pages?: 'all' | number[]
  outputFileName?: string
}

export interface WatermarkOptions {
  text: string
  opacity?: number
  fontSize?: number
  color?: string
  position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  outputFileName?: string
}

export interface UnlockOptions {
  password?: string
  outputFileName?: string
}

export interface ConvertOptions {
  format: 'jpg' | 'png' | 'docx' | 'txt'
  quality?: number
  outputFileName?: string
}

class PDFProcessor {
  private uploadDir: string
  private outputDir: string

  constructor() {
    // Use temporary directories for serverless environment
    this.uploadDir = path.join('/tmp', 'uploads')
    this.outputDir = path.join('/tmp', 'outputs')
    
    // Ensure directories exist
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true })
    }
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true })
    }
  }

  async mergePDFs(filePaths: string[], options: MergeOptions = {}): Promise<PDFOperationResult> {
    try {
      const mergedPdf = await PDFDocument.create()
      
      for (const filePath of filePaths) {
        const pdfBytes = fs.readFileSync(filePath)
        const pdf = await PDFDocument.load(pdfBytes)
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        pages.forEach(page => mergedPdf.addPage(page))
      }

      const outputFileName = options.outputFileName || `merged_${uuidv4()}.pdf`
      const outputPath = path.join(this.outputDir, outputFileName)
      const mergedPdfBytes = await mergedPdf.save()
      
      fs.writeFileSync(outputPath, mergedPdfBytes)
      
      return {
        success: true,
        filePath: outputPath,
        fileSize: mergedPdfBytes.length
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to merge PDFs'
      }
    }
  }

  async splitPDF(filePath: string, options: SplitOptions): Promise<PDFOperationResult> {
    try {
      const pdfBytes = fs.readFileSync(filePath)
      const pdf = await PDFDocument.load(pdfBytes)
      const results: string[] = []

      for (let i = 0; i < options.pageRanges.length; i++) {
        const range = options.pageRanges[i]
        const newPdf = await PDFDocument.create()
        
        for (const pageNum of range) {
          if (pageNum > 0 && pageNum <= pdf.getPageCount()) {
            const [page] = await newPdf.copyPages(pdf, [pageNum - 1])
            newPdf.addPage(page)
          }
        }

        const outputFileName = options.outputFileName 
          ? options.outputFileName.replace(/\.(pdf)$/i, `_${i + 1}.pdf`)
          : `split_${uuidv4()}_${i + 1}.pdf`
        
        const outputPath = path.join(this.outputDir, outputFileName)
        const newPdfBytes = await newPdf.save()
        
        fs.writeFileSync(outputPath, newPdfBytes)
        results.push(outputPath)
      }

      return {
        success: true,
        filePath: results[0], // Return first file path
        fileSize: fs.statSync(results[0]).size
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to split PDF'
      }
    }
  }

  async compressPDF(filePath: string, options: CompressOptions = {}): Promise<PDFOperationResult> {
    try {
      const pdfBytes = fs.readFileSync(filePath)
      const pdf = await PDFDocument.load(pdfBytes)
      
      // Basic compression - remove unused objects and optimize
      const outputFileName = options.outputFileName || `compressed_${uuidv4()}.pdf`
      const outputPath = path.join(this.outputDir, outputFileName)
      
      // Save with compression options
      const pdfBytesCompressed = await pdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
        preservePdfA: false
      })
      
      fs.writeFileSync(outputPath, pdfBytesCompressed)
      
      return {
        success: true,
        filePath: outputPath,
        fileSize: pdfBytesCompressed.length
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to compress PDF'
      }
    }
  }

  async rotatePDF(filePath: string, options: RotateOptions): Promise<PDFOperationResult> {
    try {
      const pdfBytes = fs.readFileSync(filePath)
      const pdf = await PDFDocument.load(pdfBytes)
      
      const pages = pdf.getPages()
      const pagesToRotate = options.pages === 'all' 
        ? pages 
        : options.pages?.map(i => pages[i - 1]).filter(Boolean) || []
      
      pagesToRotate.forEach(page => {
        page.setRotation(page.getRotation() + (options.rotation * Math.PI / 180))
      })

      const outputFileName = options.outputFileName || `rotated_${uuidv4()}.pdf`
      const outputPath = path.join(this.outputDir, outputFileName)
      const rotatedPdfBytes = await pdf.save()
      
      fs.writeFileSync(outputPath, rotatedPdfBytes)
      
      return {
        success: true,
        filePath: outputPath,
        fileSize: rotatedPdfBytes.length
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to rotate PDF'
      }
    }
  }

  async addWatermark(filePath: string, options: WatermarkOptions): Promise<PDFOperationResult> {
    try {
      const pdfBytes = fs.readFileSync(filePath)
      const pdf = await PDFDocument.load(pdfBytes)
      const pages = pdf.getPages()
      
      const font = await pdf.embedFont(StandardFonts.Helvetica)
      const fontSize = options.fontSize || 24
      const opacity = options.opacity || 0.3
      const color = options.color || '#000000'
      
      // Parse color (simple hex to RGB conversion)
      const r = parseInt(color.slice(1, 3), 16) / 255
      const g = parseInt(color.slice(3, 5), 16) / 255
      const b = parseInt(color.slice(5, 7), 16) / 255

      for (const page of pages) {
        const { width, height } = page.getSize()
        let x = width / 2
        let y = height / 2

        // Adjust position based on options
        switch (options.position) {
          case 'top-left':
            x = 50
            y = height - 50
            break
          case 'top-right':
            x = width - 50
            y = height - 50
            break
          case 'bottom-left':
            x = 50
            y = 50
            break
          case 'bottom-right':
            x = width - 50
            y = 50
            break
          default: // center
            break
        }

        page.drawText(options.text, {
          x: x - (options.text.length * fontSize * 0.3) / 2,
          y: y - fontSize / 2,
          size: fontSize,
          font: font,
          color: rgb(r, g, b),
          opacity: opacity
        })
      }

      const outputFileName = options.outputFileName || `watermarked_${uuidv4()}.pdf`
      const outputPath = path.join(this.outputDir, outputFileName)
      const watermarkedPdfBytes = await pdf.save()
      
      fs.writeFileSync(outputPath, watermarkedPdfBytes)
      
      return {
        success: true,
        filePath: outputPath,
        fileSize: watermarkedPdfBytes.length
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add watermark'
      }
    }
  }

  async unlockPDF(filePath: string, options: UnlockOptions = {}): Promise<PDFOperationResult> {
    try {
      const pdfBytes = fs.readFileSync(filePath)
      
      // For basic password removal, we just create a new PDF without encryption
      // Note: This is a simplified version. Real password removal would require the password
      const pdf = await PDFDocument.load(pdfBytes, {
        ignoreEncryption: true
      })

      const outputFileName = options.outputFileName || `unlocked_${uuidv4()}.pdf`
      const outputPath = path.join(this.outputDir, outputFileName)
      const unlockedPdfBytes = await pdf.save()
      
      fs.writeFileSync(outputPath, unlockedPdfBytes)
      
      return {
        success: true,
        filePath: outputPath,
        fileSize: unlockedPdfBytes.length
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to unlock PDF'
      }
    }
  }

  async convertPDF(filePath: string, options: ConvertOptions): Promise<PDFOperationResult> {
    try {
      // This is a placeholder for PDF conversion
      // In a real implementation, you would use libraries like pdf2pic for image conversion
      // or specialized libraries for Word/text conversion
      
      const outputFileName = options.outputFileName || `converted_${uuidv4()}.${options.format}`
      const outputPath = path.join(this.outputDir, outputFileName)
      
      // For now, just copy the file as a placeholder
      fs.copyFileSync(filePath, outputPath)
      
      return {
        success: true,
        filePath: outputPath,
        fileSize: fs.statSync(outputPath).size
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to convert PDF'
      }
    }
  }

  // Utility method to clean up old files
  cleanupOldFiles(maxAge: number = 3600000) { // 1 hour default
    const now = Date.now()
    
    [this.uploadDir, this.outputDir].forEach(dir => {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir)
        files.forEach(file => {
          const filePath = path.join(dir, file)
          const stats = fs.statSync(filePath)
          
          if (now - stats.mtime.getTime() > maxAge) {
            fs.unlinkSync(filePath)
          }
        })
      }
    })
  }
}

export const pdfProcessor = new PDFProcessor()