'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ZoomIn, 
  ZoomOut, 
  Download, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  Loader2
} from "lucide-react"

interface PDFPreviewProps {
  fileUrl: string
  fileName?: string
  fileSize?: number
  onDownload?: () => void
  className?: string
}

interface PDFPage {
  pageNumber: number
  width: number
  height: number
}

export function PDFPreview({ 
  fileUrl, 
  fileName, 
  fileSize, 
  onDownload,
  className = "" 
}: PDFPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [pages, setPages] = useState<PDFPage[]>([])
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadPDF()
  }, [fileUrl])

  const loadPDF = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Dynamically import PDF.js
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

      const loadingTask = pdfjsLib.getDocument(fileUrl)
      const pdf = await loadingTask.promise
      
      setTotalPages(pdf.numPages)
      
      // Load page information
      const pageInfo: PDFPage[] = []
      for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) { // Limit to first 10 pages for performance
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 1 })
        pageInfo.push({
          pageNumber: i,
          width: viewport.width,
          height: viewport.height
        })
      }
      setPages(pageInfo)
      
      // Render first page
      await renderPage(pdf, 1)
      
    } catch (err) {
      console.error('Error loading PDF:', err)
      setError('Failed to load PDF. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderPage = async (pdf: any, pageNumber: number) => {
    if (!canvasRef.current) return

    try {
      const page = await pdf.getPage(pageNumber)
      const viewport = page.getViewport({ 
        scale: scale,
        rotation: rotation
      })

      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      if (!context) return

      canvas.height = viewport.height
      canvas.width = viewport.width

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      }

      await page.render(renderContext).promise
      
    } catch (err) {
      console.error('Error rendering page:', err)
      setError('Failed to render page.')
    }
  }

  const handleZoomIn = () => {
    const newScale = Math.min(scale + 0.25, 3)
    setScale(newScale)
  }

  const handleZoomOut = () => {
    const newScale = Math.max(scale - 0.25, 0.25)
    setScale(newScale)
  }

  const handleRotate = () => {
    const newRotation = (rotation + 90) % 360
    setRotation(newRotation)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (isLoading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading PDF preview...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button variant="outline" onClick={loadPDF}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg truncate">{fileName || 'PDF Preview'}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {fileSize && (
              <Badge variant="outline" className="text-xs">
                {formatFileSize(fileSize)}
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {totalPages} pages
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={scale <= 0.25}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[3rem] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={scale >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRotate}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[4rem] text-center">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {onDownload && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDownload}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          )}
        </div>

        {/* PDF Canvas */}
        <div 
          ref={containerRef}
          className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg overflow-auto max-h-[600px]"
        >
          <canvas
            ref={canvasRef}
            className="shadow-lg"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease'
            }}
          />
        </div>

        {/* Page Thumbnails */}
        {pages.length > 1 && (
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {pages.map((page) => (
              <button
                key={page.pageNumber}
                onClick={() => setCurrentPage(page.pageNumber)}
                className={`flex-shrink-0 p-1 rounded border-2 transition-colors ${
                  currentPage === page.pageNumber
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="w-16 h-20 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {page.pageNumber}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}