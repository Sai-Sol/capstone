'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  RotateCcw,
  Play,
  Pause,
  Settings,
  Download,
  Maximize2,
  Grid3x3,
  Move3d,
  Eye,
  Info
} from 'lucide-react';

interface BlochSphereState {
  theta: number; // Polar angle (0 to π)
  phi: number;   // Azimuthal angle (0 to 2π)
  label: string;
  color: string;
  probability?: number;
}

interface BlochSphereProps {
  states: BlochSphereState[];
  selectedState?: number;
  onStateSelect?: (index: number) => void;
  isAnimated?: boolean;
  animationSpeed?: number;
  showControls?: boolean;
  showAxes?: boolean;
  showGrid?: boolean;
  rotation?: { x: number; y: number; z: number };
  height?: number;
  interactive?: boolean;
  title?: string;
}

export function BlochSphere({
  states = [],
  selectedState,
  onStateSelect,
  isAnimated = false,
  animationSpeed = 1,
  showControls = true,
  showAxes = true,
  showGrid = false,
  rotation = { x: -20, y: 45, z: 0 },
  height = 400,
  interactive = true,
  title = 'Quantum State Visualization'
}: BlochSphereProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRotating, setIsRotating] = useState(isAnimated);
  const [currentRotation, setCurrentRotation] = useState(rotation);
  const [hoveredState, setHoveredState] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [sphereOpacity, setSphereOpacity] = useState(0.3);
  const animationRef = useRef<number>();

  // Draw Bloch sphere
  const drawBlochSphere = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Save context state
    ctx.save();

    // Apply rotation
    ctx.translate(centerX, centerY);

    // Draw sphere outline
    ctx.strokeStyle = '#8B5CF6';
    ctx.lineWidth = 2;
    ctx.globalAlpha = sphereOpacity;

    // Main circle
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw latitude and longitude lines (if grid is enabled)
    if (showGrid) {
      ctx.strokeStyle = '#8B5CF6';
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 0.2;

      // Latitude lines
      for (let lat = -60; lat <= 60; lat += 30) {
        const latRad = (lat * Math.PI) / 180;
        const y = radius * Math.sin(latRad);
        const r = radius * Math.cos(latRad);

        ctx.beginPath();
        ctx.ellipse(0, y, r, r * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Longitude lines
      for (let lon = 0; lon < 360; lon += 30) {
        const lonRad = (lon * Math.PI) / 180;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * Math.cos(lonRad), radius, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Reset alpha for main drawing
    ctx.globalAlpha = 1;

    // Draw axes (if enabled)
    if (showAxes) {
      // Z-axis (vertical)
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -radius * 1.2);
      ctx.lineTo(0, radius * 1.2);
      ctx.stroke();
      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('|0⟩', 5, -radius * 1.2);
      ctx.fillText('|1⟩', 5, radius * 1.2);

      // X-axis (horizontal)
      ctx.strokeStyle = '#10B981';
      ctx.beginPath();
      ctx.moveTo(-radius * 1.2, 0);
      ctx.lineTo(radius * 1.2, 0);
      ctx.stroke();
      ctx.fillStyle = '#10B981';
      ctx.fillText('X', radius * 1.2 + 5, 5);

      // Y-axis (diagonal)
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-radius * 0.8, -radius * 0.8);
      ctx.lineTo(radius * 0.8, radius * 0.8);
      ctx.stroke();
      ctx.fillStyle = '#F59E0B';
      ctx.fillText('Y', radius * 0.8 + 5, radius * 0.8 + 5);
    }

    // Draw quantum states
    states.forEach((state, index) => {
      const { theta, phi, color, label } = state;

      // Convert spherical to Cartesian coordinates
      const x = radius * Math.sin(theta) * Math.cos(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(theta);

      // Apply rotation to make it 3D-looking
      const rotY = (currentRotation.y * Math.PI) / 180;
      const rotX = (currentRotation.x * Math.PI) / 180;

      const rotatedX = x * Math.cos(rotY) - z * Math.sin(rotY);
      const rotatedZ = x * Math.sin(rotY) + z * Math.cos(rotY);
      const rotatedY = y * Math.cos(rotX) - rotatedZ * Math.sin(rotX);

      // Project to 2D (simple orthographic projection)
      const projX = rotatedX;
      const projY = -rotatedY; // Negative because canvas Y increases downward

      // Draw state vector from origin
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(projX, projY);
      ctx.stroke();

      // Draw state point
      const isSelected = index === selectedState;
      const isHovered = index === hoveredState;

      ctx.globalAlpha = 1;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(projX, projY, isSelected ? 8 : (isHovered ? 6 : 5), 0, Math.PI * 2);
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(projX, projY, 10, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw label (if enabled)
      if (showLabels && label) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px sans-serif';
        ctx.fillText(label, projX + 10, projY - 5);

        if (state.probability !== undefined) {
          ctx.globalAlpha = 0.7;
          ctx.font = '10px sans-serif';
          ctx.fillText(`${(state.probability * 100).toFixed(1)}%`, projX + 10, projY + 10);
          ctx.globalAlpha = 1;
        }
      }
    });

    ctx.restore();
  }, [states, selectedState, hoveredState, showAxes, showGrid, showLabels, sphereOpacity, currentRotation]);

  // Animation loop
  useEffect(() => {
    if (isRotating) {
      const animate = () => {
        setCurrentRotation(prev => ({
          ...prev,
          y: (prev.y + animationSpeed) % 360
        }));
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRotating, animationSpeed]);

  // Draw whenever state changes
  useEffect(() => {
    drawBlochSphere();
  }, [drawBlochSphere]);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement;
        if (container) {
          canvasRef.current.width = container.clientWidth;
          canvasRef.current.height = container.clientHeight;
          drawBlochSphere();
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawBlochSphere]);

  // Mouse interaction handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - canvas.width / 2;
    const y = e.clientY - rect.top - canvas.height / 2;

    // Check if hovering over a state point
    const radius = Math.min(canvas.width, canvas.height) / 3;
    let hoveredIndex: number | null = null;

    states.forEach((state, index) => {
      const { theta, phi } = state;
      const px = radius * Math.sin(theta) * Math.cos(phi);
      const py = radius * Math.sin(theta) * Math.sin(phi);
      const pz = radius * Math.cos(theta);

      // Apply rotation
      const rotY = (currentRotation.y * Math.PI) / 180;
      const rotX = (currentRotation.x * Math.PI) / 180;

      const rotatedX = px * Math.cos(rotY) - pz * Math.sin(rotY);
      const rotatedZ = px * Math.sin(rotY) + pz * Math.cos(rotY);
      const rotatedY = py * Math.cos(rotX) - rotatedZ * Math.sin(rotX);

      const projX = rotatedX;
      const projY = -rotatedY;

      const distance = Math.sqrt((x - projX) ** 2 + (y - projY) ** 2);
      if (distance < 10) {
        hoveredIndex = index;
      }
    });

    setHoveredState(hoveredIndex);

    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      setCurrentRotation(prev => ({
        ...prev,
        y: (prev.y + deltaX * 0.5) % 360,
        x: Math.max(-90, Math.min(90, prev.x - deltaY * 0.5))
      }));

      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive || !onStateSelect || hoveredState === null) return;
    onStateSelect(hoveredState);
  };

  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `bloch-sphere-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const resetView = () => {
    setCurrentRotation(rotation);
    setIsRotating(isAnimated);
  };

  // Common quantum states for demo
  const commonStates = [
    { theta: 0, phi: 0, label: '|0⟩', color: '#10B981' },
    { theta: Math.PI, phi: 0, label: '|1⟩', color: '#EF4444' },
    { theta: Math.PI / 2, phi: 0, label: '|+⟩', color: '#8B5CF6' },
    { theta: Math.PI / 2, phi: Math.PI / 2, label: '|+i⟩', color: '#F59E0B' },
    { theta: Math.PI / 2, phi: Math.PI, label: '|-⟩', color: '#EC4899' },
    { theta: Math.PI / 2, phi: 3 * Math.PI / 2, label: '|-i⟩', color: '#06B6D4' }
  ];

  const displayStates = states.length > 0 ? states : commonStates.slice(0, 3);

  return (
    <Card className="quantum-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="h-5 w-5 text-primary" />
            {title}
            {isRotating && (
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
                onClick={() => setIsRotating(!isRotating)}
              >
                {isRotating ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={resetView}
              >
                <RotateCcw className="h-3 w-3" />
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
                onClick={exportImage}
              >
                <Download className="h-3 w-3" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLabels(!showLabels)}
              >
                <Info className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* State Legend */}
        <div className="flex flex-wrap gap-2 mt-2">
          {displayStates.map((state, index) => (
            <Badge
              key={index}
              variant="outline"
              className={`cursor-pointer transition-all ${
                index === selectedState
                  ? 'border-primary bg-primary/20'
                  : hoveredState === index
                  ? 'border-primary/50 bg-primary/10'
                  : ''
              }`}
              onClick={() => onStateSelect?.(index)}
              onMouseEnter={() => setHoveredState(index)}
              onMouseLeave={() => setHoveredState(null)}
            >
              <div
                className="w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: state.color }}
              />
              {state.label}
              {state.probability !== undefined && (
                <span className="ml-1 text-xs">
                  ({(state.probability * 100).toFixed(1)}%)
                </span>
              )}
            </Badge>
          ))}
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
              className="mb-4 p-4 bg-muted/10 rounded-lg space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Animation Speed</label>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={animationSpeed}
                    onChange={(e) => {
                      // Update animation speed if needed
                    }}
                    className="w-full mt-1"
                  />
                  <span className="text-xs text-muted-foreground">{animationSpeed}x</span>
                </div>

                <div>
                  <label className="text-sm font-medium">Sphere Opacity</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={sphereOpacity}
                    onChange={(e) => setSphereOpacity(parseFloat(e.target.value))}
                    className="w-full mt-1"
                  />
                  <span className="text-xs text-muted-foreground">{sphereOpacity.toFixed(1)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="show-grid"
                    checked={showGrid}
                    onChange={(e) => {
                      // Toggle grid visibility
                    }}
                    className="rounded"
                  />
                  <label htmlFor="show-grid" className="text-sm">Show Grid</label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bloch Sphere Canvas */}
        <div
          className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg overflow-hidden"
          style={{ height: height + 'px' }}
        >
          <canvas
            ref={canvasRef}
            width={800}
            height={height}
            className="w-full h-full cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleClick}
          />

          {/* Interactive hint */}
          {interactive && (
            <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-black/50 px-2 py-1 rounded">
              <Move3d className="inline h-3 w-3 mr-1" />
              Drag to rotate • Click to select states
            </div>
          )}
        </div>

        {/* State Information */}
        {selectedState !== null && displayStates[selectedState] && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-muted/10 rounded-lg"
          >
            <h4 className="font-semibold mb-2">State: {displayStates[selectedState].label}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">θ (theta):</span>
                <span className="ml-1 font-mono">
                  {((displayStates[selectedState].theta * 180) / Math.PI).toFixed(1)}°
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">φ (phi):</span>
                <span className="ml-1 font-mono">
                  {((displayStates[selectedState].phi * 180) / Math.PI).toFixed(1)}°
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Amplitude:</span>
                <span className="ml-1 font-mono">
                  {Math.sqrt(displayStates[selectedState].probability || 0.5).toFixed(3)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Phase:</span>
                <span className="ml-1 font-mono">
                  {displayStates[selectedState].phi.toFixed(3)} rad
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}