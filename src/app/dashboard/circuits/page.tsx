"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuantumCircuitVisualizer } from "@/components/quantum-circuit-visualizer";
import { Zap, Play, Plus, Download } from "lucide-react";

const mockCircuit = {
  name: "Bell State Creation",
  description: "Demonstrates quantum entanglement with a Bell state",
  qubitCount: 2,
  gates: [
    { id: "h1", type: "H", qubits: [0], label: "H", angle: 0 },
    { id: "cnot1", type: "CNOT", qubits: [0, 1], label: "⊗", angle: 0 },
  ],
};

const additionalCircuits = [
  {
    name: "Grover's Algorithm",
    qubits: 3,
    depth: 12,
    status: "ready",
  },
  {
    name: "Quantum Fourier Transform",
    qubits: 4,
    depth: 8,
    status: "ready",
  },
  {
    name: "VQE Circuit",
    qubits: 5,
    depth: 15,
    status: "ready",
  },
];

export default function CircuitsPage() {
  const [selectedCircuit, setSelectedCircuit] = useState(mockCircuit);
  const [visualizerMode, setVisualizerMode] = useState("quantum");
  const [executionSpeed, setExecutionSpeed] = useState("normal");
  const [showMetrics, setShowMetrics] = useState(true);
  const [enableDebugging, setEnableDebugging] = useState(false);

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Advanced Quantum Circuit Lab
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Real-time quantum circuit visualization with state vector evolution, entanglement mapping, and hardware simulation.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import QASM
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2">
          <QuantumCircuitVisualizer circuit={selectedCircuit} />
        </div>

        <div className="space-y-4">
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Circuit Library
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {additionalCircuits.map((circuit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="cursor-pointer hover:border-primary/50 transition-all">
                    <CardContent className="p-3">
                      <h4 className="font-semibold text-sm mb-2">{circuit.name}</h4>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p>Qubits: <span className="text-primary font-mono">{circuit.qubits}</span></p>
                        <p>Depth: <span className="text-primary font-mono">{circuit.depth}</span></p>
                      </div>
                      <Badge variant="outline" className="mt-2 text-green-400 border-green-400/50 text-xs">
                        Ready to Run
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <Button className="w-full" size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Create Circuit
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="quantum-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <h4 className="font-semibold mb-2">Step-Through Execution</h4>
                <p className="text-sm text-muted-foreground">Watch quantum gates execute step-by-step and observe state evolution in real-time.</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <h4 className="font-semibold mb-2">Entanglement Mapping</h4>
                <p className="text-sm text-muted-foreground">Visualize qubit correlations and entanglement patterns as gates are applied.</p>
              </div>
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <h4 className="font-semibold mb-2">Measurement Probabilities</h4>
                <p className="text-sm text-muted-foreground">Real-time calculation and visualization of measurement probabilities for each qubit.</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <h4 className="font-semibold mb-2">Interactive Debugging</h4>
                <p className="text-sm text-muted-foreground">Click gates to inspect details, zoom in/out, and analyze circuit depth.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
