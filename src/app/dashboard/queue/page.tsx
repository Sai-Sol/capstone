"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, TrendingUp, Zap, AlertCircle } from "lucide-react";
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

const mockQueueData = [
  { id: "QJ-001", position: 1, wait: 2, complexity: 0.6, status: "running" },
  { id: "QJ-002", position: 2, wait: 5, complexity: 0.4, status: "pending" },
  { id: "QJ-003", position: 3, wait: 8, complexity: 0.7, status: "pending" },
  { id: "QJ-004", position: 4, wait: 12, complexity: 0.5, status: "pending" },
];

const analyticsData = [
  { time: "10:00", avgWait: 2, queue: 3, completion: 85 },
  { time: "10:15", avgWait: 4, queue: 5, completion: 82 },
  { time: "10:30", avgWait: 6, queue: 7, completion: 88 },
  { time: "10:45", avgWait: 5, queue: 4, completion: 90 },
  { time: "11:00", avgWait: 3, queue: 2, completion: 92 },
];

export default function QueueAnalyticsPage() {
  const [selectedJob, setSelectedJob] = useState(mockQueueData[0]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "text-green-400 border-green-400/50";
      case "pending":
        return "text-yellow-400 border-yellow-400/50";
      default:
        return "text-gray-400 border-gray-400/50";
    }
  };

  return (
    <div className="space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-green-400 to-emerald-400 bg-clip-text text-transparent mb-4">
          Job Queue Analytics
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Real-time queue monitoring, predictive execution times, and intelligent optimization recommendations.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid md:grid-cols-4 gap-4"
      >
        <Card className="quantum-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Queue Length</p>
                <p className="text-3xl font-bold text-primary">{mockQueueData.length}</p>
              </div>
              <Zap className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="quantum-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Wait Time</p>
                <p className="text-3xl font-bold text-blue-400">6.75m</p>
              </div>
              <Clock className="h-8 w-8 text-blue-400/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="quantum-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-3xl font-bold text-green-400">89.4%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="quantum-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Throughput</p>
                <p className="text-3xl font-bold text-cyan-400">12 jobs/hr</p>
              </div>
              <AlertCircle className="h-8 w-8 text-cyan-400/50" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 space-y-6">
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle>Queue Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                  <Legend />
                  <Line type="monotone" dataKey="avgWait" stroke="#3b82f6" name="Avg Wait (min)" strokeWidth={2} />
                  <Line type="monotone" dataKey="completion" stroke="#10b981" name="Completion %" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="quantum-card">
            <CardHeader>
              <CardTitle>Queue Depth Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                  <Area type="monotone" dataKey="queue" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.2} name="Queue Size" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="text-lg">Current Queue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockQueueData.map((job, idx) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setSelectedJob(job)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedJob.id === job.id
                      ? "bg-primary/20 border-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-semibold">{job.id}</span>
                    <Badge variant="outline" className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Position: #{job.position}</span>
                      <span className="text-primary font-mono">Est. {job.wait}m</span>
                    </div>
                    <Progress value={job.complexity * 100} className="h-1" />
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {selectedJob && (
            <Card className="quantum-card border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-sm">Optimization Suggestion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  This job has high complexity. Consider breaking it into smaller circuits for faster execution.
                </p>
                <div className="p-2 rounded bg-background/50">
                  <p className="text-xs text-green-400">+25% faster estimated execution</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </div>
  );
}
