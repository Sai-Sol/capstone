'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { getWebSocketManager } from '@/lib/websocket-manager';

// Types for quantum platform state
export interface QuantumJob {
  id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  queuePosition?: number;
  estimatedWaitTime?: number;
  progress?: number;
  shots?: number;
  completedShots?: number;
  results?: MeasurementResult[];
  error?: QuantumError;
  metadata: {
    algorithm: string;
    device: string;
    shots: number;
    executionTime?: number;
    fidelity?: number;
  };
}

export interface MeasurementResult {
  state: string;
  probability: number;
  count: number;
}

export interface QuantumError {
  type: 'device' | 'circuit' | 'network' | 'timeout';
  message: string;
  suggestion: string;
  context?: any;
}

export interface DeviceQubit {
  id: number;
  status: 'active' | 'calibrating' | 'offline' | 'maintenance';
  fidelity: number;
  t1: number;
  t2: number;
  gateErrorRate: number;
  readoutErrorRate: number;
  crosstalk: number;
  temperature?: number;
}

export interface DeviceHealth {
  deviceId: string;
  status: 'online' | 'offline' | 'maintenance' | 'calibrating';
  qubits: DeviceQubit[];
  lastCalibration: Date;
  nextCalibration?: Date;
  averageFidelity: number;
  temperature: number;
  availability: number;
}

export interface CircuitState {
  id: string;
  name: string;
  openQASM: string;
  depth: number;
  gateCount: number;
  stateVector?: number[][];
  blochVectors?: number[][];
  entanglementMatrix?: number[][];
}

export interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  actionRequired: boolean;
  actions?: AlertAction[];
}

export interface AlertAction {
  label: string;
  action: string;
  handler?: () => void;
}

// State interface
interface QuantumPlatformState {
  jobs: Record<string, QuantumJob>;
  activeJob: string | null;
  deviceHealth: Record<string, DeviceHealth>;
  circuits: Record<string, CircuitState>;
  activeCircuit: string | null;
  alerts: Record<string, Alert>;
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
  userPreferences: {
    autoRefresh: boolean;
    alertThresholds: {
      errorRate: number;
      temperature: number;
      fidelityDrop: number;
    };
    visualizationSettings: {
      animationSpeed: number;
      colorScheme: string;
      showControls: boolean;
    };
  };
}

// Action types
type QuantumPlatformAction =
  | { type: 'SET_CONNECTION_STATUS'; status: 'connected' | 'disconnected' | 'connecting' | 'error' }
  | { type: 'ADD_JOB'; job: QuantumJob }
  | { type: 'UPDATE_JOB'; jobId: string; updates: Partial<QuantumJob> }
  | { type: 'SET_ACTIVE_JOB'; jobId: string | null }
  | { type: 'UPDATE_DEVICE_HEALTH'; deviceId: string; health: DeviceHealth }
  | { type: 'ADD_CIRCUIT'; circuit: CircuitState }
  | { type: 'UPDATE_CIRCUIT'; circuitId: string; updates: Partial<CircuitState> }
  | { type: 'SET_ACTIVE_CIRCUIT'; circuitId: string | null }
  | { type: 'ADD_ALERT'; alert: Alert }
  | { type: 'ACKNOWLEDGE_ALERT'; alertId: string }
  | { type: 'RESOLVE_ALERT'; alertId: string }
  | { type: 'UPDATE_PREFERENCES'; preferences: Partial<QuantumPlatformState['userPreferences']> }
  | { type: 'BULK_UPDATE_JOBS'; jobs: Record<string, QuantumJob> }
  | { type: 'REMOVE_JOB'; jobId: string };

// Initial state
const initialState: QuantumPlatformState = {
  jobs: {},
  activeJob: null,
  deviceHealth: {},
  circuits: {},
  activeCircuit: null,
  alerts: {},
  connectionStatus: 'disconnected',
  userPreferences: {
    autoRefresh: true,
    alertThresholds: {
      errorRate: 0.05,
      temperature: 15, // mK
      fidelityDrop: 0.1
    },
    visualizationSettings: {
      animationSpeed: 1.0,
      colorScheme: 'default',
      showControls: true
    }
  }
};

// Reducer function
function quantumPlatformReducer(state: QuantumPlatformState, action: QuantumPlatformAction): QuantumPlatformState {
  switch (action.type) {
    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.status };

    case 'ADD_JOB':
      return {
        ...state,
        jobs: { ...state.jobs, [action.job.id]: action.job }
      };

    case 'UPDATE_JOB':
      return {
        ...state,
        jobs: {
          ...state.jobs,
          [action.jobId]: {
            ...state.jobs[action.jobId],
            ...action.updates
          }
        }
      };

    case 'SET_ACTIVE_JOB':
      return { ...state, activeJob: action.jobId };

    case 'UPDATE_DEVICE_HEALTH':
      return {
        ...state,
        deviceHealth: {
          ...state.deviceHealth,
          [action.deviceId]: action.health
        }
      };

    case 'ADD_CIRCUIT':
      return {
        ...state,
        circuits: { ...state.circuits, [action.circuit.id]: action.circuit }
      };

    case 'UPDATE_CIRCUIT':
      return {
        ...state,
        circuits: {
          ...state.circuits,
          [action.circuitId]: {
            ...state.circuits[action.circuitId],
            ...action.updates
          }
        }
      };

    case 'SET_ACTIVE_CIRCUIT':
      return { ...state, activeCircuit: action.circuitId };

    case 'ADD_ALERT':
      return {
        ...state,
        alerts: { ...state.alerts, [action.alert.id]: action.alert }
      };

    case 'ACKNOWLEDGE_ALERT':
      return {
        ...state,
        alerts: {
          ...state.alerts,
          [action.alertId]: {
            ...state.alerts[action.alertId],
            acknowledged: true
          }
        }
      };

    case 'RESOLVE_ALERT':
      const newAlerts = { ...state.alerts };
      delete newAlerts[action.alertId];
      return { ...state, alerts: newAlerts };

    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        userPreferences: {
          ...state.userPreferences,
          ...action.preferences
        }
      };

    case 'BULK_UPDATE_JOBS':
      return { ...state, jobs: action.jobs };

    case 'REMOVE_JOB':
      const updatedJobs = { ...state.jobs };
      delete updatedJobs[action.jobId];
      return { ...state, jobs: updatedJobs };

    default:
      return state;
  }
}

