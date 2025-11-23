"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Cpu,
  Thermometer,
  Activity,
  Target,
  Clock,
  DollarSign,
  GitBranch,
  Shield,
  Gauge,
  Lightbulb,
  RefreshCw,
  Download,
  Upload,
  Code,
  Database,
  Brain
} from "lucide-react";

const sampleQASM = `OPENQASM 2.0;
include "qelib1.inc";
qreg q[3];
creg c[3];
h q[0];
cx q[0],q[1];
cx q[1],q[2];
measure q -> c;`;

const optimizationTips = [
  {
    id: "1",
    title: "Reduce Circuit Depth",
    description:
      "Combine consecutive single-qubit gates on the same qubit to reduce overall circuit depth.",
    impact: "high",
    suggestion: "Use gate fusion to merge H-X-H into Z gate",
  },
  {
    id: "2",
    title: "Optimize Qubit Layout",
    description:
      "Reorder qubits to minimize CNOT gate distances and improve connectivity.",
    impact: "high",
    suggestion: "Rearrange qubits: [0,1,2] -> [2,0,1] reduces distance by 30%",
  },
  {
    id: "3",
    title: "Remove Redundant Gates",
    description: "Eliminate unnecessary gates that cancel out or have no effect.",
    impact: "medium",
    suggestion: "Remove X-X sequence (identity operation) at position 5",
  },
  {
    id: "4",
    title: "Parallelize Operations",
    description:
      "Identify gates that can execute simultaneously on different qubits.",
    impact: "medium",
    suggestion:
      "Move gate H(q2) earlier to run parallel with CNOT(q0,q1), saving 1 cycle",
  },
  {
    id: "5",
    title: "Use Native Gates",
    description:
      "Replace decomposed gates with native hardware gates for your target provider.",
    impact: "low",
    suggestion: "Replace RX gates with native parametric gates available on IBM Condor",
  },
];

export default function OptimizePage() {
  const [circuitCode, setCircuitCode] = useState(sampleQASM);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    depth: number;
    gates: number;
    qubits: number;
    score: number;
    time: number;
    cost: number;
    valid: boolean;
  } | null>(null);
  const [expandedTip, setExpandedTip] = useState<string | null>(null);

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

    setAnalysis({
      depth: 8,
      gates: gateCount,
      qubits: maxQubit + 1,
      score: 72,
      time: 245,
      cost: 15.5,
      valid: true,
    });

    setIsAnalyzing(false);
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 space-y-4">
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                OpenQASM Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={circuitCode}
                onChange={(e) => setCircuitCode(e.target.value)}
                placeholder="Paste your QASM code here..."
                className="font-mono text-sm min-h-48 bg-slate-950"
              />
              <Button
                onClick={handleAnalyze}
                size="lg"
                className="w-full"
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
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground mb-1">Circuit Depth</p>
                      <p className="text-3xl font-bold text-blue-400">{analysis.depth}</p>
                      <p className="text-xs text-muted-foreground mt-2">Total gate layers</p>
                    </div>
                    <div className="p-4 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground mb-1">Gate Count</p>
                      <p className="text-3xl font-bold text-cyan-400">{analysis.gates}</p>
                      <p className="text-xs text-muted-foreground mt-2">Total quantum gates</p>
                    </div>
                    <div className="p-4 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground mb-1">Est. Time</p>
                      <p className="text-3xl font-bold text-green-400">{analysis.time}ms</p>
                      <p className="text-xs text-muted-foreground mt-2">Execution time</p>
                    </div>
                    <div className="p-4 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground mb-1">Est. Cost</p>
                      <p className="text-3xl font-bold text-yellow-400">${analysis.cost}</p>
                      <p className="text-xs text-muted-foreground mt-2">Quantum credits</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Optimization Score</span>
                      <span className="text-lg font-bold text-primary">{analysis.score}%</span>
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
                    <p className="text-xl font-bold text-primary">{analysis.qubits}</p>
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
                  <Alert className="border-blue-500/50 bg-blue-500/10">
                    <Zap className="h-4 w-4 text-blue-400" />
                    <AlertDescription className="text-blue-400 text-xs">
                      {optimizationTips.length} optimization tips available
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

      {analysis && (
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
              {optimizationTips.map((tip, idx) => (
                <motion.div
                  key={tip.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setExpandedTip(expandedTip === tip.id ? null : tip.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    expandedTip === tip.id
                      ? `${getImpactColor(tip.impact)}`
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{tip.title}</h4>
                      {expandedTip === tip.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-3 space-y-2"
                        >
                          <p className="text-sm text-muted-foreground">
                            {tip.description}
                          </p>
                          <div className="p-3 rounded bg-background/50 border border-border">
                            <p className="text-xs text-muted-foreground mb-1">Suggestion:</p>
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
    </div>
  );
}
