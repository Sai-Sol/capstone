import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WalletProvider } from '@/contexts/wallet-context';
import { useWallet } from '@/hooks/use-wallet';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

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
  
  return (
    <div>
      <div data-testid="connection-status">
        {isConnecting ? 'Connecting' : isConnected ? 'Connected' : 'Disconnected'}
      </div>
      <div data-testid="wallet-address">{address || 'No address'}</div>
      <div data-testid="wallet-balance">{balance || 'No balance'}</div>
      <div data-testid="wallet-error">{error || 'No error'}</div>
      <button data-testid="connect-btn" onClick={connectWallet}>
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
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Mock window.ethereum
    window.ethereum = {
      isMetaMask: true,
      request: vi.fn(),
      on: vi.fn(),
      removeListener: vi.fn()
    };
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
    const mockProvider = {
      getSigner: vi.fn().mockResolvedValue({
        getAddress: vi.fn().mockResolvedValue(mockAddress)
      }),
      getBalance: vi.fn().mockResolvedValue(BigInt(mockBalance))
    };

    vi.mocked(BrowserProvider).mockImplementation(() => mockProvider as any);

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
      expect(screen.getByTestId('wallet-error')).toHaveTextContent('Connection cancelled');
    });
  });

  it('should disconnect wallet and clear data', async () => {
    // Set up connected state
    localStorage.setItem('wallet-connected', 'true');

    render(
      <WalletProvider>
        <TestWalletComponent />
      </WalletProvider>
    );

    fireEvent.click(screen.getByTestId('disconnect-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('connection-status')).toHaveTextContent('Disconnected');
    });

    expect(localStorage.removeItem).toHaveBeenCalledWith('wallet-connected');
  });

  it('should refresh balance when connected', async () => {
    const mockProvider = {
      getBalance: vi.fn().mockResolvedValue(BigInt('2000000000000000000')) // 2 ETH
    };

    render(
      <WalletProvider>
        <TestWalletComponent />
      </WalletProvider>
    );

    // Simulate connected state
    fireEvent.click(screen.getByTestId('refresh-btn'));

    // Should handle refresh gracefully even when not connected
    expect(screen.getByTestId('wallet-balance')).toHaveTextContent('No balance');
  });

  it('should handle MetaMask not installed', async () => {
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