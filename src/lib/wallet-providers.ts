// Multi-Wallet Provider Support for MegaETH Testnet
import { BrowserProvider } from 'ethers';

export interface WalletProvider {
  id: string;
  name: string;
  icon: string;
  description: string;
  downloadUrl: string;
  isInstalled: () => boolean;
  getProvider: () => any;
  connect: () => Promise<string[]>;
}

export const SUPPORTED_WALLETS: WalletProvider[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    description: 'Most popular Ethereum wallet',
    downloadUrl: 'https://metamask.io/download/',
    isInstalled: () => typeof window !== 'undefined' && !!window.ethereum?.isMetaMask,
    getProvider: () => window.ethereum,
    connect: async () => {
      if (!window.ethereum?.isMetaMask) {
        throw new Error('MetaMask not installed');
      }
      return await window.ethereum.request({ method: 'eth_requestAccounts' });
    }
  },
  {
    id: 'okx',
    name: 'OKX Wallet',
    icon: '⭕',
    description: 'Secure multi-chain wallet',
    downloadUrl: 'https://www.okx.com/web3',
    isInstalled: () => typeof window !== 'undefined' && !!window.okxwallet,
    getProvider: () => window.okxwallet,
    connect: async () => {
      if (!window.okxwallet) {
        throw new Error('OKX Wallet not installed');
      }
      return await window.okxwallet.request({ method: 'eth_requestAccounts' });
    }
  },
  {
    id: 'rabby',
    name: 'Rabby Wallet',
    icon: '🐰',
    description: 'DeFi-focused browser wallet',
    downloadUrl: 'https://rabby.io/',
    isInstalled: () => typeof window !== 'undefined' && !!window.ethereum?.isRabby,
    getProvider: () => window.ethereum,
    connect: async () => {
      if (!window.ethereum?.isRabby) {
        throw new Error('Rabby Wallet not installed');
      }
      return await window.ethereum.request({ method: 'eth_requestAccounts' });
    }
  }
];

export const getAvailableWallets = (): WalletProvider[] => {
  return SUPPORTED_WALLETS.filter(wallet => wallet.isInstalled());
};

export const getWalletById = (id: string): WalletProvider | undefined => {
  return SUPPORTED_WALLETS.find(wallet => wallet.id === id);
};

// Enhanced wallet detection
export const detectWallets = (): { installed: WalletProvider[]; notInstalled: WalletProvider[] } => {
  const installed = SUPPORTED_WALLETS.filter(wallet => wallet.isInstalled());
  const notInstalled = SUPPORTED_WALLETS.filter(wallet => !wallet.isInstalled());
  
  return { installed, notInstalled };
};

// MegaETH network configuration for all wallets
export const MEGAETH_NETWORK_CONFIG = {
  chainId: '0x2328', // 9000 in hex
  chainName: 'MegaETH Testnet',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://testnet.megaeth.io'],
  blockExplorerUrls: ['https://www.megaexplorer.xyz/'],
};

// Enhanced ethereum provider access with conflict resolution
const safeGetEthereumProvider = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    // Create a safe reference to avoid property setter conflicts
    const ethereum = window.ethereum;
    
    // If ethereum is not available, return null
    if (!ethereum) return null;
    
    // Return a proxy to prevent property conflicts
    return new Proxy(ethereum, {
      set(target, property, value) {
        // Prevent setting ethereum property to avoid conflicts
        if (property === 'ethereum') {
          console.warn('Prevented ethereum property override to avoid conflicts');
          return true;
        }
        return Reflect.set(target, property, value);
      }
    });
  } catch (error) {
    console.warn('Error accessing ethereum provider safely:', error);
    return null;
  }
};

// Add MegaETH network to wallet
export const addMegaETHNetwork = async (provider: any): Promise<void> => {
  try {
    const ethereumProvider = provider || safeGetEthereumProvider();
    if (!ethereumProvider) {
      throw new Error('No ethereum provider available');
    }

    await ethereumProvider.request({
      method: 'wallet_addEthereumChain',
      params: [MEGAETH_NETWORK_CONFIG],
    });

    console.log('MegaETH network added successfully');
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('User rejected adding MegaETH network');
    } else if (error.code === -32602) {
      console.log('MegaETH network already added');
    } else {
      throw error;
    }
  }
};

// Switch to MegaETH network
export const switchToMegaETH = async (provider: any): Promise<void> => {
  try {
    const ethereumProvider = provider || safeGetEthereumProvider();
    if (!ethereumProvider) {
      throw new Error('No ethereum provider available');
    }

    await ethereumProvider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: MEGAETH_NETWORK_CONFIG.chainId }],
    });

    console.log('Switched to MegaETH network successfully');
  } catch (error: any) {
    if (error.code === 4902 || error.code === -32603) {
      // Chain not added, add it first
      console.log('MegaETH network not found, adding it...');
      await addMegaETHNetwork(provider);
      // Try switching again after adding
      await ethereumProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MEGAETH_NETWORK_CONFIG.chainId }],
      });
    } else if (error.code === 4001) {
      throw new Error('User rejected switching to MegaETH network');
    } else {
      throw error;
    }
  }
};

// Validate MegaETH network connection
export const validateMegaETHConnection = async (provider: BrowserProvider): Promise<boolean> => {
  try {
    const network = await provider.getNetwork();
    return Number(network.chainId) === 9000;
  } catch (error) {
    return false;
  }
};