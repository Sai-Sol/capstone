"use client";

import React, { createContext, useState, useCallback, useEffect } from "react";
import { BrowserProvider, JsonRpcSigner, formatEther } from "ethers";
import { MEGAETH_TESTNET_CONFIG, validateMegaETHNetwork, getMegaETHNetworkConfig, MEGAETH_ERRORS } from "@/lib/megaeth-config";
import { advancedErrorHandler, ErrorCategory, ErrorUtils } from "@/lib/advanced-error-handler";

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
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [lastErrorTime, setLastErrorTime] = useState<number>(0);

  const isConnected = !!address && !!provider && !!signer && !error;

  const clearError = useCallback(() => {
    setError(null);
    setLastErrorTime(0);
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
    setConnectionAttempts(0);
    setLastErrorTime(0);
    
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
        
        // Add timeout for balance refresh
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Balance refresh timeout')), 10000)
        );
        
        const balancePromise = provider.getBalance(address);
        const currentBalance = await Promise.race([balancePromise, timeoutPromise]) as bigint;
        
        const currentBalance = await provider.getBalance(address);
        const formattedBalance = formatEther(currentBalance);
        setBalance(formattedBalance);
        
        // Store balance for persistence
        if (typeof window !== "undefined") {
          localStorage.setItem("wallet-balance", formattedBalance);
        }
      } catch (error: any) {
        console.error("Error refreshing balance:", error);
        const enhancedError = ErrorUtils.handleWalletError(error, {
          action: 'refresh_balance',
          walletAddress: address,
          component: 'WalletContext'
        });
        setError(enhancedError.userMessage);
        setLastErrorTime(Date.now());
      }
    }
  }, [provider, address, clearError]);

  const validateNetwork = async (browserProvider: BrowserProvider) => {
    try {
      const network = await browserProvider.getNetwork();
      const expectedChainId = BigInt(MEGAETH_TESTNET_CONFIG.chainId);
      
      if (network.chainId !== expectedChainId) {
        console.warn(`Wrong network detected: ${network.chainId}, expected: ${expectedChainId}`);
        const networkError = new Error(MEGAETH_ERRORS.WRONG_NETWORK);
        const enhancedError = ErrorUtils.handleBlockchainError(networkError, {
          action: 'network_validation',
          networkId: Number(network.chainId),
          expectedNetworkId: MEGAETH_TESTNET_CONFIG.chainId
        });
        throw enhancedError;
      }
      
      console.log(`✅ Connected to MegaETH Testnet (Chain ID: ${network.chainId})`);
    } catch (error: any) {
      console.error("Network validation failed:", error);
      throw error;
    }
  };

  const updateWalletState = useCallback(async (ethereum: any, skipNetworkCheck = false) => {
    try {
      setError(null);
      setLastErrorTime(0);
      const browserProvider = new BrowserProvider(ethereum);
      
      // Validate network first unless skipping
      if (!skipNetworkCheck) {
        await validateNetwork(browserProvider);
      }
      
      // Add timeout for account listing
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Account listing timeout')), 8000)
      );
      
      const accountsPromise = browserProvider.listAccounts();
      const accounts = await Promise.race([accountsPromise, timeoutPromise]) as any[];
      
      if (accounts.length > 0) {
        const currentSigner = await browserProvider.getSigner();
        const currentAddress = await currentSigner.getAddress();
        
        // Add timeout for balance fetching
        const balanceTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Balance fetch timeout')), 8000)
        );
        
        const balancePromise = browserProvider.getBalance(currentAddress);
        const currentBalance = await Promise.race([balancePromise, balanceTimeoutPromise]) as bigint;
        
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
      
      const enhancedError = ErrorUtils.handleWalletError(error, {
        action: 'update_wallet_state',
        component: 'WalletContext',
        skipNetworkCheck
      });
      
      setError(enhancedError.userMessage);
      setLastErrorTime(Date.now());
      disconnectWallet();
    }
  }, [disconnectWallet]);

  const connectWallet = useCallback(async () => {
    // Prevent rapid connection attempts
    if (Date.now() - lastErrorTime < 3000) {
      setError("Please wait a moment before trying again.");
      return;
    }
    
    const ethereum = getEthereumObject();
    
    if (!ethereum) {
      const noMetaMaskError = ErrorUtils.handleWalletError(
        new Error("MetaMask not detected"), 
        { action: 'connect_wallet', component: 'WalletContext' }
      );
      setError(noMetaMaskError.userMessage);
      return;
    }

    if (!ethereum.isMetaMask) {
      const notMetaMaskError = ErrorUtils.handleWalletError(
        new Error("Non-MetaMask wallet detected"), 
        { action: 'connect_wallet', component: 'WalletContext' }
      );
      setError(notMetaMaskError.userMessage);
      return;
    }

    setIsConnecting(true);
    setError(null);
    setConnectionAttempts(prev => prev + 1);

    try {
      // Request account access with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection request timeout')), 15000)
      );
      
      const accountsPromise = ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await Promise.race([accountsPromise, timeoutPromise]) as string[];
      
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts available. Please unlock MetaMask and try again.");
      }
      
      // Update wallet state
      await updateWalletState(ethereum);
      setConnectionAttempts(0); // Reset on success
      
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      
      let enhancedError;
      
      if (error.code === 4001) {
        enhancedError = ErrorUtils.handleWalletError(error, {
          action: 'user_rejected_connection',
          attempts: connectionAttempts
        });
      } else if (error.code === -32002) {
        enhancedError = ErrorUtils.handleWalletError(error, {
          action: 'connection_pending',
          attempts: connectionAttempts
        });
      } else if (error.message?.includes("User rejected")) {
        enhancedError = ErrorUtils.handleWalletError(error, {
          action: 'user_cancelled',
          attempts: connectionAttempts
        });
      } else if (error.message?.includes("timeout")) {
        enhancedError = ErrorUtils.handleNetworkError(error, {
          action: 'connection_timeout',
          attempts: connectionAttempts
        });
      } else {
        enhancedError = ErrorUtils.handleWalletError(error, {
          action: 'connection_failed',
          attempts: connectionAttempts
        });
      }
      
      setError(enhancedError.userMessage);
      setLastErrorTime(Date.now());
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