"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWallet } from "@/hooks/use-wallet";
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Activity,
  DollarSign,
  Clock,
  Target,
  Zap,
  RefreshCw
} from "lucide-react";

interface AnalyticsData {
  totalTransactions: number;
  totalVolume: string;
  avgGasPrice: string;
  successRate: string;
  topTokens: Array<{
    symbol: string;
    volume: string;
    change: string;
  }>;
  gasUsageHistory: Array<{
    date: string;
    amount: number;
  }>;
}

export default function AnalyticsPage() {
  const { isConnected, address } = useWallet();
  const [timeframe, setTimeframe] = useState("7d");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isConnected) {
      loadAnalytics();
    }
  }, [isConnected, timeframe]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const mockAnalytics: AnalyticsData = {
        totalTransactions: 247,
        totalVolume: "45,230.67",
        avgGasPrice: "18.5",
        successRate: "99.2",
        topTokens: [
          { symbol: "ETH", volume: "25,430.50", change: "+5.67" },
          { symbol: "MEGA", volume: "12,800.25", change: "+12.34" },
          { symbol: "QTM", volume: "7,000.92", change: "-2.45" }
        ],
        gasUsageHistory: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
          amount: Math.random() * 100 + 50
        }))
      };

      setAnalytics(mockAnalytics);
      setIsLoading(false);
    }, 1500);
  };

  const timeframes = [
    { value: "24h", label: "24 Hours" },
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "90d", label: "90 Days" }
  ];

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
            Analytics Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive insights into your blockchain activity
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="quantum-input w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeframes.map(tf => (
                <SelectItem key={tf.value} value={tf.value}>
                  {tf.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={loadAnalytics}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {analytics && (
        <>
          {/* Key Metrics */}
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
                      <p className="text-sm text-muted-foreground">Total Transactions</p>
                      <p className="text-2xl font-bold text-primary">{analytics.totalTransactions}</p>
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
                      <p className="text-sm text-muted-foreground">Total Volume</p>
                      <p className="text-2xl font-bold text-green-400">${analytics.totalVolume}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-400 floating-particle" />
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
                      <p className="text-sm text-muted-foreground">Avg Gas Price</p>
                      <p className="text-2xl font-bold text-yellow-400">{analytics.avgGasPrice} Gwei</p>
                    </div>
                    <Zap className="h-8 w-8 text-yellow-400 floating-particle" />
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
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <p className="text-2xl font-bold text-blue-400">{analytics.successRate}%</p>
                    </div>
                    <Target className="h-8 w-8 text-blue-400 floating-particle" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Charts and Analysis */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/30 h-14">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <BarChart3 className="mr-2 h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="tokens" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <PieChart className="mr-2 h-4 w-4" />
                Token Analysis
              </TabsTrigger>
              <TabsTrigger value="gas" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Zap className="mr-2 h-4 w-4" />
                Gas Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-8">
              <Card className="quantum-card">
                <CardHeader>
                  <CardTitle>Transaction Volume Trend</CardTitle>
                  <CardDescription>Your transaction activity over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {analytics.gasUsageHistory.map((data, index) => (
                      <div
                        key={index}
                        className="bg-primary/20 hover:bg-primary/40 transition-colors rounded-t flex-1"
                        style={{ height: `${(data.amount / 150) * 100}%` }}
                        title={`${data.date}: ${data.amount.toFixed(0)} transactions`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>{analytics.gasUsageHistory[0]?.date}</span>
                    <span>{analytics.gasUsageHistory[analytics.gasUsageHistory.length - 1]?.date}</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tokens" className="mt-8">
              <Card className="quantum-card">
                <CardHeader>
                  <CardTitle>Top Traded Tokens</CardTitle>
                  <CardDescription>Your most active trading pairs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.topTokens.map((token, index) => (
                      <div key={token.symbol} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-primary/10">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="font-bold text-primary text-sm">{token.symbol[0]}</span>
                          </div>
                          <div>
                            <p className="font-semibold">{token.symbol}</p>
                            <p className="text-sm text-muted-foreground">Volume: ${token.volume}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className={
                            parseFloat(token.change) >= 0 ? 'text-green-400 border-green-400/50' : 'text-red-400 border-red-400/50'
                          }>
                            {token.change}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gas" className="mt-8">
              <Card className="quantum-card">
                <CardHeader>
                  <CardTitle>Gas Usage Analytics</CardTitle>
                  <CardDescription>Your gas consumption patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-1">
                    {analytics.gasUsageHistory.map((data, index) => (
                      <div
                        key={index}
                        className="bg-yellow-400/20 hover:bg-yellow-400/40 transition-colors rounded-t flex-1"
                        style={{ height: `${(data.amount / 150) * 100}%` }}
                        title={`${data.date}: ${data.amount.toFixed(2)} Gwei avg`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>7 days ago</span>
                    <span>Today</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}