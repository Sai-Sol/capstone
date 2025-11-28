import { NextRequest, NextResponse } from 'next/server';

interface EnhancedJobStatus {
  id: string;
  user: string;
  jobType: string;
  description: string;
  provider: string;
  priority: string;
  submissionType: string;
  txHash: string;
  timestamp: number;
  submittedAt: number;
  startedAt?: number;
  completedAt?: number;
  status: "queued" | "compiling" | "executing" | "analyzing" | "completed" | "failed" | "cancelled" | "retrying";
  progress: number;
  stage: string;
  estimatedCompletion?: number;
  actualDuration?: number;
  results?: {
    measurements: Record<string, number>;
    fidelity: string;
    executionTime: string;
    circuitDepth: number;
    shots: number;
    algorithm: string;
    provider: string;
    cost: number;
    errorMitigation: string[];
  };
  metrics?: {
    compilationTime: number;
    executionTime: number;
    fidelity: number;
    errorRate: number;
  };
  error?: string;
  retryCount?: number;
  lastRetryAt?: number;
}

interface JobAnalytics {
  totalJobs: number;
  successfulJobs: number;
  failedJobs: number;
  averageExecutionTime: number;
  averageFidelity: number;
  topAlgorithms: Array<{
    algorithm: string;
    count: number;
    avgFidelity: number;
  }>;
}

interface EnhancedJobFilter {
  provider?: string;
  status?: string;
  algorithm?: string;
  dateRange?: {
    start: number;
    end: number;
  };
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?: 'timestamp' | 'status' | 'priority' | 'duration' | 'fidelity';
  sortOrder?: 'asc' | 'desc';
}

interface AdvancedJobStorage {
  jobs: Map<string, EnhancedJobStatus>;
  queue: Array<{
    job: EnhancedJobStatus;
    result: EnhancedJobStatus;
    dependencies: string[];
    retryAttempts: number;
  }>;
  runningJobs: Set<string>;
  batchJobs: Map<string, string[]>;
}

// Enhanced job storage with queue management
class AdvancedJobStorage {
  private jobs: Map<string, EnhancedJobStatus> = new Map();
  private queue: Array<{
    job: EnhancedJobStatus;
    result: EnhancedJobStatus;
    dependencies: string[];
    retryAttempts: number;
  }> = [];
  private runningJobs: Set<string> = new Set();
  private batchJobs: Map<string, string[]> = new Map();

  constructor() {
    this.cleanup();
  }

  // Enhanced job submission with validation and circuit analysis
  async submitJob(jobData: {
    jobType: string;
    description: string;
    provider: string;
    priority: string;
    submissionType: string;
    txHash: string;
    userId?: string;
    circuitAnalysis?: any;
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
  }): Promise<{ jobId: string; error?: string }> {
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
      let circuitAnalysis;
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
      const jobStatus: EnhancedJobStatus = {
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
          fidelity: this.calculateFidelity(circuitAnalysis, jobData.provider),
          executionTime: this.calculateExecutionTime(jobData.description, jobData.priority, circuitAnalysis),
          circuitDepth: circuitAnalysis?.circuitDepth || 0,
          shots: 1024,
          algorithm: this.extractAlgorithmName(jobData.description),
          provider: jobData.provider,
          cost: this.estimateJobCost(jobData, circuitAnalysis),
          errorMitigation: []
        },
        metrics: {
          compilationTime: 0,
          executionTime: 0,
          fidelity: this.calculateFidelity(circuitAnalysis, jobData.provider),
          errorRate: this.calculateErrorRate(circuitAnalysis, jobData.provider)
        },
        retryCount: 0,
        actualDuration: undefined,
        estimatedCompletion: Date.now() + this.getJobCompletionTime(jobData, circuitAnalysis, jobData.priority)
      };

      // Store job in persistent storage
      this.jobs.set(jobId, jobStatus);
      this.addToQueue(jobId, jobData, jobStatus, jobData.dependencies || []);

      // Add to queue if dependencies are met
      this.processQueue();

