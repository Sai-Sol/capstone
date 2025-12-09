import { NextRequest, NextResponse } from 'next/server';
import { quantumJobsService } from '@/lib/quantum-jobs-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const job = await quantumJobsService.getJob(jobId);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    const submittedAt = new Date(job.submitted_at!).getTime();
    const completedAt = job.completed_at ? new Date(job.completed_at).getTime() : Date.now();
    const duration = completedAt - submittedAt;

    const response = {
      ...job,
      duration,
      isComplete: job.status === 'completed' || job.status === 'failed'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Job status error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get job status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}