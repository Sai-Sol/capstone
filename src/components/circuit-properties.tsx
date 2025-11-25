"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Copy, Play, Settings, Info, Zap, Clock, DollarSign, Target } from "lucide-react";
import { QuantumCircuit, QuantumGate } from "./circuit-builder";

interface CircuitPropertiesProps {
  circuit: QuantumCircuit;
  selectedGate: QuantumGate | null;
  onCircuitUpdate: (updates: Partial<QuantumCircuit>) => void;
  onGateUpdate: (gateId: string, updates: Partial<QuantumGate>) => void;
  onGateRemove: (gateId: string) => void;
  readOnly?: boolean;
}

const QUANTUM_PROVIDERS = [
  { id: 'ibm', name: 'IBM Quantum', description: 'Superconducting qubits' },
  { id: 'google', name: 'Google Quantum AI', description: 'Superconducting qubits' },
  { id: 'amazon', name: 'Amazon Braket', description: 'Multiple hardware types' },
  { id: 'microsoft', name: 'Microsoft Azure Quantum', description: 'Various platforms' },
  { id: 'rigetti', name: 'Rigetti Computing', description: 'Superconducting qubits' },
  { id: 'ionq', name: 'IonQ', description: 'Trapped ion qubits' }
];

const EXECUTION_PRESETS = {
  'quick': { shots: 100, optimizationLevel: 0, name: 'Quick Test' },
  'standard': { shots: 1024, optimizationLevel: 1, name: 'Standard' },
  'high-precision': { shots: 8192, optimizationLevel: 2, name: 'High Precision' },
  'production': { shots: 10000, optimizationLevel: 3, name: 'Production' }
};

