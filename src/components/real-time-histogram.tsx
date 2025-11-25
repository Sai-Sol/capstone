'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Download,
  Pause,
  Play,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Settings
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  ReferenceLine
} from 'recharts';

interface MeasurementData {
  state: string;
  count: number;
  probability: number;
  color?: string;
}

interface RealTimeHistogramProps {
  jobId: string;
  initialData?: MeasurementData[];
  totalShots?: number;
  completedShots?: number;
  isLive?: boolean;
  height?: number;
  showControls?: boolean;
  animationDuration?: number;
}

export function RealTimeHistogram({
  jobId,
  initialData = [],
  totalShots = 1024,
  completedShots = 0,
  isLive = true,
  height = 400,
  showControls = true,
  animationDuration = 500
}: RealTimeHistogramProps) {
  const [data, setData] = useState<MeasurementData[]>(initialData);
  const [isPaused, setIsPaused] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedStates, setSelectedStates] = useState<Set<string>>(new Set());
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [colorScheme, setColorScheme] = useState('quantum');

  const animationRef = useRef<number>();
  const previousDataRef = useRef<MeasurementData[]>(initialData);

  // Quantum state color schemes
  const colorSchemes = {
    quantum: ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899'],
    viridis: ['#440154', '#482173', '#404387', '#31668E', '#238A8D', '#2A9D8F'],
    plasma: ['#0D0887', '#41049D', '#6A00A8', '#8F0DA4', '#B12A90', '#CC4678'],
    rainbow: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#8B00FF']
  };

  // Update data with smooth animation
  const updateData = useCallback((newData: MeasurementData[]) => {
    if (isPaused) return;

    const startTime = Date.now();
    const animate = () => {
      const progress = Math.min((Date.now() - startTime) / animationDuration, 1);

      // Easing function for smooth animation
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOutCubic(progress);

      // Interpolate between previous and new data
      const interpolatedData = newData.map((newItem, index) => {
        const oldItem = previousDataRef.current[index] || { count: 0, probability: 0 };
        return {
          ...newItem,
          count: Math.round(oldItem.count + (newItem.count - oldItem.count) * easedProgress),
          probability: oldItem.probability + (newItem.probability - oldItem.probability) * easedProgress
        };
      });

      setData(interpolatedData);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        previousDataRef.current = newData;
      }
    };

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    animate();
  }, [isPaused, animationDuration]);

  // Handle WebSocket updates
  useEffect(() => {
    if (!isLive) return;

    // This would connect to WebSocket for real-time updates
    // For now, simulate streaming updates
    const simulateUpdate = () => {
      if (isPaused || completedShots >= totalShots) return;

      const newData = data.map((item, index) => {
        const increment = Math.floor(Math.random() * 5);
        return {
          ...item,
          count: item.count + increment,
          probability: ((item.count + increment) / totalShots) * 100
        };
      });

      // Normalize to total shots
      const currentTotal = newData.reduce((sum, item) => sum + item.count, 0);
      if (currentTotal > 0) {
        const normalizedData = newData.map(item => ({
          ...item,
          probability: (item.count / currentTotal) * 100
        }));
        updateData(normalizedData);
      }
    };

    if (isLive && !isPaused) {
      const interval = setInterval(simulateUpdate, 1000 / animationSpeed);
      return () => clearInterval(interval);
    }
  }, [isLive, isPaused, data, updateData, animationSpeed, completedShots, totalShots]);

  // Add colors to data
  const coloredData = data.map((item, index) => ({
    ...item,
    color: item.color || colorSchemes[colorScheme as keyof typeof colorSchemes][index % colorSchemes[colorScheme as keyof typeof colorSchemes].length]
  }));

  // Filter data based on selected states
  const filteredData = selectedStates.size > 0
    ? coloredData.filter(item => selectedStates.has(item.state))
    : coloredData;

  // Zoom functionality
  const displayData = filteredData.map(item => ({
    ...item,
    count: item.count * zoomLevel,
    probability: item.probability * zoomLevel
  }));

  const handleDownload = () => {
    const exportData = {
      jobId,
      timestamp: new Date().toISOString(),
      totalShots,
      completedShots,
      measurements: data,
      statistics: {
        entropy: calculateEntropy(data),
        purity: calculatePurity(data),
        mostProbableState: data.reduce((max, item) =>
          item.probability > max.probability ? item : max, data[0])?.state
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `histogram-${jobId}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const calculateEntropy = (measurements: MeasurementData[]) => {
    return measurements.reduce((entropy, item) => {
      const p = item.probability / 100;
      return p > 0 ? entropy - p * Math.log2(p) : entropy;
    }, 0);
  };

  const calculatePurity = (measurements: MeasurementData[]) => {
    return Math.max(...measurements.map(item => item.probability / 100));
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background border border-border rounded-lg p-3 shadow-lg"
        >
          <p className="font-mono font-semibold">|{data.state}⟩</p>
          <p className="text-sm">Count: {data.count}</p>
          <p className="text-sm">Probability: {data.probability.toFixed(2)}%</p>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <Card className="quantum-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Real-Time Measurement Histogram
            {isLive && (
              <motion.div
                className="w-2 h-2 bg-green-500 rounded-full"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </CardTitle>

          {showControls && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
                disabled={zoomLevel <= 0.5}
              >
                <ZoomOut className="h-3 w-3" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
                disabled={zoomLevel >= 2}
              >
                <ZoomIn className="h-3 w-3" />
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
                onClick={handleDownload}
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress: {Math.round((completedShots / totalShots) * 100)}%</span>
            <span>{completedShots} / {totalShots} shots</span>
          </div>
          <div className="w-full h-2 bg-muted/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-purple-400"
              initial={{ width: 0 }}
              animate={{ width: `${(completedShots / totalShots) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
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
                  <label className="text-sm font-medium">Animation Speed</label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.5"
                    value={animationSpeed}
                    onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                    className="w-full mt-1"
                  />
                  <span className="text-xs text-muted-foreground">{animationSpeed}x</span>
                </div>

                <div>
                  <label className="text-sm font-medium">Color Scheme</label>
                  <select
                    value={colorScheme}
                    onChange={(e) => setColorScheme(e.target.value)}
                    className="w-full mt-1 p-2 rounded border border-border bg-background"
                  >
                    <option value="quantum">Quantum</option>
                    <option value="viridis">Viridis</option>
                    <option value="plasma">Plasma</option>
                    <option value="rainbow">Rainbow</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Zoom Level</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoomLevel(1)}
                    >
                      Reset
                    </Button>
                    <span className="text-sm">{(zoomLevel * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Histogram Chart */}
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={displayData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
            <XAxis
              dataKey="state"
              tick={{ fill: 'currentColor' }}
              axisLine={{ stroke: 'currentColor' }}
            />
            <YAxis
              tick={{ fill: 'currentColor' }}
              axisLine={{ stroke: 'currentColor' }}
              label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />

            {zoomLevel !== 1 && (
              <ReferenceLine
                y={100}
                stroke="currentColor"
                strokeDasharray="3 3"
                opacity={0.5}
                label={{ value: "100%", position: "right" }}
              />
            )}

            <Bar
              dataKey="probability"
              radius={[8, 8, 0, 0]}
              animationDuration={300}
              animationEasing="ease-out"
            >
              {displayData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-muted/10 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {data.length}
            </div>
            <div className="text-xs text-muted-foreground">States</div>
          </div>
          <div className="p-3 bg-muted/10 rounded-lg">
            <div className="text-2xl font-bold text-green-400">
              {calculateEntropy(data).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">Entropy</div>
          </div>
          <div className="p-3 bg-muted/10 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">
              {(calculatePurity(data) * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Purity</div>
          </div>
          <div className="p-3 bg-muted/10 rounded-lg">
            <div className="text-2xl font-bold text-orange-400">
              {Math.round((completedShots / totalShots) * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">Complete</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}