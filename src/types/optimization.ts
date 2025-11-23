// src/types/optimization.ts

export type OptimizationStatus = "idle" | "running" | "paused" | "completed";

export interface OptimizationMetrics {
  cpu: number;
  memory: number;
  speed: number;
}

export interface OptimizationResult {
  optimizedQasm: string;
  metrics: {
    depth: number;
    gates: number;
    qubits: number;
    score: number;
    time: number;
    cost: number;
  };
}
