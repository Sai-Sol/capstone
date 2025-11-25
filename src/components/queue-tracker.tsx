'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  Users,
  Server,
  Zap,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Timer,
  Activity,
  Cpu,
  HardDrive
} from 'lucide-react';

interface QueuePosition {
  current: number;
  total: number;
  estimatedWaitTime: number; // in seconds
  averageProcessingTime: number; // in seconds
}

interface DeviceInfo {
  deviceId: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance' | 'calibrating';
  currentLoad: number; // percentage
  qubits: number;
  gateFidelity: number;
  temperature: number; // mK
  queueSize: number;
  throughput: number; // jobs per hour
}

interface JobProgress {
  shots: number;
  completedShots: number;
  progressPercentage: number;
  currentOperation: string;
  estimatedTimeRemaining: number; // in seconds
}

interface QueueTrackerProps {
  jobId: string;
  initialQueuePosition?: QueuePosition;
  deviceInfo?: DeviceInfo;
  jobProgress?: JobProgress;
  className?: string;
}

export function QueueTracker({
  jobId,
  initialQueuePosition = { current: 1, total: 5, estimatedWaitTime: 300, averageProcessingTime: 60 },
  deviceInfo,
  jobProgress,
  className
}: QueueTrackerProps) {
  const [queuePosition, setQueuePosition] = useState<QueuePosition>(initialQueuePosition);
  const [currentDeviceInfo, setDeviceInfo] = useState<DeviceInfo | undefined>(deviceInfo);
  const [currentJobProgress, setJobProgress] = useState<JobProgress | undefined>(jobProgress);
  const [positionHistory, setPositionHistory] = useState<number[]>([initialQueuePosition.current]);
  const [isConnected, setIsConnected] = useState(true);

  // Simulate real-time queue updates
  useEffect(() => {
    const simulateQueueUpdate = () => {
      if (currentJobProgress?.completedShots === currentJobProgress?.shots) {
        // Job is complete, no more updates
        return;
      }

      setQueuePosition(prev => {
        // Occasionally move forward in queue
        if (prev.current > 1 && Math.random() > 0.7) {
          const newPosition = Math.max(1, prev.current - 1);
          setPositionHistory(history => [...history, newPosition].slice(-10));
          return { ...prev, current: newPosition };
        }
        return prev;
      });

      // Simulate device load changes
      if (currentDeviceInfo) {
        setDeviceInfo(prev => prev ? {
          ...prev,
          currentLoad: Math.max(0, Math.min(100, prev.currentLoad + (Math.random() - 0.5) * 10)),
          temperature: Math.max(10, prev.temperature + (Math.random() - 0.5) * 0.5)
        } : undefined);
      }

      // Simulate job progress when running
      if (currentJobProgress && currentJobProgress.completedShots < currentJobProgress.shots) {
        setJobProgress(prev => prev ? {
          ...prev,
          completedShots: Math.min(prev.shots, prev.completedShots + Math.floor(Math.random() * 50)),
          progressPercentage: (prev.completedShots / prev.shots) * 100,
          currentOperation: getRandomOperation(),
          estimatedTimeRemaining: Math.max(0, prev.estimatedTimeRemaining - 2)
        } : undefined);
      }
    };

    const interval = setInterval(simulateQueueUpdate, 2000);
    return () => clearInterval(interval);
  }, [currentJobProgress, currentDeviceInfo]);

  const getRandomOperation = () => {
    const operations = [
      'Initializing quantum circuit',
      'Calibrating qubits',
      'Applying quantum gates',
      'Measuring quantum states',
      'Processing results',
      'Optimizing circuit execution',
      'Performing error correction'
    ];
    return operations[Math.floor(Math.random() * operations.length)];
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getPositionTrend = () => {
    const recent = positionHistory.slice(-3);
    if (recent.length < 2) return 'stable';
    const change = recent[recent.length - 1] - recent[0];
    if (change < 0) return 'improving';
    if (change > 0) return 'worsening';
    return 'stable';
  };

  const getPositionIcon = () => {
    const trend = getPositionTrend();
    switch (trend) {
      case 'improving':
        return <ArrowUp className="h-3 w-3 text-green-500" />;
      case 'worsening':
        return <ArrowDown className="h-3 w-3 text-red-500" />;
      default:
        return <Minus className="h-3 w-3 text-yellow-500" />;
    }
  };

  const getQueueStatusColor = () => {
    if (queuePosition.current === 1) return 'text-green-400';
    if (queuePosition.current <= 3) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getDeviceStatusColor = (status: DeviceInfo['status']) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'calibrating': return 'text-yellow-400';
      case 'maintenance': return 'text-orange-400';
      case 'offline': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const isJobRunning = currentJobProgress && currentJobProgress.progressPercentage > 0;

  return (
    <Card className={`quantum-card ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Queue Status
            <AnimatePresence>
              {isConnected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-2 h-2 bg-green-500 rounded-full"
                />
              )}
            </AnimatePresence>
          </div>
          <Badge variant="outline" className={getQueueStatusColor()}>
            Job ID: {jobId}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Queue Position */}
        {!isJobRunning && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {queuePosition.current}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1">
                    {getPositionIcon()}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    Position {queuePosition.current} of {queuePosition.total}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    in execution queue
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-lg font-semibold text-orange-400">
                  <Timer className="h-4 w-4" />
                  {formatTime(queuePosition.estimatedWaitTime)}
                </div>
                <p className="text-xs text-muted-foreground">estimated wait</p>
              </div>
            </div>

            {/* Queue Visualization */}
            <div className="relative">
              <div className="flex gap-2 justify-between">
                {Array.from({ length: queuePosition.total }, (_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-sm font-semibold ${
                      i + 1 === queuePosition.current
                        ? 'border-primary bg-primary/10 text-primary scale-110'
                        : i + 1 < queuePosition.current
                        ? 'border-green-400/50 bg-green-400/10 text-green-400'
                        : 'border-muted/30 bg-muted/5 text-muted-foreground'
                    }`}
                  >
                    {i + 1}
                  </motion.div>
                ))}
              </div>
              <div className="mt-2 text-xs text-muted-foreground text-center">
                Average processing time: {formatTime(queuePosition.averageProcessingTime)}
              </div>
            </div>
          </motion.div>
        )}

        {/* Job Progress (when running) */}
        {isJobRunning && currentJobProgress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-semibold">Job In Progress</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Shots Completed</span>
                <span className="font-semibold">
                  {currentJobProgress.completedShots} / {currentJobProgress.shots}
                </span>
              </div>
              <Progress
                value={currentJobProgress.progressPercentage}
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{currentJobProgress.currentOperation}</span>
                <span>{formatTime(currentJobProgress.estimatedTimeRemaining)} remaining</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Device Information */}
        {currentDeviceInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-semibold">{currentDeviceInfo.name}</h3>
                <Badge variant="outline" className={getDeviceStatusColor(currentDeviceInfo.status)}>
                  {currentDeviceInfo.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-muted/10 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Cpu className="h-3 w-3" />
                  Qubits
                </div>
                <div className="text-xl font-bold text-blue-400">
                  {currentDeviceInfo.qubits}
                </div>
              </div>

              <div className="p-3 bg-muted/10 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="h-3 w-3" />
                  Fidelity
                </div>
                <div className="text-xl font-bold text-green-400">
                  {(currentDeviceInfo.gateFidelity * 100).toFixed(1)}%
                </div>
              </div>

              <div className="p-3 bg-muted/10 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="h-3 w-3" />
                  Load
                </div>
                <div className="text-xl font-bold text-orange-400">
                  {currentDeviceInfo.currentLoad.toFixed(0)}%
                </div>
              </div>

              <div className="p-3 bg-muted/10 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <HardDrive className="h-3 w-3" />
                  Queue
                </div>
                <div className="text-xl font-bold text-purple-400">
                  {currentDeviceInfo.queueSize}
                </div>
              </div>
            </div>

            {/* Device Health Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Device Load</span>
                <span>{currentDeviceInfo.currentLoad.toFixed(0)}%</span>
              </div>
              <Progress
                value={currentDeviceInfo.currentLoad}
                className="h-2"
              />
            </div>

            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Temperature: {currentDeviceInfo.temperature.toFixed(1)} mK</span>
              <span>Throughput: {currentDeviceInfo.throughput} jobs/hr</span>
            </div>
          </motion.div>
        )}

        {/* Alerts and Notifications */}
        <AnimatePresence>
          {queuePosition.current > 5 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-2 p-3 bg-orange-400/10 border border-orange-400/20 rounded-lg"
            >
              <AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-orange-400">High Queue Position</p>
                <p className="text-muted-foreground">
                  You're currently #{queuePosition.current} in queue. Consider upgrading to priority processing for faster execution.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {currentDeviceInfo?.status === 'calibrating' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-2 p-3 bg-yellow-400/10 border border-yellow-400/20 rounded-lg"
            >
              <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-yellow-400">Device Calibration</p>
                <p className="text-muted-foreground">
                  {currentDeviceInfo.name} is currently calibrating. This may increase wait times but ensures optimal accuracy.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}