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
  Code,
  MessageSquare,
  Send,
  Bot
} from "lucide-react";
import { Coins } from "lucide-react";
import GasTools from "@/components/gas-tools";
import ContractTools from "@/components/contract-tools";
import AdminDecoder from "@/components/admin-decoder";
import BlockchainOperations from "@/components/blockchain-operations";
import BlockchainAIAssistant from "@/components/blockchain-ai-assistant";
import SmartContractInteractions from "@/components/smart-contract-interactions";
import TransactionAnalyzer from "@/components/transaction-analyzer";
import NetworkMonitor from "@/components/network-monitor";
import DeFiDashboard from "@/components/defi-dashboard";

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
        <TabsList className={`grid w-full ${user?.role === 'admin' ? 'grid-cols-8' : 'grid-cols-7'} bg-muted/30 h-14`}>
          <TabsTrigger value="monitor" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Activity className="mr-2 h-4 w-4" />
            Monitor
          </TabsTrigger>
          <TabsTrigger value="analyzer" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analyzer
          </TabsTrigger>
          <TabsTrigger value="operations" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Settings className="mr-2 h-4 w-4" />
            Operations
          </TabsTrigger>
          <TabsTrigger value="gas" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Zap className="mr-2 h-4 w-4" />
            Gas Optimizer
          </TabsTrigger>
          <TabsTrigger value="contracts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Settings className="mr-2 h-4 w-4" />
            Contracts
          </TabsTrigger>
          <TabsTrigger value="ai-assistant" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Bot className="mr-2 h-4 w-4" />
            Blockchain AI
          </TabsTrigger>
          {user?.role === 'admin' && (
            <TabsTrigger value="decoder" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Code className="mr-2 h-4 w-4" />
              Decoder
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="monitor" className="mt-8">
          <NetworkMonitor />
        </TabsContent>

        <TabsContent value="analyzer" className="mt-8">
          <TransactionAnalyzer />
        </TabsContent>

        <TabsContent value="operations" className="mt-8">
          <BlockchainOperations />
        </TabsContent>

        <TabsContent value="gas" className="mt-8">
          <GasTools />
        </TabsContent>

        <TabsContent value="contracts" className="mt-8">
          <div className="space-y-8">
            <SmartContractInteractions />
            <ContractTools />
          </div>
        </TabsContent>


        <TabsContent value="ai-assistant" className="mt-8">
          <BlockchainAIAssistant />
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