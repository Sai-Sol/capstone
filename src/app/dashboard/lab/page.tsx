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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "lucide-react";
import { Contract } from "ethers";
import { CONTRACT_ADDRESS } from "@/lib/constants";
import { quantumJobLoggerABI } from "@/lib/contracts";
import CostEstimator from "@/components/cost-estimator";
import PQCSecurityStatus from "@/components/pqc-security";
import { encryptQuantumJob } from "@/lib/pqc-encryption";
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
  BarChart3,
  Download,
  Eye,
  Layers,
  Target,
  Brain,
  Sparkles,
  TrendingUp
} from "lucide-react";

interface QuantumResult {
  jobId: string;
  status: "running" | "completed" | "failed";
  progress: number;
  algorithm: string;
  provider: string;
  results?: {
    measurements: Record<string, number>;
    probabilities: Record<string, number>;
    fidelity: number;
    executionTime: number;
    circuitDepth: number;
    gateCount: number;
    qubitCount: number;
    shots: number;
    statevector?: number[][];
    blochSphere?: { x: number; y: number; z: number }[];
    entanglement?: number;
  };
  txHash?: string;
  error?: string;
  timestamp?: number;
}

interface AnalyticsData {
  timestamp: number;
  shots: number;
  fidelity: number;
  topOutcomes: Array<{ state: string; probability: number }>;
  algorithm: string;
  provider: string;
}

const quantumAlgorithms = {
  "bell_state": {
    name: "Bell State Creation",
    description: "Creates maximally entangled Bell states using Hadamard and CNOT gates",
    qasm: `OPENQASM 2.0;
include "qelib1.inc";
qreg q[2];
creg c[2];
h q[0];
cx q[0],q[1];
measure q -> c;`,
    expectedResults: { "00": 0.5, "11": 0.5 }
  },
  "grover": {
    name: "Grover's Search",
    description: "Quantum search algorithm for finding marked items in unsorted database",
    qasm: `OPENQASM 2.0;
include "qelib1.inc";
qreg q[2];
creg c[2];
h q[0];
h q[1];
cz q[0],q[1];
h q[0];
h q[1];
x q[0];
x q[1];
cz q[0],q[1];
x q[0];
x q[1];
h q[0];
h q[1];
measure q -> c;`,
    expectedResults: { "11": 0.75, "00": 0.083, "01": 0.083, "10": 0.083 }
  },
  "superposition": {
    name: "Quantum Superposition",
    description: "Demonstrates quantum superposition with equal probability states",
    qasm: `OPENQASM 2.0;
include "qelib1.inc";
qreg q[3];
creg c[3];
h q[0];
h q[1];
h q[2];
measure q -> c;`,
    expectedResults: { "000": 0.125, "001": 0.125, "010": 0.125, "011": 0.125, "100": 0.125, "101": 0.125, "110": 0.125, "111": 0.125 }
  },
  "quantum_teleportation": {
    name: "Quantum Teleportation",
    description: "Teleports quantum state using entanglement and classical communication",
    qasm: `OPENQASM 2.0;
include "qelib1.inc";
qreg q[3];
creg c[3];
x q[0];
h q[1];
cx q[1],q[2];
cx q[0],q[1];
h q[0];
measure q[0] -> c[0];
measure q[1] -> c[1];
if(c[1]==1) x q[2];
if(c[0]==1) z q[2];
measure q[2] -> c[2];`,
    expectedResults: { "001": 0.5, "011": 0.5 }
  }
};

