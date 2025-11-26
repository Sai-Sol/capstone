import { useState, useCallback, useEffect } from "react";
import { useAuth } from "./use-auth";

interface OptimizationSuggestion {
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  suggestion: string;
}

interface SaveOptimizationRequest {
  circuitCode: string;
  circuitDepth: number;
  gateCount: number;
  qubitCount: number;
  optimizationScore: number;
  provider: string;
  isValid: boolean;
  validationErrors?: string[];
  estimatedTimeMs?: number;
  estimatedCost?: number;
  suggestions: OptimizationSuggestion[];
  notes?: string;
  jobId?: string;
}

interface OptimizationRecord {
  id: string;
  circuit_code: string;
  circuit_depth: number;
  gate_count: number;
  qubit_count: number;
  optimization_score: number;
  provider: string;
  is_valid: boolean;
  validation_errors?: string[];
  estimated_time_ms?: number;
  estimated_cost?: number;
  notes?: string;
  job_id?: string;
  created_at: string;
  optimization_suggestions: OptimizationSuggestion[];
}

export function useOptimizations() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimizations, setOptimizations] = useState<OptimizationRecord[]>([]);
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

  const saveOptimization = useCallback(
    async (data: SaveOptimizationRequest) => {
      if (!user) {
        setError("Not authenticated");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const token = await getToken();
        const response = await fetch("/api/optimization/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Failed to save optimization");
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
    async (limit = 20, offset = 0, provider?: string) => {
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

        if (provider) {
          params.append("provider", provider);
        }

        const response = await fetch(`/api/optimization/history?${params}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch optimization history");
        }

        const data = await response.json();
        setOptimizations(data.optimizations);
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
    saveOptimization,
    fetchHistory,
    optimizations,
    total,
    loading,
    error,
  };
}
