/**
 * Advanced Quantum Algorithm Templates Library
 *
 * Comprehensive library of quantum algorithm templates with configurable parameters,
 * optimization strategies, and provider-specific implementations.
 */

import { QuantumCircuit, QuantumGate } from './quantum-optimizer';

export interface AlgorithmTemplate {
  id: string;
  name: string;
  description: string;
  category: 'variational' | 'optimization' | 'chemistry' | 'machine_learning' | 'error_correction' | 'cryptography';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  qubits: {
    min: number;
    max: number;
    recommended: number;
  };
  depth: {
    min: number;
    max: number;
    recommended: number;
  };
  parameters: AlgorithmParameter[];
  circuit: (params: Record<string, any>) => QuantumCircuit;
  optimization: OptimizationStrategy;
  providerAdaptations: Record<string, ProviderAdaptation>;
  performancePrediction: PerformancePrediction;
  resources: ResourceRequirements;
  variants: AlgorithmVariant[];
}

export interface AlgorithmParameter {
  name: string;
  type: 'number' | 'integer' | 'boolean' | 'string' | 'array' | 'select';
  description: string;
  required: boolean;
  default?: any;
  min?: number;
  max?: number;
  options?: string[];
  validation?: (value: any) => boolean;
  impact: 'low' | 'medium' | 'high' | 'critical';
}

export interface OptimizationStrategy {
  type: 'gate_cancellation' | 'parameter_optimization' | 'circuit_compilation' | 'hybrid';
  targetMetric: 'fidelity' | 'depth' | 'gate_count' | 'execution_time' | 'cost';
  aggressiveness: 'conservative' | 'moderate' | 'aggressive';
  constraints: string[];
  customOptimizers?: string[];
}

export interface ProviderAdaptation {
  topology: 'linear' | 'grid' | 'fully_connected' | 'custom';
  gateSet: string[];
  errorMitigation: string[];
  compilationFlags: Record<string, any>;
  specialFeatures?: string[];
}

export interface PerformancePrediction {
  fidelity: {
    best: number;
    typical: number;
    worst: number;
  };
  executionTime: {
    best: number; // seconds
    typical: number;
    worst: number;
  };
  cost: {
    best: number; // USD
    typical: number;
    worst: number;
  };
  successProbability: number;
  scalingBehavior: 'linear' | 'polynomial' | 'exponential';
  scalabilityLimit?: number;
}

export interface ResourceRequirements {
  qubits: number;
  depth: number;
  gateCounts: Record<string, number>;
  memory: number; // MB
  classicalCompute: 'low' | 'medium' | 'high';
  communication: 'minimal' | 'moderate' | 'heavy';
}

export interface AlgorithmVariant {
  id: string;
  name: string;
  description: string;
  modifications: string[];
  tradeoffs: {
    improvement: string;
    cost: string;
  };
  circuitModification: (baseCircuit: QuantumCircuit, params: Record<string, any>) => QuantumCircuit;
}

export class AdvancedQuantumAlgorithms {
  private templates: Map<string, AlgorithmTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    // Variational Quantum Eigensolver (VQE)
    this.templates.set('vqe_standard', {
      id: 'vqe_standard',
      name: 'Variational Quantum Eigensolver',
      description: 'Hybrid quantum-classical algorithm for finding ground state energies of molecular Hamiltonians',
      category: 'variational',
      difficulty: 'intermediate',
      qubits: { min: 2, max: 20, recommended: 4 },
      depth: { min: 10, max: 200, recommended: 50 },
      parameters: [
        {
          name: 'molecule',
          type: 'select',
          description: 'Molecular system to simulate',
          required: true,
          options: ['H2', 'LiH', 'BeH2', 'H2O', 'NH3', 'CH4'],
          impact: 'critical'
        },
        {
          name: 'ansatz',
          type: 'select',
          description: 'Variational ansatz type',
          required: true,
          options: ['UCCSD', 'HardwareEfficient', 'RY', 'RYRZ', 'QAOA-inspired'],
          default: 'UCCSD',
          impact: 'high'
        },
        {
          name: 'layers',
          type: 'integer',
          description: 'Number of ansatz layers',
          required: true,
          min: 1,
          max: 10,
          default: 3,
          impact: 'high'
        },
        {
          name: 'initial_state',
          type: 'select',
          description: 'Initial state preparation',
          required: true,
          options: ['Hartree-Fock', 'Zero', 'Random', 'HardwareEfficient'],
          default: 'Hartree-Fock',
          impact: 'medium'
        },
        {
          name: 'optimizer',
          type: 'select',
          description: 'Classical optimizer',
          required: true,
          options: ['COBYLA', 'SPSA', 'L-BFGS-B', 'Adam', 'Nelder-Mead'],
          default: 'COBYLA',
          impact: 'medium'
        },
        {
          name: 'shots',
          type: 'integer',
          description: 'Measurement shots per iteration',
          required: true,
          min: 100,
          max: 100000,
          default: 8192,
          impact: 'low'
        }
      ],
      circuit: this.buildVQECircuit.bind(this),
      optimization: {
        type: 'parameter_optimization',
        targetMetric: 'fidelity',
        aggressiveness: 'moderate',
        constraints: ['preserve_energy_levels', 'maintain_particle_number'],
        customOptimizers: ['gradient_free_optimization', 'noise_aware_training']
      },
      providerAdaptations: {
        'google-willow': {
          topology: 'fully_connected',
          gateSet: ['rz', 'rx', 'ry', 'cx', 'cz'],
          errorMitigation: ['readout_error_mitigation', 'zero_noise_extrapolation'],
          compilationFlags: { optimize_gate_cancellation: true, optimize_qubit_placement: true }
        },
        'ibm-condor': {
          topology: 'custom',
          gateSet: ['rz', 'sx', 'x', 'cx'],
          errorMitigation: ['measurement_error_mitigation', 'probabilistic_error_cancellation'],
          compilationFlags: { basis_gates: ['rz', 'sx', 'x', 'cx'], optimization_level: 3 }
        },
        'amazon-braket': {
          topology: 'grid',
          gateSet: ['rx', 'ry', 'rz', 'cnot'],
          errorMitigation: ['richardson_extrapolation', 'measurement_error_calibration'],
          compilationFlags: { target_device: 'IonQ', optimize_for_cost: true }
        }
      },
      performancePrediction: {
        fidelity: { best: 0.95, typical: 0.85, worst: 0.70 },
        executionTime: { best: 120, typical: 300, worst: 900 },
        cost: { best: 50, typical: 200, worst: 800 },
        successProbability: 0.85,
        scalingBehavior: 'polynomial',
        scalabilityLimit: 20
      },
      resources: {
        qubits: 4,
        depth: 50,
        gateCounts: { 'rz': 80, 'rx': 20, 'cx': 30 },
        memory: 512,
        classicalCompute: 'medium',
        communication: 'moderate'
      },
      variants: [
        {
          id: 'vqe_adaptive',
          name: 'Adaptive VQE',
          description: 'VQE with adaptive ansatz construction',
          modifications: ['Adaptive circuit construction', 'Operator pool selection'],
          tradeoffs: {
            improvement: 'Higher accuracy for complex molecules',
            cost: 'Increased classical computation overhead'
          },
          circuitModification: this.adaptiveVQEModification.bind(this)
        },
        {
          id: 'vqe_subspace',
          name: 'Subspace-Expanded VQE',
          description: 'VQE with subspace expansion for excited states',
          modifications: ['Subspace expansion', 'Multiple state calculation'],
          tradeoffs: {
            improvement: 'Access to excited states',
            cost: 'Increased circuit depth and measurements'
          },
          circuitModification: this.subspaceVQEModification.bind(this)
        }
      ]
    });

