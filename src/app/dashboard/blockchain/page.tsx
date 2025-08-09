"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { Contract, parseEther, formatEther } from "ethers";
import { 
  Wallet, 
  Send, 
  ArrowUpDown, 
  TrendingUp, 
  Activity,
  ExternalLink,
  Copy,
  RefreshCw,
  Zap,
  DollarSign,
  BarChart3,
  Shield,
  Globe,
  Code,
  Settings,
  Brain
} from "lucide-react";

export default function BlockchainPage() {
  const { isConnected, address, balance, provider, signer } = useWallet();
  const { toast } = useToast();
  const [gasPrice, setGasPrice] = useState<string>("0");
  const [networkStats, setNetworkStats] = useState({
    blockNumber: 0,
    gasPrice: "0",
    difficulty: "0",
    hashRate: "0"
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [sendAmount, setSendAmount] = useState("");
  const [sendAddress, setSendAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (provider) {
      fetchNetworkStats();
      fetchRecentTransactions();
    }
  }, [provider]);

  const fetchNetworkStats = async () => {
    if (!provider) return;
    
    try {
      const blockNumber = await provider.getBlockNumber();
      const feeData = await provider.getFeeData();
      const block = await provider.getBlock(blockNumber);
      
      setNetworkStats({
        blockNumber,
        gasPrice: formatEther(feeData.gasPrice || 0n),
        difficulty: block?.difficulty?.toString() || "0",
        hashRate: "2.5 TH/s" // Mock data
      });
      
      setGasPrice(formatEther(feeData.gasPrice || 0n));
    } catch (error) {
      console.error("Failed to fetch network stats:", error);
    }
  };

  const fetchRecentTransactions = async () => {
    // Mock transaction data for demo
    const mockTxs = [
      {
        hash: "0x1234...5678",
        from: "0xabcd...efgh",
        to: "0x9876...5432",
        value: "0.5",
        gasUsed: "21000",
        timestamp: Date.now() - 300000,
        status: "success"
      },
      {
        hash: "0x2345...6789",
        from: "0xbcde...fghi",
        to: "0x8765...4321",
        value: "1.2",
        gasUsed: "45000",
        timestamp: Date.now() - 600000,
        status: "success"
      }
    ];
    setTransactions(mockTxs);
  };

  const sendTransaction = async () => {
    if (!signer || !sendAddress || !sendAmount) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please fill in all fields"
      });
      return;
    }

    setIsLoading(true);
    try {
      const tx = await signer.sendTransaction({
        to: sendAddress,
        value: parseEther(sendAmount)
      });

      toast({
        title: "Transaction Sent",
        description: `Transaction hash: ${tx.hash}`,
        action: (
          <Button variant="outline" size="sm" onClick={() => 
            window.open(`https://www.megaexplorer.xyz/tx/${tx.hash}`, '_blank')
          }>
            View
          </Button>
        )
      });

      setSendAmount("");
      setSendAddress("");
      await tx.wait();
      
      toast({
        title: "Transaction Confirmed",
        description: "Your transaction has been confirmed on the blockchain"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Address copied to clipboard"
    });
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="quantum-card max-w-md">
          <CardHeader className="text-center">
            <Wallet className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your MetaMask wallet to access blockchain features
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
        className="text-center"
      >
        <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Blockchain Hub
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Monitor network activity, manage transactions, and interact with smart contracts
        </p>
      </motion.div>

      {/* Network Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="quantum-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Block Height</p>
                <p className="text-2xl font-bold text-primary">{networkStats.blockNumber.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-primary floating-particle" />
            </div>
          </CardContent>
        </Card>

        <Card className="quantum-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gas Price</p>
                <p className="text-2xl font-bold text-green-400">{parseFloat(gasPrice).toFixed(6)} ETH</p>
              </div>
              <Zap className="h-8 w-8 text-green-400 floating-particle" />
            </div>
          </CardContent>
        </Card>

        <Card className="quantum-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hash Rate</p>
                <p className="text-2xl font-bold text-blue-400">{networkStats.hashRate}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-400 floating-particle" />
            </div>
          </CardContent>
        </Card>

        <Card className="quantum-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Network</p>
                <p className="text-2xl font-bold text-purple-400">MegaETH</p>
              </div>
              <Globe className="h-8 w-8 text-purple-400 floating-particle" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/30">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="contracts">Smart Contracts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Wallet Overview */}
            <Card className="quantum-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  Wallet Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-primary">Account Balance</h3>
                    <Button variant="outline" size="sm" onClick={fetchNetworkStats}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="font-mono text-sm bg-muted/50 px-2 py-1 rounded">{address}</code>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(address!)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Balance</p>
                      <p className="text-3xl font-bold text-green-400">{balance ? parseFloat(balance).toFixed(4) : '0.0000'} ETH</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Send */}
            <Card className="quantum-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  Quick Send
                </CardTitle>
                <CardDescription>Send ETH to another address</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="recipient">Recipient Address</Label>
                    <Input
                      id="recipient"
                      placeholder="0x..."
                      value={sendAddress}
                      onChange={(e) => setSendAddress(e.target.value)}
                      className="quantum-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount (ETH)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.0001"
                      placeholder="0.0"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      className="quantum-input"
                    />
                  </div>
                  <Alert className="border-yellow-500/20 bg-yellow-500/5">
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Estimated gas fee: ~{(parseFloat(gasPrice) * 21000).toFixed(6)} ETH
                    </AlertDescription>
                  </Alert>
                  <Button 
                    onClick={sendTransaction} 
                    disabled={isLoading || !sendAddress || !sendAmount}
                    className="w-full quantum-button h-12"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Transaction
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((tx, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted/20 border border-primary/10">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono">{tx.hash}</code>
                          <Badge variant="outline" className="text-green-400 border-green-400/50">
                            {tx.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          From {tx.from} to {tx.to}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold">{tx.value} ETH</span> • Gas: {tx.gasUsed}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="mt-6">
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-primary" />
                Smart Contract Interactions
              </CardTitle>
              <CardDescription>Interact with deployed smart contracts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                  Smart Contract Tools
                </h3>
                <p className="text-muted-foreground">
                  Advanced contract interaction tools coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Blockchain Analytics
              </CardTitle>
              <CardDescription>Network performance and transaction analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                  Advanced Analytics
                </h3>
                <p className="text-muted-foreground">
                  Detailed blockchain analytics and insights coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}