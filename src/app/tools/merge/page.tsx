'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Merge, 
  Upload, 
  Download, 
  X, 
  FileText,
  ArrowLeft,
  Shield,
  Zap
} from "lucide-react"
import Link from 'next/link'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
}

export default function MergePDFPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ success: boolean; message: string; downloadUrl?: string } | null>(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return

      setUploading(true)
      const newFiles: UploadedFile[] = []

      for (const file of acceptedFiles) {
        const formData = new FormData()
        formData.append('files', file)

        try {
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })

          if (response.ok) {
            const data = await response.json()
            newFiles.push({
              id: data.files[0].fileName,
              name: file.name,
              size: file.size,
              type: file.type,
              url: data.files[0].filePath
            })
          }
        } catch (error) {
          console.error('Upload error:', error)
        }
      }

      setFiles(prev => [...prev, ...newFiles])
      setUploading(false)
    }
  })

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id))
  }

  const handleMerge = async () => {
    if (files.length < 2) {
      setResult({ success: false, message: 'Please select at least 2 PDF files to merge' })
      return
    }

    setProcessing(true)
    setProgress(0)
    setResult(null)

    try {
      const fileIds = files.map(file => file.id)
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/pdf/merge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileIds,
          options: {}
        }),
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (response.ok) {
        const data = await response.json()
        setResult({
          success: true,
          message: 'PDFs merged successfully!',
          downloadUrl: data.downloadUrl
        })
      } else {
        const error = await response.json()
        setResult({
          success: false,
          message: error.error || 'Failed to merge PDFs'
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'An error occurred while merging PDFs'
      })
    } finally {
      setProcessing(false)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tools
          </Link>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
              <Merge className="h-8 w-8 text-slate-700 dark:text-slate-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Merge PDF</h1>
              <p className="text-slate-600 dark:text-slate-400">Combine multiple PDF files into a single document</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Tool Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Area */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload PDF Files
                </CardTitle>
                <CardDescription>
                  Select at least 2 PDF files to merge. You can drag and drop or click to browse.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-slate-400 bg-slate-50 dark:border-slate-600 dark:bg-slate-800'
                      : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  {isDragActive ? (
                    <p className="text-lg text-slate-700 dark:text-slate-300">Drop the PDF files here...</p>
                  ) : (
                    <div>
                      <p className="text-lg text-slate-700 dark:text-slate-300 mb-2">
                        Drag & drop PDF files here, or click to browse
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Supports multiple files (max 50MB each)
                      </p>
                    </div>
                  )}
                </div>

                {uploading && (
                  <div className="mt-4">
                    <Progress value={progress} className="w-full" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Uploading files...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* File List */}
            {files.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Selected Files ({files.length})</CardTitle>
                  <CardDescription>
                    Files will be merged in the order shown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {files.map((file, index) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {index + 1}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">{file.name}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleMerge}
                      disabled={files.length < 2 || processing}
                      className="flex-1"
                    >
                      {processing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Merging...
                        </>
                      ) : (
                        <>
                          <Merge className="h-4 w-4 mr-2" />
                          Merge PDFs
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setFiles([])}
                      disabled={processing}
                    >
                      Clear All
                    </Button>
                  </div>

                  {processing && (
                    <div className="mt-4">
                      <Progress value={progress} className="w-full" />
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                        Merging PDF files... {progress}%
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Result */}
            {result && (
              <Card>
                <CardContent className="pt-6">
                  <div className={`text-center p-6 rounded-lg ${
                    result.success 
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  }`}>
                    <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center ${
                      result.success 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {result.success ? (
                        <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                      ) : (
                        <X className="h-6 w-6 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${
                      result.success 
                        ? 'text-green-800 dark:text-green-200' 
                        : 'text-red-800 dark:text-red-200'
                    }`}>
                      {result.success ? 'Success!' : 'Error'}
                    </h3>
                    <p className={`mb-4 ${
                      result.success 
                        ? 'text-green-700 dark:text-green-300' 
                        : 'text-red-700 dark:text-red-300'
                    }`}>
                      {result.message}
                    </p>
                    {result.success && result.downloadUrl && (
                      <Button asChild>
                        <a href={result.downloadUrl} download>
                          <Download className="h-4 w-4 mr-2" />
                          Download Merged PDF
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Key Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-slate-400 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Merge Multiple Files</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Combine 2 or more PDFs into one</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-slate-400 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Preserve Quality</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Maintain original PDF quality</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-slate-400 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Fast Processing</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Quick merge operation</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-slate-400 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Secure & Private</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Files are encrypted and deleted</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>How to Use</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-0.5">1</Badge>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Upload PDFs</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Select 2 or more PDF files</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-0.5">2</Badge>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Arrange Order</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Files merge in listed order</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-0.5">3</Badge>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Click Merge</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Process and combine files</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-0.5">4</Badge>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Download</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Get your merged PDF</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}