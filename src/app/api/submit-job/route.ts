import { NextRequest, NextResponse } from 'next/server';

interface JobSubmission {
  jobType: string;
  description: string;
  provider: string;
  priority: string;
  submissionType: string;
  txHash: string;
}

interface JobResult {
  jobId: string;
  status: "running" | "completed" | "failed";
  progress: number;
  results?: {
    measurements: Record<string, number>;
    fidelity: string;
    executionTime: string;
    circuitDepth: number;
  };
  error?: string;
}

// In-memory job storage (in production, use a database)
const jobs = new Map<string, JobResult>();

export async function POST(request: NextRequest) {
  try {
    const jobData: JobSubmission = await request.json();
    
    // Generate unique job ID
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Initialize job
    const job: JobResult = {
      jobId,
      status: "running",
      progress: 0
    };
    
    jobs.set(jobId, job);
    
    // Start quantum execution simulation
    executeQuantumJob(jobId, jobData);
    
    return NextResponse.json({ jobId, status: "submitted" });
    
  } catch (error) {
    console.error('Job submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit job' },
      { status: 500 }
    );
  }
}

async function executeQuantumJob(jobId: string, jobData: JobSubmission) {
  const job = jobs.get(jobId);
  if (!job) return;
  
  try {
    // Simulate quantum execution with progress updates
    const totalSteps = 10;
    
    for (let step = 1; step <= totalSteps; step++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const progress = (step / totalSteps) * 100;
      job.progress = progress;
      jobs.set(jobId, { ...job });
    }
    
    // Generate mock quantum results
    const mockResults = {
      measurements: generateMockMeasurements(jobData.description),
      fidelity: `${(95 + Math.random() * 4).toFixed(1)}%`,
      executionTime: `${(Math.random() * 100 + 50).toFixed(1)}ms`,
      circuitDepth: Math.floor(Math.random() * 10) + 2
    };
    
    // Complete the job
    job.status = "completed";
    job.results = mockResults;
    jobs.set(jobId, { ...job });
    
    // Store in analytics (in production, save to database)
    console.log(`Job ${jobId} completed:`, mockResults);
    
  } catch (error) {
    console.error(`Job ${jobId} failed:`, error);
    job.status = "failed";
    job.error = "Quantum execution failed";
    jobs.set(jobId, { ...job });
  }
}

function generateMockMeasurements(description: string): Record<string, number> {
  const lowerDesc = description.toLowerCase();
  
  // Bell state pattern
  if (lowerDesc.includes('bell') || (lowerDesc.includes('h') && lowerDesc.includes('cx'))) {
    return {
      "00": Math.floor(Math.random() * 100) + 400,
      "01": Math.floor(Math.random() * 50) + 25,
      "10": Math.floor(Math.random() * 50) + 25,
      "11": Math.floor(Math.random() * 100) + 400
    };
  }
  
  // Random distribution
  return {
    "00": Math.floor(Math.random() * 300) + 200,
    "01": Math.floor(Math.random() * 300) + 200,
    "10": Math.floor(Math.random() * 300) + 200,
    "11": Math.floor(Math.random() * 300) + 200
  };
}

// Export the jobs map for the status endpoint
export { jobs };