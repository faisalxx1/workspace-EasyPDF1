'use client'

import { useState, useEffect } from 'react'
import { ProgressTracker } from './progress-tracker'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Loader2,
  RefreshCw,
  Download,
  Eye,
  Plus
} from "lucide-react"
import { io, Socket } from 'socket.io-client'

interface ProcessingResult {
  jobId: string
  success: boolean
  result?: {
    filePath?: string
    fileSize?: number
    [key: string]: any
  }
  error?: string
}

interface RealTimeProcessorProps {
  operation: string
  title: string
  description: string
  onResult?: (result: ProcessingResult) => void
  multiple?: boolean
  className?: string
}

export function RealTimeProcessor({ 
  operation, 
  title, 
  description, 
  onResult,
  multiple = false,
  className = "" 
}: RealTimeProcessorProps) {
  const [files, setFiles] = useState<File[]>([])
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<ProcessingResult[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    // Initialize WebSocket connection for real-time updates
    const newSocket = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000')
    setSocket(newSocket)

    newSocket.on('job-progress', (data) => {
      if (data.jobId === currentJobId) {
        // Update progress in real-time
        console.log('Job progress:', data)
      }
    })

    newSocket.on('job-completed', (data) => {
      if (data.jobId === currentJobId) {
        setIsProcessing(false)
        const result: ProcessingResult = {
          jobId: data.jobId,
          success: true,
          result: data.result
        }
        setResults(prev => [...prev, result])
        onResult?.(result)
      }
    })

    newSocket.on('job-failed', (data) => {
      if (data.jobId === currentJobId) {
        setIsProcessing(false)
        setError(data.error)
        const result: ProcessingResult = {
          jobId: data.jobId,
          success: false,
          error: data.error
        }
        setResults(prev => [...prev, result])
        onResult?.(result)
      }
    })

    return () => {
      newSocket.close()
    }
  }, [currentJobId, onResult])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    if (multiple) {
      setFiles(prev => [...prev, ...selectedFiles])
    } else {
      setFiles(selectedFiles.slice(0, 1))
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleProcess = async () => {
    if (files.length === 0) {
      setError('Please select at least one file')
      return
    }

    setIsProcessing(true)
    setError(null)
    setUploadProgress(0)

    try {
      // Upload files
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload files')
      }

      const uploadData = await uploadResponse.json()
      setUploadProgress(100)

      // Start processing
      const fileIds = uploadData.files.map((f: any) => f.fileName) // In real app, use actual file IDs
      const processResponse = await fetch(`/api/pdf/${operation}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileIds: fileIds,
          options: {} // Add operation-specific options
        }),
      })

      if (!processResponse.ok) {
        throw new Error('Failed to start processing')
      }

      const processData = await processResponse.json()
      setCurrentJobId(processData.jobId)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed')
      setIsProcessing(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            {title}
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400">{description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
            <div className="text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">
                {multiple ? 'Upload PDF files' : 'Upload a PDF file'}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Drag and drop or click to select files
              </p>
              <input
                type="file"
                accept=".pdf"
                multiple={multiple}
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button className="cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  Select Files
                </Button>
              </label>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Selected Files:</h4>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={isProcessing}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Process Button */}
          <Button
            onClick={handleProcess}
            disabled={files.length === 0 || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Start ${title}`
            )}
          </Button>

          {/* Upload Progress */}
          {isProcessing && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading files...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Tracker */}
      {currentJobId && (
        <ProgressTracker
          jobId={currentJobId}
          onJobComplete={(result) => {
            console.log('Job completed:', result)
          }}
          onJobError={(error) => {
            console.error('Job failed:', error)
          }}
        />
      )}

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">
                        {result.success ? 'Processing Complete' : 'Processing Failed'}
                      </p>
                      {result.error && (
                        <p className="text-sm text-red-600">{result.error}</p>
                      )}
                      {result.result?.fileSize && (
                        <p className="text-sm text-gray-500">
                          Size: {formatFileSize(result.result.fileSize)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {result.success && result.result?.filePath && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            window.open(`/api/download?path=${encodeURIComponent(result.result.filePath)}`, '_blank')
                          }}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            window.open(`/preview?filePath=${encodeURIComponent(result.result.filePath)}`, '_blank')
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}