"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TrendData {
  date: string;
  score: number;
  depth: number;
  gates: number;
  cost: number;
}

interface OptimizationTrendsProps {
  data: TrendData[];
}

export function OptimizationTrends({ data }: OptimizationTrendsProps) {
  if (!data || data.length === 0) return null;

  const latestScore = data[data.length - 1].score;
  const previousScore = data.length > 1 ? data[data.length - 2].score : latestScore;
  const scoreChange = latestScore - previousScore;
  const isImproving = scoreChange > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="quantum-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isImproving ? (
              <TrendingUp className="h-5 w-5 text-green-400" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-400" />
            )}
            Optimization Score Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.2)" }} />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Score %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="quantum-card">
        <CardHeader>
          <CardTitle>Circuit Metrics Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.2)" }} />
              <Legend />
              <Bar dataKey="depth" fill="#06b6d4" name="Circuit Depth" />
              <Bar dataKey="gates" fill="#8b5cf6" name="Gate Count" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
