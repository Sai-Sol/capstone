"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useWallet } from "@/hooks/use-wallet";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Activity,
  Wallet,
  RefreshCw,
  Eye,
  EyeOff
} from "lucide-react";

interface Asset {
  symbol: string;
  name: string;
  balance: string;
  value: number;
  change24h: number;
  allocation: number;
}

export default function PortfolioPage() {
  const { isConnected, address, balance } = useWallet();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [totalChange, setTotalChange] = useState(0);
  const [hideBalances, setHideBalances] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isConnected) {
      loadPortfolioData();
    }
  }, [isConnected]);

  const loadPortfolioData = async () => {
    setIsLoading(true);
    
    // Mock portfolio data
    setTimeout(() => {
      const mockAssets: Asset[] = [
        {
          symbol: "ETH",
          name: "Ethereum",
          balance: balance || "0",
          value: parseFloat(balance || "0") * 2500,
          change24h: 5.2,
          allocation: 65
        },
        {
          symbol: "QTC",
          name: "QuantumChain Token",
          balance: "1250.00",
          value: 1250 * 0.85,
          change24h: 12.8,
          allocation: 25
        },
        {
          symbol: "USDC",
          name: "USD Coin",
          balance: "500.00",
          value: 500,
          change24h: 0.1,
          allocation: 10
        }
      ];

      const total = mockAssets.reduce((sum, asset) => sum + asset.value, 0);
      const weightedChange = mockAssets.reduce((sum, asset) => 
        sum + (asset.change24h * asset.value / total), 0
      );

      setAssets(mockAssets);
      setTotalValue(total);
      setTotalChange(weightedChange);
      setIsLoading(false);
    }, 1000);
  };

  const formatValue = (value: number) => {
    if (hideBalances) return "****";
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatBalance = (balance: string) => {
    if (hideBalances) return "****";
    return balance;
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="quantum-card max-w-md">
          <CardHeader className="text-center">
            <Wallet className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to view your portfolio
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

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
            Portfolio Overview
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your digital assets and portfolio performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setHideBalances(!hideBalances)}
            className="quantum-button"
          >
            {hideBalances ? <Eye className="mr-2 h-4 w-4" /> : <EyeOff className="mr-2 h-4 w-4" />}
            {hideBalances ? "Show" : "Hide"} Balances
          </Button>
          <Button variant="outline" onClick={loadPortfolioData} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Portfolio Summary */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="quantum-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-3xl font-bold text-primary">{formatValue(totalValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary floating-particle" />
            </div>
          </CardContent>
        </Card>

        <Card className="quantum-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">24h Change</p>
                <div className="flex items-center gap-2">
                  <p className={`text-3xl font-bold ${totalChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {hideBalances ? "****" : `${totalChange >= 0 ? '+' : ''}${totalChange.toFixed(2)}%`}
                  </p>
                  {totalChange >= 0 ? 
                    <TrendingUp className="h-6 w-6 text-green-400" /> : 
                    <TrendingDown className="h-6 w-6 text-red-400" />
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="quantum-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Assets</p>
                <p className="text-3xl font-bold text-purple-400">{assets.length}</p>
              </div>
              <PieChart className="h-8 w-8 text-purple-400 floating-particle" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asset List */}
      <Card className="quantum-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Your Assets
          </CardTitle>
          <CardDescription>Overview of your digital asset holdings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assets.map((asset, index) => (
              <motion.div
                key={asset.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-gradient-to-r from-muted/20 to-muted/10 border border-primary/10 hover:border-primary/20 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="font-bold text-primary">{asset.symbol.slice(0, 2)}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{asset.name}</h3>
                      <p className="text-sm text-muted-foreground">{asset.symbol}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold">{formatBalance(asset.balance)} {asset.symbol}</p>
                    <p className="text-sm text-muted-foreground">{formatValue(asset.value)}</p>
                  </div>
                  
                  <div className="text-right">
                    <Badge 
                      variant="outline" 
                      className={asset.change24h >= 0 ? 'text-green-400 border-green-400/50' : 'text-red-400 border-red-400/50'}
                    >
                      {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                    </Badge>
                    <div className="mt-2 w-24">
                      <Progress value={asset.allocation} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{asset.allocation}% allocation</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Allocation */}
      <Card className="quantum-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Asset Allocation
          </CardTitle>
          <CardDescription>Distribution of your portfolio by asset</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assets.map((asset, index) => (
              <div key={asset.symbol} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${
                    index === 0 ? 'from-primary to-primary/70' :
                    index === 1 ? 'from-purple-500 to-purple-400' :
                    'from-green-500 to-green-400'
                  }`} />
                  <span className="font-medium">{asset.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32">
                    <Progress value={asset.allocation} className="h-2" />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{asset.allocation}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}