"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Monitor,
  Database,
  Globe,
  Brain,
  Zap,
  Clock,
  MemoryStick
} from "lucide-react";

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: Record<string, {
    status: string;
    responseTime?: number;
    error?: string;
  }>;
  performance?: {
    summary: any;
    slowOperations: any[];
  };
  uptime: number;
  memory: NodeJS.MemoryUsage;
}

export default function SystemStatus() {
  const { toast } = useToast();
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchSystemHealth = async () => {
    setIsLoading(true);
    try {
      const [healthResponse, performanceResponse] = await Promise.all([
        fetch('/api/health'),
        fetch('/api/performance')
      ]);

      const healthData = await healthResponse.json();
      const performanceData = await performanceResponse.json();

      setSystemHealth({
        ...healthData,
        performance: performanceData
      });
      
      setLastUpdated(new Date());

    } catch (error) {
      console.error('Failed to fetch system health:', error);
      toast({
        variant: "destructive",
        title: "System Check Failed",
        description: "Unable to fetch system status"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemHealth();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'unhealthy': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default: return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400 border-green-400/50';
      case 'degraded': return 'text-yellow-400 border-yellow-400/50';
      case 'unhealthy': return 'text-red-400 border-red-400/50';
      default: return 'text-gray-400 border-gray-400/50';
    }
  };

  const serviceIcons = {
    database: Database,
    blockchain: Globe,
    quantum_analysis: Brain,
    megaeth_testnet: Zap
  };

  if (!systemHealth) {
    return (
      <Card className="quantum-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-primary mr-3" />
            <span>Loading system status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="quantum-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary" />
                System Status
              </CardTitle>
              <CardDescription>Real-time system health monitoring</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={getStatusColor(systemHealth.status)}>
                {getStatusIcon(systemHealth.status)}
                {systemHealth.status}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSystemHealth}
                disabled={isLoading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Service Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(systemHealth.services).map(([serviceName, service]) => {
              const IconComponent = serviceIcons[serviceName as keyof typeof serviceIcons] || Activity;
              
              return (
                <motion.div
                  key={serviceName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-muted/20 border border-primary/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-medium capitalize">{serviceName.replace('_', ' ')}</h4>
                        {service.responseTime && (
                          <p className="text-xs text-muted-foreground">{service.responseTime}ms</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className={getStatusColor(service.status)}>
                      {getStatusIcon(service.status)}
                      {service.status}
                    </Badge>
                  </div>
                  {service.error && (
                    <Alert className="mt-3 border-red-500/20 bg-red-500/5">
                      <AlertDescription className="text-xs">
                        {service.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Performance Metrics */}
          {systemHealth.performance && (
            <div className="space-y-4">
              <h4 className="font-semibold text-primary">Performance Metrics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-200">Avg Response</span>
                  </div>
                  <p className="text-lg font-bold text-blue-100">
                    {systemHealth.performance.summary.averageDuration?.toFixed(1) || 0}ms
                  </p>
                </div>
                
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium text-green-200">Operations</span>
                  </div>
                  <p className="text-lg font-bold text-green-100">
                    {systemHealth.performance.summary.totalMetrics || 0}
                  </p>
                </div>
                
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <MemoryStick className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-200">Memory</span>
                  </div>
                  <p className="text-lg font-bold text-purple-100">
                    {Math.round(systemHealth.memory.heapUsed / 1024 / 1024)}MB
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* System Info */}
          <div className="p-4 rounded-lg bg-muted/20 border border-primary/10">
            <h4 className="font-semibold text-primary mb-3">System Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Uptime:</span>
                <div className="font-medium">{Math.round(systemHealth.uptime / 3600 * 100) / 100}h</div>
              </div>
              <div>
                <span className="text-muted-foreground">Version:</span>
                <div className="font-medium">{systemHealth.version || '2.0.0'}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Environment:</span>
                <div className="font-medium capitalize">{systemHealth.environment || 'production'}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Last Updated:</span>
                <div className="font-medium">{lastUpdated?.toLocaleTimeString() || 'Never'}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}