import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { 
  Wallet, 
  Send, 
  History, 
  RefreshCw, 
  ExternalLink,
  Copy,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Clock,
  TrendingUp
} from "lucide-react";

interface Transaction {
  hash: string;
  type: string;
  amount: string;
  status: "pending" | "confirmed" | "failed";
  timestamp: number;
  gasUsed?: string;
  gasPrice?: string;
}

export default function BlockchainOperations() {
  const { isConnected, address, balance, provider } = useWallet();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sendAmount, setSendAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [portfolioValue, setPortfolioValue] = useState("12,450.67");
  const [portfolioChange, setPortfolioChange] = useState("+5.23");

  // Simulate transaction history
  useEffect(() => {
    if (isConnected) {
      const mockTransactions: Transaction[] = [
        {
          hash: "0x1234567890abcdef1234567890abcdef12345678",
          type: "Send",
          amount: "0.5",
          status: "confirmed",
          timestamp: Date.now() - 3600000,
          gasUsed: "21000",
          gasPrice: "20"
        },
        {
          hash: "0xabcdef1234567890abcdef1234567890abcdef12",
          type: "Receive",
          amount: "1.2",
          status: "confirmed",
          timestamp: Date.now() - 7200000,
          gasUsed: "21000",
          gasPrice: "18"
        },
        {
          hash: "0x567890abcdef1234567890abcdef1234567890ab",
          type: "Contract",
          amount: "0.1",
          status: "pending",
          timestamp: Date.now() - 1800000,
          gasUsed: "45000",
          gasPrice: "25"
        }
      ];
      setTransactions(mockTransactions);
    }
  }, [isConnected]);

  const handleSendTransaction = async () => {
    if (!isConnected || !sendAmount || !recipientAddress) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please fill in all fields and connect your wallet."
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate transaction sending
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newTransaction: Transaction = {
        hash: `0x${Math.random().toString(16).substr(2, 40)}`,
        type: "Send",
        amount: sendAmount,
        status: "pending",
        timestamp: Date.now(),
        gasUsed: "21000",
        gasPrice: "22"
      };

      setTransactions(prev => [newTransaction, ...prev]);
      setSendAmount("");
      setRecipientAddress("");

      toast({
        title: "Transaction Sent",
        description: "Your transaction has been submitted to the network."
      });

      // Simulate confirmation after 5 seconds
      setTimeout(() => {
        setTransactions(prev => 
          prev.map(tx => 
            tx.hash === newTransaction.hash 
              ? { ...tx, status: "confirmed" as const }
              : tx
          )
        );
        toast({
          title: "Transaction Confirmed",
          description: "Your transaction has been confirmed on the blockchain."
        });
      }, 5000);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: "Failed to send transaction. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBalance = async () => {
    if (!isConnected || !provider) return;
    
    setIsLoading(true);
    try {
      // Get fresh balance from provider
      const freshBalance = await provider.getBalance(address!);
      const formattedBalance = (Number(freshBalance) / 1e18).toFixed(4);
      
      // Update portfolio value simulation
      const portfolioIncrease = (Math.random() * 2 - 1) * 100;
      setPortfolioValue(prev => {
        const currentValue = parseFloat(prev.replace(',', ''));
        const newValue = Math.max(0, currentValue + portfolioIncrease);
        return newValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      });
      
      setPortfolioChange(prev => {
        const change = (Math.random() * 10 - 5).toFixed(2);
        return `${parseFloat(change) >= 0 ? '+' : ''}${change}`;
      });
      
      toast({
        title: "Balance Updated",
        description: "Your wallet balance has been refreshed."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Refresh Failed",
        description: "Failed to refresh balance."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Address copied to clipboard."
    });
  };

  if (!isConnected) {
    return (
      <Alert className="border-yellow-500/20 bg-yellow-500/5">
        <Wallet className="h-4 w-4" />
        <AlertDescription>
          Please connect your wallet to access blockchain operations.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Overview */}
      <Card className="quantum-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Wallet Overview
          </CardTitle>
          <CardDescription>Your current wallet status and balance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Address</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(address || "")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <p className="font-mono text-sm break-all">{address}</p>
            </div>
            
            <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/5 to-green-600/10 border border-green-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Balance</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={refreshBalance}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <p className="text-2xl font-bold text-green-400">{balance || "0"} ETH</p>
            </div>
            
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/5 to-blue-600/10 border border-blue-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Portfolio Value</span>
                <TrendingUp className="h-4 w-4 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-blue-400">${portfolioValue}</p>
              <p className="text-sm text-green-400">{portfolioChange}% (24h)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Send Transaction */}
      <Card className="quantum-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Send Transaction
          </CardTitle>
          <CardDescription>Transfer ETH to another address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Recipient Address</Label>
            <Input
              placeholder="0x..."
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="quantum-input"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Amount (ETH)</Label>
            <Input
              type="number"
              placeholder="0.0"
              value={sendAmount}
              onChange={(e) => setSendAmount(e.target.value)}
              className="quantum-input"
            />
          </div>

          <Button
            onClick={handleSendTransaction}
            disabled={isLoading || !sendAmount || !recipientAddress}
            className="w-full quantum-button"
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
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="quantum-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Transaction History
          </CardTitle>
          <CardDescription>Your recent blockchain transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((tx, index) => (
              <motion.div
                key={tx.hash}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-gradient-to-r from-muted/20 to-muted/10 border border-primary/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      tx.type === 'Send' ? 'bg-red-500/20 text-red-400' :
                      tx.type === 'Receive' ? 'bg-green-500/20 text-green-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {tx.type === 'Send' ? <Send className="h-4 w-4" /> :
                       tx.type === 'Receive' ? <DollarSign className="h-4 w-4" /> :
                       <History className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-semibold">{tx.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {tx.amount} ETH
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge variant={
                      tx.status === 'confirmed' ? 'default' :
                      tx.status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {tx.status === 'confirmed' && <CheckCircle className="mr-1 h-3 w-3" />}
                      {tx.status === 'pending' && <Clock className="mr-1 h-3 w-3" />}
                      {tx.status === 'failed' && <AlertTriangle className="mr-1 h-3 w-3" />}
                      {tx.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(tx.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="font-mono text-xs">
                    {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`https://www.megaexplorer.xyz/tx/${tx.hash}`, '_blank')}
                  >
                    <ExternalLink className="mr-1 h-3 w-3" />
                    View
                  </Button>
                </div>
                
                {tx.gasUsed && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Gas: {tx.gasUsed} @ {tx.gasPrice} Gwei
                  </div>
                )}
              </motion.div>
            ))}
            
            {transactions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No transactions found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}