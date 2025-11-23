// src/services/jobService.ts

export interface QuantumJob {
  id: string;
  algorithm: string;
  provider: string;
  status: "completed" | "failed" | "running";
  submittedAt: number;
  completedAt?: number;
  results?: {
    measurements: Record<string, number>;
    fidelity: string;
    executionTime: string;
    circuitDepth: number;
    shots: number;
  };
  txHash: string;
  user: string;
}

class JobService {
  private jobs: QuantumJob[] = [];
  private nextJobId = 1;

  submitJob(jobData: Omit<QuantumJob, "id" | "status" | "submittedAt">): QuantumJob {
    const newJob: QuantumJob = {
      ...jobData,
      id: `QC-${this.nextJobId++}`,
      status: "running",
      submittedAt: Date.now(),
    };

    this.jobs.push(newJob);

    // Simulate job completion
    setTimeout(() => {
      this.completeJob(newJob.id);
    }, 5000);

    return newJob;
  }

  private completeJob(jobId: string) {
    const job = this.jobs.find((j) => j.id === jobId);
    if (job) {
      job.status = "completed";
      job.completedAt = Date.now();
      job.results = {
        measurements: { "00": 487, "01": 13, "10": 12, "11": 488 },
        fidelity: "97.8%",
        executionTime: "23.4ms",
        circuitDepth: 2,
        shots: 1024,
      };
    }
  }

  getJobs(): QuantumJob[] {
    return this.jobs;
  }

  getJob(id: string): QuantumJob | undefined {
    return this.jobs.find((j) => j.id === id);
  }

  getLatestJob(): QuantumJob | undefined {
    return this.jobs[this.jobs.length - 1];
  }
}

export const jobService = new JobService();
