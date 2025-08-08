"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  DollarSign, 
  Coins, 
  PieChart,
  ArrowUpDown,
  Target,
  Zap,
  RefreshCw
} from "lucide-react";

function getStatusColor(status: string) {
  switch (status) {
    case "active": return "text-green-400 border-green-400/50";
    case "pending": return "text-yellow-400 border-yellow-400/50";
    case "completed": return "text-blue-400 border-blue-400/50";
    default: return "text-gray-400 border-gray-400/50";
  }
}

interface DeFiPosition {
  protocol: string;
  type: "staking" | "lending" | "farming";
  amount: string;
  value: string;
  apy: string;
  rewards: string;
  status: "active" | "pending" | "completed";
}

interface DeFiOpportunity {
  protocol: string;
  type: string;
  apy: string;
  tvl: string;
  risk: "low" | "medium" | "high";
}

export default function DeFiDashboard() {
  const { isConnected } = useWallet();
  const { toast } = useToast();
  const [positions, setPositions] = useState<DeFiPosition[]>([]);
  const [opportunities, setOpportunities] = useState<DeFiOpportunity[]>([]);
  const [totalValue, setTotalValue] = useState("0");
  const [totalRewards, setTotalRewards] = useState("0");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isConnected) {
      loadDeFiData();
    }
  }, [isConnected]);

  const loadDeFiData = async () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const mockPositions: DeFiPosition[] = [
        {
          protocol: "Aave",
          type: "lending",
          amount: "1.5",
          value: "4,920.00",
          apy: "3.2%",
          rewards: "12.45",
          status: "active"
        },
        {
          protocol: "Uniswap V3",
          type: "farming",
          amount: "0.8",
          value: "2,624.00",
          apy: "24.5%",
          rewards: "45.67",
          status: "active"
        },
        {
          protocol: "Compound",
          type: "staking",
          amount: "5,000",
          value: "5,000.00",
          apy: "5.8%",
          rewards: "87.23",
          status: "active"
        }
      ];

      const mockOpportunities: DeFiOpportunity[] = [
        { protocol: "Curve", type: "3Pool LP", apy: "8.4%", tvl: "$2.1B", risk: "low" },
        { protocol: "Yearn", type: "ETH Vault", apy: "12.7%", tvl: "$450M", risk: "medium" },
        { protocol: "Balancer", type: "80/20 Pool", apy: "15.3%", tvl: "$120M", risk: "medium" }
      ];

      setPositions(mockPositions);
      setOpportunities(mockOpportunities);
      setTotalValue("12,544.00");
      setTotalRewards("145.35");
      setIsLoading(false);
    }, 1500);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "text-green-400 border-green-400/50";
      case "medium": return "text-yellow-400 border-yellow-400/50";
      case "high": return "text-red-400 border-red-400/50";
      default: return "text-gray-400 border-gray-400/50";
    }
  };

  const claimRewards = async (protocol: string) => {
    toast({
      title: "Claiming Rewards",
      description: `Claiming rewards from ${protocol}...`
    });

    setTimeout(() => {
      toast({
        title: "Rewards Claimed",
        description: `Successfully claimed rewards from ${protocol}`
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* DeFi Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="quantum-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value Locked</p>
                <p className="text-2xl font-bold text-primary">${totalValue}</p>
                <p className="text-xs text-green-400">+12.3% this month</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary floating-particle" />
            </div>
          </CardContent>
        </Card>

        <Card className="quantum-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Rewards</p>
                <p className="text-2xl font-bold text-green-400">${totalRewards}</p>
                <p className="text-xs text-green-400">+5.2% this week</p>
              </div>
              <Coins className="h-8 w-8 text-green-400 floating-particle" />
            </div>
          </CardContent>
        </Card>

        <Card className="quantum-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Positions</p>
                <p className="text-2xl font-bold text-blue-400">{positions.length}</p>
                <p className="text-xs text-blue-400">Across {new Set(positions.map(p => p.protocol)).size} protocols</p>
              </div>
              <Target className="h-8 w-8 text-blue-400 floating-particle" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Positions */}
      <Card className="quantum-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Active DeFi Positions
              </CardTitle>
              <CardDescription>Your current DeFi investments and yields</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadDeFiData}
              disabled={isLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {positions.map((position, index) => (
              <motion.div
                key={`${position.protocol}-${position.type}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-gradient-to-r from-muted/20 to-muted/10 border border-primary/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      {position.type === 'staking' && <Coins className="h-5 w-5 text-primary" />}
                      {position.type === 'lending' && <DollarSign className="h-5 w-5 text-primary" />}
                      {position.type === 'farming' && <TrendingUp className="h-5 w-5 text-primary" />}
                    </div>
                    <div>
                      <p className="font-semibold">{position.protocol}</p>
                      <p className="text-sm text-muted-foreground capitalize">{position.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={getStatusColor(position.status)}>
                      {position.status}
                    </Badge>
                    <p className="text-sm font-bold text-green-400 mt-1">{position.apy} APY</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <p className="font-mono">{position.amount} ETH</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Value:</span>
                    <p className="font-mono">${position.value}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Rewards:</span>
                    <p className="font-mono text-green-400">${position.rewards}</p>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => claimRewards(position.protocol)}
                    >
                      <Zap className="mr-1 h-3 w-3" />
                      Claim
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* DeFi Opportunities */}
      <Card className="quantum-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            DeFi Opportunities
          </CardTitle>
          <CardDescription>High-yield opportunities in the DeFi ecosystem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {opportunities.map((opportunity, index) => (
              <motion.div
                key={`${opportunity.protocol}-${opportunity.type}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{opportunity.protocol}</p>
                      <p className="text-sm text-muted-foreground">{opportunity.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-400">{opportunity.apy}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={getRiskColor(opportunity.risk)}>
                        {opportunity.risk} risk
                      </Badge>
                      <span className="text-xs text-muted-foreground">{opportunity.tvl} TVL</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button className="quantum-button flex-1">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    Enter Position
                  </Button>
                  <Button variant="outline">
                    <Target className="mr-2 h-4 w-4" />
                    Learn More
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}