"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { 
  Zap, 
  TrendingUp, 
  Calculator, 
  Bell, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Activity
} from "lucide-react";

interface GasPriceData {
  slow: { price: number; time: string };
  standard: { price: number; time: string };
  fast: { price: number; time: string };
  instant: { price: number; time: string };
}

interface HistoricalData {
  timestamp: number;
  price: number;
}

export default function GasTools() {
  const { isConnected } = useWallet();
  const { toast } = useToast();
  const [gasPrices, setGasPrices] = useState<GasPriceData>({
    slow: { price: 8.2, time: "~5 min" },
    standard: { price: 12.5, time: "~2 min" },
    fast: { price: 18.7, time: "~30 sec" },
    instant: { price: 25.3, time: "~15 sec" }
  });
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [calculatorValues, setCalculatorValues] = useState({
    gasLimit: "21000",
    gasPrice: "12.5",
    transactionType: "transfer"
  });
  const [alerts, setAlerts] = useState({
    enabled: false,
    threshold: 15,
    type: "below" as "above" | "below"
  });
  const [isLoading, setIsLoading] = useState(false);

  // Simulate real-time gas price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setGasPrices(prev => ({
        slow: { ...prev.slow, price: prev.slow.price + (Math.random() - 0.5) * 2 },
        standard: { ...prev.standard, price: prev.standard.price + (Math.random() - 0.5) * 3 },
        fast: { ...prev.fast, price: prev.fast.price + (Math.random() - 0.5) * 4 },
        instant: { ...prev.instant, price: prev.instant.price + (Math.random() - 0.5) * 5 }
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Generate historical data
  useEffect(() => {
    const generateHistoricalData = () => {
      const data: HistoricalData[] = [];
      const now = Date.now();
      for (let i = 23; i >= 0; i--) {
        data.push({
          timestamp: now - (i * 60 * 60 * 1000),
          price: 10 + Math.random() * 20
        });
      }
      setHistoricalData(data);
    };
    generateHistoricalData();
  }, []);

  const refreshGasPrices = async () => {
    setIsLoading(true);
    
    try {
      // Simulate realistic gas price fluctuations
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const baseGas = 10 + Math.random() * 15; // Base gas between 10-25 Gwei
      const networkCongestion = Math.random(); // 0-1 congestion factor
      
      setGasPrices({
        slow: { 
          price: baseGas * (0.7 + networkCongestion * 0.2), 
          time: networkCongestion > 0.7 ? "~8 min" : "~5 min" 
        },
        standard: { 
          price: baseGas * (1 + networkCongestion * 0.3), 
          time: networkCongestion > 0.7 ? "~4 min" : "~2 min" 
        },
        fast: { 
          price: baseGas * (1.4 + networkCongestion * 0.4), 
          time: networkCongestion > 0.7 ? "~1 min" : "~30 sec" 
        },
        instant: { 
          price: baseGas * (2 + networkCongestion * 0.5), 
          time: "~15 sec" 
        }
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to fetch latest gas prices."
      });
    }
    setIsLoading(false);
    toast({
      title: "Gas Prices Updated",
      description: "Latest network gas prices have been fetched."
    });
  };

  const calculateTransactionCost = () => {
    const gasLimit = parseInt(calculatorValues.gasLimit);
    const gasPrice = parseFloat(calculatorValues.gasPrice);
    const costInGwei = gasLimit * gasPrice;
    const costInEth = costInGwei / 1e9;
    return { costInGwei, costInEth };
  };

  const getOptimizationSuggestions = () => {
    const { standard, slow } = gasPrices;
    const suggestions = [];

    if (standard.price > 20) {
      suggestions.push({
        type: "warning",
        message: "Network congestion is high. Consider waiting or using a lower gas price.",
        icon: AlertTriangle
      });
    }

    if (calculatorValues.transactionType === "contract") {
      suggestions.push({
        type: "info",
        message: "Contract interactions may require higher gas limits. Consider 150,000-300,000 gas.",
        icon: CheckCircle
      });
    }

    if (slow.price < 10) {
      suggestions.push({
        type: "success",
        message: "Network is quiet! Great time for non-urgent transactions.",
        icon: CheckCircle
      });
    }

    return suggestions;
  };

  const transactionTypes = [
    { value: "transfer", label: "ETH Transfer", gasLimit: "21000" },
    { value: "erc20", label: "ERC-20 Transfer", gasLimit: "65000" },
    { value: "contract", label: "Contract Interaction", gasLimit: "200000" },
    { value: "swap", label: "DEX Swap", gasLimit: "150000" },
    { value: "nft", label: "NFT Transfer", gasLimit: "85000" }
  ];

  return (
    <div className="space-y-8">
      {/* Real-time Gas Prices */}
      <Card className="quantum-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Real-time Gas Prices
              </CardTitle>
              <CardDescription>Live network gas price tracking</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshGasPrices}
              disabled={isLoading}
              className="quantum-button"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(gasPrices).map(([key, data], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border ${
                  key === 'slow' ? 'bg-green-500/10 border-green-500/20' :
                  key === 'standard' ? 'bg-yellow-500/10 border-yellow-500/20' :
                  key === 'fast' ? 'bg-orange-500/10 border-orange-500/20' :
                  'bg-red-500/10 border-red-500/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${
                    key === 'slow' ? 'bg-green-400' :
                    key === 'standard' ? 'bg-yellow-400' :
                    key === 'fast' ? 'bg-orange-400' :
                    'bg-red-400'
                  } quantum-pulse`} />
                  <span className="font-medium capitalize">{key}</span>
                </div>
                <p className="text-2xl font-bold">{data.price.toFixed(1)} Gwei</p>
                <p className="text-sm text-muted-foreground">{data.time}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gas Calculator */}
      <Card className="quantum-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Gas Calculator
          </CardTitle>
          <CardDescription>Calculate transaction costs for different operations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <Select
                value={calculatorValues.transactionType}
                onValueChange={(value) => {
                  const type = transactionTypes.find(t => t.value === value);
                  setCalculatorValues(prev => ({
                    ...prev,
                    transactionType: value,
                    gasLimit: type?.gasLimit || prev.gasLimit
                  }));
                }}
              >
                <SelectTrigger className="quantum-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {transactionTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Gas Limit</Label>
              <Input
                value={calculatorValues.gasLimit}
                onChange={(e) => setCalculatorValues(prev => ({ ...prev, gasLimit: e.target.value }))}
                className="quantum-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Gas Price (Gwei)</Label>
              <Input
                value={calculatorValues.gasPrice}
                onChange={(e) => setCalculatorValues(prev => ({ ...prev, gasPrice: e.target.value }))}
                className="quantum-input"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
            <h4 className="font-semibold text-primary mb-3">Transaction Cost</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Gas Cost</p>
                <p className="text-xl font-bold">{calculateTransactionCost().costInGwei.toLocaleString()} Gwei</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cost in ETH</p>
                <p className="text-xl font-bold">{calculateTransactionCost().costInEth.toFixed(6)} ETH</p>
              </div>
            </div>
          </div>

          {/* Optimization Suggestions */}
          <div className="space-y-3">
            <h4 className="font-semibold text-primary">Optimization Suggestions</h4>
            {getOptimizationSuggestions().map((suggestion, index) => (
              <Alert key={index} className={`border-${suggestion.type === 'warning' ? 'yellow' : suggestion.type === 'success' ? 'green' : 'blue'}-500/20`}>
                <suggestion.icon className="h-4 w-4" />
                <AlertDescription>{suggestion.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Historical Chart */}
      <Card className="quantum-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Gas Price Trends (24h)
          </CardTitle>
          <CardDescription>Historical gas price data and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-1">
            {historicalData.map((data, index) => (
              <div
                key={index}
                className="bg-primary/20 hover:bg-primary/40 transition-colors rounded-t"
                style={{
                  height: `${(data.price / 30) * 100}%`,
                  width: `${100 / historicalData.length}%`
                }}
                title={`${new Date(data.timestamp).toLocaleTimeString()}: ${data.price.toFixed(1)} Gwei`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>24h ago</span>
            <span>Now</span>
          </div>
        </CardContent>
      </Card>

      {/* Gas Alerts */}
      <Card className="quantum-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Gas Price Alerts
          </CardTitle>
          <CardDescription>Get notified when gas prices reach your target</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="alerts-enabled"
                checked={alerts.enabled}
                onChange={(e) => setAlerts(prev => ({ ...prev, enabled: e.target.checked }))}
                className="rounded border-primary/20"
              />
              <Label htmlFor="alerts-enabled">Enable gas price alerts</Label>
            </div>
          </div>

          {alerts.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Alert Type</Label>
                <Select
                  value={alerts.type}
                  onValueChange={(value: "above" | "below") => setAlerts(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="quantum-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="below">Below threshold</SelectItem>
                    <SelectItem value="above">Above threshold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Threshold (Gwei)</Label>
                <Input
                  type="number"
                  value={alerts.threshold}
                  onChange={(e) => setAlerts(prev => ({ ...prev, threshold: parseFloat(e.target.value) }))}
                  className="quantum-input"
                />
              </div>
            </div>
          )}

          {alerts.enabled && (
            <Alert className="border-blue-500/20 bg-blue-500/5">
              <Bell className="h-4 w-4" />
              <AlertDescription>
                You'll be notified when gas prices go {alerts.type} {alerts.threshold} Gwei
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}