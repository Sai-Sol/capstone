"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeftRight, 
  Zap, 
  Shield, 
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  RefreshCw
} from "lucide-react";

export default function CrossChainBridgePage() {
  const { isConnected, balance } = useWallet();
  const { toast } = useToast();
  const [fromChain, setFromChain] = useState("megaeth");
  const [toChain, setToChain] = useState("ethereum");
  const [bridgeAmount, setBridgeAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("ETH");

  const supportedChains = [
    { id: "megaeth", name: "MegaETH", icon: "⚡", color: "text-blue-400" },
    { id: "ethereum", name: "Ethereum", icon: "Ξ", color: "text-purple-400" },
    { id: "polygon", name: "Polygon", icon: "◆", color: "text-purple-600" },
    { id: "arbitrum", name: "Arbitrum", icon: "🔷", color: "text-blue-600" },
    { id: "optimism", name: "Optimism", icon: "🔴", color: "text-red-400" },
  ];

  const bridgeStats = [
    { label: "Total Volume", value: "$45.2M", icon: DollarSign, change: "+15.3%" },
    { label: "Active Bridges", value: "1,247", icon: ArrowLeftRight, change: "+8.7%" },
    { label: "Avg. Time", value: "3.2 min", icon: Clock, change: "-12.1%" },
    { label: "Success Rate", value: "99.8%", icon: CheckCircle, change: "+0.1%" },
  ];

  const recentBridges = [
    { from: "MegaETH", to: "Ethereum", amount: "2.5 ETH", status: "Completed", time: "2m ago" },
    { from: "Ethereum", to: "Polygon", amount: "1,000 USDC", status: "Processing", time: "5m ago" },
    { from: "Arbitrum", to: "MegaETH", amount: "0.8 ETH", status: "Completed", time: "12m ago" },
  ];

  const getChainInfo = (chainId: string) => {
    return supportedChains.find(chain => chain.id === chainId);
  };

  const handleSwapChains = () => {
    const temp = fromChain;
    setFromChain(toChain);
    setToChain(temp);
  };

  const estimatedFee = "0.005 ETH";
  const estimatedTime = "2-5 minutes";

  return (
    <div className="space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Cross-Chain Bridge
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Seamlessly transfer assets across different blockchain networks
        </p>
      </motion.div>

      {/* Bridge Statistics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {bridgeStats.map((stat, index) => (
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
                    <p className={`text-xs ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {stat.change} 24h
                    </p>
                  </div>
                  <stat.icon className="h-8 w-8 text-primary floating-particle" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Bridge Interface */}
        <div className="lg:col-span-2">
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5 text-primary" />
                Bridge Assets
              </CardTitle>
              <CardDescription>Transfer tokens between blockchain networks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* From Chain */}
              <div className="space-y-2">
                <Label>From Network</Label>
                <Select value={fromChain} onValueChange={setFromChain}>
                  <SelectTrigger className="quantum-input h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedChains.map((chain) => (
                      <SelectItem key={chain.id} value={chain.id}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{chain.icon}</span>
                          <span>{chain.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSwapChains}
                  className="rounded-full border-primary/20 hover:bg-primary/10"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              </div>

              {/* To Chain */}
              <div className="space-y-2">
                <Label>To Network</Label>
                <Select value={toChain} onValueChange={setToChain}>
                  <SelectTrigger className="quantum-input h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedChains.filter(chain => chain.id !== fromChain).map((chain) => (
                      <SelectItem key={chain.id} value={chain.id}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{chain.icon}</span>
                          <span>{chain.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <Label>Amount</Label>
                <div className="relative">
                  <Input
                    placeholder="0.0"
                    value={bridgeAmount}
                    onChange={(e) => setBridgeAmount(e.target.value)}
                    className="quantum-input h-12 pr-20"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Select value={selectedToken} onValueChange={setSelectedToken}>
                      <SelectTrigger className="w-16 h-8 border-0 bg-transparent">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ETH">ETH</SelectItem>
                        <SelectItem value="USDC">USDC</SelectItem>
                        <SelectItem value="MEGA">MEGA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Available: {balance || "0"} {selectedToken}
                </p>
              </div>

              {/* Bridge Details */}
              {bridgeAmount && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-muted/20 to-muted/10 border border-primary/10">
                  <h4 className="font-semibold text-primary mb-3">Bridge Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimated Fee:</span>
                      <span className="font-medium">{estimatedFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimated Time:</span>
                      <span className="font-medium">{estimatedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">You'll Receive:</span>
                      <span className="font-medium text-green-400">
                        ~{(parseFloat(bridgeAmount) - 0.005).toFixed(3)} {selectedToken}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-200 mb-1">Security Notice</h4>
                    <p className="text-sm text-yellow-200/80">
                      Always verify the destination address and network before confirming your bridge transaction.
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full quantum-button h-12" 
                disabled={!isConnected || !bridgeAmount}
              >
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                Bridge {selectedToken}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bridges */}
        <Card className="quantum-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Bridges
            </CardTitle>
            <CardDescription>Your bridge transaction history</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentBridges.map((bridge, index) => (
              <div key={index} className="p-3 rounded-lg bg-muted/20 border border-primary/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono">
                      {getChainInfo(bridge.from.toLowerCase())?.icon} → {getChainInfo(bridge.to.toLowerCase())?.icon}
                    </span>
                    <Badge variant={bridge.status === 'Completed' ? 'default' : 'secondary'}>
                      {bridge.status}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm font-medium">{bridge.amount}</p>
                <p className="text-xs text-muted-foreground">
                  {bridge.from} → {bridge.to} • {bridge.time}
                </p>
              </div>
            ))}
            
            <Button variant="outline" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              View All Transactions
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}