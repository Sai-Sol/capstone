'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import {
  Settings,
  Play,
  Download,
  Upload,
  RefreshCw,
  Info,
  Activity,
  Zap,
  Thermometer,
  Cpu,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Save,
  FileText,
  Database,
  Sliders,
  Eye,
  EyeOff
} from 'lucide-react';

interface NoiseParameters {
  t1Time: number; // Relaxation time in microseconds
  t2Time: number; // Dephasing time in microseconds
  singleQubitErrorRate: number; // Single-qubit gate error rate
  twoQubitErrorRate: number; // Two-qubit gate error rate
  readoutErrorRate: number; // Measurement error rate
  crosstalkRate: number; // Crosstalk error rate
  thermalRelaxationRate: number; // Thermal relaxation rate
  phaseDampingRate: number; // Phase damping rate
  amplitudeDampingRate: number; // Amplitude damping rate
  leakageRate: number; // Leakage error rate
}

interface DeviceNoiseProfile {
  deviceId: string;
  deviceName: string;
  parameters: NoiseParameters;
  lastCalibrated: string;
  calibrationScore: number;
  temperature: number;
  connectivity: number[][];
}

interface NoiseModelInterfaceProps {
  deviceProfiles?: DeviceNoiseProfile[];
  selectedDevice?: string;
  onDeviceSelect?: (deviceId: string) => void;
  customParameters?: NoiseParameters;
  onParametersChange?: (params: NoiseParameters) => void;
  showSimulation?: boolean;
  allowCustomization?: boolean;
  height?: number;
  title?: string;
}

