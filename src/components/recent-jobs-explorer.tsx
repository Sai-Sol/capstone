"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Copy, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Job {
  txHash: string;
  blockNumber: number;
  timestamp: number;
  status: "success" | "pending" | "failed";
  jobType: string;
  algorithm: string;
  user: string;
}

interface RecentJobsExplorerProps {
  address?: string;
  limit?: number;
}

export function RecentJobsExplorer({ address, limit = 10 }: RecentJobsExplorerProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecentJobs();
  }, [address]);

  const fetchRecentJobs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/blockchain/blockscout?address=${address || "0xd1471126F18d76be253625CcA75e16a0F1C5B3e2"}&limit=${limit}`);

      if (!response.ok) throw new Error('Failed to fetch jobs');

      const data = await response.json();

      const formattedJobs: Job[] = (data.transactions || []).map((tx: any) => ({
        txHash: tx.hash,
        blockNumber: tx.blockNumber,
        timestamp: tx.timeUnix * 1000,
        status: tx.status?.toLowerCase() === 'ok' ? 'success' : tx.status?.toLowerCase() === 'error' ? 'failed' : 'pending',
        jobType: tx.method?.includes('log') ? 'Quantum Job' : tx.type,
        algorithm: tx.method || 'Unknown',
        user: tx.from,
      }));

      setJobs(formattedJobs);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Transaction hash copied to clipboard",
    });
  };

  const formatAddress = (addr: string) => {
    if (!addr) return 'N/A';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-400 border-green-400/50 bg-green-500/10';
      case 'failed':
        return 'text-red-400 border-red-400/50 bg-red-500/10';
      case 'pending':
        return 'text-yellow-400 border-yellow-400/50 bg-yellow-500/10';
      default:
        return 'text-blue-400 border-blue-400/50 bg-blue-500/10';
    }
  };

  return (
    <Card className="quantum-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span>Recent Quantum Jobs</span>
              <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                {jobs.length} Jobs
              </Badge>
            </CardTitle>
            <CardDescription>
              View recent quantum job submissions and their blockchain transactions
            </CardDescription>
          </div>
          <Button
            onClick={fetchRecentJobs}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Refreshing...
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {isLoading ? "Loading jobs..." : "No jobs found"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job, index) => (
              <motion.div
                key={job.txHash}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-lg bg-muted/30 border border-primary/10 hover:border-primary/30 hover:bg-muted/50 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  {/* Left side - Job info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`${getStatusBadgeColor(job.status)}`}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </Badge>
                      <Badge variant="outline" className="text-purple-400 border-purple-400/50">
                        {job.jobType}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Block #{job.blockNumber.toLocaleString()}
                      </span>
                    </div>

                    {/* Transaction hash */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Tx:</span>
                      <code className="text-sm font-mono text-primary bg-muted/50 px-2 py-1 rounded truncate">
                        {job.txHash}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(job.txHash)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatDate(job.timestamp)}</span>
                      <span>•</span>
                      <span>User: {formatAddress(job.user)}</span>
                    </div>
                  </div>

                  {/* Right side - Links */}
                  <div className="flex gap-2 items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="text-xs"
                    >
                      <a
                        href={`https://megaeth-testnet-v2.blockscout.com/tx/${job.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        BlockScout
                      </a>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