      return { jobId };
    } catch (error) {
      console.error(`Job submission failed:`, error);
      return {
        jobId: '',
        error: `Job submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Enhanced circuit analysis with hardware constraints
  private analyzeCircuit(qasmCode: string, provider: string): {
    gateCount: number;
    circuitDepth: number;
    qubitCount: number;
    estimatedFidelity: number;
    optimizationSuggestions: string[];
  } | null {
    try {
      // Parse QASM code
      const lines = qasmCode.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('//'));

      if (lines.length === 0) {
        return null;
      }

      let gateCount = 0;
      let qubitCount = 0;
      let circuitDepth = 0;
      const supportedGates = new Set(['h', 'x', 'y', 'z', 'cx', 'ccx', 'rz', 'rx', 'ry', 'measure', 'creg', 'qreg']);

      // Count gates and qubits
      for (const line of lines) {
        const parts = line.split(/\s+/);
        if (parts.length >= 2 && supportedGates.has(parts[0])) {
          gateCount++;

          // Count qubits
          if (parts[1].includes('q[')) {
            const match = parts[1].match(/q\[(\d+)\]/);
            if (match) {
              qubitCount = Math.max(qubitCount, parseInt(match[1]) + 1);
            }
          }
        }
      }

      circuitDepth = Math.ceil(gateCount / Math.max(qubitCount, 1));

      // Calculate fidelity and generate suggestions
      const fidelity = this.calculateFidelity({ gateCount, circuitDepth, qubitCount }, provider);
      const optimizationSuggestions = this.generateOptimizationSuggestions(gateCount, circuitDepth, provider);

      return {
        gateCount,
        circuitDepth,
        qubitCount,
        estimatedFidelity: fidelity,
        optimizationSuggestions
      };
    } catch (error) {
      console.error('Circuit analysis failed:', error);
      return null;
    }
  }

  // Advanced fidelity calculation
  private calculateFidelity(circuitAnalysis: any, provider: string): number {
    if (!circuitAnalysis) return 0.7;

    const { gateCount, circuitDepth, qubitCount } = circuitAnalysis;
    const baseFidelity = 0.95;

    // Hardware-specific noise levels
    const noiseFactors = {
      'google-willow': { gate: 0.001, depth: 0.00001 },
      'ibm-condor': { gate: 0.003, depth: 0.00003 },
      'amazon-braket': { gate: 0.005, depth: 0.00005 }
    };

    const noiseFactor = noiseFactors[provider.toLowerCase().replace(' ', '-') as keyof typeof noiseFactors] || noiseFactors['amazon-braket'];
    const gateError = gateCount * noiseFactor.gate;
    const depthError = circuitDepth * noiseFactor.depth;

    const fidelity = Math.max(0.1, baseFidelity - gateError - depthError);
    return Math.min(0.999, fidelity);
  }

  // Enhanced execution time calculation
  private calculateExecutionTime(description: string, priority: string, circuitAnalysis?: any): number {
    const priorityMultipliers = { low: 1, medium: 1.5, high: 2 };
    const baseTime = this.getAlgorithmExecutionTime(description);

    if (circuitAnalysis) {
      const complexityMultiplier = Math.min(1.2, 1 + (circuitAnalysis.circuitDepth / 20));
      const circuitTimeMultiplier = Math.min(1.5, 1 + (circuitAnalysis.gateCount / 50));
      return baseTime * priorityMultipliers[priority as keyof typeof priorityMultipliers] * complexityMultiplier * circuitTimeMultiplier;
    }

    return baseTime * priorityMultipliers[priority as keyof typeof priorityMultipliers] || 1;
  }

  // Enhanced algorithm execution time mapping
  private getAlgorithmExecutionTime(description: string): number {
    const executionTimes = {
      'bell-state': 500,
      'grover-search': 2000,
      'quantum-teleportation': 1500,
      'superposition': 800,
      'quantum-fourier-transform': 1200,
      'random-number': 100
    };

    const lowerDesc = description.toLowerCase();

    if (lowerDesc.includes('bell') || lowerDesc.includes('h') && lowerDesc.includes('c')) return executionTimes['bell-state'];
    if (lowerDesc.includes('grover') || lowerDesc.includes('search')) return executionTimes['grover-search'];
    if (lowerDesc.includes('teleport')) return executionTimes['quantum-teleportation'];
    if (lowerDesc.includes('superposition')) return executionTimes['superposition'];
    if (lowerDesc.includes('fourier') || lowerDesc.includes('qft')) return executionTimes['quantum-fourier-transform'];
    if (lowerDesc.includes('random')) return executionTimes['random-number'];

    return 1000; // Default for custom algorithms
  }

  // Enhanced job completion time calculation
  private getJobCompletionTime(jobData: any, circuitAnalysis?: any, priority?: string): number {
    const baseTime = 30000; // 30 seconds base time
    const priorityMultipliers = { low: 1, medium: 0.7, high: 0.5 };

    if (circuitAnalysis) {
      const complexityMultiplier = Math.min(1.3, 1 + (circuitAnalysis.circuitDepth / 15));
      return baseTime * priorityMultipliers[priority as keyof typeof priorityMultipliers] * complexityMultiplier;
    }

    return baseTime * priorityMultipliers[priority as keyof typeof priorityMultipliers] || 1];
  }

  // Enhanced cost estimation
  private estimateJobCost(jobData: any, circuitAnalysis?: any): number {
    const baseCost = 0.001;
    const priorityMultipliers = { low: 1, medium: 1.5, high: 2 };
    const providerMultipliers = { 'google-willow': 1.2, 'ibm-condor': 1.1, 'amazon-braket': 1.0 };

    let circuitCost = baseCost;
    if (circuitAnalysis) {
      circuitCost += (circuitAnalysis.gateCount * 0.00001) + (circuitAnalysis.circuitDepth * 0.00002);
    }

    const priorityMultiplier = priorityMultipliers[jobData.priority as keyof typeof priorityMultipliers] || 1;
    const providerMultiplier = providerMultipliers[jobData.provider.toLowerCase().replace(' ', '-') as keyof typeof providerMultipliers] || 1];

    return circuitCost * priorityMultiplier * providerMultiplier;
  }

  // Enhanced error rate calculation
  private calculateErrorRate(circuitAnalysis: any, provider: string): number {
    if (!circuitAnalysis) return 0.05;

    const noiseFactors = {
      'google-willow': { gate: 0.001, depth: 0.00001 },
      'ibm-condor': { gate: 0.003, depth: 0.00003 },
      'amazon-braket': { gate: 0.005, depth: 0.00005 }
    };

    const noiseFactor = noiseFactors[provider.toLowerCase().replace(' ', '-') as keyof typeof noiseFactors] || noiseFactors['amazon-braket'];
    const gateError = circuitAnalysis.gateCount * noiseFactor.gate;
    const depthError = circuitAnalysis.circuitDepth * noiseFactor.depth;

    return Math.min(0.1, gateError + depthError);
  }

  // Enhanced validation
  private validateJobSubmission(jobData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic validation
    if (!jobData.jobType?.trim()) {
      errors.push('Job type is required');
    }
    if (!jobData.description?.trim()) {
      errors.push('Description is required');
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

    // Error correction validation
    if (jobData.errorCorrection?.enabled) {
      if (analysis.circuitDepth < 20) {
        errors.push('Error correction requires minimum circuit depth for overhead');
      }
    }

    // Priority validation
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(jobData.priority)) {
      errors.push(`Invalid priority level: ${jobData.priority}`);
    }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
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
        supportedGates: ['h', 'x', 'y', 'z', 'cx', 'ccx', 'rz', 'rx', 'ry', 'measure', 'creg', 'qreg']
      },
      'ibm-condor': {
        maxQubits: 127,
        maxDepth: 80,
        maxGates: 400,
        noiseLevel: 'medium',
        avgGateTime: 0.03,
        supportedGates: ['h', 'x', 'y', 'z', 'cx', 'ccx', 'rz', 'rx', 'ry', 'measure', 'creg', 'qreg', 'u1', 'u2', 'u3', 'sx', 'sxdg', 'cz']
      },
      'amazon-braket': {
        maxQubits: 80,
        maxDepth: 60,
        maxGates: 300,
        noiseLevel: 'high',
        avgGateTime: 0.05,
        supportedGates: ['h', 'x', 'y', 'z', 'cx', 'ccx', 'rz', 'rx', 'ry', 'measure', 'creg', 'qreg']
      }
    };

    return constraints[provider.toLowerCase().replace(' ', '-')] || constraints['amazon-braket'];
  }

  // Enhanced optimization suggestions
  private generateOptimizationSuggestions(gateCount: number, circuitDepth: number, provider: string): string[] {
    const suggestions = [];

    if (gateCount > 100) {
      suggestions.push('Consider gate cancellation to reduce redundant operations');
    }

    if (circuitDepth > 50) {
      suggestions.push('Apply quantum error mitigation techniques');
    }

    if (provider === 'google-willow' && gateCount > 80) {
      suggestions.push('Use IBM Condor for circuits with high gate count');
    }

    if (provider === 'ibm-condor' && gateCount > 127) {
      suggestions.push('Consider quantum error correction for deep circuits');
    }

    return suggestions;
  }

  // Enhanced queue processing with dependency management
  private addToQueue(jobId: string, jobData: any, jobStatus: EnhancedJobStatus, dependencies: string[]) {
    const queueEntry = {
      job: jobData,
      result: jobStatus,
      dependencies,
      retryAttempts: 0
    };

    this.queue.push(queueEntry);
    this.processQueue();
  }

  // Enhanced queue processing
  private async processQueue() {
    while (this.queue.length > 0 && this.runningJobs.size < 5) { // Max 5 concurrent jobs
      const queueEntry = this.queue.shift()!;

      // Check dependencies
      const dependenciesMet = queueEntry.dependencies.every(depId => {
        const depJob = this.jobs.get(depId);
        return depJob && depJob.status === 'completed';
      });

      if (!dependenciesMet) {
        // Re-queue at end
        this.queue.push(queueEntry);
        continue;
      }

      this.runningJobs.add(queueEntry.result.jobId);
      await this.executeJob(queueEntry);
    }
  }

  // Enhanced job execution with error recovery
  private async executeJob(queueEntry: { job: EnhancedJobStatus; result: EnhancedJobStatus; dependencies: string[]; retryAttempts: number }) {
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
      await this.simulateAnalysis(result, job, compilationTime, executionStart);

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
        fidelity: result.results?.fidelity || this.calculateFidelity(job.circuitAnalysis, job.provider),
        errorRate: this.calculateErrorRate(job.circuitAnalysis, job.provider)
      };

      this.jobs.set(job.jobId, result);

    } catch (error) {
      await this.handleJobFailure(result, job, error);
    }
  }

  // Enhanced simulation methods
  private async simulateCompilation(result: EnhancedJobStatus, job: any, delay: number = 200) {
    await this.simulateDelay(delay, job.priority);
    result.progress = 20;
  }

  private async simulateExecution(result: EnhancedJobStatus, job: any, compilationTime: number, delay: number = 200) {
    await this.simulateDelay(delay, job.priority);
    result.progress = 50;
  }

  private async simulateAnalysis(result: EnhancedJobStatus, job: any, compilationTime: number, executionStart: number, delay: number = 200) {
    await this.simulateDelay(delay, job.priority);
    result.progress = 80;
  }

  // Enhanced error handling and retry logic
  private async handleJobFailure(result: EnhancedJobStatus, job: any, error: any) {
    result.status = 'failed';
    result.stage = 'Job execution failed';
    result.progress = 100;
    result.error = error instanceof Error ? error.message : 'Unknown execution error';
    result.retryCount++;

    this.runningJobs.delete(result.jobId);
  }

  // Enhanced retry logic
  private async scheduleRetry(result: EnhancedJobStatus, job: any) {
    const backoffDelays = {
      exponential: (attempt: number) => Math.min(300000, 1000 * Math.pow(2, attempt)),
      linear: (attempt: number) => Math.min(300000, 5000 * (attempt + 1))
    };

    const delay = backoffDelays.exponential(result.retryCount || 1);
    result.lastRetryAt = Date.now();

    setTimeout(async () => {
      result.status = 'retrying';
      result.stage = 'Retrying job execution';

      await this.executeJob(result);
    }, delay);
  }

  // Enhanced simulation methods
  private async simulateDelay(ms: number, priority: string) {
    const priorityMultipliers = { low: 1.5, medium: 1.0, high: 0.7 };
    const multiplier = priorityMultipliers[priority as keyof typeof priorityMultipliers] || 1;
    return new Promise(resolve => setTimeout(resolve, ms * multiplier));
  }

  // Enhanced job retrieval
  getJob(jobId: string): EnhancedJobStatus | undefined {
    return this.jobs.get(jobId);
  }

  getJobStatus(jobId: string): { status: string; progress: number; stage: string } | undefined {
    const job = this.getJob(jobId);
    if (!job) return undefined;

    return {
      status: job.status,
      progress: job.progress,
      stage: job.stage
    };
  }

  // Enhanced analytics
  getJobsByUser(userAddress: string, limit: number = 20, offset: number = 0): EnhancedJobStatus[] {
    const userJobs = Array.from(this.jobs.values())
      .filter(job => job.user.toLowerCase() === userAddress.toLowerCase())
      .sort((a, b) => b.submittedAt - a.submittedAt);

    return userJobs.slice(offset, offset + limit);
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

  // Automatic cleanup
  cleanup() {
    setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000); // Cleanup every hour
  }

  // Public API methods
  export async function GET(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);
      const userAddress = searchParams.get('user');
      const status = searchParams.get('status');
      const provider = searchParams.get('provider');
      const algorithm = searchParams.get('algorithm');
      const dateStart = searchParams.get('dateStart');
      const dateEnd = searchParams.get('dateEnd');
      const limit = parseInt(searchParams.get('limit') || '20');
      const offset = parseInt(searchParams.get('offset') || '0');
      const sortBy = searchParams.get('sortBy') || 'timestamp';
      const sortOrder = searchParams.get('sortOrder') || 'desc';
      const search = searchParams.get('search');

      // Enhanced filters and pagination
      const filters: EnhancedJobFilter = {
        provider,
        status,
        algorithm,
        dateRange: dateStart && dateEnd ? { start: parseInt(dateStart), end: parseInt(dateEnd) } : undefined,
        limit,
        offset,
        search,
        sortBy,
        sortOrder
      };

      // Process jobs to enhanced format
      const enhancedJobs = Array.from(this.jobs.values()).map(job => ({
        ...job,
        status: job.status as any,
        stage: job.stage as string || 'queued'
      }));

      // Apply filters
      let filteredJobs = enhancedJobs;
      if (status) {
        filteredJobs = filteredJobs.filter(job => job.status === status);
      }
      if (provider) {
        filteredJobs = filteredJobs.filter(job => job.provider === provider);
      }
      if (algorithm) {
        filteredJobs = filteredJobs.filter(job => job.results?.algorithm?.toLowerCase().includes(algorithm.toLowerCase()));
      }
      if (search) {
        const searchLower = search.toLowerCase();
        filteredJobs = filteredJobs.filter(job =>
          job.description.toLowerCase().includes(searchLower) ||
          job.results?.algorithm?.toLowerCase().includes(searchLower) ||
          job.user.toLowerCase().includes(searchLower)
        );
      }
      if (filters.dateRange) {
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        filteredJobs = filteredJobs.filter(job =>
          job.submittedAt >= startDate && job.submittedAt <= endDate
        );
      }

      // Apply sorting
      filteredJobs.sort((a, b) => {
        const aValue = sortBy === 'timestamp' ? a.timestamp : sortBy === 'duration' ? (a.metrics?.executionTime || 0) : sortBy === 'fidelity' ? (parseFloat(a.metrics?.fidelity) || '0') : 0;
        const bValue = sortBy === 'timestamp' ? b.timestamp : sortBy === 'duration' ? (b.metrics?.executionTime || 0) : sortBy === 'fidelity' ? (parseFloat(b.metrics?.fidelity) || '0') : 0;
        const order = sortOrder === 'desc' ? bValue - aValue : bValue - aValue;
        return order;
      });

      // Calculate pagination
      const totalJobs = filteredJobs.length;
      const totalPages = Math.ceil(totalJobs / limit);
      const hasNext = offset + limit < totalJobs;
      const hasPrev = offset > 0;

      // Enhanced analytics
      const successfulJobs = filteredJobs.filter(job => job.status === 'completed');
      const failedJobs = filteredJobs.filter(job => job.status === 'failed');
      const averageExecutionTime = successfulJobs.length > 0
        ? successfulJobs.reduce((sum, job) => sum + (job.metrics?.executionTime || 0), 0) / successfulJobs.length
        : 0;
      const averageFidelity = successfulJobs.length > 0
        ? successfulJobs.reduce((sum, job) => sum + parseFloat(job.metrics?.fidelity || '0'), 0) / successfulJobs.length
        : 0;

      // Calculate top algorithms
      const algorithmCounts = new Map<string, { count: number; totalFidelity: number }>();
      successfulJobs.forEach(job => {
        const algorithm = job.results?.algorithm || 'unknown';
        const current = algorithmCounts.get(algorithm) || { count: 0, totalFidelity: 0 };
        algorithmCounts.set(algorithm, {
          count: current.count + 1,
          totalFidelity: current.totalFidelity + parseFloat(job.metrics?.fidelity || '0')
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

      return NextResponse.json({
        jobs: filteredJobs.slice(offset, offset + limit),
        analytics: {
          totalJobs,
          successfulJobs,
          failedJobs,
          averageExecutionTime,
          averageFidelity,
          topAlgorithms
        },
        filters,
        pagination: {
          page: Math.floor(offset / limit) + 1,
          limit,
          total: totalJobs,
          hasNext,
          hasPrev
        }
      });
    } catch (error) {
      console.error('Enhanced quantum jobs API error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch enhanced quantum jobs' },
        { status: 500 }
      );
    }
  }
}