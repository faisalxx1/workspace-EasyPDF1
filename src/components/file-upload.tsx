'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  Download,
  Eye
} from "lucide-react"

interface FileUploadProps {
  onFilesChange: (files: File[]) => void
  maxFiles?: number
  maxSize?: number // in MB
  acceptedTypes?: string[]
  multiple?: boolean
  showPreview?: boolean
  className?: string
}

interface UploadedFile {
  file: File
  id: string
  status: 'uploading' | 'completed' | 'error'
  progress: number
  error?: string
  previewUrl?: string
}

export function FileUpload({
  onFilesChange,
  maxFiles = 10,
  maxSize = 50, // 50MB
  acceptedTypes = ['application/pdf'],
  multiple = true,
  showPreview = true,
  className = ""
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    rejectedFiles.forEach(rejection => {
      console.error('File rejected:', rejection.errors)
    })

    // Process accepted files
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'uploading' as const,
      progress: 0
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])
    onFilesChange([...uploadedFiles.map(f => f.file), ...acceptedFiles])

    // Simulate upload progress
    newFiles.forEach(uploadFile => {
      simulateUpload(uploadFile.id)
    })
  }, [uploadedFiles, onFilesChange])

  const simulateUpload = (fileId: string) => {
    const interval = setInterval(() => {
      setUploadedFiles(prev => 
        prev.map(file => {
          if (file.id === fileId) {
            const newProgress = Math.min(file.progress + Math.random() * 20, 100)
            const status = newProgress === 100 ? 'completed' : 'uploading'
            
            if (newProgress === 100) {
              clearInterval(interval)
            }
            
            return { ...file, progress: newProgress, status }
          }
          return file
        })
      )
    }, 200)
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
    const remainingFiles = uploadedFiles.filter(f => f.id !== fileId).map(f => f.file)
    onFilesChange(remainingFiles)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    multiple,
    maxFiles: maxFiles - uploadedFiles.length
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card className={`border-2 border-dashed transition-colors ${
        isDragActive 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
      }`}>
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className="text-center cursor-pointer"
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
                {isDragActive ? 'Drop your PDF files here' : 'Drag & drop PDF files here'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                or click to select files
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Badge variant="outline">Max {maxFiles} files</Badge>
                <Badge variant="outline">Max {maxSize}MB each</Badge>
                <Badge variant="outline">PDF only</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Uploaded Files ({uploadedFiles.length}/{maxFiles})
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {uploadedFiles.map((uploadedFile) => (
              <Card key={uploadedFile.id} className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-blue-500" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {uploadedFile.file.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(uploadedFile.status)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(uploadedFile.id)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatFileSize(uploadedFile.file.size)}</span>
                      <span className="capitalize">{uploadedFile.status}</span>
                    </div>
                    
                    {uploadedFile.status === 'uploading' && (
                      <Progress value={uploadedFile.progress} className="mt-2 h-2" />
                    )}
                    
                    {uploadedFile.error && (
                      <p className="text-xs text-red-500 mt-1">{uploadedFile.error}</p>
                    )}
                  </div>
                </div>
                
                {showPreview && uploadedFile.status === 'completed' && (
                  <div className="mt-3 flex space-x-2">
                    <Button variant="outline" size="sm" className="text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}