"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Clock, Zap, AlertCircle } from "lucide-react";

interface QueueJob {
  id: string;
  position: number;
  estimatedWait: number;
  complexity: number;
  priority: number;
  status: "pending" | "running" | "completed";
}

interface AnalyticsData {
  timestamp: string;
  avgWaitTime: number;
  queueSize: number;
  completionRate: number;
  predictedTime: number;
}

interface JobQueueAnalyticsProps {
  jobs: QueueJob[];
  historicalData?: AnalyticsData[];
}

export function JobQueueAnalytics({ jobs, historicalData = [] }: JobQueueAnalyticsProps) {
  const [selectedJob, setSelectedJob] = useState<QueueJob | null>(null);
  const [predictedWaitTime, setPredictedWaitTime] = useState(0);
  const [analyticsData, setAnalyticsData] = useState(historicalData);

  useEffect(() => {
    if (jobs.length === 0) return;

    const avgComplexity = jobs.reduce((sum, j) => sum + j.complexity, 0) / jobs.length;
    const predictedWait = Math.ceil((avgComplexity * jobs.length) / 10);
    setPredictedWaitTime(predictedWait);

    const newDataPoint: AnalyticsData = {
      timestamp: new Date().toLocaleTimeString(),
      avgWaitTime: jobs.reduce((sum, j) => sum + j.estimatedWait, 0) / jobs.length,
      queueSize: jobs.length,
      completionRate: Math.random() * 100,
      predictedTime: predictedWait,
    };

    setAnalyticsData((prev) => {
      const updated = [...prev, newDataPoint];
      return updated.slice(-20);
    });
  }, [jobs]);

  const metrics = {
    totalJobs: jobs.length,
    avgWaitTime: jobs.length > 0 ? Math.ceil(jobs.reduce((sum, j) => sum + j.estimatedWait, 0) / jobs.length) : 0,
    highPriority: jobs.filter((j) => j.priority >= 8).length,
    runningJobs: jobs.filter((j) => j.status === "running").length,
  };

  const getQueuePosition = (job: QueueJob) => {
    const position = jobs.findIndex((j) => j.id === job.id);
    return position >= 0 ? position + 1 : job.position;
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return "text-red-400 bg-red-500/10";
    if (priority >= 5) return "text-yellow-400 bg-yellow-500/10";
    return "text-green-400 bg-green-500/10";
  };

  const getStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: "bg-slate-500/10 text-slate-400",
      running: "bg-blue-500/10 text-blue-400",
      completed: "bg-green-500/10 text-green-400",
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-blue-400 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Queue Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{metrics.totalJobs}</p>
            <p className="text-xs text-blue-400/60 mt-1">Active jobs</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-green-400 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Avg Wait Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{metrics.avgWaitTime}s</p>
            <p className="text-xs text-green-400/60 mt-1">Estimated</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-purple-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Predicted Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{predictedWaitTime}s</p>
            <p className="text-xs text-purple-400/60 mt-1">ML estimate</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-orange-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              High Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{metrics.highPriority}</p>
            <p className="text-xs text-orange-400/60 mt-1">In queue</p>
          </CardContent>
        </Card>
      </div>

      {analyticsData.length > 0 && (
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle>Queue Analytics Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData}>
                <defs>
                  <linearGradient id="colorWait" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorQueue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="timestamp" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                  }}
                  cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="avgWaitTime"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorWait)"
                  name="Avg Wait (s)"
                />
                <Area
                  type="monotone"
                  dataKey="queueSize"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorQueue)"
                  name="Queue Size"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle>Queue Optimization Suggestions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {metrics.highPriority > 0 && (
            <div className="flex gap-3 items-start p-3 bg-orange-500/10 rounded border border-orange-500/20">
              <AlertCircle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-orange-400">
                  {metrics.highPriority} high-priority jobs in queue
                </p>
                <p className="text-xs text-orange-300/60 mt-1">
                  Consider prioritizing these jobs to improve overall system throughput
                </p>
              </div>
            </div>
          )}

          {metrics.avgWaitTime > 60 && (
            <div className="flex gap-3 items-start p-3 bg-yellow-500/10 rounded border border-yellow-500/20">
              <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-400">High average wait time detected</p>
                <p className="text-xs text-yellow-300/60 mt-1">
                  Queue is experiencing delays. Consider parallel execution strategies.
                </p>
              </div>
            </div>
          )}

          {metrics.totalJobs > 20 && (
            <div className="flex gap-3 items-start p-3 bg-blue-500/10 rounded border border-blue-500/20">
              <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-400">Queue capacity approaching limit</p>
                <p className="text-xs text-blue-300/60 mt-1">
                  {metrics.totalJobs} jobs queued. Batch execution recommended.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {jobs.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No jobs in queue</p>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                  className="p-3 bg-slate-950 rounded border border-slate-700 cursor-pointer hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm">{job.id.slice(0, 8)}...</p>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getStatusBadge(job.status)}`}
                        >
                          {job.status}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getPriorityColor(job.priority)}`}
                        >
                          P{job.priority}
                        </Badge>
                      </div>
                      {selectedJob?.id === job.id && (
                        <div className="mt-2 space-y-1 text-xs text-slate-400">
                          <p>Queue Position: {getQueuePosition(job)}</p>
                          <p>Est. Wait: {job.estimatedWait}s</p>
                          <p>
                            Complexity:{" "}
                            <span className="text-blue-400">{job.complexity.toFixed(2)}</span>
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-green-400">
                        {getQueuePosition(job)}
                      </div>
                      <Progress
                        value={(job.position / Math.max(jobs.length, 1)) * 100}
                        className="w-24 mt-1 h-1"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
