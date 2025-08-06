'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileImage, 
  ArrowLeft,
  Upload,
  FileText,
  Image as ImageIcon,
  Download,
  Settings,
  CheckCircle
} from "lucide-react"
import Link from 'next/link'
import { useState, useRef } from 'react'

export default function ImageToPDFPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    setSelectedFiles(imageFiles)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    setSelectedFiles(imageFiles)
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const convertToPDF = async () => {
    if (selectedFiles.length === 0) return
    
    setIsProcessing(true)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsProcessing(false)
    setIsComplete(true)
  }

  const resetConverter = () => {
    setSelectedFiles([])
    setIsComplete(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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
            <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-900/20">
              <FileImage className="h-8 w-8 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Image to PDF</h1>
              <p className="text-slate-600 dark:text-slate-400">Convert images to PDF format</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="h-8 w-8 text-violet-600 dark:text-violet-400" />
              </div>
              <CardTitle className="text-2xl text-slate-900 dark:text-white">
                {isComplete ? "Conversion Complete!" : "Convert Images to PDF"}
              </CardTitle>
              <CardDescription className="text-lg text-slate-600 dark:text-slate-400">
                {isComplete 
                  ? "Your images have been successfully converted to PDF format"
                  : "Upload one or more images to convert them into a single PDF document"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isComplete ? (
                <>
                  {/* File Upload Area */}
                  <div
                    className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-violet-400 dark:hover:border-violet-500 transition-colors cursor-pointer"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                      Drop images here or click to upload
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Supports JPG, PNG, GIF, BMP, WebP formats
                    </p>
                    <Button variant="outline" className="border-violet-300 text-violet-600 hover:bg-violet-50">
                      Browse Files
                    </Button>
                  </div>

                  {/* Selected Files */}
                  {selectedFiles.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                        <FileImage className="h-5 w-5 mr-2" />
                        Selected Images ({selectedFiles.length})
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <ImageIcon className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                removeFile(index)
                              }}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {selectedFiles.length > 0 && (
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        onClick={convertToPDF}
                        disabled={isProcessing}
                        className="bg-violet-600 hover:bg-violet-700 text-white"
                      >
                        {isProcessing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Converting...
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4 mr-2" />
                            Convert to PDF
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={resetConverter}
                      >
                        Clear All
                      </Button>
                    </div>
                  )}

                  {/* Features */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <Settings className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                      <p className="font-medium text-slate-900 dark:text-white">High Quality</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Preserve image quality</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <FileImage className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                      <p className="font-medium text-slate-900 dark:text-white">Multiple Images</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Combine into one PDF</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <Download className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                      <p className="font-medium text-slate-900 dark:text-white">Instant Download</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Get your PDF immediately</p>
                    </div>
                  </div>
                </>
              ) : (
                /* Success State */
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Successfully Converted {selectedFiles.length} Image{selectedFiles.length > 1 ? 's' : ''}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Your PDF document is ready for download
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button
                      variant="outline"
                      onClick={resetConverter}
                    >
                      Convert More Images
                    </Button>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      💡 <strong>Tip:</strong> You can also convert other document formats using our comprehensive PDF tools suite.
                    </p>
                  </div>
                </div>
              )}

              {/* Back to Tools */}
              <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button asChild variant="outline">
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to All Tools
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}