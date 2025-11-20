// MEGA Testnet v2 Configuration
// This file contains all MEGA Testnet v2-specific configurations and utilities

export const MEGAETH_TESTNET_CONFIG = {
  // Network Configuration
  chainId: 6343,
  chainIdHex: "0x18C7",
  networkName: "MEGA Testnet v2",

  // RPC Configuration
  rpcUrls: [
    "https://timothy.megaeth.com/rpc",
  ],

  // Explorer Configuration
  blockExplorerUrls: [
    "https://megaeth-testnet-v2.blockscout.com/",
  ],

  // Native Currency
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },

  // Contract Addresses (MEGA Testnet v2)
  contracts: {
    quantumJobLogger: "0xd1471126F18d76be253625CcA75e16a0F1C5B3e2",
  },

  // MEGA Testnet v2 features
  features: {
    highThroughput: true,
    lowLatency: true,
    eip1559: true,
    postQuantumSecurity: true,
  },

  // Performance optimizations for MEGA Testnet v2
  performance: {
    blockTime: 2,
    maxTps: 100000,
    finalityTime: 12,
  },

  // MEGA Testnet v2 tools and links
  tools: {
    faucetUrl: "https://megaeth-testnet-v2.blockscout.com/",
    docsUrl: "https://docs.megaeth.io",
    statusUrl: "https://status.megaeth.io",
    tokenLinkingUrl: "https://megaeth-testnet-v2.blockscout.com/",
  }
};

// Validation function to ensure we're on MEGA Testnet v2
export function validateMegaETHNetwork(chainId: number | bigint): boolean {
  const numericChainId = typeof chainId === 'bigint' ? Number(chainId) : chainId;
  return numericChainId === MEGAETH_TESTNET_CONFIG.chainId;
}

// Get MEGA Testnet v2 network configuration for MetaMask
export function getMegaETHNetworkConfig() {
  return {
    chainId: MEGAETH_TESTNET_CONFIG.chainIdHex,
    chainName: MEGAETH_TESTNET_CONFIG.networkName,
    nativeCurrency: MEGAETH_TESTNET_CONFIG.nativeCurrency,
    rpcUrls: MEGAETH_TESTNET_CONFIG.rpcUrls,
    blockExplorerUrls: MEGAETH_TESTNET_CONFIG.blockExplorerUrls,
  };
}

// MEGA Testnet v2 error messages
export const MEGAETH_ERRORS = {
  WRONG_NETWORK: "Please switch to MEGA Testnet v2 to continue",
  RPC_ERROR: "Failed to connect to MEGA Testnet v2 RPC",
  CONTRACT_NOT_FOUND: "Contract not deployed on MEGA Testnet v2",
  INSUFFICIENT_GAS: "Insufficient gas for MEGA Testnet v2 transaction",
  NETWORK_CONGESTION: "MEGA Testnet v2 network is experiencing high traffic",
};

// MEGA Testnet v2 transaction optimization
export const MEGAETH_TX_CONFIG = {
  gasLimit: {
    simple: 21000,
    contract: 100000,
    complex: 500000,
  },
  gasPrice: {
    slow: 1000000000, // 1 gwei
    standard: 2000000000, // 2 gwei
    fast: 5000000000, // 5 gwei
  },
  maxFeePerGas: 10000000000, // 10 gwei
  maxPriorityFeePerGas: 2000000000, // 2 gwei
};