"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Zap,
  Eye,
  Layers,
  BookOpen,
  Loader2,
  Download,
  History,
  Save,
} from "lucide-react";
import { useOptimizations } from "@/hooks/use-optimizations";
import { OptimizationTrends } from "@/components/optimization-trends";

const sampleQASM = `OPENQASM 2.0;
include "qelib1.inc";
qreg q[3];
creg c[3];
h q[0];
cx q[0],q[1];
cx q[1],q[2];
measure q -> c;`;

const demoOptimizations = [
  {
    id: "opt-001",
    circuit_code: "OPENQASM 2.0; qreg q[5];",
    circuit_depth: 8,
    gate_count: 12,
    qubit_count: 5,
    optimization_score: 78,
    provider: "Google Willow",
    is_valid: true,
    validation_errors: [],
    estimated_time_ms: 245,
    estimated_cost: 0.00152,
    notes: "Bell state entanglement circuit",
    job_id: "job-1001",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    optimization_suggestions: [
      {
        id: "sug-1",
        title: "Reduce Gate Count",
        description: "Merge consecutive H gates",
        impact: "medium",
        suggestion: "Combine H-H into I gate",
        applied: false,
        applied_at: null,
      },
    ],
  },
  {
    id: "opt-002",
    circuit_code: "OPENQASM 2.0; qreg q[8];",
    circuit_depth: 15,
    gate_count: 24,
    qubit_count: 8,
    optimization_score: 65,
    provider: "IBM Condor",
    is_valid: true,
    validation_errors: [],
    estimated_time_ms: 450,
    estimated_cost: 0.00324,
    notes: "Grover search algorithm",
    job_id: "job-1002",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    optimization_suggestions: [
      {
        id: "sug-2",
        title: "Optimize Qubit Layout",
        description: "Reduce CNOT distances",
        impact: "high",
        suggestion: "Rearrange qubits to minimize distance",
        applied: false,
        applied_at: null,
      },
      {
        id: "sug-3",
        title: "Parallelize Operations",
        description: "Run independent gates simultaneously",
        impact: "medium",
        suggestion: "Move independent gates forward",
        applied: false,
        applied_at: null,
      },
    ],
  },
  {
    id: "opt-003",
    circuit_code: "OPENQASM 2.0; qreg q[3];",
    circuit_depth: 5,
    gate_count: 8,
    qubit_count: 3,
    optimization_score: 88,
    provider: "Amazon Braket",
    is_valid: true,
    validation_errors: [],
    estimated_time_ms: 125,
    estimated_cost: 0.00089,
    notes: "Simple superposition state",
    job_id: "job-1003",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    optimization_suggestions: [],
  },
];

