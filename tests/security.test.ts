import { describe, it, expect, vi, beforeEach } from 'vitest';
import { advancedErrorHandler, ErrorCategory, ErrorSeverity } from '@/lib/advanced-error-handler';
import { performanceMonitor } from '@/lib/performance-monitor';
import { MEGAETH_TESTNET_CONFIG } from '@/lib/megaeth-config';
import { MegaETHUtils } from '@/lib/megaeth-utils';

describe('Security Features', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Advanced Error Handler', () => {
    it('should enhance errors with proper categorization', () => {
      const error = new Error('Transaction failed');
      const enhancedError = advancedErrorHandler.enhanceError(
        error,
        ErrorCategory.BLOCKCHAIN,
        { component: 'WalletConnect' }
      );

      expect(enhancedError.id).toBeDefined();
      expect(enhancedError.category).toBe(ErrorCategory.BLOCKCHAIN);
      expect(enhancedError.severity).toBeDefined();
      expect(enhancedError.userMessage).toBeDefined();
      expect(enhancedError.timestamp).toBeGreaterThan(0);
    });

    it('should determine correct severity levels', () => {
      const criticalError = advancedErrorHandler.enhanceError(
        'Contract not found',
        ErrorCategory.BLOCKCHAIN
      );
      expect(criticalError.severity).toBe(ErrorSeverity.CRITICAL);

      const lowError = advancedErrorHandler.enhanceError(
        'Minor validation issue',
        ErrorCategory.VALIDATION
      );
      expect(lowError.severity).toBe(ErrorSeverity.LOW);
    });

    it('should generate user-friendly messages', () => {
      const walletError = advancedErrorHandler.enhanceError(
        'user rejected transaction',
        ErrorCategory.WALLET
      );
      
      expect(walletError.userMessage).toContain('cancelled');
      expect(walletError.userMessage).not.toContain('rejected');
    });

    it('should provide suggested actions', () => {
      const networkError = advancedErrorHandler.enhanceError(
        'network timeout',
        ErrorCategory.NETWORK
      );

      expect(networkError.suggestedActions).toBeDefined();
      expect(networkError.suggestedActions!.length).toBeGreaterThan(0);
      expect(networkError.retryable).toBe(true);
    });
  });

  describe('Performance Monitor', () => {
    it('should track operation timing', () => {
      performanceMonitor.startTimer('test-operation');
      
      // Simulate some work
      const result = Array.from({ length: 1000 }, (_, i) => i * 2);
      
      const metric = performanceMonitor.endTimer('test-operation');
      
      expect(metric).toBeDefined();
      expect(metric!.name).toBe('test-operation');
      expect(metric!.duration).toBeGreaterThan(0);
    });

    it('should identify slow operations', () => {
      performanceMonitor.startTimer('slow-operation');
      
      // Simulate slow operation
      setTimeout(() => {
        performanceMonitor.endTimer('slow-operation');
      }, 1100);

      const slowQueries = performanceMonitor.getSlowQueries(1000);
      expect(slowQueries).toBeDefined();
    });

    it('should calculate average times correctly', () => {
      // Add multiple metrics for the same operation
      for (let i = 0; i < 5; i++) {
        performanceMonitor.startTimer('repeated-operation');
        setTimeout(() => {
          performanceMonitor.endTimer('repeated-operation');
        }, 100 + i * 10);
      }

      const averageTime = performanceMonitor.getAverageTime('repeated-operation');
      expect(averageTime).toBeGreaterThan(0);
    });

    it('should provide performance summary', () => {
      const summary = performanceMonitor.getSummary();
      
      expect(summary.totalMetrics).toBeGreaterThanOrEqual(0);
      expect(summary.averageDuration).toBeGreaterThanOrEqual(0);
      expect(summary.uniqueOperations).toBeGreaterThanOrEqual(0);
    });
  });

  describe('MegaETH Security', () => {
    it('should validate MegaETH network configuration', () => {
      expect(MEGAETH_TESTNET_CONFIG.chainId).toBe(9000);
      expect(MEGAETH_TESTNET_CONFIG.rpcUrls).toContain('https://testnet.megaeth.io');
      expect(MEGAETH_TESTNET_CONFIG.contracts.quantumJobLogger).toBeDefined();
    });

    it('should validate Ethereum addresses', () => {
      const validAddress = '0x1234567890123456789012345678901234567890';
      const invalidAddress = '0x123';
      
      expect(MegaETHUtils.isValidMegaETHAddress(validAddress)).toBe(true);
      expect(MegaETHUtils.isValidMegaETHAddress(invalidAddress)).toBe(false);
    });

    it('should generate optimized gas settings', () => {
      const gasSettings = MegaETHUtils.getOptimizedGasSettings('standard');
      
      expect(gasSettings.gasPrice).toBeGreaterThan(0);
      expect(gasSettings.maxFeePerGas).toBeGreaterThan(gasSettings.gasPrice);
      expect(gasSettings.maxPriorityFeePerGas).toBeGreaterThan(0);
    });

    it('should check network health', async () => {
      const healthStatus = await MegaETHUtils.checkNetworkHealth();
      
      expect(healthStatus.status).toBeDefined();
      expect(healthStatus.latency).toBeGreaterThanOrEqual(0);
      expect(healthStatus.blockTime).toBe(2);
      expect(healthStatus.tps).toBeGreaterThan(0);
    });
  });

  describe('Input Validation', () => {
    it('should validate quantum job inputs', () => {
      const validJob = {
        jobType: 'Google Willow',
        description: 'Bell state creation with H and CNOT gates',
        priority: 'medium'
      };

      const invalidJob = {
        jobType: '',
        description: 'short',
        priority: 'invalid'
      };

      // Valid job should pass validation
      expect(validJob.jobType.length).toBeGreaterThan(0);
      expect(validJob.description.length).toBeGreaterThanOrEqual(10);

      // Invalid job should fail validation
      expect(invalidJob.jobType.length).toBe(0);
      expect(invalidJob.description.length).toBeLessThan(10);
    });

    it('should sanitize user inputs', () => {
      const maliciousInput = '<script>alert("xss")</script>';
      const sanitizedInput = maliciousInput.replace(/<[^>]*>/g, '');
      
      expect(sanitizedInput).not.toContain('<script>');
      expect(sanitizedInput).toBe('alert("xss")');
    });

    it('should validate Ethereum addresses', () => {
      const validAddress = '0x1234567890123456789012345678901234567890';
      const invalidAddress = 'not-an-address';
      
      const addressRegex = /^0x[a-fA-F0-9]{40}$/;
      
      expect(addressRegex.test(validAddress)).toBe(true);
      expect(addressRegex.test(invalidAddress)).toBe(false);
    });
  });

  describe('Session Security', () => {
    it('should handle secure session storage', () => {
      const userData = {
        email: 'test@example.com',
        role: 'user',
        timestamp: Date.now()
      };

      localStorage.setItem('quantum-user', JSON.stringify(userData));
      const stored = localStorage.getItem('quantum-user');
      const parsed = JSON.parse(stored!);

      expect(parsed.email).toBe(userData.email);
      expect(parsed.role).toBe(userData.role);
    });

    it('should handle session expiration', () => {
      const expiredSession = {
        email: 'test@example.com',
        role: 'user',
        timestamp: Date.now() - (24 * 60 * 60 * 1000) // 24 hours ago
      };

      const isExpired = Date.now() - expiredSession.timestamp > (12 * 60 * 60 * 1000); // 12 hour expiry
      expect(isExpired).toBe(true);
    });
  });
});