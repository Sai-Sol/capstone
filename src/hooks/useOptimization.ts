// src/hooks/useOptimization.ts

import { useState, useEffect, useCallback } from "react";
import { optimizationService } from "@/services/optimizationService";
import {
  OptimizationStatus,
  OptimizationMetrics,
  OptimizationResult,
} from "@/types/optimization";

export function useOptimization() {
  const [status, setStatus] = useState<OptimizationStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [metrics, setMetrics] = useState<OptimizationMetrics>({
    cpu: 0,
    memory: 0,
    speed: 0,
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<OptimizationResult | null>(null);

  const handleStatusChange = useCallback((newStatus: OptimizationStatus) => {
    setStatus(newStatus);
  }, []);

  const handleProgressChange = useCallback((newProgress: { value: number }) => {
    setProgress(newProgress.value);
  }, []);

  const handleMetricsChange = useCallback((newMetrics: OptimizationMetrics) => {
    setMetrics(newMetrics);
  }, []);

  const handleLog = useCallback((log: string) => {
    setLogs((prevLogs) => [...prevLogs, log]);
  }, []);

  const handleResult = useCallback((newResult: OptimizationResult) => {
    setResult(newResult);
  }, []);

  useEffect(() => {
    optimizationService.on("status", handleStatusChange);
    optimizationService.on("progress", handleProgressChange);
    optimizationService.on("metrics", handleMetricsChange);
    optimizationService.on("log", handleLog);
    optimizationService.on("result", handleResult);

    return () => {
      optimizationService.off("status", handleStatusChange);
      optimizationService.off("progress", handleProgressChange);
      optimizationService.off("metrics", handleMetricsChange);
      optimizationService.off("log", handleLog);
      optimizationService.off("result", handleResult);
    };
  }, [
    handleStatusChange,
    handleProgressChange,
    handleMetricsChange,
    handleLog,
    handleResult,
  ]);

  const start = (circuitCode: string) => optimizationService.start(circuitCode);
  const pause = () => optimizationService.pause();
  const resume = () => optimizationService.resume();
  const stop = () => optimizationService.stop();

  return {
    status,
    progress,
    metrics,
    logs,
    result,
    start,
    pause,
    resume,
    stop,
  };
}
