'use client';

export const HARDCODED_USERS = [
  { name: "Admin User", email: "admin@example.com", password: "456", role: "admin", country: "United States" },
  { name: "Test User", email: "p1@example.com", password: "123", role: "user", country: "Canada" },
];

// MegaETH Testnet Configuration
export const CONTRACT_ADDRESS = "0xd1471126F18d76be253625CcA75e16a0F1C5B3e2";

export const MEGAETH_TESTNET = {
  chainId: "0x18C6", // 6342
  chainName: "MegaETH Testnet",
  nativeCurrency: {
    name: "MegaETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.megaeth.network"],
  blockExplorerUrls: ["https://explorer.megaeth.network"],
};