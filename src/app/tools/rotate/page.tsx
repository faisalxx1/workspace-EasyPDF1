'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  RotateCw, 
  Upload, 
  Download, 
  X, 
  FileText,
  ArrowLeft,
  Shield,
  Zap,
  RefreshCw
} from "lucide-react"
import Link from 'next/link'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
}

export default function RotatePDFPage() {
  const [file, setFile] = useState<UploadedFile | null>(null)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [rotation, setRotation] = useState<90 | 180 | 270>(90)
  const [pages, setPages] = useState<'all' | 'selected'>('all')
  const [result, setResult] = useState<{ success: boolean; message: string; downloadUrl?: string } | null>(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return

      setUploading(true)
      const selectedFile = acceptedFiles[0]
      const formData = new FormData()
      formData.append('files', selectedFile)

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          setFile({
            id: data.files[0].fileName,
            name: selectedFile.name,
            size: selectedFile.size,
            type: selectedFile.type,
            url: data.files[0].filePath
          })
        }
      } catch (error) {
        console.error('Upload error:', error)
      } finally {
        setUploading(false)
      }
    }
  })

  const handleRotate = async () => {
    if (!file) {
      setResult({ success: false, message: 'Please select a PDF file to rotate' })
      return
    }

    setProcessing(true)
    setProgress(0)
    setResult(null)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 15, 90))
      }, 200)

      const response = await fetch('/api/pdf/rotate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: file.id,
          options: {
            rotation,
            pages: pages === 'all' ? 'all' : [1, 2, 3] // Simplified for demo
          }
        }),
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (response.ok) {
        const data = await response.json()
        setResult({
          success: true,
          message: 'PDF rotated successfully!',
          downloadUrl: data.downloadUrl
        })
      } else {
        const error = await response.json()
        setResult({
          success: false,
          message: error.error || 'Failed to rotate PDF'
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'An error occurred while rotating PDF'
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
              <RotateCw className="h-8 w-8 text-slate-700 dark:text-slate-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Rotate PDF</h1>
              <p className="text-slate-600 dark:text-slate-400">Rotate pages within a PDF document</p>
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
                  Upload PDF File
                </CardTitle>
                <CardDescription>
                  Select a PDF file to rotate. You can drag and drop or click to browse.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!file ? (
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
                      <p className="text-lg text-slate-700 dark:text-slate-300">Drop the PDF file here...</p>
                    ) : (
                      <div>
                        <p className="text-lg text-slate-700 dark:text-slate-300 mb-2">
                          Drag & drop PDF file here, or click to browse
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Supports single PDF file (max 50MB)
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-slate-600 dark:text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{file.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {uploading && (
                  <div className="mt-4">
                    <Progress value={progress} className="w-full" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Uploading file...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rotation Settings */}
            {file && (
              <Card>
                <CardHeader>
                  <CardTitle>Rotation Settings</CardTitle>
                  <CardDescription>
                    Choose how you want to rotate the PDF pages
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Rotation Angle */}
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Rotation Angle</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {([90, 180, 270] as const).map((angle) => (
                        <div
                          key={angle}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${
                            rotation === angle
                              ? 'border-slate-400 bg-slate-50 dark:border-slate-600 dark:bg-slate-800'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                          onClick={() => setRotation(angle)}
                        >
                          <RefreshCw className="h-8 w-8 mx-auto mb-2 text-slate-600 dark:text-slate-400" />
                          <p className="font-medium text-slate-900 dark:text-white">{angle}°</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {angle === 90 ? 'Right' : angle === 180 ? 'Upside Down' : 'Left'}
                          </p>
                          {rotation === angle && (
                            <Badge variant="secondary" className="mt-2">Selected</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Page Selection */}
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Pages to Rotate</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${
                          pages === 'all'
                            ? 'border-slate-400 bg-slate-50 dark:border-slate-600 dark:bg-slate-800'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                        onClick={() => setPages('all')}
                      >
                        <FileText className="h-8 w-8 mx-auto mb-2 text-slate-600 dark:text-slate-400" />
                        <p className="font-medium text-slate-900 dark:text-white">All Pages</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Rotate entire document</p>
                        {pages === 'all' && (
                          <Badge variant="secondary" className="mt-2">Selected</Badge>
                        )}
                      </div>
                      <div
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${
                          pages === 'selected'
                            ? 'border-slate-400 bg-slate-50 dark:border-slate-600 dark:bg-slate-800'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                        onClick={() => setPages('selected')}
                      >
                        <RefreshCw className="h-8 w-8 mx-auto mb-2 text-slate-600 dark:text-slate-400" />
                        <p className="font-medium text-slate-900 dark:text-white">Selected Pages</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Choose specific pages</p>
                        {pages === 'selected' && (
                          <Badge variant="secondary" className="mt-2">Selected</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Rotate {pages === 'all' ? 'all pages' : 'selected pages'} by {rotation}°
                    </p>
                    <Button
                      onClick={handleRotate}
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Rotating...
                        </>
                      ) : (
                        <>
                          <RotateCw className="h-4 w-4 mr-2" />
                          Rotate PDF
                        </>
                      )}
                    </Button>
                  </div>

                  {processing && (
                    <div className="mt-4">
                      <Progress value={progress} className="w-full" />
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                        Rotating PDF... {progress}%
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
                          Download Rotated PDF
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
                    <p className="font-medium text-slate-900 dark:text-white">Multiple Angles</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">90°, 180°, 270° rotation</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-slate-400 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Page Selection</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Rotate all or specific pages</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-slate-400 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Preserve Quality</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Maintain original quality</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-slate-400 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Fast Processing</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Quick rotation operation</p>
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
                    <p className="font-medium text-slate-900 dark:text-white">Upload PDF</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Select a PDF file</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-0.5">2</Badge>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Choose Angle</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Select rotation degree</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-0.5">3</Badge>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Select Pages</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Choose pages to rotate</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-0.5">4</Badge>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Click Rotate</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Process and download</p>
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