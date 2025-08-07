"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Atom, 
  Play, 
  RotateCcw, 
  Download, 
  Code,
  Zap,
  Activity,
  BarChart3
} from "lucide-react";

interface SimulationResult {
  qubits: number;
  gates: number;
  depth: number;
  fidelity: string;
  executionTime: string;
  measurements: Record<string, number>;
}

export default function QuantumSimulator() {
  const { toast } = useToast();
  const [qasmCode, setQasmCode] = useState(`OPENQASM 2.0;
include "qelib1.inc";

qreg q[2];
creg c[2];

h q[0];
cx q[0],q[1];
measure q -> c;`);
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [shots, setShots] = useState("1024");

  const runSimulation = async () => {
    if (!qasmCode.trim()) {
      toast({
        variant: "destructive",
        title: "Code Required",
        description: "Please enter QASM code to simulate."
      });
      return;
    }

    setIsSimulating(true);
    
    // Simulate quantum circuit execution
    setTimeout(() => {
      const mockResult: SimulationResult = {
        qubits: 2,
        gates: 3,
        depth: 2,
        fidelity: "99.8%",
        executionTime: "0.045ms",
        measurements: {
          "00": Math.floor(Math.random() * 400) + 100,
          "01": Math.floor(Math.random() * 100) + 50,
          "10": Math.floor(Math.random() * 100) + 50,
          "11": Math.floor(Math.random() * 400) + 100
        }
      };

      setResult(mockResult);
      setIsSimulating(false);
      
      toast({
        title: "Simulation Complete",
        description: "Quantum circuit simulation finished successfully."
      });
    }, 2000);
  };

  const resetSimulation = () => {
    setResult(null);
    setQasmCode(`OPENQASM 2.0;
include "qelib1.inc";

qreg q[2];
creg c[2];

h q[0];
cx q[0],q[1];
measure q -> c;`);
  };

  const exportResults = () => {
    if (!result) return;
    
    const data = JSON.stringify(result, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quantum-simulation-results.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Results Exported",
      description: "Simulation results downloaded as JSON file."
    });
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
          Quantum Circuit Simulator
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Test and visualize quantum circuits before deploying to real quantum hardware
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Circuit Editor */}
        <Card className="quantum-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              Circuit Editor
            </CardTitle>
            <CardDescription>Write and edit your quantum circuits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>QASM Code</Label>
              <Textarea
                value={qasmCode}
                onChange={(e) => setQasmCode(e.target.value)}
                className="quantum-input min-h-[300px] font-mono text-sm"
                placeholder="Enter your OpenQASM code here..."
              />
            </div>

            <div className="space-y-2">
              <Label>Number of Shots</Label>
              <Input
                type="number"
                value={shots}
                onChange={(e) => setShots(e.target.value)}
                className="quantum-input"
                placeholder="1024"
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={runSimulation}
                disabled={isSimulating}
                className="quantum-button flex-1"
              >
                {isSimulating ? (
                  <>
                    <Activity className="mr-2 h-4 w-4 animate-spin" />
                    Simulating...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run Simulation
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={resetSimulation}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="quantum-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Simulation Results
            </CardTitle>
            <CardDescription>Quantum circuit execution results</CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-6">
                {/* Circuit Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/20 border border-primary/10">
                    <p className="text-sm text-muted-foreground">Qubits</p>
                    <p className="text-xl font-bold text-primary">{result.qubits}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20 border border-primary/10">
                    <p className="text-sm text-muted-foreground">Gates</p>
                    <p className="text-xl font-bold text-primary">{result.gates}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20 border border-primary/10">
                    <p className="text-sm text-muted-foreground">Depth</p>
                    <p className="text-xl font-bold text-primary">{result.depth}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20 border border-primary/10">
                    <p className="text-sm text-muted-foreground">Fidelity</p>
                    <p className="text-xl font-bold text-green-400">{result.fidelity}</p>
                  </div>
                </div>

                {/* Measurement Results */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-primary">Measurement Results</h4>
                  <div className="space-y-2">
                    {Object.entries(result.measurements).map(([state, count]) => {
                      const percentage = (count / parseInt(shots)) * 100;
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

                <Button onClick={exportResults} variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export Results
                </Button>
              </div>
            ) : (
              <div className="text-center py-12">
                <Atom className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                  Ready to Simulate
                </h3>
                <p className="text-muted-foreground">
                  Enter your QASM code and click "Run Simulation" to see results
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}