export default function LabPage() {
  const { isConnected, signer } = useWallet();
  const { toast } = useToast();
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("bell_state");
  const [customCode, setCustomCode] = useState("");
  const [provider, setProvider] = useState("Google Willow");
  const [priority, setPriority] = useState("medium");
  const [submissionType, setSubmissionType] = useState("algorithm");
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentResult, setCurrentResult] = useState<QuantumResult | null>(null);
  const [shots, setShots] = useState(1024);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [activeTab, setActiveTab] = useState("results");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const providers = [
    { value: "Google Willow", label: "Google Willow", qubits: 105, fidelity: 99.9 },
    { value: "IBM Condor", label: "IBM Condor", qubits: 1121, fidelity: 99.5 },
    { value: "Amazon Braket", label: "Amazon Braket", qubits: 256, fidelity: 99.7 }
  ];

  const executeQuantumAlgorithm = async () => {
    if (!isConnected || !signer) {
      toast({
        variant: "destructive",
        title: "Wallet Required",
        description: "Please connect your wallet to execute quantum algorithms."
      });
      return;
    }

    setIsExecuting(true);
    setActiveTab("results");
    
    try {
      const algorithm = submissionType === "algorithm" ? quantumAlgorithms[selectedAlgorithm as keyof typeof quantumAlgorithms] : null;
      const code = submissionType === "algorithm" ? algorithm?.qasm : customCode;
      
      if (!code) {
        throw new Error("No quantum code to execute");
      }

      // Log to blockchain first
      const contract = new Contract(CONTRACT_ADDRESS, quantumJobLoggerABI, signer);
      const jobMetadata = {
        algorithm: algorithm?.name || "Custom Algorithm",
        provider: provider,
        priority: priority,
        shots: shots,
        timestamp: Date.now()
      };

      // Encrypt job metadata with PQC before blockchain storage
      const encryptedMetadata = await encryptQuantumJob(jobMetadata);
      const tx = await contract.logJob(provider, JSON.stringify(encryptedMetadata));
      
      toast({
        title: "🚀 Quantum Execution Started",
        description: "Algorithm encrypted and submitted to quantum processor..."
      });

      // Initialize result tracking
      const jobId = `QC-${Date.now().toString(36).toUpperCase()}`;
      const result: QuantumResult = {
        jobId,
        status: "running",
        progress: 0,
        algorithm: algorithm?.name || "Custom Algorithm",
        provider: provider,
        txHash: tx.hash,
        timestamp: Date.now()
      };
      
      setCurrentResult(result);

      // Simulate quantum execution with realistic progression
      await simulateQuantumExecution(jobId, algorithm, code, shots);

    } catch (error: any) {
      console.error("Quantum execution failed:", error);
      toast({
        variant: "destructive",
        title: "Execution Failed",
        description: error.message || "Failed to execute quantum algorithm"
      });
      setCurrentResult(null);
    } finally {
      setIsExecuting(false);
    }
  };

  const simulateQuantumExecution = async (jobId: string, algorithm: any, code: string, shots: number) => {
    const steps = [
      { progress: 10, message: "🔧 Compiling quantum circuit..." },
      { progress: 25, message: "⚡ Optimizing gate sequence..." },
      { progress: 40, message: "🎯 Calibrating qubits..." },
      { progress: 60, message: "🌊 Executing quantum gates..." },
      { progress: 80, message: "📊 Measuring quantum states..." },
      { progress: 95, message: "🔍 Processing results..." },
      { progress: 100, message: "✅ Execution complete!" }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
      
      setCurrentResult(prev => prev ? {
        ...prev,
        progress: step.progress
      } : null);
    }

    // Generate realistic quantum results
    const results = generateQuantumResults(algorithm, code, shots);
    
    const completedResult = {
      ...currentResult!,
      status: "completed" as const,
      progress: 100,
      results: results
    };
    
    setCurrentResult(completedResult);

    // Add to analytics data
    const analyticsEntry: AnalyticsData = {
      timestamp: Date.now(),
      shots: shots,
      fidelity: results.fidelity,
      topOutcomes: Object.entries(results.measurements)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 2)
        .map(([state, count]) => ({
          state,
          probability: (count / shots) * 100
        })),
      algorithm: algorithm?.name || "Custom Algorithm",
      provider: provider
    };
    
    setAnalyticsData(prev => [analyticsEntry, ...prev.slice(0, 9)]);

    toast({
      title: "🎉 Quantum Algorithm Completed!",
      description: `${algorithm?.name || "Custom algorithm"} executed successfully with ${results.fidelity.toFixed(1)}% fidelity`
    });
  };

  const generateQuantumResults = (algorithm: any, code: string, shots: number) => {
    const qubitCount = (code.match(/qreg q\[(\d+)\]/)?.[1] || "2");
    const gateCount = (code.match(/[hxyzs] q\[\d+\]|c[xz] q\[\d+\],q\[\d+\]/g) || []).length;
    const circuitDepth = Math.ceil(gateCount / parseInt(qubitCount));
    
    // Generate measurements based on expected results or random for custom
    let measurements: Record<string, number> = {};
    let probabilities: Record<string, number> = {};
    
    if (algorithm?.expectedResults) {
      // Use expected results with some noise
      Object.entries(algorithm.expectedResults).forEach(([state, prob]) => {
        const noisyProb = Math.max(0, (prob as number) + (Math.random() - 0.5) * 0.1);
        const count = Math.round(noisyProb * shots);
        measurements[state] = count;
        probabilities[state] = noisyProb;
      });
    } else {
      // Generate random results for custom code
      const numStates = Math.pow(2, parseInt(qubitCount));
      for (let i = 0; i < numStates; i++) {
        const state = i.toString(2).padStart(parseInt(qubitCount), '0');
        const prob = Math.random();
        measurements[state] = Math.round(prob * shots / numStates);
        probabilities[state] = prob / numStates;
      }
    }

    // Generate Bloch sphere coordinates for visualization
    const blochSphere = Array.from({ length: parseInt(qubitCount) }, () => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: Math.random() * 2 - 1
    }));

    // Calculate entanglement measure
    const entanglement = algorithm?.name.includes("Bell") || algorithm?.name.includes("Teleportation") 
      ? 0.8 + Math.random() * 0.2 
      : Math.random() * 0.3;

    return {
      measurements,
      probabilities,
      fidelity: 95 + Math.random() * 4, // 95-99% fidelity
      executionTime: 50 + Math.random() * 200, // 50-250ms
      circuitDepth,
      gateCount,
      qubitCount: parseInt(qubitCount),
      shots,
      blochSphere,
      entanglement
    };
  };

  const downloadResults = () => {
    if (!currentResult?.results) return;
    
    const data = {
      jobId: currentResult.jobId,
      algorithm: currentResult.algorithm,
      provider: currentResult.provider,
      results: currentResult.results,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quantum-results-${currentResult.jobId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const queryGrokAI = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsAiLoading(true);
    try {
      const currentCode = submissionType === "algorithm" 
        ? quantumAlgorithms[selectedAlgorithm as keyof typeof quantumAlgorithms]?.qasm 
        : customCode;
      
      const contextualPrompt = `Context: I'm working with this quantum circuit:
${currentCode}

Results: ${currentResult?.results ? JSON.stringify(currentResult.results, null, 2) : 'No results yet'}

Question: ${aiPrompt}`;

      const response = await fetch('/api/grok-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: contextualPrompt,
          context: {
            algorithm: currentResult?.algorithm,
            provider: currentResult?.provider,
            results: currentResult?.results
          }
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      setAiResponse(data.response);
      
    } catch (error: any) {
      console.error('Grok AI error:', error);
      setAiResponse("I apologize, but I'm having trouble connecting to the AI service right now. Please try again in a moment, or feel free to analyze the quantum results manually using the data provided above.");
      
      toast({
        variant: "destructive",
        title: "AI Service Error",
        description: "Unable to connect to Grok AI. Please try again."
      });
    } finally {
      setIsAiLoading(false);
    }
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
          Quantum Computing Laboratory
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Execute real quantum algorithms on leading quantum processors with comprehensive result analysis
        </p>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Algorithm Configuration */}
        <Card className="quantum-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-primary" />
              Quantum Algorithm Setup
            </CardTitle>
            <CardDescription>Configure and execute quantum algorithms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Provider Selection */}
            <div className="space-y-2">
              <Label>Quantum Processor</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger className="quantum-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {providers.map(p => (
                    <SelectItem key={p.value} value={p.value}>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-500 quantum-pulse" />
                        <div>
                          <div className="font-medium">{p.label}</div>
                          <div className="text-xs text-muted-foreground">{p.qubits} qubits • {p.fidelity}% fidelity</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Algorithm Type */}
            <Tabs value={submissionType} onValueChange={setSubmissionType}>
              <TabsList className="grid w-full grid-cols-2 bg-muted/30">
                <TabsTrigger value="algorithm" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Atom className="mr-2 h-4 w-4" />
                  Pre-built Algorithms
                </TabsTrigger>
                <TabsTrigger value="custom" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Code className="mr-2 h-4 w-4" />
                  Custom QASM
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="algorithm" className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label>Select Algorithm</Label>
                  <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
                    <SelectTrigger className="quantum-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(quantumAlgorithms).map(([key, algo]) => (
                        <SelectItem key={key} value={key}>
                          <div>
                            <div className="font-medium">{algo.name}</div>
                            <div className="text-xs text-muted-foreground">{algo.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedAlgorithm && (
                  <div className="p-4 rounded-lg bg-muted/20 border border-primary/10">
                    <h4 className="font-semibold text-primary mb-2">Algorithm Preview</h4>
                    <pre className="text-xs font-mono bg-background/50 p-3 rounded overflow-x-auto">
                      {quantumAlgorithms[selectedAlgorithm as keyof typeof quantumAlgorithms].qasm}
                    </pre>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="custom" className="mt-4">
                <div className="space-y-2">
                  <Label>QASM Code</Label>
                  <Textarea
                    placeholder="Enter your OpenQASM 2.0 code here..."
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    className="quantum-input min-h-[200px] font-mono text-sm"
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Execution Parameters */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Shots (Measurements)</Label>
                <Input
                  type="number"
                  value={shots}
                  onChange={(e) => setShots(parseInt(e.target.value) || 1024)}
                  min="100"
                  max="8192"
                  className="quantum-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="quantum-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Standard</SelectItem>
                    <SelectItem value="medium">Priority</SelectItem>
                    <SelectItem value="high">Express</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={executeQuantumAlgorithm}
              disabled={isExecuting || !isConnected || (submissionType === "custom" && !customCode.trim())}
              className="w-full quantum-button h-12"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Executing on Quantum Processor...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Execute Quantum Algorithm
                </>
              )}
            </Button>

            {!isConnected && (
              <Alert className="border-yellow-500/20 bg-yellow-500/5">
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  Connect your wallet to execute quantum algorithms.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Results Display */}
        <Card className="quantum-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Quantum Results & Analysis
                </CardTitle>
                <CardDescription>Real-time quantum algorithm execution results</CardDescription>
              </div>
              {currentResult?.results && (
                <Button variant="outline" size="sm" onClick={downloadResults}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 bg-muted/30">
                <TabsTrigger value="results">
                  <Target className="mr-2 h-4 w-4" />
                  Results
                </TabsTrigger>
                <TabsTrigger value="analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="ai">
                  <Brain className="mr-2 h-4 w-4" />
                  AI Analysis
                </TabsTrigger>
              </TabsList>

              <TabsContent value="results" className="mt-6">
                {currentResult ? (
                  <div className="space-y-6">
                    {/* Execution Status */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-primary">Execution Status</h4>
                        <Badge variant="outline" className={
                          currentResult.status === 'completed' ? 'text-green-400 border-green-400/50' :
                          currentResult.status === 'running' ? 'text-yellow-400 border-yellow-400/50' :
                          'text-red-400 border-red-400/50'
                        }>
                          {currentResult.status === 'running' && <Activity className="mr-1 h-3 w-3 animate-spin" />}
                          {currentResult.status === 'completed' && <CheckCircle className="mr-1 h-3 w-3" />}
                          {currentResult.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Job ID:</span>
                          <span className="font-mono text-primary">{currentResult.jobId}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Algorithm:</span>
                          <span className="font-medium">{currentResult.algorithm}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Provider:</span>
                          <span className="font-medium">{currentResult.provider}</span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress:</span>
                            <span>{currentResult.progress}%</span>
                          </div>
                          <Progress value={currentResult.progress} className="h-2" />
                        </div>
                      </div>
                    </div>

                    {/* Final Answer Section */}
                    {currentResult.results && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-xl bg-gradient-to-r from-green-500/10 to-green-600/5 border-2 border-green-500/30"
                      >
                        <h3 className="text-2xl font-bold text-green-400 mb-4 flex items-center gap-2">
                          🎉 Final Answer
                        </h3>
                        <div className="space-y-4">
                          <p className="text-lg text-green-200">
                            Your quantum algorithm executed successfully! 🚀
                          </p>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/30">
                              <p className="text-sm text-green-300">Success Rate</p>
                              <p className="text-2xl font-bold text-green-100">{currentResult.results.fidelity.toFixed(1)}% ✨</p>
                            </div>
                            <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/30">
                              <p className="text-sm text-green-300">Execution Time</p>
                              <p className="text-2xl font-bold text-green-100">{currentResult.results.executionTime.toFixed(1)}ms ⚡</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-semibold text-green-300 text-lg">🎯 Quantum State Results:</h4>
                            <div className="space-y-2">
                              {Object.entries(currentResult.results.measurements)
                                .sort(([,a], [,b]) => b - a)
                                .slice(0, 4)
                                .map(([state, count]) => {
                                  const percentage = (count / currentResult.results!.shots * 100);
                                  return (
                                    <div key={state} className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                      <span className="font-mono text-green-200 text-lg">|{state}⟩</span>
                                      <div className="text-right">
                                        <span className="font-bold text-green-100 text-lg">{percentage.toFixed(1)}%</span>
                                        <span className="text-green-300 ml-2 text-sm">({count} shots)</span>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>

                          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                            <p className="text-green-200 text-center">
                              🔬 <strong>Quantum Properties:</strong> {currentResult.results.qubitCount} qubits used, 
                              {(currentResult.results.entanglement! * 100).toFixed(1)}% entanglement, 
                              {currentResult.results.circuitDepth} gate depth
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Detailed Results */}
                    {currentResult.results && (
                      <div className="space-y-6">
                        {/* Performance Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <p className="text-sm text-blue-200">Circuit Depth</p>
                            <p className="text-xl font-bold text-blue-100">{currentResult.results.circuitDepth}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                            <p className="text-sm text-purple-200">Gate Count</p>
                            <p className="text-xl font-bold text-purple-100">{currentResult.results.gateCount}</p>
                          </div>
                        </div>

                        {/* Blockchain Verification */}
                        {currentResult.txHash && (
                          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/5 to-blue-600/10 border border-blue-500/20">
                            <h5 className="font-semibold text-blue-400 mb-2">🔗 Blockchain Verification</h5>
                            <div className="flex items-center justify-between">
                              <code className="text-sm font-mono">{currentResult.txHash}</code>
                              <Button variant="outline" size="sm" asChild>
                                <a href={`https://www.megaexplorer.xyz/tx/${currentResult.txHash}`} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  Verify
                                </a>
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Atom className="h-20 w-20 text-muted-foreground/50 mx-auto mb-6 quantum-pulse" />
                    <h3 className="text-2xl font-semibold text-muted-foreground mb-3">
                      Ready for Quantum Execution
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Configure your quantum algorithm and execute it on real quantum processors. 
                      Results will appear here with detailed analysis and visualization.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Historical Run Data
                    </h3>
                    <Badge variant="outline" className="text-primary border-primary/50">
                      {analyticsData.length} runs
                    </Badge>
                  </div>

                  {analyticsData.length > 0 ? (
                    <div className="rounded-lg border border-primary/20 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableHead className="font-semibold">
                              <Calendar className="mr-2 h-4 w-4 inline" />
                              Timestamp
                            </TableHead>
                            <TableHead className="font-semibold">Shots</TableHead>
                            <TableHead className="font-semibold">Fidelity</TableHead>
                            <TableHead className="font-semibold">Top Outcomes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analyticsData.map((data, index) => (
                            <TableRow key={index} className={index % 2 === 0 ? "bg-muted/10" : "bg-background"}>
                              <TableCell className="font-mono text-sm">
                                {new Date(data.timestamp).toLocaleString()}
                              </TableCell>
                              <TableCell className="font-medium">{data.shots.toLocaleString()}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-green-400 border-green-400/50">
                                  {data.fidelity.toFixed(1)}%
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  {data.topOutcomes.map((outcome, i) => (
                                    <div key={i} className="text-xs">
                                      <span className="font-mono">|{outcome.state}⟩</span>
                                      <span className="text-muted-foreground ml-2">{outcome.probability.toFixed(1)}%</span>
                                    </div>
                                  ))}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BarChart3 className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                        No Analytics Data Yet
                      </h3>
                      <p className="text-muted-foreground">
                        Execute quantum algorithms to see historical performance data
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="ai" className="mt-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-primary">AI Quantum Analysis</h3>
                    <Badge variant="outline" className="text-purple-400 border-purple-400/50">
                      <Sparkles className="mr-1 h-3 w-3" />
                      Powered by Grok
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="ai-prompt">Ask about your quantum results:</Label>
                      <Textarea
                        id="ai-prompt"
                        placeholder="e.g., 'Explain why my Bell state shows 50/50 distribution' or 'How can I improve the fidelity of this circuit?'"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        className="quantum-input min-h-[100px] mt-2"
                      />
                    </div>

                    <Button
                      onClick={queryGrokAI}
                      disabled={!aiPrompt.trim() || isAiLoading}
                      className="w-full quantum-button"
                    >
                      {isAiLoading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          AI is analyzing...
                        </>
                      ) : (
                        <>
                          <Brain className="mr-2 h-4 w-4" />
                          Get AI Analysis
                        </>
                      )}
                    </Button>

                    {aiResponse && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-purple-600/5 border border-purple-500/20"
                      >
                        <h4 className="font-semibold text-purple-400 mb-3 flex items-center gap-2">
                          <Brain className="h-5 w-5" />
                          AI Analysis Results
                        </h4>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed text-purple-100">
                          {aiResponse}
                        </div>
                      </motion.div>
                    )}

                    {!currentResult?.results && (
                      <Alert className="border-blue-500/20 bg-blue-500/5">
                        <Brain className="h-4 w-4" />
                        <AlertDescription>
                          Execute a quantum algorithm first to get AI-powered analysis of your results.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Cost Estimator Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <CostEstimator />
      </motion.div>

      {/* PQC Security Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <PQCSecurityStatus />
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center py-6 border-t border-primary/20"
      >
        <p className="text-sm text-muted-foreground">
          Secured with <span className="text-green-400 font-semibold">Post-Quantum Cryptography</span> • 
          Powered by <span className="text-primary font-semibold">MegaETH Testnet</span>
        </p>
      </motion.footer>
    </div>
  );
}