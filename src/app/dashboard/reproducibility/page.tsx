"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Download, Share2, Check, AlertCircle, GitFork, Code2, CheckCircle2, XCircle, Clock, Activity, Shield, Target, TrendingUp, BarChart3, Filter, RefreshCw, Eye, Upload, Database, Brain, Zap } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface ExecutionRecord {
  id: string;
  jobId: string;
  timestamp: string;
  status: "success" | "failed" | "running";
  environment: {
    seed: number;
    hardware: string;
    framework: string;
    version: string;
    temperature: number;
    pressure: number;
    errorCorrection: string;
  };
  metrics: {
    duration: number;
    accuracy: number;
    iterations: number;
    fidelity: number;
    errorRate: number;
    throughput: number;
  };
  parameters: Record<string, string | number>;
  inputHash: string;
  outputHash: string;
  blockchainHash: string;
  reproducibilityScore: number;
  driftDetected: boolean;
  anomalies: string[];
  notes: string;
}

const mockExecutionRecords: ExecutionRecord[] = [
  {
    id: "exec-001",
    jobId: "job-1024",
    timestamp: "2024-11-22T10:30:00Z",
    status: "success",
    environment: {
      seed: 42,
      hardware: "CPU",
      framework: "Qiskit",
      version: "0.43.0",
    },
    metrics: {
      duration: 2.4,
      accuracy: 0.95,
      iterations: 1000,
    },
    parameters: {
      depth: 5,
      qubits: 8,
      shots: 1024,
    },
    inputHash: "a1b2c3d4e5f6",
    outputHash: "x9y8z7w6v5u4",
    notes: "Baseline execution with optimal parameters",
  },
  {
    id: "exec-002",
    jobId: "job-1025",
    timestamp: "2024-11-22T09:15:00Z",
    status: "success",
    environment: {
      seed: 42,
      hardware: "GPU",
      framework: "Qiskit",
      version: "0.43.0",
    },
    metrics: {
      duration: 1.8,
      accuracy: 0.95,
      iterations: 1000,
    },
    parameters: {
      depth: 5,
      qubits: 8,
      shots: 1024,
    },
    inputHash: "a1b2c3d4e5f6",
    outputHash: "x9y8z7w6v5u4",
    notes: "GPU acceleration test",
  },
  {
    id: "exec-003",
    jobId: "job-1026",
    timestamp: "2024-11-22T08:45:00Z",
    status: "failed",
    environment: {
      seed: 123,
      hardware: "CPU",
      framework: "Cirq",
      version: "1.0.0",
    },
    metrics: {
      duration: 0.5,
      accuracy: 0,
      iterations: 0,
    },
    parameters: {
      depth: 10,
      qubits: 16,
      shots: 2048,
    },
    inputHash: "b2c3d4e5f6g7",
    outputHash: "y8z7w6v5u4t3",
    notes: "Parameter mismatch detected",
  },
];

