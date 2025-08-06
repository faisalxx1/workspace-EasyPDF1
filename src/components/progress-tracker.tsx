'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2, 
  Download,
  Eye,
  RefreshCw,
  FileText
} from "lucide-react"

interface ProcessingJob {
  id: string
  operation: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  error?: string
  startedAt?: string
  completedAt?: string
  result?: {
    filePath?: string
    fileSize?: number
    [key: string]: any
  }
}

interface ProgressTrackerProps {
  jobId: string
  onJobComplete?: (result: any) => void
  onJobError?: (error: string) => void
  autoRefresh?: boolean
  className?: string
}

export function ProgressTracker({ 
  jobId, 
  onJobComplete, 
  onJobError, 
  autoRefresh = true,
  className = "" 
}: ProgressTrackerProps) {
  const [job, setJob] = useState<ProcessingJob | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    if (autoRefresh) {
      fetchJobStatus()
      const interval = setInterval(fetchJobStatus, 2000) // Poll every 2 seconds
      return () => clearInterval(interval)
    } else {
      fetchJobStatus()
    }
  }, [jobId, autoRefresh])

  const fetchJobStatus = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`)
      if (response.ok) {
        const data = await response.json()
        setJob(data.job)
        setLastUpdate(new Date())
        
        // Trigger callbacks
        if (data.job.status === 'completed' && onJobComplete) {
          onJobComplete(data.job.result)
        } else if (data.job.status === 'failed' && onJobError) {
          onJobError(data.job.error || 'Job failed')
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch job status')
      }
    } catch (err) {
      setError('Failed to fetch job status')
    } finally {
      setIsLoading(false)
    }
  }

  const formatOperationName = (operation: string) => {
    const names: { [key: string]: string } = {
      merge: 'Merge PDF',
      split: 'Split PDF',
      compress: 'Compress PDF',
      convert: 'Convert PDF',
      rotate: 'Rotate PDF',
      unlock: 'Unlock PDF',
      watermark: 'Watermark PDF',
      annotate: 'Annotate PDF',
      esign: 'E-Sign PDF',
      ocr: 'OCR PDF',
      batch_compress: 'Batch Compress',
      batch_rotate: 'Batch Rotate',
      batch_watermark: 'Batch Watermark',
      batch_unlock: 'Batch Unlock'
    }
    return names[operation] || operation
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : new Date()
    const duration = end.getTime() - start.getTime()
    
    if (duration < 1000) return `${duration}ms`
    if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`
    return `${(duration / 60000).toFixed(1)}min`
  }

  if (isLoading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading job status...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button variant="outline" size="sm" onClick={fetchJobStatus} className="mt-3">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!job) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Job not found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(job.status)}
            <div>
              <CardTitle className="text-lg">
                {formatOperationName(job.operation)}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={getStatusColor(job.status)}>
                  {job.status}
                </Badge>
                {job.startedAt && (
                  <span className="text-xs text-gray-500">
                    {formatDuration(job.startedAt, job.completedAt)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchJobStatus}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{job.progress}%</span>
          </div>
          <Progress value={job.progress} className="h-2" />
        </div>

        {/* Error Message */}
        {job.error && (
          <Alert variant="destructive">
            <AlertDescription>{job.error}</AlertDescription>
          </Alert>
        )}

        {/* Job Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {job.startedAt && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">Started:</span>
              <span className="ml-2 font-medium">
                {new Date(job.startedAt).toLocaleTimeString()}
              </span>
            </div>
          )}
          {job.completedAt && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">Completed:</span>
              <span className="ml-2 font-medium">
                {new Date(job.completedAt).toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>

        {/* Result Actions */}
        {job.status === 'completed' && job.result && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium">Processing Complete!</p>
                {job.result.fileSize && (
                  <p className="text-sm text-gray-500">
                    Result size: {formatFileSize(job.result.fileSize)}
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                {job.result.filePath && (
                  <Button size="sm" onClick={() => {
                    window.open(`/api/download?path=${encodeURIComponent(job.result.filePath)}`, '_blank')
                  }}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                )}
                {job.result.filePath && (
                  <Button variant="outline" size="sm" onClick={() => {
                    window.open(`/preview?filePath=${encodeURIComponent(job.result.filePath)}`, '_blank')
                  }}>
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Last Update */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  )
}