export function NoiseModelInterface({
  deviceProfiles = [],
  selectedDevice,
  onDeviceSelect,
  customParameters,
  onParametersChange,
  showSimulation = true,
  allowCustomization = true,
  height = 600,
  title = 'Quantum Noise Model Configuration'
}: NoiseModelInterfaceProps) {
  const [currentDevice, setCurrentDevice] = useState(selectedDevice);
  const [parameters, setParameters] = useState<NoiseParameters>(
    customParameters || {
      t1Time: 100,
      t2Time: 80,
      singleQubitErrorRate: 0.001,
      twoQubitErrorRate: 0.01,
      readoutErrorRate: 0.02,
      crosstalkRate: 0.001,
      thermalRelaxationRate: 0.01,
      phaseDampingRate: 0.005,
      amplitudeDampingRate: 0.008,
      leakageRate: 0.0001
    }
  );
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [useCurrentDeviceData, setUseCurrentDeviceData] = useState(true);
  const [customModelName, setCustomModelName] = useState('');
  const [savedModels, setSavedModels] = useState<any[]>([]);

  // Generate sample device profiles if not provided
  const generateSampleProfiles = (): DeviceNoiseProfile[] => {
    return [
      {
        deviceId: 'ibm_washington',
        deviceName: 'IBM Washington',
        parameters: {
          t1Time: 120,
          t2Time: 95,
          singleQubitErrorRate: 0.0008,
          twoQubitErrorRate: 0.008,
          readoutErrorRate: 0.015,
          crosstalkRate: 0.0005,
          thermalRelaxationRate: 0.008,
          phaseDampingRate: 0.004,
          amplitudeDampingRate: 0.006,
          leakageRate: 0.0001
        },
        lastCalibrated: new Date(Date.now() - 86400000).toISOString(),
        calibrationScore: 0.96,
        temperature: 15.2,
        connectivity: [[1], [0, 2], [1, 3], [2]]
      },
      {
        deviceId: 'google_willow',
        deviceName: 'Google Willow',
        parameters: {
          t1Time: 150,
          t2Time: 120,
          singleQubitErrorRate: 0.0005,
          twoQubitErrorRate: 0.006,
          readoutErrorRate: 0.012,
          crosstalkRate: 0.0003,
          thermalRelaxationRate: 0.006,
          phaseDampingRate: 0.003,
          amplitudeDampingRate: 0.005,
          leakageRate: 0.00008
        },
        lastCalibrated: new Date(Date.now() - 43200000).toISOString(),
        calibrationScore: 0.98,
        temperature: 12.8,
        connectivity: [[1], [0, 2], [1, 3], [2]]
      }
    ];
  };

  // Initialize with sample data if needed
  useEffect(() => {
    if (deviceProfiles.length === 0) {
      const sampleProfiles = generateSampleProfiles();
      // Set parameters from first device
      if (sampleProfiles.length > 0) {
        setParameters(sampleProfiles[0].parameters);
        setCurrentDevice(sampleProfiles[0].deviceId);
      }
    }
  }, [deviceProfiles]);

  const handleDeviceSelect = (deviceId: string) => {
    setCurrentDevice(deviceId);
    if (useCurrentDeviceData) {
      const profile = deviceProfiles.length > 0
        ? deviceProfiles.find(p => p.deviceId === deviceId)
        : generateSampleProfiles().find(p => p.deviceId === deviceId);

      if (profile) {
        setParameters(profile.parameters);
      }
    }
    onDeviceSelect?.(deviceId);
  };

  const handleParameterChange = (paramName: keyof NoiseParameters, value: number) => {
    const newParams = { ...parameters, [paramName]: value };
    setParameters(newParams);
    onParametersChange?.(newParams);
  };

  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      // Simulate quantum circuit execution with noise
      await new Promise(resolve => setTimeout(resolve, 2000));

      const results = {
        idealFidelity: 0.987,
        noisyFidelity: Math.max(0.5, 0.987 - (
          parameters.singleQubitErrorRate * 10 +
          parameters.twoQubitErrorRate * 5 +
          parameters.readoutErrorRate * 3 +
          parameters.crosstalkRate * 8
        )),
        errorBreakdown: {
          decoherence: parameters.thermalRelaxationRate * 15,
          gateErrors: (parameters.singleQubitErrorRate + parameters.twoQubitErrorRate) * 20,
          measurementErrors: parameters.readoutErrorRate * 25,
          crosstalkErrors: parameters.crosstalkRate * 30
        },
        circuitDepth: 50,
        gateCount: 200,
        executionTime: 125.5,
        errorMitigationBenefit: 0.15
      };

      setSimulationResults(results);
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  const exportNoiseModel = () => {
    const model = {
      name: customModelName || `noise_model_${Date.now()}`,
      parameters,
      timestamp: new Date().toISOString(),
      deviceId: currentDevice,
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(model, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${model.name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importNoiseModel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedModel = JSON.parse(e.target?.result as string);
        setParameters(importedModel.parameters);
        setCustomModelName(importedModel.name);
      } catch (error) {
        console.error('Failed to import noise model:', error);
      }
    };
    reader.readAsText(file);
  };

  const saveCurrentModel = () => {
    const model = {
      id: Date.now().toString(),
      name: customModelName || `Custom Model ${savedModels.length + 1}`,
      parameters: { ...parameters },
      timestamp: new Date().toISOString()
    };

    setSavedModels([...savedModels, model]);
    setCustomModelName('');
  };

  const loadSavedModel = (model: any) => {
    setParameters(model.parameters);
    setCustomModelName(model.name);
  };

  const displayProfiles = deviceProfiles.length > 0 ? deviceProfiles : generateSampleProfiles();

  return (
    <Card className="quantum-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>

          <div className="flex items-center gap-2">
            {allowCustomization && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUseCurrentDeviceData(!useCurrentDeviceData)}
              >
                <Database className="h-3 w-3 mr-1" />
                {useCurrentDeviceData ? 'Device Data' : 'Custom'}
              </Button>
            )}

            {showSimulation && (
              <Button
                variant="outline"
                size="sm"
                onClick={runSimulation}
                disabled={isSimulating}
              >
                {isSimulating ? (
                  <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Play className="h-3 w-3 mr-1" />
                )}
                Simulate
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={exportNoiseModel}
            >
              <Download className="h-3 w-3" />
            </Button>

            {allowCustomization && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('noise-model-import')?.click()}
              >
                <Upload className="h-3 w-3" />
              </Button>
            )}

            <input
              id="noise-model-import"
              type="file"
              accept=".json"
              onChange={importNoiseModel}
              className="hidden"
            />
          </div>
        </div>

        {/* Device Selection */}
        {useCurrentDeviceData && (
          <div className="flex gap-2 flex-wrap">
            {displayProfiles.map(profile => (
              <Button
                key={profile.deviceId}
                variant={currentDevice === profile.deviceId ? "default" : "outline"}
                size="sm"
                onClick={() => handleDeviceSelect(profile.deviceId)}
                className="flex items-center gap-2"
              >
                <Cpu className="h-3 w-3" />
                {profile.deviceName}
                <Badge variant="outline" className="text-xs">
                  {(profile.calibrationScore * 100).toFixed(0)}%
                </Badge>
              </Button>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Noise Parameters */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Noise Parameters</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {showAdvanced ? 'Simple' : 'Advanced'}
              </Button>
            </div>

            {/* Basic Parameters */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">T₁ Time (Relaxation)</label>
                  <span className="text-sm font-mono">{parameters.t1Time} μs</span>
                </div>
                <Slider
                  value={[parameters.t1Time]}
                  onValueChange={([value]) => handleParameterChange('t1Time', value)}
                  min={10}
                  max={500}
                  step={5}
                  disabled={!allowCustomization}
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">T₂ Time (Dephasing)</label>
                  <span className="text-sm font-mono">{parameters.t2Time} μs</span>
                </div>
                <Slider
                  value={[parameters.t2Time]}
                  onValueChange={([value]) => handleParameterChange('t2Time', value)}
                  min={10}
                  max={400}
                  step={5}
                  disabled={!allowCustomization}
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Single-Qubit Gate Error</label>
                  <span className="text-sm font-mono">{(parameters.singleQubitErrorRate * 100).toFixed(3)}%</span>
                </div>
                <Slider
                  value={[parameters.singleQubitErrorRate]}
                  onValueChange={([value]) => handleParameterChange('singleQubitErrorRate', value)}
                  min={0}
                  max={0.01}
                  step={0.0001}
                  disabled={!allowCustomization}
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Two-Qubit Gate Error</label>
                  <span className="text-sm font-mono">{(parameters.twoQubitErrorRate * 100).toFixed(3)}%</span>
                </div>
                <Slider
                  value={[parameters.twoQubitErrorRate]}
                  onValueChange={([value]) => handleParameterChange('twoQubitErrorRate', value)}
                  min={0}
                  max={0.05}
                  step={0.001}
                  disabled={!allowCustomization}
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Readout Error Rate</label>
                  <span className="text-sm font-mono">{(parameters.readoutErrorRate * 100).toFixed(3)}%</span>
                </div>
                <Slider
                  value={[parameters.readoutErrorRate]}
                  onValueChange={([value]) => handleParameterChange('readoutErrorRate', value)}
                  min={0}
                  max={0.1}
                  step={0.001}
                  disabled={!allowCustomization}
                />
              </div>
            </div>

            {/* Advanced Parameters */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 p-4 bg-muted/10 rounded-lg"
                >
                  <h4 className="font-semibold">Advanced Noise Parameters</h4>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium">Crosstalk Rate</label>
                      <span className="text-sm font-mono">{(parameters.crosstalkRate * 100).toFixed(3)}%</span>
                    </div>
                    <Slider
                      value={[parameters.crosstalkRate]}
                      onValueChange={([value]) => handleParameterChange('crosstalkRate', value)}
                      min={0}
                      max={0.01}
                      step={0.0001}
                      disabled={!allowCustomization}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium">Thermal Relaxation Rate</label>
                      <span className="text-sm font-mono">{(parameters.thermalRelaxationRate * 100).toFixed(3)}%</span>
                    </div>
                    <Slider
                      value={[parameters.thermalRelaxationRate]}
                      onValueChange={([value]) => handleParameterChange('thermalRelaxationRate', value)}
                      min={0}
                      max={0.05}
                      step={0.001}
                      disabled={!allowCustomization}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium">Phase Damping Rate</label>
                      <span className="text-sm font-mono">{(parameters.phaseDampingRate * 100).toFixed(3)}%</span>
                    </div>
                    <Slider
                      value={[parameters.phaseDampingRate]}
                      onValueChange={([value]) => handleParameterChange('phaseDampingRate', value)}
                      min={0}
                      max={0.02}
                      step={0.0001}
                      disabled={!allowCustomization}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium">Amplitude Damping Rate</label>
                      <span className="text-sm font-mono">{(parameters.amplitudeDampingRate * 100).toFixed(3)}%</span>
                    </div>
                    <Slider
                      value={[parameters.amplitudeDampingRate]}
                      onValueChange={([value]) => handleParameterChange('amplitudeDampingRate', value)}
                      min={0}
                      max={0.02}
                      step={0.0001}
                      disabled={!allowCustomization}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium">Leakage Rate</label>
                      <span className="text-sm font-mono">{(parameters.leakageRate * 100).toFixed(4)}%</span>
                    </div>
                    <Slider
                      value={[parameters.leakageRate]}
                      onValueChange={([value]) => handleParameterChange('leakageRate', value)}
                      min={0}
                      max={0.001}
                      step={0.00001}
                      disabled={!allowCustomization}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Save Custom Model */}
            {allowCustomization && (
              <div className="space-y-3">
                <h4 className="font-semibold">Save Custom Model</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customModelName}
                    onChange={(e) => setCustomModelName(e.target.value)}
                    placeholder="Model name..."
                    className="flex-1 px-3 py-2 rounded border border-input bg-background"
                  />
                  <Button onClick={saveCurrentModel} disabled={!customModelName}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>

                {/* Saved Models */}
                {savedModels.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Saved Models</h5>
                    {savedModels.map(model => (
                      <div
                        key={model.id}
                        className="flex items-center justify-between p-2 bg-muted/10 rounded"
                      >
                        <span className="text-sm">{model.name}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadSavedModel(model)}
                        >
                          Load
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Simulation Results */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Simulation Results</h3>

            {simulationResults ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Fidelity Comparison */}
                <div className="p-4 bg-muted/10 rounded-lg">
                  <h4 className="font-semibold mb-3">Fidelity Comparison</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Ideal Circuit</span>
                        <span className="text-sm font-mono">{(simulationResults.idealFidelity * 100).toFixed(2)}%</span>
                      </div>
                      <Progress value={simulationResults.idealFidelity * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">With Noise Model</span>
                        <span className="text-sm font-mono text-orange-400">
                          {(simulationResults.noisyFidelity * 100).toFixed(2)}%
                        </span>
                      </div>
                      <Progress value={simulationResults.noisyFidelity * 100} className="h-2" />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Fidelity degradation: {((1 - simulationResults.noisyFidelity / simulationResults.idealFidelity) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Error Breakdown */}
                <div className="p-4 bg-muted/10 rounded-lg">
                  <h4 className="font-semibold mb-3">Error Sources Breakdown</h4>
                  <div className="space-y-3">
                    {Object.entries(simulationResults.errorBreakdown).map(([source, percentage]) => (
                      <div key={source}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm capitalize">{source.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="text-sm font-mono">{(percentage as number * 100).toFixed(2)}%</span>
                        </div>
                        <Progress value={(percentage as number) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Circuit Statistics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/10 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">
                      {simulationResults.circuitDepth}
                    </div>
                    <div className="text-xs text-muted-foreground">Circuit Depth</div>
                  </div>
                  <div className="p-3 bg-muted/10 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {simulationResults.gateCount}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Gates</div>
                  </div>
                  <div className="p-3 bg-muted/10 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {simulationResults.executionTime.toFixed(1)}ms
                    </div>
                    <div className="text-xs text-muted-foreground">Execution Time</div>
                  </div>
                  <div className="p-3 bg-muted/10 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-400">
                      +{(simulationResults.errorMitigationBenefit * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Mitigation Benefit</div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="p-4 bg-blue-400/10 border border-blue-400/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-blue-400" />
                    <span className="font-semibold text-blue-200">Recommendations</span>
                  </div>
                  <ul className="text-sm text-blue-200/80 space-y-1">
                    <li>• Consider error mitigation techniques to improve fidelity</li>
                    <li>• Optimize circuit depth to reduce decoherence effects</li>
                    <li>• Use gates with lower error rates where possible</li>
                    <li>• Implement dynamical decoupling sequences</li>
                  </ul>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                  No Simulation Results
                </h3>
                <p className="text-muted-foreground mb-4">
                  Configure noise parameters and run simulation to see results
                </p>
                {showSimulation && (
                  <Button onClick={runSimulation} disabled={isSimulating}>
                    {isSimulating ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Run Simulation
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}