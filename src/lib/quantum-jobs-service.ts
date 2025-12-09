import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface QuantumJob {
  id?: string;
  user_id?: string;
  job_type: string;
  provider: string;
  priority: 'low' | 'medium' | 'high';
  submission_type: 'prompt' | 'qasm' | 'preset';
  description: string;
  qasm_code?: string;
  status?: 'submitted' | 'running' | 'completed' | 'failed';
  progress?: number;
  results?: Record<string, any>;
  error_message?: string;
  execution_time_ms?: number;
  metrics?: Record<string, any>;
  submitted_at?: string;
  started_at?: string;
  completed_at?: string;
  metadata?: Record<string, any>;
}

export interface JobExecution {
  id: string;
  job_id: string;
  attempt: number;
  execution_time_ms?: number;
  fidelity?: number;
  circuit_depth?: number;
  gate_count?: number;
  measurements?: Record<string, number>;
  status: 'success' | 'failure';
  error?: string;
  created_at: string;
}

export interface JobTemplate {
  id?: string;
  user_id?: string;
  name: string;
  description?: string;
  job_type: string;
  provider: string;
  qasm_code: string;
  priority: 'low' | 'medium' | 'high';
  is_public?: boolean;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

class QuantumJobsService {
  async submitJob(job: QuantumJob, userId?: string): Promise<QuantumJob> {
    const { data, error } = await supabase
      .from('quantum_jobs')
      .insert([
        {
          user_id: userId || null,
          job_type: job.job_type,
          provider: job.provider,
          priority: job.priority,
          submission_type: job.submission_type,
          description: job.description,
          qasm_code: job.qasm_code,
          status: 'submitted',
          progress: 0,
          metrics: job.metrics || {},
          metadata: job.metadata || {},
        },
      ])
      .select()
      .single();

    if (error) throw new Error(`Failed to submit job: ${error.message}`);
    return data;
  }

  async getJob(jobId: string): Promise<QuantumJob> {
    const { data, error } = await supabase
      .from('quantum_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) throw new Error(`Failed to fetch job: ${error.message}`);
    return data;
  }

  async getUserJobs(userId: string, limit = 50, status?: string): Promise<QuantumJob[]> {
    let query = supabase
      .from('quantum_jobs')
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch jobs: ${error.message}`);
    return data || [];
  }

  async getJobsByProvider(provider: string, limit = 50): Promise<QuantumJob[]> {
    const { data, error } = await supabase
      .from('quantum_jobs')
      .select('*')
      .eq('provider', provider)
      .order('submitted_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to fetch jobs by provider: ${error.message}`);
    return data || [];
  }

