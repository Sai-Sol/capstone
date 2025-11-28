import { NextRequest, NextResponse } from 'next/server';

interface EnhancedJobSubmission {
  jobType: string;
  description: string;
  provider: string;
  priority: string;
  submissionType: string;
  txHash: string;
  userId?: string;
  circuitAnalysis?: {
    gateCount: number;
    circuitDepth: number;
    qubitCount: number;
    estimatedFidelity: number;
    optimizationSuggestions: string[];
  };
  errorCorrection?: {
    enabled: boolean;
    code: string;
    overhead: number;
  };
  retryPolicy?: {
    maxRetries: number;
    backoffStrategy: 'exponential' | 'linear';
    retryConditions: string[];
  };
  batchId?: string;
  jobDependencies?: string[];
}

interface JobResult {
  jobId: string;
  status: "queued" | "compiling" | "executing" | "analyzing" | "completed" | "failed" | "cancelled" | "retrying";
  progress: number;
  stage: string;
  submittedAt: number;
  startedAt?: number;
  completedAt?: number;
  userId?: string;
  provider: string;
  priority: string;
  estimatedDuration?: number;
  actualDuration?: number;
  results?: {
    measurements: Record<string, number>;
    fidelity: number;
    executionTime: number;
    circuitDepth: number;
    shots: number;
    algorithm: string;
    provider: string;
    cost: number;
    errorMitigation: string[];
  };
  error?: string;
  retryCount?: number;
  lastRetryAt?: number;
  metrics?: {
    compilationTime: number;
    executionTime: number;
    fidelity: number;
    errorRate: number;
  };
}

interface JobQueueEntry {
  job: EnhancedJobSubmission;
  result: JobResult;
  dependencies: string[];
  retryAttempts: number;
}

// Persistent job storage with queue management
class JobStorage {
  private jobs: Map<string, JobResult> = new Map();
  private queue: JobQueueEntry[] = [];
  private runningJobs: Set<string> = new Set();
  private batchJobs: Map<string, string[]> = new Map();

