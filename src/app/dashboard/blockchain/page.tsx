"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useWallet } from "@/hooks/use-wallet";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Activity, 
  Zap, 
  TrendingUp, 
  Shield, 
  Globe, 
  Clock,
  DollarSign,
  BarChart3,
  Settings,
  ExternalLink,
  Copy,
  RefreshCw,
  Code
} from "lucide-react";
import GasTools from "@/components/gas-tools";
import ContractTools from "@/components/contract-tools";
import AdminDecoder from "@/components/admin-decoder";

export default function BlockchainHubPage() {
  const { isConnected, address, balance, chainId } = useWallet();
  const { user } = useAuth();
  const { toast } = useToast();
  const [gasPrice, setGasPrice] = useState("12.5");
  const [blockHeight, setBlockHeight] = useState("2,847,392");
  const [tps, setTps] = useState("15,847");
  const [liveTransactions, setLiveTransactions] = useState<any[]>([]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    // Simulate WebSocket connection for live data
    const interval = setInterval(() => {
      // Update gas price
      setGasPrice(prev => (parseFloat(prev) + (Math.random() - 0.5) * 2).toFixed(1));
      
      // Update TPS
      setTps(prev => (parseInt(prev.replace(',', '')) + Math.floor((Math.random() - 0.5) * 1000)).toLocaleString());
      
      // Add new transaction
      const newTx = {
        hash: `0x${Math.random().toString(16).substr(2, 8)}...`,
        type: ["Transfer", "Swap", "Contract Call"][Math.floor(Math.random() * 3)],
        value: (Math.random() * 10).toFixed(4),
        timestamp: Date.now()
      };
      
      setLiveTransactions(prev => [newTx, ...prev.slice(0, 9)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const networkStats = [
    { label: "Gas Price", value: `${gasPrice} Gwei`, icon: Zap, trend: "+2.1%" },
    { label: "Block Height", value: blockHeight, icon: BarChart3, trend: "+0.8%" },
    { label: "TPS", value: tps, icon: Activity, trend: "+12.3%" },
    { label: "Network Load", value: "67%", icon: Globe, trend: "-5.2%" },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Transaction hash copied successfully",
    });
  };

  return (
    <div className="space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Blockchain Hub
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Real-time blockchain monitoring, gas optimization, and smart contract tools
        </p>
      </motion.div>

      {/* Network Status Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {networkStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="quantum-card hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-primary">{stat.value}</p>
                    <p className={`text-xs ${stat.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {stat.trend} from last hour
                    </p>
                  </div>
                  <stat.icon className="h-8 w-8 text-primary floating-particle" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="monitor" className="w-full">
        <TabsList className={`grid w-full ${user?.role === 'admin' ? 'grid-cols-5' : 'grid-cols-4'} bg-muted/30 h-14`}>
          <TabsTrigger value="monitor" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Activity className="mr-2 h-4 w-4" />
            Monitor
          </TabsTrigger>
          <TabsTrigger value="gas" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Zap className="mr-2 h-4 w-4" />
            Gas Optimizer
          </TabsTrigger>
          <TabsTrigger value="contracts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Settings className="mr-2 h-4 w-4" />
            Contracts
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <TrendingUp className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
          {user?.role === 'admin' && (
            <TabsTrigger value="decoder" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Code className="mr-2 h-4 w-4" />
              Decoder
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="monitor" className="mt-8">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Real-time Transactions */}
            <Card className="quantum-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Live Transactions
                </CardTitle>
                <CardDescription>Real-time blockchain transaction feed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {liveTransactions.map((tx, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-primary/10">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-400 quantum-pulse" />
                      <div>
                        <p className="font-mono text-sm">{tx.hash}</p>
                        <p className="text-xs text-muted-foreground">{tx.type} • {tx.value} ETH</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="default">Confirmed</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.floor((Date.now() - tx.timestamp) / 1000)}s ago
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(tx.hash)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {liveTransactions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Waiting for live transactions...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Network Health */}
            <Card className="quantum-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Network Health
                </CardTitle>
                <CardDescription>Real-time network status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Network Congestion</span>
                    <span className="text-green-400">Low (23%)</span>
                  </div>
                  <Progress value={23} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Validator Uptime</span>
                    <span className="text-green-400">99.8%</span>
                  </div>
                  <Progress value={99.8} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Block Finality</span>
                    <span className="text-green-400">2.1s avg</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gas" className="mt-8">
          <GasTools />
        </TabsContent>

        <TabsContent value="contracts" className="mt-8">
          <ContractTools />
        </TabsContent>

        <TabsContent value="analytics" className="mt-8">
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Network Analytics
              </CardTitle>
              <CardDescription>Detailed network performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                  Advanced Analytics Coming Soon
                </h3>
                <p className="text-muted-foreground">
                  Comprehensive charts and metrics will be available in the next update
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {user?.role === 'admin' && (
          <TabsContent value="decoder" className="mt-8">
            <AdminDecoder />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}