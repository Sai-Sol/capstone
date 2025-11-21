"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuantumCircuitVisualizer } from "@/components/quantum-circuit-visualizer";
import { JobQueueAnalytics } from "@/components/job-queue-analytics";
import { CollaborativeWorkspace } from "@/components/collaborative-workspace";
import { Zap, BarChart3, Users } from "lucide-react";

const mockCircuit = {
  name: "Bell State Circuit",
  description: "Creates a maximally entangled Bell state",
  qubitCount: 3,
  gates: [
    { id: "1", type: "H", qubits: [0], label: "H" },
    { id: "2", type: "CNOT", qubits: [0, 1], label: "C" },
    { id: "3", type: "RX", qubits: [2], angle: Math.PI / 4, label: "RX" },
    { id: "4", type: "Z", qubits: [0], label: "Z" },
    { id: "5", type: "H", qubits: [1], label: "H" },
  ],
};

const mockJobs = [
  {
    id: "job-001",
    position: 1,
    estimatedWait: 15,
    complexity: 2.5,
    priority: 9,
    status: "running" as const,
  },
  {
    id: "job-002",
    position: 2,
    estimatedWait: 45,
    complexity: 3.2,
    priority: 7,
    status: "pending" as const,
  },
  {
    id: "job-003",
    position: 3,
    estimatedWait: 78,
    complexity: 4.1,
    priority: 5,
    status: "pending" as const,
  },
  {
    id: "job-004",
    position: 4,
    estimatedWait: 120,
    complexity: 2.8,
    priority: 3,
    status: "pending" as const,
  },
  {
    id: "job-005",
    position: 5,
    estimatedWait: 180,
    complexity: 5.2,
    priority: 8,
    status: "pending" as const,
  },
];

const mockCollaborators = [
  {
    id: "user-001",
    email: "alice@example.com",
    role: "editor" as const,
    joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    avatar: "A",
  },
  {
    id: "user-002",
    email: "bob@example.com",
    role: "viewer" as const,
    joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    avatar: "B",
  },
];

const mockComments = [
  {
    id: "comment-001",
    author: "Alice Chen",
    content: "Consider using RY gates for better state preparation",
    gateIndex: 2,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    avatar: "A",
  },
  {
    id: "comment-002",
    author: "Bob Smith",
    content: "This circuit produces excellent entanglement. Great work!",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    avatar: "B",
  },
];

const mockVersions = [
  {
    id: "version-001",
    versionNumber: 3,
    changes: "Optimized gate sequence for reduced depth",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    createdBy: "You",
  },
  {
    id: "version-002",
    versionNumber: 2,
    changes: "Added measurement gates",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "Alice Chen",
  },
  {
    id: "version-001",
    versionNumber: 1,
    changes: "Initial circuit creation",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "You",
  },
];

export default function FeaturesPage() {
  const [selectedGate, setSelectedGate] = useState(null);

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Quantum Platform Features</h1>
        <p className="text-slate-400">Explore powerful tools for quantum computing</p>
      </div>

      <Tabs defaultValue="visualizer" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-900 border border-slate-700">
          <TabsTrigger value="visualizer" className="gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Circuit Visualizer</span>
            <span className="sm:hidden">Visualizer</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Queue Analytics</span>
            <span className="sm:hidden">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="collaboration" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Collaboration</span>
            <span className="sm:hidden">Team</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visualizer" className="space-y-6">
          <div className="grid gap-6">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle>Feature Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-300">
                <p>
                  <span className="font-semibold text-white">Real-time Visualization:</span> Watch
                  your quantum circuit execute step-by-step with live state evolution.
                </p>
                <p>
                  <span className="font-semibold text-white">Interactive Debugging:</span> Click on
                  gates to inspect their properties and measurement probabilities.
                </p>
                <p>
                  <span className="font-semibold text-white">Entanglement Mapping:</span> Visualize
                  quantum correlations and state probabilities in real-time.
                </p>
              </CardContent>
            </Card>

            <QuantumCircuitVisualizer circuit={mockCircuit} onGateSelect={setSelectedGate} />
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle>Feature Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-300">
                <p>
                  <span className="font-semibold text-white">Live Queue Monitoring:</span> See
                  real-time job positions, wait times, and priority levels.
                </p>
                <p>
                  <span className="font-semibold text-white">ML-Powered Predictions:</span> Get
                  accurate execution time estimates based on historical data.
                </p>
                <p>
                  <span className="font-semibold text-white">Smart Suggestions:</span> Receive
                  optimization recommendations to improve throughput.
                </p>
              </CardContent>
            </Card>

            <JobQueueAnalytics jobs={mockJobs} />
          </div>
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-6">
          <div className="grid gap-6">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle>Feature Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-300">
                <p>
                  <span className="font-semibold text-white">Team Sharing:</span> Invite team
                  members with customizable access levels (viewer, editor, owner).
                </p>
                <p>
                  <span className="font-semibold text-white">Version Control:</span> Track all
                  changes with detailed history and easy rollback capabilities.
                </p>
                <p>
                  <span className="font-semibold text-white">Real-time Discussion:</span> Add
                  annotations to specific gates and collaborate with your team.
                </p>
              </CardContent>
            </Card>

            <CollaborativeWorkspace
              circuitId="circuit-001"
              circuitName={mockCircuit.name}
              owner="you@example.com"
              collaborators={mockCollaborators}
              comments={mockComments}
              versions={mockVersions}
              onShareClick={() => alert("Share functionality would open invite dialog")}
              onAddCollaborator={(email, role) =>
                alert(`Would add ${email} as ${role}`)
              }
              onRemoveCollaborator={(id) => alert(`Would remove collaborator ${id}`)}
              onAddComment={(content, gateIndex) =>
                alert(`Would add comment: "${content}" ${gateIndex ? `to gate ${gateIndex}` : ""}`)
              }
              onRestoreVersion={(versionId) => alert(`Would restore version ${versionId}`)}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
