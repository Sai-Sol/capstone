"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuantumCircuitVisualizer } from "@/components/quantum-circuit-visualizer";
import { CircuitBuilder, QuantumCircuit } from "@/components/circuit-builder";
import { Zap, Play, Plus, Download, Upload, Save, Users, Clock, Activity, Share, FileText } from "lucide-react";

interface SavedCircuit {
  id: string;
  name: string;
  description: string;
  qubitCount: number;
  gateCount: number;
  depth: number;
  lastModified: number;
  isShared?: boolean;
  collaborators?: number;
  circuit: QuantumCircuit;
}

const defaultCircuits: SavedCircuit[] = [
  {
    id: "bell-state",
    name: "Bell State Creation",
    description: "Demonstrates quantum entanglement with a Bell state",
    qubitCount: 2,
    gateCount: 2,
    depth: 2,
    lastModified: Date.now() - 86400000,
    circuit: {
      id: "bell-state",
      name: "Bell State Creation",
      description: "Demonstrates quantum entanglement with a Bell state",
      qubitCount: 2,
      gates: [
        { id: "h1", type: "H", qubits: [0], label: "H" },
        { id: "cnot1", type: "CNOT", qubits: [0, 1], label: "⊗" },
      ],
      metadata: { created: Date.now() - 86400000, modified: Date.now() - 86400000, version: 1 }
    }
  },
  {
    id: "grover",
    name: "Grover's Algorithm",
    description: "Quantum search algorithm for unstructured search",
    qubitCount: 3,
    gateCount: 12,
    depth: 12,
    lastModified: Date.now() - 172800000,
    isShared: true,
    collaborators: 2,
    circuit: {
      id: "grover",
      name: "Grover's Algorithm",
      description: "Quantum search algorithm for unstructured search",
      qubitCount: 3,
      gates: [
        { id: "h1", type: "H", qubits: [0], label: "H" },
        { id: "h2", type: "H", qubits: [1], label: "H" },
        { id: "h3", type: "H", qubits: [2], label: "H" },
        { id: "oracle", type: "CNOT", qubits: [0, 1], label: "⊗" },
        { id: "diffusion", type: "H", qubits: [0], label: "H" },
        { id: "x1", type: "X", qubits: [0], label: "X" },
        { id: "x2", type: "X", qubits: [1], label: "X" },
        { id: "x3", type: "X", qubits: [2], label: "X" },
      ],
      metadata: { created: Date.now() - 172800000, modified: Date.now() - 172800000, version: 1 }
    }
  },
  {
    id: "qft",
    name: "Quantum Fourier Transform",
    description: "Quantum version of the discrete Fourier transform",
    qubitCount: 4,
    gateCount: 8,
    depth: 8,
    lastModified: Date.now() - 259200000,
    circuit: {
      id: "qft",
      name: "Quantum Fourier Transform",
      description: "Quantum version of the discrete Fourier transform",
      qubitCount: 4,
      gates: [
        { id: "h1", type: "H", qubits: [0], label: "H" },
        { id: "cr1", type: "CNOT", qubits: [0, 1], label: "⊗" },
        { id: "cr2", type: "CNOT", qubits: [0, 2], label: "⊗" },
        { id: "h2", type: "H", qubits: [1], label: "H" },
        { id: "cr3", type: "CNOT", qubits: [1, 2], label: "⊗" },
        { id: "h3", type: "H", qubits: [2], label: "H" },
        { id: "swap1", type: "SWAP", qubits: [0, 3], label: "⇄" },
        { id: "swap2", type: "SWAP", qubits: [1, 2], label: "⇄" },
      ],
      metadata: { created: Date.now() - 259200000, modified: Date.now() - 259200000, version: 1 }
    }
  }
];

