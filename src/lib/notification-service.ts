'use client'

import { toast } from 'sonner'

interface NotificationOptions {
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  dismissible?: boolean
}

class NotificationService {
  private static instance: NotificationService

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  // Success notifications
  success(message: string, options: NotificationOptions = {}) {
    return toast.success(message, {
      duration: options.duration || 4000,
      action: options.action,
      dismissible: options.dismissible ?? true
    })
  }

  // Error notifications
  error(message: string, options: NotificationOptions = {}) {
    return toast.error(message, {
      duration: options.duration || 6000,
      action: options.action,
      dismissible: options.dismissible ?? true
    })
  }

  // Info notifications
  info(message: string, options: NotificationOptions = {}) {
    return toast.info(message, {
      duration: options.duration || 4000,
      action: options.action,
      dismissible: options.dismissible ?? true
    })
  }

  // Warning notifications
  warning(message: string, options: NotificationOptions = {}) {
    return toast.warning(message, {
      duration: options.duration || 5000,
      action: options.action,
      dismissible: options.dismissible ?? true
    })
  }

  // Loading notifications
  loading(message: string = 'Processing...') {
    return toast.loading(message, {
      dismissible: false
    })
  }

  // Custom notifications with rich content
  custom(message: React.ReactNode, options: NotificationOptions = {}) {
    return toast(message, {
      duration: options.duration || 4000,
      action: options.action,
      dismissible: options.dismissible ?? true
    })
  }

  // Promise-based notifications (for async operations)
  promise<T>(
    promise: Promise<T>,
    loadingMessage: string,
    successMessage: string | ((result: T) => string),
    errorMessage: string | ((error: any) => string)
  ) {
    return toast.promise(promise, {
      loading: loadingMessage,
      success: (result: T) => 
        typeof successMessage === 'function' ? successMessage(result) : successMessage,
      error: (error: any) => 
        typeof errorMessage === 'function' ? errorMessage(error) : errorMessage,
    })
  }

  // File upload notifications
  fileUploadStart(fileName: string) {
    return this.loading(`Uploading ${fileName}...`)
  }

  fileUploadSuccess(fileName: string, fileSize?: number) {
    const message = fileSize 
      ? `${fileName} uploaded successfully (${this.formatFileSize(fileSize)})`
      : `${fileName} uploaded successfully`
    
    return this.success(message, {
      action: {
        label: 'View Files',
        onClick: () => {
          // Navigate to files page
          window.location.href = '/dashboard'
        }
      }
    })
  }

  fileUploadError(fileName: string, error: string) {
    return this.error(`Failed to upload ${fileName}: ${error}`, {
      action: {
        label: 'Retry',
        onClick: () => {
          // Trigger retry logic
          document.getElementById('file-upload')?.click()
        }
      }
    })
  }

  // Processing notifications
  processingStart(operation: string, fileName?: string) {
    const message = fileName 
      ? `${operation} ${fileName}...`
      : `${operation} file...`
    
    return this.loading(message)
  }

  processingSuccess(operation: string, fileName?: string, result?: any) {
    const message = fileName 
      ? `${operation} completed successfully for ${fileName}`
      : `${operation} completed successfully`
    
    return this.success(message, {
      action: {
        label: 'Download',
        onClick: () => {
          if (result?.filePath) {
            window.open(`/api/download?path=${encodeURIComponent(result.filePath)}`, '_blank')
          }
        }
      }
    })
  }

  processingError(operation: string, fileName?: string, error?: string) {
    const message = fileName 
      ? `Failed to ${operation.toLowerCase()} ${fileName}${error ? `: ${error}` : ''}`
      : `Failed to ${operation.toLowerCase()} file${error ? `: ${error}` : ''}`
    
    return this.error(message, {
      action: {
        label: 'Try Again',
        onClick: () => {
          // Retry logic would be implemented here
        }
      }
    })
  }

  // Authentication notifications
  signInSuccess(userName?: string) {
    const message = userName 
      ? `Welcome back, ${userName}!`
      : 'Signed in successfully'
    
    return this.success(message, {
      action: {
        label: 'Go to Dashboard',
        onClick: () => {
          window.location.href = '/dashboard'
        }
      }
    })
  }

  signInError(error: string) {
    return this.error(`Sign in failed: ${error}`)
  }

  signOutSuccess() {
    return this.success('Signed out successfully')
  }

  signUpSuccess() {
    return this.success('Account created successfully! Please sign in.')
  }

  signUpError(error: string) {
    return this.error(`Account creation failed: ${error}`)
  }

  // Subscription notifications
  subscriptionSuccess(planName: string) {
    return this.success(`Successfully upgraded to ${planName}!`, {
      action: {
        label: 'View Features',
        onClick: () => {
          window.location.href = '/premium'
        }
      }
    })
  }

  subscriptionError(error: string) {
    return this.error(`Subscription update failed: ${error}`)
  }

  // Network error notifications
  networkError(action: string) {
    return this.error(
      `Network error while ${action}. Please check your internet connection.`,
      {
        action: {
          label: 'Retry',
          onClick: () => window.location.reload()
        }
      }
    )
  }

  // Validation error notifications
  validationError(field: string, message: string) {
    return this.error(`${field}: ${message}`)
  }

  // Rate limit notifications
  rateLimitError(action: string) {
    return this.warning(
      `Too many ${action} requests. Please wait a moment and try again.`
    )
  }

  // Permission error notifications
  permissionError(feature: string) {
    return this.error(
      `You don't have permission to access ${feature}. This may require a premium subscription.`,
      {
        action: {
          label: 'Upgrade Plan',
          onClick: () => {
            window.location.href = '/premium'
          }
        }
      }
    )
  }

  // Helper method to format file size
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Dismiss all notifications
  dismissAll() {
    toast.dismiss()
  }

  // Remove specific notification
  dismiss(id: string) {
    toast.dismiss(id)
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance()

// Export convenience hooks for React components
export const useNotification = () => {
  return notificationService
}