"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ExternalLink,
  Copy,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeUnix: number;
  status: string;
  method: string;
  gasUsed: string;
  blockNumber: number;
  type: string;
}

interface BlockScoutTransactionsProps {
  address?: string;
}

export function BlockScoutTransactions({ address: initialAddress }: BlockScoutTransactionsProps) {
  const [address, setAddress] = useState(initialAddress || "0xd1471126F18d76be253625CcA75e16a0F1C5B3e2");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalTxns, setTotalTxns] = useState(0);
  const { toast } = useToast();

  const fetchTransactions = async (addr: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/blockchain/blockscout?address=${addr}&limit=20`);

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      setTransactions(data.transactions || []);
      setTotalTxns(data.totalTransactions || 0);

      toast({
        title: "Success",
        description: `Fetched ${data.transactions?.length || 0} transactions`,
      });
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to fetch transactions';
      setError(errorMsg);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchTransactions(address);
    }
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Hash copied to clipboard",
    });
  };

  const formatAddress = (addr: string) => {
    if (!addr) return 'N/A';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatDate = (unixTime: number) => {
    return new Date(unixTime * 1000).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'ok':
      case 'success':
        return 'text-green-400 border-green-400/50 bg-green-500/10';
      case 'error':
        return 'text-red-400 border-red-400/50 bg-red-500/10';
      case 'pending':
        return 'text-yellow-400 border-yellow-400/50 bg-yellow-500/10';
      default:
        return 'text-blue-400 border-blue-400/50 bg-blue-500/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card className="quantum-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-primary" />
            BlockScout Transaction Lookup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter Ethereum address (0x...)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={() => fetchTransactions(address)}
              disabled={isLoading || !address}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Fetch
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter any Ethereum address to view its transactions on MegaETH Testnet
          </p>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-500/50 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-400">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Section */}
      {transactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 md:grid-cols-3"
        >
          <Card className="quantum-card">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-3xl font-bold text-primary">{totalTxns}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="quantum-card">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Fetched Transactions</p>
                <p className="text-3xl font-bold text-green-400">{transactions.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="quantum-card">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-3xl font-bold text-blue-400">
                  {transactions.length > 0
                    ? Math.round((transactions.filter(t => t.status?.toLowerCase() === 'ok').length / transactions.length) * 100)
                    : 0}%
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Transactions List */}
      <Card className="quantum-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Recent Transactions ({transactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {isLoading ? "Fetching transactions..." : "No transactions found"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx, index) => (
                <motion.div
                  key={tx.hash}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg bg-muted/30 border border-primary/10 hover:border-primary/30 transition-all"
                >
                  <div className="space-y-3">
                    {/* Transaction Hash and Status */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-sm font-mono text-primary truncate">
                            {tx.hash}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(tx.hash)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={`${getStatusColor(tx.status)}`}>
                          {tx.status?.toUpperCase() || 'PENDING'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a
                            href={`https://megaeth-testnet-v2.blockscout.com/tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-8 w-8 p-0"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>

                    {/* Transaction Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">From:</span>
                        <div className="font-mono text-primary">{formatAddress(tx.from)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">To:</span>
                        <div className="font-mono text-primary">{formatAddress(tx.to)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Value:</span>
                        <div className="font-semibold text-green-400">{tx.value}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Gas Used:</span>
                        <div className="font-mono text-blue-400">{tx.gasUsed}</div>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-muted-foreground">Date:</span>
                        <div className="text-foreground">{formatDate(tx.timeUnix)}</div>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-muted-foreground">Block #{tx.blockNumber} • Method: {tx.method}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
