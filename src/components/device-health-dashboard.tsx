'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  Thermometer,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Cpu,
  HardDrive,
  RefreshCw,
  Settings,
  Download,
  Bell,
  BellOff,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface DeviceQubitMetrics {
  id: number;
  t1Time: number; // Coherence time in microseconds
  t2Time: number; // Dephasing time in microseconds
  gateErrorRate: number; // Single-qubit gate error rate
  twoQubitGateErrorRate: number; // Two-qubit gate error rate
  readoutErrorRate: number; // Measurement error rate
  crosstalkRate: number; // Crosstalk error rate
  temperature: number; // Temperature in millikelvin
  frequency: number; // Qubit frequency in GHz
  connectivity: number[]; // Connected qubit IDs
  calibrationDate: string;
  status: 'active' | 'calibrating' | 'offline' | 'maintenance';
  lastCalibrationScore: number;
}

interface DeviceHealth {
  deviceId: string;
  name: string;
  provider: string;
  status: 'online' | 'offline' | 'maintenance' | 'calibrating';
  qubits: DeviceQubitMetrics[];
  overallFidelity: number;
  averageGateTime: number;
  queueSize: number;
  temperature: number;
  lastCalibration: string;
  nextCalibration: string;
  uptime: number; // Percentage
  throughput: number; // Jobs per hour
  alerts: DeviceAlert[];
}

interface DeviceAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  qubitId?: number;
  acknowledged: boolean;
}

interface DeviceHealthDashboardProps {
  deviceId?: string;
  devices?: DeviceHealth[];
  selectedDevice?: string;
  onDeviceSelect?: (deviceId: string) => void;
  refreshInterval?: number;
  showHistorical?: boolean;
  height?: number;
  interactive?: boolean;
  title?: string;
}

