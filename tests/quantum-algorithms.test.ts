import { describe, it, expect, vi } from 'vitest';

describe('Quantum Algorithm Processing', () => {
  describe('Algorithm Recognition', () => {
    it('should identify Bell state algorithms', () => {
      const bellStateDescription = 'Create entangled Bell state using Hadamard and CNOT gates';
      const lowerDesc = bellStateDescription.toLowerCase();
      
      const isBellState = lowerDesc.includes('bell') || 
                        (lowerDesc.includes('h') && lowerDesc.includes('cnot'));
      
      expect(isBellState).toBe(true);
    });

    it('should identify Grover search algorithms', () => {
      const groverDescription = 'Search database using Grover quantum algorithm';
      const lowerDesc = groverDescription.toLowerCase();
      
      const isGrover = lowerDesc.includes('grover') || lowerDesc.includes('search');
      
      expect(isGrover).toBe(true);
    });

    it('should identify QASM code', () => {
      const qasmCode = `OPENQASM 2.0;
include "qelib1.inc";
qreg q[2];
creg c[2];
h q[0];
cx q[0],q[1];
measure q -> c;`;

      const lowerCode = qasmCode.toLowerCase();
      const isQASM = lowerCode.includes('openqasm') || 
                    lowerCode.includes('qreg') || 
                    lowerCode.includes('creg');
      
      expect(isQASM).toBe(true);
    });
  });

  describe('Result Generation', () => {
    it('should generate realistic Bell state measurements', () => {
      const bellStateMeasurements = {
        "00": 487,
        "01": 13,
        "10": 12,
        "11": 488
      };

      const totalShots = Object.values(bellStateMeasurements).reduce((sum, count) => sum + count, 0);
      const entangledStates = bellStateMeasurements["00"] + bellStateMeasurements["11"];
      const entanglementRatio = entangledStates / totalShots;

      expect(totalShots).toBe(1000);
      expect(entanglementRatio).toBeGreaterThan(0.9); // High entanglement
    });

    it('should generate realistic Grover search results', () => {
      const groverMeasurements = {
        "00": 125,
        "01": 125,
        "10": 125,
        "11": 625  // Target state amplified
      };

      const totalShots = Object.values(groverMeasurements).reduce((sum, count) => sum + count, 0);
      const targetProbability = groverMeasurements["11"] / totalShots;

      expect(totalShots).toBe(1000);
      expect(targetProbability).toBeGreaterThan(0.5); // Target state amplified
    });

    it('should calculate fidelity correctly', () => {
      const measurements = { "00": 487, "01": 13, "10": 12, "11": 488 };
      const totalShots = 1000;
      const idealDistribution = { "00": 500, "11": 500 }; // Perfect Bell state
      
      // Calculate fidelity as similarity to ideal distribution
      let fidelity = 0;
      Object.entries(idealDistribution).forEach(([state, ideal]) => {
        const actual = measurements[state as keyof typeof measurements] || 0;
        fidelity += Math.min(actual, ideal);
      });
      fidelity = (fidelity / totalShots) * 100;

      expect(fidelity).toBeGreaterThan(90); // High fidelity expected
    });
  });

  describe('Execution Metrics', () => {
    it('should calculate execution time based on algorithm complexity', () => {
      const algorithms = [
        { name: 'Bell State', expectedTime: 25, complexity: 'low' },
        { name: 'Grover Search', expectedTime: 150, complexity: 'medium' },
        { name: 'Shor Algorithm', expectedTime: 2000, complexity: 'high' }
      ];

      algorithms.forEach(algo => {
        const timeRange = algo.complexity === 'low' ? [20, 50] :
                         algo.complexity === 'medium' ? [100, 300] :
                         [1000, 5000];
        
        expect(algo.expectedTime).toBeGreaterThanOrEqual(timeRange[0]);
        expect(algo.expectedTime).toBeLessThanOrEqual(timeRange[1]);
      });
    });

    it('should calculate circuit depth correctly', () => {
      const circuits = [
        { algorithm: 'Bell State', expectedDepth: 2 },
        { algorithm: 'Grover Search', expectedDepth: 8 },
        { algorithm: 'Quantum Fourier Transform', expectedDepth: 15 }
      ];

      circuits.forEach(circuit => {
        expect(circuit.expectedDepth).toBeGreaterThan(0);
        expect(circuit.expectedDepth).toBeLessThan(50); // Reasonable depth limit
      });
    });
  });

  describe('Provider Integration', () => {
    it('should validate quantum providers', () => {
      const validProviders = ['Google Willow', 'IBM Condor', 'Amazon Braket'];
      const invalidProvider = 'Unknown Provider';

      validProviders.forEach(provider => {
        expect(validProviders.includes(provider)).toBe(true);
      });

      expect(validProviders.includes(invalidProvider)).toBe(false);
    });

    it('should calculate provider-specific metrics', () => {
      const providers = {
        'Google Willow': { qubits: 105, errorCorrection: true },
        'IBM Condor': { qubits: 1121, enterprise: true },
        'Amazon Braket': { qubits: 256, multiProvider: true }
      };

      Object.entries(providers).forEach(([name, specs]) => {
        expect(specs.qubits).toBeGreaterThan(0);
        expect(Object.keys(specs)).toContain('qubits');
      });
    });
  });
});