export default function ReproducibilityDashboard() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<ExecutionRecord | null>(
    mockExecutionRecords[0]
  );

  const handleCopyHash = (hash: string, type: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(type);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadSnapshot = (record: ExecutionRecord) => {
    const snapshot = {
      execution: record,
      timestamp: new Date().toISOString(),
      platform: "QuantumChain",
    };

    const dataStr = JSON.stringify(snapshot, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `execution-${record.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "running":
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "success":
        return "default";
      case "failed":
        return "destructive";
      case "running":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Reproducibility Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Track and verify execution consistency across different environments
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Monitor execution reproducibility by comparing execution records, parameters, and
          output hashes across different runs and environments.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="executions" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="executions">Executions</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
        </TabsList>

        {/* Executions Tab */}
        <TabsContent value="executions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Execution List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Executions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {mockExecutionRecords.map((record) => (
                    <button
                      key={record.id}
                      onClick={() => setSelectedRecord(record)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedRecord?.id === record.id
                          ? "bg-primary/10 border-primary/40"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{record.jobId}</span>
                        {getStatusIcon(record.status)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(record.timestamp).toLocaleString()}
                      </p>
                      <Badge variant={getStatusBadgeVariant(record.status)} className="mt-2">
                        {record.status}
                      </Badge>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Execution Details */}
            {selectedRecord && (
              <div className="lg:col-span-2 space-y-4">
                {/* Overview */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getStatusIcon(selectedRecord.status)}
                        {selectedRecord.jobId}
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadSnapshot(selectedRecord)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge
                          variant={getStatusBadgeVariant(selectedRecord.status)}
                          className="mt-1"
                        >
                          {selectedRecord.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Timestamp</p>
                        <p className="text-sm font-medium mt-1">
                          {new Date(selectedRecord.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Hashes */}
                    <div className="space-y-3 pt-2 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          Input Hash
                          <Code2 className="h-3 w-3" />
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="bg-muted px-3 py-2 rounded text-xs flex-1 overflow-x-auto">
                            {selectedRecord.inputHash}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleCopyHash(selectedRecord.inputHash, "input")
                            }
                          >
                            {copiedId === "input" ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          Output Hash
                          <Code2 className="h-3 w-3" />
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="bg-muted px-3 py-2 rounded text-xs flex-1 overflow-x-auto">
                            {selectedRecord.outputHash}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleCopyHash(selectedRecord.outputHash, "output")
                            }
                          >
                            {copiedId === "output" ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Environment */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Environment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Hardware</p>
                        <p className="font-medium">{selectedRecord.environment.hardware}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Framework</p>
                        <p className="font-medium">
                          {selectedRecord.environment.framework} v{selectedRecord.environment.version}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Random Seed</p>
                        <p className="font-medium">{selectedRecord.environment.seed}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="text-2xl font-bold">{selectedRecord.metrics.duration}s</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Accuracy</p>
                        <p className="text-2xl font-bold">
                          {(selectedRecord.metrics.accuracy * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Iterations</p>
                        <p className="text-2xl font-bold">{selectedRecord.metrics.iterations}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Parameters */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Parameters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(selectedRecord.parameters).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{key}</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                {selectedRecord.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground">{selectedRecord.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Execution Comparison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <GitFork className="h-4 w-4" />
                <AlertDescription>
                  Compare execution records to identify variations in parameters, environment,
                  and results
                </AlertDescription>
              </Alert>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Job ID</th>
                      <th className="text-left py-2 px-2">Status</th>
                      <th className="text-left py-2 px-2">Hardware</th>
                      <th className="text-left py-2 px-2">Duration</th>
                      <th className="text-left py-2 px-2">Accuracy</th>
                      <th className="text-left py-2 px-2">Seed</th>
                      <th className="text-left py-2 px-2">Match</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockExecutionRecords.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-2">{record.jobId}</td>
                        <td className="py-2 px-2">
                          <Badge variant={getStatusBadgeVariant(record.status)}>
                            {record.status}
                          </Badge>
                        </td>
                        <td className="py-2 px-2">{record.environment.hardware}</td>
                        <td className="py-2 px-2">{record.metrics.duration}s</td>
                        <td className="py-2 px-2">
                          {(record.metrics.accuracy * 100).toFixed(1)}%
                        </td>
                        <td className="py-2 px-2">{record.environment.seed}</td>
                        <td className="py-2 px-2">
                          {record.inputHash === mockExecutionRecords[0].inputHash ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Verify execution reproducibility by checking consistency across runs
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {[
                  {
                    label: "Parameter Consistency",
                    status: "verified",
                    description:
                      "All executions use identical parameters",
                  },
                  {
                    label: "Environment Match",
                    status: "warning",
                    description:
                      "2 out of 3 executions match baseline environment",
                  },
                  {
                    label: "Output Reproducibility",
                    status: "verified",
                    description:
                      "Successful executions produce identical output hashes",
                  },
                  {
                    label: "Random Seed Control",
                    status: "failed",
                    description:
                      "Execution 3 uses different seed (123 vs 42)",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-3 border rounded-lg"
                  >
                    <div className="mt-1">
                      {item.status === "verified" && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                      {item.status === "warning" && (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                      {item.status === "failed" && (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
