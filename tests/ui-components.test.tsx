import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import WalletConnectButton from '@/components/wallet-connect-button';
import { WalletProvider } from '@/contexts/wallet-context';

// Mock wallet context
vi.mock('@/hooks/use-wallet', () => ({
  useWallet: () => ({
    isConnected: false,
    address: null,
    balance: null,
    isConnecting: false,
    error: null,
    connectWallet: vi.fn(),
    disconnectWallet: vi.fn(),
    refreshBalance: vi.fn(),
    clearError: vi.fn()
  })
}));

describe('UI Components', () => {
  describe('Button Component', () => {
    it('should render button with correct text', () => {
      render(<Button>Test Button</Button>);
      expect(screen.getByRole('button')).toHaveTextContent('Test Button');
    });

    it('should handle click events', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled Button</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should apply quantum-button styling', () => {
      render(<Button className="quantum-button">Quantum Button</Button>);
      expect(screen.getByRole('button')).toHaveClass('quantum-button');
    });
  });

  describe('Card Component', () => {
    it('should render card with header and content', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card content</p>
          </CardContent>
        </Card>
      );

      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should apply quantum-card styling', () => {
      render(
        <Card className="quantum-card">
          <CardContent>Test</CardContent>
        </Card>
      );

      expect(screen.getByText('Test').closest('.quantum-card')).toBeInTheDocument();
    });
  });

  describe('Badge Component', () => {
    it('should render badge with correct variant', () => {
      render(<Badge variant="outline">Test Badge</Badge>);
      expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });

    it('should apply status colors correctly', () => {
      render(
        <div>
          <Badge className="text-green-400">Success</Badge>
          <Badge className="text-red-400">Error</Badge>
          <Badge className="text-yellow-400">Warning</Badge>
        </div>
      );

      expect(screen.getByText('Success')).toHaveClass('text-green-400');
      expect(screen.getByText('Error')).toHaveClass('text-red-400');
      expect(screen.getByText('Warning')).toHaveClass('text-yellow-400');
    });
  });

  describe('Progress Component', () => {
    it('should render progress bar with correct value', () => {
      render(<Progress value={75} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('should handle zero and maximum values', () => {
      const { rerender } = render(<Progress value={0} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      rerender(<Progress value={100} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Wallet Connect Button', () => {
    it('should show connect button when wallet not connected', () => {
      render(
        <WalletProvider>
          <WalletConnectButton />
        </WalletProvider>
      );

      expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
    });

    it('should handle connection loading state', () => {
      vi.mock('@/hooks/use-wallet', () => ({
        useWallet: () => ({
          isConnected: false,
          isConnecting: true,
          connectWallet: vi.fn()
        })
      }));

      render(
        <WalletProvider>
          <WalletConnectButton />
        </WalletProvider>
      );

      expect(screen.getByText('Connecting...')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should handle mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </div>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });

    it('should handle desktop viewport', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      render(
        <div className="hidden md:block">Desktop Content</div>
      );

      expect(screen.getByText('Desktop Content')).toBeInTheDocument();
    });
  });
});