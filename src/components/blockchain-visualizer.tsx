"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Blocks, 
  ArrowRight, 
  Hash, 
  Clock, 
  Activity,
  RefreshCw,
  Zap,
  Database,
  Link as LinkIcon
} from "lucide-react";

interface BlockVisualization {
  index: number;
  hash: string;
  previousHash: string;
  timestamp: number;
  transactions: number;
  miner: string;
  isLatest: boolean;
}

export default function BlockchainVisualizer() {
  const { toast } = useToast();
  const [blocks, setBlocks] = useState<BlockVisualization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [animatingBlock, setAnimatingBlock] = useState<number | null>(null);

  const fetchBlocks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/blockchain?action=chain&limit=5');
      const data = await response.json();
      
      if (data.blocks) {
        const visualBlocks: BlockVisualization[] = data.blocks.map((block: any, index: number) => ({
          index: block.index,
          hash: block.hash,
          previousHash: block.previousHash,
          timestamp: block.timestamp,
          transactions: block.transactions.length,
          miner: block.miner,
          isLatest: index === 0
        }));
        
        setBlocks(visualBlocks.reverse()); // Show oldest to newest
      }
    } catch (error) {
      console.error('Failed to fetch blocks:', error);
      toast({
        variant: "destructive",
        title: "Fetch Failed",
        description: "Unable to load blockchain data"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const simulateNewBlock = () => {
    const newBlock: BlockVisualization = {
      index: blocks.length > 0 ? Math.max(...blocks.map(b => b.index)) + 1 : 1,
      hash: `0x${Math.random().toString(16).substr(2, 8)}...`,
      previousHash: blocks.length > 0 ? blocks[blocks.length - 1].hash : '0x000...',
      timestamp: Date.now(),
      transactions: Math.floor(Math.random() * 10) + 1,
      miner: `0x${Math.random().toString(16).substr(2, 8)}...`,
      isLatest: true
    };

    // Mark previous latest as not latest
    const updatedBlocks = blocks.map(block => ({ ...block, isLatest: false }));
    
    setAnimatingBlock(newBlock.index);
    setBlocks([...updatedBlocks, newBlock]);
    
    setTimeout(() => setAnimatingBlock(null), 1000);
    
    toast({
      title: "New Block Mined! ⛏️",
      description: `Block #${newBlock.index} added to the chain`
    });
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  return (
    <Card className="quantum-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Blocks className="h-5 w-5 text-primary" />
              Blockchain Visualizer
            </CardTitle>
            <CardDescription>Real-time blockchain structure visualization</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={simulateNewBlock}>
              <Zap className="mr-2 h-4 w-4" />
              Simulate Block
            </Button>
            <Button variant="outline" size="sm" onClick={fetchBlocks} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Chain Visualization */}
        <div className="relative">
          <div className="flex items-center gap-4 overflow-x-auto pb-4">
            <AnimatePresence>
              {blocks.map((block, index) => (
                <motion.div
                  key={block.index}
                  initial={{ opacity: 0, scale: 0.8, x: 50 }}
                  animate={{ 
                    opacity: 1, 
                    scale: animatingBlock === block.index ? 1.1 : 1, 
                    x: 0 
                  }}
                  exit={{ opacity: 0, scale: 0.8, x: -50 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center gap-4 shrink-0"
                >
                  {/* Block */}
                  <div className={`relative p-4 rounded-xl border-2 min-w-[200px] ${
                    block.isLatest 
                      ? 'border-green-500/50 bg-gradient-to-br from-green-500/10 to-green-600/5' 
                      : 'border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10'
                  }`}>
                    {block.isLatest && (
                      <div className="absolute -top-2 -right-2">
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                          Latest
                        </Badge>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-primary">Block #{block.index}</h4>
                        <div className="flex items-center gap-1">
                          <Database className="h-4 w-4 text-blue-400" />
                          <span className="text-sm text-blue-400">{block.transactions}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <Hash className="h-3 w-3 text-muted-foreground" />
                          <code className="font-mono text-primary">{block.hash.slice(0, 12)}...</code>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {new Date(block.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity className="h-3 w-3 text-muted-foreground" />
                          <code className="font-mono text-muted-foreground">
                            {block.miner.slice(0, 8)}...
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Arrow connector */}
                  {index < blocks.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (index + 1) * 0.1 }}
                      className="flex items-center"
                    >
                      <ArrowRight className="h-6 w-6 text-primary quantum-pulse" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Chain Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <LinkIcon className="h-5 w-5 text-blue-400" />
              <span className="font-medium text-blue-200">Chain Length</span>
            </div>
            <p className="text-2xl font-bold text-blue-100">{blocks.length} blocks</p>
          </div>
          
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-green-400" />
              <span className="font-medium text-green-200">Total Transactions</span>
            </div>
            <p className="text-2xl font-bold text-green-100">
              {blocks.reduce((sum, block) => sum + block.transactions, 0)}
            </p>
          </div>
          
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-purple-400" />
              <span className="font-medium text-purple-200">Avg Block Time</span>
            </div>
            <p className="text-2xl font-bold text-purple-100">
              {blocks.length > 1 
                ? Math.round((blocks[blocks.length - 1].timestamp - blocks[0].timestamp) / (blocks.length - 1) / 1000)
                : 0}s
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="p-4 rounded-xl bg-muted/20 border border-primary/10">
          <h4 className="font-semibold text-primary mb-3">Visualization Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span>Latest Block</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full" />
              <span>Confirmed Block</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span>Block Connection</span>
            </div>
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span>Block Hash</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}