    // Quantum Approximate Optimization Algorithm (QAOA)
    this.templates.set('qaoa_maxcut', {
      id: 'qaoa_maxcut',
      name: 'Quantum Approximate Optimization Algorithm - Max Cut',
      description: 'Hybrid algorithm for combinatorial optimization problems, demonstrated on Max Cut',
      category: 'optimization',
      difficulty: 'advanced',
      qubits: { min: 3, max: 50, recommended: 10 },
      depth: { min: 2, max: 40, recommended: 6 },
      parameters: [
        {
          name: 'graph_type',
          type: 'select',
          description: 'Graph topology for Max Cut problem',
          required: true,
          options: ['complete', 'random', 'regular', 'scale_free', 'custom'],
          default: 'random',
          impact: 'high'
        },
        {
          name: 'graph_size',
          type: 'integer',
          description: 'Number of nodes in the graph',
          required: true,
          min: 3,
          max: 50,
          default: 10,
          impact: 'high'
        },
        {
          name: 'p_layers',
          type: 'integer',
          description: 'Number of QAOA layers (p)',
          required: true,
          min: 1,
          max: 10,
          default: 3,
          impact: 'critical'
        },
        {
          name: 'initialization',
          type: 'select',
          description: 'Parameter initialization strategy',
          required: true,
          options: ['random', 'trotterized', 'interpolation', 'warm_start'],
          default: 'random',
          impact: 'medium'
        },
        {
          name: 'mixer_hamiltonian',
          type: 'select',
          description: 'Mixer Hamiltonian type',
          required: true,
          options: ['X', 'XY', 'Grover', 'Ring', 'Generalized'],
          default: 'X',
          impact: 'medium'
        },
        {
          name: 'constraint_handling',
          type: 'boolean',
          description: 'Enable constraint handling for constrained problems',
          required: false,
          default: false,
          impact: 'medium'
        }
      ],
      circuit: this.buildQAOACircuit.bind(this),
      optimization: {
        type: 'parameter_optimization',
        targetMetric: 'fidelity',
        aggressiveness: 'aggressive',
        constraints: ['preserve_probability', 'maintain_feasibility'],
        customOptimizers: ['gradient_based_optimization', 'warm_start_strategies']
      },
      providerAdaptations: {
        'google-willow': {
          topology: 'fully_connected',
          gateSet: ['rz', 'rx', 'cx', 'cz'],
          errorMitigation: ['dynamical_decoupling', 'error_mitigation_readout'],
          compilationFlags: { optimize_for_depth: true, parallel_gates: true }
        },
        'ibm-condor': {
          topology: 'custom',
          gateSet: ['rz', 'sx', 'x', 'cx'],
          errorMitigation: ['error_suppression', 'measurement_error_mitigation'],
          compilationFlags: { optimization_level: 2, use_error_mitigation: true }
        },
        'amazon-braket': {
          topology: 'grid',
          gateSet: ['rx', 'ry', 'rz', 'cnot'],
          errorMitigation: ['zero_noise_extrapolation', 'probabilistic_error_cancellation'],
          compilationFlags: { cost_optimization: true, accuracy_priority: 'high' }
        }
      },
      performancePrediction: {
        fidelity: { best: 0.90, typical: 0.75, worst: 0.60 },
        executionTime: { best: 180, typical: 600, worst: 1800 },
        cost: { best: 100, typical: 500, worst: 2000 },
        successProbability: 0.80,
        scalingBehavior: 'polynomial',
        scalabilityLimit: 50
      },
      resources: {
        qubits: 10,
        depth: 30,
        gateCounts: { 'rz': 60, 'rx': 10, 'cx': 45 },
        memory: 1024,
        classicalCompute: 'high',
        communication: 'heavy'
      },
      variants: [
        {
          id: 'qaoa_recursive',
          name: 'Recursive QAOA',
          description: 'QAOA with recursive parameter optimization',
          modifications: ['Recursive parameter updates', 'Adaptive depth control'],
          tradeoffs: {
            improvement: 'Better convergence for large problems',
            cost: 'More iterations and classical overhead'
          },
          circuitModification: this.recursiveQAOAModification.bind(this)
        }
      ]
    });

    // Quantum Phase Estimation
    this.templates.set('qpe_standard', {
      id: 'qpe_standard',
      name: 'Quantum Phase Estimation',
      description: 'Algorithm for estimating eigenphases of unitary operators, fundamental for quantum chemistry',
      category: 'chemistry',
      difficulty: 'advanced',
      qubits: { min: 3, max: 30, recommended: 8 },
      depth: { min: 20, max: 500, recommended: 100 },
      parameters: [
        {
          name: 'unitary_type',
          type: 'select',
          description: 'Type of unitary operator',
          required: true,
          options: ['controlled_U', 'controlled_U2', 'modular_exponential', 'custom'],
          default: 'controlled_U',
          impact: 'critical'
        },
        {
          name: 'precision_bits',
          type: 'integer',
          description: 'Number of precision bits for phase estimation',
          required: true,
          min: 1,
          max: 20,
          default: 6,
          impact: 'critical'
        },
        {
          name: 'eigenstate_preparation',
          type: 'select',
          description: 'Method for preparing eigenstates',
          required: true,
          options: ['computational_basis', 'grover_preparation', 'adiabatic', 'custom'],
          default: 'computational_basis',
          impact: 'high'
        },
        {
          name: 'iterative_qpe',
          type: 'boolean',
          description: 'Use iterative QPE to reduce qubit requirements',
          required: false,
          default: false,
          impact: 'medium'
        },
        {
          name: 'semi_classical',
          type: 'boolean',
          description: 'Use semi-classical QPE with feed-forward measurements',
          required: false,
          default: false,
          impact: 'medium'
        }
      ],
      circuit: this.buildQPECircuit.bind(this),
      optimization: {
        type: 'circuit_compilation',
        targetMetric: 'depth',
        aggressiveness: 'aggressive',
        constraints: ['maintain_phase_accuracy', 'preserve_unitarity'],
        customOptimizers: ['gate_reordering', 'controlled_gate_optimization']
      },
      providerAdaptations: {
        'google-willow': {
          topology: 'fully_connected',
          gateSet: ['h', 't', 'tdg', 'cx', 'cu1', 'ccx'],
          errorMitigation: ['phase_estimation_error_mitigation', 'zero_noise_extrapolation'],
          compilationFlags: { optimize_controlled_gates: true, use_trotterization: true }
        },
        'ibm-condor': {
          topology: 'custom',
          gateSet: ['h', 't', 'tdg', 'cx', 'cu1'],
          errorMitigation: ['readout_error_mitigation', 'coherence_optimization'],
          compilationFlags: { optimization_level: 3, basis_gates: ['h', 't', 'tdg', 'cx'] }
        },
        'amazon-braket': {
          topology: 'grid',
          gateSet: ['h', 't', 'tdg', 'cnot', 'ccx'],
          errorMitigation: ['richardson_extrapolation', 'probabilistic_error_cancellation'],
          compilationFlags: { accuracy_priority: 'maximum', error_correction: true }
        }
      },
      performancePrediction: {
        fidelity: { best: 0.85, typical: 0.70, worst: 0.50 },
        executionTime: { best: 300, typical: 1200, worst: 3600 },
        cost: { best: 200, typical: 1000, worst: 4000 },
        successProbability: 0.75,
        scalingBehavior: 'exponential',
        scalabilityLimit: 20
      },
      resources: {
        qubits: 8,
        depth: 100,
        gateCounts: { 'h': 14, 't': 120, 'tdg': 60, 'cx': 80, 'cu1': 40 },
        memory: 2048,
        classicalCompute: 'medium',
        communication: 'moderate'
      },
      variants: [
        {
          id: 'iterative_qpe',
          name: 'Iterative QPE',
          description: 'Iterative quantum phase estimation with reduced qubit count',
          modifications: ['Single ancilla qubit reuse', 'Feed-forward measurements'],
          tradeoffs: {
            improvement: 'Reduces qubit requirements by n-1',
            cost: 'Requires quantum memory and faster operations'
          },
          circuitModification: this.iterativeQPEModification.bind(this)
        }
      ]
    });

