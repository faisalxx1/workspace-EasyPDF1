import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get user's subscription status
    const subscription = await db.subscription.findFirst({
      where: {
        userId: userId,
        status: 'active'
      }
    })

    // Count total files
    const totalFiles = await db.pDFFile.count({
      where: { userId }
    })

    // Count total operations
    const totalOperations = await db.processingHistory.count({
      where: { userId }
    })

    // Count operations this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const thisMonthOperations = await db.processingHistory.count({
      where: {
        userId,
        createdAt: {
          gte: startOfMonth
        }
      }
    })

    const stats = {
      totalFiles,
      totalOperations,
      thisMonthOperations,
      premiumUser: !!subscription
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}