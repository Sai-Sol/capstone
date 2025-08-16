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
import { Contract, formatEther } from "ethers";
import { 
  Globe, 
  TrendingUp, 
  Activity,
  ExternalLink,
  Copy,
  RefreshCw,
  Zap,
  BarChart3,
  Shield,
  Code,
  Brain,
  CheckCircle,
  AlertTriangle,
  Network,
  Database
} from "lucide-react";
import { CONTRACT_ADDRESS, MEGAETH_TESTNET } from "@/lib/constants";
import { quantumJobLoggerABI } from "@/lib/contracts";

export default function BlockchainPage() {
  const { isConnected, address, balance, provider, error, clearError } = useWallet();
  const { toast } = useToast();
  const [gasPrice, setGasPrice] = useState<string>("0");
  const [networkStats, setNetworkStats] = useState({
    blockNumber: 0,
    gasPrice: "0",
    difficulty: "0",
    hashRate: "0"
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [contractJobs, setContractJobs] = useState<any[]>([]);

  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);

  useEffect(() => {
    if (provider && isConnected) {
      checkNetwork();
      fetchNetworkStats();
      fetchRecentTransactions();
      fetchContractJobs();
    }
  }, [provider, isConnected]);

  const checkNetwork = async () => {
    if (!provider) return;
    
    try {
      const network = await provider.getNetwork();
      const isCorrect = network.chainId === BigInt(9000);
      setIsCorrectNetwork(isCorrect);
    } catch (error) {
      console.error("Failed to check network:", error);
      setIsCorrectNetwork(true); // Continue with current network
    }
  };

  const switchToMegaETH = async () => {
    if (!window.ethereum) {
      toast({
        variant: "destructive",
        title: "MetaMask Required",
        description: "Please install MetaMask to switch networks"
      });
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x2328' }], // 9000 in hex
      });
      
      toast({
        title: "Network Switched! 🔄",
        description: "Successfully switched to MegaETH testnet"
      });
      
      setIsCorrectNetwork(true);
    } catch (error: any) {
      console.error("Failed to switch network:", error);
      toast({
        title: "Network Switch Info",
        description: "Continuing with current network. MegaETH testnet recommended for optimal experience."
      });
    }
  };

  const fetchNetworkStats = async () => {
    if (!provider) return;
    
    try {
      clearError();
      const blockNumber = await provider.getBlockNumber();
      const feeData = await provider.getFeeData();
      const block = await provider.getBlock(blockNumber);
      
      setNetworkStats({
        blockNumber,
        gasPrice: formatEther(feeData.gasPrice || 0n),
        difficulty: block?.difficulty?.toString() || "0",
        hashRate: "2.5 TH/s" // Mock data for MegaETH
      });
      
      setGasPrice(formatEther(feeData.gasPrice || 0n));
    } catch (error) {
      console.error("Failed to fetch network stats:", error);
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Failed to fetch network statistics. Please check your connection."
      });
    }
  };

  const fetchRecentTransactions = async () => {
    // Mock transaction data for demo
    const mockTxs = [
      {
        hash: "0x1234567890abcdef1234567890abcdef12345678",
        from: "0xabcdefghijklmnopqrstuvwxyz1234567890abcdef",
        to: "0x9876543210fedcba9876543210fedcba98765432",
        value: "0.5",
        gasUsed: "21000",
        timestamp: Date.now() - 300000,
        status: "success"
      },
      {
        hash: "0x2345678901bcdef12345678901bcdef123456789",
        from: "0xbcdefghijklmnopqrstuvwxyz1234567890bcdefg",
        to: "0x8765432109edcba98765432109edcba987654321",
        value: "1.2",
        gasUsed: "45000",
        timestamp: Date.now() - 600000,
        status: "success"
      },
      {
        hash: "0x3456789012cdef123456789012cdef1234567890",
        from: "0xcdefghijklmnopqrstuvwxyz1234567890cdefgh",
        to: "0x7654321098dcba87654321098dcba8765432109",
        value: "0.1",
        gasUsed: "65000",
        timestamp: Date.now() - 900000,
        status: "success"
      }
    ];
    setTransactions(mockTxs);
  };

  const fetchContractJobs = async () => {
    if (!provider) return;
    
    try {
      const contract = new Contract(CONTRACT_ADDRESS, quantumJobLoggerABI, provider);
      const filter = contract.filters.JobLogged();
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 1000);

      const logs = await contract.queryFilter(filter, fromBlock, 'latest');
      
      const jobs = logs.map((log: any) => ({
        user: log.args.user,
        jobType: log.args.jobType,
        ipfsHash: log.args.ipfsHash,
        timeSubmitted: new Date(Number(log.args.timeSubmitted) * 1000),
        txHash: log.transactionHash
      })).reverse().slice(0, 5);

      setContractJobs(jobs);
    } catch (error) {
      console.error("Failed to fetch contract jobs:", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied! 📋",
      description: "Address copied to clipboard"
    });
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="quantum-card max-w-md text-center">
            <CardHeader>
              <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl w-fit">
                <Globe className="h-16 w-16 text-primary" />
              </div>
              <CardTitle className="text-2xl font-headline">Connect Your Wallet</CardTitle>
              <CardDescription className="text-base">
                Connect your MetaMask wallet to access blockchain features and quantum job logging
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.reload()} className="quantum-button w-full">
                <Globe className="mr-2 h-4 w-4" />
                Refresh to Connect
              </Button>
            </CardContent>
          </Card>
        </motion.div>
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
          Monitor network activity, manage transactions, and interact with smart contracts on MegaETH
        </p>
      </motion.div>

      {/* Network Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="quantum-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Block Height</p>
                <p className="text-3xl font-bold text-primary">{networkStats.blockNumber.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-primary/20 rounded-xl">
                <Activity className="h-8 w-8 text-primary quantum-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="quantum-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gas Price</p>
                <p className="text-3xl font-bold text-green-400">{parseFloat(gasPrice).toFixed(6)} ETH</p>
              </div>
              <div className="p-2 bg-green-500/20 rounded-xl">
                <Zap className="h-8 w-8 text-green-400 quantum-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="quantum-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hash Rate</p>
                <p className="text-3xl font-bold text-blue-400">{networkStats.hashRate}</p>
              </div>
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <BarChart3 className="h-8 w-8 text-blue-400 quantum-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="quantum-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Network</p>
                <p className="text-3xl font-bold text-purple-400">MegaETH</p>
              </div>
              <div className="p-2 bg-purple-500/20 rounded-xl">
                <Network className="h-8 w-8 text-purple-400 quantum-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/30">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="contracts">Smart Contracts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6">
            {/* Network Overview */}
            <Card className="quantum-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-primary" />
                  Network Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-primary">Connected Account</h3>
                    <Button variant="outline" size="sm" onClick={fetchNetworkStats}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="font-mono text-sm bg-muted/50 px-2 py-1 rounded flex-1 truncate">{address}</code>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(address!)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Balance</p>
                      <p className="text-3xl font-bold text-green-400">{balance ? parseFloat(balance).toFixed(4) : '0.0000'} ETH</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Network</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                          <div className="w-2 h-2 rounded-full mr-1 bg-blue-400 animate-pulse" />
                          Connected
                        </Badge>
                      </div>
                    </div>
                  </div>
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
              <CardDescription>Latest transactions on MegaETH network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((tx, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg bg-muted/20 border border-primary/10 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono text-primary">{tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}</code>
                          <Badge variant="outline" className="text-green-400 border-green-400/50">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Success
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div>From: {tx.from.slice(0, 8)}...{tx.from.slice(-6)}</div>
                          <div>To: {tx.to.slice(0, 8)}...{tx.to.slice(-6)}</div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-semibold text-green-400">{tx.value} ETH</span>
                          <span className="text-muted-foreground">Gas: {tx.gasUsed}</span>
                          <span className="text-muted-foreground">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10 transition-colors">
                        <a href={`https://www.megaexplorer.xyz/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </motion.div>
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
                QuantumJobLogger Contract
              </CardTitle>
              <CardDescription>Interact with the quantum job logging smart contract</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contract Info */}
              <div className="p-6 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                <h4 className="font-semibold text-primary mb-4">Contract Details</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address:</span>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-primary">{CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_ADDRESS.slice(-8)}</code>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(CONTRACT_ADDRESS)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Network:</span>
                    <span className="font-medium">MegaETH Testnet</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Jobs:</span>
                    <span className="font-medium text-green-400">{contractJobs.length}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="outline" asChild>
                    <a href={`https://www.megaexplorer.xyz/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View on Explorer
                    </a>
                  </Button>
                </div>
              </div>

              {/* Recent Contract Jobs */}
              <div>
                <h4 className="font-semibold text-primary mb-4">Recent Quantum Jobs</h4>
                <div className="space-y-3">
                  {contractJobs.length > 0 ? contractJobs.map((job, index) => (
                    <div key={index} className="p-4 rounded-lg bg-muted/20 border border-primary/10">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                              {job.jobType}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {job.timeSubmitted.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">User: </span>
                            <code className="font-mono text-primary">{job.user.slice(0, 8)}...{job.user.slice(-6)}</code>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={`https://www.megaexplorer.xyz/tx/${job.txHash}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <Code className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground">No quantum jobs found</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}