"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Activity, CheckCircle, AlertTriangle, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface MonitorState {
  isActive: boolean;
  lastCheck: number;
  lastCount: number;
  currentTransactionCount: number;
  transactionCountDiff: number;
  isLoading: boolean;
  error?: string;
}

export default function BlockchainJobMonitor() {
  const [state, setState] = useState<MonitorState>({
    isActive: false,
    lastCheck: 0,
    lastCount: 0,
    currentTransactionCount: 0,
    transactionCountDiff: 0,
    isLoading: false,
    error: undefined
  });

  const { toast } = useToast();

  const checkTransactionCount = async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch('/api/monitor-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check-once' })
      });

      if (!response.ok) {
        throw new Error(`Failed to check transaction count: ${response.statusText}`);
      }

      const data = await response.json();

      const diff = data.transactionCount - state.lastCount;

      setState(prev => ({
        ...prev,
        lastCheck: Date.now(),
        lastCount: data.transactionCount,
        currentTransactionCount: data.transactionCount,
        transactionCountDiff: diff,
        isLoading: false,
        error: undefined
      }));

      if (diff > 0) {
        toast({
          title: "Jobs Updated",
          description: `Found ${diff} new transaction(s). Total: ${data.transactionCount}`
        });
      } else if (diff === 0) {
        toast({
          title: "No Changes",
          description: `Transaction count remains at ${data.transactionCount}`
        });
      }

      console.log('[Monitor] Check complete:', data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      toast({
        variant: "destructive",
        title: "Monitor Error",
        description: errorMessage
      });

      console.error('[Monitor] Error:', error);
    }
  };

  const startMonitoring = async () => {
    try {
      const response = await fetch('/api/monitor-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' })
      });

      if (!response.ok) {
        throw new Error(`Failed to start monitoring: ${response.statusText}`);
      }

      setState(prev => ({ ...prev, isActive: true }));

      toast({
        title: "Monitoring Started",
        description: "Job counter will be updated automatically"
      });

      console.log('[Monitor] Started');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      toast({
        variant: "destructive",
        title: "Start Error",
        description: errorMessage
      });

      console.error('[Monitor] Start error:', error);
    }
  };

  const stopMonitoring = async () => {
    try {
      const response = await fetch('/api/monitor-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' })
      });

      if (!response.ok) {
        throw new Error(`Failed to stop monitoring: ${response.statusText}`);
      }

      setState(prev => ({ ...prev, isActive: false }));

      toast({
        title: "Monitoring Stopped",
        description: "Job counter monitoring is now disabled"
      });

      console.log('[Monitor] Stopped');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      toast({
        variant: "destructive",
        title: "Stop Error",
        description: errorMessage
      });

      console.error('[Monitor] Stop error:', error);
    }
  };

  useEffect(() => {
    checkTransactionCount();
  }, []);

  const formattedLastCheck = state.lastCheck
    ? new Date(state.lastCheck).toLocaleTimeString()
    : 'Never';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className="border-primary/30 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <CardTitle>Blockchain Job Monitor</CardTitle>
                <CardDescription>
                  Track quantum job submissions via blockchain transactions
                </CardDescription>
              </div>
            </div>
            <Badge
              variant={state.isActive ? "default" : "outline"}
              className={state.isActive ? "bg-green-500" : ""}
            >
              {state.isActive ? (
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center gap-1"
                >
                  <Activity className="h-3 w-3" />
                  Active
                </motion.span>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Inactive
                </>
              )}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {state.error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-muted-foreground">Total Jobs Recorded</span>
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                14
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-purple-400" />
                <span className="text-xs text-muted-foreground">Last Check</span>
              </div>
              <div className="text-sm font-mono text-purple-600 dark:text-purple-400">
                {formattedLastCheck}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={checkTransactionCount}
              disabled={state.isLoading}
              className="flex-1"
              variant="outline"
            >
              {state.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Check Now
                </>
              )}
            </Button>

            {!state.isActive ? (
              <Button
                onClick={startMonitoring}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Activity className="mr-2 h-4 w-4" />
                Start Monitoring
              </Button>
            ) : (
              <Button
                onClick={stopMonitoring}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Stop Monitoring
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg space-y-1">
            <div>
              Contract Address:{" "}
              <code className="font-mono">0xd1471126F18d76be253625CcA75e16a0F1C5B3e2</code>
            </div>
            <div>
              Network: <span className="font-semibold">MEGA Testnet v2</span>
            </div>
            <div>
              Polling Interval: <span className="font-semibold">60 seconds</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
