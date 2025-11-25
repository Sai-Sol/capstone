'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Settings,
  Download,
  Eye,
  Info,
  Zap,
  Atom,
  Clock,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface QuantumGate {
  id: string;
  name: string;
  type: 'X' | 'Y' | 'Z' | 'H' | 'CNOT' | 'SWAP' | 'U' | 'CX' | 'CZ' | 'RX' | 'RY' | 'RZ' | 'Measurement';
  target: number;
  control?: number;
  parameters?: number[];
  duration: number; // in ms
  description?: string;
}

interface QuantumState {
  vector: number[][];
  probability: number[];
  phase: number[];
  density?: number[][];
  entanglement?: number[][];
  timestamp: number;
}

interface StateEvolutionProps {
  gates: QuantumGate[];
  initialState: QuantumState;
  finalState?: QuantumState;
  states?: QuantumState[];
  selectedGate?: number;
  onGateSelect?: (gateIndex: number) => void;
  animationSpeed?: number;
  showControls?: boolean;
  showMathematics?: boolean;
  height?: number;
  interactive?: boolean;
  title?: string;
}

export function StateEvolution({
  gates = [],
  initialState,
  finalState,
  states = [],
  selectedGate,
  onGateSelect,
  animationSpeed = 1,
  showControls = true,
  showMathematics = true,
  height = 400,
  interactive = true,
  title = 'Quantum State Evolution'
}: StateEvolutionProps) {
  const [currentGate, setCurrentGate] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [visualizationType, setVisualizationType] = useState<'amplitude' | 'probability' | 'phase' | 'density'>('probability');
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [loopPlayback, setLoopPlayback] = useState(false);

  // Generate sample states if not provided
  const generateStates = useCallback(() => {
    if (states.length > 0) return states;

    const generatedStates: QuantumState[] = [initialState];
    let currentState = JSON.parse(JSON.stringify(initialState));

    gates.forEach((gate, index) => {
      // Simulate state evolution
      const newState = simulateGateOperation(currentState, gate);
      generatedStates.push(newState);
      currentState = newState;
    });

    return generatedStates;
  }, [gates, initialState, states]);

  const allStates = generateStates();

  // Simulate gate operation on quantum state
  const simulateGateOperation = (state: QuantumState, gate: QuantumGate): QuantumState => {
    const newState = JSON.parse(JSON.stringify(state));

    // Simple gate simulation (in real implementation, this would use proper quantum mechanics)
    switch (gate.type) {
      case 'X':
        // Bit flip
        if (state.vector.length > 1) {
          const temp = newState.vector[0];
          newState.vector[0] = newState.vector[1];
          newState.vector[1] = temp;
        }
        break;

      case 'H':
        // Hadamard gate - creates superposition
        if (state.vector.length > 1) {
          const a = newState.vector[0][0];
          const b = newState.vector[1][0];
          newState.vector[0][0] = (a + b) / Math.sqrt(2);
          newState.vector[1][0] = (a - b) / Math.sqrt(2);
        }
        break;

      case 'CNOT':
        // Controlled NOT (simplified)
        if (state.vector.length > 3) {
          const a = newState.vector[2][0];
          const b = newState.vector[3][0];
          newState.vector[2][0] = b;
          newState.vector[3][0] = a;
        }
        break;

      case 'Measurement':
        // Measurement causes collapse
        const probabilities = newState.vector.map(v => Math.abs(v[0][0]) ** 2);
        const cumulativeProb = probabilities.reduce((acc, p) => [...acc, (acc[acc.length - 1] || 0) + p], [0]);
        const random = Math.random();
        const collapsedIndex = cumulativeProb.findIndex((cp, i) => i > 0 && random >= cumulativeProb[i - 1] && random < cp);

        newState.vector = newState.vector.map((v, i) => i === collapsedIndex ? [[1], [0]] : [[0], [0]]);
        break;

      default:
        // Generic rotation or other gate
        newState.vector = newState.vector.map((v, i) => {
          const phase = Math.random() * Math.PI * 2;
          const amplitude = Math.abs(v[0][0]) * (0.9 + Math.random() * 0.2);
          return [[amplitude * Math.cos(phase)], [amplitude * Math.sin(phase)]];
        });
    }

    // Update probabilities and phases
    newState.probability = newState.vector.map(v => Math.abs(v[0][0]) ** 2);
    newState.phase = newState.vector.map(v => Math.atan2(v[1][0], v[0][0]));
    newState.timestamp = Date.now();

    return newState;
  };

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentGate(prev => {
        const next = prev + 1;
        if (next >= gates.length) {
          if (loopPlayback) {
            return 0;
          } else {
            setIsPlaying(false);
            return gates.length - 1;
          }
        }
        return next;
      });
    }, 2000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, gates.length, loopPlayback]);

  const getCurrentState = () => {
    return allStates[Math.min(currentGate, allStates.length - 1)];
  };

  const handleGateSelect = (index: number) => {
    setCurrentGate(index);
    onGateSelect?.(index);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    setCurrentGate(Math.max(0, currentGate - 1));
  };

  const handleNext = () => {
    setCurrentGate(Math.min(gates.length, currentGate + 1));
  };

  const handleReset = () => {
    setCurrentGate(0);
    setIsPlaying(false);
  };

  const exportEvolution = () => {
    const data = {
      gates,
      states: allStates,
      evolution: {
        initial: initialState,
        final: allStates[allStates.length - 1],
        gateCount: gates.length
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `state-evolution-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Sample data for demonstration
  const sampleGates: QuantumGate[] = [
    {
      id: 'g1',
      name: 'Initialize',
      type: 'H',
      target: 0,
      duration: 100,
      description: 'Initialize qubit in |0⟩ state'
    },
    {
      id: 'g2',
      name: 'Superposition',
      type: 'H',
      target: 0,
      duration: 200,
      description: 'Create equal superposition |+⟩ = (|0⟩ + |1⟩)/√2'
    },
    {
      id: 'g3',
      name: 'Controlled NOT',
      type: 'CNOT',
      target: 1,
      control: 0,
      duration: 300,
      description: 'Entangle qubits 0 (control) and 1 (target)'
    },
    {
      id: 'g4',
      name: 'Measurement',
      type: 'Measurement',
      target: 0,
      duration: 150,
      description: 'Measure qubit 0 in computational basis'
    }
  ];

  const sampleInitialState: QuantumState = {
    vector: [[[1], [0]], [[0], [0]], [[0], [0]], [[0], [0]]],
    probability: [1, 0, 0, 0],
    phase: [0, 0, 0, 0],
    timestamp: Date.now()
  };

  const displayGates = gates.length > 0 ? gates : sampleGates;
  const displayInitialState = initialState.vector ? initialState : sampleInitialState;
  const displayStates = allStates.length > 0 ? allStates : [displayInitialState];

  const currentState = getCurrentState();

  return (
    <Card className="quantum-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            {title}
            {isPlaying && (
              <motion.div
                className="w-2 h-2 bg-green-500 rounded-full"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </CardTitle>

          {showControls && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentGate === 0}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handlePlayPause}
              >
                {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentGate >= displayGates.length}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                <SkipBack className="h-3 w-3" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-3 w-3" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={exportEvolution}
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {currentGate} of {displayGates.length}</span>
            <span>{displayGates[currentGate]?.name || 'Initial State'}</span>
          </div>
          <Progress
            value={(currentGate / displayGates.length) * 100}
            className="h-2"
          />
        </div>
      </CardHeader>

      <CardContent>
        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-muted/10 rounded-lg space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Playback Speed</label>
                  <Slider
                    value={[playbackSpeed]}
                    onValueChange={([value]) => setPlaybackSpeed(value)}
                    min={0.5}
                    max={3}
                    step={0.5}
                    className="mt-2"
                  />
                  <span className="text-xs text-muted-foreground">{playbackSpeed}x</span>
                </div>

                <div>
                  <label className="text-sm font-medium">Visualization Type</label>
                  <select
                    value={visualizationType}
                    onChange={(e) => setVisualizationType(e.target.value as any)}
                    className="w-full mt-1 p-2 rounded border border-border bg-background text-sm"
                  >
                    <option value="probability">Probability</option>
                    <option value="amplitude">Amplitude</option>
                    <option value="phase">Phase</option>
                    <option value="density">Density Matrix</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="auto-advance"
                      checked={autoAdvance}
                      onChange={(e) => setAutoAdvance(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="auto-advance" className="text-sm">Auto-advance gates</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="loop-playback"
                      checked={loopPlayback}
                      onChange={(e) => setLoopPlayback(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="loop-playback" className="text-sm">Loop playback</label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gate Timeline */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <div
              className={`flex-shrink-0 p-3 rounded-lg border cursor-pointer transition-all ${
                currentGate === 0
                  ? 'border-primary bg-primary/20'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handleGateSelect(0)}
            >
              <div className="text-center">
                <Atom className="h-4 w-4 mx-auto mb-1 text-primary" />
                <div className="text-xs font-medium">Initial</div>
                <div className="text-xs text-muted-foreground">|0⟩</div>
              </div>
            </div>

            {displayGates.map((gate, index) => (
              <div
                key={gate.id}
                className={`flex-shrink-0 p-3 rounded-lg border cursor-pointer transition-all ${
                  currentGate === index + 1
                    ? 'border-primary bg-primary/20'
                    : currentGate > index + 1
                    ? 'border-green-400/50 bg-green-400/10'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleGateSelect(index + 1)}
              >
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-1 flex items-center justify-center">
                    {getGateIcon(gate.type)}
                  </div>
                  <div className="text-xs font-medium">{gate.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {gate.control !== undefined ? `Q${gate.control}→Q${gate.target}` : `Q${gate.target}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* State Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Amplitude/Probability Bars */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              State Vector {visualizationType === 'probability' ? 'Probabilities' : 'Amplitudes'}
            </h3>

            <div className="space-y-3">
              {(currentState.probability || []).map((prob, index) => {
                const value = visualizationType === 'probability'
                  ? prob
                  : Math.abs(currentState.vector?.[index]?.[0]?.[0] || 0);
                const phase = currentState.phase?.[index] || 0;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-mono">|{index.toString(2).padStart(2, '0')}⟩</span>
                      <div className="flex items-center gap-2">
                        {showMathematics && visualizationType === 'amplitude' && (
                          <span className="text-xs text-muted-foreground">
                            ∅ = {phase.toFixed(2)}rad
                          </span>
                        )}
                        <span className="font-mono">
                          {(value * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-4 bg-muted/20 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-purple-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${value * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Gate Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Current Operation
            </h3>

            {currentGate === 0 ? (
              <div className="p-4 bg-muted/10 rounded-lg">
                <h4 className="font-semibold mb-2">Initial State</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  All qubits initialized in |0⟩ state
                </p>
                {showMathematics && (
                  <div className="text-xs font-mono bg-black/50 p-2 rounded">
                    |ψ₀⟩ = |00...0⟩
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-muted/10 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getGateIcon(displayGates[currentGate - 1].type)}
                  <h4 className="font-semibold">{displayGates[currentGate - 1].name}</h4>
                  <Badge variant="outline">
                    {displayGates[currentGate - 1].type}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-3">
                  {displayGates[currentGate - 1].description}
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Target:</span>
                    <span className="ml-1">Qubit {displayGates[currentGate - 1].target}</span>
                  </div>
                  {displayGates[currentGate - 1].control !== undefined && (
                    <div>
                      <span className="text-muted-foreground">Control:</span>
                      <span className="ml-1">Qubit {displayGates[currentGate - 1].control}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="ml-1">{displayGates[currentGate - 1].duration}ms</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Progress:</span>
                    <span className="ml-1">{((currentGate / displayGates.length) * 100).toFixed(0)}%</span>
                  </div>
                </div>

                {showMathematics && (
                  <div className="mt-3 text-xs font-mono bg-black/50 p-2 rounded">
                    {getMathematicalRepresentation(displayGates[currentGate - 1])}
                  </div>
                )}
              </div>
            )}

            {/* Evolution Statistics */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-muted/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {calculateEntropy(currentState)}
                </div>
                <div className="text-xs text-muted-foreground">Entropy</div>
              </div>
              <div className="p-3 bg-muted/10 rounded-lg">
                <div className="text-2xl font-bold text-green-400">
                  {calculatePurity(currentState)}
                </div>
                <div className="text-xs text-muted-foreground">Purity</div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Controls */}
        <div className="mt-6 flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Timeline:</span>
          <Slider
            value={[currentGate]}
            onValueChange={([value]) => handleGateSelect(value)}
            min={0}
            max={displayGates.length}
            step={1}
            className="flex-1"
          />
          <span className="text-sm font-medium">
            {currentGate} / {displayGates.length}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper functions
function getGateIcon(type: string) {
  const icons: Record<string, JSX.Element> = {
    X: <div className="w-6 h-6 bg-red-500 rounded text-white text-xs flex items-center justify-center">X</div>,
    Y: <div className="w-6 h-6 bg-yellow-500 rounded text-white text-xs flex items-center justify-center">Y</div>,
    Z: <div className="w-6 h-6 bg-blue-500 rounded text-white text-xs flex items-center justify-center">Z</div>,
    H: <div className="w-6 h-6 bg-purple-500 rounded text-white text-xs flex items-center justify-center">H</div>,
    CNOT: <div className="w-6 h-6 bg-green-500 rounded text-white text-xs flex items-center justify-center">⊕</div>,
    CX: <div className="w-6 h-6 bg-green-500 rounded text-white text-xs flex items-center justify-center">⊕</div>,
    CZ: <div className="w-6 h-6 bg-cyan-500 rounded text-white text-xs flex items-center justify-center">⊗</div>,
    Measurement: <div className="w-6 h-6 bg-orange-500 rounded text-white text-xs flex items-center justify-center">M</div>,
    SWAP: <div className="w-6 h-6 bg-pink-500 rounded text-white text-xs flex items-center justify-center">⇄</div>,
    U: <div className="w-6 h-6 bg-indigo-500 rounded text-white text-xs flex items-center justify-center">U</div>
  };

  return icons[type] || <div className="w-6 h-6 bg-gray-500 rounded text-white text-xs flex items-center justify-center">?</div>;
}

function getMathematicalRepresentation(gate: QuantumGate): string {
  const representations: Record<string, string> = {
    X: 'X = [[0, 1], [1, 0]]',
    Y: 'Y = [[0, -i], [i, 0]]',
    Z: 'Z = [[1, 0], [0, -1]]',
    H: 'H = 1/√2 [[1, 1], [1, -1]]',
    CNOT: 'CNOT = |0⟩⟨0| ⊗ I + |1⟩⟨1| ⊗ X',
    Measurement: 'Π₀ = |0⟩⟨0|, Π₁ = |1⟩⟨1|'
  };

  return representations[gate.type] || `${gate.type} gate`;
}

function calculateEntropy(state: QuantumState): string {
  if (!state.probability) return '0.00';

  const entropy = state.probability.reduce((acc, p) => {
    return p > 0 ? acc - p * Math.log2(p) : acc;
  }, 0);

  return entropy.toFixed(2);
}

function calculatePurity(state: QuantumState): string {
  if (!state.probability) return '1.00';

  const purity = state.probability.reduce((acc, p) => acc + p * p, 0);
  return purity.toFixed(2);
}