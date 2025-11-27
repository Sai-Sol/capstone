"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy,
  Download,
  Share2,
  Check,
  AlertCircle,
  GitFork,
  Code2,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Save,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useExecutions } from "@/hooks/use-executions";
import { useToast } from "@/hooks/use-toast";
import { ReproducibilityComparison } from "@/components/reproducibility-comparison";

const mockExecutionRecords = [
  {
    id: "exec-001",
    jobId: "job-1024",
    timestamp: "2024-11-22T10:30:00Z",
    status: "success" as const,
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
    status: "success" as const,
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
    timestamp: "2024-11-21T14:45:00Z",
    status: "success" as const,
    environment: {
      seed: 42,
      hardware: "TPU",
      framework: "Cirq",
      version: "1.0.0",
    },
    metrics: {
      duration: 1.2,
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
    notes: "TPU execution - optimal performance",
  },
  {
    id: "exec-004",
    jobId: "job-1027",
    timestamp: "2024-11-20T11:20:00Z",
    status: "success" as const,
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
    notes: "Verification run - reproducibility check",
  },
];

export default function ReproducibilityDashboard() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState(mockExecutionRecords[0]);
  const [activeTab, setActiveTab] = useState("executions");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const { saveExecution, fetchHistory, executions, loading } = useExecutions();
  const { toast } = useToast();

  useEffect(() => {
    if (activeTab === "executions") {
      fetchHistory(20, 0);
    }
  }, [activeTab, fetchHistory]);

  const handleCopyHash = (hash: string, type: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(type);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadSnapshot = (record: any) => {
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

  const handleSaveExecution = async () => {
    const result = await saveExecution({
      jobId: selectedRecord.jobId,
      circuitCode: "OPENQASM 2.0; include 'qelib1.inc'; qreg q[3]; creg c[3];",
      status: selectedRecord.status,
      environment: selectedRecord.environment,
      parameters: selectedRecord.parameters,
      metrics: selectedRecord.metrics,
      notes: selectedRecord.notes,
    });

    if (result) {
      setSaveMessage("Execution record saved successfully!");
      setTimeout(() => setSaveMessage(null), 3000);
    }
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

  const executionRecords = executions.length > 0 ? executions : mockExecutionRecords;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
          Reproducibility Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Track and verify execution consistency across different environments
        </p>
      </div>

      {saveMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <Alert className="bg-green-500/10 border-green-500/50">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-400">
              {saveMessage}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Monitor execution reproducibility by comparing execution records, parameters, and
          output hashes across different runs and environments.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="executions">Executions</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="executions" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Executions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : (
                    executionRecords.map((record: any) => (
                      <motion.button
                        key={record.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedRecord(record)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedRecord?.id === record.id
                            ? "bg-primary/10 border-primary/40"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{record.jobId || record.job_id}</span>
                          {getStatusIcon(record.status)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(record.timestamp || record.created_at).toLocaleString()}
                        </p>
                        <Badge
                          variant={getStatusBadgeVariant(record.status)}
                          className="mt-2"
                        >
                          {record.status}
                        </Badge>
                      </motion.button>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {selectedRecord && (
              <div className="lg:col-span-2 space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {getStatusIcon(selectedRecord.status)}
                          {selectedRecord.jobId || selectedRecord.job_id}
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
                            {new Date(selectedRecord.timestamp || selectedRecord.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 pt-2 border-t">
                        <div>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            Input Hash
                            <Code2 className="h-3 w-3" />
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="bg-muted px-3 py-2 rounded text-xs flex-1 overflow-x-auto">
                              {selectedRecord.inputHash || selectedRecord.input_hash || "N/A"}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleCopyHash(
                                  selectedRecord.inputHash || selectedRecord.input_hash,
                                  "input"
                                )
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
                              {selectedRecord.outputHash || selectedRecord.output_hash || "N/A"}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleCopyHash(
                                  selectedRecord.outputHash || selectedRecord.output_hash,
                                  "output"
                                )
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
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Environment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Hardware</p>
                          <p className="font-medium">
                            {selectedRecord.environment?.hardware || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Framework</p>
                          <p className="font-medium">
                            {selectedRecord.environment?.framework} v
                            {selectedRecord.environment?.version}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Random Seed</p>
                          <p className="font-medium">
                            {selectedRecord.environment?.seed}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Duration</p>
                          <p className="text-2xl font-bold">
                            {selectedRecord.metrics?.duration}s
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Accuracy</p>
                          <p className="text-2xl font-bold">
                            {(selectedRecord.metrics?.accuracy * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Iterations</p>
                          <p className="text-2xl font-bold">
                            {selectedRecord.metrics?.iterations}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Parameters</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(selectedRecord.parameters || {}).map(
                          ([key, value]) => (
                            <div key={key} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{key}</span>
                              <span className="font-medium">{String(value)}</span>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Button
                    onClick={handleSaveExecution}
                    className="w-full"
                    size="lg"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Execution Record
                  </Button>
                </motion.div>

                {selectedRecord.notes && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-foreground">{selectedRecord.notes}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4 mt-6">
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
                    {executionRecords.map((record: any) => (
                      <tr key={record.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-2">{record.jobId || record.job_id}</td>
                        <td className="py-2 px-2">
                          <Badge
                            variant={getStatusBadgeVariant(record.status)}
                          >
                            {record.status}
                          </Badge>
                        </td>
                        <td className="py-2 px-2">
                          {record.environment?.hardware}
                        </td>
                        <td className="py-2 px-2">{record.metrics?.duration}s</td>
                        <td className="py-2 px-2">
                          {(record.metrics?.accuracy * 100).toFixed(1)}%
                        </td>
                        <td className="py-2 px-2">{record.environment?.seed}</td>
                        <td className="py-2 px-2">
                          {record.inputHash === executionRecords[0].inputHash ? (
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

        <TabsContent value="analytics" className="space-y-6 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ReproducibilityComparison
              data={[
                { execution: "exec-001", hardware: "CPU", duration: 2.4, accuracy: 0.95, match: true },
                { execution: "exec-002", hardware: "GPU", duration: 1.8, accuracy: 0.95, match: true },
                { execution: "exec-003", hardware: "TPU", duration: 1.2, accuracy: 0.95, match: true },
                { execution: "exec-004", hardware: "CPU", duration: 2.4, accuracy: 0.95, match: true },
              ]}
              reproducibilityScore={92}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="quantum-card">
              <CardHeader>
                <CardTitle>Reproducibility Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
                    <p className="text-sm text-muted-foreground mb-2">Successful Reruns</p>
                    <p className="text-3xl font-bold text-green-400">4/4</p>
                    <p className="text-xs text-muted-foreground mt-2">100% reproducibility</p>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
                    <p className="text-sm text-muted-foreground mb-2">Output Hash Match</p>
                    <p className="text-3xl font-bold text-cyan-400">4/4</p>
                    <p className="text-xs text-muted-foreground mt-2">Identical results</p>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                    <p className="text-sm text-muted-foreground mb-2">Avg Execution Variance</p>
                    <p className="text-3xl font-bold text-purple-400">±0.3%</p>
                    <p className="text-xs text-muted-foreground mt-2">Consistent performance</p>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30">
                    <p className="text-sm text-muted-foreground mb-2">Seed Control Status</p>
                    <p className="text-2xl font-bold text-orange-400">Fixed</p>
                    <p className="text-xs text-muted-foreground mt-2">Seed=42 across all runs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="quantum-card">
              <CardHeader>
                <CardTitle>Best Practices Implemented</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-green-500/30 bg-green-500/10">
                    <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-300">Fixed Random Seed</p>
                      <p className="text-xs text-muted-foreground mt-1">All executions use seed 42 for deterministic results</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-green-500/30 bg-green-500/10">
                    <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-300">Environment Tracking</p>
                      <p className="text-xs text-muted-foreground mt-1">All hardware and software versions recorded consistently</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-green-500/30 bg-green-500/10">
                    <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-300">Input/Output Hashing</p>
                      <p className="text-xs text-muted-foreground mt-1">SHA256 hashes ensure data integrity verification</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-green-500/30 bg-green-500/10">
                    <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-300">Parameter Consistency</p>
                      <p className="text-xs text-muted-foreground mt-1">All circuit parameters identical across runs</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="verification" className="space-y-4 mt-6">
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
                    status: "verified" as const,
                    description: "All executions use identical parameters",
                  },
                  {
                    label: "Environment Match",
                    status: "warning" as const,
                    description: "2 out of 3 executions match baseline environment",
                  },
                  {
                    label: "Output Reproducibility",
                    status: "verified" as const,
                    description: "Successful executions produce identical output hashes",
                  },
                  {
                    label: "Random Seed Control",
                    status: "verified" as const,
                    description: "All executions use controlled random seeds",
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
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
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