  async getJobsByStatus(status: string, limit = 50): Promise<QuantumJob[]> {
    const { data, error } = await supabase
      .from('quantum_jobs')
      .select('*')
      .eq('status', status)
      .order('submitted_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to fetch jobs by status: ${error.message}`);
    return data || [];
  }

  async updateJobStatus(
    jobId: string,
    status: 'submitted' | 'running' | 'completed' | 'failed',
    progress?: number
  ): Promise<QuantumJob> {
    const updates: any = { status };

    if (status === 'running' && !progress) {
      updates.started_at = new Date().toISOString();
    }
    if (status === 'completed' || status === 'failed') {
      updates.completed_at = new Date().toISOString();
    }
    if (progress !== undefined) {
      updates.progress = progress;
    }

    const { data, error } = await supabase
      .from('quantum_jobs')
      .update(updates)
      .eq('id', jobId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update job: ${error.message}`);
    return data;
  }

  async setJobResults(
    jobId: string,
    results: Record<string, any>,
    executionTimeMs?: number,
    metrics?: Record<string, any>
  ): Promise<QuantumJob> {
    const { data, error } = await supabase
      .from('quantum_jobs')
      .update({
        results,
        execution_time_ms: executionTimeMs,
        metrics: metrics || {},
        status: 'completed',
        completed_at: new Date().toISOString(),
        progress: 100,
      })
      .eq('id', jobId)
      .select()
      .single();

    if (error) throw new Error(`Failed to set results: ${error.message}`);
    return data;
  }

  async setJobError(jobId: string, errorMessage: string): Promise<QuantumJob> {
    const { data, error } = await supabase
      .from('quantum_jobs')
      .update({
        status: 'failed',
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId)
      .select()
      .single();

    if (error) throw new Error(`Failed to set error: ${error.message}`);
    return data;
  }

  async recordExecution(
    jobId: string,
    execution: Omit<JobExecution, 'id' | 'created_at'>
  ): Promise<JobExecution> {
    const { data, error } = await supabase
      .from('job_executions')
      .insert([
        {
          job_id: jobId,
          ...execution,
        },
      ])
      .select()
      .single();

    if (error) throw new Error(`Failed to record execution: ${error.message}`);
    return data;
  }

  async getJobExecutions(jobId: string): Promise<JobExecution[]> {
    const { data, error } = await supabase
      .from('job_executions')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch executions: ${error.message}`);
    return data || [];
  }

  async saveTemplate(template: JobTemplate, userId: string): Promise<JobTemplate> {
    const { data, error } = await supabase
      .from('job_templates')
      .insert([
        {
          user_id: userId,
          name: template.name,
          description: template.description,
          job_type: template.job_type,
          provider: template.provider,
          qasm_code: template.qasm_code,
          priority: template.priority,
          is_public: template.is_public || false,
          tags: template.tags || [],
        },
      ])
      .select()
      .single();

    if (error) throw new Error(`Failed to save template: ${error.message}`);
    return data;
  }

  async getTemplates(userId: string, limit = 50): Promise<JobTemplate[]> {
    const { data, error } = await supabase
      .from('job_templates')
      .select('*')
      .or(`user_id.eq.${userId},is_public.eq.true`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to fetch templates: ${error.message}`);
    return data || [];
  }

  async getPublicTemplates(limit = 50): Promise<JobTemplate[]> {
    const { data, error } = await supabase
      .from('job_templates')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to fetch public templates: ${error.message}`);
    return data || [];
  }

  async deleteTemplate(templateId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('job_templates')
      .delete()
      .eq('id', templateId)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to delete template: ${error.message}`);
  }

  // Utility: Generate mock measurements for different job types
  generateMockResults(jobType: string): Record<string, any> {
    const patterns: Record<string, Record<string, any>> = {
      'Bell State': {
        measurements: { '00': 512, '11': 512, '01': 0, '10': 0 },
        fidelity: 0.978,
        executionTime: '23.4ms',
        circuitDepth: 2,
      },
      'Grover Search': {
        measurements: { '00': 100, '01': 100, '10': 100, '11': 724 },
        fidelity: 0.942,
        executionTime: '156.7ms',
        circuitDepth: 8,
      },
      'Deutsch-Jozsa': {
        measurements: { '00': 1024, '11': 0, '01': 0, '10': 0 },
        fidelity: 0.955,
        executionTime: '89.3ms',
        circuitDepth: 4,
      },
      'Quantum Random': {
        measurements: { '0000': 64, '0001': 62, '0010': 66, '0011': 63, '0100': 65, '0101': 62, '0110': 64, '0111': 63, '1000': 63, '1001': 65, '1010': 62, '1011': 64, '1100': 63, '1101': 66, '1110': 62, '1111': 64 },
        fidelity: 0.985,
        executionTime: '45.2ms',
        circuitDepth: 4,
      },
      'VQE': {
        measurements: { '00': 150, '01': 200, '10': 350, '11': 300 },
        fidelity: 0.893,
        executionTime: '847ms',
        circuitDepth: 15,
      },
      'QAOA': {
        measurements: { '11': 600, '00': 200, '10': 150, '01': 74 },
        fidelity: 0.904,
        executionTime: '523ms',
        circuitDepth: 12,
      },
    };

    return patterns[jobType] || {
      measurements: { '00': 256, '01': 256, '10': 256, '11': 256 },
      fidelity: 0.95,
      executionTime: '67.2ms',
      circuitDepth: 4,
    };
  }

  // Utility: Estimate job cost based on provider and complexity
  estimateCost(provider: string, circuitDepth: number, qubits: number): number {
    const baseCosts: Record<string, number> = {
      'Google Willow': 0.0018,
      'IBM Condor': 0.0015,
      'Amazon Braket': 0.0012,
    };

    const baseCost = baseCosts[provider] || 0.001;
    const depthFactor = 1 + (circuitDepth / 50);
    const qubitFactor = 1 + (qubits / 100);

    return baseCost * depthFactor * qubitFactor;
  }

  // Utility: Extract complexity metrics from QASM code
  analyzeQasm(qasmCode: string): { gates: number; depth: number; qubits: number } {
    const lines = qasmCode.split('\n').filter((line) => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('OPENQASM');
    });

    const qasmLines = lines.filter((line) => {
      const trimmed = line.trim();
      return !trimmed.startsWith('qreg') && !trimmed.startsWith('creg') && !trimmed.startsWith('include');
    });

    const gateLines = qasmLines.filter((line) => !line.includes('measure'));
    const qubitMatches = qasmCode.match(/q\[(\d+)\]/g) || [];
    const maxQubit = Math.max(
      ...(qubitMatches.map((m) => parseInt(m.match(/\d+/)![0])) || [0])
    );

    return {
      gates: gateLines.length,
      depth: Math.ceil(gateLines.length / Math.max(1, maxQubit + 1)),
      qubits: maxQubit + 1,
    };
  }
}

export const quantumJobsService = new QuantumJobsService();
