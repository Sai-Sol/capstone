"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ExecutionComparisonData {
  execution: string;
  hardware: string;
  duration: number;
  accuracy: number;
  match: boolean;
}

interface ReproducibilityComparisonProps {
  data: ExecutionComparisonData[];
  reproducibilityScore: number;
}

export function ReproducibilityComparison({ data, reproducibilityScore }: ReproducibilityComparisonProps) {
  if (!data || data.length === 0) return null;

  const matchCount = data.filter((d) => d.match).length;
  const matchPercentage = Math.round((matchCount / data.length) * 100);

  const getReproducibilityStatus = (score: number) => {
    if (score >= 95) return { label: "Excellent", color: "text-green-400", bgColor: "bg-green-500/10" };
    if (score >= 85) return { label: "Good", color: "text-blue-400", bgColor: "bg-blue-500/10" };
    if (score >= 70) return { label: "Fair", color: "text-yellow-400", bgColor: "bg-yellow-500/10" };
    return { label: "Needs Work", color: "text-red-400", bgColor: "bg-red-500/10" };
  };

  const status = getReproducibilityStatus(reproducibilityScore);

  return (
    <div className="space-y-6">
      <Card className="quantum-card">
        <CardHeader>
          <CardTitle>Reproducibility Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${status.bgColor} border border-border`}>
              <p className="text-sm text-muted-foreground mb-2">Reproducibility Score</p>
              <p className={`text-3xl font-bold ${status.color}`}>{reproducibilityScore}%</p>
              <p className="text-xs text-muted-foreground mt-2">{status.label}</p>
            </div>

            <div className="p-4 rounded-lg bg-blue-500/10 border border-border">
              <p className="text-sm text-muted-foreground mb-2">Matching Executions</p>
              <p className="text-3xl font-bold text-blue-400">{matchCount}/{data.length}</p>
              <p className="text-xs text-muted-foreground mt-2">{matchPercentage}% consistency</p>
            </div>

            <div className="p-4 rounded-lg bg-purple-500/10 border border-border">
              <p className="text-sm text-muted-foreground mb-2">Average Duration</p>
              <p className="text-3xl font-bold text-purple-400">
                {(data.reduce((sum, d) => sum + d.duration, 0) / data.length).toFixed(2)}s
              </p>
              <p className="text-xs text-muted-foreground mt-2">Across {data.length} runs</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="quantum-card">
        <CardHeader>
          <CardTitle>Execution Accuracy Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="execution" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" domain={[0.9, 1]} />
              <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.2)" }} />
              <Legend />
              <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Accuracy" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="quantum-card">
        <CardHeader>
          <CardTitle>Execution Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.map((exec, idx) => (
              <div key={idx} className="flex items-start justify-between p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                <div className="flex-1">
                  <p className="font-medium text-sm">{exec.execution}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {exec.hardware}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{exec.duration}s</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{(exec.accuracy * 100).toFixed(1)}% accuracy</span>
                  </div>
                </div>
                <div>
                  {exec.match ? (
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                      <span className="text-xs text-green-400">Match</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <XCircle className="h-5 w-5 text-red-400" />
                      <span className="text-xs text-red-400">Diff</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
