'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Grid3x3,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Settings,
  Download,
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Eye,
  Info,
  Filter
} from 'lucide-react';

interface QubitNode {
  id: number;
  x: number;
  y: number;
  status: 'active' | 'calibrating' | 'offline' | 'maintenance';
  fidelity: number;
  t1Time: number;
  t2Time: number;
  errorRate: number;
  temperature: number;
  connectivity: number[];
  lastCalibration: string;
  gateCount: number;
}

interface QubitConnection {
  source: number;
  target: number;
  strength: number;
  type: 'direct' | 'coupler' | 'resonator';
}

interface QubitStatusMapProps {
  qubits: QubitNode[];
  connections: QubitConnection[];
  selectedQubit?: number;
  onQubitSelect?: (qubitId: number) => void;
  filterStatus?: string[];
  showConnections?: boolean;
  interactive?: boolean;
  height?: number;
  deviceTopology?: 'square' | 'hexagonal' | 'linear' | 'custom';
  title?: string;
}

export function QubitStatusMap({
  qubits = [],
  connections = [],
  selectedQubit,
  onQubitSelect,
  filterStatus = ['active', 'calibrating', 'offline', 'maintenance'],
  showConnections = true,
  interactive = true,
  height = 500,
  deviceTopology = 'square',
  title = 'Quantum Qubit Status Map'
}: QubitStatusMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [filteredQubits, setFilteredQubits] = useState<QubitNode[]>(qubits);
  const [hoveredQubit, setHoveredQubit] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [showLabels, setShowLabels] = useState(true);
  const [showMetrics, setShowMetrics] = useState(true);
  const [colorScheme, setColorScheme] = useState('status');
  const [fidelityThreshold, setFidelityThreshold] = useState(0.8);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Generate sample qubit data if not provided
  const generateSampleQubits = (): QubitNode[] => {
    const size = 9; // 9x9 grid for 81 qubits
    const sampleQubits: QubitNode[] = [];

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const id = row * size + col;
        const statusOptions: QubitNode['status'][] = ['active', 'active', 'active', 'calibrating', 'offline'];
        const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];

        sampleQubits.push({
          id,
          x: col * 50,
          y: row * 50,
          status,
          fidelity: 0.85 + Math.random() * 0.14,
          t1Time: 80 + Math.random() * 60,
          t2Time: 60 + Math.random() * 40,
          errorRate: 0.001 + Math.random() * 0.004,
          temperature: 12 + Math.random() * 8,
          connectivity: generateConnectivity(id, size),
          lastCalibration: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
          gateCount: Math.floor(Math.random() * 100000)
        });
      }
    }

    return sampleQubits;
  };

  const generateConnectivity = (id: number, size: number): number[] => {
    const connections: number[] = [];
    const row = Math.floor(id / size);
    const col = id % size;

    // Add adjacent qubits
    if (row > 0) connections.push(id - size); // Top
    if (row < size - 1) connections.push(id + size); // Bottom
    if (col > 0) connections.push(id - 1); // Left
    if (col < size - 1) connections.push(id + 1); // Right

    return connections;
  };

  const generateSampleConnections = (): QubitConnection[] => {
    if (qubits.length === 0) return [];

    const sampleConnections: QubitConnection[] = [];
    const size = Math.sqrt(qubits.length);

    qubits.forEach(qubit => {
      qubit.connectivity.forEach(targetId => {
        if (targetId < qubits.length && targetId > qubit.id) {
          sampleConnections.push({
            source: qubit.id,
            target: targetId,
            strength: 0.7 + Math.random() * 0.3,
            type: 'direct'
          });
        }
      });
    });

    return sampleConnections;
  };

  // Initialize data
  useEffect(() => {
    if (qubits.length === 0) {
      const sampleQubits = generateSampleQubits();
      setFilteredQubits(sampleQubits.filter(q => filterStatus.includes(q.status)));
    } else {
      setFilteredQubits(qubits.filter(q => filterStatus.includes(q.status)));
    }
  }, [qubits, filterStatus]);

  // Apply filters
  useEffect(() => {
    if (qubits.length > 0) {
      setFilteredQubits(
        qubits.filter(q =>
          filterStatus.includes(q.status) && q.fidelity >= fidelityThreshold
        )
      );
    }
  }, [qubits, filterStatus, fidelityThreshold]);

  // Draw the qubit map
  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Apply transformations
    ctx.save();
    ctx.translate(width / 2 + panOffset.x, height / 2 + panOffset.y);
    ctx.scale(zoomLevel, zoomLevel);

    // Draw connections
    if (showConnections) {
      const connectionsToShow = connections.length > 0 ? connections : generateSampleConnections();

      connectionsToShow.forEach(connection => {
        const sourceQubit = filteredQubits.find(q => q.id === connection.source);
        const targetQubit = filteredQubits.find(q => q.id === connection.target);

        if (sourceQubit && targetQubit) {
          const gradient = ctx.createLinearGradient(
            sourceQubit.x, sourceQubit.y,
            targetQubit.x, targetQubit.y
          );

          const alpha = 0.2 + connection.strength * 0.3;
          gradient.addColorStop(0, `rgba(139, 92, 246, ${alpha})`);
          gradient.addColorStop(1, `rgba(59, 130, 246, ${alpha})`);

          ctx.strokeStyle = gradient;
          ctx.lineWidth = Math.max(1, connection.strength * 3);
          ctx.beginPath();
          ctx.moveTo(sourceQubit.x, sourceQubit.y);
          ctx.lineTo(targetQubit.x, targetQubit.y);
          ctx.stroke();
        }
      });
    }

    // Draw qubits
    filteredQubits.forEach(qubit => {
      const isHovered = qubit.id === hoveredQubit;
      const isSelected = qubit.id === selectedQubit;

      // Determine qubit color based on color scheme
      let color = getStatusColor(qubit.status);
      if (colorScheme === 'fidelity') {
        color = getFidelityColor(qubit.fidelity);
      } else if (colorScheme === 'error') {
        color = getErrorColor(qubit.errorRate);
      }

      // Draw qubit shadow/glow when hovered
      if (isHovered || isSelected) {
        const shadowGradient = ctx.createRadialGradient(
          qubit.x, qubit.y, 0,
          qubit.x, qubit.y, 25
        );
        shadowGradient.addColorStop(0, color + '40');
        shadowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = shadowGradient;
        ctx.fillRect(qubit.x - 25, qubit.y - 25, 50, 50);
      }

      // Draw qubit circle
      ctx.fillStyle = color;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(qubit.x, qubit.y, isHovered || isSelected ? 12 : 8, 0, Math.PI * 2);
      ctx.fill();

      // Draw qubit border
      ctx.strokeStyle = isSelected ? '#FFFFFF' : (color + '80');
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.stroke();

      // Draw qubit label
      if (showLabels) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = isHovered || isSelected ? 'bold 10px sans-serif' : '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Q${qubit.id}`, qubit.x, qubit.y - 15);

        // Show metrics if enabled
        if (showMetrics && (isHovered || isSelected)) {
          ctx.globalAlpha = 0.8;
          ctx.font = '8px sans-serif';
          ctx.fillText(`F: ${(qubit.fidelity * 100).toFixed(1)}%`, qubit.x, qubit.y + 20);
          if (qubit.errorRate > 0.002) {
            ctx.fillStyle = '#EF4444';
            ctx.fillText(`E: ${(qubit.errorRate * 100).toFixed(3)}%`, qubit.x, qubit.y + 30);
          }
        }
      }
    });

    ctx.restore();
  }, [
    filteredQubits,
    connections,
    hoveredQubit,
    selectedQubit,
    zoomLevel,
    panOffset,
    showConnections,
    showLabels,
    showMetrics,
    colorScheme
  ]);

  // Drawing effect
  useEffect(() => {
    drawMap();
  }, [drawMap]);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement;
        if (container) {
          canvasRef.current.width = container.clientWidth;
          canvasRef.current.height = container.clientHeight;
          drawMap();
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawMap]);

  // Mouse interaction handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Transform to canvas coordinates
    const canvasX = (x - canvas.width / 2 - panOffset.x) / zoomLevel;
    const canvasY = (y - canvas.height / 2 - panOffset.y) / zoomLevel;

    if (isPanning) {
      setPanOffset({
        x: panOffset.x + (e.clientX - panStart.x),
        y: panOffset.y + (e.clientY - panStart.y)
      });
      setPanStart({ x: e.clientX, y: e.clientY });
    } else {
      // Check if hovering over a qubit
      let hoveredQubitId: number | null = null;

      filteredQubits.forEach(qubit => {
        const distance = Math.sqrt((canvasX - qubit.x) ** 2 + (canvasY - qubit.y) ** 2);
        if (distance < 15) {
          hoveredQubitId = qubit.id;
        }
      });

      setHoveredQubit(hoveredQubitId);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return;

    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive || isPanning) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const canvasX = (x - canvas.width / 2 - panOffset.x) / zoomLevel;
    const canvasY = (y - canvas.height / 2 - panOffset.y) / zoomLevel;

    filteredQubits.forEach(qubit => {
      const distance = Math.sqrt((canvasX - qubit.x) ** 2 + (canvasY - qubit.y) ** 2);
      if (distance < 15) {
        onQubitSelect?.(qubit.id);
      }
    });
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (!interactive) return;

    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoomLevel(prev => Math.max(0.5, Math.min(3, prev * delta)));
  };

  const exportMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `qubit-status-map-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const getStatusColor = (status: QubitNode['status']): string => {
    switch (status) {
      case 'active': return '#10B981';
      case 'calibrating': return '#F59E0B';
      case 'maintenance': return '#8B5CF6';
      case 'offline': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getFidelityColor = (fidelity: number): string => {
    if (fidelity >= 0.95) return '#10B981';
    if (fidelity >= 0.90) return '#F59E0B';
    if (fidelity >= 0.85) return '#F97316';
    return '#EF4444';
  };

  const getErrorColor = (errorRate: number): string => {
    if (errorRate <= 0.001) return '#10B981';
    if (errorRate <= 0.002) return '#F59E0B';
    if (errorRate <= 0.003) return '#F97316';
    return '#EF4444';
  };

  const displayConnections = connections.length > 0 ? connections : generateSampleConnections();
  const hoveredQubitData = filteredQubits.find(q => q.id === hoveredQubit);
  const selectedQubitData = filteredQubits.find(q => q.id === selectedQubit);

  return (
    <Card className="quantum-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="h-5 w-5 text-primary" />
            {title}
            <Badge variant="outline">
              {filteredQubits.length} Qubits
            </Badge>
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.2))}
              disabled={zoomLevel <= 0.5}
            >
              <ZoomOut className="h-3 w-3" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.2))}
              disabled={zoomLevel >= 3}
            >
              <ZoomIn className="h-3 w-3" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={resetView}
            >
              <Maximize2 className="h-3 w-3" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={exportMap}
            >
              <Download className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          {['active', 'calibrating', 'offline', 'maintenance'].map(status => (
            <Button
              key={status}
              variant={filterStatus.includes(status) ? "default" : "outline"}
              size="sm"
              onClick={() => {
                const newFilters = filterStatus.includes(status)
                  ? filterStatus.filter(s => s !== status)
                  : [...filterStatus, status];
                // This would update the parent component
              }}
              className="flex items-center gap-1"
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getStatusColor(status as QubitNode['status']) }}
              />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConnections(!showConnections)}
          >
            <Activity className="h-3 w-3 mr-1" />
            Connections
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLabels(!showLabels)}
          >
            <Eye className="h-3 w-3 mr-1" />
            Labels
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Qubit Map Canvas */}
        <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg overflow-hidden mb-4">
          <canvas
            ref={canvasRef}
            width={800}
            height={height}
            className="w-full cursor-move"
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleClick}
            onWheel={handleWheel}
          />

          {/* Zoom indicator */}
          <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
            Zoom: {(zoomLevel * 100).toFixed(0)}%
          </div>

          {/* Interactive hint */}
          {interactive && (
            <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
              Scroll to zoom • Drag to pan • Click qubits to select
            </div>
          )}
        </div>

        {/* Qubit Information Panel */}
        <AnimatePresence>
          {(selectedQubitData || hoveredQubitData) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-muted/10 rounded-lg"
            >
              <h4 className="font-semibold mb-3">
                Qubit {selectedQubitData?.id || hoveredQubitData?.id} Details
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getStatusColor((selectedQubitData || hoveredQubitData)!.status) }}
                    />
                    <span className="capitalize">{(selectedQubitData || hoveredQubitData)!.status}</span>
                  </div>
                </div>

                <div>
                  <span className="text-sm text-muted-foreground">Fidelity:</span>
                  <div className="font-mono">
                    {((selectedQubitData || hoveredQubitData)!.fidelity * 100).toFixed(1)}%
                  </div>
                </div>

                <div>
                  <span className="text-sm text-muted-foreground">Error Rate:</span>
                  <div className="font-mono">
                    {((selectedQubitData || hoveredQubitData)!.errorRate * 100).toFixed(3)}%
                  </div>
                </div>

                <div>
                  <span className="text-sm text-muted-foreground">Temperature:</span>
                  <div className="font-mono">
                    {(selectedQubitData || hoveredQubitData)!.temperature.toFixed(1)} mK
                  </div>
                </div>

                <div>
                  <span className="text-sm text-muted-foreground">T₁ Time:</span>
                  <div className="font-mono">
                    {(selectedQubitData || hoveredQubitData)!.t1Time.toFixed(0)} μs
                  </div>
                </div>

                <div>
                  <span className="text-sm text-muted-foreground">T₂ Time:</span>
                  <div className="font-mono">
                    {(selectedQubitData || hoveredQubitData)!.t2Time.toFixed(0)} μs
                  </div>
                </div>

                <div>
                  <span className="text-sm text-muted-foreground">Gate Count:</span>
                  <div className="font-mono">
                    {(selectedQubitData || hoveredQubitData)!.gateCount.toLocaleString()}
                  </div>
                </div>

                <div>
                  <span className="text-sm text-muted-foreground">Connections:</span>
                  <div className="font-mono">
                    {(selectedQubitData || hoveredQubitData)!.connectivity.length}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Statistics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-muted/10 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-400">
              {filteredQubits.filter(q => q.status === 'active').length}
            </div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>

          <div className="p-3 bg-muted/10 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {filteredQubits.filter(q => q.status === 'calibrating').length}
            </div>
            <div className="text-xs text-muted-foreground">Calibrating</div>
          </div>

          <div className="p-3 bg-muted/10 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-400">
              {(filteredQubits.reduce((sum, q) => sum + q.fidelity, 0) / filteredQubits.length * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Avg Fidelity</div>
          </div>

          <div className="p-3 bg-muted/10 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-400">
              {displayConnections.length}
            </div>
            <div className="text-xs text-muted-foreground">Connections</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}