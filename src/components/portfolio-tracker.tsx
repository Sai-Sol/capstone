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
  BarChart3,
  RefreshCw,
  Eye,
  EyeOff
} from "lucide-react";

interface Asset {
  symbol: string;
  name: string;
  balance: string;
  value: string;
  change24h: string;
  allocation: number;
}

export default function PortfolioTracker() {
  const { isConnected, address } = useWallet();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [totalValue, setTotalValue] = useState("0");
  const [totalChange, setTotalChange] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [hideBalances, setHideBalances] = useState(false);

  useEffect(() => {
    if (isConnected) {
      loadPortfolioData();
    }
  }, [isConnected]);

  const loadPortfolioData = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockAssets: Asset[] = [
        {
          symbol: "ETH",
          name: "Ethereum",
          balance: "2.5847",
          value: "8,450.23",
          change24h: "+5.67",
          allocation: 45.2
        },
        {
          symbol: "MEGA",
          name: "MegaETH Token",
          balance: "15,420",
          value: "3,240.15",
          change24h: "+12.34",
          allocation: 17.3
        },
        {
          symbol: "QTM",
          name: "Quantum Token",
          balance: "8,750",
          value: "2,180.50",
          change24h: "-2.45",
          allocation: 11.7
        },
        {
          symbol: "USDC",
          name: "USD Coin",
          balance: "4,850.00",
          value: "4,850.00",
          change24h: "+0.01",
          allocation: 25.8
        }
      ];

      setAssets(mockAssets);
      setTotalValue("18,720.88");
      setTotalChange("+7.23");
      setIsLoading(false);
    }, 1500);
  };

  const formatValue = (value: string) => {
    return hideBalances ? "••••••" : value;
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <Card className="quantum-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Portfolio Overview
              </CardTitle>
              <CardDescription>Your complete asset portfolio</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setHideBalances(!hideBalances)}
              >
                {hideBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadPortfolioData}
                disabled={isLoading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Total Value */}
          <div className="text-center p-6 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
            <p className="text-sm text-muted-foreground mb-2">Total Portfolio Value</p>
            <p className="text-4xl font-bold text-primary">${formatValue(totalValue)}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              {parseFloat(totalChange) >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
              <span className={`text-sm font-medium ${
                parseFloat(totalChange) >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {totalChange}% (24h)
              </span>
            </div>
          </div>

          {/* Asset List */}
          <div className="space-y-4">
            {assets.map((asset, index) => (
              <motion.div
                key={asset.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-muted/20 border border-primary/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="font-bold text-primary">{asset.symbol[0]}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{asset.symbol}</p>
                      <p className="text-sm text-muted-foreground">{asset.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${formatValue(asset.value)}</p>
                    <div className="flex items-center gap-1">
                      {parseFloat(asset.change24h) >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-400" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-400" />
                      )}
                      <span className={`text-xs ${
                        parseFloat(asset.change24h) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {asset.change24h}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Balance:</span>
                    <span className="font-mono">{formatValue(asset.balance)} {asset.symbol}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Allocation:</span>
                    <span>{asset.allocation}%</span>
                  </div>
                  <Progress value={asset.allocation} className="h-2" />
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}