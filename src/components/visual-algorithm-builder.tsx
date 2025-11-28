/**
 * Visual Algorithm Builder
 *
 * Drag-and-drop quantum circuit designer with real-time validation,
 * algorithm template integration, and visual circuit representation.
 */

"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { QuantumCircuit, QuantumGate } from '../lib/quantum-optimizer';
import { AdvancedQuantumAlgorithms, AlgorithmTemplate } from '../lib/advanced-quantum-algorithms';
import { QuantumNoiseModeler } from '../lib/quantum-noise-modeler';

// Types for visual builder
interface GateBlock {
  id: string;
  type: string;
  name: string;
  category: 'single' | 'two' | 'multi' | 'measurement' | 'custom';
  description: string;
  icon: string;
  params: GateParameter[];
  color: string;
  qubits: number;
}

interface VisualGate {
  id: string;
  gateType: string;
  qubits: number[];
  params: Record<string, any>;
  position: number;
  comment?: string;
  group?: string;
  highlighted?: boolean;
}

interface CircuitLayer {
  id: string;
  gates: VisualGate[];
  position: number;
  parallelizable: boolean;
  estimatedTime: number;
}

interface BuilderState {
  layers: CircuitLayer[];
  selectedLayer: number | null;
  selectedGate: string | null;
  clipboard: VisualGate[];
  history: BuilderState[];
  historyIndex: number;
}

interface GateParameter {
  name: string;
  type: 'angle' | 'boolean' | 'integer' | 'select' | 'qubit';
  description: string;
  required: boolean;
  default?: any;
  min?: number;
  max?: number;
  options?: string[];
  validation?: (value: any) => boolean;
}

interface AlgorithmPreset {
  id: string;
  name: string;
  description: string;
  category: string;
  layers: CircuitLayer[];
  params: Record<string, any>;
  template?: string;
}