    // Quantum Machine Learning - Variational Classifier
    this.templates.set('qml_classifier', {
      id: 'qml_classifier',
      name: 'Variational Quantum Classifier',
      description: 'Quantum machine learning algorithm for binary classification tasks',
      category: 'machine_learning',
      difficulty: 'intermediate',
      qubits: { min: 2, max: 20, recommended: 4 },
      depth: { min: 5, max: 100, recommended: 20 },
      parameters: [
        {
          name: 'data_encoding',
          type: 'select',
          description: 'Method for encoding classical data',
          required: true,
          options: ['amplitude', 'angle', 'basis', 'duplicated', 'kitchen_sink'],
          default: 'angle',
          impact: 'high'
        },
        {
          name: 'ansatz_type',
          type: 'select',
          description: 'Variational ansatz for classification',
          required: true,
          options: ['hardware_efficient', 'barrier', 'circuit17', 'zz_feature', 'real_amplitudes'],
          default: 'hardware_efficient',
          impact: 'high'
        },
        {
          name: 'num_features',
          type: 'integer',
          description: 'Number of features to use from dataset',
          required: true,
          min: 1,
          max: 10,
          default: 4,
          impact: 'medium'
        },
        {
          name: 'num_layers',
          type: 'integer',
          description: 'Number of variational layers',
          required: true,
          min: 1,
          max: 10,
          default: 3,
          impact: 'high'
        },
        {
          name: 'regularization',
          type: 'number',
          description: 'L2 regularization parameter',
          required: false,
          min: 0,
          max: 1,
          default: 0.01,
          impact: 'low'
        }
      ],
      circuit: this.buildQMLClassifierCircuit.bind(this),
      optimization: {
        type: 'parameter_optimization',
        targetMetric: 'fidelity',
        aggressiveness: 'moderate',
        constraints: ['maintain_classical_consistency'],
        customOptimizers: ['adam_optimizer', 'gradient_clipping']
      },
      providerAdaptations: {
        'google-willow': {
          topology: 'fully_connected',
          gateSet: ['rz', 'ry', 'rx', 'cx', 'cz'],
          errorMitigation: ['readout_error_mitigation', 'data_reuploading'],
          compilationFlags: { optimize_for_nisq: true, error_aware_training: true }
        },
        'ibm-condor': {
          topology: 'custom',
          gateSet: ['rz', 'ry', 'rx', 'cx'],
          errorMitigation: ['measurement_error_mitigation', 'data_augmentation'],
          compilationFlags: { optimization_level: 2, transpiler_optimization: true }
        },
        'amazon-braket': {
          topology: 'grid',
          gateSet: ['rx', 'ry', 'rz', 'cnot'],
          errorMitigation: ['cross_validation', 'ensemble_methods'],
          compilationFlags: { cost_aware_training: true, batch_optimization: true }
        }
      },
      performancePrediction: {
        fidelity: { best: 0.90, typical: 0.80, worst: 0.65 },
        executionTime: { best: 60, typical: 180, worst: 600 },
        cost: { best: 30, typical: 150, worst: 600 },
        successProbability: 0.85,
        scalingBehavior: 'polynomial',
        scalabilityLimit: 20
      },
      resources: {
        qubits: 4,
        depth: 20,
        gateCounts: { 'rz': 40, 'ry': 30, 'rx': 20, 'cx': 25 },
        memory: 256,
        classicalCompute: 'medium',
        communication: 'moderate'
      },
      variants: [
        {
          id: 'qml_ensemble',
          name: 'Ensemble Quantum Classifier',
          description: 'Ensemble of quantum classifiers for improved accuracy',
          modifications: ['Multiple quantum models', 'Voting mechanism'],
          tradeoffs: {
            improvement: 'Higher classification accuracy',
            cost: 'Increased quantum circuit executions'
          },
          circuitModification: this.ensembleQMLModification.bind(this)
        }
      ]
    });

