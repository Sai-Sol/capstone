"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Undo, Redo, Download, Upload, Save, Users } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";
import { GatePalette } from "./gate-palette";
import { CircuitProperties } from "./circuit-properties";

export interface QuantumGate {
  id: string;
  type: string;
  qubits: number[];
  angle?: number;
  label: string;
  position?: { x: number; y: number };
  color?: string;
}

export interface QuantumCircuit {
  id: string;
  name: string;
  description?: string;
  gates: QuantumGate[];
  qubitCount: number;
  metadata?: {
    created: number;
    modified: number;
    version: number;
  };
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  cursor?: { x: number; y: number };
  status: 'online' | 'away' | 'editing';
  color: string;
}

interface CircuitBuilderProps {
  initialCircuit?: Partial<QuantumCircuit>;
  onSave?: (circuit: QuantumCircuit) => void;
  onExport?: (circuit: QuantumCircuit) => void;
  onImport?: (qasm: string) => void;
  roomId?: string;
  userId?: string;
  collaborators?: User[];
  readOnly?: boolean;
}

const USER_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
];

export function CircuitBuilder({
  initialCircuit,
  onSave,
  onExport,
  onImport,
  roomId = 'default-circuit',
  userId = 'user-1',
  collaborators = [],
  readOnly = false
}: CircuitBuilderProps) {
  const [circuit, setCircuit] = useState<QuantumCircuit>(() => ({
    id: initialCircuit?.id || `circuit-${Date.now()}`,
    name: initialCircuit?.name || 'New Quantum Circuit',
    description: initialCircuit?.description || '',
    gates: initialCircuit?.gates || [],
    qubitCount: initialCircuit?.qubitCount || 4,
    metadata: {
      created: Date.now(),
      modified: Date.now(),
      version: 1
    }
  }));

  const [selectedGate, setSelectedGate] = useState<QuantumGate | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedGate, setDraggedGate] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ qubit: number; position: number } | null>(null);
  const [history, setHistory] = useState<QuantumCircuit[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [onlineUsers, setOnlineUsers] = useState<User[]>(collaborators);

  const gridRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    sendMessage,
    isConnected,
    connectionStatus,
    updatePresence
  } = useWebSocket('/api/websocket', {
    userId,
    roomId,
    onMessage: (message) => {
      handleWebSocketMessage(message);
    },
    onConnect: () => {
      updatePresence({ status: 'online' });
    }
  });

  const handleWebSocketMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'circuit:gate_add':
        if (message.userId !== userId) {
          setCircuit(prev => ({
            ...prev,
            gates: [...prev.gates, message.data.gate],
            metadata: { ...prev.metadata, modified: Date.now() }
          }));
        }
        break;

      case 'circuit:gate_remove':
        if (message.userId !== userId) {
          setCircuit(prev => ({
            ...prev,
            gates: prev.gates.filter(g => g.id !== message.data.gateId),
            metadata: { ...prev.metadata, modified: Date.now() }
          }));
        }
        break;

      case 'circuit:gate_move':
        if (message.userId !== userId) {
          setCircuit(prev => ({
            ...prev,
            gates: prev.gates.map(g =>
              g.id === message.data.gateId
                ? { ...g, position: message.data.position }
                : g
            ),
            metadata: { ...prev.metadata, modified: Date.now() }
          }));
        }
        break;

      case 'presence_update':
        setOnlineUsers(prev => {
          const updatedUsers = [...prev];
          const userIndex = updatedUsers.findIndex(u => u.id === message.data.userId);

          if (userIndex >= 0) {
            updatedUsers[userIndex] = { ...updatedUsers[userIndex], ...message.data };
          } else {
            updatedUsers.push({
              id: message.data.userId,
              name: message.data.name || `User ${message.data.userId.slice(-4)}`,
              color: USER_COLORS[updatedUsers.length % USER_COLORS.length],
              status: 'online',
              ...message.data
            });
          }

          return updatedUsers;
        });
        break;

      case 'user_joined':
        setOnlineUsers(prev => [
          ...prev,
          {
            id: message.data.userId,
            name: message.data.userInfo?.name || `User ${message.data.userId.slice(-4)}`,
            color: USER_COLORS[prev.length % USER_COLORS.length],
            status: 'online'
          }
        ]);
        break;

      case 'user_left':
        setOnlineUsers(prev => prev.filter(u => u.id !== message.data.userId));
        break;
    }
  }, [userId]);

  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(circuit)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [circuit, history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const previousCircuit = history[historyIndex - 1];
      setCircuit(previousCircuit);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextCircuit = history[historyIndex + 1];
      setCircuit(nextCircuit);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  const addGate = useCallback((gateType: string, qubit: number, position: number) => {
    if (readOnly) return;

    const newGate: QuantumGate = {
      id: `gate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: gateType,
      qubits: [qubit],
      label: gateType,
      position: { x: position, y: qubit },
      color: getGateColor(gateType)
    };

    const updatedCircuit = {
      ...circuit,
      gates: [...circuit.gates, newGate],
      metadata: { ...circuit.metadata, modified: Date.now() }
    };

    setCircuit(updatedCircuit);
    saveToHistory();

    if (isConnected) {
      sendMessage({
        type: 'circuit:gate_add',
        data: { gate: newGate, qubit, position }
      });
    }

    setSelectedGate(newGate);
  }, [circuit, readOnly, isConnected, sendMessage, saveToHistory]);

  const removeGate = useCallback((gateId: string) => {
    if (readOnly) return;

    const updatedCircuit = {
      ...circuit,
      gates: circuit.gates.filter(g => g.id !== gateId),
      metadata: { ...circuit.metadata, modified: Date.now() }
    };

    setCircuit(updatedCircuit);
    saveToHistory();

    if (selectedGate?.id === gateId) {
      setSelectedGate(null);
    }

    if (isConnected) {
      sendMessage({
        type: 'circuit:gate_remove',
        data: { gateId }
      });
    }
  }, [circuit, selectedGate, readOnly, isConnected, sendMessage, saveToHistory]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!readOnly) {
      setIsDragging(true);
    }
  }, [readOnly]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (e.currentTarget === e.target) {
      setIsDragging(false);
      setHoveredCell(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, qubit: number, position: number) => {
    e.preventDefault();
    setIsDragging(false);
    setHoveredCell(null);

    const gateType = e.dataTransfer.getData('gateType');
    if (gateType && !readOnly) {
      addGate(gateType, qubit, position);
    }
  }, [addGate, readOnly]);

  const exportQASM = useCallback(() => {
    let qasm = `// Quantum Circuit: ${circuit.name}\n`;
    qasm += `// Description: ${circuit.description || 'No description'}\n`;
    qasm += `OPENQASM 2.0;\n`;
    qasm += `include "qelib1.inc";\n\n`;
    qasm += `qreg q[${circuit.qubitCount}];\n`;
    qasm += `creg c[${circuit.qubitCount}];\n\n`;

    // Group gates by position to handle parallel operations
    const gatesByPosition = new Map<number, QuantumGate[]>();
    circuit.gates.forEach(gate => {
      const pos = gate.position?.x || 0;
      if (!gatesByPosition.has(pos)) {
        gatesByPosition.set(pos, []);
      }
      gatesByPosition.get(pos)!.push(gate);
    });

    Array.from(gatesByPosition.entries())
      .sort(([a], [b]) => a - b)
      .forEach(([position, gates]) => {
        gates.forEach(gate => {
          qasm += `${gate.type.toLowerCase()} q[${gate.qubits[0]}];`;
          if (gate.angle !== undefined) {
            qasm += ` // angle: ${gate.angle}`;
          }
          qasm += '\n';
        });
      });

    onExport?.(circuit);

    // Download QASM file
    const blob = new Blob([qasm], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${circuit.name.replace(/\s+/g, '_')}.qasm`;
    a.click();
    URL.revokeObjectURL(url);
  }, [circuit, onExport]);

  const importQASM = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && !readOnly) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const qasm = event.target?.result as string;
        onImport?.(qasm);
      };
      reader.readAsText(file);
    }
  }, [onImport, readOnly]);

  const getGateColor = (gateType: string): string => {
    const colors: { [key: string]: string } = {
      X: '#ef4444',
      Y: '#f59e0b',
      Z: '#3b82f6',
      H: '#10b981',
      CNOT: '#8b5cf6',
      CZ: '#ec4899',
      SWAP: '#f97316',
      RX: '#fb923c',
      RY: '#06b6d4',
      RZ: '#6366f1',
      S: '#84cc16',
      T: '#a855f7',
      Measure: '#64748b'
    };
    return colors[gateType] || '#6b7280';
  };

  const handleCellHover = useCallback((qubit: number, position: number) => {
    if (isDragging && !readOnly) {
      setHoveredCell({ qubit, position });
    }
  }, [isDragging, readOnly]);

  const handleCellLeave = useCallback(() => {
    setHoveredCell(null);
  }, []);

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <Input
                  value={circuit.name}
                  onChange={(e) => setCircuit(prev => ({ ...prev, name: e.target.value }))}
                  className="text-lg font-semibold bg-slate-800 border-slate-600 text-white"
                  placeholder="Circuit Name"
                  disabled={readOnly}
                />
                <Input
                  value={circuit.description || ''}
                  onChange={(e) => setCircuit(prev => ({ ...prev, description: e.target.value }))}
                  className="text-sm text-slate-400 bg-slate-800 border-slate-600 mt-2"
                  placeholder="Circuit Description"
                  disabled={readOnly}
                />
              </div>
              <Badge variant="outline" className="text-blue-400 border-blue-500/50">
                {circuit.qubitCount} Qubits
              </Badge>
              <Badge variant="outline" className="text-green-400 border-green-500/50">
                {circuit.gates.length} Gates
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 mr-4">
                <Users className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-400">
                  {onlineUsers.length + 1} online
                </span>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>

              {!readOnly && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={undo}
                    disabled={historyIndex <= 0}
                    className="gap-1"
                  >
                    <Undo className="h-3 w-3" />
                    Undo
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={redo}
                    disabled={historyIndex >= history.length - 1}
                    className="gap-1"
                  >
                    <Redo className="h-3 w-3" />
                    Redo
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={exportQASM}
                    className="gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Export
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-1"
                  >
                    <Upload className="h-3 w-3" />
                    Import
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => onSave?.(circuit)}
                    className="gap-1"
                  >
                    <Save className="h-3 w-3" />
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex gap-4 flex-1 overflow-hidden">
        {/* Gate Palette */}
        <GatePalette
          onGateSelect={(gateType) => setDraggedGate(gateType)}
          readOnly={readOnly}
        />

        {/* Main Circuit Area */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Circuit Grid */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 flex-1 overflow-auto">
            <CardContent className="p-6">
              <div
                ref={gridRef}
                className="relative bg-slate-950 rounded-lg p-4 min-h-[400px]"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {/* Qubit lines */}
                {Array(circuit.qubitCount).fill(null).map((_, qubitIndex) => (
                  <div key={`qubit-${qubitIndex}`} className="relative">
                    <div className="absolute left-0 top-8 w-full h-0.5 bg-slate-600" />
                    <div className="absolute left-2 top-6 text-slate-400 text-sm font-mono">
                      q{qubitIndex}
                    </div>

                    {/* Drop zones */}
                    {Array(16).fill(null).map((_, position) => (
                      <div
                        key={`drop-${qubitIndex}-${position}`}
                        className={`absolute w-12 h-12 border-2 border-dashed rounded cursor-pointer transition-all ${
                          hoveredCell?.qubit === qubitIndex && hoveredCell?.position === position
                            ? 'border-blue-400 bg-blue-400/20'
                            : isDragging
                            ? 'border-slate-600 hover:border-slate-500'
                            : 'border-transparent'
                        }`}
                        style={{
                          left: `${60 + position * 50}px`,
                          top: `${-4 + qubitIndex * 60}px`
                        }}
                        onDrop={(e) => handleDrop(e, qubitIndex, position)}
                        onDragOver={handleDragOver}
                        onMouseEnter={() => handleCellHover(qubitIndex, position)}
                        onMouseLeave={handleCellLeave}
                      />
                    ))}

                    {/* Rendered gates */}
                    {circuit.gates
                      .filter(gate => gate.qubits.includes(qubitIndex))
                      .map(gate => (
                        <div
                          key={gate.id}
                          className={`absolute w-10 h-10 rounded cursor-pointer transition-all ${
                            selectedGate?.id === gate.id
                              ? 'ring-2 ring-yellow-400 scale-110'
                              : 'hover:scale-105'
                          } ${readOnly ? 'cursor-not-allowed' : ''}`}
                          style={{
                            left: `${65 + (gate.position?.x || 0) * 50}px`,
                            top: `${-2 + qubitIndex * 60}px`,
                            backgroundColor: gate.color || getGateColor(gate.type)
                          }}
                          onClick={() => !readOnly && setSelectedGate(gate)}
                          onDoubleClick={() => !readOnly && removeGate(gate.id)}
                        >
                          <div className="flex items-center justify-center h-full text-white text-xs font-bold">
                            {gate.label}
                          </div>
                        </div>
                      ))}
                  </div>
                ))}

                {/* User cursors */}
                {onlineUsers.map(user => (
                  user.cursor && (
                    <div
                      key={user.id}
                      className="absolute pointer-events-none"
                      style={{
                        left: `${user.cursor.x}px`,
                        top: `${user.cursor.y}px`,
                        borderLeft: `2px solid ${user.color}`,
                        borderTop: `2px solid ${user.color}`
                      }}
                    >
                      <div
                        className="absolute -top-1 -left-1 w-2 h-2 rounded-full"
                        style={{ backgroundColor: user.color }}
                      />
                      <span
                        className="absolute -top-6 left-2 text-xs px-1 py-0.5 rounded text-white"
                        style={{ backgroundColor: user.color }}
                      >
                        {user.name}
                      </span>
                    </div>
                  )
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Circuit Properties */}
          <CircuitProperties
            circuit={circuit}
            selectedGate={selectedGate}
            onCircuitUpdate={(updates) => setCircuit(prev => ({ ...prev, ...updates }))}
            onGateUpdate={(gateId, updates) => {
              setCircuit(prev => ({
                ...prev,
                gates: prev.gates.map(g => g.id === gateId ? { ...g, ...updates } : g)
              }));
            }}
            onGateRemove={removeGate}
            readOnly={readOnly}
          />
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".qasm,.txt"
        onChange={importQASM}
        className="hidden"
      />
    </div>
  );
}