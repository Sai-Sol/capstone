// MegaETH Testnet Configuration
// This file contains all MegaETH-specific configurations and utilities

export const MEGAETH_TESTNET_CONFIG = {
  // Network Configuration
  chainId: 9000,
  chainIdHex: "0x2328",
  networkName: "MegaETH Testnet",
  
  // RPC Configuration
  rpcUrls: [
    "https://testnet.megaeth.io",
    "https://rpc.megaeth.io/testnet", // Backup RPC
  ],
  
  // Explorer Configuration
  blockExplorerUrls: [
    "https://www.megaexplorer.xyz/",
    "https://explorer.megaeth.io/testnet", // Backup explorer
  ],
  
  // Native Currency
  nativeCurrency: {
    name: "MegaETH",
    symbol: "ETH",
    decimals: 18,
  },
  
  // Contract Addresses (MegaETH Testnet)
  contracts: {
    quantumJobLogger: "0xd1471126F18d76be253625CcA75e16a0F1C5B3e2",
    // Add more contract addresses as needed
  },
  
  // MegaETH-specific features
  features: {
    highThroughput: true,
    lowLatency: true,
    eip1559: true,
    postQuantumSecurity: true,
  },
  
  // Performance optimizations for MegaETH
  performance: {
    blockTime: 2, // 2 seconds average block time
    maxTps: 100000, // 100k transactions per second
    finalityTime: 12, // 12 seconds for finality
  },
  
  // Faucet and development tools
  tools: {
    faucetUrl: "https://testnet.megaeth.com/#2",
    docsUrl: "https://docs.megaeth.io",
    statusUrl: "https://status.megaeth.io",
    tokenLinkingUrl: "https://testnet.megaeth.com/#2",
  }
};

// Validation function to ensure we're on MegaETH Testnet
export function validateMegaETHNetwork(chainId: number | bigint): boolean {
  const numericChainId = typeof chainId === 'bigint' ? Number(chainId) : chainId;
  return numericChainId === MEGAETH_TESTNET_CONFIG.chainId;
}

// Get MegaETH network configuration for MetaMask
export function getMegaETHNetworkConfig() {
  return {
    chainId: MEGAETH_TESTNET_CONFIG.chainIdHex,
    chainName: MEGAETH_TESTNET_CONFIG.networkName,
    nativeCurrency: MEGAETH_TESTNET_CONFIG.nativeCurrency,
    rpcUrls: MEGAETH_TESTNET_CONFIG.rpcUrls,
    blockExplorerUrls: MEGAETH_TESTNET_CONFIG.blockExplorerUrls,
  };
}

// MegaETH-specific error messages
export const MEGAETH_ERRORS = {
  WRONG_NETWORK: "Please switch to MegaETH Testnet to continue",
  RPC_ERROR: "Failed to connect to MegaETH Testnet RPC",
  CONTRACT_NOT_FOUND: "Contract not deployed on MegaETH Testnet",
  INSUFFICIENT_GAS: "Insufficient gas for MegaETH transaction",
  NETWORK_CONGESTION: "MegaETH network is experiencing high traffic",
};

// MegaETH transaction optimization
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