"use client";

import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImprovedToastProps {
  title: string;
  description?: string;
  type?: "success" | "error" | "info" | "warning";
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function ImprovedToast({
  title,
  description,
  type = "info",
  onClose,
  action
}: ImprovedToastProps) {
  const icons = {
    success: CheckCircle,
    error: AlertTriangle,
    warning: AlertTriangle,
    info: Info
  };

  const colors = {
    success: "border-green-500/20 bg-green-500/5 text-green-400",
    error: "border-red-500/20 bg-red-500/5 text-red-400",
    warning: "border-yellow-500/20 bg-yellow-500/5 text-yellow-400",
    info: "border-blue-500/20 bg-blue-500/5 text-blue-400"
  };

  const Icon = icons[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      className={`p-4 rounded-xl border backdrop-blur-sm shadow-xl ${colors[type]}`}
    >
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">{title}</h4>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
          {action && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-6 text-xs"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-60 hover:opacity-100"
            onClick={onClose}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}