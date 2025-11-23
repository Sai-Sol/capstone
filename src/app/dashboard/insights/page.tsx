"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  TrendingUp,
  Target,
  BarChart3,
  Atom,
  Zap,
  Clock,
  DollarSign,
  Activity,
  Lightbulb,
  RefreshCw,
  Sparkles,
  BookOpen,
  Filter,
  Gauge,
  Cpu,
  Database,
  GitBranch,
  Network,
  Shield,
  Thermometer,
  Waveform,
  Grid
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface QuantumMetrics {
  entanglementRatio?: number;
  superpositionStates?: number;
  amplificationFactor?: number;
  coherenceTime?: number;
  errorRate?: number;
  quantumVolume?: number;
  gateFidelity?: number;
  measurementFidelity?: number;
  statePreparationFidelity?: number;
  readoutError?: number;
  decoherenceRate?: number;
  t1Time?: number;
  t2Time?: number;
}

interface ExecutionInsight {
  algorithmName: string;
  algorithmType: "bell-state" | "grover-search" | "superposition" | "teleportation" | "fourier-transform" | "random-generator" | "deutsch-jozsa" | "phase-estimation" | "custom";
  provider: string;
  executionTime: {
    simulated: number;
    real: number;
    improvement: number;
    queueTime: number;
    compilationTime: number;
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
    throughput: number;
    latency: number;
  };
  costAnalysis: {
    megaethCost: number;
    computeCost: number;
    totalCost: number;
    costPerOperation: number;
  };
  quantumMetrics: QuantumMetrics;
  hardwareMetrics: {
    temperature: number;
    clockFrequency: number;
    connectivity: number;
    errorCorrection: string;
  };
  trends: {
    fidelityTrend: "improving" | "stable" | "declining";
    performanceTrend: "improving" | "stable" | "declining";
    costTrend: "increasing" | "stable" | "decreasing";
  };
  predictions: {
    nextRunFidelity: number;
    nextRunTime: number;
    optimizationPotential: number;
  };
  runCount: number;
  lastRun: number;
}

interface AIInsights {
  fastest: string;
  mostEfficient: string;
  mostAccurate: string;
  recommendation: string;
  trends: {
    averageImprovement: number;
    totalExecutions: number;
    averageFidelity: number;
  };
}

