import { NextRequest, NextResponse } from 'next/server';
import { quantumJobsService } from '@/lib/quantum-jobs-service';

interface JobSubmission {
  jobType: string;
  description: string;
  provider: string;
  priority: 'low' | 'medium' | 'high';
  submissionType: 'prompt' | 'qasm' | 'preset';
  userId?: string;
  qasm_code?: string;
  metadata?: any;
}

export async function POST(request: NextRequest) {
  try {
    const jobData: JobSubmission = await request.json();

    if (!jobData.jobType || !jobData.description || !jobData.provider) {
      return NextResponse.json(
        { error: 'Missing required fields: jobType, description, and provider' },
        { status: 400 }
      );
    }

    if (!['low', 'medium', 'high'].includes(jobData.priority)) {
      return NextResponse.json(
        { error: 'Invalid priority. Must be: low, medium, or high' },
        { status: 400 }
      );
    }

    if (!['prompt', 'qasm', 'preset'].includes(jobData.submissionType)) {
      return NextResponse.json(
        { error: 'Invalid submission type. Must be: prompt, qasm, or preset' },
        { status: 400 }
      );
    }

    // Submit job to database
    const job = await quantumJobsService.submitJob(
      {
        job_type: jobData.jobType,
        description: jobData.description,
        provider: jobData.provider,
        priority: jobData.priority,
        submission_type: jobData.submissionType,
        qasm_code: jobData.qasm_code,
        metadata: jobData.metadata,
      },
      jobData.userId
    );

    // Start quantum execution asynchronously
    executeQuantumJob(job.id!, jobData).catch(error => {
      console.error(`Job ${job.id} execution failed:`, error);
    });

    return NextResponse.json({
      jobId: job.id,
      status: "submitted",
      estimatedCompletion: Date.now() + 30000,
      message: "Job submitted successfully"
    });

  } catch (error) {
    console.error('Job submission error:', error);
    return NextResponse.json(
      {
        error: 'Failed to submit job',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function executeQuantumJob(jobId: string, jobData: JobSubmission) {
  try {
    // Update status to running
    await quantumJobsService.updateJobStatus(jobId, 'running', 0);

    // Simulate quantum execution with progress updates
    const totalSteps = 10;
    const stepDelay = jobData.priority === 'high' ? 200 : jobData.priority === 'medium' ? 400 : 600;

    for (let step = 1; step <= totalSteps; step++) {
      await new Promise(resolve => setTimeout(resolve, stepDelay));
      const progress = (step / totalSteps) * 100;
      await quantumJobsService.updateJobStatus(jobId, 'running', Math.min(99, progress));
    }

    // Analyze QASM if provided
    let metrics = {};
    if (jobData.qasm_code) {
      metrics = quantumJobsService.analyzeQasm(jobData.qasm_code);
    }

    // Generate mock quantum results based on job type
    const mockResults = quantumJobsService.generateMockResults(jobData.jobType);
    const executionTime = extractExecutionTime(mockResults.executionTime);

    // Record execution
    await quantumJobsService.recordExecution(jobId, {
      attempt: 1,
      execution_time_ms: executionTime,
      fidelity: mockResults.fidelity,
      circuit_depth: mockResults.circuitDepth,
      gate_count: metrics.gates || 0,
      measurements: mockResults.measurements,
      status: 'success',
    });

    // Set final results
    await quantumJobsService.setJobResults(
      jobId,
      {
        ...mockResults,
        shots: 1024,
        algorithm: jobData.jobType,
        provider: jobData.provider,
      },
      executionTime,
      {
        ...metrics,
        fidelity: mockResults.fidelity,
      }
    );

    console.log(`Job ${jobId} completed successfully`);
  } catch (error) {
    console.error(`Job ${jobId} execution failed:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Quantum execution failed';
    try {
      await quantumJobsService.setJobError(jobId, errorMessage);
    } catch (dbError) {
      console.error(`Failed to update job error status:`, dbError);
    }
  }
}

function extractExecutionTime(timeStr: string): number {
  const match = timeStr.match(/(\d+\.?\d*)(ms|s)/);
  if (!match) return 100;

  const value = parseFloat(match[1]);
  const unit = match[2];

  return unit === 's' ? value * 1000 : value;
}
