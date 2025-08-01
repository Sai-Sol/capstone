export const HARDCODED_USERS = [
  { name: "SAI", email: "admin@example.com", password: "456", role: "admin" },
  { name: "Mani", email: "p1@example.com", password: "123", role: "user" },
];

export const CONTRACT_ADDRESS = "0xd1471126F18d76be253625CcA75e16a0F1C5B3e2";

export const MEGAETH_TESTNET = {
  chainId: "0x2328", // 9000
  chainName: "Megaeth Testnet",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://testnet.megaeth.io"],
  blockExplorerUrls: ["https://www.megaexplorer.xyz/"],
};