export function CircuitProperties({
  circuit,
  selectedGate,
  onCircuitUpdate,
  onGateUpdate,
  onGateRemove,
  readOnly = false
}: CircuitPropertiesProps) {
  const [executionSettings, setExecutionSettings] = useState({
    provider: 'ibm',
    shots: 1024,
    optimizationLevel: 1,
    preset: 'standard',
    enableErrorMitigation: false,
    enableNoiseModeling: true,
    maxExecutionTime: 300, // seconds
    estimatedCost: 0
  });

  const [circuitMetrics, setCircuitMetrics] = useState({
    depth: 0,
    gateCount: 0,
    entanglement: 0,
    fidelity: 1.0,
    estimatedRuntime: 0,
    memoryUsage: 0,
    errorRate: 0
  });

  // Calculate circuit metrics
  useEffect(() => {
    const gateCount = circuit.gates.length;
    const depth = circuit.gates.length > 0
      ? Math.max(...circuit.gates.map(g => g.position?.x || 0)) + 1
      : 0;

    const entanglement = circuit.gates.filter(g =>
      ['CNOT', 'CZ', 'SWAP', 'TOFFOLI'].includes(g.type)
    ).length;

    const fidelity = Math.max(0.5, 1 - (gateCount * 0.001) - (entanglement * 0.01));
    const estimatedRuntime = gateCount * 0.1; // microseconds
    const memoryUsage = circuit.qubitCount * 8; // bytes
    const errorRate = gateCount * 0.0001;

    setCircuitMetrics({
      depth,
      gateCount,
      entanglement,
      fidelity,
      estimatedRuntime,
      memoryUsage,
      errorRate
    });

    // Estimate cost based on provider and settings
    const provider = QUANTUM_PROVIDERS.find(p => p.id === executionSettings.provider);
    const baseCost = gateCount * 0.001; // $0.001 per gate
    const shotsMultiplier = executionSettings.shots / 1000;
    const providerMultiplier = provider?.id === 'ibm' ? 1.2 : provider?.id === 'google' ? 1.5 : 1.0;

    const estimatedCost = baseCost * shotsMultiplier * providerMultiplier;
    setExecutionSettings(prev => ({ ...prev, estimatedCost }));
  }, [circuit, executionSettings.provider, executionSettings.shots]);

  const handlePresetChange = (preset: string) => {
    const settings = EXECUTION_PRESETS[preset as keyof typeof EXECUTION_PRESETS];
    if (settings) {
      setExecutionSettings(prev => ({
        ...prev,
        preset,
        shots: settings.shots,
        optimizationLevel: settings.optimizationLevel
      }));
    }
  };

  const handleGateParameterChange = (paramName: string, value: any) => {
    if (selectedGate) {
      onGateUpdate(selectedGate.id, {
        [paramName]: paramName === 'angle' ? parseFloat(value) : value
      });
    }
  };

  const duplicateGate = () => {
    if (selectedGate && !readOnly) {
      const newGate = {
        ...selectedGate,
        id: `gate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        position: {
          x: (selectedGate.position?.x || 0) + 1,
          y: selectedGate.position?.y || 0
        }
      };
      onCircuitUpdate({
        gates: [...circuit.gates, newGate],
        metadata: { ...circuit.metadata, modified: Date.now() }
      });
    }
  };

  const getGateParameter = (gate: QuantumGate, paramName: string) => {
    switch (paramName) {
      case 'theta':
        return gate.angle || 0;
      default:
        return gate[paramName as keyof QuantumGate];
    }
  };

  return (
    <Card className="w-96 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-400" />
          Properties
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="circuit" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800 border-slate-700">
            <TabsTrigger value="circuit" className="data-[state=active]:bg-slate-700">
              Circuit
            </TabsTrigger>
            <TabsTrigger value="execution" className="data-[state=active]:bg-slate-700">
              Execution
            </TabsTrigger>
          </TabsList>

          <TabsContent value="circuit" className="space-y-4">
            {/* Circuit Metrics */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-400" />
                  Circuit Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-slate-400">Depth</Label>
                    <p className="text-sm font-medium text-white">{circuitMetrics.depth}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">Gate Count</Label>
                    <p className="text-sm font-medium text-white">{circuitMetrics.gateCount}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">Qubits</Label>
                    <p className="text-sm font-medium text-white">{circuit.qubitCount}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">Entanglement</Label>
                    <p className="text-sm font-medium text-white">{circuitMetrics.entanglement}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">Est. Runtime</Label>
                    <p className="text-sm font-medium text-white">{circuitMetrics.estimatedRuntime.toFixed(2)} μs</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">Memory</Label>
                    <p className="text-sm font-medium text-white">{circuitMetrics.memoryUsage} B</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">Fidelity</Label>
                    <p className="text-sm font-medium text-green-400">{(circuitMetrics.fidelity * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">Error Rate</Label>
                    <p className="text-sm font-medium text-red-400">{(circuitMetrics.errorRate * 100).toFixed(3)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Qubit Configuration */}
            <div>
              <Label htmlFor="qubitCount">Qubit Count</Label>
              <div className="flex items-center gap-2 mt-1">
                <Slider
                  value={[circuit.qubitCount]}
                  onValueChange={([value]) => !readOnly && onCircuitUpdate({ qubitCount: value })}
                  max={20}
                  min={1}
                  step={1}
                  className="flex-1"
                  disabled={readOnly}
                />
                <span className="text-sm text-white w-8">{circuit.qubitCount}</span>
              </div>
            </div>

            {/* Selected Gate Properties */}
            {selectedGate && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-400" />
                      Selected Gate
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={duplicateGate}
                        disabled={readOnly}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onGateRemove(selectedGate.id)}
                        disabled={readOnly}
                        className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs text-slate-400">Type</Label>
                    <p className="text-sm font-medium text-white">{selectedGate.type}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">Qubits</Label>
                    <p className="text-sm font-medium text-white">{selectedGate.qubits.join(', ')}</p>
                  </div>

                  {/* Gate Parameters */}
                  {selectedGate.type.includes('R') && selectedGate.type.length === 2 && (
                    <div>
                      <Label htmlFor="angle">Angle (radians)</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Slider
                          value={[getGateParameter(selectedGate, 'theta')]}
                          onValueChange={([value]) => !readOnly && handleGateParameterChange('angle', value)}
                          max={2 * Math.PI}
                          min={0}
                          step={0.1}
                          className="flex-1"
                          disabled={readOnly}
                        />
                        <span className="text-sm text-white w-12">
                          {getGateParameter(selectedGate, 'theta').toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="gateColor">Gate Color</Label>
                    <Input
                      id="gateColor"
                      type="color"
                      value={selectedGate.color || '#6b7280'}
                      onChange={(e) => !readOnly && handleGateParameterChange('color', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white h-8 mt-1"
                      disabled={readOnly}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="execution" className="space-y-4">
            {/* Provider Selection */}
            <div>
              <Label htmlFor="provider">Quantum Provider</Label>
              <Select
                value={executionSettings.provider}
                onValueChange={(value) => !readOnly && setExecutionSettings(prev => ({ ...prev, provider: value }))}
                disabled={readOnly}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {QUANTUM_PROVIDERS.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id} className="text-white">
                      <div>
                        <div className="font-medium">{provider.name}</div>
                        <div className="text-xs text-slate-400">{provider.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Execution Presets */}
            <div>
              <Label htmlFor="preset">Execution Preset</Label>
              <Select
                value={executionSettings.preset}
                onValueChange={handlePresetChange}
                disabled={readOnly}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {Object.entries(EXECUTION_PRESETS).map(([key, preset]) => (
                    <SelectItem key={key} value={key} className="text-white">
                      {preset.name} - {preset.shots} shots, Level {preset.optimizationLevel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Execution Settings */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="shots">Shots</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Slider
                    value={[executionSettings.shots]}
                    onValueChange={([value]) => !readOnly && setExecutionSettings(prev => ({ ...prev, shots: value }))}
                    max={50000}
                    min={100}
                    step={100}
                    className="flex-1"
                    disabled={readOnly}
                  />
                  <span className="text-sm text-white w-12">{executionSettings.shots}</span>
                </div>
              </div>

              <div>
                <Label htmlFor="optimization">Optimization Level</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Slider
                    value={[executionSettings.optimizationLevel]}
                    onValueChange={([value]) => !readOnly && setExecutionSettings(prev => ({ ...prev, optimizationLevel: value }))}
                    max={3}
                    min={0}
                    step={1}
                    className="flex-1"
                    disabled={readOnly}
                  />
                  <span className="text-sm text-white w-8">{executionSettings.optimizationLevel}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {executionSettings.optimizationLevel === 0 && 'No optimization'}
                  {executionSettings.optimizationLevel === 1 && 'Light optimization'}
                  {executionSettings.optimizationLevel === 2 && 'Heavy optimization'}
                  {executionSettings.optimizationLevel === 3 && 'Maximum optimization'}
                </p>
              </div>

              <div>
                <Label htmlFor="maxTime">Max Execution Time (seconds)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Slider
                    value={[executionSettings.maxExecutionTime]}
                    onValueChange={([value]) => !readOnly && setExecutionSettings(prev => ({ ...prev, maxExecutionTime: value }))}
                    max={3600}
                    min={60}
                    step={60}
                    className="flex-1"
                    disabled={readOnly}
                  />
                  <span className="text-sm text-white w-16">
                    {executionSettings.maxExecutionTime}s
                  </span>
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Advanced Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="errorMitigation" className="text-sm">Error Mitigation</Label>
                  <Switch
                    id="errorMitigation"
                    checked={executionSettings.enableErrorMitigation}
                    onCheckedChange={(checked) => !readOnly &&
                      setExecutionSettings(prev => ({ ...prev, enableErrorMitigation: checked }))
                    }
                    disabled={readOnly}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="noiseModeling" className="text-sm">Noise Modeling</Label>
                  <Switch
                    id="noiseModeling"
                    checked={executionSettings.enableNoiseModeling}
                    onCheckedChange={(checked) => !readOnly &&
                      setExecutionSettings(prev => ({ ...prev, enableNoiseModeling: checked }))
                    }
                    disabled={readOnly}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Cost Estimation */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  Cost Estimation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Estimated Cost:</span>
                    <span className="text-lg font-medium text-green-400">
                      ${executionSettings.estimatedCost.toFixed(4)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Based on {circuitMetrics.gateCount} gates × {executionSettings.shots} shots
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Execute Button */}
            <Button
              className="w-full gap-2"
              disabled={readOnly || circuit.gates.length === 0}
              onClick={() => {
                // Implementation would trigger circuit execution
                console.log('Executing circuit with settings:', executionSettings);
              }}
            >
              <Play className="h-4 w-4" />
              Execute Circuit
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}