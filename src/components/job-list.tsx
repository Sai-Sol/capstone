"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Contract } from "ethers";
import { formatDistanceToNow } from "date-fns";
import { useWallet } from "@/hooks/use-wallet";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink, HardDrive, Filter, Activity, CheckCircle, Clock, DollarSign, Zap, Atom, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

import { CONTRACT_ADDRESS } from "@/lib/constants";
import { quantumJobLoggerABI } from "@/lib/contracts";

// Enhanced AI-powered job description summarizer
const summarizeJobDescription = (description: string, jobType: string): string => {
  const lowerDesc = description.toLowerCase();
  
  // QASM code detection and summarization
  if (lowerDesc.includes('openqasm') || lowerDesc.includes('qreg') || lowerDesc.includes('creg')) {
    if (lowerDesc.includes('bell') || (lowerDesc.includes('h ') && lowerDesc.includes('cx'))) {
      return "🔗 Bell State Entanglement Circuit";
    }
    if (lowerDesc.includes('grover')) {
      return "🔍 Grover's Search Algorithm";
    }
    if (lowerDesc.includes('shor')) {
      return "🔢 Shor's Factorization Algorithm";
    }
    if (lowerDesc.includes('teleport')) {
      return "📡 Quantum Teleportation Protocol";
    }
    if (lowerDesc.includes('measure')) {
      return "📊 Quantum Measurement Circuit";
    }
    return "⚛️ Custom Quantum Circuit";
  }
  
  // Natural language prompt summarization
  if (lowerDesc.includes('factor') || lowerDesc.includes('shor')) {
    return "🔢 Integer Factorization (Shor's)";
  }
  if (lowerDesc.includes('search') || lowerDesc.includes('grover')) {
    return "🔍 Database Search (Grover's)";
  }
  if (lowerDesc.includes('bell') || lowerDesc.includes('entangl')) {
    return "🔗 Quantum Entanglement Demo";
  }
  if (lowerDesc.includes('teleport')) {
    return "📡 Quantum Teleportation";
  }
  if (lowerDesc.includes('random') || lowerDesc.includes('rng')) {
    return "🎲 Quantum Random Generation";
  }
  if (lowerDesc.includes('superposition')) {
    return "🌊 Superposition Analysis";
  }
  if (lowerDesc.includes('optimization') || lowerDesc.includes('qaoa')) {
    return "📈 Quantum Optimization";
  }
  if (lowerDesc.includes('simulation') || lowerDesc.includes('vqe')) {
    return "🧪 Quantum Simulation";
  }
  if (lowerDesc.includes('machine learning') || lowerDesc.includes('qml')) {
    return "🤖 Quantum ML Model";
  }
  
  // Fallback to first meaningful words
  const words = description.split(' ').filter(word => word.length > 3);
  const summary = words.slice(0, 3).join(' ');
  return summary.length > 40 ? `⚛️ ${summary.substring(0, 37)}...` : `⚛️ ${summary}` || "⚛️ Quantum Task";
};

const generateJobId = (txHash: string): string => {
  return `QC-${txHash.slice(2, 8).toUpperCase()}`;
};

type Job = {
  user: string;
  jobType: string;
  ipfsHash: string;
  timeSubmitted: string;
  txHash: string;
  metadata?: {
    type: string;
    description: string;
    submissionType: string;
    priority: string;
    estimatedCost: string;
    estimatedTime: string;
    qubitCount?: string;
  };
};

interface JobListProps {
  userRole: "admin" | "user";
  jobsLastUpdated: number;
  onTotalJobsChange: (count: number) => void;
}