export default function VisualAlgorithmBuilder() {
  // Core state
  const [builderState, setBuilderState] = useState<BuilderState>({
    layers: [],
    selectedLayer: null,
    selectedGate: null,
    clipboard: [],
    history: [],
    historyIndex: -1
  });

  const [numQubits, setNumQubits] = useState(4);
  const [provider, setProvider] = useState('google-willow');
  const [activeTab, setActiveTab] = useState<'builder' | 'templates' | 'presets'>('builder');
  const [validationResults, setValidationResults] = useState<ValidationResults>({
    valid: true,
    errors: [],
    warnings: [],
    suggestions: []
  });

  // Services
  const algorithmsRef = useRef(new AdvancedQuantumAlgorithms());
  const noiseModelerRef = useRef(new QuantumNoiseModeler());

  // Visual state
  const [showGrid, setShowGrid] = useState(true);
  const [showParallelGates, setShowParallelGates] = useState(true);
  const [circuitAnimation, setCircuitAnimation] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [draggingGate, setDraggingGate] = useState<GateBlock | null>(null);

  // Modal states
  const [gateParameterModal, setGateParameterModal] = useState<{
    open: boolean;
    gate: VisualGate | null;
    onSave: (gate: VisualGate) => void;
  }>({ open: false, gate: null, onSave: () => {} });

  const [exportModal, setExportModal] = useState<{
    open: boolean;
    format: 'qasm' | 'quil' | 'braket' | 'custom';
    options: Record<string, any>;
  }>({ open: false, format: 'qasm', options: {} });

  // Gate library definitions
  const gateLibrary: GateBlock[] = [
    // Single qubit gates
    {
      id: 'h',
      type: 'h',
      name: 'Hadamard',
      category: 'single',
      description: 'Creates superposition state',
      icon: '⊕',
      params: [],
      color: '#3b82f6',
      qubits: 1
    },
    {
      id: 'x',
      type: 'x',
      name: 'Pauli-X',
      category: 'single',
      description: 'Bit flip gate',
      icon: 'X',
      params: [],
      color: '#ef4444',
      qubits: 1
    },
    {
      id: 'y',
      type: 'y',
      name: 'Pauli-Y',
      category: 'single',
      description: 'Y-axis rotation',
      icon: 'Y',
      params: [],
      color: '#f59e0b',
      qubits: 1
    },
    {
      id: 'z',
      type: 'z',
      name: 'Pauli-Z',
      category: 'single',
      description: 'Phase flip gate',
      icon: 'Z',
      params: [],
      color: '#8b5cf6',
      qubits: 1
    },
    {
      id: 'rx',
      type: 'rx',
      name: 'Rotation-X',
      category: 'single',
      description: 'Rotation around X axis',
      icon: 'Rx',
      params: [
        {
          name: 'theta',
          type: 'angle',
          description: 'Rotation angle in radians',
          required: true,
          default: 0,
          min: -2 * Math.PI,
          max: 2 * Math.PI
        }
      ],
      color: '#06b6d4',
      qubits: 1
    },
    {
      id: 'ry',
      type: 'ry',
      name: 'Rotation-Y',
      category: 'single',
      description: 'Rotation around Y axis',
      icon: 'Ry',
      params: [
        {
          name: 'theta',
          type: 'angle',
          description: 'Rotation angle in radians',
          required: true,
          default: 0,
          min: -2 * Math.PI,
          max: 2 * Math.PI
        }
      ],
      color: '#10b981',
      qubits: 1
    },
    {
      id: 'rz',
      type: 'rz',
      name: 'Rotation-Z',
      category: 'single',
      description: 'Rotation around Z axis',
      icon: 'Rz',
      params: [
        {
          name: 'phi',
          type: 'angle',
          description: 'Rotation angle in radians',
          required: true,
          default: 0,
          min: -2 * Math.PI,
          max: 2 * Math.PI
        }
      ],
      color: '#f97316',
      qubits: 1
    },
    {
      id: 'sx',
      type: 'sx',
      name: 'Sqrt-X',
      category: 'single',
      description: 'Square root of X gate',
      icon: '√X',
      params: [],
      color: '#ec4899',
      qubits: 1
    },
    {
      id: 'sdg',
      type: 'sdg',
      name: 'Sqrt-X†',
      category: 'single',
      description: 'Dagger of sqrt-X gate',
      icon: '√X†',
      params: [],
      color: '#a855f7',
      qubits: 1
    },
    {
      id: 't',
      type: 't',
      name: 'T Gate',
      category: 'single',
      description: 'π/4 rotation gate',
      icon: 'T',
      params: [],
      color: '#6366f1',
      qubits: 1
    },
    {
      id: 'tdg',
      type: 'tdg',
      name: 'T Gate†',
      category: 'single',
      description: 'Dagger of T gate',
      icon: 'T†',
      params: [],
      color: '#4f46e5',
      qubits: 1
    },

    // Two qubit gates
    {
      id: 'cx',
      type: 'cx',
      name: 'CNOT',
      category: 'two',
      description: 'Controlled NOT gate',
      icon: '⊕',
      params: [],
      color: '#dc2626',
      qubits: 2
    },
    {
      id: 'cz',
      type: 'cz',
      name: 'Controlled-Z',
      category: 'two',
      description: 'Controlled phase flip',
      icon: '⊗',
      params: [],
      color: '#7c3aed',
      qubits: 2
    },
    {
      id: 'swap',
      type: 'swap',
      name: 'SWAP',
      category: 'two',
      description: 'Exchange qubit states',
      icon: '⇄',
      params: [],
      color: '#059669',
      qubits: 2
    },
    {
      id: 'cp',
      type: 'cp',
      name: 'Controlled Phase',
      category: 'two',
      description: 'Controlled phase rotation',
      icon: '⊖',
      params: [
        {
          name: 'phi',
          type: 'angle',
          description: 'Phase angle in radians',
          required: true,
          default: 0
        }
      ],
      color: '#0891b2',
      qubits: 2
    },

    // Multi qubit gates
    {
      id: 'ccx',
      type: 'ccx',
      name: 'Toffoli',
      category: 'multi',
      description: 'Controlled CNOT gate',
      icon: '⊕₂',
      params: [],
      color: '#b91c1c',
      qubits: 3
    },
    {
      id: 'cswap',
      type: 'cswap',
      name: 'Fredkin',
      category: 'multi',
      description: 'Controlled SWAP gate',
      icon: '⇄₁',
      params: [],
      color: '#047857',
      qubits: 3
    },

    // Measurement gates
    {
      id: 'measure',
      type: 'measure',
      name: 'Measurement',
      category: 'measurement',
      description: 'Measure qubit in computational basis',
      icon: '📊',
      params: [
        {
          name: 'basis',
          type: 'select',
          description: 'Measurement basis',
          required: true,
          default: 'computational',
          options: ['computational', 'x', 'y', 'z', 'bell', 'custom']
        }
      ],
      color: '#64748b',
      qubits: 1
    },
    {
      id: 'barrier',
      type: 'barrier',
      name: 'Barrier',
      category: 'measurement',
      description: 'Prevent gate reordering',
      icon: '│',
      params: [],
      color: '#475569',
      qubits: 1
    }
  ];

  // Algorithm presets
  const algorithmPresets: AlgorithmPreset[] = [
    {
      id: 'bell_state',
      name: 'Bell State',
      description: 'Create maximally entangled Bell state',
      category: 'entanglement',
      layers: [
        {
          id: 'layer_0',
          gates: [
            { id: 'h_0', gateType: 'h', qubits: [0], params: {}, position: 0 },
            { id: 'cx_0', gateType: 'cx', qubits: [0, 1], params: {}, position: 0 }
          ],
          position: 0,
          parallelizable: false,
          estimatedTime: 0.03
        }
      ],
      params: {},
      template: null
    },
    {
      id: 'ghz_state',
      name: 'GHZ State',
      description: 'Greenberger-Horne-Zeilinger state',
      category: 'entanglement',
      layers: [
        {
          id: 'layer_0',
          gates: [
            { id: 'h_0', gateType: 'h', qubits: [0], params: {}, position: 0 }
          ],
          position: 0,
          parallelizable: false,
          estimatedTime: 0.02
        },
        {
          id: 'layer_1',
          gates: [
            { id: 'cx_0', gateType: 'cx', qubits: [0, 1], params: {}, position: 1 },
            { id: 'cx_1', gateType: 'cx', qubits: [1, 2], params: {}, position: 1 }
          ],
          position: 1,
          parallelizable: true,
          estimatedTime: 0.15
        }
      ],
      params: {},
      template: null
    },
    {
      id: 'quantum_fourier',
      name: 'Quantum Fourier Transform',
      description: 'Quantum version of discrete Fourier transform',
      category: 'algorithms',
      layers: [], // Will be dynamically generated based on qubit count
      params: { qubits: 3 },
      template: null
    },
    {
      id: 'variational_ansatz',
      name: 'Hardware-Efficient Ansatz',
      description: 'Variational circuit with parameterized rotations',
      category: 'variational',
      layers: [], // Will be dynamically generated
      params: { layers: 3, entanglement: 'linear' },
      template: 'qml_classifier'
    }
  ];

  // Validation results type
  interface ValidationResults {
    valid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  }

  // Helper functions
  const getGatesByCategory = useCallback((category: string) => {
    return gateLibrary.filter(gate => gate.category === category);
  }, []);

  const generateCircuit = useCallback((): QuantumCircuit | null => {
    if (builderState.layers.length === 0) return null;

    const allGates: QuantumGate[] = [];

    builderState.layers.forEach(layer => {
      layer.gates.forEach(gate => {
        const quantumGate: QuantumGate = {
          type: gate.gateType,
          qubits: gate.qubits,
          params: Object.values(gate.params)
        };
        allGates.push(quantumGate);
      });
    });

    return {
      id: `visual_circuit_${Date.now()}`,
      name: 'Visual Algorithm Builder Circuit',
      qubits: numQubits,
      gates: allGates
    };
  }, [builderState.layers, numQubits]);

  const validateCircuit = useCallback(() => {
    const circuit = generateCircuit();
    if (!circuit) {
      setValidationResults({
        valid: false,
        errors: ['Circuit is empty'],
        warnings: [],
        suggestions: ['Add gates to create a quantum circuit']
      });
      return;
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check qubit bounds
    circuit.gates.forEach(gate => {
      if (gate.qubits.some(q => q >= numQubits)) {
        errors.push(`Gate references qubit beyond available ${numQubits} qubits`);
      }
    });

    // Check for measurement gates
    const hasMeasurements = circuit.gates.some(g => g.type === 'measure');
    if (!hasMeasurements) {
      warnings.push('No measurement gates in circuit');
      suggestions.push('Add measurement gates to read quantum results');
    }

    // Check circuit depth
    const depth = builderState.layers.length;
    if (depth > 50) {
      warnings.push('Circuit depth may cause decoherence issues');
      suggestions.push('Consider optimization or error mitigation strategies');
    }

    // Check for parallelizable gates
    const parallelizableGates = builderState.layers.filter(layer => layer.parallelizable).length;
    if (parallelizableGates === 0 && depth > 1) {
      suggestions.push('Some gates may be parallelizable for better efficiency');
    }

    // Provider-specific validation
    const capabilities = noiseModelerRef.current.getProviderCapabilities(provider);
    if (capabilities) {
      // Check for unsupported gates
      circuit.gates.forEach(gate => {
        if (!capabilities.gateFidelities[gate.type]) {
          warnings.push(`Gate type '${gate.type}' may not be supported by ${provider}`);
        }
      });

      // Check qubit count
      if (numQubits > capabilities.qubitCount) {
        errors.push(`Circuit uses ${numQubits} qubits but ${provider} supports only ${capabilities.qubitCount}`);
      }
    }

    // Estimate fidelity
    if (circuit.gates.length > 0) {
      try {
        const fidelityEstimate = noiseModelerRef.current.estimateFidelity(circuit, provider);
        if (fidelityEstimate.overallFidelity < 0.7) {
          warnings.push('Estimated circuit fidelity is low');
          suggestions.push('Consider error mitigation or circuit optimization');
        }
      } catch (error) {
        warnings.push('Could not estimate circuit fidelity');
      }
    }

    setValidationResults({
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions
    });
  }, [generateCircuit, numQubits, provider]);

  // Drag and drop handlers
  const handleDragStart = useCallback((gate: GateBlock) => {
    setDraggingGate(gate);
  }, []);

  const handleDragEnd = useCallback((result: DropResult) => {
    setDraggingGate(null);

    if (!result.destination || !draggingGate) return;

    const { destination, source } = result;

    // Dropping on a qubit line
    if (destination.droppableId.startsWith('qubit_')) {
      const qubitIndex = parseInt(destination.droppableId.split('_')[1]);

      // Create new layer or add to existing
      const targetLayerIndex = destination.index;
      const newGate: VisualGate = {
        id: `${draggingGate.type}_${Date.now()}`,
        gateType: draggingGate.type,
        qubits: Array.from({ length: draggingGate.qubits }, (_, i) => qubitIndex + i),
        params: {},
        position: targetLayerIndex
      };

      // Initialize parameters with defaults
      draggingGate.params.forEach(param => {
        if (param.default !== undefined) {
          newGate.params[param.name] = param.default;
        }
      });

      addGateToLayer(newGate, targetLayerIndex);
    }
  }, [draggingGate]);

  // State management functions
  const addGateToLayer = useCallback((gate: VisualGate, layerIndex: number) => {
    setBuilderState(prev => {
      let newLayers = [...prev.layers];

      // Create new layer if needed
      if (layerIndex >= newLayers.length) {
        const newLayer: CircuitLayer = {
          id: `layer_${layerIndex}`,
          gates: [gate],
          position: layerIndex,
          parallelizable: false,
          estimatedTime: 0.02 // Default time estimate
        };
        newLayers.push(newLayer);
      } else {
        // Add to existing layer
        newLayers[layerIndex].gates.push(gate);

        // Check if gates in this layer are parallelizable
        newLayers[layerIndex].parallelizable = checkParallelizability(newLayers[layerIndex].gates);
      }

      return {
        ...prev,
        layers: newLayers,
        selectedLayer: layerIndex,
        selectedGate: gate.id
      };
    });
  }, []);

  const checkParallelizability = useCallback((gates: VisualGate[]): boolean => {
    // Check if gates can be executed in parallel
    const usedQubits = new Set<number>();

    for (const gate of gates) {
      for (const qubit of gate.qubits) {
        if (usedQubits.has(qubit)) {
          return false;
        }
        usedQubits.add(qubit);
      }
    }

    return true;
  }, []);

  const removeGate = useCallback((gateId: string) => {
    setBuilderState(prev => {
      const newLayers = prev.layers.map(layer => ({
        ...layer,
        gates: layer.gates.filter(g => g.id !== gateId)
      })).filter(layer => layer.gates.length > 0);

      return {
        ...prev,
        layers: newLayers,
        selectedGate: prev.selectedGate === gateId ? null : prev.selectedGate
      };
    });
  }, []);

  const updateGate = useCallback((gateId: string, updates: Partial<VisualGate>) => {
    setBuilderState(prev => {
      const newLayers = prev.layers.map(layer => ({
        ...layer,
        gates: layer.gates.map(gate =>
          gate.id === gateId ? { ...gate, ...updates } : gate
        ),
        parallelizable: layer.gates.some(g => g.id === gateId)
          ? checkParallelizability(layer.gates.map(g => g.id === gateId ? { ...g, ...updates } : g))
          : layer.parallelizable
      }));

      return { ...prev, layers: newLayers };
    });
  }, [checkParallelizability]);

  const clearCircuit = useCallback(() => {
    setBuilderState(prev => ({
      ...prev,
      layers: [],
      selectedLayer: null,
      selectedGate: null
    }));
  }, []);

  // Template and preset functions
  const loadAlgorithmPreset = useCallback((preset: AlgorithmPreset) => {
    let layers: CircuitLayer[] = [];

    if (preset.template) {
      // Load from algorithm template
      const algorithms = algorithmsRef.current;
      const template = algorithms.getTemplate(preset.template);
      if (template) {
        const circuit = algorithms.generateCircuit(preset.template, preset.params);
        if (circuit) {
          layers = convertCircuitToLayers(circuit);
        }
      }
    } else {
      // Load from preset layers
      layers = preset.layers.map(layer => ({
        ...layer,
        gates: layer.gates.map(gate => ({
          ...gate,
          id: `${gate.gateType}_${Date.now()}_${Math.random()}`
        }))
      }));
    }

    setBuilderState(prev => ({
      ...prev,
      layers,
      selectedLayer: layers.length > 0 ? 0 : null,
      selectedGate: null
    }));

    // Adjust qubit count if needed
    const maxQubit = Math.max(...layers.flatMap(layer => layer.gates.flatMap(gate => gate.qubits)));
    if (maxQubit >= numQubits) {
      setNumQubits(maxQubit + 1);
    }
  }, [numQubits]);

  const convertCircuitToLayers = useCallback((circuit: QuantumCircuit): CircuitLayer[] => {
    const layers: CircuitLayer[] = [];
    const gateQueue = [...circuit.gates];

    while (gateQueue.length > 0) {
      const currentLayer: CircuitLayer = {
        id: `layer_${layers.length}`,
        gates: [],
        position: layers.length,
        parallelizable: true,
        estimatedTime: 0.02
      };

      // Find gates that can be executed in parallel
      const usedQubits = new Set<number>();
      const remainingGates: typeof gateQueue = [];

      for (const gate of gateQueue) {
        if (gate.qubits.every(q => !usedQubits.has(q))) {
          const visualGate: VisualGate = {
            id: `${gate.type}_${Date.now()}_${Math.random()}`,
            gateType: gate.type,
            qubits: gate.qubits,
            params: {},
            position: layers.length
          };

          currentLayer.gates.push(visualGate);
          gate.qubits.forEach(q => usedQubits.add(q));
        } else {
          remainingGates.push(gate);
          currentLayer.parallelizable = false;
        }
      }

      if (currentLayer.gates.length > 0) {
        layers.push(currentLayer);
        gateQueue.length = 0;
        gateQueue.push(...remainingGates);
      } else {
        // No parallel gates found, add first gate sequentially
        const gate = gateQueue.shift()!;
        const visualGate: VisualGate = {
          id: `${gate.type}_${Date.now()}_${Math.random()}`,
          gateType: gate.type,
          qubits: gate.qubits,
          params: {},
          position: layers.length
        };

        layers.push({
          ...currentLayer,
          gates: [visualGate],
          parallelizable: false
        });
      }
    }

    return layers;
  }, []);

  // Export functions
  const exportCircuit = useCallback((format: string, options: Record<string, any>) => {
    const circuit = generateCircuit();
    if (!circuit) return '';

    switch (format) {
      case 'qasm':
        return exportToQASM(circuit, options);
      case 'quil':
        return exportToQuil(circuit, options);
      case 'braket':
        return exportToBraket(circuit, options);
      default:
        return JSON.stringify(circuit, null, 2);
    }
  }, [generateCircuit]);

  const exportToQASM = useCallback((circuit: QuantumCircuit, options: Record<string, any>): string => {
    let qasm = `OPENQASM 2.0;\ninclude "qelib1.inc";\n\n`;

    // Declare qubits
    qasm += `qreg q[${circuit.qubits}];\n`;

    // Check if measurements need cregs
    const hasMeasurements = circuit.gates.some(g => g.type === 'measure');
    if (hasMeasurements) {
      qasm += `creg c[${circuit.qubits}];\n`;
    }

    qasm += '\n';

    // Add gates
    circuit.gates.forEach(gate => {
      switch (gate.type) {
        case 'h':
          qasm += `h q[${gate.qubits[0]}];\n`;
          break;
        case 'x':
          qasm += `x q[${gate.qubits[0]}];\n`;
          break;
        case 'y':
          qasm += `y q[${gate.qubits[0]}];\n`;
          break;
        case 'z':
          qasm += `z q[${gate.qubits[0]}];\n`;
          break;
        case 'rx':
        case 'ry':
        case 'rz':
          const angle = gate.params[0] || 0;
          qasm += `${gate.type}(${angle}) q[${gate.qubits[0]}];\n`;
          break;
        case 'cx':
          qasm += `cx q[${gate.qubits[0]}], q[${gate.qubits[1]}];\n`;
          break;
        case 'cz':
          qasm += `cz q[${gate.qubits[0]}], q[${gate.qubits[1]}];\n`;
          break;
        case 'swap':
          qasm += `swap q[${gate.qubits[0]}], q[${gate.qubits[1]}];\n`;
          break;
        case 'measure':
          qasm += `measure q[${gate.qubits[0]}] -> c[${gate.qubits[0]}];\n`;
          break;
        case 'barrier':
          const qubits = gate.qubits.map(q => `q[${q}]`).join(', ');
          qasm += `barrier ${qubits};\n`;
          break;
        default:
          // Handle custom gates
          qasm += `// ${gate.type} (custom gate)\n`;
      }
    });

    return qasm;
  }, []);

  const exportToQuil = useCallback((circuit: QuantumCircuit, options: Record<string, any>): string => {
    let quil = '';

    // Declare qubits
    quil += `DECLARE ro BIT[${circuit.qubits}]\n\n`;

    // Add gates
    circuit.gates.forEach(gate => {
      switch (gate.type) {
        case 'h':
          quil += `H ${gate.qubits[0]}\n`;
          break;
        case 'x':
          quil += `X ${gate.qubits[0]}\n`;
          break;
        case 'y':
          quil += `Y ${gate.qubits[0]}\n`;
          break;
        case 'z':
          quil += `Z ${gate.qubits[0]}\n`;
          break;
        case 'rx':
        case 'ry':
        case 'rz':
          const angle = gate.params[0] || 0;
          quil += `${gate.type.toUpperCase()}(${angle}) ${gate.qubits[0]}\n`;
          break;
        case 'cx':
          quil += `CNOT ${gate.qubits[0]} ${gate.qubits[1]}\n`;
          break;
        case 'cz':
          quil += `CZ ${gate.qubits[0]} ${gate.qubits[1]}\n`;
          break;
        case 'swap':
          quil += `SWAP ${gate.qubits[0]} ${gate.qubits[1]}\n`;
          break;
        case 'measure':
          quil += `MEASURE ${gate.qubits[0]} ro[${gate.qubits[0]}]\n`;
          break;
        default:
          quil += `# ${gate.type} (custom gate)\n`;
      }
    });

    return quil;
  }, []);

  const exportToBraket = useCallback((circuit: QuantumCircuit, options: Record<string, any>): string => {
    // Convert to Braket circuit format
    let circuitCode = 'from braket.circuits import Circuit\n\n';

    const gates: string[] = [];

    circuit.gates.forEach(gate => {
      switch (gate.type) {
        case 'h':
          gates.push(`circuit.h(${gate.qubits[0]})`);
          break;
        case 'x':
          gates.push(`circuit.x(${gate.qubits[0]})`);
          break;
        case 'y':
          gates.push(`circuit.y(${gate.qubits[0]})`);
          break;
        case 'z':
          gates.push(`circuit.z(${gate.qubits[0]})`);
          break;
        case 'rx':
        case 'ry':
        case 'rz':
          const angle = gate.params[0] || 0;
          gates.push(`circuit.${gate.type}(${gate.qubits[0]}, ${angle})`);
          break;
        case 'cx':
          gates.push(`circuit.cnot(${gate.qubits[0]}, ${gate.qubits[1]})`);
          break;
        case 'cz':
          gates.push(`circuit.cz(${gate.qubits[0]}, ${gate.qubits[1]})`);
          break;
        case 'swap':
          gates.push(`circuit.swap(${gate.qubits[0]}, ${gate.qubits[1]})`);
          break;
        case 'measure':
          gates.push(`circuit.measure(${gate.qubits[0]})`);
          break;
        default:
          gates.push(`# ${gate.type} (custom gate)`);
      }
    });

    circuitCode += `circuit = Circuit()\n`;
    gates.forEach(gate => circuitCode += `${gate}\n`);

    return circuitCode;
  }, []);

  // Effects
  useEffect(() => {
    validateCircuit();
  }, [validateCircuit]);

  // Render main component
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Visual Algorithm Builder</h1>

          <div className="flex items-center space-x-4">
            {/* Provider selection */}
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="google-willow">Google Willow</option>
              <option value="ibm-condor">IBM Condor</option>
              <option value="amazon-braket">Amazon Braket</option>
            </select>

            {/* Qubit count */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Qubits:</label>
              <input
                type="number"
                min="1"
                max="50"
                value={numQubits}
                onChange={(e) => setNumQubits(parseInt(e.target.value) || 1)}
                className="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm"
              />
            </div>

            {/* Export button */}
            <button
              onClick={() => setExportModal({ open: true, format: 'qasm', options: {} })}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Export Circuit
            </button>

            {/* Clear circuit */}
            <button
              onClick={clearCircuit}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-8 mt-4">
          <button
            onClick={() => setActiveTab('builder')}
            className={`pb-2 border-b-2 font-medium text-sm ${
              activeTab === 'builder'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Circuit Builder
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`pb-2 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Algorithm Templates
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-2 border-b-2 font-medium text-sm ${
              activeTab === 'presets'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Preset Circuits
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar with gates */}
        <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <h3 className="font-semibold text-gray-900 mb-4">Quantum Gates</h3>

          {/* Gate categories */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Single Qubit</h4>
              <div className="space-y-1">
                {getGatesByCategory('single').map(gate => (
                  <div
                    key={gate.id}
                    draggable
                    onDragStart={() => handleDragStart(gate)}
                    className="flex items-center space-x-2 p-2 bg-gray-50 rounded cursor-move hover:bg-gray-100 text-sm"
                  >
                    <span className="text-lg font-bold" style={{ color: gate.color }}>
                      {gate.icon}
                    </span>
                    <span className="text-gray-700">{gate.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Two Qubit</h4>
              <div className="space-y-1">
                {getGatesByCategory('two').map(gate => (
                  <div
                    key={gate.id}
                    draggable
                    onDragStart={() => handleDragStart(gate)}
                    className="flex items-center space-x-2 p-2 bg-gray-50 rounded cursor-move hover:bg-gray-100 text-sm"
                  >
                    <span className="text-lg font-bold" style={{ color: gate.color }}>
                      {gate.icon}
                    </span>
                    <span className="text-gray-700">{gate.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Multi Qubit</h4>
              <div className="space-y-1">
                {getGatesByCategory('multi').map(gate => (
                  <div
                    key={gate.id}
                    draggable
                    onDragStart={() => handleDragStart(gate)}
                    className="flex items-center space-x-2 p-2 bg-gray-50 rounded cursor-move hover:bg-gray-100 text-sm"
                  >
                    <span className="text-lg font-bold" style={{ color: gate.color }}>
                      {gate.icon}
                    </span>
                    <span className="text-gray-700">{gate.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Measurement</h4>
              <div className="space-y-1">
                {getGatesByCategory('measurement').map(gate => (
                  <div
                    key={gate.id}
                    draggable
                    onDragStart={() => handleDragStart(gate)}
                    className="flex items-center space-x-2 p-2 bg-gray-50 rounded cursor-move hover:bg-gray-100 text-sm"
                  >
                    <span className="text-lg font-bold" style={{ color: gate.color }}>
                      {gate.icon}
                    </span>
                    <span className="text-gray-700">{gate.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main builder area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'builder' && (
            <div className="flex-1 flex flex-col">
              {/* Toolbar */}
              <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showGrid}
                      onChange={(e) => setShowGrid(e.target.checked)}
                      className="rounded"
                    />
                    <span>Show Grid</span>
                  </label>

                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showParallelGates}
                      onChange={(e) => setShowParallelGates(e.target.checked)}
                      className="rounded"
                    />
                    <span>Parallel Gates</span>
                  </label>

                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={circuitAnimation}
                      onChange={(e) => setCircuitAnimation(e.target.checked)}
                      className="rounded"
                    />
                    <span>Animation</span>
                  </label>
                </div>

                {/* Validation status */}
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  validationResults.valid
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {validationResults.valid ? 'Valid Circuit' : 'Invalid Circuit'}
                </div>
              </div>

              {/* Circuit canvas */}
              <div className="flex-1 overflow-auto p-4">
                <div className="min-w-full">
                  {/* Qubit lines */}
                  <div className="flex flex-col space-y-8">
                    {Array.from({ length: numQubits }, (_, qubitIndex) => (
                      <div
                        key={qubitIndex}
                        className="flex items-start space-x-4"
                      >
                        {/* Qubit label */}
                        <div className="w-16 text-sm font-medium text-gray-700">
                          q{qubitIndex}
                        </div>

                        {/* Gate line */}
                        <Droppable
                          droppableId={`qubit_${qubitIndex}`}
                          direction="horizontal"
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`flex-1 h-12 border-2 border-dashed rounded-lg min-h-[3rem] ${
                                snapshot.isDraggingOver
                                  ? 'border-blue-400 bg-blue-50'
                                  : showGrid
                                  ? 'border-gray-300'
                                  : 'border-gray-200'
                              }`}
                            >
                              {/* Render gates on this qubit line */}
                              {builderState.layers.map((layer, layerIndex) => {
                                const gate = layer.gates.find(g => g.qubits.includes(qubitIndex));
                                if (gate) {
                                  const gateBlock = gateLibrary.find(g => g.type === gate.gateType);
                                  return (
                                    <div
                                      key={gate.id}
                                      className="inline-block m-1 p-2 rounded cursor-pointer hover:shadow-md transition-shadow"
                                      style={{
                                        backgroundColor: gateBlock?.color || '#6b7280',
                                        color: 'white',
                                        opacity: layer.parallelizable ? 1 : 0.8
                                      }}
                                      onClick={() => {
                                        setBuilderState(prev => ({
                                          ...prev,
                                          selectedGate: gate.id,
                                          selectedLayer: layerIndex
                                        }));
                                      }}
                                    >
                                      <div className="text-xs font-bold text-center">
                                        {gateBlock?.icon || gate.gateType}
                                      </div>
                                      {Object.keys(gate.params).length > 0 && (
                                        <div className="text-xs mt-1">
                                          {Object.entries(gate.params)
                                            .map(([key, value]) => `${key}=${value}`)
                                            .join(', ')}
                                        </div>
                                      )}
                                    </div>
                                  );
                                }
                                return null;
                              })}

                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    ))}
                  </div>

                  {/* Layer separators */}
                  {showParallelGates && (
                    <div className="relative mt-8">
                      {builderState.layers.map((layer, layerIndex) => (
                        <div
                          key={layer.id}
                          className="absolute flex items-center space-x-2 text-xs text-gray-500"
                          style={{ top: `${layerIndex * 60 + 30}px` }}
                        >
                          <span>Layer {layerIndex + 1}</span>
                          {layer.parallelizable && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Parallel
                            </span>
                          )}
                          <span className="text-gray-400">
                            ~{layer.estimatedTime}s
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="flex-1 p-6 overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {algorithmsRef.current.getAllTemplates().map(template => (
                  <div
                    key={template.id}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      // Generate circuit from template and load to builder
                      const algorithms = algorithmsRef.current;
                      const circuit = algorithms.generateCircuit(template.id, {});
                      if (circuit) {
                        const layers = convertCircuitToLayers(circuit);
                        setBuilderState(prev => ({
                          ...prev,
                          layers,
                          selectedLayer: layers.length > 0 ? 0 : null,
                          selectedGate: null
                        }));

                        // Adjust qubit count
                        setNumQubits(Math.max(circuit.qubits, numQubits));

                        // Switch to builder tab
                        setActiveTab('builder');
                      }
                    }}
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>

                    <div className="flex items-center justify-between text-xs">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {template.category}
                      </span>
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                        {template.difficulty}
                      </span>
                    </div>

                    <div className="mt-3 text-xs text-gray-500">
                      <div>Qubits: {template.qubits.min}-{template.qubits.max}</div>
                      <div>Depth: {template.depth.min}-{template.depth.max}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="flex-1 p-6 overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {algorithmPresets.map(preset => (
                  <div
                    key={preset.id}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => loadAlgorithmPreset(preset)}
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{preset.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{preset.description}</p>

                    <div className="flex items-center justify-between text-xs">
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                        {preset.category}
                      </span>
                      <span className="text-gray-500">
                        {preset.layers.length} layers
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar with circuit info */}
        <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
          {/* Circuit statistics */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Circuit Statistics</h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Gates:</span>
                <span className="font-medium">{builderState.layers.reduce((sum, layer) => sum + layer.gates.length, 0)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Circuit Depth:</span>
                <span className="font-medium">{builderState.layers.length}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Qubits Used:</span>
                <span className="font-medium">
                  {Math.max(...builderState.layers.flatMap(layer =>
                    layer.gates.flatMap(gate => gate.qubits)
                  ), -1) + 1}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Est. Runtime:</span>
                <span className="font-medium">
                  {builderState.layers.reduce((sum, layer) => sum + layer.estimatedTime, 0).toFixed(2)}s
                </span>
              </div>
            </div>
          </div>

          {/* Validation results */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Validation</h3>

            {validationResults.errors.length > 0 && (
              <div className="mb-3">
                <div className="text-sm font-medium text-red-800 mb-1">Errors:</div>
                <ul className="space-y-1">
                  {validationResults.errors.map((error, index) => (
                    <li key={index} className="text-xs text-red-600">• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {validationResults.warnings.length > 0 && (
              <div className="mb-3">
                <div className="text-sm font-medium text-yellow-800 mb-1">Warnings:</div>
                <ul className="space-y-1">
                  {validationResults.warnings.map((warning, index) => (
                    <li key={index} className="text-xs text-yellow-600">• {warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {validationResults.suggestions.length > 0 && (
              <div>
                <div className="text-sm font-medium text-blue-800 mb-1">Suggestions:</div>
                <ul className="space-y-1">
                  {validationResults.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-xs text-blue-600">• {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Gate details */}
          {builderState.selectedGate && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Gate Details</h3>

              {(() => {
                const selectedGate = builderState.layers
                  .flatMap(layer => layer.gates)
                  .find(gate => gate.id === builderState.selectedGate);

                if (!selectedGate) return null;

                const gateBlock = gateLibrary.find(g => g.type === selectedGate.gateType);

                return (
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <span className="ml-2 font-medium">{selectedGate.gateType}</span>
                    </div>

                    <div>
                      <span className="text-gray-600">Qubits:</span>
                      <span className="ml-2 font-medium">
                        {selectedGate.qubits.join(', ')}
                      </span>
                    </div>

                    {Object.keys(selectedGate.params).length > 0 && (
                      <div>
                        <span className="text-gray-600">Parameters:</span>
                        <div className="mt-1 space-y-1">
                          {Object.entries(selectedGate.params).map(([key, value]) => (
                            <div key={key} className="text-xs">
                              <span className="font-medium">{key}:</span> {value}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {gateBlock && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-600">{gateBlock.description}</p>
                      </div>
                    )}

                    <div className="mt-3 space-y-2">
                      <button
                        onClick={() => {
                          setGateParameterModal({
                            open: true,
                            gate: selectedGate,
                            onSave: (updatedGate) => {
                              updateGate(selectedGate.id, updatedGate);
                              setGateParameterModal({ open: false, gate: null, onSave: () => {} });
                            }
                          });
                        }}
                        className="w-full px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Edit Parameters
                      </button>

                      <button
                        onClick={() => removeGate(selectedGate.id)}
                        className="w-full px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        Remove Gate
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Performance estimation */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Performance Estimation</h3>

            <div className="space-y-2 text-sm">
              {(() => {
                const circuit = generateCircuit();
                if (!circuit) return <p className="text-gray-500">No circuit to analyze</p>;

                try {
                  const analysis = noiseModelerRef.current.analyzeCircuit(circuit, provider);
                  const fidelity = noiseModelerRef.current.estimateFidelity(circuit, provider);

                  return (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Est. Fidelity:</span>
                        <span className={`font-medium ${
                          fidelity.overallFidelity > 0.8 ? 'text-green-600' :
                          fidelity.overallFidelity > 0.6 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {(fidelity.overallFidelity * 100).toFixed(1)}%
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Two-Qubit Gates:</span>
                        <span className="font-medium">{analysis.twoQubitGateCount}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Single-Qubit Gates:</span>
                        <span className="font-medium">{analysis.singleQubitGateCount}</span>
                      </div>
                    </>
                  );
                } catch (error) {
                  return <p className="text-gray-500">Analysis unavailable</p>;
                }
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Gate Parameter Modal */}
      {gateParameterModal.open && gateParameterModal.gate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-auto">
            <h3 className="text-lg font-semibold mb-4">
              Edit {gateParameterModal.gate.gateType} Parameters
            </h3>

            <div className="space-y-4">
              {(() => {
                const gateBlock = gateLibrary.find(g => g.type === gateParameterModal.gate!.gateType);
                return gateBlock?.params.map(param => (
                  <div key={param.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {param.name}
                      {param.required && <span className="text-red-500">*</span>}
                    </label>

                    {param.type === 'angle' && (
                      <input
                        type="number"
                        step="0.01"
                        min={param.min}
                        max={param.max}
                        value={gateParameterModal.gate!.params[param.name] || param.default || 0}
                        onChange={(e) => {
                          const updatedGate = {
                            ...gateParameterModal.gate!,
                            params: {
                              ...gateParameterModal.gate!.params,
                              [param.name]: parseFloat(e.target.value) || 0
                            }
                          };
                          setGateParameterModal(prev => ({ ...prev, gate: updatedGate }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    )}

                    {param.type === 'select' && (
                      <select
                        value={gateParameterModal.gate!.params[param.name] || param.default || ''}
                        onChange={(e) => {
                          const updatedGate = {
                            ...gateParameterModal.gate!,
                            params: {
                              ...gateParameterModal.gate!.params,
                              [param.name]: e.target.value
                            }
                          };
                          setGateParameterModal(prev => ({ ...prev, gate: updatedGate }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        {param.options?.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    )}

                    {param.type === 'boolean' && (
                      <input
                        type="checkbox"
                        checked={gateParameterModal.gate!.params[param.name] || param.default || false}
                        onChange={(e) => {
                          const updatedGate = {
                            ...gateParameterModal.gate!,
                            params: {
                              ...gateParameterModal.gate!.params,
                              [param.name]: e.target.checked
                            }
                          };
                          setGateParameterModal(prev => ({ ...prev, gate: updatedGate }));
                        }}
                        className="rounded"
                      />
                    )}

                    {param.type === 'integer' && (
                      <input
                        type="number"
                        min={param.min}
                        max={param.max}
                        value={gateParameterModal.gate!.params[param.name] || param.default || 0}
                        onChange={(e) => {
                          const updatedGate = {
                            ...gateParameterModal.gate!,
                            params: {
                              ...gateParameterModal.gate!.params,
                              [param.name]: parseInt(e.target.value) || 0
                            }
                          };
                          setGateParameterModal(prev => ({ ...prev, gate: updatedGate }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    )}

                    {param.description && (
                      <p className="text-xs text-gray-500">{param.description}</p>
                    )}
                  </div>
                ));
              })()}
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => gateParameterModal.onSave(gateParameterModal.gate!)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => setGateParameterModal({ open: false, gate: null, onSave: () => {} })}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {exportModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[600px] max-h-[80vh] overflow-auto">
            <h3 className="text-lg font-semibold mb-4">Export Circuit</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Format
                </label>
                <select
                  value={exportModal.format}
                  onChange={(e) => setExportModal(prev => ({ ...prev, format: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="qasm">OpenQASM 2.0</option>
                  <option value="quil">Quil</option>
                  <option value="braket">Amazon Braket</option>
                  <option value="custom">Custom Format</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Options
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      className="rounded"
                    />
                    <span>Include comments</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      defaultChecked={false}
                      className="rounded"
                    />
                    <span>Optimize for target provider</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      className="rounded"
                    />
                    <span>Include measurement results</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <textarea
                  readOnly
                  value={exportCircuit(exportModal.format, exportModal.options)}
                  className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md font-mono text-xs"
                />
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => {
                  const content = exportCircuit(exportModal.format, exportModal.options);
                  const blob = new Blob([content], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `circuit.${exportModal.format === 'qasm' ? 'qasm' : exportModal.format}`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Download
              </button>
              <button
                onClick={() => {
                  const content = exportCircuit(exportModal.format, exportModal.options);
                  navigator.clipboard.writeText(content);
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => setExportModal({ open: false, format: 'qasm', options: {} })}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}