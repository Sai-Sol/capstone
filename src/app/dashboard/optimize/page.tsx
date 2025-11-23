"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useOptimization } from "@/hooks/useOptimization";
import { StatusIndicator } from "@/components/optimize/StatusIndicator";
import { RealTimeMetrics } from "@/components/optimize/RealTimeMetrics";
import { ControlPanel } from "@/components/optimize/ControlPanel";
import { ProgressBar } from "@/components/optimize/ProgressBar";
import { LogViewer } from "@/components/optimize/LogViewer";
import { Eye, Layers, BookOpen } from "lucide-react";

const sampleQASM = `OPENQASM 2.0;
include "qelib1.inc";
qreg q[3];
creg c[3];
h q[0];
cx q[0],q[1];
cx q[1],q[2];
measure q -> c;`;

export default function OptimizePage() {
  const [circuitCode, setCircuitCode] = useState(sampleQASM);
  const {
    status,
    progress,
    metrics,
    logs,
    result,
    start,
    pause,
    resume,
    stop,
  } = useOptimization();

  const handleStart = () => {
    start(circuitCode);
  };

  return (
    <div className="space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
          Real-Time Circuit Optimization
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Live monitoring and control of your quantum circuit optimization process.
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
              <ControlPanel
                status={status}
                onStart={handleStart}
                onPause={pause}
                onResume={resume}
                onStop={stop}
              />
            </CardContent>
          </Card>

          <LogViewer logs={logs} />
        </div>

        <div className="space-y-4">
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  Optimization Status
                </div>
                <StatusIndicator status={status} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProgressBar progress={progress} />
            </CardContent>
          </Card>

          <RealTimeMetrics metrics={metrics} />
        </div>
      </motion.div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Optimization Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={result.optimizedQasm}
                readOnly
                className="font-mono text-sm min-h-48 bg-slate-950"
              />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
