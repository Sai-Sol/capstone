"use client";

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Globe, 
  Zap, 
  Shield, 
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from "lucide-react";

interface NetworkMetric {
  label: string;
  value: string;
  status: "healthy" | "warning" | "critical";
  trend: string;
  icon: any;
}

interface NetworkNode {
  id: string;
  location: string;
  status: "online" | "offline" | "syncing";
  latency: number;
  uptime: number;
}

export default function NetworkMonitor() {
  const [metrics, setMetrics] = useState<NetworkMetric[]>([]);
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadNetworkData();
    const interval = setInterval(loadNetworkData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNetworkData = async () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const mockMetrics: NetworkMetric[] = [
        {
          label: "Network Latency",
          value: "< 1ms",
          status: "healthy",
          trend: "-0.2ms",
          icon: Zap
        },
        {
          label: "Block Time",
          value: "2.1s",
          status: "healthy",
          trend: "-0.1s",
          icon: Clock
        },
        {
          label: "Active Validators",
          value: "2,847",
          status: "healthy",
          trend: "+23",
          icon: Shield
        },
        {
          label: "Network Load",
          value: "67%",
          status: "warning",
          trend: "+5%",
          icon: Activity
        }
      ];

      const mockNodes: NetworkNode[] = [
        { id: "node-1", location: "US East", status: "online", latency: 12, uptime: 99.9 },
        { id: "node-2", location: "EU West", status: "online", latency: 8, uptime: 99.8 },
        { id: "node-3", location: "Asia Pacific", status: "syncing", latency: 15, uptime: 98.5 },
        { id: "node-4", location: "US West", status: "online", latency: 10, uptime: 99.7 }
      ];

      setMetrics(mockMetrics);
      setNodes(mockNodes);
      setIsLoading(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "online":
        return "text-green-400 border-green-400/50";
      case "warning":
      case "syncing":
        return "text-yellow-400 border-yellow-400/50";
      case "critical":
      case "offline":
        return "text-red-400 border-red-400/50";
      default:
        return "text-gray-400 border-gray-400/50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "online":
        return CheckCircle;
      case "warning":
      case "syncing":
        return Clock;
      case "critical":
      case "offline":
        return AlertTriangle;
      default:
        return Activity;
    }
  };

  return (
    <div className="space-y-6">
      {/* Network Metrics */}
      <Card className="quantum-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Network Health Monitor
              </CardTitle>
              <CardDescription>Real-time blockchain network performance</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadNetworkData}
              disabled={isLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => {
              const StatusIcon = getStatusIcon(metric.status);
              return (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-xl bg-gradient-to-r from-muted/20 to-muted/10 border border-primary/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <metric.icon className="h-5 w-5 text-primary" />
                    <Badge variant="outline" className={getStatusColor(metric.status)}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {metric.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-xl font-bold text-primary">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.trend} from last hour</p>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Node Status */}
      <Card className="quantum-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Global Node Network
          </CardTitle>
          <CardDescription>Status of blockchain nodes worldwide</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {nodes.map((node, index) => {
              const StatusIcon = getStatusIcon(node.status);
              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-xl bg-gradient-to-r from-muted/20 to-muted/10 border border-primary/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        node.status === 'online' ? 'bg-green-400' :
                        node.status === 'syncing' ? 'bg-yellow-400' :
                        'bg-red-400'
                      } quantum-pulse`} />
                      <div>
                        <p className="font-semibold">{node.location}</p>
                        <p className="text-sm text-muted-foreground">{node.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={getStatusColor(node.status)}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {node.status}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {node.latency}ms • {node.uptime}% uptime
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Uptime</span>
                      <span>{node.uptime}%</span>
                    </div>
                    <Progress value={node.uptime} className="h-2" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}