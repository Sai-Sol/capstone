"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useWallet } from "@/hooks/use-wallet";
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
  RefreshCw
} from "lucide-react";

export default function BlockchainHubPage() {
  const { isConnected, address, balance, chainId } = useWallet();
  const { toast } = useToast();
  const [gasPrice, setGasPrice] = useState("12.5");
  const [blockHeight, setBlockHeight] = useState("2,847,392");
  const [tps, setTps] = useState("15,847");

  const networkStats = [
    { label: "Gas Price", value: `${gasPrice} Gwei`, icon: Zap, trend: "+2.1%" },
    { label: "Block Height", value: blockHeight, icon: BarChart3, trend: "+0.8%" },
    { label: "TPS", value: tps, icon: Activity, trend: "+12.3%" },
    { label: "Network Load", value: "67%", icon: Globe, trend: "-5.2%" },
  ];

  const recentTransactions = [
    { hash: "0x1a2b3c...", type: "Quantum Job", status: "Confirmed", gas: "21,000", time: "2m ago" },
    { hash: "0x4d5e6f...", type: "Contract Call", status: "Pending", gas: "45,000", time: "5m ago" },
    { hash: "0x7g8h9i...", type: "Token Transfer", status: "Confirmed", gas: "21,000", time: "8m ago" },
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
          Monitor network activity, optimize gas fees, and interact with smart contracts
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
        <TabsList className="grid w-full grid-cols-4 bg-muted/30 h-14">
          <TabsTrigger value="monitor" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Activity className="mr-2 h-4 w-4" />
            Monitor
          </TabsTrigger>
          <TabsTrigger value="gas" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Zap className="mr-2 h-4 w-4" />
            Gas Tools
          </TabsTrigger>
          <TabsTrigger value="contracts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Settings className="mr-2 h-4 w-4" />
            Contracts
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <TrendingUp className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitor" className="mt-8">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Real-time Transactions */}
            <Card className="quantum-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Recent Transactions
                </CardTitle>
                <CardDescription>Live transaction monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentTransactions.map((tx, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-primary/10">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${tx.status === 'Confirmed' ? 'bg-green-400' : 'bg-yellow-400'} quantum-pulse`} />
                      <div>
                        <p className="font-mono text-sm">{tx.hash}</p>
                        <p className="text-xs text-muted-foreground">{tx.type} • {tx.gas} gas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={tx.status === 'Confirmed' ? 'default' : 'secondary'}>
                        {tx.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{tx.time}</p>
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
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Gas Fee Optimization
              </CardTitle>
              <CardDescription>Optimize your transaction costs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-green-400" />
                    <span className="font-medium text-green-200">Slow</span>
                  </div>
                  <p className="text-2xl font-bold text-green-100">8.2 Gwei</p>
                  <p className="text-xs text-green-200/80">~5 minutes</p>
                </div>
                
                <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    <span className="font-medium text-yellow-200">Standard</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-100">12.5 Gwei</p>
                  <p className="text-xs text-yellow-200/80">~2 minutes</p>
                </div>
                
                <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-red-400" />
                    <span className="font-medium text-red-200">Fast</span>
                  </div>
                  <p className="text-2xl font-bold text-red-100">18.7 Gwei</p>
                  <p className="text-xs text-red-200/80">~30 seconds</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button className="quantum-button flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Gas Prices
                </Button>
                <Button variant="outline" className="flex-1">
                  <Settings className="mr-2 h-4 w-4" />
                  Advanced Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="mt-8">
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Smart Contract Interaction
              </CardTitle>
              <CardDescription>Interact with deployed contracts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                <h4 className="font-semibold text-primary mb-4">QuantumJobLogger Contract</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Address:</span>
                    <code className="text-sm font-mono">0xd1471126F18d76be253625CcA75e16a0F1C5B3e2</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge variant="outline" className="text-green-400 border-green-400/50">Active</Badge>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" className="quantum-button">
                      <ExternalLink className="mr-2 h-3 w-3" />
                      View on Explorer
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="mr-2 h-3 w-3" />
                      Interact
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
      </Tabs>
    </div>
  );
}