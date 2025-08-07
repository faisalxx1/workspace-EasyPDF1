import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileIds, operation, parameters } = await request.json();

    console.log('Creating job with data:', {
      userId: session.user.id,
      fileIds,
      operation,
      parameters
    });

    const job = await prisma.processingJob.create({
      data: {
        userId: session.user.id,
        fileIds,
        operation,
        parameters,
        status: 'pending',
        progress: 0
      }
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error('Job creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create processing job' },
      { status: 500 }
    );
  }
}