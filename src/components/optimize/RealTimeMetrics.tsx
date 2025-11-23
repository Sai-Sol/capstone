// src/components/optimize/RealTimeMetrics.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu, MemoryStick, Zap } from "lucide-react";

interface RealTimeMetricsProps {
  metrics: {
    cpu: number;
    memory: number;
    speed: number;
  };
}

export function RealTimeMetrics({ metrics }: RealTimeMetricsProps) {
  return (
    <Card className="quantum-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Real-Time Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
          <div className="flex items-center gap-3">
            <Cpu className="h-5 w-5 text-blue-400" />
            <span className="font-medium">CPU Usage</span>
          </div>
          <span className="font-bold text-lg">{metrics.cpu.toFixed(1)}%</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
          <div className="flex items-center gap-3">
            <MemoryStick className="h-5 w-5 text-green-400" />
            <span className="font-medium">Memory</span>
          </div>
          <span className="font-bold text-lg">{metrics.memory.toFixed(1)} MB</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-yellow-400" />
            <span className="font-medium">Processing Speed</span>
          </div>
          <span className="font-bold text-lg">{metrics.speed.toFixed(1)} ops/s</span>
        </div>
      </CardContent>
    </Card>
  );
}
