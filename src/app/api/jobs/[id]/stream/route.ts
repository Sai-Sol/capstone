import { NextRequest, NextResponse } from 'next/server';
import { WebSocketServer, WebSocket } from 'ws';
import { jobs } from '../../../../submit-job/route';

// WebSocket connections store
const connections = new Map<string, Set<WebSocket>>();

// Job simulation data
const jobSimulations = new Map<string, {
  isRunning: boolean;
  interval?: NodeJS.Timeout;
  currentShots: number;
  queuePosition: number;
  progress: number;
}>();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const jobId = params.id;

  if (!jobId) {
    return NextResponse.json(
      { error: 'Job ID is required' },
      { status: 400 }
    );
  }

  // Check if job exists
  const job = jobs.get(jobId);
  if (!job) {
    return NextResponse.json(
      { error: 'Job not found' },
      { status: 404 }
    );
  }

  // For HTTP requests, return current status with enhanced data
  const enhancedJob = {
    ...job,
    queuePosition: jobSimulations.get(jobId)?.queuePosition || 1,
    estimatedWaitTime: jobSimulations.get(jobId)?.queuePosition ? jobSimulations.get(jobId)!.queuePosition * 60 : 0,
    completedShots: jobSimulations.get(jobId)?.currentShots || 0,
    deviceStatus: getDeviceStatus(job.provider),
    error: job.status === 'failed' ? generateErrorContext(job) : undefined
  };

  return NextResponse.json(enhancedJob);
}

// WebSocket upgrade handler
export async function WebSocketUpgrade(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const jobId = params.id;

  if (!jobId) {
    return new Response('Job ID is required', { status: 400 });
  }

  const job = jobs.get(jobId);
  if (!job) {
    return new Response('Job not found', { status: 404 });
  }

  // Upgrade to WebSocket
  return new Response('WebSocket upgrade not implemented in Next.js App Router', {
    status: 500
  });
}

// Mock job simulation for development
function startJobSimulation(jobId: string) {
  if (jobSimulations.has(jobId)) {
    return; // Already running
  }

  const simulation = {
    isRunning: true,
    currentShots: 0,
    queuePosition: Math.floor(Math.random() * 5) + 1,
    progress: 0
  };

  jobSimulations.set(jobId, simulation);

  // Simulate queue movement
  const queueInterval = setInterval(() => {
    if (simulation.queuePosition > 1) {
      simulation.queuePosition--;
      broadcastToJobConnections(jobId, {
        type: 'queue_update',
        data: {
          queuePosition: simulation.queuePosition,
          estimatedWaitTime: simulation.queuePosition * 60
        }
      });
    } else {
      clearInterval(queueInterval);
      startExecutionSimulation(jobId);
    }
  }, 3000);

  simulation.interval = queueInterval;
}

function startExecutionSimulation(jobId: string) {
  const job = jobs.get(jobId);
  if (!job || !job.results) return;

  const simulation = jobSimulations.get(jobId);
  if (!simulation) return;

  const totalShots = job.results.shots;
  let currentShots = 0;

  const executionInterval = setInterval(() => {
    if (currentShots >= totalShots) {
      // Job completed
      clearInterval(executionInterval);
      simulation.isRunning = false;

      // Update job status
      job.status = 'completed';
      job.completedAt = Date.now();

      broadcastToJobConnections(jobId, {
        type: 'job_completed',
        data: {
          status: 'completed',
          progress: 100,
          completedShots: totalShots,
          results: job.results,
          executionTime: job.completedAt - job.submittedAt
        }
      });
      return;
    }

    // Simulate shot completion
    const shotsToAdd = Math.min(
      Math.floor(Math.random() * 100) + 50,
      totalShots - currentShots
    );
    currentShots += shotsToAdd;

    // Update partial results
    const partialMeasurements = generatePartialMeasurements(
      job.results.measurements,
      currentShots,
      totalShots
    );

    simulation.currentShots = currentShots;
    simulation.progress = (currentShots / totalShots) * 100;

    // Partial results should show current operation
    const operations = [
      'Initializing quantum circuit',
      'Applying quantum gates',
      'Measuring quantum states',
      'Processing results',
      'Optimizing circuit execution'
    ];

    const currentOperation = operations[Math.floor(Math.random() * operations.length)];

    broadcastToJobConnections(jobId, {
      type: 'execution_update',
      data: {
        progress: simulation.progress,
        completedShots: currentShots,
        totalShots,
        currentOperation,
        partialMeasurements,
        estimatedTimeRemaining: Math.ceil((totalShots - currentShots) / 75) // seconds
      }
    });
  }, 2000); // Update every 2 seconds

  simulation.interval = executionInterval;
}

