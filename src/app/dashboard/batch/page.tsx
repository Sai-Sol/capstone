"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Plus, Play, X, Package, Loader2, CheckCircle2 } from "lucide-react";

const mockBatchJobs = [
  {
    id: "1",
    name: "Bell State - Entanglement Test",
    algorithm: "Bell State",
    priority: "high",
    enabled: true,
    scheduledTime: "2024-01-25 14:00",
  },
  {
    id: "2",
    name: "Grover's Algorithm - 3 Qubits",
    algorithm: "Grover Search",
    priority: "medium",
    enabled: true,
    scheduledTime: "2024-01-25 14:15",
  },
  {
    id: "3",
    name: "VQE - Molecule Simulation",
    algorithm: "VQE",
    priority: "high",
    enabled: false,
    scheduledTime: "2024-01-25 14:30",
  },
];

export default function BatchPage() {
  const [batchJobs, setBatchJobs] = useState(mockBatchJobs);
  const [batchName, setBatchName] = useState("Morning Quantum Experiments");
  const [executionMode, setExecutionMode] = useState<"sequential" | "parallel">(
    "sequential"
  );
  const [startTime, setStartTime] = useState("2024-01-25T14:00");
  const [repeatCount, setRepeatCount] = useState(1);
  const [intervalMinutes, setIntervalMinutes] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleToggleJob = (id: string) => {
    setBatchJobs(
      batchJobs.map((job) =>
        job.id === id ? { ...job, enabled: !job.enabled } : job
      )
    );
  };

  const handleRemoveJob = (id: string) => {
    setBatchJobs(batchJobs.filter((job) => job.id !== id));
  };

  const handleSubmitBatch = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSubmitted(true);
    setIsSubmitting(false);
  };

  const enabledCount = batchJobs.filter((j) => j.enabled).length;
  const totalTime = enabledCount * intervalMinutes;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-400 border-red-500/50 bg-red-500/10";
      case "medium":
        return "text-yellow-400 border-yellow-500/50 bg-yellow-500/10";
      case "low":
        return "text-green-400 border-green-500/50 bg-green-500/10";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-emerald-400 to-teal-400 bg-clip-text text-transparent mb-4">
          Batch Job Submission & Scheduling
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Submit multiple quantum jobs in one batch with intelligent scheduling,
          parallel execution, and automated retry logic.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 space-y-4">
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Batch Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Batch Name</label>
                <Input
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder="Enter batch name..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Execution Mode</label>
                  <Select value={executionMode} onValueChange={(v: any) => setExecutionMode(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sequential">Sequential</SelectItem>
                      <SelectItem value="parallel">Parallel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Time</label>
                  <Input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
              </div>

              {executionMode === "sequential" && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Repeat Count</label>
                    <Input
                      type="number"
                      min="1"
                      value={repeatCount}
                      onChange={(e) => setRepeatCount(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Interval (minutes)</label>
                    <Input
                      type="number"
                      min="1"
                      value={intervalMinutes}
                      onChange={(e) =>
                        setIntervalMinutes(Math.max(1, parseInt(e.target.value) || 1))
                      }
                    />
                  </div>
                </div>
              )}

              <Alert className="border-blue-500/50 bg-blue-500/10">
                <Clock className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-400 text-sm">
                  {executionMode === "sequential"
                    ? `Estimated duration: ${totalTime} minutes for ${enabledCount} enabled jobs`
                    : `All ${enabledCount} jobs will run in parallel simultaneously`}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                Jobs in Batch ({enabledCount}/{batchJobs.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {batchJobs.map((job, idx) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 rounded-lg border border-border hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={job.enabled}
                      onCheckedChange={() => handleToggleJob(job.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{job.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {job.algorithm}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={getPriorityColor(job.priority)}
                        >
                          {job.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{job.scheduledTime}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveJob(job.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}

              <Button variant="outline" size="sm" className="w-full mt-2">
                <Plus className="mr-2 h-4 w-4" />
                Add Job to Batch
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded bg-background/50">
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold text-primary">{batchJobs.length}</p>
              </div>

              <div className="p-3 rounded bg-background/50">
                <p className="text-sm text-muted-foreground">Enabled</p>
                <p className="text-2xl font-bold text-green-400">{enabledCount}</p>
              </div>

              <div className="p-3 rounded bg-background/50">
                <p className="text-sm text-muted-foreground">Est. Duration</p>
                <p className="text-2xl font-bold text-blue-400">
                  {executionMode === "sequential" ? `${totalTime}m` : "Parallel"}
                </p>
              </div>

              <div className="p-3 rounded bg-background/50">
                <p className="text-sm text-muted-foreground">Mode</p>
                <p className="text-lg font-bold capitalize text-cyan-400">
                  {executionMode}
                </p>
              </div>
            </CardContent>
          </Card>

          {!submitted ? (
            <Button
              onClick={handleSubmitBatch}
              size="lg"
              className="w-full"
              disabled={isSubmitting || enabledCount === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Submit Batch
                </>
              )}
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="quantum-card border-green-500/50 bg-green-500/10">
                <CardContent className="pt-6 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-3" />
                  <p className="font-semibold text-green-400">Batch Submitted!</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    All jobs are queued for execution
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <Card className="quantum-card border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-sm">Advanced Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>Intelligent scheduling</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span>Automatic retry logic</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span>Progress tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <span>Batch cancellation</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
