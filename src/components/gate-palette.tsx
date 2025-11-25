"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, RotateCcw, Zap, BarChart3, Cpu, Activity } from "lucide-react";

export interface GateDefinition {
  type: string;
  name: string;
  description: string;
  category: 'quantum' | 'classical' | 'measurement' | 'custom';
  icon: React.ReactNode;
  color: string;
  parameters?: GateParameter[];
  qubits: number;
  reversible: boolean;
  cost?: number;
}

export interface GateParameter {
  name: string;
  type: 'angle' | 'boolean' | 'integer';
  default?: any;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

interface GatePaletteProps {
  onGateSelect?: (gateType: string) => void;
  onGateCreate?: (gateDefinition: GateDefinition) => void;
  selectedCategory?: string;
  readOnly?: boolean;
}

export function GatePalette({
  onGateSelect,
  onGateCreate,
  selectedCategory = 'quantum',
  readOnly = false
}: GatePaletteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(selectedCategory);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [customGate, setCustomGate] = useState<Partial<GateDefinition>>({
    name: '',
    description: '',
    category: 'custom',
    color: '#6b7280',
    qubits: 1,
    reversible: true
  });

  const gateDefinitions: GateDefinition[] = [
    // Single-Qubit Quantum Gates
    {
      type: 'X',
      name: 'Pauli-X',
      description: 'Bit flip gate (NOT gate)',
      category: 'quantum',
      icon: <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">X</div>,
      color: '#ef4444',
      qubits: 1,
      reversible: true,
      cost: 1
    },
    {
      type: 'Y',
      name: 'Pauli-Y',
      description: 'Bit and phase flip gate',
      category: 'quantum',
      icon: <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">Y</div>,
      color: '#f59e0b',
      qubits: 1,
      reversible: true,
      cost: 1
    },
    {
      type: 'Z',
      name: 'Pauli-Z',
      description: 'Phase flip gate',
      category: 'quantum',
      icon: <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">Z</div>,
      color: '#3b82f6',
      qubits: 1,
      reversible: true,
      cost: 1
    },
    {
      type: 'H',
      name: 'Hadamard',
      description: 'Creates superposition state',
      category: 'quantum',
      icon: <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">H</div>,
      color: '#10b981',
      qubits: 1,
      reversible: true,
      cost: 1
    },
    {
      type: 'S',
      name: 'Phase (S)',
      description: 'π/2 phase gate',
      category: 'quantum',
      icon: <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">S</div>,
      color: '#84cc16',
      qubits: 1,
      reversible: false,
      cost: 1
    },
    {
      type: 'T',
      name: 'T-Gate',
      description: 'π/4 phase gate',
      category: 'quantum',
      icon: <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">T</div>,
      color: '#a855f7',
      qubits: 1,
      reversible: false,
      cost: 2
    },

    // Rotation Gates
    {
      type: 'RX',
      name: 'X-Rotation',
      description: 'Rotation around X-axis',
      category: 'quantum',
      icon: <RotateCcw className="w-full h-full text-white p-1" />,
      color: '#fb923c',
      qubits: 1,
      reversible: true,
      parameters: [
        { name: 'theta', type: 'angle', default: Math.PI / 4, min: 0, max: 2 * Math.PI, step: 0.1, unit: 'rad' }
      ],
      cost: 1
    },
    {
      type: 'RY',
      name: 'Y-Rotation',
      description: 'Rotation around Y-axis',
      category: 'quantum',
      icon: <RotateCcw className="w-full h-full text-white p-1 rotate-90" />,
      color: '#06b6d4',
      qubits: 1,
      reversible: true,
      parameters: [
        { name: 'theta', type: 'angle', default: Math.PI / 4, min: 0, max: 2 * Math.PI, step: 0.1, unit: 'rad' }
      ],
      cost: 1
    },
    {
      type: 'RZ',
      name: 'Z-Rotation',
      description: 'Rotation around Z-axis',
      category: 'quantum',
      icon: <RotateCcw className="w-full h-full text-white p-1" />,
      color: '#6366f1',
      qubits: 1,
      reversible: true,
      parameters: [
        { name: 'theta', type: 'angle', default: Math.PI / 4, min: 0, max: 2 * Math.PI, step: 0.1, unit: 'rad' }
      ],
      cost: 1
    },

    // Multi-Qubit Gates
    {
      type: 'CNOT',
      name: 'Controlled-NOT',
      description: 'Controlled bit flip',
      category: 'quantum',
      icon: <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">⊕</div>,
      color: '#8b5cf6',
      qubits: 2,
      reversible: true,
      cost: 2
    },
    {
      type: 'CZ',
      name: 'Controlled-Z',
      description: 'Controlled phase flip',
      category: 'quantum',
      icon: <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">●</div>,
      color: '#ec4899',
      qubits: 2,
      reversible: true,
      cost: 2
    },
    {
      type: 'SWAP',
      name: 'SWAP',
      description: 'Exchange two qubit states',
      category: 'quantum',
      icon: <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">⇄</div>,
      color: '#f97316',
      qubits: 2,
      reversible: true,
      cost: 3
    },
    {
      type: 'TOFFOLI',
      name: 'Toffoli (CCX)',
      description: 'Controlled-controlled NOT',
      category: 'quantum',
      icon: <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">⊕</div>,
      color: '#dc2626',
      qubits: 3,
      reversible: true,
      cost: 5
    },

    // Measurement Gates
    {
      type: 'Measure',
      name: 'Measure',
      description: 'Measure qubit in computational basis',
      category: 'measurement',
      icon: <BarChart3 className="w-full h-full text-white p-1" />,
      color: '#64748b',
      qubits: 1,
      reversible: false,
      cost: 0
    },

    // Classical Gates (for hybrid quantum-classical circuits)
    {
      type: 'AND',
      name: 'AND',
      description: 'Classical AND gate',
      category: 'classical',
      icon: <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">&</div>,
      color: '#059669',
      qubits: 2,
      reversible: false,
      cost: 0
    },
    {
      type: 'OR',
      name: 'OR',
      description: 'Classical OR gate',
      category: 'classical',
      icon: <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">∨</div>,
      color: '#0891b2',
      qubits: 2,
      reversible: false,
      cost: 0
    },
    {
      type: 'NOT',
      name: 'NOT',
      description: 'Classical NOT gate',
      category: 'classical',
      icon: <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">¬</div>,
      color: '#ea580c',
      qubits: 1,
      reversible: false,
      cost: 0
    }
  ];

  const categories = [
    { id: 'quantum', name: 'Quantum Gates', icon: <Zap className="w-4 h-4" />, count: gateDefinitions.filter(g => g.category === 'quantum').length },
    { id: 'classical', name: 'Classical Gates', icon: <Cpu className="w-4 h-4" />, count: gateDefinitions.filter(g => g.category === 'classical').length },
    { id: 'measurement', name: 'Measurements', icon: <Activity className="w-4 h-4" />, count: gateDefinitions.filter(g => g.category === 'measurement').length },
    { id: 'custom', name: 'Custom Gates', icon: <Plus className="w-4 h-4" />, count: 0 }
  ];

  const filteredGates = gateDefinitions.filter(gate => {
    const matchesCategory = gate.category === activeCategory;
    const matchesSearch = searchTerm === '' ||
      gate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gate.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gate.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDragStart = (e: React.DragEvent, gateType: string) => {
    if (readOnly) return;
    e.dataTransfer.setData('gateType', gateType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleGateClick = (gateType: string) => {
    if (!readOnly) {
      onGateSelect?.(gateType);
    }
  };

  const handleCreateCustomGate = () => {
    if (customGate.name && customGate.type) {
      onGateCreate?.(customGate as GateDefinition);
      setCustomGate({
        name: '',
        description: '',
        category: 'custom',
        color: '#6b7280',
        qubits: 1,
        reversible: true
      });
      setShowCreateForm(false);
    }
  };

  return (
    <Card className="w-80 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-400" />
          Gate Library
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search gates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-600 text-white placeholder-slate-400"
          />
        </div>

        {/* Categories */}
        <div className="space-y-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveCategory(category.id)}
              className="w-full justify-between text-left hover:bg-slate-700"
              disabled={category.id === 'custom' && readOnly}
            >
              <div className="flex items-center gap-2">
                {category.icon}
                <span className="text-sm">{category.name}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Gate List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {activeCategory === 'custom' ? (
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="w-full gap-2 border-slate-600 hover:bg-slate-700"
                disabled={readOnly}
              >
                <Plus className="h-4 w-4" />
                Create Custom Gate
              </Button>

              {showCreateForm && (
                <Card className="bg-slate-800 border-slate-600 p-3 space-y-3">
                  <Input
                    placeholder="Gate type (e.g., CUSTOM_X)"
                    value={customGate.type || ''}
                    onChange={(e) => setCustomGate(prev => ({ ...prev, type: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Input
                    placeholder="Gate name"
                    value={customGate.name || ''}
                    onChange={(e) => setCustomGate(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Input
                    placeholder="Description"
                    value={customGate.description || ''}
                    onChange={(e) => setCustomGate(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleCreateCustomGate} className="flex-1">
                      Create
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowCreateForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </Card>
              )}

              <p className="text-sm text-slate-400 text-center py-4">
                No custom gates created yet
              </p>
            </div>
          ) : filteredGates.length > 0 ? (
            filteredGates.map((gate) => (
              <div
                key={gate.type}
                draggable={!readOnly}
                onDragStart={(e) => handleDragStart(e, gate.type)}
                onClick={() => handleGateClick(gate.type)}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer
                  ${!readOnly ? 'hover:bg-slate-700 border-slate-600 hover:border-slate-500' : 'cursor-not-allowed opacity-75'}
                  ${!readOnly ? 'dragging:opacity-50' : ''}`}
                style={{ borderColor: gate.color + '40', backgroundColor: gate.color + '10' }}
              >
                <div
                  className="w-10 h-10 rounded flex-shrink-0"
                  style={{ backgroundColor: gate.color }}
                >
                  {gate.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-white text-sm truncate">{gate.name}</h4>
                    {gate.cost && (
                      <Badge variant="outline" className="text-xs border-slate-600">
                        {gate.cost}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate">{gate.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">
                      {gate.qubits} qubit{gate.qubits > 1 ? 's' : ''}
                    </span>
                    {gate.reversible && (
                      <span className="text-xs text-green-400">Reversible</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">
              No gates found matching "{searchTerm}"
            </p>
          )}
        </div>

        {/* Legend */}
        <div className="pt-3 border-t border-slate-700">
          <div className="text-xs text-slate-400 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border border-slate-600 border-dashed rounded" />
              <span>Drag gates to circuit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span>Click to select</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded" />
              <span>Double-click to delete</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}