export default function CircuitsPage() {
  const [savedCircuits, setSavedCircuits] = useState<SavedCircuit[]>(defaultCircuits);
  const [selectedCircuit, setSelectedCircuit] = useState<QuantumCircuit | null>(null);
  const [activeTab, setActiveTab] = useState<'library' | 'builder' | 'templates'>('library');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(3);

  // Load circuits from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('quantum-circuits');
      if (stored) {
        const parsedCircuits = JSON.parse(stored);
        setSavedCircuits([...defaultCircuits, ...parsedCircuits]);
      }
    } catch (error) {
      console.error('Failed to load saved circuits:', error);
    }
  }, []);

  const filteredCircuits = savedCircuits.filter(circuit =>
    circuit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    circuit.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNew = () => {
    const newCircuit: QuantumCircuit = {
      id: `circuit-${Date.now()}`,
      name: 'New Quantum Circuit',
      description: '',
      qubitCount: 4,
      gates: [],
      metadata: {
        created: Date.now(),
        modified: Date.now(),
        version: 1
      }
    };
    setSelectedCircuit(newCircuit);
    setIsCreatingNew(true);
    setActiveTab('builder');
  };

  const handleSaveCircuit = (circuit: QuantumCircuit) => {
    const savedCircuit: SavedCircuit = {
      id: circuit.id,
      name: circuit.name,
      description: circuit.description || '',
      qubitCount: circuit.qubitCount,
      gateCount: circuit.gates.length,
      depth: circuit.gates.length > 0 ? Math.max(...circuit.gates.map(g => g.position?.x || 0)) + 1 : 0,
      lastModified: Date.now(),
      circuit
    };

    setSavedCircuits(prev => {
      const existing = prev.find(c => c.id === circuit.id);
      if (existing) {
        return prev.map(c => c.id === circuit.id ? savedCircuit : c);
      } else {
        // Save to localStorage
        try {
          const userCircuits = prev.filter(c => !defaultCircuits.find(dc => dc.id === c.id));
          localStorage.setItem('quantum-circuits', JSON.stringify([...userCircuits, savedCircuit]));
        } catch (error) {
          console.error('Failed to save circuit:', error);
        }
        return [...prev, savedCircuit];
      }
    });

    setIsCreatingNew(false);
  };

  const handleLoadCircuit = (circuit: SavedCircuit) => {
    setSelectedCircuit(circuit.circuit);
    setActiveTab('builder');
  };

  const handleDeleteCircuit = (circuitId: string) => {
    if (defaultCircuits.find(c => c.id === circuitId)) {
      return; // Don't delete default circuits
    }

    setSavedCircuits(prev => prev.filter(c => c.id !== circuitId));

    // Remove from localStorage
    try {
      const userCircuits = savedCircuits.filter(c =>
        !defaultCircuits.find(dc => dc.id === c.id) && c.id !== circuitId
      );
      localStorage.setItem('quantum-circuits', JSON.stringify(userCircuits));
    } catch (error) {
      console.error('Failed to delete circuit:', error);
    }
  };

  const handleExportCircuit = (circuit: QuantumCircuit) => {
    const dataStr = JSON.stringify(circuit, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${circuit.name.replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatLastModified = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-6 p-6 h-[calc(100vh-6rem)] overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Quantum Circuit Builder
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Interactive quantum circuit design with real-time collaboration, advanced gate library, and intelligent optimization.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-green-400" />
              <span className="text-muted-foreground">{onlineUsers} online</span>
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            </div>
            <Button onClick={handleCreateNew} size="lg" className="gap-2">
              <Plus className="h-4 w-4" />
              New Circuit
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex-1 overflow-hidden"
      >
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="h-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
            <TabsTrigger value="library" className="data-[state=active]:bg-slate-700">
              <FileText className="h-4 w-4 mr-2" />
              My Circuits
            </TabsTrigger>
            <TabsTrigger value="builder" className="data-[state=active]:bg-slate-700">
              <Zap className="h-4 w-4 mr-2" />
              Circuit Builder
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-slate-700">
              <Play className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="mt-6 h-[calc(100%-3rem)] overflow-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search circuits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm bg-slate-800 border-slate-600"
                />
                <Button variant="outline" className="gap-2 border-slate-600">
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCircuits.map((circuit) => (
                  <motion.div
                    key={circuit.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="cursor-pointer hover:border-primary/50 transition-all bg-slate-900 border-slate-700">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base text-white mb-1">{circuit.name}</CardTitle>
                            <CardDescription className="text-xs text-slate-400 line-clamp-2">
                              {circuit.description}
                            </CardDescription>
                          </div>
                          {circuit.isShared && (
                            <Share className="h-4 w-4 text-blue-400 flex-shrink-0 ml-2" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span>{circuit.qubitCount} qubits</span>
                          <span>{circuit.gateCount} gates</span>
                          <span>Depth {circuit.depth}</span>
                        </div>

                        {circuit.collaborators && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-blue-400" />
                            <span className="text-xs text-blue-400">{circuit.collaborators} collaborators</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatLastModified(circuit.lastModified)}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLoadCircuit(circuit);
                              }}
                              className="h-7 px-2"
                            >
                              Open
                            </Button>
                            {!defaultCircuits.find(c => c.id === circuit.id) && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCircuit(circuit.id);
                                }}
                                className="h-7 px-2 text-red-400 hover:text-red-300"
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="builder" className="mt-6 h-[calc(100%-3rem)]">
            {selectedCircuit ? (
              <CircuitBuilder
                initialCircuit={selectedCircuit}
                onSave={handleSaveCircuit}
                onExport={handleExportCircuit}
                roomId={`circuit-${selectedCircuit.id}`}
                userId={`user-${Date.now()}`}
                readOnly={false}
              />
            ) : (
              <Card className="h-full flex items-center justify-center bg-slate-900 border-slate-700">
                <CardContent className="text-center space-y-4">
                  <Zap className="h-16 w-16 text-slate-600 mx-auto" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Circuit Selected</h3>
                    <p className="text-slate-400 mb-4">Create a new circuit or select one from your library to start building.</p>
                    <Button onClick={handleCreateNew} size="lg" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create New Circuit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="templates" className="mt-6 h-[calc(100%-3rem)] overflow-auto">
            <div className="space-y-6">
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Quantum Algorithm Templates</CardTitle>
                  <CardDescription>
                    Pre-built quantum circuits for common algorithms and applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[
                      {
                        name: "Bell State",
                        description: "Create maximally entangled Bell pairs",
                        qubits: 2,
                        difficulty: "Beginner",
                        icon: "🔗"
                      },
                      {
                        name: "GHZ State",
                        description: "Greenberger-Horne-Zeilinger entanglement",
                        qubits: 3,
                        difficulty: "Beginner",
                        icon: "⚛️"
                      },
                      {
                        name: "Quantum Teleportation",
                        description: "Transfer quantum states using entanglement",
                        qubits: 3,
                        difficulty: "Intermediate",
                        icon: "📡"
                      },
                      {
                        name: "Deutsch-Jozsa",
                        description: "Determine balanced vs constant functions",
                        qubits: 4,
                        difficulty: "Intermediate",
                        icon: "🔍"
                      },
                      {
                        name: "Grover's Search",
                        description: "Quantum search algorithm",
                        qubits: 3,
                        difficulty: "Advanced",
                        icon: "🔎"
                      },
                      {
                        name: "Shor's Algorithm",
                        description: "Quantum factoring algorithm",
                        qubits: 5,
                        difficulty: "Expert",
                        icon: "🔢"
                      }
                    ].map((template, idx) => (
                      <Card key={idx} className="cursor-pointer hover:border-primary/50 transition-all bg-slate-800 border-slate-600">
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl mb-2">{template.icon}</div>
                          <h4 className="font-semibold text-white mb-1">{template.name}</h4>
                          <p className="text-xs text-slate-400 mb-3">{template.description}</p>
                          <div className="flex justify-center gap-2 mb-3">
                            <Badge variant="outline" className="text-xs border-slate-600">
                              {template.qubits} qubits
                            </Badge>
                            <Badge variant="outline" className="text-xs border-slate-600">
                              {template.difficulty}
                            </Badge>
                          </div>
                          <Button size="sm" className="w-full" onClick={() => {
                            // Template creation logic would go here
                            console.log(`Creating ${template.name} template`);
                          }}>
                            Use Template
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-yellow-400" />
                    Getting Started
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-white">Basic Operations</h4>
                      <ul className="space-y-2 text-sm text-slate-300">
                        <li>• Drag quantum gates from the palette to the circuit grid</li>
                        <li>• Click gates to select and view properties</li>
                        <li>• Double-click gates to delete them</li>
                        <li>• Use arrow keys to navigate between grid cells</li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-white">Collaboration Features</h4>
                      <ul className="space-y-2 text-sm text-slate-300">
                        <li>• Real-time collaboration with team members</li>
                        <li>• Share circuits via unique links</li>
                        <li>• Version history and change tracking</li>
                        <li>• Live cursor positions and user presence</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}