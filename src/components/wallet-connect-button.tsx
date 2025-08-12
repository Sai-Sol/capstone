"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Wallet, Copy, ExternalLink, CheckCircle } from "lucide-react";
import { MEGAETH_TESTNET } from "@/lib/constants";

export default function WalletConnectButton() {
  const { isConnected, address, balance, connectWallet, disconnectWallet, chainId } = useWallet();
  const { toast } = useToast();
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  useEffect(() => {
    setIsCorrectNetwork(chainId === MEGAETH_TESTNET.chainId);
  }, [chainId]);

  const switchToMegaETH = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: MEGAETH_TESTNET.chainId }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [MEGAETH_TESTNET],
            });
          } catch (addError) {
            toast({
              variant: "destructive",
              title: "Network Error",
              description: "Failed to add MegaETH network"
            });
          }
        }
      }
    }
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  if (!isConnected) {
    return (
      <Button 
        onClick={connectWallet} 
        className="quantum-button"
      >
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-background/50 backdrop-blur-sm border-primary/20 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 quantum-pulse" />
            <Wallet className="h-4 w-4" />
            <span className="font-mono text-sm">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 bg-background/95 backdrop-blur-sm border-primary/20">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span className="font-semibold">Wallet Connected</span>
              <Badge variant="outline" className={isCorrectNetwork ? "text-green-400 border-green-400/50" : "text-yellow-400 border-yellow-400/50"}>
                <CheckCircle className="mr-1 h-3 w-3" />
                {isCorrectNetwork ? "MegaETH" : "Wrong Network"}
              </Badge>
            </div>
            {!isCorrectNetwork && (
              <div className="text-xs text-yellow-400">
                Please switch to MegaETH Testnet
              </div>
            )}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Address</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm">{address}</p>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyAddress}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            {balance && (
              <div>
                <p className="text-xs text-muted-foreground">Balance</p>
                <p className="font-mono text-sm font-semibold text-green-400">{parseFloat(balance).toFixed(4)} ETH</p>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <a
            href={`https://www.megaexplorer.xyz/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            <span>View on Explorer</span>
          </a>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnectWallet} className="cursor-pointer text-red-400 hover:text-red-300">
          <Wallet className="mr-2 h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}