export default function JobList({ userRole, jobsLastUpdated, onTotalJobsChange }: JobListProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterByUser, setFilterByUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { provider, isConnected, signer } = useWallet();
  const { user } = useAuth();
  const [openJob, setOpenJob] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    if (!isConnected || !provider) {
      setError("Connect your wallet to access the quantum job history.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const contract = new Contract(CONTRACT_ADDRESS, quantumJobLoggerABI, provider);
      const filter = contract.filters.JobLogged();
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 10000);

      const logs = await contract.queryFilter(filter, fromBlock, 'latest');

      const parsedJobs: Job[] = logs.map((log: any) => {
        let metadata;
        try {
          metadata = JSON.parse(log.args.ipfsHash);
        } catch {
          metadata = null;
        }

        return {
          user: log.args.user,
          jobType: log.args.jobType,
          ipfsHash: log.args.ipfsHash,
          timeSubmitted: new Date(Number(log.args.timeSubmitted) * 1000).toISOString(),
          txHash: log.transactionHash,
          metadata,
        };
      }).reverse();

      setJobs(parsedJobs);
      onTotalJobsChange(parsedJobs.length);
    } catch (e: any) {
      console.error("Failed to fetch jobs:", e);
      setError(`Quantum network error: ${e.message}`);
      setJobs([]);
      onTotalJobsChange(0);
    } finally {
      setIsLoading(false);
    }
  }, [provider, isConnected, onTotalJobsChange]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs, jobsLastUpdated]);

  const filteredJobs = useMemo(() => {
    let filtered = jobs;
    
    // Filter by user if needed
    if (userRole === "admin" && filterByUser && user?.email && signer) {
      filtered = filtered.filter(job => job.user.toLowerCase() === signer.address.toLowerCase());
    }
    if (userRole === "user" && user && signer) {
      filtered = filtered.filter(job => job.user.toLowerCase() === signer.address.toLowerCase());
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(job => 
        getJobTitle(job).toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.jobType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
        generateJobId(job.txHash).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [jobs, userRole, filterByUser, user, signer, searchTerm]);

  const getJobTitle = (job: Job) => {
    if (job.metadata?.description || job.ipfsHash) {
      const description = job.metadata?.description || job.ipfsHash;
      return summarizeJobDescription(description, job.jobType);
    }
    return "⚛️ Quantum Computing Task";
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high': return { color: 'text-red-400 border-red-400/50', bg: 'bg-red-500/10' };
      case 'medium': return { color: 'text-yellow-400 border-yellow-400/50', bg: 'bg-yellow-500/10' };
      case 'low': return { color: 'text-green-400 border-green-400/50', bg: 'bg-green-500/10' };
      default: return { color: 'text-gray-400 border-gray-400/50', bg: 'bg-gray-500/10' };
    }
  };

  const getProviderConfig = (provider: string) => {
    switch (provider) {
      case 'Google Willow': return { color: 'bg-blue-500', name: 'Willow' };
      case 'IBM Condor': return { color: 'bg-indigo-500', name: 'Condor' };
      case 'Amazon Braket': return { color: 'bg-orange-500', name: 'Braket' };
      default: return { color: 'bg-gray-500', name: 'Unknown' };
    }
  };

  return (
    <Card className="quantum-card shadow-2xl">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="font-headline text-3xl flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Activity className="h-7 w-7 text-primary" />
                </div>
                Quantum Job History
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Real-time tracking of quantum computations with blockchain verification
              </CardDescription>
            </div>
            {userRole === "admin" && (
              <Button
                variant={filterByUser ? "secondary" : "outline"}
                onClick={() => setFilterByUser(prev => !prev)}
                className="quantum-button"
              >
                <Filter className="mr-2 h-4 w-4" />
                {filterByUser ? "Show All Jobs" : "My Jobs Only"}
              </Button>
            )}
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs by ID, description, or provider..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="quantum-input pl-10 h-12"
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Skeleton className="h-28 w-full rounded-xl" />
              </motion.div>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive" className="border-red-500/20 bg-red-500/5">
            <AlertTitle className="text-red-400">Quantum Network Error</AlertTitle>
            <AlertDescription className="text-red-200/80">{error}</AlertDescription>
          </Alert>
        ) : filteredJobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="relative mx-auto w-24 h-24 mb-6">
              <HardDrive className="w-24 h-24 text-muted-foreground/50" />
              <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-ping" />
            </div>
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              {searchTerm ? "No Matching Jobs" : "No Quantum Jobs Found"}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? "Try adjusting your search terms or filters."
                : userRole === 'user' 
                  ? "Your quantum computations will appear here once submitted." 
                  : "No jobs have been logged to the quantum network yet."
              }
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.txHash}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Collapsible 
                    open={openJob === job.txHash} 
                    onOpenChange={() => setOpenJob(openJob === job.txHash ? null : job.txHash)}
                  >
                    <CollapsibleTrigger asChild>
                      <div className="group p-6 border border-primary/20 rounded-xl hover:bg-muted/30 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full ${getProviderConfig(job.jobType).color} quantum-pulse`} />
                              <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary/20 transition-colors">
                                <Atom size={24} className="quantum-pulse" />
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-primary font-mono text-sm font-bold">
                                  {generateJobId(job.txHash)}
                                </span>
                                <span className="text-muted-foreground">•</span>
                                <span className="font-semibold text-lg truncate">
                                  {getJobTitle(job)}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                                <span className="font-mono">
                                  {job.txHash.slice(0, 10)}...{job.txHash.slice(-8)}
                                </span>
                                <Badge variant="outline" className="text-green-400 border-green-400/50">
                                  <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                                  Blockchain Verified
                                </Badge>
                                {job.metadata?.priority && (
                                  <Badge variant="outline" className={getPriorityConfig(job.metadata.priority).color}>
                                    {job.metadata.priority.toUpperCase()} PRIORITY
                                  </Badge>
                                )}
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {formatDistanceToNow(new Date(job.timeSubmitted), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-sm font-medium text-primary">
                              {getProviderConfig(job.jobType).name}
                            </div>
                            {job.metadata?.estimatedCost && (
                              <div className="text-xs text-muted-foreground">
                                {job.metadata.estimatedCost}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-6 pb-6"
                      >
                        <div className="ml-12 space-y-6 bg-gradient-to-br from-muted/20 to-muted/10 rounded-xl p-6 border-l-4 border-primary">
                          {/* Execution Metrics */}
                          {job.metadata && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <Clock className="h-5 w-5 text-blue-400" />
                                <div>
                                  <div className="text-xs text-blue-200">Execution Time</div>
                                  <div className="font-bold text-blue-100">{job.metadata.estimatedTime}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                <DollarSign className="h-5 w-5 text-green-400" />
                                <div>
                                  <div className="text-xs text-green-200">Compute Cost</div>
                                  <div className="font-bold text-green-100">{job.metadata.estimatedCost}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                <Atom className="h-5 w-5 text-purple-400" />
                                <div>
                                  <div className="text-xs text-purple-200">Qubits Used</div>
                                  <div className="font-bold text-purple-100">{job.metadata.qubitCount || "2-5"}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-pink-500/10 border border-pink-500/20">
                                <Zap className="h-5 w-5 text-pink-400" />
                                <div>
                                  <div className="text-xs text-pink-200">Submission</div>
                                  <div className="font-bold text-pink-100 capitalize">{job.metadata.submissionType}</div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Job Details */}
                          <div className="space-y-4">
                            <h4 className="font-semibold text-primary text-lg flex items-center gap-2">
                              <Activity className="h-5 w-5" />
                              Quantum Job Details
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="space-y-3">
                                <div>
                                  <span className="text-muted-foreground">Job ID:</span>
                                  <div className="font-mono font-bold text-primary">{generateJobId(job.txHash)}</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Algorithm:</span>
                                  <div className="font-medium">{getJobTitle(job)}</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Provider:</span>
                                  <div className="font-medium">{job.jobType}</div>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                {job.metadata?.priority && (
                                  <div>
                                    <span className="text-muted-foreground">Priority:</span>
                                    <div className="font-medium capitalize">{job.metadata.priority}</div>
                                  </div>
                                )}
                                <div>
                                  <span className="text-muted-foreground">Submitted:</span>
                                  <div className="font-medium">{new Date(job.timeSubmitted).toLocaleString()}</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Status:</span>
                                  <Badge variant="outline" className="text-green-400 border-green-400/50">
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    Verified
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="pt-4 border-t border-primary/20">
                              <span className="text-muted-foreground text-sm">Blockchain Transaction:</span>
                              <div className="font-mono text-sm break-all mt-1 p-3 bg-muted/20 rounded-lg">
                                {job.txHash}
                              </div>
                              <div className="mt-4">
                                <a href={`https://www.megaexplorer.xyz/tx/${job.txHash}`} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" className="quantum-button">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Verify on MegaETH Explorer
                                  </Button>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </CollapsibleContent>
                  </Collapsible>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}