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
import WalletSelectionModal from "@/components/wallet-selection-modal";
import { WalletProvider as WalletProviderType } from "@/lib/wallet-providers";

export default function WalletConnectButton() {
  const { isConnected, address, balance, connectWallet, disconnectWallet, isConnecting } = useWallet();
  const { toast } = useToast();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const handleWalletSelect = async (walletProvider: WalletProviderType) => {
    setSelectedWallet(walletProvider.id);
    await connectWallet(walletProvider);
    setSelectedWallet(null);
  };
  if (!isConnected) {
    return (
      <>
        <Button
          onClick={() => setShowWalletModal(true)}
          className="quantum-button"
          disabled={isConnecting}
        >
          <Wallet className="mr-2 h-4 w-4" />
          {isConnecting ? 'Linking...' : 'Connect Wallet'}
        </Button>
        <WalletSelectionModal
          isOpen={showWalletModal}
          onClose={() => setShowWalletModal(false)}
          onWalletSelect={handleWalletSelect}
          isConnecting={isConnecting}
          selectedWallet={selectedWallet}
        />
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-background/50 backdrop-blur-sm border-primary/20 shadow-lg hover:bg-background/70 transition-all">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 quantum-pulse" />
            <span className="font-mono text-sm font-medium">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
            <Badge variant="outline" className="ml-1 bg-green-500/10 text-green-400 border-green-400/30 font-mono text-xs">
              {balance ? parseFloat(balance).toFixed(3) : '0.000'}
            </Badge>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 bg-background/95 backdrop-blur-sm border-primary/20">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span className="font-semibold">Wallet Connected</span>
              <Badge variant="outline" className="text-green-400 border-green-400/50">
                <CheckCircle className="mr-1 h-3 w-3" />
                Online
              </Badge>
            </div>
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
                <p className="text-xs text-muted-foreground">MegaETH Balance</p>
                <p className="font-mono text-lg font-bold text-green-400">{parseFloat(balance).toFixed(6)} ETH</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ≈ ${(parseFloat(balance) * 3400).toFixed(2)} USD
                </p>
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
