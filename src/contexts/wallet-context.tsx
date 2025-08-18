"use client";

import React, { createContext, useState, useCallback, useEffect } from "react";
import { BrowserProvider, JsonRpcSigner, formatEther } from "ethers";

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

  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setBalance(null);
    setError(null);
    
    if (typeof window !== "undefined") {
      localStorage.removeItem("wallet-connected");
    }
  }, []);

  const refreshBalance = useCallback(async () => {
    if (provider && address) {
      try {
        const currentBalance = await provider.getBalance(address);
        const formattedBalance = formatEther(currentBalance);
        setBalance(formattedBalance);
      } catch (error: any) {
        console.error("Error refreshing balance:", error);
        setError("Failed to refresh balance. Please try again.");
      }
    }
  }, [provider, address]);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError("MetaMask is not installed. Please install MetaMask to continue.");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please unlock MetaMask.");
      }

      const browserProvider = new BrowserProvider(window.ethereum);
      const currentSigner = await browserProvider.getSigner();
      const currentAddress = await currentSigner.getAddress();
      const currentBalance = await browserProvider.getBalance(currentAddress);
      const formattedBalance = formatEther(currentBalance);

      setProvider(browserProvider);
      setSigner(currentSigner);
      setAddress(currentAddress);
      setBalance(formattedBalance);

      // Store connection state
      if (typeof window !== "undefined") {
        localStorage.setItem("wallet-connected", "true");
      }

    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      
      if (error.code === 4001) {
        setError("Connection cancelled. Please approve the connection to continue.");
      } else if (error.code === -32002) {
        setError("Connection request pending. Please check MetaMask.");
      } else {
        setError(error.message || "Failed to connect wallet. Please try again.");
      }
      
      disconnectWallet();
    } finally {
      setIsConnecting(false);
    }
  }, [disconnectWallet]);

  // Initialize wallet on mount
  useEffect(() => {
    const initializeWallet = async () => {
      if (!window.ethereum) return;

      try {
        const wasConnected = typeof window !== "undefined" && 
          localStorage.getItem("wallet-connected") === "true";
        
        if (wasConnected) {
          const accounts = await window.ethereum.request({ 
            method: 'eth_accounts' 
          });
          
          if (accounts && accounts.length > 0) {
            const browserProvider = new BrowserProvider(window.ethereum);
            const currentSigner = await browserProvider.getSigner();
            const currentAddress = await currentSigner.getAddress();
            const currentBalance = await browserProvider.getBalance(currentAddress);
            const formattedBalance = formatEther(currentBalance);

            setProvider(browserProvider);
            setSigner(currentSigner);
            setAddress(currentAddress);
            setBalance(formattedBalance);
          }
        }
      } catch (error) {
        console.error("Failed to initialize wallet:", error);
        if (typeof window !== "undefined") {
          localStorage.removeItem("wallet-connected");
        }
      }
    };

    initializeWallet();
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        // Reconnect with new account
        connectWallet();
      }
    };

    const handleChainChanged = () => {
      // Refresh the page when chain changes
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
  }, [connectWallet, disconnectWallet]);

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