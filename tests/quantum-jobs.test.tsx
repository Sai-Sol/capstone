import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import JobSubmissionForm from '@/components/job-submission-form';
import { WalletProvider } from '@/contexts/wallet-context';
import { AuthProvider } from '@/contexts/auth-context';

// Mock the wallet context
const mockWalletContext = {
  isConnected: true,
  provider: {},
  signer: {
    getAddress: vi.fn().mockResolvedValue('0x1234567890123456789012345678901234567890')
  },
  address: '0x1234567890123456789012345678901234567890',
  balance: '1.5',
  error: null,
  connectWallet: vi.fn(),
  disconnectWallet: vi.fn(),
  refreshBalance: vi.fn(),
  clearError: vi.fn(),
  isConnecting: false
};

vi.mock('@/hooks/use-wallet', () => ({
  useWallet: () => mockWalletContext
}));

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com', role: 'user' },
    loading: false
  })
}));

vi.mock('@/lib/blockchain-integration', () => ({
  blockchainIntegration: {
    logQuantumJob: vi.fn().mockResolvedValue({
      txHash: '0xabcdef1234567890abcdef1234567890abcdef12',
      jobId: 'job_123'
    })
  }
}));

describe('Quantum Job Submission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful API responses
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/api/submit-job')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            jobId: 'job_123',
            status: 'submitted'
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });
  });

  it('should render job submission form', () => {
    render(
      <AuthProvider>
        <WalletProvider>
          <JobSubmissionForm onJobLogged={vi.fn()} />
        </WalletProvider>
      </AuthProvider>
    );

    expect(screen.getByText('Quantum Lab')).toBeInTheDocument();
    expect(screen.getByText('Submit Job to Blockchain')).toBeInTheDocument();
  });

  it('should submit quantum job successfully', async () => {
    const onJobLogged = vi.fn();

    render(
      <AuthProvider>
        <WalletProvider>
          <JobSubmissionForm onJobLogged={onJobLogged} />
        </WalletProvider>
      </AuthProvider>
    );

    // Select a preset algorithm
    const bellStatePreset = screen.getByText('🔗 Bell State Creation');
    fireEvent.click(bellStatePreset);

    // Submit the form
    const submitButton = screen.getByText('Submit Job to Blockchain');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onJobLogged).toHaveBeenCalled();
    });
  });

  it('should validate form inputs', async () => {
    render(
      <AuthProvider>
        <WalletProvider>
          <JobSubmissionForm onJobLogged={vi.fn()} />
        </WalletProvider>
      </AuthProvider>
    );

    // Try to submit without selecting anything
    const submitButton = screen.getByText('Submit Job to Blockchain');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Description must be at least 10 characters.')).toBeInTheDocument();
    });
  });

  it('should handle wallet not connected', () => {
    // Override wallet context to be disconnected
    vi.mocked(mockWalletContext.isConnected).mockReturnValue(false);

    render(
      <AuthProvider>
        <WalletProvider>
          <JobSubmissionForm onJobLogged={vi.fn()} />
        </WalletProvider>
      </AuthProvider>
    );

    expect(screen.getByText('🔐 Wallet Connection Required')).toBeInTheDocument();
  });

  it('should calculate execution estimates correctly', async () => {
    render(
      <AuthProvider>
        <WalletProvider>
          <JobSubmissionForm onJobLogged={vi.fn()} />
        </WalletProvider>
      </AuthProvider>
    );

    // Select Google Willow provider
    const providerSelect = screen.getByRole('combobox');
    fireEvent.click(providerSelect);
    
    // Should show execution estimates
    expect(screen.getByText('Execution Time')).toBeInTheDocument();
    expect(screen.getByText('Compute Cost')).toBeInTheDocument();
    expect(screen.getByText('Qubits Used')).toBeInTheDocument();
  });
});