"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";
import { TrendingUp, TrendingDown, Zap, Target, Clock } from "lucide-react";

interface QuantumJobResult {
  id: string;
  algorithm: string;
  provider: string;
  status: 'completed' | 'failed' | 'running';
  submittedAt: number;
  completedAt?: number;
  results?: {
    measurements: Record<string, number>;
    fidelity: string;
    executionTime: string;
    circuitDepth: number;
    shots: number;
  };
  txHash: string;
  user: string;
}

interface ResultsAnalyticsProps {
  results: QuantumJobResult[];
}

export function ResultsAnalytics({ results }: ResultsAnalyticsProps) {
  if (!results || results.length === 0) return null;

  const completedResults = results.filter(r => r.status === 'completed' && r.results);

  const fidelityData = completedResults
    .map(r => ({
      name: r.algorithm.slice(0, 15),
      fidelity: parseFloat(r.results!.fidelity),
      provider: r.provider.split(' ')[0],
    }))
    .sort((a, b) => b.fidelity - a.fidelity);

  const executionTimeData = completedResults.map(r => ({
    name: r.algorithm.slice(0, 12),
    time: parseFloat(r.results!.executionTime),
    depth: r.results!.circuitDepth,
    provider: r.provider.split(' ')[0],
  }));

  const providerStats = Object.entries(
    completedResults.reduce((acc, r) => {
      const provider = r.provider.split(' ')[0];
      if (!acc[provider]) {
        acc[provider] = { count: 0, avgFidelity: 0, avgTime: 0 };
      }
      acc[provider].count += 1;
      acc[provider].avgFidelity += parseFloat(r.results!.fidelity);
      acc[provider].avgTime += parseFloat(r.results!.executionTime);
      return acc;
    }, {} as Record<string, { count: number; avgFidelity: number; avgTime: number }>)
  ).map(([provider, stats]) => ({
    name: provider,
    value: stats.count,
    avgFidelity: (stats.avgFidelity / stats.count).toFixed(1),
    avgTime: (stats.avgTime / stats.count).toFixed(1),
  }));

  const complexityData = completedResults.map((r, i) => ({
    name: r.algorithm.slice(0, 10),
    depth: r.results!.circuitDepth,
    shots: r.results!.shots,
    fidelity: parseFloat(r.results!.fidelity),
    index: i,
  }));

  const algorithmDistribution = Object.entries(
    completedResults.reduce((acc, r) => {
      acc[r.algorithm] = (acc[r.algorithm] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({
    name: name.slice(0, 20),
    value,
  }));

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const avgFidelity =
    completedResults.reduce((sum, r) => sum + parseFloat(r.results!.fidelity), 0) /
    completedResults.length;
  const avgExecutionTime =
    completedResults.reduce((sum, r) => sum + parseFloat(r.results!.executionTime), 0) /
    completedResults.length;

  return (
    <div className="space-y-6">
      {/* Top Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="quantum-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Fidelity</p>
                <p className="text-3xl font-bold text-green-400">{avgFidelity.toFixed(1)}%</p>
                <p className="text-xs text-green-300 mt-1">Across all algorithms</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Target className="h-8 w-8 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="quantum-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Execution Time</p>
                <p className="text-3xl font-bold text-blue-400">{avgExecutionTime.toFixed(1)}ms</p>
                <p className="text-xs text-blue-300 mt-1">All jobs</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Clock className="h-8 w-8 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="quantum-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Completed</p>
                <p className="text-3xl font-bold text-purple-400">{completedResults.length}</p>
                <p className="text-xs text-purple-300 mt-1">Quantum jobs</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Zap className="h-8 w-8 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fidelity vs Execution Time */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="quantum-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Fidelity Performance
            </CardTitle>
            <CardDescription>Quantum state fidelity by algorithm</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fidelityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="rgba(255,255,255,0.5)" domain={[90, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                  formatter={(value: any) => `${value.toFixed(1)}%`}
                />
                <Bar dataKey="fidelity" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="quantum-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-400" />
              Execution Time Comparison
            </CardTitle>
            <CardDescription>Time taken per quantum algorithm</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={executionTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                  formatter={(value: any) => `${value.toFixed(1)}ms`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="time"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Execution Time (ms)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Circuit Complexity Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="quantum-card">
          <CardHeader>
            <CardTitle>Circuit Depth vs Fidelity</CardTitle>
            <CardDescription>Correlation between circuit complexity and quantum state quality</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                data={complexityData}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="depth" stroke="rgba(255,255,255,0.5)" name="Circuit Depth" />
                <YAxis stroke="rgba(255,255,255,0.5)" name="Fidelity %" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                  cursor={{ strokeDasharray: "3 3" }}
                />
                <Scatter dataKey="fidelity" fill="#8b5cf6" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="quantum-card">
          <CardHeader>
            <CardTitle>Algorithm Distribution</CardTitle>
            <CardDescription>Number of executions per algorithm</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={algorithmDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, value }) => `${name.slice(0, 10)}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {algorithmDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Provider Performance */}
      <Card className="quantum-card">
        <CardHeader>
          <CardTitle>Provider Performance Summary</CardTitle>
          <CardDescription>Average metrics by quantum computing provider</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {providerStats.map((provider) => (
              <div
                key={provider.name}
                className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
              >
                <div className="font-semibold text-primary mb-3">{provider.name}</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jobs:</span>
                    <span className="font-bold text-foreground">{provider.value}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Fidelity:</span>
                    <span className="font-bold text-green-400">{provider.avgFidelity}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Time:</span>
                    <span className="font-bold text-blue-400">{provider.avgTime}ms</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
