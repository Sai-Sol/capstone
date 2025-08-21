"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Cpu, 
  Zap, 
  Activity,
  RefreshCw,
  Award,
  Target,
  Atom,
  Brain,
  ChevronRight,
  Info,
  Lightbulb,
  Gauge
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useWallet } from "@/hooks/use-wallet";

interface AlgorithmMetrics {
  name: string;
  provider: string;
  executionTime: {
    simulated: number;
    real: number;
    improvement: number;
  };
  resourceUsage: {
    qubits: number;
    gates: number;
    circuitDepth: number;
    fidelity: number;
  };
  performance: {
    efficiency: number;
    accuracy: number;
    scalability: number;
    complexity: string;
  };
  costAnalysis: {
    megaethCost: number;
    computeCost: number;
    totalCost: number;
  };
  lastRun: number;
  runCount: number;
}

interface ComparisonData {
  algorithms: AlgorithmMetrics[];
  insights: {
    fastest: string;
    mostEfficient: string;
    mostAccurate: string;
    recommendation: string;
  };
}

export default function ExecutionInsightsPage() {
  const { user } = useAuth();
  const { isConnected } = useWallet();
  const [insights, setInsights] = useState<ComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'time' | 'resources' | 'performance' | 'cost'>('time');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  useEffect(() => {
    fetchExecutionInsights();
  }, [timeRange]);

  const fetchExecutionInsights = async () => {
    setIsLoading(true);
    
    // Simulate API call with realistic quantum algorithm data
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockInsights: ComparisonData = {
      algorithms: [
        {
          name: "Bell State Creation",
          provider: "Google Willow",
          executionTime: {
            simulated: 0.5,
            real: 23.4,
            improvement: 4580
          },
          resourceUsage: {
            qubits: 2,
            gates: 3,
            circuitDepth: 2,
            fidelity: 97.8
          },
          performance: {
            efficiency: 95,
            accuracy: 98,
            scalability: 85,
            complexity: "Low"
          },
          costAnalysis: {
            megaethCost: 0.0012,
            computeCost: 0.0018,
            totalCost: 0.003
          },
          lastRun: Date.now() - 300000,
          runCount: 45
        },
        {
          name: "Grover's Search",
          provider: "IBM Condor",
          executionTime: {
            simulated: 2.1,
            real: 156.7,
            improvement: 7367
          },
          resourceUsage: {
            qubits: 4,
            gates: 12,
            circuitDepth: 8,
            fidelity: 94.2
          },
          performance: {
            efficiency: 88,
            accuracy: 94,
            scalability: 92,
            complexity: "Medium"
          },
          costAnalysis: {
            megaethCost: 0.0015,
            computeCost: 0.0025,
            totalCost: 0.004
          },
          lastRun: Date.now() - 600000,
          runCount: 28
        },
        {
          name: "Quantum Fourier Transform",
          provider: "Amazon Braket",
          executionTime: {
            simulated: 5.8,
            real: 342.1,
            improvement: 5796
          },
          resourceUsage: {
            qubits: 8,
            gates: 28,
            circuitDepth: 15,
            fidelity: 91.5
          },
          performance: {
            efficiency: 82,
            accuracy: 92,
            scalability: 78,
            complexity: "High"
          },
          costAnalysis: {
            megaethCost: 0.0018,
            computeCost: 0.0035,
            totalCost: 0.0053
          },
          lastRun: Date.now() - 900000,
          runCount: 12
        },
        {
          name: "Shor's Algorithm",
          provider: "IBM Condor",
          executionTime: {
            simulated: 15.2,
            real: 2300,
            improvement: 15026
          },
          resourceUsage: {
            qubits: 15,
            gates: 156,
            circuitDepth: 24,
            fidelity: 89.3
          },
          performance: {
            efficiency: 75,
            accuracy: 89,
            scalability: 65,
            complexity: "Very High"
          },
          costAnalysis: {
            megaethCost: 0.0025,
            computeCost: 0.0085,
            totalCost: 0.011
          },
          lastRun: Date.now() - 1200000,
          runCount: 8
        },
        {
          name: "VQE Optimization",
          provider: "Google Willow",
          executionTime: {
            simulated: 8.7,
            real: 847,
            improvement: 9632
          },
          resourceUsage: {
            qubits: 6,
            gates: 45,
            circuitDepth: 12,
            fidelity: 93.7
          },
          performance: {
            efficiency: 86,
            accuracy: 94,
            scalability: 88,
            complexity: "High"
          },
          costAnalysis: {
            megaethCost: 0.0020,
            computeCost: 0.0042,
            totalCost: 0.0062
          },
          lastRun: Date.now() - 450000,
          runCount: 22
        }
      ],
      insights: {
        fastest: "Bell State Creation",
        mostEfficient: "Bell State Creation", 
        mostAccurate: "Bell State Creation",
        recommendation: "For beginners, start with Bell State Creation. For complex problems, consider Grover's Search or VQE."
      }
    };
    
    setInsights(mockInsights);
    setIsLoading(false);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "Low": return "text-green-400 border-green-400/50";
      case "Medium": return "text-yellow-400 border-yellow-400/50";
      case "High": return "text-orange-400 border-orange-400/50";
      case "Very High": return "text-red-400 border-red-400/50";
      default: return "text-blue-400 border-blue-400/50";
    }
  };

  const getPerformanceColor = (value: number) => {
    if (value >= 90) return "text-green-400";
    if (value >= 80) return "text-yellow-400";
    if (value >= 70) return "text-orange-400";
    return "text-red-400";
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(1)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}min`;
  };

  if (!user) return null;

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          📊 Execution Insights Dashboard
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Deep dive into quantum algorithm performance, resource utilization, and cost analysis across different providers
        </p>
        
        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-foreground">Real-time Analytics</span>
          </div>
          <div className="flex items-center gap-2">
            <Atom className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">Quantum Performance Monitoring</span>
          </div>
        </div>
      </motion.div>

      {/* Time Range Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex justify-center"
      >
        <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-lg">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={timeRange === range ? "bg-primary/20 text-primary" : ""}
            >
              {range === '24h' ? 'Last 24 Hours' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="h-64 bg-muted/20 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : insights ? (
        <>
          {/* Key Insights Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            <Card className="quantum-card border-green-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Zap className="h-6 w-6 text-green-400" />
                  </div>
                  <Badge variant="outline" className="text-green-400 border-green-400/50">
                    Fastest
                  </Badge>
                </div>
                <h3 className="font-semibold text-green-400 mb-1">⚡ Speed Champion</h3>
                <p className="text-2xl font-bold text-foreground">{insights.insights.fastest}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Consistently delivers the fastest execution times
                </p>
              </CardContent>
            </Card>

            <Card className="quantum-card border-blue-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Gauge className="h-6 w-6 text-blue-400" />
                  </div>
                  <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                    Efficient
                  </Badge>
                </div>
                <h3 className="font-semibold text-blue-400 mb-1">🎯 Resource Optimizer</h3>
                <p className="text-2xl font-bold text-foreground">{insights.insights.mostEfficient}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Best resource utilization and cost efficiency
                </p>
              </CardContent>
            </Card>

            <Card className="quantum-card border-purple-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Target className="h-6 w-6 text-purple-400" />
                  </div>
                  <Badge variant="outline" className="text-purple-400 border-purple-400/50">
                    Accurate
                  </Badge>
                </div>
                <h3 className="font-semibold text-purple-400 mb-1">🎯 Precision Leader</h3>
                <p className="text-2xl font-bold text-foreground">{insights.insights.mostAccurate}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Highest fidelity and measurement accuracy
                </p>
              </CardContent>
            </Card>

            <Card className="quantum-card border-pink-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-pink-500/20 rounded-lg">
                    <Brain className="h-6 w-6 text-pink-400" />
                  </div>
                  <Badge variant="outline" className="text-pink-400 border-pink-400/50">
                    Smart Choice
                  </Badge>
                </div>
                <h3 className="font-semibold text-pink-400 mb-1">🧠 AI Recommendation</h3>
                <p className="text-sm font-medium text-foreground leading-tight">
                  {insights.insights.recommendation.split('.')[0]}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Based on performance analysis
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Analytics Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Tabs defaultValue="performance" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-muted/30 h-12">
                <TabsTrigger value="performance" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="resources" className="flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  Resources
                </TabsTrigger>
                <TabsTrigger value="comparison" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Comparison
                </TabsTrigger>
                <TabsTrigger value="insights" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Insights
                </TabsTrigger>
              </TabsList>

              <TabsContent value="performance" className="mt-6">
                <div className="grid gap-6">
                  {/* Execution Time Analysis */}
                  <Card className="quantum-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-foreground">
                        <Clock className="h-5 w-5 text-primary" />
                        ⏱️ Execution Time Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {insights.algorithms.map((algo, index) => (
                          <motion.div
                            key={algo.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="font-semibold text-primary text-lg">{algo.name}</h4>
                                <p className="text-sm text-muted-foreground">{algo.provider}</p>
                              </div>
                              <Badge variant="outline" className={getComplexityColor(algo.performance.complexity)}>
                                {algo.performance.complexity} Complexity
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                  <Activity className="h-4 w-4 text-blue-400" />
                                  <span className="text-sm font-medium text-blue-200">Simulated</span>
                                </div>
                                <p className="text-xl font-bold text-blue-100">{formatTime(algo.executionTime.simulated)}</p>
                                <p className="text-xs text-blue-200/60">Classical simulation</p>
                              </div>
                              
                              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                  <Atom className="h-4 w-4 text-green-400" />
                                  <span className="text-sm font-medium text-green-200">Real Quantum</span>
                                </div>
                                <p className="text-xl font-bold text-green-100">{formatTime(algo.executionTime.real)}</p>
                                <p className="text-xs text-green-200/60">Actual hardware</p>
                              </div>
                              
                              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                  <TrendingUp className="h-4 w-4 text-purple-400" />
                                  <span className="text-sm font-medium text-purple-200">Improvement</span>
                                </div>
                                <p className="text-xl font-bold text-purple-100">{algo.executionTime.improvement.toFixed(0)}%</p>
                                <p className="text-xs text-purple-200/60">vs simulation</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="resources" className="mt-6">
                <div className="grid gap-6">
                  {/* Resource Usage Breakdown */}
                  <Card className="quantum-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-foreground">
                        <Cpu className="h-5 w-5 text-primary" />
                        🔧 Resource Utilization Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {insights.algorithms.map((algo, index) => (
                          <motion.div
                            key={algo.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-6 rounded-xl bg-gradient-to-br from-muted/20 to-muted/10 border border-primary/20"
                          >
                            <div className="flex items-center justify-between mb-6">
                              <div>
                                <h4 className="font-semibold text-primary text-xl">{algo.name}</h4>
                                <p className="text-sm text-muted-foreground">{algo.provider} • {algo.runCount} executions</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">Fidelity</p>
                                <p className="text-2xl font-bold text-green-400">{algo.resourceUsage.fidelity}%</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <Atom className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-blue-100">{algo.resourceUsage.qubits}</p>
                                <p className="text-xs text-blue-200">Qubits Used</p>
                              </div>
                              
                              <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                                <Zap className="h-6 w-6 text-green-400 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-green-100">{algo.resourceUsage.gates}</p>
                                <p className="text-xs text-green-200">Quantum Gates</p>
                              </div>
                              
                              <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                <BarChart3 className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-purple-100">{algo.resourceUsage.circuitDepth}</p>
                                <p className="text-xs text-purple-200">Circuit Depth</p>
                              </div>
                              
                              <div className="text-center p-4 rounded-lg bg-pink-500/10 border border-pink-500/20">
                                <Target className="h-6 w-6 text-pink-400 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-pink-100">{algo.resourceUsage.fidelity}%</p>
                                <p className="text-xs text-pink-200">Accuracy</p>
                              </div>
                            </div>

                            {/* Resource Efficiency Bars */}
                            <div className="mt-6 space-y-3">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-muted-foreground">Efficiency Score</span>
                                  <span className={`font-bold ${getPerformanceColor(algo.performance.efficiency)}`}>
                                    {algo.performance.efficiency}%
                                  </span>
                                </div>
                                <Progress value={algo.performance.efficiency} className="h-2" />
                              </div>
                              
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-muted-foreground">Scalability</span>
                                  <span className={`font-bold ${getPerformanceColor(algo.performance.scalability)}`}>
                                    {algo.performance.scalability}%
                                  </span>
                                </div>
                                <Progress value={algo.performance.scalability} className="h-2" />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="comparison" className="mt-6">
                <div className="grid gap-6">
                  {/* Algorithm Comparison Matrix */}
                  <Card className="quantum-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-foreground">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        📈 Algorithm Performance Matrix
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-primary/20">
                              <th className="text-left p-4 text-foreground">Algorithm</th>
                              <th className="text-center p-4 text-foreground">Provider</th>
                              <th className="text-center p-4 text-foreground">Execution Time</th>
                              <th className="text-center p-4 text-foreground">Qubits</th>
                              <th className="text-center p-4 text-foreground">Fidelity</th>
                              <th className="text-center p-4 text-foreground">MegaETH Cost</th>
                              <th className="text-center p-4 text-foreground">Efficiency</th>
                            </tr>
                          </thead>
                          <tbody>
                            {insights.algorithms
                              .sort((a, b) => a.executionTime.real - b.executionTime.real)
                              .map((algo, index) => (
                              <motion.tr
                                key={algo.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="border-b border-primary/10 hover:bg-muted/20 transition-colors"
                              >
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-primary rounded-full" />
                                    <div>
                                      <p className="font-medium text-foreground">{algo.name}</p>
                                      <p className="text-xs text-muted-foreground">{algo.runCount} runs</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4 text-center">
                                  <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                                    {algo.provider.split(' ')[0]}
                                  </Badge>
                                </td>
                                <td className="p-4 text-center">
                                  <p className="font-bold text-green-400">{formatTime(algo.executionTime.real)}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {algo.executionTime.improvement.toFixed(0)}% faster
                                  </p>
                                </td>
                                <td className="p-4 text-center">
                                  <p className="font-bold text-blue-400">{algo.resourceUsage.qubits}</p>
                                </td>
                                <td className="p-4 text-center">
                                  <p className={`font-bold ${getPerformanceColor(algo.resourceUsage.fidelity)}`}>
                                    {algo.resourceUsage.fidelity}%
                                  </p>
                                </td>
                                <td className="p-4 text-center">
                                  <p className="font-bold text-yellow-400">{algo.costAnalysis.megaethCost.toFixed(4)} MegaETH</p>
                                </td>
                                <td className="p-4 text-center">
                                  <div className="flex items-center gap-2">
                                    <Progress value={algo.performance.efficiency} className="h-2 flex-1" />
                                    <span className={`text-sm font-bold ${getPerformanceColor(algo.performance.efficiency)}`}>
                                      {algo.performance.efficiency}%
                                    </span>
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Cost Analysis */}
                  <Card className="quantum-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-foreground">
                        <Award className="h-5 w-5 text-primary" />
                        💰 Cost-Performance Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {insights.algorithms.map((algo, index) => (
                          <motion.div
                            key={algo.name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 rounded-xl bg-gradient-to-br from-muted/20 to-muted/10 border border-primary/20"
                          >
                            <h4 className="font-semibold text-primary mb-3">{algo.name}</h4>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">MegaETH Gas:</span>
                                <span className="font-bold text-yellow-400">{algo.costAnalysis.megaethCost.toFixed(4)} MegaETH</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Compute Cost:</span>
                                <span className="font-bold text-blue-400">{algo.costAnalysis.computeCost.toFixed(4)} MegaETH</span>
                              </div>
                              <div className="flex justify-between border-t border-primary/20 pt-2">
                                <span className="text-muted-foreground font-medium">Total Cost:</span>
                                <span className="font-bold text-green-400">{algo.costAnalysis.totalCost.toFixed(4)} MegaETH</span>
                              </div>
                            </div>
                            
                            <div className="mt-3 p-2 rounded bg-primary/10">
                              <p className="text-xs text-primary">
                                💡 Cost per qubit: {(algo.costAnalysis.totalCost / algo.resourceUsage.qubits).toFixed(6)} MegaETH
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="comparison" className="mt-6">
                <div className="space-y-6">
                  {/* Head-to-Head Comparison */}
                  <Card className="quantum-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-foreground">
                        <Activity className="h-5 w-5 text-primary" />
                        🥊 Head-to-Head Algorithm Comparison
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Speed Comparison */}
                        <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
                          <h4 className="font-semibold text-green-200 mb-4 flex items-center gap-2">
                            <Zap className="h-5 w-5" />
                            ⚡ Speed Rankings
                          </h4>
                          <div className="space-y-3">
                            {insights.algorithms
                              .sort((a, b) => a.executionTime.real - b.executionTime.real)
                              .map((algo, index) => (
                              <div key={algo.name} className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  index === 0 ? 'bg-yellow-500 text-black' :
                                  index === 1 ? 'bg-gray-400 text-black' :
                                  index === 2 ? 'bg-orange-600 text-white' :
                                  'bg-muted text-foreground'
                                }`}>
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-foreground">{algo.name}</p>
                                  <p className="text-xs text-muted-foreground">{formatTime(algo.executionTime.real)}</p>
                                </div>
                                {index === 0 && <Award className="h-4 w-4 text-yellow-500" />}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Efficiency Comparison */}
                        <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                          <h4 className="font-semibold text-blue-200 mb-4 flex items-center gap-2">
                            <Gauge className="h-5 w-5" />
                            🎯 Efficiency Rankings
                          </h4>
                          <div className="space-y-3">
                            {insights.algorithms
                              .sort((a, b) => b.performance.efficiency - a.performance.efficiency)
                              .map((algo, index) => (
                              <div key={algo.name} className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  index === 0 ? 'bg-yellow-500 text-black' :
                                  index === 1 ? 'bg-gray-400 text-black' :
                                  index === 2 ? 'bg-orange-600 text-white' :
                                  'bg-muted text-foreground'
                                }`}>
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-foreground">{algo.name}</p>
                                  <p className="text-xs text-muted-foreground">{algo.performance.efficiency}% efficient</p>
                                </div>
                                {index === 0 && <Award className="h-4 w-4 text-yellow-500" />}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Provider Performance */}
                  <Card className="quantum-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-foreground">
                        <Brain className="h-5 w-5 text-primary" />
                        🏭 Provider Performance Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6 md:grid-cols-3">
                        {['Google Willow', 'IBM Condor', 'Amazon Braket'].map((provider, index) => {
                          const providerAlgos = insights.algorithms.filter(a => a.provider === provider);
                          const avgEfficiency = providerAlgos.reduce((sum, a) => sum + a.performance.efficiency, 0) / providerAlgos.length;
                          const avgFidelity = providerAlgos.reduce((sum, a) => sum + a.resourceUsage.fidelity, 0) / providerAlgos.length;
                          const totalRuns = providerAlgos.reduce((sum, a) => sum + a.runCount, 0);
                          
                          return (
                            <motion.div
                              key={provider}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
                            >
                              <div className="flex items-center gap-2 mb-4">
                                <div className={`w-3 h-3 rounded-full ${
                                  provider.includes('Google') ? 'bg-blue-500' :
                                  provider.includes('IBM') ? 'bg-indigo-500' :
                                  'bg-orange-500'
                                } animate-pulse`} />
                                <h4 className="font-semibold text-primary">{provider}</h4>
                              </div>
                              
                              <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Algorithms:</span>
                                  <span className="font-bold text-foreground">{providerAlgos.length}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Total Runs:</span>
                                  <span className="font-bold text-blue-400">{totalRuns}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Avg Efficiency:</span>
                                  <span className={`font-bold ${getPerformanceColor(avgEfficiency)}`}>
                                    {avgEfficiency.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Avg Fidelity:</span>
                                  <span className={`font-bold ${getPerformanceColor(avgFidelity)}`}>
                                    {avgFidelity.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                              
                              <div className="mt-4">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-muted-foreground">Overall Score</span>
                                  <span className="font-bold text-primary">{((avgEfficiency + avgFidelity) / 2).toFixed(0)}%</span>
                                </div>
                                <Progress value={(avgEfficiency + avgFidelity) / 2} className="h-2" />
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="insights" className="mt-6">
                <div className="space-y-6">
                  {/* AI-Powered Insights */}
                  <Card className="quantum-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-foreground">
                        <Lightbulb className="h-5 w-5 text-primary" />
                        🧠 AI-Powered Performance Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <Alert className="border-blue-500/20 bg-blue-500/5">
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-foreground">
                          <div className="font-semibold text-blue-400 mb-2">💡 Key Insight</div>
                          {insights.insights.recommendation}
                        </AlertDescription>
                      </Alert>

                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Performance Trends */}
                        <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
                          <h4 className="font-semibold text-green-200 mb-4 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            📈 Performance Trends
                          </h4>
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10">
                              <ChevronRight className="h-4 w-4 text-green-400" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">Quantum Advantage Confirmed</p>
                                <p className="text-xs text-green-200/80">
                                  Real quantum hardware shows 5000-15000% improvement over classical simulation
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10">
                              <ChevronRight className="h-4 w-4 text-blue-400" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">Provider Optimization</p>
                                <p className="text-xs text-blue-200/80">
                                  Google Willow excels at simple circuits, IBM Condor handles complex algorithms better
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/10">
                              <ChevronRight className="h-4 w-4 text-purple-400" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">Cost Efficiency</p>
                                <p className="text-xs text-purple-200/80">
                                  MegaETH's low gas fees make quantum computing accessible for research
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Optimization Recommendations */}
                        <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
                          <h4 className="font-semibold text-purple-200 mb-4 flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            🎯 Optimization Tips
                          </h4>
                          <div className="space-y-4">
                            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                              <p className="text-sm font-medium text-foreground mb-1">🚀 For Speed</p>
                              <p className="text-xs text-purple-200/80">
                                Use Bell State or Superposition algorithms for fastest results
                              </p>
                            </div>
                            
                            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                              <p className="text-sm font-medium text-foreground mb-1">💰 For Cost</p>
                              <p className="text-xs text-blue-200/80">
                                Simple algorithms on Google Willow offer best cost-performance ratio
                              </p>
                            </div>
                            
                            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                              <p className="text-sm font-medium text-foreground mb-1">🎯 For Accuracy</p>
                              <p className="text-xs text-green-200/80">
                                IBM Condor provides highest fidelity for complex quantum circuits
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Algorithm Selection Guide */}
                  <Card className="quantum-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-foreground">
                        <Brain className="h-5 w-5 text-primary" />
                        🧭 Algorithm Selection Guide
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
                          <h5 className="font-semibold text-green-200 mb-3">🌱 Beginner Friendly</h5>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">Bell State Creation</p>
                            <p className="text-xs text-green-200/80">Perfect for learning quantum entanglement</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Progress value={95} className="h-1 flex-1" />
                              <span className="text-xs text-green-400">95% success rate</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20">
                          <h5 className="font-semibold text-yellow-200 mb-3">🎓 Intermediate</h5>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">Grover's Search</p>
                            <p className="text-xs text-yellow-200/80">Quantum database search advantage</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Progress value={88} className="h-1 flex-1" />
                              <span className="text-xs text-yellow-400">88% efficiency</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20">
                          <h5 className="font-semibold text-red-200 mb-3">🔬 Advanced</h5>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">Shor's Algorithm</p>
                            <p className="text-xs text-red-200/80">Cryptography-breaking potential</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Progress value={75} className="h-1 flex-1" />
                              <span className="text-xs text-red-400">75% complexity</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Refresh Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex justify-center"
          >
            <Button 
              onClick={fetchExecutionInsights} 
              disabled={isLoading}
              className="quantum-button"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Analytics
            </Button>
          </motion.div>
        </>
      ) : (
        <div className="text-center py-16">
          <Atom className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Execution Data</h3>
          <p className="text-muted-foreground">Submit quantum jobs to see performance insights</p>
        </div>
      )}
    </div>
  );
}