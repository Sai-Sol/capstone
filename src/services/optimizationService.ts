// src/services/optimizationService.ts

import {
  OptimizationStatus,
  OptimizationMetrics,
  OptimizationResult,
} from "@/types/optimization";

type EventCallback<T> = (data: T) => void;

class OptimizationService {
  private listeners: { [key: string]: EventCallback<any>[] } = {};
  private intervalId: NodeJS.Timeout | null = null;
  private progress = 0;
  private status: OptimizationStatus = "idle";

  on<T>(event: string, callback: EventCallback<T>) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off<T>(event: string, callback: EventCallback<T>) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(
      (l) => l !== callback
    );
  }

  private emit<T>(event: string, data: T) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach((callback) => callback(data));
  }

  start(circuitCode: string) {
    if (this.status !== "idle" && this.status !== "completed") return;

    this.emit("log", `[INFO] Starting optimization for circuit...`);
    this.status = "running";
    this.progress = 0;
    this.emit<OptimizationStatus>("status", this.status);

    const gateCount = (circuitCode.match(/\b[a-z]+\s+q\[/gi) || []).length;
    const qubitMatches = circuitCode.match(/q\[(\d+)\]/g) || [];
    const maxQubit =
      qubitMatches.length > 0
        ? Math.max(
            ...qubitMatches.map((m: string) =>
              parseInt(m.match(/\d+/)![0])
            )
          )
        : 0;

    this.intervalId = setInterval(() => {
      if (this.status === "running") {
        this.progress += Math.random() * 10;
        if (this.progress > 100) {
          this.progress = 100;
        }

        this.emit<{ value: number }>("progress", { value: this.progress });
        this.emit<OptimizationMetrics>("metrics", {
          cpu: Math.random() * 80 + 10,
          memory: Math.random() * 500 + 200,
          speed: Math.random() * 1000 + 500,
        });
        this.emit<string>("log", `[INFO] Optimization at ${this.progress.toFixed(0)}%...`);

        if (this.progress >= 100) {
          this.status = "completed";
          this.emit<OptimizationStatus>("status", this.status);
          this.emit<OptimizationResult>("result", {
            optimizedQasm: `// Optimized QASM\n${circuitCode.replace(/;/g, "; // optimized")}`,
            metrics: {
              depth: Math.floor(Math.random() * 5) + 3,
              gates: gateCount - Math.floor(Math.random() * 3),
              qubits: maxQubit + 1,
              score: Math.floor(Math.random() * 20) + 80,
              time: Math.floor(Math.random() * 100) + 100,
              cost: Math.random() * 10 + 5,
            },
          });
          if (this.intervalId) clearInterval(this.intervalId);
        }
      }
    }, 500);
  }

  pause() {
    if (this.status !== "running") return;
    this.status = "paused";
    this.emit<OptimizationStatus>("status", this.status);
    this.emit<string>("log", "[WARN] Optimization paused.");
  }

  resume() {
    if (this.status !== "paused") return;
    this.status = "running";
    this.emit<OptimizationStatus>("status", this.status);
    this.emit<string>("log", "[INFO] Optimization resumed.");
  }

  stop() {
    if (this.status === "idle" || this.status === "completed") return;

    this.status = "idle";
    this.progress = 0;
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = null;

    this.emit<OptimizationStatus>("status", this.status);
    this.emit<{ value: number }>("progress", { value: 0 });
    this.emit<string>("log", "[ERROR] Optimization stopped by user.");
  }
}

export const optimizationService = new OptimizationService();
