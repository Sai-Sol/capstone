"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { 
  Pickaxe, 
  Play, 
  Square, 
  TrendingUp, 
  Zap, 
  DollarSign,
  Activity,
  Clock,
  Cpu,
  BarChart3,
  RefreshCw,
  Award,
  Shield
} from "lucide-react";

interface MiningSession {
  id: string;
  minerAddress: string;
  startTime: number;
  isActive: boolean;
  blocksFound: number;
  hashRate: number;
  earnings: number;
}

interface MiningStats {
  activeSessions: MiningSession[];
  networkStats: any;
  totalMiners: number;
  totalHashRate: number;
}

export default function MiningPage() {
  const { isConnected, address } = useWallet();
  const { toast } = useToast();
  const [miningSession, setMiningSession] = useState<MiningSession | null>(null);
  const [miningStats, setMiningStats] = useState<MiningStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [estimatedEarnings, setEstimatedEarnings] = useState(0);

  const fetchMiningStats = async () => {
    try {
      const response = await fetch('/api/mining');
      if (response.ok) {
        const data = await response.json();
        setMiningStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch mining stats:', error);
    }
  };

  const startMining = async () => {
    if (!address) {
      toast({
        variant: "destructive",
        title: "Wallet Required",
        description: "Please connect your wallet to start mining"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/mining', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_mining',
          minerAddress: address
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Mining Started! ⛏️",
          description: "Your mining session has begun"
        });
        
        // Poll for session updates
        pollMiningSession(data.sessionId);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Mining Failed",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stopMining = async () => {
    if (!miningSession) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/mining', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'stop_mining',
          sessionId: miningSession.id
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMiningSession(null);
        toast({
          title: "Mining Stopped",
          description: `Session ended. Blocks found: ${data.session.blocksFound}`
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Stop Mining Failed",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pollMiningSession = (sessionId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/mining`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'get_session',
            sessionId
          })
        });

        const data = await response.json();
        
        if (data.session) {
          setMiningSession(data.session);
          
          if (!data.session.isActive) {
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error('Failed to poll mining session:', error);
        clearInterval(interval);
      }
    }, 2000);

    // Store interval for cleanup
    return interval;
  };

  useEffect(() => {
    fetchMiningStats();
    
    // Auto-refresh stats every 30 seconds
    const interval = setInterval(fetchMiningStats, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Calculate estimated earnings based on hash rate and network difficulty
    if (miningSession && miningStats) {
      const networkHashRate = parseFloat(miningStats.networkStats?.networkHashRate || '0');
      const myHashRate = miningSession.hashRate / 1000000; // Convert to MH/s
      const blockReward = 10; // ETH
      const blocksPerHour = 360; // Assuming 10-second blocks
      
      const myShare = networkHashRate > 0 ? myHashRate / networkHashRate : 0;
      const hourlyEarnings = myShare * blocksPerHour * blockReward;
      
      setEstimatedEarnings(hourlyEarnings);
    }
  }, [miningSession, miningStats]);

  return (
    <div className="space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Blockchain Mining
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Participate in network consensus and earn rewards through mining
        </p>
      </motion.div>

      {/* Mining Control Panel */}
      <Card className="quantum-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pickaxe className="h-5 w-5 text-primary" />
            Mining Control Panel
          </CardTitle>
          <CardDescription>Start or stop mining operations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isConnected ? (
            <Alert className="border-yellow-500/20 bg-yellow-500/5">
              <Zap className="h-4 w-4" />
              <AlertDescription>
                Connect your wallet to start mining and earn block rewards.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              {/* Mining Status */}
              <div className="p-6 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-primary">Mining Status</h3>
                  <Badge variant="outline" className={
                    miningSession?.isActive 
                      ? "text-green-400 border-green-400/50" 
                      : "text-gray-400 border-gray-400/50"
                  }>
                    {miningSession?.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                {miningSession ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Hash Rate</p>
                      <p className="text-xl font-bold text-blue-400">
                        {(miningSession.hashRate / 1000000).toFixed(2)} MH/s
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Blocks Found</p>
                      <p className="text-xl font-bold text-green-400">{miningSession.blocksFound}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Earnings</p>
                      <p className="text-xl font-bold text-yellow-400">{miningSession.earnings.toFixed(4)} ETH</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Runtime</p>
                      <p className="text-xl font-bold text-purple-400">
                        {Math.floor((Date.now() - miningSession.startTime) / 60000)}m
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Pickaxe className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">No active mining session</p>
                  </div>
                )}
              </div>

              {/* Mining Controls */}
              <div className="flex gap-4">
                {!miningSession?.isActive ? (
                  <Button
                    onClick={startMining}
                    disabled={isLoading}
                    className="flex-1 quantum-button h-12"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Start Mining
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={stopMining}
                    disabled={isLoading}
                    variant="destructive"
                    className="flex-1 h-12"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Stopping...
                      </>
                    ) : (
                      <>
                        <Square className="mr-2 h-4 w-4" />
                        Stop Mining
                      </>
                    )}
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={fetchMiningStats}
                  className="h-12"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {/* Earnings Estimation */}
              {miningSession?.isActive && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/5 to-green-600/10 border border-green-500/20">
                  <h4 className="font-semibold text-green-400 mb-2">Estimated Earnings</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-green-200">Hourly:</span>
                      <div className="font-bold text-green-100">{estimatedEarnings.toFixed(6)} ETH</div>
                    </div>
                    <div>
                      <span className="text-green-200">Daily:</span>
                      <div className="font-bold text-green-100">{(estimatedEarnings * 24).toFixed(4)} ETH</div>
                    </div>
                    <div>
                      <span className="text-green-200">Monthly:</span>
                      <div className="font-bold text-green-100">{(estimatedEarnings * 24 * 30).toFixed(2)} ETH</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Network Mining Statistics */}
      {miningStats && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Network Mining Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-sm text-blue-200">Active Miners</p>
                  <p className="text-2xl font-bold text-blue-100">{miningStats.totalMiners}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-sm text-green-200">Network Hash Rate</p>
                  <p className="text-2xl font-bold text-green-100">
                    {miningStats.networkStats?.networkHashRate || '0 H/s'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <p className="text-sm text-purple-200">Block Height</p>
                  <p className="text-2xl font-bold text-purple-100">
                    {miningStats.networkStats?.blockHeight || 0}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-sm text-yellow-200">Difficulty</p>
                  <p className="text-2xl font-bold text-yellow-100">
                    {miningStats.networkStats?.difficulty || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Mining Rewards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Block Reward</span>
                  <span className="font-medium text-green-400">10 ETH</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Average Block Time</span>
                  <span className="font-medium">
                    {miningStats.networkStats?.averageBlockTime || 10}s
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Your Share</span>
                  <span className="font-medium text-blue-400">
                    {miningSession ? ((miningSession.hashRate / (miningStats.totalHashRate || 1)) * 100).toFixed(2) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Est. Daily Earnings</span>
                  <span className="font-medium text-yellow-400">
                    {(estimatedEarnings * 24).toFixed(4)} ETH
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Miners */}
      {miningStats?.activeSessions && miningStats.activeSessions.length > 0 && (
        <Card className="quantum-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Active Miners
            </CardTitle>
            <CardDescription>Current mining participants on the network</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {miningStats.activeSessions.slice(0, 5).map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg bg-muted/20 border border-primary/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-primary">
                          {session.minerAddress.slice(0, 8)}...{session.minerAddress.slice(-6)}
                        </code>
                        {session.minerAddress === address && (
                          <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                            You
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Hash Rate: {(session.hashRate / 1000000).toFixed(2)} MH/s</span>
                        <span>Blocks: {session.blocksFound}</span>
                        <span>Earnings: {session.earnings.toFixed(4)} ETH</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mining Information */}
      <Card className="quantum-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Mining Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-primary">How Mining Works</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Miners compete to solve cryptographic puzzles</p>
                <p>• First to solve gets block reward + transaction fees</p>
                <p>• Difficulty adjusts to maintain 10-second block times</p>
                <p>• Higher hash rate = better chance of finding blocks</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-primary">Reward Structure</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Block Reward: 10 ETH per block</p>
                <p>• Transaction Fees: Variable based on network usage</p>
                <p>• Validator Rewards: Additional staking rewards</p>
                <p>• Network Share: Proportional to your hash rate</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}