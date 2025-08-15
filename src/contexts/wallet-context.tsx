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
  const [isInitialized, setIsInitialized] = useState(false);

  const isConnected = !!address && !!provider && !!signer && !error;

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
      localStorage.removeItem("wallet-address");
    }
  }, []);

  const refreshBalance = useCallback(async () => {
    if (provider && address) {
      try {
        clearError();
        const currentBalance = await provider.getBalance(address);
        const formattedBalance = formatEther(currentBalance);
        setBalance(formattedBalance);
        
        // Store balance for persistence
        if (typeof window !== "undefined") {
          localStorage.setItem("wallet-balance", formattedBalance);
        }
      } catch (error: any) {
        console.error("Error refreshing balance:", error);
        setError("Failed to refresh balance. Please check your connection.");
      }
    }
  }, [provider, address, clearError]);

  const switchToMegaETH = async (ethereum: any) => {
    try {
      // First try to switch to the network
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MEGAETH_TESTNET.chainId }],
      });
    } catch (switchError: any) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          // Create clean network config without unsupported fields
          const networkConfig = {
            chainId: MEGAETH_TESTNET.chainId,
            chainName: MEGAETH_TESTNET.chainName,
            nativeCurrency: MEGAETH_TESTNET.nativeCurrency,
            rpcUrls: MEGAETH_TESTNET.rpcUrls,
            blockExplorerUrls: MEGAETH_TESTNET.blockExplorerUrls,
          };

          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfig],
          });
        } catch (addError: any) {
          console.error("Failed to add MegaETH network:", addError);
          console.warn("Network not added, continuing with current network");
        }
      } else {
        console.error("Failed to switch to MegaETH network:", switchError);
        console.warn("Network switch failed, continuing with current network");
      }
    }
  };

  const validateNetwork = async (browserProvider: BrowserProvider) => {
    try {
      const network = await browserProvider.getNetwork();
      const expectedChainId = BigInt(parseInt(MEGAETH_TESTNET.chainId, 16));
      
      if (network.chainId !== expectedChainId) {
        const ethereum = getEthereumObject();
        if (ethereum) {
          await switchToMegaETH(ethereum);
        }
        // Continue regardless of network - user is aware
      }
    } catch (error: any) {
      console.error("Network validation failed:", error);
      // Don't throw error, just log it - user is aware of network requirements
    }
  };

  const updateWalletState = useCallback(async (ethereum: any, skipNetworkCheck = false) => {
    try {
      setError(null);
      const browserProvider = new BrowserProvider(ethereum);
      
      // Validate network first unless skipping
      if (!skipNetworkCheck) {
        await validateNetwork(browserProvider);
      }
      
      const accounts = await browserProvider.listAccounts();
      
      if (accounts.length > 0) {
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
          localStorage.setItem("wallet-address", currentAddress);
          localStorage.setItem("wallet-balance", formattedBalance);
        }
      } else {
        disconnectWallet();
      }
    } catch (error: any) {
      console.error("Error updating wallet state:", error);
      setError(error.message || "Failed to connect to wallet. Please try again.");
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
        throw new Error("No accounts found. Please unlock MetaMask and try again.");
      }
      
      // Update wallet state (this will handle network switching)
      await updateWalletState(ethereum);
      
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      
      // Handle specific error cases
      if (error.code === 4001) {
        setError("Connection rejected. Please approve the connection request in MetaMask.");
      } else if (error.code === -32002) {
        setError("Connection request pending. Please check MetaMask for pending requests.");
      } else if (error.message?.includes("User rejected")) {
        setError("Connection cancelled by user.");
      } else if (error.message?.includes("network")) {
        setError("Network configuration error. Please ensure MegaETH testnet is properly configured.");
      } else {
        setError(error.message || "Failed to connect wallet. Please try again.");
      }
      
      disconnectWallet();
    } finally {
      setIsConnecting(false);
    }
  }, [updateWalletState, disconnectWallet]);

  // Initialize wallet state on mount
  useEffect(() => {
    const initializeWallet = async () => {
      const ethereum = getEthereumObject();
      if (!ethereum || !ethereum.isMetaMask) {
        setIsInitialized(true);
        return;
      }

      try {
        // Check if previously connected
        const wasConnected = typeof window !== "undefined" && 
          localStorage.getItem("wallet-connected") === "true";
        
        if (wasConnected) {
          // Check if accounts are still available
          const accounts = await ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            // Attempt silent reconnection with network validation
            await updateWalletState(ethereum);
          } else {
            // Clear stale connection data
            localStorage.removeItem("wallet-connected");
            localStorage.removeItem("wallet-address");
            localStorage.removeItem("wallet-balance");
          }
        }
      } catch (error) {
        console.error("Failed to initialize wallet:", error);
        // Clear stale data on initialization failure
        if (typeof window !== "undefined") {
          localStorage.removeItem("wallet-connected");
          localStorage.removeItem("wallet-address");
          localStorage.removeItem("wallet-balance");
        }
      } finally {
        setIsInitialized(true);
      }
    };

    initializeWallet();
  }, [updateWalletState]);

  // Set up event listeners after initialization
  useEffect(() => {
    if (!isInitialized) return;

    const ethereum = getEthereumObject();
    if (!ethereum || !ethereum.isMetaMask) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      console.log("Accounts changed:", accounts);
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        try {
          await updateWalletState(ethereum, true); // Skip network check on account change
        } catch (error) {
          console.error("Failed to update wallet on account change:", error);
          disconnectWallet();
        }
      }
    };

    const handleChainChanged = async (chainId: string) => {
      console.log("Chain changed:", chainId);
      try {
        // Validate the new network
        const browserProvider = new BrowserProvider(ethereum);
        await validateNetwork(browserProvider);
        await updateWalletState(ethereum, true);
      } catch (error) {
        console.error("Failed to handle chain change:", error);
        setError("Please switch to MegaETH testnet to continue using the application.");
      }
    };

    const handleDisconnect = () => {
      console.log("Wallet disconnected");
      disconnectWallet();
    };

    // Add event listeners
    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);
    ethereum.on("disconnect", handleDisconnect);
    
    return () => {
      // Remove event listeners
      if (ethereum.removeListener) {
        ethereum.removeListener("accountsChanged", handleAccountsChanged);
        ethereum.removeListener("chainChanged", handleChainChanged);
        ethereum.removeListener("disconnect", handleDisconnect);
      }
    };
  }, [isInitialized, updateWalletState, disconnectWallet]);

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