export function DeviceHealthDashboard({
  deviceId,
  devices = [],
  selectedDevice,
  onDeviceSelect,
  refreshInterval = 5000,
  showHistorical = true,
  height = 600,
  interactive = true,
  title = 'Quantum Device Health Monitor'
}: DeviceHealthDashboardProps) {
  const [currentDevices, setCurrentDevices] = useState<DeviceHealth[]>(devices);
  const [selectedDeviceId, setSelectedDeviceId] = useState(selectedDevice || deviceId);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);
  const [alertNotifications, setAlertNotifications] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');

  // Generate sample device data if not provided
  const generateSampleDevices = (): DeviceHealth[] => {
    return [
      {
        deviceId: 'ibm_washington',
        name: 'IBM Washington',
        provider: 'IBM',
        status: 'online',
        qubits: Array.from({ length: 127 }, (_, i) => ({
          id: i,
          t1Time: 100 + Math.random() * 50,
          t2Time: 80 + Math.random() * 40,
          gateErrorRate: 0.001 + Math.random() * 0.002,
          twoQubitGateErrorRate: 0.01 + Math.random() * 0.01,
          readoutErrorRate: 0.02 + Math.random() * 0.02,
          crosstalkRate: 0.001 + Math.random() * 0.003,
          temperature: 15 + Math.random() * 5,
          frequency: 4.5 + Math.random() * 1,
          connectivity: i > 0 ? [i - 1] : [],
          calibrationDate: new Date(Date.now() - 86400000).toISOString(),
          status: Math.random() > 0.1 ? 'active' : 'calibrating',
          lastCalibrationScore: 0.95 + Math.random() * 0.04
        })),
        overallFidelity: 0.95,
        averageGateTime: 40,
        queueSize: 12,
        temperature: 15.2,
        lastCalibration: new Date(Date.now() - 86400000).toISOString(),
        nextCalibration: new Date(Date.now() + 86400000 * 2).toISOString(),
        uptime: 99.8,
        throughput: 45,
        alerts: generateSampleAlerts('ibm_washington')
      },
      {
        deviceId: 'google_willow',
        name: 'Google Willow',
        provider: 'Google',
        status: 'calibrating',
        qubits: Array.from({ length: 72 }, (_, i) => ({
          id: i,
          t1Time: 120 + Math.random() * 60,
          t2Time: 100 + Math.random() * 50,
          gateErrorRate: 0.0008 + Math.random() * 0.001,
          twoQubitGateErrorRate: 0.008 + Math.random() * 0.008,
          readoutErrorRate: 0.015 + Math.random() * 0.015,
          crosstalkRate: 0.0005 + Math.random() * 0.002,
          temperature: 12 + Math.random() * 3,
          frequency: 5.0 + Math.random() * 1.5,
          connectivity: i > 0 ? [i - 1] : [],
          calibrationDate: new Date(Date.now() - 43200000).toISOString(),
          status: 'calibrating',
          lastCalibrationScore: 0.93 + Math.random() * 0.05
        })),
        overallFidelity: 0.97,
        averageGateTime: 25,
        queueSize: 8,
        temperature: 12.8,
        lastCalibration: new Date(Date.now() - 43200000).toISOString(),
        nextCalibration: new Date(Date.now() + 3600000).toISOString(),
        uptime: 98.5,
        throughput: 38,
        alerts: generateSampleAlerts('google_willow')
      },
      {
        deviceId: 'amazon_braket',
        name: 'Amazon Braket',
        provider: 'Amazon',
        status: 'online',
        qubits: Array.from({ length: 32 }, (_, i) => ({
          id: i,
          t1Time: 90 + Math.random() * 40,
          t2Time: 70 + Math.random() * 35,
          gateErrorRate: 0.0015 + Math.random() * 0.0025,
          twoQubitGateErrorRate: 0.012 + Math.random() * 0.012,
          readoutErrorRate: 0.025 + Math.random() * 0.025,
          crosstalkRate: 0.002 + Math.random() * 0.004,
          temperature: 18 + Math.random() * 6,
          frequency: 4.0 + Math.random() * 1.2,
          connectivity: i > 0 ? [i - 1] : [],
          calibrationDate: new Date(Date.now() - 172800000).toISOString(),
          status: Math.random() > 0.05 ? 'active' : 'offline',
          lastCalibrationScore: 0.91 + Math.random() * 0.06
        })),
        overallFidelity: 0.92,
        averageGateTime: 55,
        queueSize: 25,
        temperature: 18.5,
        lastCalibration: new Date(Date.now() - 172800000).toISOString(),
        nextCalibration: new Date(Date.now() + 86400000 * 3).toISOString(),
        uptime: 97.2,
        throughput: 32,
        alerts: generateSampleAlerts('amazon_braket')
      }
    ];
  };

  const generateSampleAlerts = (deviceId: string): DeviceAlert[] => {
    const alerts: DeviceAlert[] = [];

    if (Math.random() > 0.7) {
      alerts.push({
        id: `${deviceId}-1`,
        type: 'warning',
        severity: 'medium',
        title: 'Elevated Temperature',
        message: 'Qubit temperature exceeding optimal range',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        qubitId: Math.floor(Math.random() * 50),
        acknowledged: false
      });
    }

    if (Math.random() > 0.8) {
      alerts.push({
        id: `${deviceId}-2`,
        type: 'error',
        severity: 'high',
        title: 'Gate Fidelity Degradation',
        message: 'Two-qubit gate error rate above threshold',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        qubitId: Math.floor(Math.random() * 50),
        acknowledged: false
      });
    }

    return alerts;
  };

  // Initialize devices if not provided
  useEffect(() => {
    if (devices.length === 0) {
      setCurrentDevices(generateSampleDevices());
    } else {
      setCurrentDevices(devices);
    }
  }, [devices]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshDeviceData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const refreshDeviceData = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (devices.length === 0) {
        setCurrentDevices(generateSampleDevices());
      }
    } catch (error) {
      console.error('Failed to refresh device data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeviceSelect = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    onDeviceSelect?.(deviceId);
  };

  const selectedDeviceData = currentDevices.find(d => d.deviceId === selectedDeviceId);

  const getStatusColor = (status: DeviceHealth['status']) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'calibrating': return 'text-yellow-400';
      case 'maintenance': return 'text-orange-400';
      case 'offline': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: DeviceHealth['status']) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4" />;
      case 'calibrating': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'maintenance': return <Settings className="h-4 w-4" />;
      case 'offline': return <XCircle className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: DeviceAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-500/10';
      case 'high': return 'border-orange-500 bg-orange-500/10';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10';
      case 'low': return 'border-blue-500 bg-blue-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  return (
    <Card className="quantum-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            {title}
            {autoRefresh && (
              <motion.div
                className="w-2 h-2 bg-green-500 rounded-full"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={refreshDeviceData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAlerts(!showAlerts)}
            >
              <AlertTriangle className="h-3 w-3" />
              {showAlerts && currentDevices.reduce((sum, d) => sum + d.alerts.length, 0) > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">
                  {currentDevices.reduce((sum, d) => sum + d.alerts.length, 0)}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Device Selection */}
        <div className="flex gap-2 flex-wrap">
          {currentDevices.map(device => (
            <Button
              key={device.deviceId}
              variant={selectedDeviceId === device.deviceId ? "default" : "outline"}
              size="sm"
              onClick={() => handleDeviceSelect(device.deviceId)}
              className="flex items-center gap-2"
            >
              {getStatusIcon(device.status)}
              <span className="hidden sm:inline">{device.name}</span>
              <span className="sm:hidden">{device.name.split(' ')[0]}</span>
              <Badge variant="outline" className={getStatusColor(device.status)}>
                {device.status}
              </Badge>
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Device Overview */}
          <div className="lg:col-span-2 space-y-6">
            {selectedDeviceData ? (
              <>
                {/* Device Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted/10 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Cpu className="h-3 w-3" />
                      Overall Fidelity
                    </div>
                    <div className="text-2xl font-bold text-green-400">
                      {(selectedDeviceData.overallFidelity * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {selectedDeviceData.qubits.length} qubits
                    </div>
                  </div>

                  <div className="p-4 bg-muted/10 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Thermometer className="h-3 w-3" />
                      Temperature
                    </div>
                    <div className="text-2xl font-bold text-blue-400">
                      {selectedDeviceData.temperature.toFixed(1)} mK
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Optimal: &lt;15 mK
                    </div>
                  </div>

                  <div className="p-4 bg-muted/10 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <HardDrive className="h-3 w-3" />
                      Queue Size
                    </div>
                    <div className="text-2xl font-bold text-orange-400">
                      {selectedDeviceData.queueSize}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {selectedDeviceData.throughput} jobs/hr
                    </div>
                  </div>

                  <div className="p-4 bg-muted/10 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Zap className="h-3 w-3" />
                      Uptime
                    </div>
                    <div className="text-2xl font-bold text-purple-400">
                      {selectedDeviceData.uptime.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Last 24h
                    </div>
                  </div>
                </div>

                {/* Qubit Health Grid */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Qubit Health Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                    {selectedDeviceData.qubits.slice(0, 20).map(qubit => (
                      <motion.div
                        key={qubit.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: qubit.id * 0.01 }}
                        className="p-3 bg-muted/10 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Q{qubit.id}</span>
                          <Badge
                            variant="outline"
                            className={
                              qubit.status === 'active' ? 'text-green-400 border-green-400/50' :
                              qubit.status === 'calibrating' ? 'text-yellow-400 border-yellow-400/50' :
                              'text-red-400 border-red-400/50'
                            }
                          >
                            {qubit.status}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">T₁:</span>
                            <span>{qubit.t1Time.toFixed(1)} μs</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">T₂:</span>
                            <span>{qubit.t2Time.toFixed(1)} μs</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Gate Error:</span>
                            <span className={qubit.gateErrorRate > 0.002 ? 'text-red-400' : 'text-green-400'}>
                              {(qubit.gateErrorRate * 100).toFixed(3)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Calibration:</span>
                            <span>{(qubit.lastCalibrationScore * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {selectedDeviceData.qubits.length > 20 && (
                    <div className="text-center text-sm text-muted-foreground">
                      Showing 20 of {selectedDeviceData.qubits.length} qubits
                    </div>
                  )}
                </div>

                {/* Historical Trends */}
                {showHistorical && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Performance Trends</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-muted/10 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Fidelity Trend</span>
                          <TrendingUp className="h-4 w-4 text-green-400" />
                        </div>
                        <div className="text-lg font-bold text-green-400">+2.3%</div>
                        <div className="text-xs text-muted-foreground">Last 7 days</div>
                      </div>

                      <div className="p-4 bg-muted/10 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Error Rate Trend</span>
                          <TrendingDown className="h-4 w-4 text-green-400" />
                        </div>
                        <div className="text-lg font-bold text-green-400">-1.8%</div>
                        <div className="text-xs text-muted-foreground">Last 7 days</div>
                      </div>

                      <div className="p-4 bg-muted/10 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Throughput Trend</span>
                          <Minus className="h-4 w-4 text-yellow-400" />
                        </div>
                        <div className="text-lg font-bold text-yellow-400">0.0%</div>
                        <div className="text-xs text-muted-foreground">Last 7 days</div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Activity className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                  Select a Device
                </h3>
                <p className="text-muted-foreground">
                  Choose a quantum device to view detailed health metrics
                </p>
              </div>
            )}
          </div>

          {/* Alerts Panel */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Active Alerts</h3>
              {currentDevices.reduce((sum, d) => sum + d.alerts.length, 0) > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  {currentDevices.reduce((sum, d) => sum + d.alerts.length, 0)}
                </Badge>
              )}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {currentDevices.flatMap(device =>
                device.alerts.map(alert => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{alert.title}</span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {alert.message}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {device.name} {alert.qubitId && `(Q${alert.qubitId})`}
                          </span>
                          <span className="text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}

              {currentDevices.reduce((sum, d) => sum + d.alerts.length, 0) === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No active alerts</p>
                </div>
              )}
            </div>

            {/* Calibration Schedule */}
            <div className="space-y-3">
              <h4 className="font-semibold">Upcoming Calibrations</h4>
              {currentDevices
                .filter(device => new Date(device.nextCalibration) > new Date())
                .sort((a, b) => new Date(a.nextCalibration).getTime() - new Date(b.nextCalibration).getTime())
                .slice(0, 3)
                .map(device => {
                  const nextCalib = new Date(device.nextCalibration);
                  const hoursUntil = Math.floor((nextCalib.getTime() - Date.now()) / (1000 * 60 * 60));

                  return (
                    <div key={device.deviceId} className="p-3 bg-muted/10 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{device.name}</span>
                        <Badge variant="outline">
                          {hoursUntil > 24 ? `${Math.floor(hoursUntil / 24)}d` : `${hoursUntil}h`}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {nextCalib.toLocaleDateString()} at {nextCalib.toLocaleTimeString()}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}