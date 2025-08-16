"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle, 
  Loader2,
  RefreshCw,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function WalletConnectButton() {
  const { 
    isConnected, 
    address, 
    balance, 
    isConnecting,
    error,
    connectWallet, 
    disconnectWallet,
    refreshBalance,
    clearError
  } = useWallet();
  const { toast } = useToast();
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
      // Show error toast for user feedback
      toast({
        variant: "destructive",
        title: "Wallet Error",
        description: error,
      });
    }
  }, [error, toast]);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address Copied! 📋",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const handleConnect = async () => {
    try {
      clearError();
      await connectWallet();
      toast({
        title: "Wallet Connected! 🎉",
        description: "Successfully connected to blockchain network",
      });
    } catch (error: any) {
      // Error is already handled in the context
      console.error("Connection failed:", error);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  const handleRefreshBalance = async () => {
    try {
      await refreshBalance();
      toast({
        title: "Balance Updated",
        description: "Wallet balance has been refreshed",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Refresh Failed",
        description: "Failed to refresh wallet balance",
      });
    }
  };

  // Error Alert Component
  const ErrorAlert = () => (
    <AnimatePresence>
      {showError && error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 right-4 z-50 max-w-sm"
        >
          <Alert className="border-red-500/20 bg-red-500/5">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="pr-8">
              {error}
            </AlertDescription>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => {
                setShowError(false);
                clearError();
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!isConnected) {
    return (
      <>
        <Button 
          onClick={handleConnect} 
          disabled={isConnecting}
          className="quantum-button relative overflow-hidden"
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </>
          )}
        </Button>
        <ErrorAlert />
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="bg-background/50 backdrop-blur-sm border-primary/20 shadow-lg hover:bg-background/70 transition-all duration-300"
          >
            <div className="flex items-center gap-2">
              <motion.div 
                className="w-2 h-2 rounded-full bg-green-400"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <Wallet className="h-4 w-4" />
              <span className="font-mono text-sm">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end" 
          className="w-80 bg-background/95 backdrop-blur-sm border-primary/20 shadow-xl"
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-3 p-2">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="font-semibold">Wallet Connected</span>
                <Badge variant="outline" className="text-green-400 border-green-400/50">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  MegaETH
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Address</p>
                  <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-lg">
                    <code className="font-mono text-xs flex-1 truncate">{address}</code>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 hover:bg-primary/20" 
                      onClick={copyAddress}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                {balance && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-muted-foreground">Balance</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 text-xs"
                        onClick={handleRefreshBalance}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Refresh
                      </Button>
                    </div>
                    <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                      <p className="font-mono text-sm font-semibold text-green-400">
                        {parseFloat(balance).toFixed(4)} ETH
                      </p>
                      <p className="text-xs text-green-300/80">
                        ≈ ${(parseFloat(balance) * 3400).toFixed(2)} USD
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <a
              href={`https://www.megaexplorer.xyz/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer flex items-center gap-2 p-3 hover:bg-primary/10 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>View on MegaETH Explorer</span>
            </a>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <a
              href="https://faucet.megaeth.io"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer flex items-center gap-2 p-3 hover:bg-blue-500/10 transition-colors"
            >
              <Wallet className="h-4 w-4" />
              <span>Get Testnet ETH</span>
            </a>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleDisconnect} 
            className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 p-3 transition-colors"
          >
            <Wallet className="mr-2 h-4 w-4" />
            <span>Disconnect Wallet</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ErrorAlert />
    </>
  );
}