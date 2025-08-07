"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  DollarSign,
  ArrowUpDown,
  Target,
  Zap,
  Clock,
  Activity,
  RefreshCw
} from "lucide-react";

interface TradingPair {
  symbol: string;
  price: string;
  change24h: string;
  volume: string;
  high24h: string;
  low24h: string;
}

interface Order {
  id: string;
  pair: string;
  type: "buy" | "sell";
  amount: string;
  price: string;
  status: "pending" | "filled" | "cancelled";
  timestamp: number;
}

export default function TradingPage() {
  const { isConnected } = useWallet();
  const { toast } = useToast();
  const [selectedPair, setSelectedPair] = useState("ETH/USDC");
  const [orderType, setOrderType] = useState("market");
  const [tradeType, setTradeType] = useState("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [pairs, setPairs] = useState<TradingPair[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTradingData();
    const interval = setInterval(loadTradingData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadTradingData = async () => {
    const mockPairs: TradingPair[] = [
      {
        symbol: "ETH/USDC",
        price: "3,280.45",
        change24h: "+5.67",
        volume: "1.2M",
        high24h: "3,295.80",
        low24h: "3,105.20"
      },
      {
        symbol: "MEGA/ETH",
        price: "0.0024",
        change24h: "+12.34",
        volume: "850K",
        high24h: "0.0026",
        low24h: "0.0021"
      },
      {
        symbol: "QTM/USDC",
        price: "0.89",
        change24h: "-2.45",
        volume: "420K",
        high24h: "0.92",
        low24h: "0.85"
      }
    ];

    const mockOrders: Order[] = [
      {
        id: "1",
        pair: "ETH/USDC",
        type: "buy",
        amount: "0.5",
        price: "3,250.00",
        status: "filled",
        timestamp: Date.now() - 3600000
      },
      {
        id: "2",
        pair: "MEGA/ETH",
        type: "sell",
        amount: "1000",
        price: "0.0025",
        status: "pending",
        timestamp: Date.now() - 1800000
      }
    ];

    setPairs(mockPairs);
    setOrders(mockOrders);
  };

  const placeOrder = async () => {
    if (!amount || (orderType === "limit" && !price)) {
      toast({
        variant: "destructive",
        title: "Invalid Order",
        description: "Please fill in all required fields."
      });
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      const newOrder: Order = {
        id: Date.now().toString(),
        pair: selectedPair,
        type: tradeType as "buy" | "sell",
        amount,
        price: orderType === "market" ? "Market" : price,
        status: "pending",
        timestamp: Date.now()
      };

      setOrders(prev => [newOrder, ...prev]);
      setAmount("");
      setPrice("");
      setIsLoading(false);

      toast({
        title: "Order Placed",
        description: `${tradeType.toUpperCase()} order for ${amount} ${selectedPair.split('/')[0]} placed successfully.`
      });
    }, 1500);
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
          Quantum Trading Terminal
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Advanced trading interface for quantum tokens and DeFi assets
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trading Interface */}
        <div className="lg:col-span-2">
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5 text-primary" />
                Trading Interface
              </CardTitle>
              <CardDescription>Place buy and sell orders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pair Selection */}
              <div className="space-y-2">
                <Label>Trading Pair</Label>
                <Select value={selectedPair} onValueChange={setSelectedPair}>
                  <SelectTrigger className="quantum-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pairs.map(pair => (
                      <SelectItem key={pair.symbol} value={pair.symbol}>
                        <div className="flex items-center justify-between w-full">
                          <span>{pair.symbol}</span>
                          <span className={`ml-4 ${parseFloat(pair.change24h) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {pair.change24h}%
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Order Type Tabs */}
              <Tabs value={tradeType} onValueChange={setTradeType}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="buy" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                    Buy
                  </TabsTrigger>
                  <TabsTrigger value="sell" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
                    Sell
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6 space-y-4">
                  {/* Order Type Selection */}
                  <div className="space-y-2">
                    <Label>Order Type</Label>
                    <Select value={orderType} onValueChange={setOrderType}>
                      <SelectTrigger className="quantum-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="market">Market Order</SelectItem>
                        <SelectItem value="limit">Limit Order</SelectItem>
                        <SelectItem value="stop">Stop Loss</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      placeholder="0.0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="quantum-input"
                    />
                  </div>

                  {/* Price Input (for limit orders) */}
                  {orderType === "limit" && (
                    <div className="space-y-2">
                      <Label>Price</Label>
                      <Input
                        placeholder="0.0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="quantum-input"
                      />
                    </div>
                  )}

                  {/* Place Order Button */}
                  <Button
                    onClick={placeOrder}
                    disabled={!isConnected || isLoading || !amount}
                    className={`w-full h-12 ${tradeType === 'buy' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <ArrowUpDown className="mr-2 h-4 w-4" />
                        {tradeType.toUpperCase()} {selectedPair.split('/')[0]}
                      </>
                    )}
                  </Button>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Market Data */}
        <div className="space-y-6">
          {/* Price Ticker */}
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Market Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pairs.map((pair, index) => (
                  <motion.div
                    key={pair.symbol}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedPair === pair.symbol
                        ? 'border-primary bg-primary/10'
                        : 'border-muted hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedPair(pair.symbol)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{pair.symbol}</span>
                      <div className="flex items-center gap-1">
                        {parseFloat(pair.change24h) >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-400" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-400" />
                        )}
                        <span className={`text-xs ${
                          parseFloat(pair.change24h) >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {pair.change24h}%
                        </span>
                      </div>
                    </div>
                    <p className="text-lg font-bold">${pair.price}</p>
                    <div className="text-xs text-muted-foreground mt-1">
                      Vol: {pair.volume} • H: ${pair.high24h} • L: ${pair.low24h}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Target className="mr-2 h-4 w-4" />
                  Set Price Alert
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Technical Analysis
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="mr-2 h-4 w-4" />
                  Order Book
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Order History */}
      <Card className="quantum-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Order History
          </CardTitle>
          <CardDescription>Your recent trading activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-gradient-to-r from-muted/20 to-muted/10 border border-primary/10"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      order.type === 'buy' ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {order.type === 'buy' ? (
                        <TrendingUp className="h-4 w-4 text-green-400" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{order.pair}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.type.toUpperCase()} • {order.amount} • ${order.price}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      order.status === 'filled' ? 'default' :
                      order.status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {order.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(order.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}