    // Quantum Error Correction - Surface Code
    this.templates.set('qec_surface', {
      id: 'qec_surface',
      name: 'Surface Code Error Correction',
      description: 'Topological quantum error correction code for fault-tolerant quantum computing',
      category: 'error_correction',
      difficulty: 'advanced',
      qubits: { min: 9, max: 100, recommended: 25 },
      depth: { min: 10, max: 200, recommended: 50 },
      parameters: [
        {
          name: 'code_distance',
          type: 'integer',
          description: 'Code distance (d) for error correction capability',
          required: true,
          min: 3,
          max: 15,
          default: 5,
          impact: 'critical'
        },
        {
          name: 'error_model',
          type: 'select',
          description: 'Error model for simulation',
          required: true,
          options: ['depolarizing', 'bitflip', 'phaseflip', 'amplitude_damping', 'custom'],
          default: 'depolarizing',
          impact: 'high'
        },
        {
          name: 'syndrome_frequency',
          type: 'integer',
          description: 'Frequency of syndrome measurements',
          required: true,
          min: 1,
          max: 20,
          default: 5,
          impact: 'medium'
        },
        {
          name: 'decoding_algorithm',
          type: 'select',
          description: 'Classical decoding algorithm',
          required: true,
          options: ['minimum_weight_perfect_matching', 'union_find', 'belief_propagation', 'neural_network'],
          default: 'minimum_weight_perfect_matching',
          impact: 'high'
        },
        {
          name: 'fault_tolerance_level',
          type: 'select',
          description: 'Fault tolerance requirement level',
          required: true,
          options: ['basic', 'standard', 'rigorous', 'logical'],
          default: 'standard',
          impact: 'medium'
        }
      ],
      circuit: this.buildSurfaceCodeCircuit.bind(this),
      optimization: {
        type: 'circuit_compilation',
        targetMetric: 'fidelity',
        aggressiveness: 'conservative',
        constraints: ['maintain_error_correction', 'preserve_topological_structure'],
        customOptimizers: ['stabilizer_optimization', 'syndrome_extraction_optimization']
      },
      providerAdaptations: {
        'google-willow': {
          topology: 'fully_connected',
          gateSet: ['h', 'x', 'y', 'z', 'cx', 'cz', 'ccx'],
          errorMitigation: ['logical_qubit_encoding', 'flag_qubits'],
          compilationFlags: { topological_optimization: true, fault_tolerant: true }
        },
        'ibm-condor': {
          topology: 'custom',
          gateSet: ['h', 'x', 'y', 'z', 'cx', 'cz'],
          errorMitigation: ['flag_based_decoding', 'parallel_syndrome'],
          compilationFlags: { preserve_connectivity: true, error_detection: true }
        },
        'amazon-braket': {
          topology: 'grid',
          gateSet: ['h', 'x', 'y', 'z', 'cnot'],
          errorMitigation: ['adaptive_decoding', 'real_time_correction'],
          compilationFlags: { grid_optimization: true, surface_code_layout: true }
        }
      },
      performancePrediction: {
        fidelity: { best: 0.99, typical: 0.95, worst: 0.85 },
        executionTime: { best: 600, typical: 2400, worst: 7200 },
        cost: { best: 500, typical: 2000, worst: 8000 },
        successProbability: 0.95,
        scalingBehavior: 'polynomial',
        scalabilityLimit: 100
      },
      resources: {
        qubits: 25,
        depth: 50,
        gateCounts: { 'h': 50, 'x': 100, 'y': 50, 'cx': 200, 'cz': 50, 'ccx': 25 },
        memory: 4096,
        classicalCompute: 'high',
        communication: 'heavy'
      },
      variants: [
        {
          id: 'surface_color',
          name: 'Color Code Error Correction',
          description: 'Alternative topological code with different properties',
          modifications: ['Color code lattice', 'Different stabilizers'],
          tradeoffs: {
            improvement: 'Better transversal gate implementation',
            cost: 'Higher overhead for same distance'
          },
          circuitModification: this.colorCodeModification.bind(this)
        }
      ]
    });

