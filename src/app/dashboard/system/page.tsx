"use client";

import SystemStatus from "@/components/system-status";
import { motion } from "framer-motion";

export default function SystemPage() {
  return (
    <div className="space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          System Monitoring
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Real-time system health, performance metrics, and debugging tools
        </p>
      </motion.div>

      <SystemStatus />
    </div>
  );
}