  // Enhanced job submission with validation and circuit analysis
  async submitJob(jobData: EnhancedJobSubmission): Promise<{ jobId: string; error?: string }> {
    try {
      // Enhanced input validation
      const validation = this.validateJobSubmission(jobData);
      if (!validation.isValid) {
        return {
          jobId: '',
          error: validation.errors.join('; ')
        };
      }

      // Parse and analyze circuit if QASM provided
      let circuitAnalysis = jobData.circuitAnalysis;
      if (jobData.submissionType === 'qasm' && jobData.description) {
        circuitAnalysis = this.analyzeCircuit(jobData.description, jobData.provider);
        if (!circuitAnalysis) {
          return {
            jobId: '',
            error: 'Invalid QASM circuit: syntax errors or hardware constraints violated'
          };
        }
      }

      const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

      // Enhanced job result with detailed tracking
      const jobResult: JobResult = {
        jobId,
        status: 'queued',
        progress: 0,
        stage: 'Job queued',
        submittedAt: Date.now(),
        userId: jobData.userId,
        provider: jobData.provider,
        priority: jobData.priority,
        circuitAnalysis,
        results: {
          measurements: {},
          fidelity: 0,
          executionTime: 0,
          circuitDepth: circuitAnalysis?.circuitDepth || 0,
          shots: 1024,
          algorithm: this.extractAlgorithmName(jobData.description),
          provider: jobData.provider,
          cost: this.estimateJobCost(jobData, circuitAnalysis),
          errorMitigation: []
        },
        retryCount: 0,
        metrics: {
          compilationTime: 0,
          executionTime: 0,
          fidelity: 0,
          errorRate: 0
        }
      };

      // Store job in persistent storage
      this.jobs.set(jobId, jobResult);

      // Add to queue if dependencies are met
      const queueEntry: JobQueueEntry = {
        job: { ...jobData, circuitAnalysis },
        result: jobResult,
        dependencies: jobData.jobDependencies || [],
        retryAttempts: 0
      };

      this.queue.push(queueEntry);
      this.processQueue();

      return { jobId };
    } catch (error) {
      return {
        jobId: '',
        error: `Job submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Advanced job validation with hardware constraints
  private validateJobSubmission(jobData: EnhancedJobSubmission): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic validation
    if (!jobData.jobType?.trim()) {
      errors.push('Job type is required');
    }
    if (!jobData.description?.trim()) {
      errors.push('Description is required');
    }
    if (!jobData.provider) {
      errors.push('Provider is required');
    }

    // Hardware constraint validation
    const providerConstraints = this.getProviderConstraints(jobData.provider);

    if (jobData.circuitAnalysis) {
      const analysis = jobData.circuitAnalysis;

      if (analysis.qubitCount > providerConstraints.maxQubits) {
        errors.push(`Circuit exceeds provider qubit limit: ${analysis.qubitCount} > ${providerConstraints.maxQubits}`);
      }

      if (analysis.circuitDepth > providerConstraints.maxDepth) {
        errors.push(`Circuit depth exceeds provider limit: ${analysis.circuitDepth} > ${providerConstraints.maxDepth}`);
      }

      if (analysis.gateCount > providerConstraints.maxGates) {
        errors.push(`Circuit gate count exceeds provider limit: ${analysis.gateCount} > ${providerConstraints.maxGates}`);
      }
    }

    // Priority validation
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(jobData.priority)) {
      errors.push(`Invalid priority level: ${jobData.priority}`);
    }

    // Error correction validation
    if (jobData.errorCorrection?.enabled) {
      if (analysis.gateCount < 20) {
        errors.push('Error correction requires minimum circuit depth for overhead');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Enhanced circuit analysis
  private analyzeCircuit(qasmCode: string, provider: string) {
    try {
      // Basic QASM parsing
      const lines = qasmCode.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('//'));

      if (!lines.some(line => line.includes('OPENQASM'))) {
        return null;
      }

      let gateCount = 0;
      let qubitCount = 0;
      let circuitDepth = 0;
      const supportedGates = new Set(['h', 'x', 'y', 'z', 'cx', 'ccx', 'rz', 'rx', 'ry', 'measure', 'creg', 'qreg']);

      for (const line of lines) {
        const parts = line.split(/\s+/);
        if (parts.length >= 2 && supportedGates.has(parts[0])) {
          gateCount++;
          circuitDepth++;
        }

        // Count qubits
        if (line.includes('qreg')) {
          const match = line.match(/qreg\s+q\[(\d+)\]/);
          if (match) {
            qubitCount = Math.max(qubitCount, parseInt(match[1]) + 1);
          }
        }
      }

      const providerConstraints = this.getProviderConstraints(provider);
      const estimatedFidelity = this.estimateCircuitFidelity(
        gateCount,
        circuitDepth,
        qubitCount,
        providerConstraints.noiseLevel
      );

      return {
        gateCount,
        circuitDepth,
        qubitCount,
        estimatedFidelity,
        optimizationSuggestions: this.generateOptimizationSuggestions(gateCount, circuitDepth, provider)
      };
    } catch (error) {
      return null;
    }
  }

  // Provider-specific constraints
  private getProviderConstraints(provider: string) {
    const constraints = {
      'google-willow': {
        maxQubits: 105,
        maxDepth: 100,
        maxGates: 500,
        noiseLevel: 'low',
        avgGateTime: 0.02,
        supportedGates: ['h', 'x', 'y', 'z', 'cx', 'ccx', 'rz', 'rx', 'ry', 'measure']
      },
      'ibm-condor': {
        maxQubits: 127,
        maxDepth: 80,
        maxGates: 400,
        noiseLevel: 'medium',
        avgGateTime: 0.03,
        supportedGates: ['h', 'x', 'y', 'z', 'cx', 'ccx', 'rz', 'rx', 'ry', 'measure', 'u1', 'u2', 'u3', 'sx', 'sxdg', 'cz']
      },
      'amazon-braket': {
        maxQubits: 80,
        maxDepth: 60,
        maxGates: 300,
        noiseLevel: 'high',
        avgGateTime: 0.05,
        supportedGates: ['h', 'x', 'y', 'z', 'cx', 'ccx', 'rz', 'rx', 'ry', 'measure', 'u1', 'u2', 'u3']
      }
    };

    return constraints[provider.toLowerCase().replace(' ', '-')] || constraints['google-willow'];
  }

  // Fidelity estimation based on circuit properties
  private estimateCircuitFidelity(gateCount: number, circuitDepth: number, qubitCount: number, noiseLevel: string) {
    const baseFidelity = 0.99;

    // Noise level impact
    const noiseFactors = {
      'low': 0.001,
      'medium': 0.01,
      'high': 0.05
    };

    const noiseFactor = noiseFactors[noiseLevel as keyof typeof noiseFactors] || 0.01;
    const gateErrorRate = noiseFactor;

    // Calculate fidelity
    const fidelity = Math.exp(-gateCount * gateErrorRate) * Math.exp(-circuitDepth * 0.001) * baseFidelity;
    return Math.max(0.1, Math.min(0.999, fidelity));
  }

  // Cost estimation
  private estimateJobCost(jobData: EnhancedJobSubmission, circuitAnalysis?: any): number {
    const baseCost = 0.001;
    const priorityMultiplier = { low: 1, medium: 1.5, high: 2.5 }[jobData.priority as keyof typeof { low: 1, medium: 1.5, high: 2.5 }];
    const providerMultiplier = { 'google-willow': 1.2, 'ibm-condor': 1.1, 'amazon-braket': 1.0 }[jobData.provider.toLowerCase().replace(' ', '-') as keyof typeof { 'google-willow': 1.2, 'ibm-condor': 1.1, 'amazon-braket': 1.0 }] || 1.0;

    let circuitCost = baseCost;

    if (circuitAnalysis) {
      circuitCost += (circuitAnalysis.gateCount * 0.00001) + (circuitAnalysis.circuitDepth * 0.00002);
    }

    // Error correction overhead
    if (jobData.errorCorrection?.enabled) {
      circuitCost *= jobData.errorCorrection.overhead || 2.0;
    }

    return circuitCost * priorityMultiplier * providerMultiplier;
  }

  // Optimization suggestions
  private generateOptimizationSuggestions(gateCount: number, circuitDepth: number, provider: string): string[] {
    const suggestions: string[] = [];

    if (gateCount > 100) {
      suggestions.push('Consider gate cancellation to reduce redundant operations');
    }

    if (circuitDepth > 50) {
      suggestions.push('Apply quantum error mitigation techniques');
    }

    if (provider === 'google-willow' && gateCount > 80) {
      suggestions.push('Use IBM Condor for circuits with high gate count');
    }

    return suggestions;
  }

  // Queue processing with dependency management
  private async processQueue() {
    while (this.queue.length > 0 && this.runningJobs.size < 5) { // Max 5 concurrent jobs
      const queueEntry = this.queue.shift()!;

      // Check dependencies
      const dependenciesMet = queueEntry.dependencies.every(depId => {
        const depJob = this.jobs.get(depId);
        return depJob && depJob.status === 'completed';
      });

      if (!dependenciesMet) {
        // Re-queue at the end
        this.queue.push(queueEntry);
        continue;
      }

      this.runningJobs.add(queueEntry.result.jobId);
      await this.executeJob(queueEntry);
    }
  }

  // Enhanced job execution with error recovery
  private async executeJob(queueEntry: JobQueueEntry) {
    const { job, result } = queueEntry;

    try {
      // Compilation phase
      result.status = 'compiling';
      result.stage = 'Compiling quantum circuit';
      result.progress = 10;

      await this.simulateCompilation(result, job);

      // Execution phase
      result.status = 'executing';
      result.stage = 'Executing quantum algorithm';
      result.progress = 30;

      const compilationTime = Date.now() - result.submittedAt;
      const executionStart = Date.now();

      await this.simulateExecution(result, job, compilationTime);

      // Analysis phase
      result.status = 'analyzing';
      result.stage = 'Analyzing quantum results';
      result.progress = 80;

      await this.simulateAnalysis(result, job);

      // Completion
      result.status = 'completed';
      result.stage = 'Job completed successfully';
      result.progress = 100;
      result.completedAt = Date.now();
      result.actualDuration = Date.now() - executionStart;

      // Update metrics
      result.metrics = {
        compilationTime,
        executionTime: Date.now() - executionStart,
        fidelity: result.results?.fidelity || 0,
        errorRate: this.calculateErrorRate(result)
      };

    } catch (error) {
      await this.handleJobFailure(result, job, error);
    } finally {
      this.runningJobs.delete(result.jobId);

      // Schedule retry if configured
      if (result.status === 'failed' && job.retryPolicy && result.retryCount! < job.retryPolicy.maxRetries) {
        await this.scheduleRetry(result, job);
      }
    }
  }

  // Enhanced simulation methods
  private async simulateCompilation(result: JobResult, job: EnhancedJobSubmission) {
    await this.simulateDelay(200, job.priority);
    result.progress = 20;
    result.stage = 'Circuit validated and optimized';
  }

  private async simulateExecution(result: JobResult, job: EnhancedJobSubmission, compilationTime: number) {
    const executionTime = this.calculateExecutionTime(job, result.circuitAnalysis);
    await this.simulateDelay(executionTime, job.priority);

    // Generate realistic results
    if (job.submissionType === 'preset') {
      result.results = this.generatePresetResults(job);
    } else {
      result.results = this.generateCustomResults(job);
    }

    result.progress = 70;
  }

  private async simulateAnalysis(result: JobResult, job: EnhancedJobSubmission) {
    const analysisTime = job.priority === 'high' ? 500 : 1000;
    await this.simulateDelay(analysisTime, job.priority);

    result.stage = 'Results analyzed and processed';
  }

  // Realistic result generation
  private generatePresetResults(job: EnhancedJobSubmission) {
    const algorithm = this.extractAlgorithmName(job.description);
    const presetResults = {
      'bell-state': { "00": 512, "11": 512 },
      'grover-search': { "00": 980, "01": 44 },
      'quantum-teleportation': { "00": 256, "11": 256, "10": 256, "01": 256 },
      'superposition': { "00": 256, "01": 256, "10": 256, "11": 256 },
      'quantum-fourier-transform': { "00": 256, "01": 128, "10": 128, "11": 128 },
      'quantum-phase-estimation': { "00": 200, "01": 50, "10": 25, "11": 25 },
      'random-number': { "00": 102, "01": 249, "10": 198, "11": 45 }
    };

    const measurements = presetResults[algorithm as keyof typeof presetResults] || { "00": 100, "11": 100 };

    return {
      measurements,
      fidelity: this.getAlgorithmFidelity(algorithm),
      executionTime: this.getAlgorithmExecutionTime(algorithm),
      circuitDepth: result.circuitAnalysis?.circuitDepth || 0,
      shots: 1024,
      algorithm,
      provider: job.provider,
      cost: this.estimateJobCost(job, result.circuitAnalysis),
      errorMitigation: job.errorCorrection?.enabled ? ['Error correction applied'] : []
    };
  }

  private generateCustomResults(job: EnhancedJobSubmission) {
    // Generate results based on circuit complexity
    const baseFidelity = 0.7 + Math.random() * 0.2;
    const measurements: Record<string, number> = {};

    // Create measurement results based on circuit analysis
    if (result.circuitAnalysis) {
      const qubitCount = Math.min(result.circuitAnalysis.qubitCount, 16);
      for (let i = 0; i < qubitCount; i++) {
        const bitString = Math.floor(Math.random() * Math.pow(2, Math.min(qubitCount, 4))).toString(2).padStart(qubitCount, '0');
        measurements[bitString] = Math.floor(Math.random() * 100);
      }
    } else {
      measurements['00'] = 50;
      measurements['01'] = 50;
    }

    return {
      measurements,
      fidelity: baseFidelity,
      executionTime: Math.random() * 1000 + 500,
      circuitDepth: result.circuitAnalysis?.circuitDepth || 10,
      shots: 1024,
      algorithm: this.extractAlgorithmName(job.description),
      provider: job.provider,
      cost: this.estimateJobCost(job, result.circuitAnalysis),
      errorMitigation: job.errorCorrection?.enabled ? ['Applied custom error mitigation'] : []
    };
  }

  // Helper methods
  private calculateExecutionTime(job: EnhancedJobSubmission, circuitAnalysis?: any): number {
    const priorityFactors = { low: 3000, medium: 1500, high: 800 };
    const baseTime = priorityFactors[job.priority as keyof typeof priorityFactors];

    if (circuitAnalysis) {
      return baseTime + (circuitAnalysis.gateCount * 10) + (circuitAnalysis.circuitDepth * 5);
    }

    return baseTime + Math.random() * 500;
  }

  private getAlgorithmFidelity(algorithm: string): number {
    const fidelityMap = {
      'bell-state': 0.95,
      'grover-search': 0.85,
      'quantum-teleportation': 0.90,
      'superposition': 0.92,
      'quantum-fourier-transform': 0.80,
      'quantum-phase-estimation': 0.75,
      'random-number': 0.88
    };

    return fidelityMap[algorithm] || 0.8;
  }

  private getAlgorithmExecutionTime(algorithm: string): number {
    const timeMap = {
      'bell-state': 500,
      'grover-search': 2000,
      'quantum-teleportation': 1000,
      'superposition': 300,
      'quantum-fourier-transform': 1500,
      'quantum-phase-estimation': 800,
      'random-number': 200
    };

    return timeMap[algorithm] || 1000;
  }

  private extractAlgorithmName(description: string): string {
    const lower = description.toLowerCase();
    if (lower.includes('bell')) return 'bell-state';
    if (lower.includes('grover')) return 'grover-search';
    if (lower.includes('teleport')) return 'quantum-teleportation';
    if (lower.includes('superposition')) return 'superposition';
    if (lower.includes('fourier') || lower.includes('qft')) return 'quantum-fourier-transform';
    if (lower.includes('phase')) return 'quantum-phase-estimation';
    if (lower.includes('random')) return 'random-number';
    return 'custom-algorithm';
  }

  private calculateErrorRate(result: JobResult): number {
    if (!result.results?.fidelity) return 0.1;
    return Math.max(0.001, 1 - result.results.fidelity);
  }

  private async simulateDelay(ms: number, priority: string) {
    const priorityMultipliers = { low: 1.5, medium: 1.0, high: 0.7 };
    const multiplier = priorityMultipliers[priority as keyof typeof priorityMultipliers];
    const delay = ms * multiplier;

    return new Promise(resolve => setTimeout(resolve, delay));
  }

  // Enhanced error handling and retry logic
  private async handleJobFailure(result: JobResult, job: EnhancedJobSubmission, error: any) {
    result.status = 'failed';
    result.stage = 'Job execution failed';
    result.progress = 100;
    result.error = error instanceof Error ? error.message : 'Unknown execution error';

    // Check if retry should be attempted
    if (job.retryPolicy && result.retryCount! < job.retryPolicy.maxRetries) {
      result.retryCount = (result.retryCount || 0) + 1;
      result.lastRetryAt = Date.now();

      // Check retry conditions
      const shouldRetry = job.retryPolicy.retryConditions.some(condition =>
        this.matchesRetryCondition(error.message, condition)
      );

      if (!shouldRetry) {
        result.stage = 'Job failed - retry conditions not met';
      }
    } else {
      result.stage = 'Job failed - scheduling retry';
    }
  }

  private matchesRetryCondition(errorMessage: string, condition: string): boolean {
    const lowerError = errorMessage.toLowerCase();

    switch (condition) {
      case 'network_errors':
        return lowerError.includes('network') || lowerError.includes('timeout') || lowerError.includes('connection');
      case 'transaction_failed':
        return lowerError.includes('transaction') || lowerError.includes('insufficient') || lowerError.includes('gas');
      case 'provider_errors':
        return lowerError.includes('provider') || lowerError.includes('quantum');
      case 'circuit_errors':
        return lowerError.includes('circuit') || lowerError.includes('qasm');
      default:
        return true;
    }
  }

  private async scheduleRetry(result: JobResult, job: EnhancedJobSubmission) {
    const backoffDelays = {
      exponential: (attempt: number) => Math.min(300000, 1000 * Math.pow(2, attempt)), // Max 5 minutes
      linear: (attempt: number) => Math.min(300000, 5000 * (attempt + 1))
    };

    const delayFunction = backoffDelays[job.retryPolicy!.backoffStrategy] || backoffDelays.exponential;
    const delay = delayFunction(result.retryCount || 1);

    setTimeout(async () => {
      result.status = 'retrying';
      result.stage = 'Retrying job execution';
      result.progress = 0;

      await this.executeJob({
        job,
        result,
        dependencies: [],
        retryAttempts: result.retryCount || 0
      });
    }, delay);
  }

  // Public API methods
  getJob(jobId: string): JobResult | undefined {
    return this.jobs.get(jobId);
  }

  getJobStatus(jobId: string): { status: string; progress: number; stage: string } | undefined {
    const job = this.jobs.get(jobId);
    if (!job) return undefined;

    return {
      status: job.status,
      progress: job.progress,
      stage: job.stage
    };
  }

  getJobsByUser(userId: string, limit: number = 20, offset: number = 0): JobResult[] {
    const userJobs = Array.from(this.jobs.values())
      .filter(job => job.userId === userId)
      .sort((a, b) => b.submittedAt - a.submittedAt);

    return userJobs.slice(offset, offset + limit);
  }

  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    if (job.status === 'completed') return false;

    job.status = 'cancelled';
    job.stage = 'Job cancelled by user';
    job.progress = 100;
    job.completedAt = Date.now();

    this.runningJobs.delete(jobId);
    return true;
  }

  // Enhanced analytics
  getJobAnalytics(provider: string, timeRange: number = 24 * 60 * 60 * 1000): {
    totalJobs: number;
    successfulJobs: number;
    failedJobs: number;
    averageExecutionTime: number;
    averageFidelity: number;
    topAlgorithms: Array<{ algorithm: string; count: number; avgFidelity: number }>;
  } {
    const cutoffTime = Date.now() - timeRange;
    const providerJobs = Array.from(this.jobs.values())
      .filter(job => job.provider === provider && job.submittedAt >= cutoffTime);

    const successfulJobs = providerJobs.filter(job => job.status === 'completed' && !job.error);
    const failedJobs = providerJobs.filter(job => job.status === 'failed' || job.error);

    const avgExecutionTime = successfulJobs.length > 0
      ? successfulJobs.reduce((sum, job) => sum + (job.actualDuration || 0), 0) / successfulJobs.length
      : 0;

    const avgFidelity = successfulJobs.length > 0
      ? successfulJobs.reduce((sum, job) => sum + (job.results?.fidelity || 0), 0) / successfulJobs.length
      : 0;

    // Top algorithms
    const algorithmCounts = new Map<string, { count: number; totalFidelity: number }>();
    successfulJobs.forEach(job => {
      const algorithm = job.results?.algorithm || 'unknown';
      const current = algorithmCounts.get(algorithm) || { count: 0, totalFidelity: 0 };
      algorithmCounts.set(algorithm, {
        count: current.count + 1,
        totalFidelity: current.totalFidelity + (job.results?.fidelity || 0)
      });
    });

    const topAlgorithms = Array.from(algorithmCounts.entries())
      .map(([algorithm, data]) => ({
        algorithm,
        count: data.count,
        avgFidelity: data.totalFidelity / data.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalJobs: providerJobs.length,
      successfulJobs: successfulJobs.length,
      failedJobs: failedJobs.length,
      averageExecutionTime: avgExecutionTime,
      averageFidelity: avgFidelity,
      topAlgorithms
    };
  }

  // Batch processing support
  async submitBatchJobs(jobs: EnhancedJobSubmission[]): Promise<{ jobId: string; status: string }[]> {
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const results: { jobId: string; status: string }[] = [];

    // Add batch metadata to each job
    const batchJobs = jobs.map(job => ({
      ...job,
      batchId,
      jobDependencies: jobs.filter(j => j !== job).map(j => j.jobType) // Simple dependency handling
    }));

    for (const job of batchJobs) {
      const result = await this.submitJob(job);
      if (result.jobId) {
        results.push({ jobId: result.jobId, status: 'queued' });
      } else {
        results.push({ jobId: '', status: 'failed', error: result.error });
      }
    }

    return results;
  }

  // Cleanup old jobs
  cleanup() {
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    for (const [jobId, job] of this.jobs.entries()) {
      if (now - job.submittedAt > oneWeek && job.status === 'completed') {
        this.jobs.delete(jobId);
      }
    }
  }
}

// Initialize persistent storage
const jobStorage = new JobStorage();

// Set up automatic cleanup
setInterval(() => {
  jobStorage.cleanup();
}, 60 * 60 * 1000); // Cleanup every hour
export async function POST(request: NextRequest) {
  try {
    const jobData: JobSubmission = await request.json();
    
    // Validate input data
    if (!jobData.jobType || !jobData.description) {
      return NextResponse.json(
        { error: 'Missing required fields: jobType and description' },
        { status: 400 }
      );
    }

    // Generate unique job ID
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Initialize job
    const job: JobResult = {
      jobId,
      status: "running",
      progress: 0,
      submittedAt: Date.now(),
      userId: jobData.userId
    };
    
    jobs.set(jobId, job);
    
    // Start quantum execution simulation
    executeQuantumJob(jobId, jobData).catch(error => {
      console.error(`Job ${jobId} execution failed:`, error);
      const failedJob = jobs.get(jobId);
      if (failedJob) {
        failedJob.status = "failed";
        failedJob.error = error.message;
        failedJob.completedAt = Date.now();
        jobs.set(jobId, failedJob);
      }
    });
    
    return NextResponse.json({ 
      jobId, 
      status: "submitted",
      estimatedCompletion: Date.now() + 30000 // 30 seconds
    });
    
  } catch (error) {
    console.error('Job submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit job', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function executeQuantumJob(jobId: string, jobData: JobSubmission) {
  const job = jobs.get(jobId);
  if (!job) return;
  
  try {
    // Simulate quantum execution with progress updates
    const totalSteps = 8;
    const stepDelay = jobData.priority === 'high' ? 300 : jobData.priority === 'medium' ? 500 : 800;
    
    for (let step = 1; step <= totalSteps; step++) {
      await new Promise(resolve => setTimeout(resolve, stepDelay));
      
      const progress = (step / totalSteps) * 100;
      job.progress = progress;
      jobs.set(jobId, { ...job });
    }
    
    // Generate mock quantum results
    const mockResults = {
      measurements: generateMockMeasurements(jobData.description),
      fidelity: getFidelityForAlgorithm(jobData.description),
      executionTime: getExecutionTimeForAlgorithm(jobData.description),
      circuitDepth: getCircuitDepthForAlgorithm(jobData.description),
      shots: 1024,
      algorithm: extractAlgorithmName(jobData.description),
      provider: jobData.provider
    };
    
    // Complete the job
    job.status = "completed";
    job.completedAt = Date.now();
    job.results = mockResults;
    jobs.set(jobId, { ...job });
    
    console.log(`Job ${jobId} completed successfully in ${job.completedAt - job.submittedAt}ms`);
    
  } catch (error) {
    console.error(`Job ${jobId} failed:`, error);
    job.status = "failed";
    job.error = error instanceof Error ? error.message : "Quantum execution failed";
    job.completedAt = Date.now();
    jobs.set(jobId, { ...job });
  }
}

function extractAlgorithmName(description: string): string {
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('bell')) return 'Bell State';
  if (lowerDesc.includes('grover')) return "Grover's Search";
  if (lowerDesc.includes('shor')) return "Shor's Algorithm";
  if (lowerDesc.includes('teleport')) return 'Quantum Teleportation';
  if (lowerDesc.includes('superposition')) return 'Superposition';
  if (lowerDesc.includes('vqe')) return 'VQE';
  if (lowerDesc.includes('qaoa')) return 'QAOA';
  
  return 'Custom Algorithm';
}

function generateMockMeasurements(description: string): Record<string, number> {
  const lowerDesc = description.toLowerCase();
  
  // Bell state pattern
  if (lowerDesc.includes('bell') || (lowerDesc.includes('h') && lowerDesc.includes('cx'))) {
    return {
      "00": 487,
      "01": 13,
      "10": 12,
      "11": 488
    };
  }
  
  // Grover's algorithm pattern
  if (lowerDesc.includes('grover') || lowerDesc.includes('search')) {
    return {
      "00": 125,
      "01": 125,
      "10": 125,
      "11": 625  // Target state has higher probability
    };
  }
  
  // Shor's algorithm pattern
  if (lowerDesc.includes('shor') || lowerDesc.includes('factor')) {
    return {
      "000": 62,
      "001": 63,
      "010": 187,
      "011": 188,
      "100": 187,
      "101": 188,
      "110": 62,
      "111": 63
    };
  }
  
  // Superposition pattern (equal distribution)
  if (lowerDesc.includes('superposition') || lowerDesc.includes('hadamard')) {
    return {
      "00": 250,
      "01": 250,
      "10": 250,
      "11": 250
    };
  }
  
  // VQE/optimization pattern
  if (lowerDesc.includes('vqe') || lowerDesc.includes('optimization') || lowerDesc.includes('qaoa')) {
    return {
      "00": 150,
      "01": 200,
      "10": 350,
      "11": 300
    };
  }
  
  // Teleportation pattern
  if (lowerDesc.includes('teleport')) {
    return {
      "000": 500,
      "001": 0,
      "010": 0,
      "011": 0,
      "100": 0,
      "101": 0,
      "110": 0,
      "111": 500
    };
  }
  
  // Random distribution
  return {
    "00": 245,
    "01": 255,
    "10": 248,
    "11": 252
  };
}

// Export the jobs map for the status endpoint
export { jobs };
function getFidelityForAlgorithm(description: string): string {
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('bell') || lowerDesc.includes('entangl')) {
    return "97.8%";
  }
  if (lowerDesc.includes('grover')) {
    return "94.2%";
  }
  if (lowerDesc.includes('shor')) {
    return "91.5%";
  }
  if (lowerDesc.includes('superposition')) {
    return "98.5%";
  }
  if (lowerDesc.includes('vqe') || lowerDesc.includes('optimization')) {
    return "89.3%";
  }
  if (lowerDesc.includes('teleport')) {
    return "93.7%";
  }
  
  return "95.1%";
}

function getExecutionTimeForAlgorithm(description: string): string {
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('bell') || lowerDesc.includes('superposition')) {
    return "23.4ms"; // Fast for simple circuits
  }
  if (lowerDesc.includes('grover')) {
    return "156.7ms"; // Moderate for Grover's
  }
  if (lowerDesc.includes('shor')) {
    return "2.3s"; // Slow for Shor's algorithm
  }
  if (lowerDesc.includes('vqe') || lowerDesc.includes('optimization')) {
    return "847ms"; // Variable for optimization
  }
  if (lowerDesc.includes('teleport')) {
    return "78.9ms"; // Moderate for teleportation
  }
  
  return "67.2ms"; // Default moderate time
}

function getCircuitDepthForAlgorithm(description: string): number {
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('bell') || lowerDesc.includes('superposition')) {
    return 2; // Simple circuits
  }
  if (lowerDesc.includes('grover')) {
    return 8; // Moderate depth
  }
  if (lowerDesc.includes('shor')) {
    return 24; // Deep circuits
  }
  if (lowerDesc.includes('vqe') || lowerDesc.includes('optimization')) {
    return 15; // Variable depth
  }
  if (lowerDesc.includes('teleport')) {
    return 6; // Moderate depth
  }
  
  return 4; // Default depth
}