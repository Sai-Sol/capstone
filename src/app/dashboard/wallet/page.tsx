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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { 
  Wallet, 
  Send, 
  Download, 
  Upload, 
  Plus,
  TrendingUp,
  Activity,
  DollarSign,
  RefreshCw,
  Copy,
  ExternalLink,
  BarChart3,
  PieChart,
  ArrowUpDown,
  CheckCircle,
  Clock
} from "lucide-react";

interface WalletAccount {
  address: string;
  balance: number;
  label?: string;
  createdAt: number;
}

interface TransactionHistory {
  transaction: any;
  blockNumber: number;
  confirmations: number;
  status: 'pending' | 'confirmed' | 'failed';
}

interface WalletAnalytics {
  address: string;
  balance: number;
  totalTransactions: number;
  totalSent: number;
  totalReceived: number;
  totalFees: number;
  netFlow: number;
  averageTransactionValue: number;
}

export default function WalletPage() {
  const { isConnected, address } = useWallet();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [transactionHistory, setTransactionHistory] = useState<TransactionHistory[]>([]);
  const [analytics, setAnalytics] = useState<WalletAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Send transaction form
  const [sendTo, setSendTo] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [estimatedFee, setEstimatedFee] = useState<number | null>(null);

  const fetchWalletData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/wallet');
      const data = await response.json();
      
      if (data.accounts) {
        setAccounts(data.accounts);
        if (data.accounts.length > 0 && !selectedAccount) {
          setSelectedAccount(data.accounts[0].address);
        }
      }
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
      toast({
        variant: "destructive",
        title: "Data Fetch Failed",
        description: "Unable to load wallet information"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAccountDetails = async (accountAddress: string) => {
    if (!accountAddress) return;

    try {
      const [historyResponse, analyticsResponse] = await Promise.all([
        fetch(`/api/wallet?address=${accountAddress}&action=history`),
        fetch(`/api/wallet?address=${accountAddress}&action=analytics`)
      ]);

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setTransactionHistory(historyData.history || []);
      }

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch account details:', error);
    }
  };

  const estimateTransactionFee = async () => {
    if (!sendTo || !sendAmount) return;

    try {
      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'estimate_fee',
          toAddress: sendTo,
          txAmount: parseFloat(sendAmount)
        })
      });

      const data = await response.json();
      if (data.estimatedFee) {
        setEstimatedFee(data.estimatedFee);
      }
    } catch (error) {
      console.error('Fee estimation failed:', error);
    }
  };

  const sendTransaction = async () => {
    if (!selectedAccount || !sendTo || !sendAmount) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please fill in all required fields"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_transaction',
          from: selectedAccount,
          to: sendTo,
          amount: parseFloat(sendAmount)
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Transaction Sent! 🚀",
          description: `${sendAmount} ETH sent to ${sendTo.slice(0, 8)}...`
        });
        
        setSendTo("");
        setSendAmount("");
        setEstimatedFee(null);
        
        // Refresh data
        fetchAccountDetails(selectedAccount);
      } else {
        throw new Error(data.error);
      }
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

  const createNewAccount = async () => {
    const label = `Account ${accounts.length + 1}`;
    
    try {
      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_account',
          label
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Account Created! 🎉",
          description: `New account: ${data.account.address.slice(0, 8)}...`
        });
        
        fetchWalletData();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Account Creation Failed",
        description: error.message
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard"
    });
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      fetchAccountDetails(selectedAccount);
    }
  }, [selectedAccount]);

  useEffect(() => {
    estimateTransactionFee();
  }, [sendTo, sendAmount]);

  return (
    <div className="space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Wallet Management
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Manage your accounts, send transactions, and track your portfolio
        </p>
      </motion.div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/30">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="send">Send</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Account Selection */}
            <Card className="quantum-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    Your Accounts
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={createNewAccount}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Account
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {accounts.map((account) => (
                  <motion.div
                    key={account.address}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedAccount === account.address
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-primary/20 hover:border-primary/30'
                    }`}
                    onClick={() => setSelectedAccount(account.address)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{account.label || 'Unnamed Account'}</span>
                          {selectedAccount === account.address && (
                            <Badge variant="outline" className="text-primary border-primary/50">
                              Selected
                            </Badge>
                          )}
                        </div>
                        <code className="text-xs font-mono text-muted-foreground">
                          {account.address}
                        </code>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-400">{account.balance.toFixed(4)} ETH</p>
                        <p className="text-xs text-muted-foreground">
                          ${(account.balance * 3400).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Portfolio Overview */}
            {analytics && (
              <Card className="quantum-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-primary" />
                    Portfolio Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="text-sm text-green-200">Total Received</p>
                      <p className="text-xl font-bold text-green-100">{analytics.totalReceived.toFixed(4)} ETH</p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-sm text-red-200">Total Sent</p>
                      <p className="text-xl font-bold text-red-100">{analytics.totalSent.toFixed(4)} ETH</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <p className="text-sm text-blue-200">Net Flow</p>
                      <p className={`text-xl font-bold ${analytics.netFlow >= 0 ? 'text-green-100' : 'text-red-100'}`}>
                        {analytics.netFlow >= 0 ? '+' : ''}{analytics.netFlow.toFixed(4)} ETH
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <p className="text-sm text-purple-200">Total Fees</p>
                      <p className="text-xl font-bold text-purple-100">{analytics.totalFees.toFixed(6)} ETH</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="send" className="mt-6">
          <Card className="quantum-card max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Send Transaction
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
                    value={sendTo}
                    onChange={(e) => setSendTo(e.target.value)}
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

                {estimatedFee !== null && (
                  <Alert className="border-blue-500/20 bg-blue-500/5">
                    <DollarSign className="h-4 w-4" />
                    <AlertDescription>
                      Estimated transaction fee: {estimatedFee.toFixed(6)} ETH
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={sendTransaction}
                  disabled={isLoading || !sendTo || !sendAmount || !selectedAccount}
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
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Transaction History
              </CardTitle>
              <CardDescription>Your recent blockchain transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {transactionHistory.length > 0 ? (
                <div className="rounded-lg border border-primary/20 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead>Transaction</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactionHistory.map((item, index) => (
                        <TableRow key={index} className={index % 2 === 0 ? "bg-muted/10" : "bg-background"}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="text-xs font-mono">{item.transaction.id?.slice(0, 12)}...</code>
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(item.transaction.id)}>
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              item.transaction.from === selectedAccount
                                ? "text-red-400 border-red-400/50"
                                : "text-green-400 border-green-400/50"
                            }>
                              {item.transaction.from === selectedAccount ? 'Sent' : 'Received'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{item.transaction.amount} ETH</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              item.status === 'confirmed' 
                                ? "text-green-400 border-green-400/50"
                                : item.status === 'pending'
                                  ? "text-yellow-400 border-yellow-400/50"
                                  : "text-red-400 border-red-400/50"
                            }>
                              {item.status === 'confirmed' && <CheckCircle className="mr-1 h-3 w-3" />}
                              {item.status === 'pending' && <Clock className="mr-1 h-3 w-3" />}
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {new Date(item.transaction.timestamp).toLocaleString()}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                    No Transaction History
                  </h3>
                  <p className="text-muted-foreground">
                    Your transactions will appear here once you start using the wallet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          {analytics ? (
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="quantum-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Transaction Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Transactions</span>
                      <span className="font-medium">{analytics.totalTransactions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Average Transaction Value</span>
                      <span className="font-medium">{analytics.averageTransactionValue.toFixed(4)} ETH</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Fees Paid</span>
                      <span className="font-medium text-red-400">{analytics.totalFees.toFixed(6)} ETH</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Net Flow</span>
                      <span className={`font-medium ${analytics.netFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {analytics.netFlow >= 0 ? '+' : ''}{analytics.netFlow.toFixed(4)} ETH
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="quantum-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Account Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                    <h4 className="font-semibold text-primary mb-3">Current Balance</h4>
                    <div className="space-y-2">
                      <p className="text-3xl font-bold text-green-400">{analytics.balance.toFixed(4)} ETH</p>
                      <p className="text-sm text-muted-foreground">
                        ≈ ${(analytics.balance * 3400).toFixed(2)} USD
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="text-xs text-green-200">Received</p>
                      <p className="text-lg font-bold text-green-100">{analytics.totalReceived.toFixed(2)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-xs text-red-200">Sent</p>
                      <p className="text-lg font-bold text-red-100">{analytics.totalSent.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                No Analytics Data
              </h3>
              <p className="text-muted-foreground">
                Select an account to view detailed analytics
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}