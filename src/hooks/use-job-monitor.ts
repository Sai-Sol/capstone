import { useState, useEffect, useCallback } from 'react';

export interface JobStatus {
  id: string;
  status: 'submitted' | 'running' | 'completed' | 'failed';
  progress: number;
  results?: Record<string, any>;
  error_message?: string;
  execution_time_ms?: number;
  metrics?: Record<string, any>;
  submitted_at: string;
  started_at?: string;
  completed_at?: string;
}

export function useJobMonitor(jobId: string | null, pollInterval = 1000) {
  const [job, setJob] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobStatus = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/job-status?jobId=${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch job status');
      }

      const data = await response.json();
      setJob(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Job monitor error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!jobId) {
      setJob(null);
      return;
    }

    // Initial fetch
    fetchJobStatus(jobId);

    // Set up polling for job completion
    const interval = setInterval(async () => {
      const jobData = await fetchJobStatus(jobId);

      if (jobData?.status === 'completed' || jobData?.status === 'failed') {
        clearInterval(interval);
      }
    }, pollInterval);

    return () => clearInterval(interval);
  }, [jobId, pollInterval, fetchJobStatus]);

  return { job, loading, error };
}

export function useUserJobs(userId: string | null, status?: string, pollInterval = 5000) {
  const [jobs, setJobs] = useState<JobStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserJobs = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      let url = `/api/job-status?userId=${id}`;
      if (status) url += `&status=${status}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch user jobs');
      }

      const data = await response.json();
      setJobs(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('User jobs error:', err);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (!userId) {
      setJobs([]);
      return;
    }

    // Initial fetch
    fetchUserJobs(userId);

    // Set up polling for updates
    const interval = setInterval(() => {
      fetchUserJobs(userId);
    }, pollInterval);

    return () => clearInterval(interval);
  }, [userId, status, pollInterval, fetchUserJobs]);

  const refetch = useCallback(() => {
    if (userId) {
      fetchUserJobs(userId);
    }
  }, [userId, fetchUserJobs]);

  return { jobs, loading, error, refetch };
}