// Context
const QuantumPlatformContext = createContext<{
  state: QuantumPlatformState;
  dispatch: React.Dispatch<QuantumPlatformAction>;
  actions: {
    subscribeToJobUpdates: (jobId: string) => void;
    subscribeToDeviceHealth: (deviceId: string) => void;
    subscribeToAlerts: () => void;
    createAlert: (alert: Omit<Alert, 'id' | 'timestamp'>) => void;
    acknowledgeAlert: (alertId: string) => void;
    resolveAlert: (alertId: string) => void;
    setActiveJob: (jobId: string | null) => void;
    setActiveCircuit: (circuitId: string | null) => void;
    updatePreferences: (preferences: Partial<QuantumPlatformState['userPreferences']>) => void;
  };
} | null>(null);

// Provider component
interface QuantumPlatformProviderProps {
  children: ReactNode;
}

export function QuantumPlatformProvider({ children }: QuantumPlatformProviderProps) {
  const [state, dispatch] = useReducer(quantumPlatformReducer, initialState);

  // WebSocket integration
  useEffect(() => {
    const wsManager = getWebSocketManager();

    // Set up connection status monitoring
    const connectInterval = setInterval(() => {
      if (wsManager.isConnected() && state.connectionStatus !== 'connected') {
        dispatch({ type: 'SET_CONNECTION_STATUS', status: 'connected' });
      } else if (!wsManager.isConnected() && state.connectionStatus === 'connected') {
        dispatch({ type: 'SET_CONNECTION_STATUS', status: 'disconnected' });
      }
    }, 1000);

    // Subscribe to general alerts
    const alertSubscription = wsManager.subscribe('alerts', (alertData) => {
      dispatch({ type: 'ADD_ALERT', alert: alertData });
    });

    // Initialize connection
    if (!wsManager.isConnected()) {
      dispatch({ type: 'SET_CONNECTION_STATUS', status: 'connecting' });
      wsManager.connect().catch(() => {
        dispatch({ type: 'SET_CONNECTION_STATUS', status: 'error' });
      });
    }

    return () => {
      clearInterval(connectInterval);
      wsManager.unsubscribe(alertSubscription);
    };
  }, [state.connectionStatus]);

  // Action handlers
  const actions = {
    subscribeToJobUpdates: (jobId: string) => {
      const wsManager = getWebSocketManager();
      const subscription = wsManager.subscribe(`job:${jobId}`, (jobData) => {
        dispatch({ type: 'UPDATE_JOB', jobId, updates: jobData });
      });
      return subscription;
    },

    subscribeToDeviceHealth: (deviceId: string) => {
      const wsManager = getWebSocketManager();
      const subscription = wsManager.subscribe(`device:${deviceId}`, (healthData) => {
        dispatch({ type: 'UPDATE_DEVICE_HEALTH', deviceId, health });
      });
      return subscription;
    },

    subscribeToAlerts: () => {
      const wsManager = getWebSocketManager();
      const subscription = wsManager.subscribe('alerts', (alertData) => {
        dispatch({ type: 'ADD_ALERT', alert: alertData });
      });
      return subscription;
    },

    createAlert: (alertData: Omit<Alert, 'id' | 'timestamp'>) => {
      const alert: Alert = {
        ...alertData,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date()
      };
      dispatch({ type: 'ADD_ALERT', alert });
    },

    acknowledgeAlert: (alertId: string) => {
      dispatch({ type: 'ACKNOWLEDGE_ALERT', alertId });
    },

    resolveAlert: (alertId: string) => {
      dispatch({ type: 'RESOLVE_ALERT', alertId });
    },

    setActiveJob: (jobId: string | null) => {
      dispatch({ type: 'SET_ACTIVE_JOB', jobId });
    },

    setActiveCircuit: (circuitId: string | null) => {
      dispatch({ type: 'SET_ACTIVE_CIRCUIT', circuitId });
    },

    updatePreferences: (preferences: Partial<QuantumPlatformState['userPreferences']>) => {
      dispatch({ type: 'UPDATE_PREFERENCES', preferences });
    }
  };

  return (
    <QuantumPlatformContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </QuantumPlatformContext.Provider>
  );
}

// Hook for using the context
export function useQuantumPlatform() {
  const context = useContext(QuantumPlatformContext);
  if (!context) {
    throw new Error('useQuantumPlatform must be used within a QuantumPlatformProvider');
  }
  return context;
}