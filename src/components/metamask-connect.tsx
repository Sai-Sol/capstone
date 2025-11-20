"use client";

import { useState, useEffect } from "react";
import { BrowserProvider, formatEther } from "ethers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Wallet, AlertTriangle, Copy, ExternalLink, CheckCircle, Loader2 } from "lucide-react";
import { MEGAETH_TESTNET_CONFIG } from "@/lib/megaeth-config";
import { useToast } from "@/hooks/use-toast";

interface MetaMaskState {
  isInstalled: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  address: string | null;
  chainId: string | null;
  chainName: string | null;
  balance: string | null;
  wrongNetwork: boolean;
}

export default function MetaMaskConnect() {
  const { toast } = useToast();
  const [state, setState] = useState<MetaMaskState>({
    isInstalled: false,
    isConnecting: false,
    isConnected: false,
    address: null,
    chainId: null,
    chainName: null,
    balance: null,
    wrongNetwork: false,
  });

  useEffect(() => {
    checkMetaMaskInstalled();
  }, []);

  const checkMetaMaskInstalled = () => {
    const installed = typeof window !== "undefined" && !!window.ethereum?.isMetaMask;
    setState(prev => ({ ...prev, isInstalled: installed }));
    console.log("MetaMask detection:", installed ? "Installed" : "Not installed");
  };

  const getNetworkName = (chainId: string): string => {
    const chains: Record<string, string> = {
      "0x1": "Ethereum Mainnet",
      "0x18c7": "MEGA Testnet v2",
      "0x5": "Goerli Testnet",
      "0xaa36a7": "Sepolia Testnet",
      "0x89": "Polygon Mainnet",
      "0x13881": "Mumbai Testnet",
    };
    return chains[chainId.toLowerCase()] || `Chain ID: ${parseInt(chainId, 16)}`;
  };

  const connectWallet = async () => {
    if (!state.isInstalled) {
      toast({
        variant: "destructive",
        title: "MetaMask Not Found",
        description: "Please install MetaMask to continue.",
      });
      console.log("Connection attempt failed: MetaMask not installed");
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true }));
    console.log("Initiating MetaMask connection request...");

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connection successful! Accounts:", accounts);

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const provider = new BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const chainId = `0x${network.chainId.toString(16)}`;
      const networkName = getNetworkName(chainId);
      const address = accounts[0];

      console.log("Network detected:", networkName, "Chain ID:", chainId);

      const balance = await provider.getBalance(address);
      const formattedBalance = formatEther(balance);

      const isMegaETH = network.chainId === BigInt(MEGAETH_TESTNET_CONFIG.chainId);
      const wrongNetwork = !isMegaETH;

      if (wrongNetwork) {
        console.log("Wrong network detected. User should manually switch to MEGA Testnet v2.");
      } else {
        console.log("Connected to MEGA Testnet v2 successfully!");
      }

      setState({
        isInstalled: true,
        isConnecting: false,
        isConnected: true,
        address,
        chainId,
        chainName: networkName,
        balance: formattedBalance,
        wrongNetwork,
      });

      toast({
        title: "Wallet Connected",
        description: `Connected to ${networkName}`,
      });
    } catch (error: any) {
      console.error("Connection error:", error);
      setState(prev => ({ ...prev, isConnecting: false }));

      if (error.code === 4001) {
        toast({
          variant: "destructive",
          title: "Connection Rejected",
          description: "You rejected the connection request.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: error.message || "Failed to connect wallet",
        });
      }
    }
  };

  const disconnectWallet = () => {
    console.log("Disconnecting wallet...");
    setState({
      isInstalled: state.isInstalled,
      isConnecting: false,
      isConnected: false,
      address: null,
      chainId: null,
      chainName: null,
      balance: null,
      wrongNetwork: false,
    });

    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  const copyAddress = () => {
    if (state.address) {
      navigator.clipboard.writeText(state.address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      console.log("Accounts changed:", accounts);
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        window.location.reload();
      }
    };

    const handleChainChanged = (chainId: string) => {
      console.log("Chain changed to:", chainId);
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  if (!state.isInstalled) {
    return (
      <Card className="p-6 max-w-md mx-auto">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-4 bg-orange-500/10 rounded-full">
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">MetaMask Required</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Please install MetaMask to continue.
            </p>
            <Button asChild>
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Install MetaMask
              </a>
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (!state.isConnected) {
    return (
      <Button
        onClick={connectWallet}
        disabled={state.isConnecting}
        className="relative overflow-hidden"
      >
        {state.isConnecting ? (
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
    );
  }

  return (
    <div className="space-y-4">
      {state.wrongNetwork && (
        <Alert className="border-orange-500/50 bg-orange-500/10">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-orange-600 dark:text-orange-400">
            You're currently on {state.chainName}. Please switch to MEGA Testnet v2 manually in
            MetaMask.
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium">Connected</span>
            </div>
            <Badge
              variant={state.wrongNetwork ? "destructive" : "default"}
              className="text-xs"
            >
              {state.wrongNetwork ? (
                <>
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Wrong Network
                </>
              ) : (
                <>
                  <CheckCircle className="mr-1 h-3 w-3" />
                  MEGA Testnet v2
                </>
              )}
            </Badge>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Address</p>
            <div className="flex items-center gap-2">
              <code className="font-mono text-sm flex-1 truncate">
                {state.address}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={copyAddress}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Network</p>
            <p className="font-mono text-sm">{state.chainName}</p>
          </div>

          {state.balance && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Balance</p>
              <p className="font-mono text-sm font-semibold">
                {parseFloat(state.balance).toFixed(4)} ETH
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              asChild
            >
              <a
                href={`${MEGAETH_TESTNET_CONFIG.blockExplorerUrls[0]}/address/${state.address}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-3 w-3" />
                Explorer
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={disconnectWallet}
              className="text-red-500 hover:text-red-600"
            >
              Disconnect
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
