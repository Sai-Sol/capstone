// src/components/optimize/LogViewer.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal } from "lucide-react";

interface LogViewerProps {
  logs: string[];
}

export function LogViewer({ logs }: LogViewerProps) {
  return (
    <Card className="quantum-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" />
          Live Logs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-slate-950 p-4 rounded-lg h-48 overflow-y-auto font-mono text-sm">
          {logs.map((log, index) => (
            <p key={index} className="whitespace-pre-wrap">
              {log}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
