"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  Activity,
  Download,
  RefreshCw,
  Cpu,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface AnalyticsData {
  totalJobs: number;
  successRate: number;
  avgExecutionTime: string;
  topProvider: string;
  jobsByProvider: Array<{
    provider: string;
    count: number;
    percentage: number;
  }>;
  jobTrends: Array<{
    date: string;
    jobs: number;
    success: number;
  }>;
  recentJobs: Array<{
    id: string;
    type: string;
    status: "completed" | "failed" | "running";
    timestamp: number;
  }>;
}

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState("7d");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    
    // Simulate analytics data loading
    setTimeout(() => {
      const mockAnalytics: AnalyticsData = {
        totalJobs: 1247,
        successRate: 94.2,
        avgExecutionTime: "2.3s",
        topProvider: "Google Willow",
        jobsByProvider: [
          { provider: "Google Willow", count: 523, percentage: 42 },
          { provider: "IBM Condor", count: 412, percentage: 33 },
          { provider: "Amazon Braket", count: 312, percentage: 25 }
        ],
        jobTrends: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
          jobs: Math.floor(Math.random() * 50) + 100,
          success: Math.floor(Math.random() * 45) + 90
        })),
        recentJobs: Array.from({ length: 5 }, (_, i) => ({
          id: `QC-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          type: ["Bell State", "Grover Search", "Shor Factorization", "VQE"][Math.floor(Math.random() * 4)],
          status: ["completed", "completed", "failed", "running"][Math.floor(Math.random() * 4)] as any,
          timestamp: Date.now() - i * 3600000
        }))
      };

      setAnalytics(mockAnalytics);
      setIsLoading(false);
    }, 1000);
  };

  const exportData = () => {
    if (!analytics) return;
    
    const csvData = [
      ['Metric', 'Value'],
      ['Total Jobs', analytics.totalJobs.toString()],
      ['Success Rate', `${analytics.successRate}%`],
      ['Average Execution Time', analytics.avgExecutionTime],
      ['Top Provider', analytics.topProvider],
      ...analytics.jobsByProvider.map(p => [p.provider, p.count.toString()])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quantum-analytics-${timeframe}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Quantum Analytics
          </h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive insights into quantum job performance and trends
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="quantum-input w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportData} disabled={!analytics}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={loadAnalytics} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {analytics && (
        <>
          {/* KPI Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="quantum-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Jobs</p>
                      <p className="text-2xl font-bold text-primary">{analytics.totalJobs.toLocaleString()}</p>
                    </div>
                    <Activity className="h-8 w-8 text-primary floating-particle" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="quantum-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <p className="text-2xl font-bold text-green-400">{analytics.successRate}%</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-400 floating-particle" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="quantum-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Execution</p>
                      <p className="text-2xl font-bold text-blue-400">{analytics.avgExecutionTime}</p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-400 floating-particle" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="quantum-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Top Provider</p>
                      <p className="text-2xl font-bold text-purple-400">{analytics.topProvider}</p>
                    </div>
                    <Cpu className="h-8 w-8 text-purple-400 floating-particle" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Job Trends */}
            <Card className="quantum-card">
              <CardHeader>
                <CardTitle>Job Execution Trends</CardTitle>
                <CardDescription>Daily quantum job submissions and success rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2">
                  {analytics.jobTrends.map((data, index) => (
                    <div key={index} className="flex flex-col items-center gap-1 flex-1">
                      <div
                        className="bg-primary/20 hover:bg-primary/40 transition-colors rounded-t w-full"
                        style={{ height: `${(data.jobs / 150) * 100}%` }}
                        title={`${data.date}: ${data.jobs} jobs, ${data.success}% success`}
                      />
                      <span className="text-xs text-muted-foreground transform -rotate-45 origin-left">
                        {data.date.split('/')[1]}/{data.date.split('/')[2]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Provider Distribution */}
            <Card className="quantum-card">
              <CardHeader>
                <CardTitle>Provider Usage</CardTitle>
                <CardDescription>Distribution of jobs across quantum providers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.jobsByProvider.map((provider, index) => (
                    <div key={provider.provider} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{provider.provider}</span>
                        <span>{provider.count} jobs ({provider.percentage}%)</span>
                      </div>
                      <div className="w-full bg-muted/30 rounded-full h-3">
                        <motion.div
                          className="bg-gradient-to-r from-primary to-purple-500 h-3 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${provider.percentage}%` }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Jobs */}
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle>Recent Quantum Jobs</CardTitle>
              <CardDescription>Latest quantum computations and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.recentJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-primary/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/20 rounded-lg">
                        <Atom className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{job.id}</p>
                        <p className="text-sm text-muted-foreground">{job.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={
                        job.status === 'completed' ? 'text-green-400 border-green-400/50' :
                        job.status === 'running' ? 'text-yellow-400 border-yellow-400/50' :
                        'text-red-400 border-red-400/50'
                      }>
                        {job.status === 'completed' && <CheckCircle className="mr-1 h-3 w-3" />}
                        {job.status === 'running' && <Activity className="mr-1 h-3 w-3 animate-spin" />}
                        {job.status === 'failed' && <AlertTriangle className="mr-1 h-3 w-3" />}
                        {job.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(job.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}