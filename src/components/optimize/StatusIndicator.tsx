// src/components/optimize/StatusIndicator.tsx

import { Badge } from "@/components/ui/badge";

interface StatusIndicatorProps {
  status: "idle" | "running" | "paused" | "completed" | "error";
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const getStatusColor = () => {
    switch (status) {
      case "running":
        return "bg-blue-500/20 border-blue-500/80 text-blue-400";
      case "paused":
        return "bg-yellow-500/20 border-yellow-500/80 text-yellow-400";
      case "completed":
        return "bg-green-500/20 border-green-500/80 text-green-400";
      case "error":
        return "bg-red-500/20 border-red-500/80 text-red-400";
      default:
        return "bg-gray-500/20 border-gray-500/80 text-gray-400";
    }
  };

  return (
    <Badge
      variant="outline"
      className={`font-bold text-sm capitalize transition-all ${getStatusColor()}`}
    >
      {status}
    </Badge>
  );
}