    // Quantum Cryptography - Shor's Algorithm
    this.templates.set('crypto_shor', {
      id: 'crypto_shor',
      name: "Shor's Factoring Algorithm",
      description: 'Quantum algorithm for integer factorization, breaking RSA encryption',
      category: 'cryptography',
      difficulty: 'advanced',
      qubits: { min: 3, max: 50, recommended: 15 },
      depth: { min: 50, max: 1000, recommended: 300 },
      parameters: [
        {
          name: 'number_type',
          type: 'select',
          description: 'Type of number to factor',
          required: true,
          options: ['small_prime', 'semiprime', 'custom_number'],
          default: 'semiprime',
          impact: 'high'
        },
        {
          name: 'number_to_factor',
          type: 'string',
          description: 'Number to factor (for custom_number type)',
          required: false,
          validation: (value) => !isNaN(parseInt(value)) && parseInt(value) > 1,
          impact: 'critical'
        },
        {
          name: 'modular_exponential_method',
          type: 'select',
          description: 'Method for implementing modular exponentiation',
          required: true,
          options: ['repeat_until_success', 'beauregard', 'windowed_arithmetic'],
          default: 'beauregard',
          impact: 'high'
        },
        {
          name: 'qft_implementation',
          type: 'select',
          description: 'Quantum Fourier Transform implementation',
          required: true,
          options: ['standard', 'approximate', 'iterative', 'semiclassical'],
          default: 'approximate',
          impact: 'medium'
        },
        {
          name: 'classical_postprocessing',
          type: 'select',
          description: 'Classical post-processing method',
          required: true,
          options: ['continued_fractions', 'brute_force', 'baby_step_giant_step'],
          default: 'continued_fractions',
          impact: 'medium'
        }
      ],
      circuit: this.buildShorCircuit.bind(this),
      optimization: {
        type: 'circuit_compilation',
        targetMetric: 'depth',
        aggressiveness: 'aggressive',
        constraints: ['preserve_period_finding', 'maintain_modular_arithmetic'],
        customOptimizers: ['arithmetic_optimization', 'qft_optimization']
      },
      providerAdaptations: {
        'google-willow': {
          topology: 'fully_connected',
          gateSet: ['h', 't', 'tdg', 'cx', 'cu1', 'ccx'],
          errorMitigation: ['error_corrected_execution', 'logical_qubits'],
          compilationFlags: { optimize_arithmetic: true, use_logical_qubits: true }
        },
        'ibm-condor': {
          topology: 'custom',
          gateSet: ['h', 't', 'tdg', 'cx', 'cu1'],
          errorMitigation: ['error_suppression', 'noise_aware_execution'],
          compilationFlags: { optimization_level: 3, arithmetic_optimization: true }
        },
        'amazon-braket': {
          topology: 'grid',
          gateSet: ['h', 't', 'tdg', 'cnot', 'ccx'],
          errorMitigation: ['fault_tolerant_execution', 'error_detection'],
          compilationFlags: { accuracy_priority: 'maximum', quantum_volume_optimization: true }
        }
      },
      performancePrediction: {
        fidelity: { best: 0.80, typical: 0.60, worst: 0.40 },
        executionTime: { best: 1200, typical: 3600, worst: 10800 },
        cost: { best: 1000, typical: 5000, worst: 20000 },
        successProbability: 0.60,
        scalingBehavior: 'exponential',
        scalabilityLimit: 30
      },
      resources: {
        qubits: 15,
        depth: 300,
        gateCounts: { 'h': 30, 't': 800, 'tdg': 400, 'cx': 1200, 'cu1': 600, 'ccx': 200 },
        memory: 8192,
        classicalCompute: 'high',
        communication: 'moderate'
      },
      variants: [
        {
          id: 'shor_semiclassical',
          name: 'Semi-classical Shor',
          description: 'Semi-classical version with reduced qubit requirements',
          modifications: ['Feed-forward measurements', 'Classical processing'],
          tradeoffs: {
            improvement: 'Reduces qubit requirements significantly',
            cost: 'Requires fast classical processing and control'
          },
          circuitModification: this.semiClassicalShorModification.bind(this)
        }
      ]
    });
  }

  // Circuit building methods for each algorithm
  private buildVQECircuit(params: Record<string, any>): QuantumCircuit {
    const molecule = params.molecule || 'H2';
    const ansatz = params.ansatz || 'UCCSD';
    const layers = params.layers || 3;
    const initial_state = params.initial_state || 'Hartree-Fock';

    // Get qubit requirements based on molecule
    const qubits = this.getMoleculeQubits(molecule);

    const circuit: QuantumCircuit = {
      id: `vqe_${molecule}_${ansatz}_${Date.now()}`,
      name: `VQE - ${molecule} with ${ansatz}`,
      qubits,
      gates: []
    };

    // Initial state preparation
    this.addInitialStatePreparation(circuit, initial_state, molecule);

    // Variational ansatz
    this.addVariationalAnsatz(circuit, ansatz, layers, molecule);

    // Measurement
    this.addMeasurements(circuit, this.getMoleculeMeasurements(molecule));

    return circuit;
  }

  private buildQAOACircuit(params: Record<string, any>): QuantumCircuit {
    const graph_type = params.graph_type || 'random';
    const graph_size = params.graph_size || 10;
    const p_layers = params.p_layers || 3;
    const mixer = params.mixer_hamiltonian || 'X';

    const circuit: QuantumCircuit = {
      id: `qaoa_${graph_type}_${graph_size}_${p_layers}_${Date.now()}`,
      name: `QAOA - Max Cut on ${graph_type} graph`,
      qubits: graph_size,
      gates: []
    };

    // Initial superposition
    for (let i = 0; i < graph_size; i++) {
      circuit.gates.push({ type: 'h', qubits: [i], params: [] });
    }

    // Generate graph
    const edges = this.generateGraph(graph_type, graph_size);

    // QAOA layers
    for (let p = 0; p < p_layers; p++) {
      // Problem unitary (Max Cut)
      for (const [i, j] of edges) {
        circuit.gates.push({ type: 'cx', qubits: [i, j], params: [] });
        circuit.gates.push({ type: 'rz', qubits: [j], params: [`gamma_${p}`] });
        circuit.gates.push({ type: 'cx', qubits: [i, j], params: [] });
      }

      // Mixer unitary
      if (mixer === 'X') {
        for (let i = 0; i < graph_size; i++) {
          circuit.gates.push({ type: 'rx', qubits: [i], params: [`beta_${p}`] });
        }
      }
    }

    return circuit;
  }

  private buildQPECircuit(params: Record<string, any>): QuantumCircuit {
    const precision_bits = params.precision_bits || 6;
    const unitary_type = params.unitary_type || 'controlled_U';
    const eigenstate_prep = params.eigenstate_preparation || 'computational_basis';
    const iterative = params.iterative_qpe || false;
    const semiclassical = params.semi_classical || false;

    // Calculate total qubits needed
    const eigenstate_qubits = this.getEigenstateQubits(unitary_type);
    const ancilla_qubits = semiclassical ? 1 : precision_bits;
    const total_qubits = eigenstate_qubits + ancilla_qubits;

    const circuit: QuantumCircuit = {
      id: `qpe_${unitary_type}_${precision_bits}_${Date.now()}`,
      name: `Quantum Phase Estimation - ${unitary_type}`,
      qubits: total_qubits,
      gates: []
    };

    // Prepare eigenstate
    this.addEigenstatePreparation(circuit, eigenstate_prep, eigenstate_qubits);

    if (semiclassical) {
      // Semi-classical QPE implementation
      this.addSemiClassicalQPE(circuit, unitary_type, precision_bits, eigenstate_qubits);
    } else {
      // Standard QPE implementation
      this.addStandardQPE(circuit, unitary_type, precision_bits, eigenstate_qubits);
    }

    return circuit;
  }

  private buildQMLClassifierCircuit(params: Record<string, any>): QuantumCircuit {
    const data_encoding = params.data_encoding || 'angle';
    const ansatz_type = params.ansatz_type || 'hardware_efficient';
    const num_features = params.num_features || 4;
    const num_layers = params.num_layers || 3;

    const circuit: QuantumCircuit = {
      id: `qml_classifier_${data_encoding}_${ansatz_type}_${Date.now()}`,
      name: `Variational Quantum Classifier - ${ansatz_type}`,
      qubits: num_features + 1, // +1 for ancilla
      gates: []
    };

    // Data encoding
    this.addDataEncoding(circuit, data_encoding, num_features);

    // Variational ansatz
    this.addVariationalAnsatzQML(circuit, ansatz_type, num_features, num_layers);

    // Measurement for classification
    circuit.gates.push({ type: 'measure', qubits: [0], params: [] });

    return circuit;
  }

  private buildSurfaceCodeCircuit(params: Record<string, any>): QuantumCircuit {
    const code_distance = params.code_distance || 5;
    const error_model = params.error_model || 'depolarizing';
    const syndrome_frequency = params.syndrome_frequency || 5;

    // Calculate surface code qubits
    const data_qubits = code_distance * code_distance;
    const ancilla_qubits = (code_distance - 1) * code_distance * 2; // X and Z stabilizers
    const total_qubits = data_qubits + ancilla_qubits;

    const circuit: QuantumCircuit = {
      id: `surface_code_d${code_distance}_${Date.now()}`,
      name: `Surface Code Error Correction - Distance ${code_distance}`,
      qubits: total_qubits,
      gates: []
    };

    // Initialize logical state
    this.initializeLogicalState(circuit, code_distance);

    // Add syndrome extraction cycles
    for (let cycle = 0; cycle < syndrome_frequency; cycle++) {
      this.addSyndromeExtraction(circuit, code_distance, cycle);
    }

    // Final measurement
    this.addFinalMeasurements(circuit, code_distance);

    return circuit;
  }

  private buildShorCircuit(params: Record<string, any>): QuantumCircuit {
    const number_type = params.number_type || 'semiprime';
    const modular_exp_method = params.modular_exponential_method || 'beauregard';
    const qft_impl = params.qft_implementation || 'approximate';

    // Determine number to factor
    const number_to_factor = this.getNumberToFactor(number_type, params.number_to_factor);
    const n = parseInt(number_to_factor);

    // Calculate qubit requirements
    const control_qubits = Math.ceil(Math.log2(n * n));
    const work_qubits = Math.ceil(Math.log2(n));
    const total_qubits = control_qubits + work_qubits + 2; // +2 for ancilla

    const circuit: QuantumCircuit = {
      id: `shor_${n}_${modular_exp_method}_${Date.now()}`,
      name: `Shor's Algorithm - Factor ${n}`,
      qubits: total_qubits,
      gates: []
    };

    // Initialize control register
    for (let i = 0; i < control_qubits; i++) {
      circuit.gates.push({ type: 'h', qubits: [i], params: [] });
    }

    // Modular exponentiation
    this.addModularExponentiation(circuit, n, modular_exp_method, control_qubits, work_qubits);

    // Inverse QFT
    this.addInverseQFT(circuit, control_qubits, qft_impl);

    // Measurement
    for (let i = 0; i < control_qubits; i++) {
      circuit.gates.push({ type: 'measure', qubits: [i], params: [] });
    }

    return circuit;
  }

  // Algorithm variant modification methods
  private adaptiveVQEModification(baseCircuit: QuantumCircuit, params: Record<string, any>): QuantumCircuit {
    // Implement adaptive VQE modifications
    const modifiedCircuit = { ...baseCircuit };

    // Add adaptive circuit construction logic
    // This is a simplified placeholder for the actual adaptive algorithm

    return modifiedCircuit;
  }

  private subspaceVQEModification(baseCircuit: QuantumCircuit, params: Record<string, any>): QuantumCircuit {
    // Implement subspace expansion modifications
    const modifiedCircuit = { ...baseCircuit };

    // Add subspace expansion logic
    // This is a simplified placeholder for the actual subspace expansion

    return modifiedCircuit;
  }

  private recursiveQAOAModification(baseCircuit: QuantumCircuit, params: Record<string, any>): QuantumCircuit {
    // Implement recursive QAOA modifications
    const modifiedCircuit = { ...baseCircuit };

    // Add recursive parameter update logic
    // This is a simplified placeholder for the actual recursive algorithm

    return modifiedCircuit;
  }

  private iterativeQPEModification(baseCircuit: QuantumCircuit, params: Record<string, any>): QuantumCircuit {
    // Implement iterative QPE modifications
    const modifiedCircuit = { ...baseCircuit };

    // Convert to iterative implementation with single ancilla
    // This is a simplified placeholder for the actual iterative QPE

    return modifiedCircuit;
  }

  private ensembleQMLModification(baseCircuit: QuantumCircuit, params: Record<string, any>): QuantumCircuit {
    // Implement ensemble quantum classifier modifications
    const modifiedCircuit = { ...baseCircuit };

    // Add ensemble logic
    // This is a simplified placeholder for the actual ensemble method

    return modifiedCircuit;
  }

  private colorCodeModification(baseCircuit: QuantumCircuit, params: Record<string, any>): QuantumCircuit {
    // Implement color code modifications
    const modifiedCircuit = { ...baseCircuit };

    // Convert from surface code to color code
    // This is a simplified placeholder for the actual color code implementation

    return modifiedCircuit;
  }

  private semiClassicalShorModification(baseCircuit: QuantumCircuit, params: Record<string, any>): QuantumCircuit {
    // Implement semi-classical Shor modifications
    const modifiedCircuit = { ...baseCircuit };

    // Convert to semi-classical implementation
    // This is a simplified placeholder for the actual semi-classical algorithm

    return modifiedCircuit;
  }

  // Helper methods for circuit construction
  private getMoleculeQubits(molecule: string): number {
    const mapping: Record<string, number> = {
      'H2': 2,
      'LiH': 4,
      'BeH2': 6,
      'H2O': 4,
      'NH3': 6,
      'CH4': 8
    };
    return mapping[molecule] || 4;
  }

  private getMoleculeMeasurements(molecule: string): string[] {
    // Return measurement operators for the molecule
    // This is a simplified implementation
    return ['Z0', 'Z1', 'Z0Z1', 'X0X1'];
  }

  private addInitialStatePreparation(circuit: QuantumCircuit, initial_state: string, molecule: string): void {
    if (initial_state === 'Hartree-Fock') {
      // Prepare Hartree-Fock state
      const electrons = this.getMoleculeElectrons(molecule);
      for (let i = 0; i < electrons; i++) {
        circuit.gates.push({ type: 'x', qubits: [i], params: [] });
      }
    }
    // Add other initial state preparations as needed
  }

  private getMoleculeElectrons(molecule: string): number {
    const mapping: Record<string, number> = {
      'H2': 2,
      'LiH': 4,
      'BeH2': 6,
      'H2O': 10,
      'NH3': 10,
      'CH4': 10
    };
    return mapping[molecule] || 4;
  }

  private addVariationalAnsatz(circuit: QuantumCircuit, ansatz: string, layers: number, molecule: string): void {
    for (let layer = 0; layer < layers; layer++) {
      if (ansatz === 'UCCSD') {
        // Simplified UCCSD ansatz
        for (let i = 0; i < circuit.qubits; i++) {
          circuit.gates.push({ type: 'ry', qubits: [i], params: [`theta_${layer}_${i}`] });
        }
        for (let i = 0; i < circuit.qubits - 1; i++) {
          circuit.gates.push({ type: 'cx', qubits: [i, i + 1], params: [] });
          circuit.gates.push({ type: 'rz', qubits: [i + 1], params: [`phi_${layer}_${i}`] });
          circuit.gates.push({ type: 'cx', qubits: [i, i + 1], params: [] });
        }
      }
      // Add other ansatz types
    }
  }

  private addMeasurements(circuit: QuantumCircuit, measurement_operators: string[]): void {
    // Simplified measurement implementation
    circuit.gates.push({ type: 'measure', qubits: Array.from({ length: circuit.qubits }, (_, i) => i), params: [] });
  }

  private generateGraph(graph_type: string, size: number): Array<[number, number]> {
    const edges: Array<[number, number]> = [];

    if (graph_type === 'complete') {
      for (let i = 0; i < size; i++) {
        for (let j = i + 1; j < size; j++) {
          edges.push([i, j]);
        }
      }
    } else if (graph_type === 'random') {
      // Generate random connected graph
      for (let i = 0; i < size; i++) {
        for (let j = i + 1; j < size; j++) {
          if (Math.random() < 0.3) { // 30% edge probability
            edges.push([i, j]);
          }
        }
      }
    }

    return edges;
  }

  private getEigenstateQubits(unitary_type: string): number {
    // Simplified mapping - in real implementation this would depend on the specific unitary
    const mapping: Record<string, number> = {
      'controlled_U': 1,
      'controlled_U2': 2,
      'modular_exponential': 4,
      'custom': 2
    };
    return mapping[unitary_type] || 2;
  }

  private addEigenstatePreparation(circuit: QuantumCircuit, prep_method: string, eigenstate_qubits: number): void {
    if (prep_method === 'computational_basis') {
      // Usually start with |0⟩ or |1⟩ state
      circuit.gates.push({ type: 'x', qubits: [circuit.qubits - 1], params: [] });
    }
    // Add other preparation methods
  }

  private addStandardQPE(circuit: QuantumCircuit, unitary_type: string, precision_bits: number, eigenstate_qubits: number): void {
    // Simplified standard QPE implementation
    const ancilla_start = 0;
    const eigenstate_start = precision_bits;

    // Hadamard on ancilla qubits
    for (let i = 0; i < precision_bits; i++) {
      circuit.gates.push({ type: 'h', qubits: [ancilla_start + i], params: [] });
    }

    // Controlled unitary operations
    for (let i = 0; i < precision_bits; i++) {
      const repetitions = Math.pow(2, i);
      for (let j = 0; j < repetitions; j++) {
        this.addControlledUnitary(circuit, ancilla_start + i, eigenstate_start, unitary_type);
      }
    }

    // Inverse QFT on ancilla
    this.addInverseQFT(circuit, precision_bits, 'standard');
  }

  private addSemiClassicalQPE(circuit: QuantumCircuit, unitary_type: string, precision_bits: number, eigenstate_qubits: number): void {
    // Simplified semi-classical QPE implementation
    const ancilla_qubit = 0;
    const eigenstate_start = 1;

    // Sequential measurement and feed-forward
    for (let i = precision_bits - 1; i >= 0; i--) {
      circuit.gates.push({ type: 'h', qubits: [ancilla_qubit], params: [] });

      const repetitions = Math.pow(2, i);
      for (let j = 0; j < repetitions; j++) {
        this.addControlledUnitary(circuit, ancilla_qubit, eigenstate_start, unitary_type);
      }

      // Conditional rotation based on previous measurements
      if (i < precision_bits - 1) {
        circuit.gates.push({ type: 'rz', qubits: [ancilla_qubit], params: [`feedback_${i}`] });
      }

      circuit.gates.push({ type: 'measure', qubits: [ancilla_qubit], params: [] });
    }
  }

  private addControlledUnitary(circuit: QuantumCircuit, control: number, target_start: number, unitary_type: string): void {
    // Simplified controlled unitary implementation
    if (unitary_type === 'controlled_U') {
      circuit.gates.push({ type: 'cx', qubits: [control, target_start], params: [] });
    }
    // Add other unitary types
  }

  private addInverseQFT(circuit: QuantumCircuit, num_qubits: number, implementation: string): void {
    if (implementation === 'approximate') {
      // Approximate QFT with optimizations
      for (let i = 0; i < num_qubits; i++) {
        circuit.gates.push({ type: 'h', qubits: [i], params: [] });

        for (let j = 1; j < Math.min(num_qubits - i, 3); j++) { // Limited depth
          const angle = -Math.PI / Math.pow(2, j);
          circuit.gates.push({ type: 'crz', qubits: [i + j, i], params: [angle] });
        }

        // Swap operations (simplified)
        if (i < num_qubits / 2) {
          circuit.gates.push({ type: 'cx', qubits: [i, num_qubits - 1 - i], params: [] });
          circuit.gates.push({ type: 'cx', qubits: [num_qubits - 1 - i, i], params: [] });
          circuit.gates.push({ type: 'cx', qubits: [i, num_qubits - 1 - i], params: [] });
        }
      }
    }
  }

  private addDataEncoding(circuit: QuantumCircuit, encoding_type: string, num_features: number): void {
    if (encoding_type === 'angle') {
      // Angle encoding
      for (let i = 1; i <= num_features; i++) {
        circuit.gates.push({ type: 'rx', qubits: [i], params: [`x_${i}`] });
        circuit.gates.push({ type: 'ry', qubits: [i], params: [`y_${i}`] });
      }
    } else if (encoding_type === 'amplitude') {
      // Amplitude encoding (simplified)
      for (let i = 1; i <= num_features; i++) {
        circuit.gates.push({ type: 'ry', qubits: [i], params: [`amp_${i}`] });
      }
    }
  }

  private addVariationalAnsatzQML(circuit: QuantumCircuit, ansatz_type: string, num_features: number, num_layers: number): void {
    for (let layer = 0; layer < num_layers; layer++) {
      if (ansatz_type === 'hardware_efficient') {
        // Hardware-efficient ansatz
        for (let i = 1; i <= num_features; i++) {
          circuit.gates.push({ type: 'ry', qubits: [i], params: [`theta_${layer}_${i}`] });
          circuit.gates.push({ type: 'rz', qubits: [i], params: [`phi_${layer}_${i}`] });
        }

        // Entanglement
        for (let i = 1; i < num_features; i++) {
          circuit.gates.push({ type: 'cx', qubits: [i, i + 1], params: [] });
        }
      }
    }
  }

  private initializeLogicalState(circuit: QuantumCircuit, code_distance: number): void {
    // Initialize logical |0⟩ state for surface code
    // This is a simplified implementation
    for (let i = 0; i < code_distance * code_distance; i++) {
      circuit.gates.push({ type: 'reset', qubits: [i], params: [] });
    }
  }

  private addSyndromeExtraction(circuit: QuantumCircuit, code_distance: number, cycle: number): void {
    // Add syndrome extraction for surface code
    // This is a simplified implementation
    const data_qubits = code_distance * code_distance;
    const ancilla_start = data_qubits;

    // X stabilizers
    for (let row = 0; row < code_distance - 1; row++) {
      for (let col = 0; col < code_distance; col++) {
        const ancilla = ancilla_start + row * code_distance + col;
        circuit.gates.push({ type: 'h', qubits: [ancilla], params: [] });

        // CNOT with neighboring data qubits
        const data1 = row * code_distance + col;
        const data2 = (row + 1) * code_distance + col;

        circuit.gates.push({ type: 'cx', qubits: [ancilla, data1], params: [] });
        circuit.gates.push({ type: 'cx', qubits: [ancilla, data2], params: [] });

        circuit.gates.push({ type: 'h', qubits: [ancilla], params: [] });
        circuit.gates.push({ type: 'measure', qubits: [ancilla], params: [] });
      }
    }
  }

  private addFinalMeasurements(circuit: QuantumCircuit, code_distance: number): void {
    const data_qubits = code_distance * code_distance;
    for (let i = 0; i < data_qubits; i++) {
      circuit.gates.push({ type: 'measure', qubits: [i], params: [] });
    }
  }

  private getNumberToFactor(number_type: string, custom_number?: string): string {
    if (number_type === 'custom' && custom_number) {
      return custom_number;
    }

    // Pre-defined numbers for demonstration
    const numbers: Record<string, string> = {
      'small_prime': '15',
      'semiprime': '21'
    };

    return numbers[number_type] || '15';
  }

  private addModularExponentiation(circuit: QuantumCircuit, n: number, method: string, control_qubits: number, work_qubits: number): void {
    if (method === 'beauregard') {
      // Beauregard modular exponentiation
      for (let i = 0; i < control_qubits; i++) {
        const power = Math.pow(2, i);
        this.addControlledModularMultiply(circuit, i, control_qubits, work_qubits, power, n);
      }
    }
    // Add other modular exponentiation methods
  }

  private addControlledModularMultiply(circuit: QuantumCircuit, control: number, control_start: number, work_start: number, power: number, n: number): void {
    // Simplified controlled modular multiplication
    // This is a placeholder for the actual implementation
    for (let i = 0; i < Math.ceil(Math.log2(n)); i++) {
      circuit.gates.push({ type: 'ccx', qubits: [control, work_start + i, work_start + i + 1], params: [] });
    }
  }

  // Public API methods
  getTemplate(id: string): AlgorithmTemplate | undefined {
    return this.templates.get(id);
  }

  getAllTemplates(): AlgorithmTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplatesByCategory(category: string): AlgorithmTemplate[] {
    return Array.from(this.templates.values()).filter(template => template.category === category);
  }

  getTemplatesByDifficulty(difficulty: string): AlgorithmTemplate[] {
    return Array.from(this.templates.values()).filter(template => template.difficulty === difficulty);
  }

  getTemplatesByQubits(qubits: number): AlgorithmTemplate[] {
    return Array.from(this.templates.values()).filter(template =>
      qubits >= template.qubits.min && qubits <= template.qubits.max
    );
  }

  validateParameters(templateId: string, params: Record<string, any>): { valid: boolean; errors: string[] } {
    const template = this.templates.get(templateId);
    if (!template) {
      return { valid: false, errors: ['Template not found'] };
    }

    const errors: string[] = [];

    for (const param of template.parameters) {
      if (param.required && !(param.name in params)) {
        errors.push(`Required parameter '${param.name}' is missing`);
        continue;
      }

      if (param.name in params) {
        const value = params[param.name];

        // Type validation
        if (param.type === 'number' && typeof value !== 'number') {
          errors.push(`Parameter '${param.name}' must be a number`);
        } else if (param.type === 'integer' && (!Number.isInteger(value) || typeof value !== 'number')) {
          errors.push(`Parameter '${param.name}' must be an integer`);
        } else if (param.type === 'boolean' && typeof value !== 'boolean') {
          errors.push(`Parameter '${param.name}' must be a boolean`);
        } else if (param.type === 'string' && typeof value !== 'string') {
          errors.push(`Parameter '${param.name}' must be a string`);
        }

        // Range validation
        if (param.type === 'number' || param.type === 'integer') {
          if (param.min !== undefined && value < param.min) {
            errors.push(`Parameter '${param.name}' must be at least ${param.min}`);
          }
          if (param.max !== undefined && value > param.max) {
            errors.push(`Parameter '${param.name}' must be at most ${param.max}`);
          }
        }

        // Options validation
        if (param.type === 'select' && param.options && !param.options.includes(value)) {
          errors.push(`Parameter '${param.name}' must be one of: ${param.options.join(', ')}`);
        }

        // Custom validation
        if (param.validation && !param.validation(value)) {
          errors.push(`Parameter '${param.name}' failed custom validation`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  generateCircuit(templateId: string, params: Record<string, any>): QuantumCircuit | null {
    const validation = this.validateParameters(templateId, params);
    if (!validation.valid) {
      return null;
    }

    const template = this.templates.get(templateId);
    if (!template) {
      return null;
    }

    try {
      return template.circuit(params);
    } catch (error) {
      return null;
    }
  }

  getProviderAdaptation(templateId: string, provider: string): ProviderAdaptation | undefined {
    const template = this.templates.get(templateId);
    if (!template) {
      return undefined;
    }

    return template.providerAdaptations[provider];
  }

  getPerformancePrediction(templateId: string, params: Record<string, any>): PerformancePrediction | undefined {
    const template = this.templates.get(templateId);
    if (!template) {
      return undefined;
    }

    // Adjust prediction based on parameters
    const prediction = { ...template.performancePrediction };

    // Simple adjustments based on key parameters
    if (params.layers && template.category === 'variational') {
      const layer_factor = params.layers / 3; // Normalize to 3 layers
      prediction.executionTime.typical *= layer_factor;
      prediction.cost.typical *= layer_factor;
    }

    if (params.precision_bits && template.id === 'qpe_standard') {
      const bits_factor = params.precision_bits / 6; // Normalize to 6 bits
      prediction.fidelity.typical *= Math.pow(0.9, bits_factor - 1); // Fidelity decreases with precision
    }

    return prediction;
  }

  exportTemplate(templateId: string): string {
    const template = this.templates.get(templateId);
    if (!template) {
      return '';
    }

    return JSON.stringify(template, null, 2);
  }

  importTemplate(templateJson: string): boolean {
    try {
      const template = JSON.parse(templateJson) as AlgorithmTemplate;

      // Basic validation
      if (!template.id || !template.name || !template.circuit) {
        return false;
      }

      this.templates.set(template.id, template);
      return true;
    } catch {
      return false;
    }
  }

  searchTemplates(query: string): AlgorithmTemplate[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.templates.values()).filter(template =>
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.category.toLowerCase().includes(lowerQuery)
    );
  }

  compareTemplates(templateIds: string[]): AlgorithmComparison {
    const templates = templateIds.map(id => this.templates.get(id)).filter(Boolean) as AlgorithmTemplate[];

    return {
      templates,
      metrics: this.calculateComparisonMetrics(templates),
      recommendations: this.generateRecommendations(templates)
    };
  }

  private calculateComparisonMetrics(templates: AlgorithmTemplate[]): ComparisonMetrics {
    const avgQubits = templates.reduce((sum, t) => sum + t.qubits.recommended, 0) / templates.length;
    const avgDepth = templates.reduce((sum, t) => sum + t.depth.recommended, 0) / templates.length;
    const avgFidelity = templates.reduce((sum, t) => sum + t.performancePrediction.typical, 0) / templates.length;

    return {
      averageQubits: Math.round(avgQubits),
      averageDepth: Math.round(avgDepth),
      averageFidelity: avgFidelity,
      complexityDistribution: this.calculateComplexityDistribution(templates),
      categoryDistribution: this.calculateCategoryDistribution(templates)
    };
  }

  private calculateComplexityDistribution(templates: AlgorithmTemplate[]): Record<string, number> {
    const distribution: Record<string, number> = { beginner: 0, intermediate: 0, advanced: 0 };
    templates.forEach(template => {
      distribution[template.difficulty]++;
    });
    return distribution;
  }

  private calculateCategoryDistribution(templates: AlgorithmTemplate[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    templates.forEach(template => {
      distribution[template.category] = (distribution[template.category] || 0) + 1;
    });
    return distribution;
  }

  private generateRecommendations(templates: AlgorithmTemplate[]): string[] {
    const recommendations: string[] = [];

    if (templates.some(t => t.qubits.recommended > 20)) {
      recommendations.push('Consider error mitigation strategies for large qubit counts');
    }

    if (templates.some(t => t.depth.recommended > 100)) {
      recommendations.push('Deep circuits may benefit from error correction or hybrid approaches');
    }

    const variationalCount = templates.filter(t => t.category === 'variational').length;
    if (variationalCount > 1) {
      recommendations.push('Multiple variational algorithms can share classical optimization infrastructure');
    }

    return recommendations;
  }
}

export interface AlgorithmComparison {
  templates: AlgorithmTemplate[];
  metrics: ComparisonMetrics;
  recommendations: string[];
}

export interface ComparisonMetrics {
  averageQubits: number;
  averageDepth: number;
  averageFidelity: number;
  complexityDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
}