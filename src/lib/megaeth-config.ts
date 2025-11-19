// Base Mainnet Configuration
// This file contains all Base-specific configurations and utilities

export const MEGAETH_TESTNET_CONFIG = {
  // Network Configuration
  chainId: 8453,
  chainIdHex: "0x2105",
  networkName: "Base Mainnet",

  // RPC Configuration
  rpcUrls: [
    "https://mainnet.base.org",
  ],

  // Explorer Configuration
  blockExplorerUrls: [
    "https://basescan.org/",
  ],

  // Native Currency
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },

  // Contract Addresses (Base Mainnet)
  contracts: {
    quantumJobLogger: "0xd1471126F18d76be253625CcA75e16a0F1C5B3e2",
  },

  // Base features
  features: {
    highThroughput: true,
    lowLatency: true,
    eip1559: true,
    postQuantumSecurity: false,
  },

  // Performance optimizations for Base
  performance: {
    blockTime: 2,
    maxTps: 4700,
    finalityTime: 12,
  },

  // Base tools and links
  tools: {
    faucetUrl: "https://www.coinbase.com/faucets/base-eth-testnet",
    docsUrl: "https://docs.base.org",
    statusUrl: "https://status.base.org",
    tokenLinkingUrl: "https://basescan.org",
  }
};

// Validation function to ensure we're on Base Mainnet
export function validateMegaETHNetwork(chainId: number | bigint): boolean {
  const numericChainId = typeof chainId === 'bigint' ? Number(chainId) : chainId;
  return numericChainId === MEGAETH_TESTNET_CONFIG.chainId;
}

// Get Base network configuration for MetaMask
export function getMegaETHNetworkConfig() {
  return {
    chainId: MEGAETH_TESTNET_CONFIG.chainIdHex,
    chainName: MEGAETH_TESTNET_CONFIG.networkName,
    nativeCurrency: MEGAETH_TESTNET_CONFIG.nativeCurrency,
    rpcUrls: MEGAETH_TESTNET_CONFIG.rpcUrls,
    blockExplorerUrls: MEGAETH_TESTNET_CONFIG.blockExplorerUrls,
  };
}

// Base-specific error messages
export const MEGAETH_ERRORS = {
  WRONG_NETWORK: "Please switch to Base Mainnet to continue",
  RPC_ERROR: "Failed to connect to Base Mainnet RPC",
  CONTRACT_NOT_FOUND: "Contract not deployed on Base Mainnet",
  INSUFFICIENT_GAS: "Insufficient gas for Base transaction",
  NETWORK_CONGESTION: "Base network is experiencing high traffic",
};

// Base transaction optimization
export const MEGAETH_TX_CONFIG = {
  gasLimit: {
    simple: 21000,
    contract: 100000,
    complex: 500000,
  },
  gasPrice: {
    slow: 100000000, // 0.1 gwei
    standard: 200000000, // 0.2 gwei
    fast: 500000000, // 0.5 gwei
  },
  maxFeePerGas: 1000000000, // 1 gwei
  maxPriorityFeePerGas: 100000000, // 0.1 gwei
};