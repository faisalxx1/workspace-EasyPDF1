import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth-config'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const history = await db.processingHistory.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limit to last 50 records
    })

    return NextResponse.json({
      history: history.map(item => ({
        id: item.id,
        operation: item.operation,
        status: item.status,
        createdAt: item.createdAt.toISOString(),
        result: item.result ? JSON.parse(item.result) : null
      }))
    })

  } catch (error) {
    console.error('Failed to fetch user history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    )
  }
}