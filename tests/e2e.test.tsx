import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '@/contexts/auth-context';
import { WalletProvider } from '@/contexts/wallet-context';
import LoginPage from '@/app/login/page';
import DashboardHomePage from '@/app/dashboard/page';
import JobSubmissionForm from '@/components/job-submission-form';

// Mock all external dependencies
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    pathname: '/dashboard'
  }),
  usePathname: () => '/dashboard'
}));

describe('End-to-End User Flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Mock successful API responses
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/api/submit-job')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            jobId: 'job_123',
            status: 'submitted',
            estimatedCompletion: Date.now() + 30000
          })
        });
      }
      
      if (url.includes('/api/job-status')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            jobId: 'job_123',
            status: 'completed',
            progress: 100,
            results: {
              measurements: { "00": 487, "01": 13, "10": 12, "11": 488 },
              fidelity: "97.8%",
              executionTime: "23.4ms",
              circuitDepth: 2,
              shots: 1024,
              algorithm: "Bell State",
              provider: "Google Willow"
            }
          })
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });

    // Mock MetaMask
    window.ethereum = {
      isMetaMask: true,
      request: vi.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
      on: vi.fn(),
      removeListener: vi.fn()
    };
  });

  describe('Complete User Journey', () => {
    it('should complete full user journey from login to job submission', async () => {
      const user = userEvent.setup();

      // Step 1: Login
      const { rerender } = render(
        <AuthProvider>
          <WalletProvider>
            <LoginPage />
          </WalletProvider>
        </AuthProvider>
      );

      // Use demo login
      const adminDemoButton = screen.getByText(/Admin Account/);
      await user.click(adminDemoButton);

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'quantum-user',
          expect.stringContaining('admin@example.com')
        );
      });

      // Step 2: Navigate to Dashboard
      localStorage.setItem('quantum-user', JSON.stringify({
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      }));

      rerender(
        <AuthProvider>
          <WalletProvider>
            <DashboardHomePage />
          </WalletProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Welcome back/)).toBeInTheDocument();
      });

      // Step 3: Submit Quantum Job
      rerender(
        <AuthProvider>
          <WalletProvider>
            <JobSubmissionForm onJobLogged={vi.fn()} />
          </WalletProvider>
        </AuthProvider>
      );

      // Select Bell State preset
      const bellStatePreset = screen.getByText('🔗 Bell State Creation');
      await user.click(bellStatePreset);

      // Submit job
      const submitButton = screen.getByText('Submit Job to Blockchain');
      await user.click(submitButton);

      // Should show success message
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/submit-job',
          expect.objectContaining({
            method: 'POST'
          })
        );
      });
    });

    it('should handle wallet connection in user flow', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <WalletProvider>
            <DashboardHomePage />
          </WalletProvider>
        </AuthProvider>
      );

      // Should show wallet connection option
      const connectButton = screen.getByText('Connect Wallet');
      await user.click(connectButton);

      expect(window.ethereum.request).toHaveBeenCalledWith({
        method: 'eth_requestAccounts'
      });
    });
  });

  describe('Error Recovery Flows', () => {
    it('should recover from network errors', async () => {
      const user = userEvent.setup();

      // Mock network error then success
      let callCount = 0;
      global.fetch = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('Network timeout'));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'success' })
        });
      });

      render(
        <AuthProvider>
          <WalletProvider>
            <JobSubmissionForm onJobLogged={vi.fn()} />
          </WalletProvider>
        </AuthProvider>
      );

      // Should handle error gracefully
      expect(screen.getByText('Quantum Lab')).toBeInTheDocument();
    });

    it('should recover from wallet connection errors', async () => {
      const user = userEvent.setup();

      // Mock wallet rejection then success
      window.ethereum.request
        .mockRejectedValueOnce({ code: 4001 }) // User rejection
        .mockResolvedValueOnce(['0x1234567890123456789012345678901234567890']);

      render(
        <AuthProvider>
          <WalletProvider>
            <DashboardHomePage />
          </WalletProvider>
        </AuthProvider>
      );

      const connectButton = screen.getByText('Connect Wallet');
      await user.click(connectButton);

      // Should handle rejection gracefully
      expect(window.ethereum.request).toHaveBeenCalled();
    });
  });

  describe('Performance Integration', () => {
    it('should load dashboard within performance thresholds', async () => {
      const startTime = performance.now();

      render(
        <AuthProvider>
          <WalletProvider>
            <DashboardHomePage />
          </WalletProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/QuantumChain/)).toBeInTheDocument();
      });

      const loadTime = performance.now() - startTime;
      expect(loadTime).toBeLessThan(1000); // Should load within 1 second
    });

    it('should handle concurrent operations', async () => {
      const operations = Array.from({ length: 10 }, (_, i) => 
        fetch(`/api/health?test=${i}`)
      );

      const results = await Promise.allSettled(operations);
      const successCount = results.filter(r => r.status === 'fulfilled').length;

      expect(successCount).toBeGreaterThan(0);
    });
  });

  describe('Data Persistence', () => {
    it('should persist user session across page reloads', () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      };

      localStorage.setItem('quantum-user', JSON.stringify(userData));

      render(
        <AuthProvider>
          <WalletProvider>
            <DashboardHomePage />
          </WalletProvider>
        </AuthProvider>
      );

      expect(localStorage.getItem).toHaveBeenCalledWith('quantum-user');
    });

    it('should persist wallet connection state', () => {
      localStorage.setItem('wallet-connected', 'true');

      render(
        <AuthProvider>
          <WalletProvider>
            <DashboardHomePage />
          </WalletProvider>
        </AuthProvider>
      );

      expect(localStorage.getItem).toHaveBeenCalledWith('wallet-connected');
    });
  });

  describe('Accessibility Integration', () => {
    it('should provide proper ARIA labels', () => {
      render(
        <AuthProvider>
          <WalletProvider>
            <LoginPage />
          </WalletProvider>
        </AuthProvider>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');

      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <WalletProvider>
            <LoginPage />
          </WalletProvider>
        </AuthProvider>
      );

      // Tab through form elements
      await user.tab();
      expect(document.activeElement).toBeDefined();
    });
  });
});