export default function OptimizePage() {
  const [circuitCode, setCircuitCode] = useState(sampleQASM);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [provider, setProvider] = useState("Google Willow");
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("analyze");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [localOptimizations, setLocalOptimizations] = useState(demoOptimizations);

  const { saveOptimization, fetchHistory, optimizations, loading, error } =
    useOptimizations();

  const [analysis, setAnalysis] = useState<{
    depth: number;
    gates: number;
    qubits: number;
    score: number;
    time: number;
    cost: number;
    valid: boolean;
    validationErrors: string[];
    suggestions: Array<{
      title: string;
      description: string;
      impact: "low" | "medium" | "high";
      suggestion: string;
    }>;
  } | null>(null);

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory(20, 0, provider);
    }
  }, [activeTab, provider, fetchHistory]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

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

    const hasValidQASMHeader = circuitCode.includes("OPENQASM");
    const hasMeasurement = circuitCode.includes("measure");
    const validationErrors: string[] = [];

    if (!hasValidQASMHeader) validationErrors.push("Missing OPENQASM 2.0 header");
    if (!hasMeasurement) validationErrors.push("No measurement operations found");

    const qubitCount = maxQubit + 1;
    const depth = Math.ceil(gateCount / Math.max(qubitCount, 1));

    const suggestions = [];

    if (gateCount > 20) {
      suggestions.push({
        title: "High Gate Count Detected",
        description:
          "Your circuit has many gates, which increases execution time and costs.",
        impact: "high" as const,
        suggestion:
          "Consider merging adjacent single-qubit gates or using multi-qubit gate sequences.",
      });
    }

    if (!hasMeasurement) {
      suggestions.push({
        title: "Add Measurement Operations",
        description: "Your circuit doesn't measure the results.",
        impact: "high" as const,
        suggestion:
          "Add measurement operations at the end to extract classical results.",
      });
    }

    if (depth > 20) {
      suggestions.push({
        title: "Deep Circuit Depth",
        description:
          "Long execution chains may accumulate more quantum noise.",
        impact: "medium" as const,
        suggestion:
          "Use quantum error correction strategies or parallelize operations where possible.",
      });
    }

    if (gateCount > 10 && gateCount < 50) {
      suggestions.push({
        title: "Optimization Opportunity",
        description: "Circuit can be optimized for better performance.",
        impact: "medium" as const,
        suggestion:
          "Look for redundant gates or sequences that can be simplified.",
      });
    }

    const optimizationScore = Math.max(
      0,
      100 -
        suggestions.reduce((sum, sug) => {
          return (
            sum +
            (sug.impact === "high" ? 30 : sug.impact === "medium" ? 15 : 5)
          );
        }, 0)
    );

    setAnalysis({
      depth,
      gates: gateCount,
      qubits: qubitCount,
      score: optimizationScore,
      time: 5 + depth * 2,
      cost: 0.001 + gateCount * 0.0001,
      valid: validationErrors.length === 0,
      validationErrors,
      suggestions,
    });

    setIsAnalyzing(false);
  };

  const handleSaveOptimization = async () => {
    if (!analysis) return;

    const result = await saveOptimization({
      circuitCode,
      circuitDepth: analysis.depth,
      gateCount: analysis.gates,
      qubitCount: analysis.qubits,
      optimizationScore: analysis.score,
      provider,
      isValid: analysis.valid,
      validationErrors: analysis.validationErrors,
      estimatedTimeMs: analysis.time,
      estimatedCost: analysis.cost,
      suggestions: analysis.suggestions,
    });

    if (result) {
      setSaveMessage("Optimization saved successfully!");
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleDownloadQASM = () => {
    const element = document.createElement("a");
    const file = new Blob([circuitCode], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "circuit.qasm";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "text-red-400 border-red-500/50 bg-red-500/10";
      case "medium":
        return "text-yellow-400 border-yellow-500/50 bg-yellow-500/10";
      case "low":
        return "text-green-400 border-green-500/50 bg-green-500/10";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
          Circuit Optimization Analyzer
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Advanced analysis of quantum circuits with intelligent optimization suggestions
          to reduce depth, gates, and execution cost.
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="analyze" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Analyzer
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analyze" className="space-y-6 mt-6">
          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Alert className="bg-green-500/10 border-green-500/50">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-400">
                  {saveMessage}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 space-y-4">
              <Card className="quantum-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-primary" />
                      OpenQASM Code
                    </CardTitle>
                    <select
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      className="text-sm px-3 py-1 rounded border border-border bg-background"
                    >
                      <option>Google Willow</option>
                      <option>IBM Condor</option>
                      <option>Amazon Braket</option>
                    </select>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={circuitCode}
                    onChange={(e) => setCircuitCode(e.target.value)}
                    placeholder="Paste your QASM code here..."
                    className="font-mono text-sm min-h-48 bg-slate-950"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAnalyze}
                      size="lg"
                      className="flex-1"
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-4 w-4" />
                          Analyze Circuit
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleDownloadQASM}
                      variant="outline"
                      size="lg"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {analysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="quantum-card border-primary/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {analysis.valid ? (
                          <CheckCircle2 className="h-5 w-5 text-green-400" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-400" />
                        )}
                        Analysis Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {!analysis.valid && analysis.validationErrors.length > 0 && (
                        <Alert className="border-red-500/50 bg-red-500/10">
                          <AlertCircle className="h-4 w-4 text-red-400" />
                          <AlertDescription className="text-red-400 text-sm">
                            {analysis.validationErrors.join("; ")}
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg border border-border">
                          <p className="text-sm text-muted-foreground mb-1">
                            Circuit Depth
                          </p>
                          <p className="text-3xl font-bold text-blue-400">
                            {analysis.depth}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Total gate layers
                          </p>
                        </div>
                        <div className="p-4 rounded-lg border border-border">
                          <p className="text-sm text-muted-foreground mb-1">
                            Gate Count
                          </p>
                          <p className="text-3xl font-bold text-cyan-400">
                            {analysis.gates}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Total quantum gates
                          </p>
                        </div>
                        <div className="p-4 rounded-lg border border-border">
                          <p className="text-sm text-muted-foreground mb-1">
                            Est. Time
                          </p>
                          <p className="text-3xl font-bold text-green-400">
                            {analysis.time}ms
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Execution time
                          </p>
                        </div>
                        <div className="p-4 rounded-lg border border-border">
                          <p className="text-sm text-muted-foreground mb-1">
                            Est. Cost
                          </p>
                          <p className="text-3xl font-bold text-yellow-400">
                            ${analysis.cost.toFixed(4)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Quantum credits
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Optimization Score
                          </span>
                          <span className="text-lg font-bold text-primary">
                            {analysis.score}%
                          </span>
                        </div>
                        <Progress value={analysis.score} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            <div className="space-y-4">
              <Card className="quantum-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    Circuit Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {analysis ? (
                    <>
                      <div className="p-3 rounded bg-background/50">
                        <p className="text-muted-foreground">Qubits Used</p>
                        <p className="text-xl font-bold text-primary">
                          {analysis.qubits}
                        </p>
                      </div>
                      <div className="p-3 rounded bg-background/50">
                        <p className="text-muted-foreground">Circuit Valid</p>
                        <p className="text-lg font-bold">
                          {analysis.valid ? (
                            <span className="text-green-400">Valid</span>
                          ) : (
                            <span className="text-red-400">Invalid</span>
                          )}
                        </p>
                      </div>
                      <Button
                        onClick={handleSaveOptimization}
                        className="w-full mt-2"
                        size="sm"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save Analysis
                      </Button>
                      <Alert className="border-blue-500/50 bg-blue-500/10">
                        <Zap className="h-4 w-4 text-blue-400" />
                        <AlertDescription className="text-blue-400 text-xs">
                          {analysis.suggestions.length} optimization tips available
                        </AlertDescription>
                      </Alert>
                    </>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Analyze a circuit to see metrics</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {analysis && analysis.suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="quantum-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Optimization Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.suggestions.map((tip, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() =>
                        setExpandedTip(
                          expandedTip === idx.toString() ? null : idx.toString()
                        )
                      }
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        expandedTip === idx.toString()
                          ? `${getImpactColor(tip.impact)}`
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{tip.title}</h4>
                          {expandedTip === idx.toString() && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="mt-3 space-y-2"
                            >
                              <p className="text-sm text-muted-foreground">
                                {tip.description}
                              </p>
                              <div className="p-3 rounded bg-background/50 border border-border">
                                <p className="text-xs text-muted-foreground mb-1">
                                  Suggestion:
                                </p>
                                <p className="text-sm font-mono text-primary">
                                  {tip.suggestion}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={`ml-2 ${getImpactColor(tip.impact)}`}
                        >
                          {tip.impact}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6 mt-6">
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Optimization History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : error ? (
                <Alert className="border-red-500/50 bg-red-500/10">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-400 text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {(optimizations.length > 0 ? optimizations : localOptimizations).map((opt) => (
                    <motion.div
                      key={opt.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
                            {opt.provider} - {new Date(opt.created_at).toLocaleDateString()}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Score: <span className="text-primary font-semibold">{opt.optimization_score}%</span> • Depth: {opt.circuit_depth} • Gates: {opt.gate_count} • Qubits: {opt.qubit_count}
                          </p>
                          {opt.notes && (
                            <p className="text-xs text-muted-foreground mt-2 italic">
                              {opt.notes}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant={opt.is_valid ? "default" : "destructive"}
                        >
                          {opt.is_valid ? "Valid" : "Invalid"}
                        </Badge>
                      </div>
                      {opt.optimization_suggestions &&
                        opt.optimization_suggestions.length > 0 && (
                          <div className="flex gap-2 flex-wrap mt-3 pt-3 border-t border-border/50">
                            {opt.optimization_suggestions.slice(0, 3).map((sug) => (
                              <Badge key={sug.id} variant="outline" className={`text-xs ${
                                sug.impact === 'high' ? 'border-red-500/50 text-red-400' :
                                sug.impact === 'medium' ? 'border-yellow-500/50 text-yellow-400' :
                                'border-green-500/50 text-green-400'
                              }`}>
                                {sug.title}
                              </Badge>
                            ))}
                            {opt.optimization_suggestions.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{opt.optimization_suggestions.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <OptimizationTrends
              data={[
                { date: "5 days ago", score: 65, depth: 20, gates: 35, cost: 0.0045 },
                { date: "4 days ago", score: 68, depth: 18, gates: 32, cost: 0.0042 },
                { date: "3 days ago", score: 72, depth: 16, gates: 28, cost: 0.0038 },
                { date: "2 days ago", score: 75, depth: 15, gates: 24, cost: 0.0032 },
                { date: "Yesterday", score: 78, depth: 14, gates: 20, cost: 0.0028 },
                { date: "Today", score: 82, depth: 12, gates: 18, cost: 0.0024 },
              ]}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="quantum-card">
              <CardHeader>
                <CardTitle>Optimization Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
                    <p className="text-sm text-muted-foreground mb-2">Avg Score Improvement</p>
                    <p className="text-3xl font-bold text-green-400">+17%</p>
                    <p className="text-xs text-muted-foreground mt-2">Over last 6 optimizations</p>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
                    <p className="text-sm text-muted-foreground mb-2">Cost Reduction</p>
                    <p className="text-3xl font-bold text-cyan-400">46.7%</p>
                    <p className="text-xs text-muted-foreground mt-2">Lower execution costs</p>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                    <p className="text-sm text-muted-foreground mb-2">Avg Depth Reduction</p>
                    <p className="text-3xl font-bold text-purple-400">40%</p>
                    <p className="text-xs text-muted-foreground mt-2">Faster circuit execution</p>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30">
                    <p className="text-sm text-muted-foreground mb-2">Most Used Provider</p>
                    <p className="text-2xl font-bold text-orange-400">Google Willow</p>
                    <p className="text-xs text-muted-foreground mt-2">4 of 6 optimizations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="quantum-card">
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border border-blue-500/30 bg-blue-500/10">
                    <p className="text-sm font-medium text-blue-300">Focus on Gate Reduction</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      You've achieved 40% depth reduction. Next, focus on merging redundant gates to further optimize.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border border-green-500/30 bg-green-500/10">
                    <p className="text-sm font-medium text-green-300">Explore IBM Condor</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your latest circuit score is 82%. Try submitting to IBM Condor for potential 5-10% additional optimization.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border border-purple-500/30 bg-purple-500/10">
                    <p className="text-sm font-medium text-purple-300">Consider Batch Processing</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Bundle 3-5 similar circuits to leverage batch optimization for 15-20% cost savings.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
