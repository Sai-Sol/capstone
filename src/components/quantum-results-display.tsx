"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  RefreshCw,
  Target,
  Cpu,
  Database
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-5xl max-h-[90vh] overflow-auto"
        >
          <Card className="quantum-card shadow-2xl border-primary/30">
            <CardHeader className="pb-4 bg-gradient-to-r from-primary/10 to-purple-500/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-3xl font-headline flex items-center gap-3">
                  <div className="p-3 bg-primary/20 rounded-xl">
                    <Atom className="h-8 w-8 text-primary quantum-pulse" />
                  </div>
                  <div>
                    <div className="text-primary">Quantum Execution Results</div>
                    <div className="text-sm text-muted-foreground font-normal mt-1">
                      Real quantum computing results from {result?.results?.provider || 'quantum hardware'}
                    </div>
                  </div>
                </CardTitle>
                <Button variant="ghost" onClick={onClose} className="text-muted-foreground hover:text-foreground">
                  ✕
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-8 p-8">
              {isLoading && !result && (
                <div className="text-center py-12">
                  <div className="relative mx-auto w-16 h-16 mb-6">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <Atom className="absolute inset-2 text-primary quantum-pulse" />
                  </div>
                  <p className="text-lg text-muted-foreground">Loading quantum results...</p>
                </div>
              )}

              {error && (
                <Alert className="border-red-500/30 bg-red-500/10">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <AlertDescription className="text-red-200">
                    <div className="font-semibold mb-1">Error Loading Results</div>
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {result && (
                <div className="space-y-8">
                  {/* Job Status Header */}
                  <div className="flex items-center justify-between p-6 rounded-xl bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/20">
                    <div className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded-full ${
                        result.status === 'completed' ? 'bg-green-400 animate-pulse' :
                        result.status === 'failed' ? 'bg-red-400' :
                        'bg-yellow-400 animate-pulse'
                      }`} />
                      <div>
                        <h3 className="text-xl font-semibold text-primary">Job {result.jobId}</h3>
                        <p className="text-sm text-muted-foreground">
                          Status: <span className="capitalize font-medium text-foreground">{result.status}</span>
                        </p>
                      </div>
                    </div>
                    {result.status === "running" && (
                      <Button variant="outline" size="sm" onClick={() => fetchJobStatus(jobId)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh Status
                      </Button>
                    )}
                  </div>

                  {/* Execution Progress */}
                  {result.status === "running" && (
                    <Card className="border-blue-500/30 bg-blue-500/5">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-medium">Quantum Execution Progress</span>
                            <span className="text-2xl font-bold text-blue-400">{Math.round(result.progress)}%</span>
                          </div>
                          <Progress value={result.progress} className="h-4" />
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Cpu className="h-4 w-4" />
                            <span>Executing quantum algorithm on {result.results?.provider || 'quantum processor'}...</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Quantum Results */}
                  {result.status === "completed" && result.results && (
                    <div className="space-y-8">
                      {/* Algorithm Summary */}
                      <Card className="border-green-500/30 bg-green-500/5">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-green-400">
                            <CheckCircle className="h-6 w-6" />
                            Execution Successful
                          </CardTitle>
                          <CardDescription className="text-green-200/80">
                            Your quantum algorithm executed successfully on real quantum hardware
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                              <Atom className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                              <div className="text-sm text-blue-200 mb-1">Algorithm</div>
                              <div className="text-lg font-bold text-blue-100">{result.results.algorithm}</div>
                            </div>
                            
                            <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                              <Clock className="h-8 w-8 text-green-400 mx-auto mb-2" />
                              <div className="text-sm text-green-200 mb-1">Execution Time</div>
                              <div className="text-lg font-bold text-green-100">{result.results.executionTime}</div>
                            </div>

                            <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                              <Target className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                              <div className="text-sm text-purple-200 mb-1">Fidelity</div>
                              <div className="text-lg font-bold text-purple-100">{result.results.fidelity}</div>
                            </div>

                            <div className="text-center p-4 rounded-lg bg-pink-500/10 border border-pink-500/20">
                              <Database className="h-8 w-8 text-pink-400 mx-auto mb-2" />
                              <div className="text-sm text-pink-200 mb-1">Measurements</div>
                              <div className="text-lg font-bold text-pink-100">{result.results.shots.toLocaleString()}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Quantum Measurements Visualization */}
                      <Card className="border-primary/30">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-primary">
                            <BarChart3 className="h-6 w-6" />
                            Quantum Measurement Results
                          </CardTitle>
                          <CardDescription className="text-muted-foreground">
                            Probability distribution of quantum states after measurement collapse
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Explanation */}
                          <Alert className="border-blue-500/30 bg-blue-500/5">
                            <Activity className="h-4 w-4" />
                            <AlertDescription className="text-blue-200">
                              <strong>Understanding Your Results:</strong> Each bar shows how often a quantum state was measured. 
                              In quantum computing, we run the circuit multiple times to see the probability distribution of outcomes.
                            </AlertDescription>
                          </Alert>
                          
                          {/* State Distribution Cards */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(result.results.measurements).map(([state, count]) => {
                              const percentage = (count / result.results!.shots * 100);
                              return (
                                <motion.div
                                  key={state}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-center"
                                >
                                  <div className="text-2xl font-mono font-bold text-primary mb-2">|{state}⟩</div>
                                  <div className="text-sm text-muted-foreground mb-1">{count} times</div>
                                  <div className="text-lg font-bold text-green-400">{percentage.toFixed(1)}%</div>
                                  <div className="text-xs text-muted-foreground">probability</div>
                                </motion.div>
                              );
                            })}
                          </div>

                          {/* Visual Bar Chart */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-foreground">Probability Distribution</h4>
                            {Object.entries(result.results.measurements).map(([state, count]) => {
                              const percentage = (count / result.results!.shots * 100);
                              return (
                                <div key={state} className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="font-mono text-sm">|{state}⟩ quantum state</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                                      <span className="text-xs text-muted-foreground">({count} measurements)</span>
                                    </div>
                                  </div>
                                  <div className="h-3 bg-muted/20 rounded-full overflow-hidden">
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
                        </CardContent>
                      </Card>

                      {/* Technical Details */}
                      <Card className="border-primary/30">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-primary">
                            <Zap className="h-6 w-6" />
                            Technical Execution Details
                          </CardTitle>
                          <CardDescription className="text-muted-foreground">
                            Performance metrics and technical specifications from quantum hardware
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                              <div className="text-sm text-muted-foreground">Quantum Provider</div>
                              <div className="text-lg font-semibold text-blue-400">{result.results.provider}</div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm text-muted-foreground">Circuit Depth</div>
                              <div className="text-lg font-semibold text-purple-400">{result.results.circuitDepth} layers</div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm text-muted-foreground">Total Shots</div>
                              <div className="text-lg font-semibold text-green-400">{result.results.shots.toLocaleString()}</div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm text-muted-foreground">Quantum Fidelity</div>
                              <div className="text-lg font-semibold text-pink-400">{result.results.fidelity}</div>
                            </div>
                          </div>
                          
                          <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="h-5 w-5 text-green-400" />
                              <span className="font-semibold text-green-200">Execution Complete</span>
                            </div>
                            <p className="text-sm text-green-200/80">
                              Your quantum algorithm executed successfully on real quantum hardware. 
                              The results above show the quantum measurement outcomes, permanently recorded on the MegaETH blockchain for verification.
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-4">
                        <Button onClick={downloadResults} className="quantum-button flex-1 min-w-[200px]">
                          <Download className="mr-2 h-5 w-5" />
                          Download Results
                        </Button>
                        <Button variant="outline" asChild className="flex-1 min-w-[200px]">
                          <a href="/dashboard/results">
                            <BarChart3 className="mr-2 h-5 w-5" />
                            View All Results
                          </a>
                        </Button>
                        <Button variant="outline" onClick={onClose} className="flex-1 min-w-[200px]">
                          <Activity className="mr-2 h-5 w-5" />
                          Continue Working
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Error Display */}
                  {result.status === "failed" && result.error && (
                    <Alert className="border-red-500/30 bg-red-500/10">
                      <AlertTriangle className="h-5 w-5" />
                      <AlertDescription className="text-red-200">
                        <div className="font-semibold text-red-400 mb-2">Quantum Execution Failed</div>
                        <div className="text-red-200/80">{result.error}</div>
                        <div className="mt-3 text-sm">
                          <strong>What to try:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Check your algorithm syntax</li>
                            <li>Try a different quantum provider</li>
                            <li>Reduce circuit complexity</li>
                            <li>Contact support if the issue persists</li>
                          </ul>
                        </div>
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