function generatePartialMeasurements(
  finalMeasurements: Record<string, number>,
  currentShots: number,
  totalShots: number
): Record<string, number> {
  const partial: Record<string, number> = {};
  const distribution = Object.entries(finalMeasurements).map(([state, count]) => ({
    state,
    probability: count / totalShots
  }));

  // Distribute current shots according to final probabilities with some randomness
  let remainingShots = currentShots;

  distribution.forEach(({ state, probability }, index) => {
    if (index === distribution.length - 1) {
      // Last state gets remaining shots
      partial[state] = remainingShots;
    } else {
      const expectedCount = Math.floor(currentShots * probability);
      const variance = Math.floor(Math.random() * 20) - 10; // ±10 variance
      const count = Math.max(0, Math.min(remainingShots, expectedCount + variance));
      partial[state] = count;
      remainingShots -= count;
    }
  });

  return partial;
}

function broadcastToJobConnections(jobId: string, message: any) {
  const jobConnections = connections.get(jobId);
  if (!jobConnections) return;

  const messageStr = JSON.stringify({
    ...message,
    timestamp: Date.now(),
    jobId
  });

  jobConnections.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(messageStr);
    }
  });
}

function getDeviceStatus(provider: string): string {
  const deviceStatuses = {
    'Google Willow': 'online',
    'IBM Condor': 'calibrating',
    'Amazon Braket': 'online',
    'Microsoft Azure': 'maintenance'
  };
  return deviceStatuses[provider as keyof typeof deviceStatuses] || 'online';
}

function generateErrorContext(job: any) {
  const errorTypes = ['device', 'circuit', 'network', 'timeout', 'calibration'];
  const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)] as any;

  const baseError = {
    type: errorType,
    message: getErrorMessage(errorType),
    suggestion: getErrorSuggestion(errorType),
    retryAvailable: errorType !== 'calibration',
    supportContact: errorType === 'device'
  };

  if (errorType === 'device') {
    baseError.context = {
      deviceId: `${job.provider.replace(' ', '').toLowerCase()}-device-001`,
      errorRate: Math.random() * 0.05 + 0.01,
      temperature: 15 + Math.random() * 5,
      lastCalibration: new Date(Date.now() - 86400000).toISOString()
    };
  }

  return baseError;
}

function getErrorMessage(type: string): string {
  const messages = {
    device: 'Quantum device is currently unavailable or experiencing high error rates',
    circuit: 'Quantum circuit validation failed - incompatible gates or syntax error',
    network: 'Network connectivity issue with quantum provider',
    timeout: 'Job execution timeout - circuit complexity exceeded time limits',
    calibration: 'Device calibration in progress - temporarily unavailable'
  };
  return messages[type as keyof typeof messages] || 'Unknown error occurred';
}

function getErrorSuggestion(type: string): string {
  const suggestions = {
    device: 'Wait for device recovery or switch to a different quantum device',
    circuit: 'Check OpenQASM syntax and gate compatibility with target device',
    network: 'Check internet connection and retry submission',
    timeout: 'Reduce circuit complexity or number of shots',
    calibration: 'Wait for calibration to complete or use an alternative device'
  };
  return suggestions[type as keyof typeof suggestions] || 'Contact support for assistance';
}

// Enhanced job status with queue information
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const jobId = params.id;
  const body = await request.json();

  if (body.action === 'start_simulation') {
    startJobSimulation(jobId);
    return NextResponse.json({
      message: 'Job simulation started',
      jobId,
      queuePosition: jobSimulations.get(jobId)?.queuePosition
    });
  }

  if (body.action === 'stop_simulation') {
    const simulation = jobSimulations.get(jobId);
    if (simulation?.interval) {
      clearInterval(simulation.interval);
    }
    jobSimulations.delete(jobId);
    return NextResponse.json({ message: 'Job simulation stopped' });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

// Cleanup function for server shutdown
export function cleanup() {
  jobSimulations.forEach((simulation, jobId) => {
    if (simulation.interval) {
      clearInterval(simulation.interval);
    }
  });
  jobSimulations.clear();
  connections.clear();
}