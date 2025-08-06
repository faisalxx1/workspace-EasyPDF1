'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  Cloud, 
  Upload, 
  Download, 
  FolderOpen, 
  Trash2, 
  RefreshCw,
  ExternalLink,
  CheckCircle,
  XCircle,
  Plus,
  FileText,
  Loader2
} from "lucide-react"
import { cloudStorageService } from '@/lib/cloud-storage'
import { notificationService } from '@/lib/notification-service'

interface CloudFile {
  id: string
  name: string
  size: number
  modifiedTime: string
  type: 'file' | 'folder'
}

interface CloudStorageIntegrationProps {
  onFileSelect?: (file: CloudFile) => void
  onFileUpload?: (file: File) => void
  className?: string
}

export function CloudStorageIntegration({ 
  onFileSelect, 
  onFileUpload,
  className = "" 
}: CloudStorageIntegrationProps) {
  const [activeProvider, setActiveProvider] = useState<string | null>(null)
  const [files, setFiles] = useState<CloudFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [currentFolder, setCurrentFolder] = useState<string>('/')

  const providers = cloudStorageService.getAvailableProviders()

  useEffect(() => {
    if (activeProvider) {
      loadFiles()
    }
  }, [activeProvider, currentFolder])

  const handleAuthenticate = async (providerName: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await cloudStorageService.authenticate(providerName)
      
      if (result.success && result.authUrl) {
        // In a real implementation, this would open the OAuth flow
        window.open(result.authUrl, '_blank', 'width=600,height=600')
        
        // Simulate successful authentication for demo
        setTimeout(() => {
          setActiveProvider(providerName)
          cloudStorageService.setActiveConnection(providerName, { authenticated: true })
          notificationService.success(`Successfully connected to ${providers.find(p => p.id === providerName)?.name}`)
        }, 2000)
      } else {
        setError(result.error || 'Authentication failed')
      }
    } catch (err) {
      setError('Authentication failed')
      notificationService.error('Failed to authenticate with cloud storage provider')
    } finally {
      setIsLoading(false)
    }
  }

  const loadFiles = async () => {
    if (!activeProvider) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await cloudStorageService.listFiles(activeProvider, currentFolder)
      
      if (result.success && result.files) {
        setFiles(result.files.map(file => ({
          ...file,
          type: file.name.includes('.') ? 'file' : 'folder'
        })))
      } else {
        setError(result.error || 'Failed to load files')
      }
    } catch (err) {
      setError('Failed to load files')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0 || !activeProvider) return

    const file = files[0]
    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const result = await cloudStorageService.uploadFile(activeProvider, file, currentFolder)
      
      clearInterval(progressInterval)
      setUploadProgress(100)

      if (result.success) {
        notificationService.fileUploadSuccess(file.name, file.size)
        loadFiles() // Refresh file list
        onFileUpload?.(file)
      } else {
        setError(result.error || 'Upload failed')
        notificationService.fileUploadError(file.name, result.error || 'Unknown error')
      }
    } catch (err) {
      setError('Upload failed')
      notificationService.fileUploadError(file.name, 'Upload failed')
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  const handleDownload = async (file: CloudFile) => {
    if (!activeProvider) return

    try {
      const result = await cloudStorageService.downloadFile(activeProvider, file.id)
      
      if (result.success && result.fileUrl) {
        window.open(result.fileUrl, '_blank')
        notificationService.success(`Download started for ${file.name}`)
      } else {
        setError(result.error || 'Download failed')
        notificationService.error(`Failed to download ${file.name}`)
      }
    } catch (err) {
      setError('Download failed')
      notificationService.error(`Failed to download ${file.name}`)
    }
  }

  const handleDelete = async (file: CloudFile) => {
    if (!activeProvider) return

    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) {
      return
    }

    try {
      const result = await cloudStorageService.deleteFile(activeProvider, file.id)
      
      if (result.success) {
        notificationService.success(`Deleted ${file.name}`)
        loadFiles() // Refresh file list
      } else {
        setError(result.error || 'Delete failed')
        notificationService.error(`Failed to delete ${file.name}`)
      }
    } catch (err) {
      setError('Delete failed')
      notificationService.error(`Failed to delete ${file.name}`)
    }
  }

  const handleCreateFolder = async () => {
    if (!activeProvider) return

    const folderName = prompt('Enter folder name:')
    if (!folderName) return

    try {
      const result = await cloudStorageService.createFolder(activeProvider, folderName, currentFolder)
      
      if (result.success) {
        notificationService.success(`Folder "${folderName}" created successfully`)
        loadFiles() // Refresh file list
      } else {
        setError(result.error || 'Failed to create folder')
        notificationService.error(`Failed to create folder "${folderName}"`)
      }
    } catch (err) {
      setError('Failed to create folder')
      notificationService.error('Failed to create folder')
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Provider Selection */}
      {!activeProvider && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cloud className="h-5 w-5 mr-2" />
              Connect to Cloud Storage
            </CardTitle>
            <CardDescription>
              Connect your Google Drive or Dropbox account to access and manage your files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {providers.map((provider) => (
                <Card 
                  key={provider.id} 
                  className="cursor-pointer transition-all duration-200 hover:shadow-md border-2 hover:border-blue-500"
                  onClick={() => handleAuthenticate(provider.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">{provider.icon}</div>
                    <h3 className="text-lg font-semibold mb-2">{provider.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Access your files from {provider.name}
                    </p>
                    <Button 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        'Connect'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cloud Storage Interface */}
      {activeProvider && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Cloud className="h-5 w-5" />
                <div>
                  <CardTitle>
                    {providers.find(p => p.id === activeProvider)?.name}
                  </CardTitle>
                  <CardDescription>
                    {currentFolder}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={loadFiles} disabled={isLoading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setActiveProvider(null)
                    cloudStorageService.removeConnection(activeProvider)
                  }}
                >
                  Disconnect
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Upload Section */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
              <div className="text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Upload Files</p>
                <p className="text-sm text-gray-500 mb-4">
                  Drag and drop or click to select files
                </p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="cloud-file-upload"
                />
                <label htmlFor="cloud-file-upload">
                  <Button className="cursor-pointer" disabled={isUploading}>
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Select Files
                  </Button>
                </label>
              </div>
              
              {isUploading && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={handleCreateFolder}>
                <Plus className="h-4 w-4 mr-2" />
                New Folder
              </Button>
              <Badge variant="secondary">
                {files.length} items
              </Badge>
            </div>

            {/* File List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading files...</span>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No files found</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {files.map((file) => (
                  <div 
                    key={file.id} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded">
                        {file.type === 'folder' ? (
                          <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                        ) : (
                          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{formatFileSize(file.size)}</span>
                          <span>{formatDate(file.modifiedTime)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {file.type === 'file' && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => onFileSelect?.(file)}
                          >
                            Select
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDownload(file)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(file)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}