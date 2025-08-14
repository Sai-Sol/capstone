"use client";

import React, { createContext, useState, useCallback, useEffect } from "react";
import { BrowserProvider, JsonRpcSigner, formatEther } from "ethers";
import { MEGAETH_TESTNET } from "@/lib/constants";

interface WalletContextType {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  address: string | null;
  balance: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<void>;
  clearError: () => void;
}

export const WalletContext = createContext<WalletContextType | null>(null);

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConnected = !!address && !!provider && !!signer;

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getEthereumObject = () => {
    if (typeof window !== "undefined" && window.ethereum) {
      return window.ethereum;
    }
    return null;
  };
  
  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setBalance(null);
    setError(null);
    
    // Clear from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("wallet-connected");
    }
  }, []);

  const refreshBalance = useCallback(async () => {
    if (provider && address) {
      try {
        const currentBalance = await provider.getBalance(address);
        setBalance(formatEther(currentBalance));
      } catch (error) {
        console.error("Error refreshing balance:", error);
        setError("Failed to refresh balance");
      }
    }
  }, [provider, address]);

  const switchToMegaETH = async (ethereum: any) => {
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MEGAETH_TESTNET.chainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [MEGAETH_TESTNET],
          });
        } catch (addError) {
          console.error("Failed to add MegaETH network:", addError);
          throw new Error("Failed to add MegaETH network. Please add it manually.");
        }
      } else {
        console.error("Failed to switch to MegaETH network:", switchError);
        throw new Error("Failed to switch to MegaETH network");
      }
    }
  };

  const updateWalletState = useCallback(async (ethereum: any) => {
    try {
      setError(null);
      const browserProvider = new BrowserProvider(ethereum);
      const accounts = await browserProvider.listAccounts();
      
      if (accounts.length > 0) {
        const currentSigner = await browserProvider.getSigner();
        const currentAddress = await currentSigner.getAddress();
        
        // Check if we're on the correct network
        const network = await browserProvider.getNetwork();
        if (network.chainId !== BigInt(parseInt(MEGAETH_TESTNET.chainId, 16))) {
          await switchToMegaETH(ethereum);
        }
        
        const currentBalance = await browserProvider.getBalance(currentAddress);

        setProvider(browserProvider);
        setSigner(currentSigner);
        setAddress(currentAddress);
        setBalance(formatEther(currentBalance));
        
        // Store connection state
        if (typeof window !== "undefined") {
          localStorage.setItem("wallet-connected", "true");
        }
      } else {
        disconnectWallet();
      }
    } catch (error: any) {
      console.error("Error updating wallet state:", error);
      setError(error.message || "Failed to update wallet state");
      disconnectWallet();
    }
  }, [disconnectWallet]);

  const connectWallet = useCallback(async () => {
    const ethereum = getEthereumObject();
    
    if (!ethereum) {
      setError("MetaMask not detected. Please install MetaMask to continue.");
      return;
    }

    if (!ethereum.isMetaMask) {
      setError("Please use MetaMask wallet for the best experience.");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Request account access
      const accounts = await ethereum.request({ 
        method: "eth_requestAccounts" 
      });
      
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please unlock MetaMask.");
      }
      
      // Switch to MegaETH testnet
      await switchToMegaETH(ethereum);
      
      // Update wallet state
      await updateWalletState(ethereum);
      
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      
      // Handle specific error cases
      if (error.code === 4001) {
        setError("Connection rejected. Please approve the connection request.");
      } else if (error.code === -32002) {
        setError("Connection request pending. Please check MetaMask.");
      } else if (error.message?.includes("User rejected")) {
        setError("Connection cancelled by user.");
      } else {
        setError(error.message || "Failed to connect wallet. Please try again.");
      }
      
      disconnectWallet();
    } finally {
      setIsConnecting(false);
    }
  }, [updateWalletState, disconnectWallet]);

  // Auto-reconnect on page load if previously connected
  useEffect(() => {
    const ethereum = getEthereumObject();
    if (ethereum && ethereum.isMetaMask) {
      const wasConnected = typeof window !== "undefined" && 
        localStorage.getItem("wallet-connected") === "true";
      
      if (wasConnected) {
        // Attempt silent reconnection
        updateWalletState(ethereum).catch(() => {
          // Silent fail for auto-reconnect
          localStorage.removeItem("wallet-connected");
        });
      }

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          updateWalletState(ethereum);
        }
      };

      const handleChainChanged = () => {
        updateWalletState(ethereum);
      };

      const handleDisconnect = () => {
        disconnectWallet();
      };

      ethereum.on("accountsChanged", handleAccountsChanged);
      ethereum.on("chainChanged", handleChainChanged);
      ethereum.on("disconnect", handleDisconnect);
      
      return () => {
        ethereum.removeListener("accountsChanged", handleAccountsChanged);
        ethereum.removeListener("chainChanged", handleChainChanged);
        ethereum.removeListener("disconnect", handleDisconnect);
      };
    }
  }, [updateWalletState, disconnectWallet]);

  return (
    <WalletContext.Provider
      value={{ 
        provider, 
        signer, 
        address, 
        balance, 
        isConnected, 
        isConnecting,
        error,
        connectWallet, 
        disconnectWallet, 
        refreshBalance,
        clearError
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};