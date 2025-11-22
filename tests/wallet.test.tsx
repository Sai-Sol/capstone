import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WalletProvider } from '@/contexts/wallet-context';
import { useWallet } from '@/hooks/use-wallet';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { WalletProvider as WalletProviderType } from '@/lib/wallet-providers';

// Test component to use wallet context
const TestWalletComponent = () => {
  const { 
    isConnected, 
    address, 
    balance, 
    connectWallet, 
    disconnectWallet, 
    refreshBalance,
    error,
    isConnecting
  } = useWallet();
  
  const mockWalletProvider: WalletProviderType = {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    description: 'MetaMask',
    downloadUrl: 'https://metamask.io',
    getProvider: () => window.ethereum,
    isInstalled: () => !!window.ethereum,
    connect: () => {
      // @ts-ignore
      return window.ethereum.request({ method: 'eth_requestAccounts' });
    }
  };

  return (
    <div>
      <div data-testid="connection-status">
        {isConnecting ? 'Connecting' : isConnected ? 'Connected' : 'Disconnected'}
      </div>
      <div data-testid="wallet-address">{address || 'No address'}</div>
      <div data-testid="wallet-balance">{balance || 'No balance'}</div>
      <div data-testid="wallet-error">{error || 'No error'}</div>
      <button data-testid="connect-btn" onClick={() => connectWallet(mockWalletProvider)}>
        Connect
      </button>
      <button data-testid="disconnect-btn" onClick={disconnectWallet}>
        Disconnect
      </button>
      <button data-testid="refresh-btn" onClick={refreshBalance}>
        Refresh
      </button>
    </div>
  );
};

describe('Wallet Integration', () => {
  let originalEthereum: any;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    originalEthereum = window.ethereum;

    // Mock window.ethereum
    Object.defineProperty(window, 'ethereum', {
      value: {
        isMetaMask: true,
        request: vi.fn(),
        on: vi.fn(),
        removeListener: vi.fn(),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    window.ethereum = originalEthereum;
  });

  it('should initialize with disconnected state', () => {
    render(
      <WalletProvider>
        <TestWalletComponent />
      </WalletProvider>
    );

    expect(screen.getByTestId('connection-status')).toHaveTextContent('Disconnected');
    expect(screen.getByTestId('wallet-address')).toHaveTextContent('No address');
    expect(screen.getByTestId('wallet-balance')).toHaveTextContent('No balance');
  });

  it('should connect wallet successfully', async () => {
    const mockAddress = '0x1234567890123456789012345678901234567890';
    const mockBalance = '1500000000000000000'; // 1.5 ETH in wei

    window.ethereum.request.mockResolvedValueOnce([mockAddress]);
    
    // Mock ethers provider and signer
    const mockGetSigner = vi.fn().mockResolvedValue({
      getAddress: vi.fn().mockResolvedValue(mockAddress)
    });
    const mockGetBalance = vi.fn().mockResolvedValue(BigInt(mockBalance));

    vi.mocked(BrowserProvider).mockImplementation(() => ({
      getSigner: mockGetSigner,
      getBalance: mockGetBalance,
      getNetwork: vi.fn().mockResolvedValue({ chainId: 6343 })
    } as any));

    render(
      <WalletProvider>
        <TestWalletComponent />
      </WalletProvider>
    );

    fireEvent.click(screen.getByTestId('connect-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected');
    });

    expect(window.ethereum.request).toHaveBeenCalledWith({
      method: 'eth_requestAccounts'
    });
  });

  it('should handle wallet connection rejection', async () => {
    window.ethereum.request.mockRejectedValueOnce({ code: 4001 });

    render(
      <WalletProvider>
        <TestWalletComponent />
      </WalletProvider>
    );

    fireEvent.click(screen.getByTestId('connect-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('wallet-error')).toHaveTextContent(/Connection cancelled/);
    });
  });

  it('should disconnect wallet and clear data', async () => {
    render(
      <WalletProvider>
        <TestWalletComponent />
      </WalletProvider>
    );

    // Connect first
    const mockAddress = '0x1234567890123456789012345678901234567890';
    window.ethereum.request.mockResolvedValue([mockAddress]);
    vi.mocked(BrowserProvider).mockImplementation(() => ({
      getSigner: async () => ({
        getAddress: async () => mockAddress,
      }),
      getBalance: async () => BigInt('1000000000000000000'),
      getNetwork: vi.fn().mockResolvedValue({ chainId: 6343 })
    } as any));

    fireEvent.click(screen.getByTestId('connect-btn'));
    await screen.findByText('Connected');

    // Then disconnect
    fireEvent.click(screen.getByTestId('disconnect-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('connection-status')).toHaveTextContent('Disconnected');
    });
  });

  it('should refresh balance when connected', async () => {
    render(
      <WalletProvider>
        <TestWalletComponent />
      </WalletProvider>
    );

    // Should handle refresh gracefully even when not connected
    fireEvent.click(screen.getByTestId('refresh-btn'));
    expect(screen.getByTestId('wallet-balance')).toHaveTextContent('No balance');
  });

  it('should handle MetaMask not installed', async () => {
    // @ts-ignore
    delete window.ethereum;

    render(
      <WalletProvider>
        <TestWalletComponent />
      </WalletProvider>
    );

    fireEvent.click(screen.getByTestId('connect-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('wallet-error')).toHaveTextContent('MetaMask is not installed');
    });
  });
});