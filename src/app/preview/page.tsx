'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PDFPreview } from '@/components/pdf-preview'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft, 
  Download, 
  Share, 
  FileText, 
  Calendar,
  HardDrive,
  Eye,
  Settings
} from "lucide-react"

interface FileInfo {
  id: string
  originalName: string
  fileName: string
  fileSize: number
  mimeType: string
  uploadedAt: string
  status: string
}

function PreviewContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fileId = searchParams.get('fileId')
  const filePath = searchParams.get('filePath')
  
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (fileId) {
      fetchFileInfo()
    } else if (filePath) {
      setIsLoading(false)
    }
  }, [fileId, filePath])

  const fetchFileInfo = async () => {
    try {
      const response = await fetch(`/api/files/${fileId}`)
      if (response.ok) {
        const data = await response.json()
        setFileInfo(data.file)
      } else {
        setError('Failed to load file information')
      }
    } catch (err) {
      setError('Failed to load file information')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (filePath) {
      window.open(`/api/download?path=${encodeURIComponent(filePath)}`, '_blank')
    } else if (fileInfo) {
      window.open(`/api/download?path=${encodeURIComponent(fileInfo.fileName)}`, '_blank')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading file...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <FileText className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Error Loading File</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <div className="space-y-2">
                <Button onClick={() => router.back()} variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
                <Button onClick={() => window.location.reload()} className="w-full">
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!filePath && !fileInfo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">No File Specified</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Please provide a file ID or file path to preview.
              </p>
              <Button onClick={() => router.push('/')} className="w-full">
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => router.back()} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">PDF Preview</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* File Info Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  File Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">File Name</label>
                  <p className="text-sm font-mono break-all">
                    {fileInfo?.originalName || filePath?.split('/').pop() || 'Unknown'}
                  </p>
                </div>

                {fileInfo && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">File Size</label>
                      <div className="flex items-center space-x-2">
                        <HardDrive className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{formatFileSize(fileInfo.fileSize)}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Upload Date</label>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{formatDate(fileInfo.uploadedAt)}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                      <Badge 
                        variant={fileInfo.status === 'completed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {fileInfo.status}
                      </Badge>
                    </div>
                  </>
                )}

                <div className="pt-4 space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download File
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Share className="mr-2 h-4 w-4" />
                    Share File
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    File Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="mr-2 h-4 w-4" />
                  Extract Text
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Convert to Word
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Compress PDF
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Add Watermark
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* PDF Preview */}
          <div className="lg:col-span-3">
            <PDFPreview
              fileUrl={filePath || `/api/download?path=${encodeURIComponent(fileInfo?.fileName || '')}`}
              fileName={fileInfo?.originalName}
              fileSize={fileInfo?.fileSize}
              onDownload={handleDownload}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <PreviewContent />
    </Suspense>
  )
}