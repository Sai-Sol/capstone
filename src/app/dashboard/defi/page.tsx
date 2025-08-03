"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/hooks/use-wallet";
import { 
  Zap, 
  TrendingUp, 
  DollarSign, 
  Coins,
  PiggyBank,
  ArrowUpDown,
  Wallet,
  Shield,
  Clock,
  Target
} from "lucide-react";

export default function DeFiPortalPage() {
  const { isConnected, balance } = useWallet();
  const [stakeAmount, setStakeAmount] = useState("");
  const [selectedPool, setSelectedPool] = useState("eth-usdc");

  const stakingPools = [
    { 
      name: "ETH-USDC LP", 
      apy: "24.5%", 
      tvl: "$2.4M", 
      risk: "Low",
      rewards: "MEGA + Trading Fees"
    },
    { 
      name: "MEGA Staking", 
      apy: "18.2%", 
      tvl: "$8.1M", 
      risk: "Very Low",
      rewards: "MEGA Tokens"
    },
    { 
      name: "Quantum Pool", 
      apy: "45.8%", 
      tvl: "$1.2M", 
      risk: "Medium",
      rewards: "QTM + MEGA"
    },
  ];

  const yieldFarms = [
    { pair: "ETH/MEGA", apy: "67.3%", multiplier: "2x", status: "Active" },
    { pair: "USDC/QTM", apy: "42.1%", multiplier: "1.5x", status: "Active" },
    { pair: "MEGA/QTM", apy: "89.4%", multiplier: "3x", status: "New" },
  ];

  const portfolioStats = [
    { label: "Total Value Locked", value: "$12,450", icon: DollarSign, change: "+12.3%" },
    { label: "Pending Rewards", value: "145.67 MEGA", icon: Coins, change: "+5.2%" },
    { label: "APY Average", value: "34.2%", icon: TrendingUp, change: "+2.1%" },
    { label: "Active Positions", value: "3", icon: Target, change: "0%" },
  ];

  return (
    <div className="space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          DeFi Portal
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Stake, farm, and earn rewards in the quantum DeFi ecosystem
        </p>
      </motion.div>

      {/* Portfolio Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {portfolioStats.map((stat, index) => (
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
                    <p className={`text-xs ${stat.change.startsWith('+') ? 'text-green-400' : stat.change === '0%' ? 'text-muted-foreground' : 'text-red-400'}`}>
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

      <Tabs defaultValue="staking" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/30 h-14">
          <TabsTrigger value="staking" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <PiggyBank className="mr-2 h-4 w-4" />
            Staking
          </TabsTrigger>
          <TabsTrigger value="farming" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <TrendingUp className="mr-2 h-4 w-4" />
            Yield Farming
          </TabsTrigger>
          <TabsTrigger value="swap" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Swap
          </TabsTrigger>
        </TabsList>

        <TabsContent value="staking" className="mt-8">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Staking Interface */}
            <Card className="quantum-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PiggyBank className="h-5 w-5 text-primary" />
                  Stake Tokens
                </CardTitle>
                <CardDescription>Earn rewards by staking your tokens</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="stake-amount">Amount to Stake</Label>
                  <div className="relative">
                    <Input
                      id="stake-amount"
                      placeholder="0.0"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="quantum-input pr-16"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
                      onClick={() => setStakeAmount(balance || "0")}
                    >
                      MAX
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Available: {balance || "0"} ETH
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>Select Pool</Label>
                  <div className="space-y-2">
                    {stakingPools.map((pool) => (
                      <div
                        key={pool.name}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedPool === pool.name.toLowerCase().replace(/[^a-z]/g, '-')
                            ? 'border-primary bg-primary/10'
                            : 'border-muted hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedPool(pool.name.toLowerCase().replace(/[^a-z]/g, '-'))}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{pool.name}</p>
                            <p className="text-xs text-muted-foreground">{pool.rewards}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-400">{pool.apy}</p>
                            <p className="text-xs text-muted-foreground">APY</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full quantum-button h-12" 
                  disabled={!isConnected || !stakeAmount}
                >
                  <PiggyBank className="mr-2 h-4 w-4" />
                  Stake Tokens
                </Button>
              </CardContent>
            </Card>

            {/* Staking Pools */}
            <Card className="quantum-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Available Pools
                </CardTitle>
                <CardDescription>Choose from our curated staking pools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {stakingPools.map((pool, index) => (
                  <div key={index} className="p-4 rounded-xl bg-gradient-to-r from-muted/20 to-muted/10 border border-primary/10">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{pool.name}</h4>
                        <p className="text-sm text-muted-foreground">{pool.rewards}</p>
                      </div>
                      <Badge variant={pool.risk === 'Low' ? 'default' : pool.risk === 'Very Low' ? 'secondary' : 'destructive'}>
                        {pool.risk} Risk
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">APY:</span>
                        <span className="font-bold text-green-400 ml-2">{pool.apy}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">TVL:</span>
                        <span className="font-bold ml-2">{pool.tvl}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="farming" className="mt-8">
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Yield Farming
              </CardTitle>
              <CardDescription>Provide liquidity and earn farming rewards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                {yieldFarms.map((farm, index) => (
                  <div key={index} className="p-6 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/20 rounded-xl">
                          <Coins className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{farm.pair}</h4>
                          <p className="text-sm text-muted-foreground">Liquidity Pool</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={farm.status === 'New' ? 'default' : 'secondary'}>
                            {farm.status}
                          </Badge>
                          <Badge variant="outline" className="text-yellow-400 border-yellow-400/50">
                            {farm.multiplier}
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold text-green-400">{farm.apy}</p>
                        <p className="text-sm text-muted-foreground">APY</p>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Button className="quantum-button flex-1">
                        <Wallet className="mr-2 h-4 w-4" />
                        Add Liquidity
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Start Farming
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="swap" className="mt-8">
          <Card className="quantum-card max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5 text-primary" />
                Token Swap
              </CardTitle>
              <CardDescription>Exchange tokens at the best rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-12">
                <ArrowUpDown className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                  Swap Feature Coming Soon
                </h3>
                <p className="text-muted-foreground">
                  Advanced token swapping with optimal routing will be available soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}