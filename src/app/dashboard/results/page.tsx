"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { 
  BarChart3, 
  Download, 
  ExternalLink,
  Atom,
  Clock,
  Target,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { formatDistanceToNow } from "date-fns";
import { jobService, QuantumJob } from "@/services/jobService";

export default function ResultsPage() {
  const { address } = useWallet();
  const [result, setResult] = useState<QuantumJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, []);

  const fetchResult = () => {
    setIsLoading(true);
    const latestJob = jobService.getLatestJob();
    if (latestJob) {
      setResult(latestJob);
    }
    setIsLoading(false);
  };

  const downloadResult = (result: QuantumJob) => {
    const data = {
      jobId: result.id,
      algorithm: result.algorithm,
      provider: result.provider,
      results: result.results,
      timestamp: new Date(result.completedAt!).toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quantum-results-${result.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Latest Quantum Result
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          View the result of your most recently submitted quantum job.
        </p>
      </motion.div>

      <div className="flex justify-center">
        <Button onClick={fetchResult}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Results
        </Button>
      </div>

      {/* Results Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {isLoading ? (
            <Card className="quantum-card">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted/50 rounded w-3/4"></div>
                  <div className="h-8 bg-muted/50 rounded"></div>
                  <div className="h-4 bg-muted/50 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
        ) : !result ? (
          <Card className="quantum-card">
            <CardContent className="p-12 text-center">
              <BarChart3 className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Results Found</h3>
              <p className="text-muted-foreground">
                Submit your first quantum job to see results here.
              </p>
            </CardContent>
          </Card>
        ) : (
            <Card className="quantum-card hover:scale-105 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Atom className="h-5 w-5 text-primary" />
                    {result.algorithm}
                  </CardTitle>
                  <Badge variant="outline" className={
                    result.status === 'completed' ? "text-green-400 border-green-400/50" :
                    result.status === 'failed' ? "text-red-400 border-red-400/50" :
                    "text-yellow-400 border-yellow-400/50"
                  }>
                    {result.status === 'completed' && <CheckCircle className="mr-1 h-3 w-3" />}
                    {result.status === 'failed' && <AlertTriangle className="mr-1 h-3 w-3" />}
                    {result.status === 'running' && <RefreshCw className="mr-1 h-3 w-3 animate-spin" />}
                    {result.status}
                  </Badge>
                </div>
                <CardDescription>
                  Job ID: {result.id} • {result.provider}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {result.results && (
                  <>
                    {/* Quick Metrics */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-purple-400" />
                        <span className="text-muted-foreground">Fidelity:</span>
                        <span className="font-semibold text-purple-400">{result.results.fidelity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-400" />
                        <span className="text-muted-foreground">Time:</span>
                        <span className="font-semibold text-green-400">{result.results.executionTime}</span>
                      </div>
                    </div>

                    {/* Top Measurement States */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-foreground">Top Measurement States:</div>
                      {Object.entries(result.results.measurements)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 3)
                        .map(([state, count]) => {
                          const percentage = (count / result.results!.shots * 100);
                          return (
                            <div key={state} className="flex items-center justify-between text-xs">
                              <span className="font-mono">|{state}⟩</span>
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1 bg-muted/20 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="font-semibold w-12 text-right">{percentage.toFixed(1)}%</span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </>
                )}

                {/* Timestamp */}
                <div className="text-xs text-muted-foreground">
                  {result.completedAt
                    ? `Completed ${formatDistanceToNow(new Date(result.completedAt), { addSuffix: true })}`
                    : `Submitted ${formatDistanceToNow(new Date(result.submittedAt), { addSuffix: true })}`
                  }
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => downloadResult(result)}>
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`https://www.megaexplorer.xyz/tx/${result.txHash}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Verify
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
        )}
      </motion.div>
    </div>
  );
}
