"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Atom, 
  Activity, 
  Clock, 
  Zap, 
  CheckCircle, 
  AlertTriangle,
  BarChart3,
  Download,
  ExternalLink,
  RefreshCw
} from "lucide-react";

interface QuantumResult {
  jobId: string;
  status: "running" | "completed" | "failed";
  progress: number;
  submittedAt: number;
  completedAt?: number;
  results?: {
    measurements: Record<string, number>;
    fidelity: string;
    executionTime: string;
    circuitDepth: number;
    shots: number;
    algorithm: string;
    provider: string;
  };
  error?: string;
}

interface QuantumResultsDisplayProps {
  jobId: string | null;
  onClose: () => void;
}

export default function QuantumResultsDisplay({ jobId, onClose }: QuantumResultsDisplayProps) {
  const [result, setResult] = useState<QuantumResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) {
      fetchJobStatus(jobId);
      const interval = setInterval(() => {
        if (result?.status === "running") {
          fetchJobStatus(jobId);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [jobId, result?.status]);

  const fetchJobStatus = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/job-status/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch job status');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadResults = () => {
    if (!result?.results) return;
    
    const data = {
      jobId: result.jobId,
      algorithm: result.results.algorithm,
      provider: result.results.provider,
      measurements: result.results.measurements,
      fidelity: result.results.fidelity,
      executionTime: result.results.executionTime,
      circuitDepth: result.results.circuitDepth,
      shots: result.results.shots,
      timestamp: new Date(result.completedAt!).toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quantum-results-${result.jobId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!jobId) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-4xl max-h-[90vh] overflow-auto"
        >
          <Card className="quantum-card shadow-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-headline flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Atom className="h-6 w-6 text-primary quantum-pulse" />
                  </div>
                  Quantum Execution Results
                </CardTitle>
                <Button variant="ghost" onClick={onClose}>
                  ✕
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {isLoading && !result && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading quantum results...</p>
                </div>
              )}

              {error && (
                <Alert className="border-red-500/20 bg-red-500/5">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-red-200/80">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {result && (
                <div className="space-y-6">
                  {/* Job Status */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        result.status === 'completed' ? 'bg-green-400' :
                        result.status === 'failed' ? 'bg-red-400' :
                        'bg-yellow-400'
                      } animate-pulse`} />
                      <div>
                        <h3 className="font-semibold text-primary">Job {result.jobId}</h3>
                        <p className="text-sm text-muted-foreground">
                          Status: <span className="capitalize font-medium">{result.status}</span>
                        </p>
                      </div>
                    </div>
                    {result.status === "running" && (
                      <Button variant="ghost" size="sm" onClick={() => fetchJobStatus(jobId)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {result.status === "running" && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Quantum Execution Progress</span>
                        <span>{Math.round(result.progress)}%</span>
                      </div>
                      <Progress value={result.progress} className="h-3" />
                      <p className="text-xs text-muted-foreground">
                        Executing quantum algorithm on quantum processor...
                      </p>
                    </div>
                  )}

                  {/* Execution Results */}
                  {result.status === "completed" && result.results && (
                    <div className="space-y-6">
                      {/* Algorithm Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Atom className="h-5 w-5 text-blue-400" />
                            <span className="text-sm font-medium text-blue-200">Algorithm</span>
                          </div>
                          <p className="text-lg font-bold text-blue-100">{result.results.algorithm}</p>
                        </div>
                        
                        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-5 w-5 text-green-400" />
                            <span className="text-sm font-medium text-green-200">Execution Time</span>
                          </div>
                          <p className="text-lg font-bold text-green-100">{result.results.executionTime}</p>
                        </div>

                        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="h-5 w-5 text-purple-400" />
                            <span className="text-sm font-medium text-purple-200">Fidelity</span>
                          </div>
                          <p className="text-lg font-bold text-purple-100">{result.results.fidelity}</p>
                        </div>
                      </div>

                      {/* Quantum Measurements */}
                      <Card className="border-primary/20">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            Quantum Measurement Results
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {Object.entries(result.results.measurements).map(([state, count]) => {
                                const percentage = (count / result.results!.shots * 100).toFixed(1);
                                return (
                                  <motion.div
                                    key={state}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 rounded-lg bg-muted/20 border border-primary/10"
                                  >
                                    <div className="text-center">
                                      <div className="font-mono text-lg font-bold text-primary">|{state}⟩</div>
                                      <div className="text-sm text-muted-foreground">{count} shots</div>
                                      <div className="text-xs font-medium text-green-400">{percentage}%</div>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>

                            {/* Visual Bar Chart */}
                            <div className="space-y-2">
                              {Object.entries(result.results.measurements).map(([state, count]) => {
                                const percentage = (count / result.results!.shots * 100);
                                return (
                                  <div key={state} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span className="font-mono">|{state}⟩</span>
                                      <span>{percentage.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Technical Details */}
                      <Card className="border-primary/20">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-primary" />
                            Technical Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Provider:</span>
                              <div className="font-medium">{result.results.provider}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Circuit Depth:</span>
                              <div className="font-medium">{result.results.circuitDepth}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total Shots:</span>
                              <div className="font-medium">{result.results.shots.toLocaleString()}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Fidelity:</span>
                              <div className="font-medium text-green-400">{result.results.fidelity}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Button onClick={downloadResults} className="quantum-button">
                          <Download className="mr-2 h-4 w-4" />
                          Download Results
                        </Button>
                        <Button variant="outline" asChild>
                          <a href="/dashboard/history" target="_blank">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View in History
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Error Display */}
                  {result.status === "failed" && result.error && (
                    <Alert className="border-red-500/20 bg-red-500/5">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-red-200/80">
                        <div className="font-semibold text-red-400 mb-1">Execution Failed</div>
                        {result.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}