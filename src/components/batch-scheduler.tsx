"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, Plus, Play, X, Package } from "lucide-react";

interface BatchJob {
  id: string;
  name: string;
  jobType: string;
  algorithm: string;
  priority: string;
  scheduledTime?: string;
  enabled: boolean;
}

interface BatchSchedulerProps {
  currentFormData?: any;
  onSubmitBatch?: (batch: BatchJob[]) => void;
}

export function BatchScheduler({ currentFormData, onSubmitBatch }: BatchSchedulerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [batchJobs, setBatchJobs] = useState<BatchJob[]>([]);
  const [batchName, setBatchName] = useState("");
  const [executionMode, setExecutionMode] = useState<"sequential" | "parallel">(
    "sequential"
  );
  const [startTime, setStartTime] = useState("");
  const [repeatCount, setRepeatCount] = useState(1);
  const [intervalMinutes, setIntervalMinutes] = useState(5);

  const handleAddCurrentJob = () => {
    if (currentFormData?.jobType && currentFormData?.description) {
      const newJob: BatchJob = {
        id: Date.now().toString(),
        name: `Job ${batchJobs.length + 1}`,
        jobType: currentFormData.jobType,
        algorithm: currentFormData.description,
        priority: currentFormData.priority || "medium",
        enabled: true,
      };
      setBatchJobs([...batchJobs, newJob]);
    }
  };

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

  const handleSubmitBatch = () => {
    const enabledJobs = batchJobs.filter((job) => job.enabled);
    if (enabledJobs.length > 0) {
      const scheduledJobs = enabledJobs.map((job, idx) => ({
        ...job,
        scheduledTime:
          executionMode === "sequential"
            ? new Date(
                Date.now() + idx * intervalMinutes * 60 * 1000
              ).toISOString()
            : startTime || undefined,
      }));

      onSubmitBatch?.(scheduledJobs);
      setBatchJobs([]);
      setBatchName("");
      setIsOpen(false);
    }
  };

  const enabledCount = batchJobs.filter((job) => job.enabled).length;
  const totalEstimatedTime =
    enabledCount > 0
      ? executionMode === "sequential"
        ? enabledCount * (intervalMinutes + 5)
        : 30
      : 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 w-full">
          <Package className="h-4 w-4" />
          Batch & Schedule Jobs
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Batch Job Scheduler
          </DialogTitle>
          <DialogDescription>
            Create, schedule, and submit multiple quantum jobs efficiently
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Batch Name</label>
            <Input
              placeholder="e.g., Bell State Experiments"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Execution Mode
              </label>
              <Select value={executionMode} onValueChange={(value: any) => setExecutionMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sequential">
                    Sequential (One after another)
                  </SelectItem>
                  <SelectItem value="parallel">
                    Parallel (All at once)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {executionMode === "sequential" && (
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">
                  Interval (minutes)
                </label>
                <Input
                  type="number"
                  min="1"
                  value={intervalMinutes}
                  onChange={(e) => setIntervalMinutes(parseInt(e.target.value))}
                />
              </div>
            )}

            {executionMode === "parallel" && (
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">
                  Start Time (Optional)
                </label>
                <Input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Jobs in Batch</h4>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddCurrentJob}
                disabled={!currentFormData?.jobType}
                className="gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Current Job
              </Button>
            </div>

            {batchJobs.length === 0 ? (
              <div className="text-center py-8 bg-slate-950 rounded border border-dashed border-slate-700">
                <Package className="h-8 w-8 mx-auto mb-2 text-slate-500" />
                <p className="text-sm text-slate-400">No jobs in batch yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Add your first quantum job to create a batch
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {batchJobs.map((job, idx) => (
                  <div
                    key={job.id}
                    className="flex items-center gap-3 p-3 bg-slate-950 rounded border border-slate-700"
                  >
                    <Checkbox
                      checked={job.enabled}
                      onCheckedChange={() => handleToggleJob(job.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{job.name}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge
                          variant="outline"
                          className="text-xs bg-blue-500/10 text-blue-400"
                        >
                          {job.jobType}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            job.priority === "high"
                              ? "bg-red-500/10 text-red-400"
                              : job.priority === "medium"
                                ? "bg-yellow-500/10 text-yellow-400"
                                : "bg-green-500/10 text-green-400"
                          }`}
                        >
                          {job.priority}
                        </Badge>
                        {executionMode === "sequential" && (
                          <span className="text-xs text-slate-500">
                            +{idx * intervalMinutes}m
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                        {job.algorithm.substring(0, 50)}...
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveJob(job.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {enabledCount > 0 && (
            <Card className="bg-slate-950 border-slate-700">
              <CardContent className="pt-4 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Jobs</p>
                    <p className="text-xl font-bold text-blue-400">{enabledCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Mode</p>
                    <p className="text-sm font-semibold text-green-400 capitalize">
                      {executionMode}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Est. Time</p>
                    <p className="text-sm font-semibold text-purple-400 flex items-center gap-1 justify-center">
                      <Clock className="h-3 w-3" />
                      {totalEstimatedTime}m
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitBatch}
              disabled={enabledCount === 0}
              className="flex-1 gap-2"
            >
              <Play className="h-4 w-4" />
              Submit Batch ({enabledCount})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
