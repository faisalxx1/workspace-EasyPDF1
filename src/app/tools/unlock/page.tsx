'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Unlock, 
  Upload, 
  Download, 
  X, 
  FileText,
  ArrowLeft,
  Shield,
  Zap,
  Key
} from "lucide-react"
import Link from 'next/link'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
}

export default function UnlockPDFPage() {
  const [file, setFile] = useState<UploadedFile | null>(null)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [password, setPassword] = useState('')
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

  const handleUnlock = async () => {
    if (!file) {
      setResult({ success: false, message: 'Please select a PDF file to unlock' })
      return
    }

    setProcessing(true)
    setProgress(0)
    setResult(null)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 20, 90))
      }, 200)

      const response = await fetch('/api/pdf/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: file.id,
          options: {
            password: password || undefined
          }
        }),
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (response.ok) {
        const data = await response.json()
        setResult({
          success: true,
          message: 'PDF unlocked successfully!',
          downloadUrl: data.downloadUrl
        })
      } else {
        const error = await response.json()
        setResult({
          success: false,
          message: error.error || 'Failed to unlock PDF'
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'An error occurred while unlocking PDF'
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
              <Unlock className="h-8 w-8 text-slate-700 dark:text-slate-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Unlock PDF</h1>
              <p className="text-slate-600 dark:text-slate-400">Remove password protection from PDFs</p>
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
                  Select a password-protected PDF file to unlock. You can drag and drop or click to browse.
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
                      <div className="relative">
                        <FileText className="h-8 w-8 text-slate-600 dark:text-slate-400" />
                        <Key className="h-4 w-4 text-red-500 absolute -top-1 -right-1" />
                      </div>
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

            {/* Password Input */}
            {file && (
              <Card>
                <CardHeader>
                  <CardTitle>Password (Optional)</CardTitle>
                  <CardDescription>
                    Enter the password if the PDF is protected. Some PDFs can be unlocked without a password.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">PDF Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password (if required)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full"
                    />
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Leave empty if you don't know the password or if it's not required
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {password ? 'Password provided' : 'No password provided'}
                    </p>
                    <Button
                      onClick={handleUnlock}
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Unlocking...
                        </>
                      ) : (
                        <>
                          <Unlock className="h-4 w-4 mr-2" />
                          Unlock PDF
                        </>
                      )}
                    </Button>
                  </div>

                  {processing && (
                    <div className="mt-4">
                      <Progress value={progress} className="w-full" />
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                        Unlocking PDF... {progress}%
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
                          Download Unlocked PDF
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
                    <p className="font-medium text-slate-900 dark:text-white">Password Removal</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Remove PDF passwords</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-slate-400 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">No Password Needed</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Works on some PDFs without password</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-slate-400 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Preserve Content</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Maintain original content</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-slate-400 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Secure Processing</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Files are processed securely</p>
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
                    <p className="text-sm text-slate-600 dark:text-slate-400">Select protected PDF file</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-0.5">2</Badge>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Enter Password</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Optional, if known</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-0.5">3</Badge>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Click Unlock</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Process the PDF file</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-0.5">4</Badge>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Download</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Get unlocked PDF</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Note */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Note
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Encrypted Processing</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Files are encrypted during processing</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Auto Deletion</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Files are deleted after processing</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Legal Use Only</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Only unlock files you own or have permission to access</p>
                    </div>
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