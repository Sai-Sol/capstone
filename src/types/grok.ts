// REMOVED: Grok API types
// RESTORED: MegaETH testnet types

export interface MegaETHMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: number;
  network?: string;
  explorer?: string;
  isError?: boolean;
}

export interface MegaETHAnalysisRequest {
  message: string;
  context?: {
    algorithm?: string;
    provider?: string;
    results?: any;
    code?: string;
    network: string;
  };
}

export interface MegaETHAnalysisResponse {
  response: string;
  confidence: number;
  concepts: string[];
  sources: string[];
  network: string;
  explorer?: string;
  timestamp: number;
  error?: string;
}

export interface MegaETHNetworkInfo {
  chainId: string;
  chainName: string;
  rpcUrls: string[];
  blockExplorerUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  iconUrls?: string[];
  faucetUrls?: string[];
}

export interface QuantumJobVerification {
  jobId: string;
  txHash: string;
  verified: boolean;
  blockNumber?: number;
  timestamp?: number;
  network: string;
}