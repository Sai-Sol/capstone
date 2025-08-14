'use client';

export const HARDCODED_USERS = [
  { name: "Admin User", email: "admin@example.com", password: "456", role: "admin", country: "United States" },
  { name: "Test User", email: "p1@example.com", password: "123", role: "user", country: "Canada" },
];

export const CONTRACT_ADDRESS = "0xd1471126F18d76be253625CcA75e16a0F1C5B3e2";

export const MEGAETH_TESTNET = {
  chainId: "0x2328", // 9000
  chainName: "MegaETH Testnet",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://testnet.megaeth.io"],
  blockExplorerUrls: ["https://www.megaexplorer.xyz/"],
  iconUrls: ["https://megaeth.io/logo.png"],
  faucetUrls: ["https://faucet.megaeth.io"],
};