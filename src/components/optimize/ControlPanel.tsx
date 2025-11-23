// src/components/optimize/ControlPanel.tsx

import { Button } from "@/components/ui/button";
import { Play, Pause, Square, RotateCw } from "lucide-react";

interface ControlPanelProps {
  status: "idle" | "running" | "paused" | "completed";
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export function ControlPanel({
  status,
  onStart,
  onPause,
  onResume,
  onStop,
}: ControlPanelProps) {
  return (
    <div className="flex items-center gap-2">
      {status === "idle" || status === "completed" ? (
        <Button onClick={onStart} className="flex-1">
          <Play className="mr-2 h-4 w-4" />
          Start Optimization
        </Button>
      ) : null}

      {status === "running" ? (
        <Button onClick={onPause} variant="outline" className="flex-1">
          <Pause className="mr-2 h-4 w-4" />
          Pause
        </Button>
      ) : null}

      {status === "paused" ? (
        <Button onClick={onResume} className="flex-1">
          <RotateCw className="mr-2 h-4 w-4" />
          Resume
        </Button>
      ) : null}

      {status === "running" || status === "paused" ? (
        <Button onClick={onStop} variant="destructive" className="flex-1">
          <Square className="mr-2 h-4 w-4" />
          Stop
        </Button>
      ) : null}
    </div>
  );
}
