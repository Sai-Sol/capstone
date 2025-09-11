"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BarChart3, 
  Search, 
  Filter, 
  Download, 
  ExternalLink,
  Atom,
  Clock,
  Target,
  Database,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useWallet } from "@/hooks/use-wallet";
import { formatDistanceToNow } from "date-fns";

interface QuantumJobResult {
  id: string;
  algorithm: string;
  provider: string;
  status: 'completed' | 'failed' | 'running';
  submittedAt: number;
  completedAt?: number;
  results?: {
    measurements: Record<string, number>;
    fidelity: string;
    executionTime: string;
    circuitDepth: number;
    shots: number;
  };
  txHash: string;
  user: string;
}

export default function ResultsPage() {
  const { user } = useAuth();
  const { isConnected, address } = useWallet();
  const [results, setResults] = useState<QuantumJobResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<QuantumJobResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProvider, setFilterProvider] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchResults();
  }, []);

  useEffect(() => {
    filterResults();
  }, [results, searchTerm, filterProvider, filterStatus]);

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      // Mock quantum job results with realistic data
      const mockResults: QuantumJobResult[] = [
        {
          id: "QC-ABC123",
          algorithm: "Bell State Creation",
          provider: "Google Willow",
          status: "completed",
          submittedAt: Date.now() - 3600000,
          completedAt: Date.now() - 3590000,
          results: {
            measurements: { "00": 487, "01": 13, "10": 12, "11": 488 },
            fidelity: "97.8%",
            executionTime: "23.4ms",
            circuitDepth: 2,
            shots: 1024
          },
          txHash: "0xabcdef1234567890abcdef1234567890abcdef12",
          user: address || "0x1234567890123456789012345678901234567890"
        },
        {
          id: "QC-DEF456",
          algorithm: "Grover's Search",
          provider: "IBM Condor",
          status: "completed",
          submittedAt: Date.now() - 7200000,
          completedAt: Date.now() - 7190000,
          results: {
            measurements: { "00": 125, "01": 125, "10": 125, "11": 625 },
            fidelity: "94.2%",
            executionTime: "156.7ms",
            circuitDepth: 8,
            shots: 1024
          },
          txHash: "0xbcdef1234567890abcdef1234567890abcdef123",
          user: address || "0x1234567890123456789012345678901234567890"
        },
        {
          id: "QC-GHI789",
          algorithm: "Quantum Superposition",
          provider: "Amazon Braket",
          status: "completed",
          submittedAt: Date.now() - 10800000,
          completedAt: Date.now() - 10790000,
          results: {
            measurements: { "000": 128, "001": 127, "010": 129, "011": 126, "100": 128, "101": 127, "110": 129, "111": 130 },
            fidelity: "98.5%",
            executionTime: "45.2ms",
            circuitDepth: 3,
            shots: 1024
          },
          txHash: "0xcdef1234567890abcdef1234567890abcdef1234",
          user: address || "0x1234567890123456789012345678901234567890"
        }
      ];

      setResults(mockResults);
    } catch (error) {
      console.error('Failed to fetch results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterResults = () => {
    let filtered = results;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(result => 
        result.algorithm.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.provider.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by provider
    if (filterProvider !== "all") {
      filtered = filtered.filter(result => result.provider === filterProvider);
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(result => result.status === filterStatus);
    }

    setFilteredResults(filtered);
  };

  const downloadResult = (result: QuantumJobResult) => {
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
          Quantum Execution Results
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          View and analyze your quantum computing results with detailed measurements and blockchain verification
        </p>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="quantum-card">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by algorithm, job ID, or provider..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="quantum-input pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select 
                  value={filterProvider} 
                  onChange={(e) => setFilterProvider(e.target.value)}
                  className="px-3 py-2 rounded-md border border-input bg-background text-foreground"
                >
                  <option value="all">All Providers</option>
                  <option value="Google Willow">Google Willow</option>
                  <option value="IBM Condor">IBM Condor</option>
                  <option value="Amazon Braket">Amazon Braket</option>
                </select>
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 rounded-md border border-input bg-background text-foreground"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="running">Running</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="quantum-card">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-muted/50 rounded w-3/4"></div>
                    <div className="h-8 bg-muted/50 rounded"></div>
                    <div className="h-4 bg-muted/50 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredResults.length === 0 ? (
          <Card className="quantum-card">
            <CardContent className="p-12 text-center">
              <BarChart3 className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Results Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterProvider !== "all" || filterStatus !== "all" 
                  ? "Try adjusting your search or filters."
                  : "Submit your first quantum job to see results here."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredResults.map((result, index) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="quantum-card hover:scale-105 transition-all duration-300 h-full">
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
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}