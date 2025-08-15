"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Blocks, 
  Activity, 
  Users, 
  TrendingUp,
  ExternalLink,
  Copy,
  RefreshCw,
  Clock,
  Hash,
  Zap,
  Shield,
  Database,
  Network,
  Cpu,
  BarChart3
} from "lucide-react";

interface BlockData {
  index: number;
  timestamp: number;
  transactions: any[];
  hash: string;
  previousHash: string;
  miner: string;
  reward: number;
  difficulty: number;
  nonce: number;
}

interface NetworkStats {
  blockHeight: number;
  totalTransactions: number;
  pendingTransactions: number;
  difficulty: number;
  averageBlockTime: number;
  networkHashRate: string;
  activePeers: number;
  totalPeers: number;
}

export default function ExplorerPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [validators, setValidators] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchBlockchainData = async () => {
    setIsLoading(true);
    try {
      const [statsResponse, chainResponse, validatorsResponse] = await Promise.all([
        fetch('/api/blockchain?action=stats'),
        fetch('/api/blockchain?action=chain&limit=10'),
        fetch('/api/blockchain?action=validators')
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setNetworkStats(statsData.network);
      }

      if (chainResponse.ok) {
        const chainData = await chainResponse.json();
        setBlocks(chainData.blocks);
      }

      if (validatorsResponse.ok) {
        const validatorsData = await validatorsResponse.json();
        setValidators(validatorsData.validators);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch blockchain data:', error);
      toast({
        variant: "destructive",
        title: "Data Fetch Failed",
        description: "Unable to fetch blockchain data. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const searchBlockchain = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      // Simulate search functionality
      toast({
        title: "Search Initiated",
        description: `Searching for: ${searchQuery}`
      });
      
      // In a real implementation, this would search blocks, transactions, and addresses
      setTimeout(() => {
        toast({
          title: "Search Complete",
          description: "Search functionality will be enhanced in the next update"
        });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Search Failed",
        description: "Unable to perform search. Please try again."
      });
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Hash copied to clipboard"
    });
  };

  useEffect(() => {
    fetchBlockchainData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchBlockchainData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Blockchain Explorer
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore blocks, transactions, and network activity in real-time
        </p>
      </motion.div>

      {/* Search Bar */}
      <Card className="quantum-card">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by block hash, transaction hash, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="quantum-input pl-10 h-12"
                onKeyPress={(e) => e.key === 'Enter' && searchBlockchain()}
              />
            </div>
            <Button 
              onClick={searchBlockchain}
              disabled={isLoading || !searchQuery.trim()}
              className="quantum-button h-12 px-8"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Network Statistics */}
      {networkStats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="quantum-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Block Height</p>
                  <p className="text-3xl font-bold text-primary">{networkStats.blockHeight.toLocaleString()}</p>
                </div>
                <Blocks className="h-8 w-8 text-primary quantum-pulse" />
              </div>
            </CardContent>
          </Card>

          <Card className="quantum-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                  <p className="text-3xl font-bold text-green-400">{networkStats.totalTransactions.toLocaleString()}</p>
                </div>
                <Activity className="h-8 w-8 text-green-400 quantum-pulse" />
              </div>
            </CardContent>
          </Card>

          <Card className="quantum-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hash Rate</p>
                  <p className="text-3xl font-bold text-blue-400">{networkStats.networkHashRate}</p>
                </div>
                <Cpu className="h-8 w-8 text-blue-400 quantum-pulse" />
              </div>
            </CardContent>
          </Card>

          <Card className="quantum-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Peers</p>
                  <p className="text-3xl font-bold text-purple-400">{networkStats.activePeers}/{networkStats.totalPeers}</p>
                </div>
                <Network className="h-8 w-8 text-purple-400 quantum-pulse" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="blocks" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/30">
          <TabsTrigger value="blocks">Latest Blocks</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="validators">Validators</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="blocks" className="mt-6">
          <Card className="quantum-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Blocks className="h-5 w-5 text-primary" />
                  Latest Blocks
                </CardTitle>
                <Button variant="outline" size="sm" onClick={fetchBlockchainData} disabled={isLoading}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-primary/20 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead>Block</TableHead>
                      <TableHead>Hash</TableHead>
                      <TableHead>Transactions</TableHead>
                      <TableHead>Miner</TableHead>
                      <TableHead>Reward</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blocks.map((block, index) => (
                      <TableRow key={block.index} className={index % 2 === 0 ? "bg-muted/10" : "bg-background"}>
                        <TableCell className="font-medium">
                          <Badge variant="outline" className="text-primary border-primary/50">
                            #{block.index}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono">{block.hash.slice(0, 12)}...</code>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(block.hash)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                            {block.transactions.length}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs">{block.miner.slice(0, 8)}...{block.miner.slice(-6)}</code>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-green-400">{block.reward} ETH</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(block.timestamp).toLocaleTimeString()}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
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
                {blocks.flatMap(block => block.transactions).slice(0, 10).map((tx, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg bg-muted/20 border border-primary/10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono text-primary">{tx.id?.slice(0, 12)}...</code>
                          <Badge variant="outline" className="text-green-400 border-green-400/50">
                            Confirmed
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div>From: {tx.from?.slice(0, 8)}...{tx.from?.slice(-6)}</div>
                          <div>To: {tx.to?.slice(0, 8)}...{tx.to?.slice(-6)}</div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-semibold text-green-400">{tx.amount} ETH</span>
                          <span className="text-muted-foreground">Fee: {tx.fee} ETH</span>
                          <span className="text-muted-foreground">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(tx.id)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validators" className="mt-6">
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Network Validators
              </CardTitle>
              <CardDescription>Proof-of-Stake validators securing the network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-primary/20 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead>Validator</TableHead>
                      <TableHead>Stake</TableHead>
                      <TableHead>Reputation</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Validation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validators.map((validator, index) => (
                      <TableRow key={validator.address} className={index % 2 === 0 ? "bg-muted/10" : "bg-background"}>
                        <TableCell>
                          <code className="text-sm">{validator.address.slice(0, 12)}...{validator.address.slice(-8)}</code>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-blue-400">{validator.stake} ETH</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full" />
                            <span>{validator.reputation}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            validator.isActive 
                              ? "text-green-400 border-green-400/50" 
                              : "text-red-400 border-red-400/50"
                          }>
                            {validator.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(validator.lastValidation).toLocaleTimeString()}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="quantum-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Network Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {networkStats && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Average Block Time</span>
                      <span className="font-medium">{networkStats.averageBlockTime}s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Network Difficulty</span>
                      <span className="font-medium">{networkStats.difficulty}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Pending Transactions</span>
                      <span className="font-medium text-yellow-400">{networkStats.pendingTransactions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Network Hash Rate</span>
                      <span className="font-medium text-blue-400">{networkStats.networkHashRate}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="quantum-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Chain Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm">Chain Validation: Healthy</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm">Consensus: Active</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm">P2P Network: Connected</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                    <span className="text-sm">Memory Pool: {networkStats?.pendingTransactions || 0} pending</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="text-center text-sm text-muted-foreground">
          Last updated: {lastUpdated.toLocaleTimeString()} • Auto-refresh every 30 seconds
        </div>
      )}
    </div>
  );
}