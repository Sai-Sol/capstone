'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Network,
  Play,
  Pause,
  RotateCcw,
  Download,
  Settings,
  Eye,
  Info,
  Sparkles,
  Link,
  Maximize2
} from 'lucide-react';

interface QubitNode {
  id: number;
  label: string;
  state: 'superposition' | 'entangled' | 'measured' | 'classical';
  probability?: number;
  fidelity?: number;
  color: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

interface EntanglementEdge {
  source: number;
  target: number;
  strength: number; // 0 to 1
  type: 'bell' | 'ghz' | 'w' | 'cluster' | 'generic';
  phase?: number;
}

interface EntanglementGraphProps {
  nodes: QubitNode[];
  edges: EntanglementEdge[];
  selectedNode?: number;
  selectedEdge?: { source: number; target: number };
  onNodeSelect?: (nodeId: number) => void;
  onEdgeSelect?: (edge: { source: number; target: number }) => void;
  isAnimated?: boolean;
  animationSpeed?: number;
  showControls?: boolean;
  showLabels?: boolean;
  layoutType?: 'force' | 'circular' | 'grid' | 'hierarchical';
  height?: number;
  interactive?: boolean;
  title?: string;
}

export function EntanglementGraph({
  nodes = [],
  edges = [],
  selectedNode,
  selectedEdge,
  onNodeSelect,
  onEdgeSelect,
  isAnimated = false,
  animationSpeed = 1,
  showControls = true,
  showLabels = true,
  layoutType = 'force',
  height = 400,
  interactive = true,
  title = 'Quantum Entanglement Network'
}: EntanglementGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSimulating, setIsSimulating] = useState(isAnimated);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<{ source: number; target: number } | null>(null);
  const [layoutNodes, setLayoutNodes] = useState<QubitNode[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [edgeThreshold, setEdgeThreshold] = useState(0.1);
  const [nodeSize, setNodeSize] = useState(20);
  const animationRef = useRef<number>();
  const physicsRef = useRef({ damping: 0.9, repulsion: 100, attraction: 0.001 });

  // Color schemes for different quantum states
  const stateColors = {
    superposition: '#8B5CF6',
    entangled: '#10B981',
    measured: '#EF4444',
    classical: '#F59E0B'
  };

  // Edge colors for different entanglement types
  const edgeColors = {
    bell: '#EC4899',
    ghz: '#06B6D4',
    w: '#F97316',
    cluster: '#84CC16',
    generic: '#8B5CF6'
  };

  // Initialize layout
  useEffect(() => {
    const initializedNodes = nodes.map((node, index) => ({
      ...node,
      x: node.x || Math.random() * 600 - 300,
      y: node.y || Math.random() * 400 - 200,
      vx: node.vx || 0,
      vy: node.vy || 0
    }));
    setLayoutNodes(initializedNodes);
  }, [nodes]);

  // Force-directed layout algorithm
  const updateLayout = useCallback(() => {
    setLayoutNodes(currentNodes => {
      const newNodes = [...currentNodes];

      // Apply forces between nodes
      for (let i = 0; i < newNodes.length; i++) {
        for (let j = i + 1; j < newNodes.length; j++) {
          const dx = newNodes[j].x! - newNodes[i].x!;
          const dy = newNodes[j].y! - newNodes[i].y!;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 0) {
            // Repulsion force
            const repulsion = physicsRef.current.repulsion / (distance * distance);
            const fx = (dx / distance) * repulsion;
            const fy = (dy / distance) * repulsion;

            newNodes[i].vx! -= fx;
            newNodes[i].vy! -= fy;
            newNodes[j].vx! += fx;
            newNodes[j].vy! += fy;
          }
        }
      }

      // Apply attraction forces for connected nodes
      edges.forEach(edge => {
        const sourceNode = newNodes[edge.source];
        const targetNode = newNodes[edge.target];

        if (sourceNode && targetNode) {
          const dx = targetNode.x! - sourceNode.x!;
          const dy = targetNode.y! - sourceNode.y!;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 50) {
            const attraction = physicsRef.current.attraction * distance * edge.strength;
            const fx = (dx / distance) * attraction;
            const fy = (dy / distance) * attraction;

            sourceNode.vx! += fx;
            sourceNode.vy! += fy;
            targetNode.vx! -= fx;
            targetNode.vy! -= fy;
          }
        }
      });

      // Update positions with damping
      newNodes.forEach(node => {
        node.vx! *= physicsRef.current.damping;
        node.vy! *= physicsRef.current.damping;
        node.x! += node.vx!;
        node.y! += node.vy!;

        // Keep nodes within bounds
        const bound = 250;
        node.x! = Math.max(-bound, Math.min(bound, node.x!));
        node.y! = Math.max(-bound * 0.75, Math.min(bound * 0.75, node.y!));
      });

      return newNodes;
    });
  }, [edges]);

  // Physics simulation loop
  useEffect(() => {
    if (isSimulating && layoutType === 'force') {
      const simulate = () => {
        updateLayout();
        animationRef.current = requestAnimationFrame(simulate);
      };
      animationRef.current = requestAnimationFrame(simulate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSimulating, layoutType, updateLayout]);

  // Draw entanglement graph
  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Apply layout transformation
    const transformNode = (node: QubitNode) => {
      const x = centerX + (node.x || 0);
      const y = centerY + (node.y || 0);
      return { x, y, ...node };
    };

    // Draw edges (entanglement connections)
    edges.forEach(edge => {
      if (edge.strength < edgeThreshold) return;

      const sourceNode = layoutNodes[edge.source];
      const targetNode = layoutNodes[edge.target];

      if (!sourceNode || !targetNode) return;

      const source = transformNode(sourceNode);
      const target = transformNode(targetNode);

      const isHovered = hoveredEdge?.source === edge.source && hoveredEdge?.target === edge.target;
      const isSelected = selectedEdge?.source === edge.source && selectedEdge?.target === edge.target;

      // Draw edge line
      ctx.strokeStyle = edgeColors[edge.type];
      ctx.lineWidth = Math.max(1, edge.strength * 8);
      ctx.globalAlpha = isHovered || isSelected ? 1 : 0.6;

      if (isSelected) {
        ctx.setLineDash([5, 5]);
      }

      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();

      ctx.setLineDash([]);

      // Draw entanglement strength indicator
      if (showLabels && (isHovered || isSelected)) {
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;

        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.9;
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${(edge.strength * 100).toFixed(0)}%`, midX, midY - 5);
        ctx.fillText(edge.type.toUpperCase(), midX, midY + 10);
      }
    });

    // Draw nodes (qubits)
    layoutNodes.forEach((node, index) => {
      const transformed = transformNode(node);
      const isHovered = index === hoveredNode;
      const isSelected = index === selectedNode;

      // Node glow effect
      if (isHovered || isSelected) {
        const gradient = ctx.createRadialGradient(
          transformed.x, transformed.y, 0,
          transformed.x, transformed.y, nodeSize * 2
        );
        gradient.addColorStop(0, node.color + '40');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 1;
        ctx.fillRect(
          transformed.x - nodeSize * 2,
          transformed.y - nodeSize * 2,
          nodeSize * 4,
          nodeSize * 4
        );
      }

      // Draw node circle
      ctx.fillStyle = node.color;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(transformed.x, transformed.y, isHovered || isSelected ? nodeSize * 1.2 : nodeSize, 0, Math.PI * 2);
      ctx.fill();

      // Draw node border
      ctx.strokeStyle = isSelected ? '#FFFFFF' : (node.color + '80');
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.stroke();

      // Draw node label
      if (showLabels) {
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.9;
        ctx.font = `${isHovered || isSelected ? 'bold' : 'normal'} 12px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(node.label, transformed.x, transformed.y - nodeSize - 8);

        // Draw additional info when hovered
        if (isHovered && (node.probability !== undefined || node.fidelity !== undefined)) {
          ctx.font = '10px sans-serif';
          ctx.globalAlpha = 0.7;
          if (node.probability !== undefined) {
            ctx.fillText(`${(node.probability * 100).toFixed(1)}%`, transformed.x, transformed.y - nodeSize - 22);
          }
          if (node.fidelity !== undefined) {
            ctx.fillText(`F: ${(node.fidelity * 100).toFixed(1)}%`, transformed.x, transformed.y - nodeSize - 36);
          }
        }
      }
    });

    ctx.globalAlpha = 1;
  }, [layoutNodes, edges, hoveredNode, hoveredEdge, selectedNode, selectedEdge, showLabels, edgeThreshold, nodeSize]);

  // Draw whenever state changes
  useEffect(() => {
    drawGraph();
  }, [drawGraph]);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement;
        if (container) {
          canvasRef.current.width = container.clientWidth;
          canvasRef.current.height = container.clientHeight;
          drawGraph();
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawGraph]);

  // Mouse interaction handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Check if hovering over a node
    let hoveredNodeIndex: number | null = null;
    let hoveredEdgePair: { source: number; target: number } | null = null;

    layoutNodes.forEach((node, index) => {
      const nodeX = centerX + (node.x || 0);
      const nodeY = centerY + (node.y || 0);
      const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);

      if (distance <= nodeSize * 1.5) {
        hoveredNodeIndex = index;
      }
    });

    // Check if hovering over an edge
    edges.forEach(edge => {
      const sourceNode = layoutNodes[edge.source];
      const targetNode = layoutNodes[edge.target];

      if (!sourceNode || !targetNode) return;

      const sourceX = centerX + (sourceNode.x || 0);
      const sourceY = centerY + (sourceNode.y || 0);
      const targetX = centerX + (targetNode.x || 0);
      const targetY = centerY + (targetNode.y || 0);

      // Simple distance from point to line segment
      const distance = pointToLineDistance(x, y, sourceX, sourceY, targetX, targetY);
      if (distance < 10 && edge.strength >= edgeThreshold) {
        hoveredEdgePair = { source: edge.source, target: edge.target };
      }
    });

    setHoveredNode(hoveredNodeIndex);
    setHoveredEdge(hoveredEdgePair);
  };

  const pointToLineDistance = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;

    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return;

    if (hoveredNode !== null && onNodeSelect) {
      onNodeSelect(hoveredNode);
    } else if (hoveredEdge && onEdgeSelect) {
      onEdgeSelect(hoveredEdge);
    }
  };

  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `entanglement-graph-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const resetLayout = () => {
    const resetNodes = nodes.map((node, index) => ({
      ...node,
      x: Math.random() * 600 - 300,
      y: Math.random() * 400 - 200,
      vx: 0,
      vy: 0
    }));
    setLayoutNodes(resetNodes);
  };

  // Generate sample data for demonstration
  const generateSampleData = () => {
    const sampleNodes: QubitNode[] = [
      { id: 0, label: 'Q0', state: 'entangled', fidelity: 0.95, color: stateColors.entangled },
      { id: 1, label: 'Q1', state: 'entangled', fidelity: 0.94, color: stateColors.entangled },
      { id: 2, label: 'Q2', state: 'superposition', probability: 0.5, color: stateColors.superposition },
      { id: 3, label: 'Q3', state: 'measured', probability: 1, color: stateColors.measured },
      { id: 4, label: 'Q4', state: 'superposition', probability: 0.5, color: stateColors.superposition }
    ];

    const sampleEdges: EntanglementEdge[] = [
      { source: 0, target: 1, strength: 0.9, type: 'bell' },
      { source: 1, target: 2, strength: 0.7, type: 'generic' },
      { source: 2, target: 3, strength: 0.4, type: 'generic' },
      { source: 0, target: 4, strength: 0.6, type: 'cluster' }
    ];

    return { nodes: sampleNodes, edges: sampleEdges };
  };

  const displayData = nodes.length > 0 ? { nodes, edges } : generateSampleData();

  return (
    <Card className="quantum-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            {title}
            {isSimulating && (
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
                onClick={() => setIsSimulating(!isSimulating)}
                disabled={layoutType !== 'force'}
              >
                {isSimulating ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={resetLayout}
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
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 mt-2">
          {Object.entries(stateColors).map(([state, color]) => (
            <Badge key={state} variant="outline" className="text-xs">
              <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: color }} />
              {state.charAt(0).toUpperCase() + state.slice(1)}
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
                  <label className="text-sm font-medium">Edge Threshold</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={edgeThreshold}
                    onChange={(e) => setEdgeThreshold(parseFloat(e.target.value))}
                    className="w-full mt-1"
                  />
                  <span className="text-xs text-muted-foreground">{edgeThreshold.toFixed(1)}</span>
                </div>

                <div>
                  <label className="text-sm font-medium">Node Size</label>
                  <input
                    type="range"
                    min="10"
                    max="40"
                    step="5"
                    value={nodeSize}
                    onChange={(e) => setNodeSize(parseInt(e.target.value))}
                    className="w-full mt-1"
                  />
                  <span className="text-xs text-muted-foreground">{nodeSize}px</span>
                </div>

                <div>
                  <label className="text-sm font-medium">Layout Type</label>
                  <select
                    value={layoutType}
                    onChange={(e) => {
                      // Handle layout type change
                    }}
                    className="w-full mt-1 p-2 rounded border border-border bg-background text-sm"
                  >
                    <option value="force">Force-Directed</option>
                    <option value="circular">Circular</option>
                    <option value="grid">Grid</option>
                    <option value="hierarchical">Hierarchical</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Entanglement Graph Canvas */}
        <div
          className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg overflow-hidden"
          style={{ height: height + 'px' }}
        >
          <canvas
            ref={canvasRef}
            width={800}
            height={height}
            className="w-full h-full cursor-pointer"
            onMouseMove={handleMouseMove}
            onClick={handleClick}
          />

          {/* Interactive hint */}
          {interactive && (
            <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-black/50 px-2 py-1 rounded">
              <Link className="inline h-3 w-3 mr-1" />
              Click nodes/edges to select • Hover for details
            </div>
          )}
        </div>

        {/* Node/Edge Information */}
        <AnimatePresence>
          {(selectedNode !== null || selectedEdge) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-4 bg-muted/10 rounded-lg"
            >
              {selectedNode !== null && displayData.nodes[selectedNode] && (
                <div>
                  <h4 className="font-semibold mb-2">Qubit: {displayData.nodes[selectedNode].label}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">State:</span>
                      <span className="ml-1 capitalize">{displayData.nodes[selectedNode].state}</span>
                    </div>
                    {displayData.nodes[selectedNode].probability !== undefined && (
                      <div>
                        <span className="text-muted-foreground">Probability:</span>
                        <span className="ml-1">
                          {(displayData.nodes[selectedNode].probability! * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                    {displayData.nodes[selectedNode].fidelity !== undefined && (
                      <div>
                        <span className="text-muted-foreground">Fidelity:</span>
                        <span className="ml-1">
                          {(displayData.nodes[selectedNode].fidelity! * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Connections:</span>
                      <span className="ml-1">
                        {displayData.edges.filter(e =>
                          e.source === selectedNode || e.target === selectedNode
                        ).length}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {selectedEdge && (
                <div>
                  <h4 className="font-semibold mb-2">
                    Entanglement: Q{selectedEdge.source} ↔ Q{selectedEdge.target}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-1 capitalize">
                        {displayData.edges.find(e =>
                          e.source === selectedEdge.source && e.target === selectedEdge.target
                        )?.type || 'Unknown'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Strength:</span>
                      <span className="ml-1">
                        {(
                          (displayData.edges.find(e =>
                            e.source === selectedEdge.source && e.target === selectedEdge.target
                          )?.strength || 0) * 100
                        ).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phase:</span>
                      <span className="ml-1">
                        {displayData.edges.find(e =>
                          e.source === selectedEdge.source && e.target === selectedEdge.target
                        )?.phase?.toFixed(3) || 'N/A'} rad
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Statistics */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-muted/10 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {displayData.nodes.length}
            </div>
            <div className="text-xs text-muted-foreground">Qubits</div>
          </div>
          <div className="p-3 bg-muted/10 rounded-lg">
            <div className="text-2xl font-bold text-green-400">
              {displayData.edges.filter(e => e.strength >= edgeThreshold).length}
            </div>
            <div className="text-xs text-muted-foreground">Entanglements</div>
          </div>
          <div className="p-3 bg-muted/10 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">
              {(displayData.edges.reduce((sum, e) => sum + e.strength, 0) / displayData.edges.length || 0).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">Avg Strength</div>
          </div>
          <div className="p-3 bg-muted/10 rounded-lg">
            <div className="text-2xl font-bold text-orange-400">
              {displayData.nodes.filter(n => n.state === 'entangled').length}
            </div>
            <div className="text-xs text-muted-foreground">Entangled Qubits</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}