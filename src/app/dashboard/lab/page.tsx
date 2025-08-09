"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { Contract } from "ethers";
import { CONTRACT_ADDRESS } from "@/lib/constants";
import { quantumJobLoggerABI } from "@/lib/contracts";
import { 
  Terminal, 
  Play, 
  Code, 
  MessageSquare, 
  Atom, 
  Cpu, 
  Clock, 
  DollarSign,
  Activity,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Zap,
  BarChart3
} from "lucide-react";

interface JobResult {
  jobId: string;
  status: "running" | "completed" | "failed";
  progress: number;
  results?: {
    measurements: Record<string, number>;
    fidelity: string;
    executionTime: string;
    circuitDepth: number;
  };
  txHash?: string;
  error?: string;
}

export default function LabPage() {
  const { isConnected, signer } = useWallet();
  const { toast } = useToast();
  const [jobType, setJobType] = useState("Google Willow");
  const [description, setDescription] = useState("");
  const [provider, setProvider] = useState("simulator");
  const [priority, setPriority] = useState("medium");
  const [submissionType, setSubmissionType] = useState("prompt");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentJob, setCurrentJob] = useState<JobResult | null>(null);

  const providers = [
    { value: "simulator", label: "Quantum Simulator", description: "Local simulation using Qiskit Aer" },
    { value: "google-willow", label: "Google Willow", description: "105 qubits, error correction" },
    { value: "ibm-condor", label: "IBM Condor", description: "1,121 qubits, enterprise grade" },
    { value: "amazon-braket", label: "Amazon Braket", description: "256 qubits, multi-provider" }
  ];

  const priorities = [
    { value: "low", label: "Standard", description: "Normal queue processing", color: "text-green-400 border-green-400/50" },
    { value: "medium", label: "Priority", description: "Faster execution", color: "text-yellow-400 border-yellow-400/50" },
    { value: "high", label: "Express", description: "Immediate processing", color: "text-red-400 border-red-400/50" }
  ];

  const sampleQASM = `OPENQASM 2.0;
include "qelib1.inc";

qreg q[2];
creg c[2];

h q[0];
cx q[0],q[1];
measure q -> c;`;

  const submitJob = async () => {
    if (!isConnected || !signer) {
      toast({
        variant: "destructive",
        title: "Wallet Required",
        description: "Please connect your wallet to submit quantum jobs."
      });
      return;
    }

    if (!description.trim()) {
      toast({
        variant: "destructive",
        title: "Description Required",
        description: "Please enter a job description or QASM code."
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 1. Log job on blockchain
      const contract = new Contract(CONTRACT_ADDRESS, quantumJobLoggerABI, signer);
      const jobMetadata = {
        type: jobType,
        description: description,
        submissionType: submissionType,
        priority: priority,
        provider: provider,
        timestamp: Date.now()
      };

      const tx = await contract.logJob(jobType, JSON.stringify(jobMetadata));
      
      toast({
        title: "Blockchain Transaction Submitted",
        description: "Job logged on MegaETH blockchain. Executing quantum computation..."
      });

      // 2. Submit to backend for execution
      const response = await fetch('/api/submit-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobType,
          description,
          provider,
          priority,
          submissionType,
          txHash: tx.hash
        })
      });

      const { jobId } = await response.json();
      
      // 3. Start polling for results
      const newJob: JobResult = {
        jobId,
        status: "running",
        progress: 0,
        txHash: tx.hash
      };
      
      setCurrentJob(newJob);
      pollJobStatus(jobId);

    } catch (error: any) {
      console.error("Job submission failed:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Failed to submit quantum job"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const pollJobStatus = async (jobId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/job-status/${jobId}`);
        const jobData = await response.json();
        
        setCurrentJob(prev => prev ? { ...prev, ...jobData } : null);
        
        if (jobData.status === "completed" || jobData.status === "failed") {
          clearInterval(pollInterval);
          
          if (jobData.status === "completed") {
            toast({
              title: "Quantum Job Completed",
              description: "Your quantum computation has finished successfully!"
            });
          } else {
            toast({
              variant: "destructive",
              title: "Job Failed",
              description: jobData.error || "Quantum computation failed"
            });
          }
        }
      } catch (error) {
        console.error("Failed to poll job status:", error);
      }
    }, 2000);

    // Cleanup after 5 minutes
    setTimeout(() => clearInterval(pollInterval), 300000);
  };

  return (
    <div className="space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Quantum Computing Lab
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Execute quantum algorithms on real hardware and simulators with blockchain verification
        </p>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Job Submission Form */}
        <Card className="quantum-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-primary" />
              Submit Quantum Job
            </CardTitle>
            <CardDescription>Configure and execute quantum computations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Provider Selection */}
            <div className="space-y-2">
              <Label>Quantum Provider</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger className="quantum-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {providers.map(p => (
                    <SelectItem key={p.value} value={p.value}>
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${p.value === 'simulator' ? 'bg-blue-500' : 'bg-green-500'} quantum-pulse`} />
                        <div>
                          <div className="font-medium">{p.label}</div>
                          <div className="text-xs text-muted-foreground">{p.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Job Type */}
            <div className="space-y-2">
              <Label>Job Type</Label>
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger className="quantum-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Google Willow">Google Willow</SelectItem>
                  <SelectItem value="IBM Condor">IBM Condor</SelectItem>
                  <SelectItem value="Amazon Braket">Amazon Braket</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label>Priority Level</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="quantum-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map(p => (
                    <SelectItem key={p.value} value={p.value}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={p.color}>
                          {p.label}
                        </Badge>
                        <span className="text-sm">{p.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Input Type Tabs */}
            <Tabs value={submissionType} onValueChange={setSubmissionType}>
              <TabsList className="grid w-full grid-cols-2 bg-muted/30">
                <TabsTrigger value="prompt" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Natural Language
                </TabsTrigger>
                <TabsTrigger value="qasm" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Code className="mr-2 h-4 w-4" />
                  QASM Code
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="prompt" className="mt-4">
                <div className="space-y-2">
                  <Label>Algorithm Description</Label>
                  <Textarea
                    placeholder="Example: Create a Bell state circuit with Hadamard and CNOT gates to demonstrate quantum entanglement"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="quantum-input min-h-[120px]"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="qasm" className="mt-4">
                <div className="space-y-2">
                  <Label>QASM Circuit Code</Label>
                  <Textarea
                    placeholder={sampleQASM}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="quantum-input min-h-[120px] font-mono text-sm"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <Button
              onClick={submitJob}
              disabled={isSubmitting || !isConnected || !description.trim()}
              className="w-full quantum-button h-12"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Submitting to Quantum Network...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Execute Quantum Job
                </>
              )}
            </Button>

            {!isConnected && (
              <Alert className="border-yellow-500/20 bg-yellow-500/5">
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  Connect your wallet to submit jobs to the quantum network.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Job Results */}
        <Card className="quantum-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Execution Results
            </CardTitle>
            <CardDescription>Real-time quantum job execution status</CardDescription>
          </CardHeader>
          <CardContent>
            {currentJob ? (
              <div className="space-y-6">
                {/* Job Status */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-primary">Job Status</h4>
                    <Badge variant="outline" className={
                      currentJob.status === 'completed' ? 'text-green-400 border-green-400/50' :
                      currentJob.status === 'running' ? 'text-yellow-400 border-yellow-400/50' :
                      'text-red-400 border-red-400/50'
                    }>
                      {currentJob.status === 'running' && <Activity className="mr-1 h-3 w-3 animate-spin" />}
                      {currentJob.status === 'completed' && <CheckCircle className="mr-1 h-3 w-3" />}
                      {currentJob.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Job ID:</span>
                      <span className="font-mono text-primary">{currentJob.jobId}</span>
                    </div>
                    
                    {currentJob.txHash && (
                      <div className="flex justify-between text-sm">
                        <span>Blockchain Tx:</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://www.megaexplorer.xyz/tx/${currentJob.txHash}`, '_blank')}
                        >
                          <ExternalLink className="mr-1 h-3 w-3" />
                          View
                        </Button>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress:</span>
                        <span>{currentJob.progress}%</span>
                      </div>
                      <Progress value={currentJob.progress} className="h-2" />
                    </div>
                  </div>
                </div>

                {/* Results */}
                {currentJob.results && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-primary">Quantum Results</h4>
                    
                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-muted/20 border border-primary/10">
                        <p className="text-sm text-muted-foreground">Execution Time</p>
                        <p className="text-xl font-bold text-primary">{currentJob.results.executionTime}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/20 border border-primary/10">
                        <p className="text-sm text-muted-foreground">Fidelity</p>
                        <p className="text-xl font-bold text-green-400">{currentJob.results.fidelity}</p>
                      </div>
                    </div>

                    {/* Measurements */}
                    <div className="space-y-3">
                      <h5 className="font-medium text-primary">Measurement Results</h5>
                      {Object.entries(currentJob.results.measurements).map(([state, count]) => {
                        const total = Object.values(currentJob.results!.measurements).reduce((a, b) => a + b, 0);
                        const percentage = (count / total) * 100;
                        return (
                          <div key={state} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-mono">|{state}⟩</span>
                              <span>{count} ({percentage.toFixed(1)}%)</span>
                            </div>
                            <div className="w-full bg-muted/30 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {currentJob.error && (
                  <Alert className="border-red-500/20 bg-red-500/5">
                    <AlertDescription className="text-red-200">
                      {currentJob.error}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Atom className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                  Ready for Quantum Execution
                </h3>
                <p className="text-muted-foreground">
                  Submit a quantum job to see real-time execution results
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}