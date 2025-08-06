import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await db.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'active',
        cancelAtPeriodEnd: false
      }
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    // Update subscription to cancel at period end
    const updatedSubscription = await db.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: true
      }
    })

    return NextResponse.json({
      message: 'Subscription will be cancelled at the end of the current billing period',
      subscription: updatedSubscription
    })

  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}