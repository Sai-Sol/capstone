"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Zap,
  Eye,
  Layers,
  BookOpen,
} from "lucide-react";

interface OptimizationAnalysis {
  circuitDepth: number;
  gateCount: number;
  qubitUtilization: number;
  estimatedTime: number;
  estimatedCost: number;
  optimizationScore: number;
  improvements: OptimizationTip[];
  isValid: boolean;
  validationErrors: string[];
}

interface OptimizationTip {
  id: string;
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  suggestion: string;
}

interface CircuitOptimizerAnalyzerProps {
  circuitCode: string;
  provider?: string;
  onOptimize?: (suggestion: string) => void;
}

export function CircuitOptimizerAnalyzer({
  circuitCode,
  provider = "Google Willow",
  onOptimize,
}: CircuitOptimizerAnalyzerProps) {
  const [analysis, setAnalysis] = useState<OptimizationAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedTip, setExpandedTip] = useState<string | null>(null);

  useEffect(() => {
    if (circuitCode.trim()) {
      analyzeCircuit();
    }
  }, [circuitCode]);

  const analyzeCircuit = async () => {
    setIsAnalyzing(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const gateCount = (circuitCode.match(/\b[a-z]+\s+q\[/gi) || []).length;
    const qubitMatches = circuitCode.match(/q\[(\d+)\]/g) || [];
    const maxQubit = qubitMatches.length > 0
      ? Math.max(...qubitMatches.map((m: string) => parseInt(m.match(/\d+/)![0])))
      : 0;
    const qubitCount = maxQubit + 1;

    const hasValidQASMHeader = circuitCode.includes("OPENQASM");
    const hasInclude = circuitCode.includes("include");
    const hasMeasurement = circuitCode.includes("measure");
    const validationErrors: string[] = [];

    if (!hasValidQASMHeader) validationErrors.push("Missing OPENQASM 2.0 header");
    if (!hasInclude) validationErrors.push("Missing qelib1.inc include");

    const isValid = validationErrors.length === 0;

    const circuitDepth = Math.ceil(gateCount / Math.max(qubitCount, 1));
    const estimatedTime = 5 + circuitDepth * 2;
    const estimatedCost = 0.001 + gateCount * 0.0001;

    const improvements: OptimizationTip[] = [];

    if (gateCount > 20) {
      improvements.push({
        id: "gate-count",
        title: "High Gate Count Detected",
        description: "Your circuit has many gates, which increases execution time and costs.",
        impact: "high",
        suggestion: "Consider merging adjacent single-qubit gates or using multi-qubit gate sequences.",
      });
    }

    if (qubitCount > 8 && provider === "Amazon Braket") {
      improvements.push({
        id: "qubit-limit",
        title: "Large Qubit Count",
        description: "Amazon Braket has limitations for this many qubits.",
        impact: "high",
        suggestion: "Consider using Google Willow or IBM Condor for better large-qubit support.",
      });
    }

    if (!hasMeasurement) {
      improvements.push({
        id: "no-measurement",
        title: "No Measurement Operations",
        description: "Your circuit doesn't measure the results.",
        impact: "medium",
        suggestion: "Add measurement operations at the end to extract classical results.",
      });
    }

    if (gateCount > 10 && gateCount < 50) {
      improvements.push({
        id: "optimization-opportunity",
        title: "Optimization Opportunity",
        description: "Circuit can be optimized for better performance.",
        impact: "medium",
        suggestion: "Look for redundant gates or sequences that can be simplified.",
      });
    }

    if (circuitDepth > 20) {
      improvements.push({
        id: "deep-circuit",
        title: "Deep Circuit Depth",
        description: "Long execution chains may accumulate more quantum noise.",
        impact: "medium",
        suggestion: "Use quantum error correction strategies or parallelize operations where possible.",
      });
    }

    const optimizationScore = Math.max(
      0,
      100 -
        improvements.reduce((sum, imp) => {
          return (
            sum +
            (imp.impact === "high" ? 30 : imp.impact === "medium" ? 15 : 5)
          );
        }, 0)
    );

    const newAnalysis: OptimizationAnalysis = {
      circuitDepth,
      gateCount,
      qubitUtilization: (qubitCount / 105) * 100,
      estimatedTime,
      estimatedCost,
      optimizationScore,
      improvements,
      isValid,
      validationErrors,
    };

    setAnalysis(newAnalysis);
    setIsAnalyzing(false);
  };

  if (!circuitCode.trim()) {
    return (
      <Card className="bg-slate-950 border-slate-700 border-dashed">
        <CardContent className="py-8 text-center text-slate-400">
          <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Enter a quantum circuit to analyze</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-purple-400" />
            Circuit Analysis & Optimization
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {isAnalyzing ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-purple-400 border-r-transparent"></div>
              <p className="mt-2 text-sm text-slate-400">Analyzing circuit...</p>
            </div>
          ) : analysis ? (
            <>
              {!analysis.isValid && analysis.validationErrors.length > 0 && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded flex gap-3 items-start">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-red-400 mb-1">Validation Issues</p>
                    <ul className="text-xs text-red-300/80 space-y-0.5">
                      {analysis.validationErrors.map((error, idx) => (
                        <li key={idx}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {analysis.isValid && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded flex gap-3 items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-green-400">Circuit Valid</p>
                    <p className="text-xs text-green-300/60 mt-0.5">Ready for submission</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-950 rounded p-3 border border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Circuit Depth</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {analysis.circuitDepth}
                  </p>
                </div>
                <div className="bg-slate-950 rounded p-3 border border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Gate Count</p>
                  <p className="text-2xl font-bold text-green-400">
                    {analysis.gateCount}
                  </p>
                </div>
                <div className="bg-slate-950 rounded p-3 border border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Est. Time</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {analysis.estimatedTime}s
                  </p>
                </div>
                <div className="bg-slate-950 rounded p-3 border border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Est. Cost</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {analysis.estimatedCost.toFixed(4)} ETH
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Optimization Score
                  </h4>
                  <Badge
                    variant="outline"
                    className={
                      analysis.optimizationScore >= 80
                        ? "bg-green-500/10 text-green-400"
                        : analysis.optimizationScore >= 60
                          ? "bg-yellow-500/10 text-yellow-400"
                          : "bg-red-500/10 text-red-400"
                    }
                  >
                    {analysis.optimizationScore}%
                  </Badge>
                </div>
                <Progress value={analysis.optimizationScore} className="h-2" />
              </div>

              {analysis.improvements.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Optimization Suggestions ({analysis.improvements.length})
                  </h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {analysis.improvements.map((tip) => (
                      <div
                        key={tip.id}
                        className="p-3 bg-slate-950 rounded border border-slate-700 cursor-pointer hover:border-slate-600 transition-colors"
                        onClick={() =>
                          setExpandedTip(
                            expandedTip === tip.id ? null : tip.id
                          )
                        }
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{tip.title}</p>
                            {expandedTip === tip.id && (
                              <p className="text-xs text-slate-400 mt-1">
                                {tip.description}
                              </p>
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              tip.impact === "high"
                                ? "bg-red-500/10 text-red-400 border-red-500/20 text-xs flex-shrink-0"
                                : tip.impact === "medium"
                                  ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-xs flex-shrink-0"
                                  : "bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs flex-shrink-0"
                            }
                          >
                            {tip.impact}
                          </Badge>
                        </div>
                        {expandedTip === tip.id && (
                          <div className="mt-3 pt-3 border-t border-slate-700 space-y-2">
                            <p className="text-xs text-slate-300">
                              <span className="font-medium">Suggestion:</span>{" "}
                              {tip.suggestion}
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOptimize?.(tip.suggestion);
                              }}
                            >
                              <Layers className="h-3 w-3 mr-1" />
                              Apply Suggestion
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-slate-400 p-3 bg-slate-950 rounded border border-slate-700">
                <p className="font-medium mb-1">Qubit Utilization</p>
                <Progress
                  value={analysis.qubitUtilization}
                  className="h-1.5 mb-1"
                />
                <p>
                  Using {((analysis.qubitUtilization / 100) * 105).toFixed(0)} of{" "}
                  {provider === "Google Willow"
                    ? "105"
                    : provider === "IBM Condor"
                      ? "1121"
                      : "256"}{" "}
                  available qubits on {provider}
                </p>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
