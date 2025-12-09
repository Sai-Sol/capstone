import { NextRequest, NextResponse } from 'next/server';
import { quantumJobsService } from '@/lib/quantum-jobs-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('jobId');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    if (!jobId && !userId) {
      return NextResponse.json(
        { error: 'Either jobId or userId is required' },
        { status: 400 }
      );
    }

    if (jobId) {
      const job = await quantumJobsService.getJob(jobId);
      return NextResponse.json(job);
    }

    if (userId) {
      const jobs = await quantumJobsService.getUserJobs(userId, 50, status || undefined);
      return NextResponse.json(jobs);
    }

    return NextResponse.json(
      { error: 'Invalid parameters' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Job status fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch job status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
