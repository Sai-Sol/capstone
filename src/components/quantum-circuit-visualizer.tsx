"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface QuantumGate {
  id: string;
  type: string;
  qubits: number[];
  angle?: number;
  label: string;
}

interface QuantumCircuit {
  name: string;
  description?: string;
  gates: QuantumGate[];
  qubitCount: number;
}

interface CircuitVisualizerProps {
  circuit: QuantumCircuit;
  onGateSelect?: (gate: QuantumGate) => void;
}

export function QuantumCircuitVisualizer({ circuit, onGateSelect }: CircuitVisualizerProps) {
  const [zoom, setZoom] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedGate, setSelectedGate] = useState<string | null>(null);
  const [qubitStates, setQubitStates] = useState<number[][]>([]);

  useEffect(() => {
    const states = Array(circuit.qubitCount)
      .fill(null)
      .map(() => [1, 0]);
    setQubitStates(states);
  }, [circuit.qubitCount]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= circuit.gates.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 500);

    return () => clearInterval(timer);
  }, [isPlaying, circuit.gates.length]);

  const handleGateClick = (gate: QuantumGate) => {
    setSelectedGate(gate.id);
    onGateSelect?.(gate);
  };

  const getGateColor = (gateType: string) => {
    const colors: { [key: string]: string } = {
      X: "bg-red-500",
      Y: "bg-yellow-500",
      Z: "bg-blue-500",
      H: "bg-green-500",
      CNOT: "bg-purple-500",
      SWAP: "bg-pink-500",
      RX: "bg-orange-500",
      RY: "bg-cyan-500",
      RZ: "bg-indigo-500",
    };
    return colors[gateType] || "bg-gray-500";
  };

  const getMeasurementProbability = (qubitIndex: number) => {
    const state = qubitStates[qubitIndex] || [1, 0];
    return Math.abs(state[0]) ** 2;
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">{circuit.name}</CardTitle>
              {circuit.description && (
                <p className="text-sm text-slate-400 mt-1">{circuit.description}</p>
              )}
            </div>
            <Badge variant="outline" className="text-blue-400 border-blue-500/50">
              {circuit.qubitCount} Qubits
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex gap-2 items-center justify-between">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={isPlaying ? "secondary" : "default"}
                onClick={() => setIsPlaying(!isPlaying)}
                className="gap-2"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Play
                  </>
                )}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentStep(0)}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>

            <div className="flex gap-2 items-center">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Progress value={(currentStep / circuit.gates.length) * 100} className="h-2" />

          <div
            className="bg-slate-950 rounded-lg p-6 overflow-x-auto"
            style={{ transform: `scale(${zoom})`, transformOrigin: "left top" }}
          >
            <svg width={400} height={circuit.qubitCount * 60 + 40} className="mx-auto">
              {Array(circuit.qubitCount)
                .fill(null)
                .map((_, qIndex) => (
                  <g key={`qubit-${qIndex}`}>
                    <line
                      x1={20}
                      y1={40 + qIndex * 60}
                      x2={380}
                      y2={40 + qIndex * 60}
                      stroke="#64748b"
                      strokeWidth="2"
                    />
                    <text
                      x={5}
                      y={45 + qIndex * 60}
                      fill="#cbd5e1"
                      fontSize="12"
                      textAnchor="end"
                    >
                      q{qIndex}
                    </text>
                  </g>
                ))}

              {circuit.gates.map((gate, gateIndex) => {
                const isExecuted = gateIndex < currentStep;
                const isCurrent = gateIndex === currentStep;
                const isHighlighted = selectedGate === gate.id;

                return gate.qubits.map((qubit, qubitPos) => {
                  const x = 80 + gateIndex * 40;
                  const y = 40 + qubit * 60;

                  return (
                    <g key={`gate-${gate.id}-${qubit}`}>
                      <rect
                        x={x - 12}
                        y={y - 12}
                        width="24"
                        height="24"
                        className={`cursor-pointer transition-all ${getGateColor(
                          gate.type
                        )} ${
                          isCurrent ? "opacity-100 stroke-yellow-300 stroke-2" : ""
                        } ${isHighlighted ? "opacity-100" : "opacity-75"}`}
                        onClick={() => handleGateClick(gate)}
                      />
                      <text
                        x={x}
                        y={y + 4}
                        fill="white"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                        pointerEvents="none"
                      >
                        {gate.label}
                      </text>
                    </g>
                  );
                });
              })}
            </svg>
          </div>

          {selectedGate && (
            <Card className="bg-slate-950 border-slate-700">
              <CardHeader>
                <CardTitle className="text-sm">Selected Gate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {circuit.gates.map(
                  (gate) =>
                    gate.id === selectedGate && (
                      <div key={gate.id} className="text-sm space-y-1">
                        <p>
                          <span className="text-slate-400">Type:</span>{" "}
                          <span className="font-mono font-semibold">{gate.type}</span>
                        </p>
                        <p>
                          <span className="text-slate-400">Qubits:</span>{" "}
                          <span className="font-mono">{gate.qubits.join(", ")}</span>
                        </p>
                        {gate.angle !== undefined && (
                          <p>
                            <span className="text-slate-400">Angle:</span>{" "}
                            <span className="font-mono">{gate.angle.toFixed(3)} rad</span>
                          </p>
                        )}
                      </div>
                    )
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-slate-950 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xs">Measurement Probabilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Array(circuit.qubitCount)
                  .fill(null)
                  .map((_, i) => (
                    <div key={`prob-${i}`} className="text-xs">
                      <div className="flex justify-between mb-1">
                        <span>q{i}</span>
                        <span className="text-green-400">
                          {(getMeasurementProbability(i) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={getMeasurementProbability(i) * 100}
                        className="h-1"
                      />
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card className="bg-slate-950 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xs">Entanglement Map</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-slate-400">
                  Gates processed: {currentStep} / {circuit.gates.length}
                </p>
                <p className="text-xs text-slate-400">
                  Total depth: {circuit.gates.length}
                </p>
                <p className="text-xs text-slate-400">
                  Complexity: {(circuit.gates.length * circuit.qubitCount * 0.1).toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
