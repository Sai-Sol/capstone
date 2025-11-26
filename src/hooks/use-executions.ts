import { useState, useCallback } from "react";
import { useAuth } from "./use-auth";

interface ExecutionEnvironment {
  seed: number;
  hardware: string;
  framework: string;
  version: string;
}

interface ExecutionMetrics {
  duration: number;
  accuracy: number;
  iterations: number;
}

interface SaveExecutionRequest {
  jobId: string;
  circuitCode: string;
  status: "running" | "success" | "failed";
  environment: ExecutionEnvironment;
  parameters: Record<string, string | number>;
  metrics: ExecutionMetrics;
  results?: any;
  notes?: string;
}

interface ExecutionRecord {
  id: string;
  job_id: string;
  circuit_code: string;
  status: "running" | "success" | "failed";
  environment: ExecutionEnvironment;
  parameters: Record<string, string | number>;
  metrics: ExecutionMetrics;
  input_hash: string;
  output_hash: string | null;
  results?: any;
  notes?: string;
  execution_time_ms: number;
  created_at: string;
  completed_at: string | null;
}

export function useExecutions() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executions, setExecutions] = useState<ExecutionRecord[]>([]);
  const [total, setTotal] = useState(0);

  const getToken = useCallback(async () => {
    if (!user?.email) {
      throw new Error("User email not available");
    }
    try {
      const response = await fetch("/api/auth/token", {
        headers: {
          "x-user-email": user.email,
        },
      });
      if (!response.ok) throw new Error("Failed to get token");
      const { token } = await response.json();
      return token;
    } catch (err) {
      throw new Error("Failed to get auth token");
    }
  }, [user?.email])

  const saveExecution = useCallback(
    async (data: SaveExecutionRequest) => {
      if (!user) {
        setError("Not authenticated");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const token = await getToken();
        const response = await fetch("/api/execution/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Failed to save execution record");
        }

        const result = await response.json();
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user, getToken]
  );

  const fetchHistory = useCallback(
    async (limit = 20, offset = 0, status?: string, jobId?: string) => {
      if (!user) {
        setError("Not authenticated");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = await getToken();
        const params = new URLSearchParams({
          limit: limit.toString(),
          offset: offset.toString(),
        });

        if (status) {
          params.append("status", status);
        }

        if (jobId) {
          params.append("jobId", jobId);
        }

        const response = await fetch(`/api/execution/history?${params}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch execution records");
        }

        const data = await response.json();
        setExecutions(data.executions);
        setTotal(data.total);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [user, getToken]
  );

  return {
    saveExecution,
    fetchHistory,
    executions,
    total,
    loading,
    error,
  };
}