export default function InsightsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [insights, setInsights] = useState<{
    metrics: ExecutionInsight[];
    insights: AIInsights;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('all');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [selectedMetric, setSelectedMetric] = useState<string>('efficiency');
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'comparison'>('grid');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);

  useEffect(() => {
    fetchExecutionInsights();
  }, [selectedTimeRange]);

  // Enhanced filtering logic
  const filteredMetrics = useMemo(() => {
    if (!insights) return [];

    return insights.metrics.filter(metric => {
      const algorithmMatch = selectedAlgorithm === 'all' || metric.algorithmType === selectedAlgorithm;
      const providerMatch = selectedProvider === 'all' || metric.provider === selectedProvider;
      return algorithmMatch && providerMatch;
    });
  }, [insights, selectedAlgorithm, selectedProvider]);

  // Algorithm-specific analysis
  const getAlgorithmSpecificMetrics = (algorithm: string, metrics: QuantumMetrics) => {
    switch (algorithm) {
      case 'bell-state':
        return {
          primary: metrics.entanglementRatio || 0,
          label: 'Entanglement',
          unit: '%',
          icon: '🔗',
          color: 'text-blue-400',
          description: 'Quantum correlation strength between qubits'
        };
      case 'grover-search':
        return {
          primary: metrics.amplificationFactor || 0,
          label: 'Amplification',
          unit: 'x',
          icon: '🔍',
          color: 'text-green-400',
          description: 'Quantum speedup over classical search'
        };
      case 'superposition':
        return {
          primary: metrics.superpositionStates || 0,
          label: 'Superposition',
          unit: 'states',
          icon: '🌊',
          color: 'text-purple-400',
          description: 'Number of quantum states simultaneously'
        };
      case 'teleportation':
        return {
          primary: metrics.statePreparationFidelity || 0,
          label: 'Teleport Fidelity',
          unit: '%',
          icon: '📡',
          color: 'text-cyan-400',
          description: 'Accuracy of quantum state transfer'
        };
      case 'fourier-transform':
        return {
          primary: metrics.quantumVolume || 0,
          label: 'Quantum Volume',
          unit: '',
          icon: '🎵',
          color: 'text-indigo-400',
          description: 'Overall quantum computational capability'
        };
      case 'random-generator':
        return {
          primary: metrics.coherenceTime || 0,
          label: 'Coherence',
          unit: 'μs',
          icon: '🎲',
          color: 'text-orange-400',
          description: 'Quantum state preservation duration'
        };
      default:
        return {
          primary: metrics.gateFidelity || 0,
          label: 'Gate Fidelity',
          unit: '%',
          icon: '⚛️',
          color: 'text-primary',
          description: 'Quantum gate operation accuracy'
        };
    }
  };

  const getTrendIcon = (trend: "improving" | "stable" | "declining") => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'declining': return <TrendingUp className="h-4 w-4 text-red-400 rotate-180" />;
      default: return <Activity className="h-4 w-4 text-yellow-400" />;
    }
  };

  const fetchExecutionInsights = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/execution-insights?timeRange=${selectedTimeRange}`);
      const data = await response.json();
      setInsights(data);

    } catch (error) {
      console.error('Failed to fetch insights:', error);
      toast({
        variant: "destructive",
        title: "Insights Error",
        description: "Failed to load execution insights. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPerformanceColor = (value: number) => {
    if (value >= 95) return 'text-green-400';
    if (value >= 85) return 'text-yellow-400';
    if (value >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

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
          Quantum Performance Insights
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Analyze your quantum experiments to track performance, optimization, and learning progress
        </p>
      </motion.div>

      {/* Enhanced Controls */}
      <div className="flex flex-col gap-4">
        {/* Time Range Selector */}
        <div className="flex justify-center">
          <div className="flex gap-2 p-1 bg-muted/30 rounded-lg">
            {['1d', '7d', '30d', '90d'].map((range) => (
              <Button
                key={range}
                variant={selectedTimeRange === range ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSelectedTimeRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>

        {/* Advanced Filters */}
        <Card className="quantum-card border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Advanced Filters</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Algorithm Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Algorithm Type</label>
                <select
                  value={selectedAlgorithm}
                  onChange={(e) => setSelectedAlgorithm(e.target.value)}
                  className="w-full p-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Algorithms</option>
                  <option value="bell-state">Bell State</option>
                  <option value="grover-search">Grover's Search</option>
                  <option value="superposition">Superposition</option>
                  <option value="teleportation">Teleportation</option>
                  <option value="fourier-transform">Fourier Transform</option>
                  <option value="random-generator">Random Generator</option>
                  <option value="deutsch-jozsa">Deutsch-Jozsa</option>
                  <option value="phase-estimation">Phase Estimation</option>
                </select>
              </div>

              {/* Provider Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Quantum Provider</label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-full p-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Providers</option>
                  <option value="Google Willow">Google Willow</option>
                  <option value="IBM Condor">IBM Condor</option>
                  <option value="Amazon Braket">Amazon Braket</option>
                </select>
              </div>

              {/* Metric Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Primary Metric</label>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="w-full p-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="efficiency">Efficiency</option>
                  <option value="fidelity">Fidelity</option>
                  <option value="accuracy">Accuracy</option>
                  <option value="throughput">Throughput</option>
                  <option value="cost">Cost Efficiency</option>
                </select>
              </div>

              {/* View Mode */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">View Mode</label>
                <div className="flex gap-1">
                  {[
                    { value: 'grid', icon: <Grid className="h-3 w-3" /> },
                    { value: 'table', icon: <BarChart3 className="h-3 w-3" /> },
                    { value: 'comparison', icon: <GitBranch className="h-3 w-3" /> }
                  ].map((mode) => (
                    <Button
                      key={mode.value}
                      variant={viewMode === mode.value ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode(mode.value as 'grid' | 'table' | 'comparison')}
                      className="flex-1"
                    >
                      {mode.icon}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Filter Results Summary */}
            {insights && (
              <div className="mt-3 pt-3 border-t border-primary/10">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Showing {filteredMetrics.length} of {insights.metrics.length} results
                  </span>
                  {filteredMetrics.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCompareMode(!compareMode)}
                      className={compareMode ? "bg-primary/20 border-primary/50" : ""}
                    >
                      <GitBranch className="h-3 w-3 mr-1" />
                      Compare
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/30 h-12">
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="quantum" className="flex items-center gap-2">
            <Atom className="h-4 w-4" />
            Quantum Metrics
          </TabsTrigger>
          <TabsTrigger value="learning" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Learning
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="mt-6">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="quantum-card">
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-muted/50 rounded w-3/4"></div>
                      <div className="h-8 bg-muted/50 rounded"></div>
                      <div className="h-4 bg-muted/50 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : insights && filteredMetrics.length > 0 ? (
            <div className="space-y-8">
              {/* Enhanced Performance Metrics Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredMetrics.map((metric, index) => {
                  const algorithmMetrics = getAlgorithmSpecificMetrics(metric.algorithmType, metric.quantumMetrics);

                  return (
                    <motion.div
                      key={`${metric.algorithmName}-${metric.provider}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`quantum-card hover:scale-105 transition-all duration-300 h-full ${
                        compareMode && selectedForComparison.includes(metric.algorithmName)
                          ? 'ring-2 ring-primary/50 bg-primary/5'
                          : ''
                      }`}>
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="text-lg">{algorithmMetrics.icon}</div>
                              <div>
                                <CardTitle className="text-lg">{metric.algorithmName}</CardTitle>
                                <CardDescription>{metric.provider}</CardDescription>
                              </div>
                            </div>
                            {compareMode && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (selectedForComparison.includes(metric.algorithmName)) {
                                    setSelectedForComparison(prev =>
                                      prev.filter(name => name !== metric.algorithmName)
                                    );
                                  } else {
                                    setSelectedForComparison(prev => [...prev, metric.algorithmName]);
                                  }
                                }}
                                className={selectedForComparison.includes(metric.algorithmName) ? "text-primary" : ""}
                              >
                                {selectedForComparison.includes(metric.algorithmName) ? "✓" : "+"}
                              </Button>
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          {/* Algorithm-Specific Primary Metric */}
                          <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
                            <div className="text-center">
                              <div className={`text-2xl font-bold ${algorithmMetrics.color}`}>
                                {algorithmMetrics.primary.toFixed(algorithmMetrics.unit === '%' ? 1 : 2)}{algorithmMetrics.unit}
                              </div>
                              <div className="text-xs text-muted-foreground">{algorithmMetrics.label}</div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 italic">
                              {algorithmMetrics.description}
                            </div>
                          </div>

                          {/* Performance Scores */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="text-center">
                              <div className={`text-xl font-bold ${getPerformanceColor(metric.performance.efficiency)}`}>
                                {metric.performance.efficiency}%
                              </div>
                              <div className="text-xs text-muted-foreground">Efficiency</div>
                            </div>
                            <div className="text-center">
                              <div className={`text-xl font-bold ${getPerformanceColor(metric.resourceUsage.fidelity)}`}>
                                {metric.resourceUsage.fidelity.toFixed(1)}%
                              </div>
                              <div className="text-xs text-muted-foreground">Fidelity</div>
                            </div>
                          </div>

                          {/* Trend Indicators */}
                          <div className="flex justify-around p-2 rounded bg-muted/10">
                            <div className="text-center">
                              {getTrendIcon(metric.trends.fidelityTrend)}
                              <div className="text-xs text-muted-foreground mt-1">Fidelity</div>
                            </div>
                            <div className="text-center">
                              {getTrendIcon(metric.trends.performanceTrend)}
                              <div className="text-xs text-muted-foreground mt-1">Performance</div>
                            </div>
                            <div className="text-center">
                              {getTrendIcon(metric.trends.costTrend)}
                              <div className="text-xs text-muted-foreground mt-1">Cost</div>
                            </div>
                          </div>

                          {/* Key Metrics */}
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Throughput:</span>
                              <span className="font-medium text-blue-400">{metric.performance.throughput}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Next Run Est:</span>
                              <span className="font-medium text-green-400">{metric.predictions.nextRunTime.toFixed(1)}ms</span>
                            </div>
                          </div>

                          {/* Hardware & Complexity */}
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className={
                              metric.performance.complexity === 'Low' ? 'text-green-400 border-green-400/50' :
                              metric.performance.complexity === 'Medium' ? 'text-yellow-400 border-yellow-400/50' :
                              'text-red-400 border-red-400/50'
                            }>
                              {metric.performance.complexity}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              <Thermometer className="inline h-3 w-3 mr-1" />
                              {metric.hardwareMetrics.temperature.toFixed(1)}°K
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Performance Recommendations */}
              <Card className="quantum-card border-green-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-400">
                    <Lightbulb className="h-6 w-6" />
                    Performance Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert className="border-green-500/20 bg-green-500/5">
                    <Sparkles className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-semibold text-green-400 mb-2">Recommendation</div>
                      <div className="text-green-200/90">{insights.insights.recommendation}</div>
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
                      <Target className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                      <div className="text-sm text-blue-200 mb-1">Fastest Algorithm</div>
                      <div className="font-bold text-blue-100">{insights.insights.fastest}</div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                      <Zap className="h-6 w-6 text-green-400 mx-auto mb-2" />
                      <div className="text-sm text-green-200 mb-1">Most Efficient</div>
                      <div className="font-bold text-green-100">{insights.insights.mostEfficient}</div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
                      <Activity className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                      <div className="text-sm text-purple-200 mb-1">Most Accurate</div>
                      <div className="font-bold text-purple-100">{insights.insights.mostAccurate}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="quantum-card">
              <CardContent className="p-12 text-center">
                <Brain className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Insights Available</h3>
                <p className="text-muted-foreground">
                  Submit some quantum jobs to see AI-powered performance insights and recommendations.
                </p>
                <Button className="mt-4" asChild>
                  <a href="/dashboard/create">Submit Your First Job</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="learning" className="mt-6">
          <div className="space-y-6">
            {/* Learning Assistant */}
            <Card className="quantum-card border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-primary" />
                  Learning Path
                </CardTitle>
                <CardDescription>
                  Continue your quantum computing journey based on your progress
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <Alert className="border-blue-500/30 bg-blue-500/5">
                  <BookOpen className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold text-blue-400 mb-2">
                      📚 Your Learning Level: {user?.role === 'admin' ? 'Advanced' : 'Intermediate'}
                    </div>
                    <div className="text-blue-200/90">
                      {user?.role === 'admin' 
                        ? 'As an advanced user, focus on quantum error correction, hybrid algorithms, and optimization techniques.'
                        : 'You\'re ready for intermediate concepts! Try Grover\'s algorithm and quantum Fourier transforms next.'
                      }
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4">
                  {[
                    { title: 'Next Challenge', desc: 'Grover\'s Search Algorithm', difficulty: 'Intermediate', icon: Target },
                    { title: 'Skill Building', desc: 'Quantum Error Correction', difficulty: 'Advanced', icon: Zap },
                    { title: 'Deep Dive', desc: 'Quantum Fourier Transform', difficulty: 'Advanced', icon: Activity }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-primary/10"
                    >
                      <item.icon className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </div>
                      <Badge variant="outline" className={
                        item.difficulty === 'Beginner' ? 'text-green-400 border-green-400/50' :
                        item.difficulty === 'Intermediate' ? 'text-yellow-400 border-yellow-400/50' :
                        'text-red-400 border-red-400/50'
                      }>
                        {item.difficulty}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}