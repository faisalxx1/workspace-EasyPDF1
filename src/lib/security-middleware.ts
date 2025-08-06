import { NextRequest, NextResponse } from 'next/server'
import { securityManager } from './security'

export interface SecurityOptions {
  requireAuth?: boolean
  requirePremium?: boolean
  rateLimit?: {
    limit: number
    windowMs: number
  }
  maxFileSize?: number
  allowedTypes?: string[]
}

export async function securityMiddleware(
  request: NextRequest,
  options: SecurityOptions = {}
): Promise<{ success: boolean; response?: NextResponse; user?: any }> {
  try {
    // Get client IP
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'

    // Rate limiting
    if (options.rateLimit) {
      const isAllowed = securityManager.checkRateLimit(
        ip,
        request.nextUrl.pathname,
        options.rateLimit.limit,
        options.rateLimit.windowMs
      )
      
      if (!isAllowed) {
        return {
          success: false,
          response: NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: 429 }
          )
        }
      }
    }

    // Authentication check
    if (options.requireAuth) {
      const authHeader = request.headers.get('authorization')
      const sessionToken = request.headers.get('x-session-token')
      
      // In a real implementation, validate the session token
      if (!authHeader && !sessionToken) {
        return {
          success: false,
          response: NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          )
        }
      }
    }

    // Premium feature check
    if (options.requirePremium) {
      // In a real implementation, check user's subscription status
      const userHeader = request.headers.get('x-user-id')
      if (!userHeader || !userHeader.includes('premium')) {
        return {
          success: false,
          response: NextResponse.json(
            { error: 'Premium subscription required' },
            { status: 403 }
          )
        }
      }
    }

    // CSRF protection for state-changing requests
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      const csrfToken = request.headers.get('x-csrf-token')
      const sessionCsrfToken = request.headers.get('x-session-csrf-token')
      
      if (csrfToken && sessionCsrfToken) {
        if (!securityManager.validateCSRFToken(csrfToken, sessionCsrfToken)) {
          return {
            success: false,
            response: NextResponse.json(
              { error: 'Invalid CSRF token' },
              { status: 403 }
            )
          }
        }
      }
    }

    // Security headers
    const securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    }

    // Add security headers to response
    const response = NextResponse.next()
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return { success: true, response }

  } catch (error) {
    console.error('Security middleware error:', error)
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

// Higher-order function to wrap API handlers with security
export function withSecurity(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  options: SecurityOptions = {}
) {
  return async (request: NextRequest, context?: any) => {
    const securityResult = await securityMiddleware(request, options)
    
    if (!securityResult.success) {
      return securityResult.response!
    }

    // Add security headers to the handler's response
    const response = await handler(request, context)
    
    // Add additional security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    
    return response
  }
}