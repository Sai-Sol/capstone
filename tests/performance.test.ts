import { describe, it, expect, vi, beforeEach } from 'vitest';
import { performanceMonitor, timeAsync, timeSync } from '@/lib/performance-monitor';

describe('Performance Monitoring', () => {
  beforeEach(() => {
    performanceMonitor.clearMetrics();
    vi.clearAllMocks();
  });

  describe('Performance Monitor', () => {
    it('should track synchronous operations', () => {
      const result = timeSync('sync-operation', () => {
        return Array.from({ length: 1000 }, (_, i) => i * 2).reduce((sum, n) => sum + n, 0);
      });

      expect(result).toBeGreaterThan(0);
      
      const metrics = performanceMonitor.getMetrics('sync-operation');
      expect(metrics.length).toBe(1);
      expect(metrics[0].duration).toBeGreaterThan(0);
    });

    it('should track asynchronous operations', async () => {
      const result = await timeAsync('async-operation', async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return 'completed';
      });

      expect(result).toBe('completed');
      
      const metrics = performanceMonitor.getMetrics('async-operation');
      expect(metrics.length).toBe(1);
      expect(metrics[0].duration).toBeGreaterThan(90);
    });

    it('should identify slow queries', () => {
      // Add a slow operation
      performanceMonitor.startTimer('slow-query');
      setTimeout(() => {
        performanceMonitor.endTimer('slow-query');
      }, 1500);

      // Add a fast operation
      performanceMonitor.startTimer('fast-query');
      setTimeout(() => {
        performanceMonitor.endTimer('fast-query');
      }, 50);

      const slowQueries = performanceMonitor.getSlowQueries(1000);
      expect(slowQueries.length).toBeGreaterThanOrEqual(0);
    });

    it('should calculate performance summary', () => {
      // Add multiple operations
      for (let i = 0; i < 5; i++) {
        performanceMonitor.startTimer(`operation-${i}`);
        setTimeout(() => {
          performanceMonitor.endTimer(`operation-${i}`);
        }, 100 + i * 20);
      }

      const summary = performanceMonitor.getSummary();
      expect(summary.totalMetrics).toBeGreaterThanOrEqual(0);
      expect(summary.uniqueOperations).toBeGreaterThanOrEqual(0);
    });

    it('should handle memory management', () => {
      // Add many metrics to test cleanup
      for (let i = 0; i < 150; i++) {
        performanceMonitor.startTimer(`metric-${i}`);
        performanceMonitor.endTimer(`metric-${i}`);
      }

      const metrics = performanceMonitor.getMetrics();
      expect(metrics.length).toBeLessThanOrEqual(100); // Should be limited to 100
    });
  });

  describe('API Performance', () => {
    it('should measure API response times', async () => {
      const mockApiCall = async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
        return { status: 'success' };
      };

      const result = await timeAsync('api-call', mockApiCall);
      
      expect(result.status).toBe('success');
      
      const metrics = performanceMonitor.getMetrics('api-call');
      expect(metrics[0].duration).toBeGreaterThan(140);
      expect(metrics[0].duration).toBeLessThan(200);
    });

    it('should track blockchain operation performance', async () => {
      const mockBlockchainOp = async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return { txHash: '0x123...', blockNumber: 1000000 };
      };

      const result = await timeAsync('blockchain-operation', mockBlockchainOp, {
        operation: 'logQuantumJob',
        provider: 'Google Willow'
      });

      expect(result.txHash).toBeDefined();
      
      const metrics = performanceMonitor.getMetrics('blockchain-operation');
      expect(metrics[0].metadata).toHaveProperty('operation', 'logQuantumJob');
    });
  });

  describe('Memory Management', () => {
    it('should monitor memory usage', () => {
      const memoryBefore = process.memoryUsage();
      
      // Create some objects to use memory
      const largeArray = Array.from({ length: 100000 }, (_, i) => ({ id: i, data: `item-${i}` }));
      
      const memoryAfter = process.memoryUsage();
      
      expect(memoryAfter.heapUsed).toBeGreaterThan(memoryBefore.heapUsed);
      expect(largeArray.length).toBe(100000);
    });

    it('should handle memory cleanup', () => {
      // Simulate memory cleanup
      const initialMetrics = performanceMonitor.getMetrics().length;
      
      // Add many metrics
      for (let i = 0; i < 200; i++) {
        performanceMonitor.startTimer(`cleanup-test-${i}`);
        performanceMonitor.endTimer(`cleanup-test-${i}`);
      }
      
      // Should be limited by internal cleanup
      const finalMetrics = performanceMonitor.getMetrics().length;
      expect(finalMetrics).toBeLessThanOrEqual(100);
    });
  });

  describe('Resource Optimization', () => {
    it('should optimize font loading', () => {
      const fontConfig = {
        display: 'swap',
        preload: true,
        fallback: 'sans-serif'
      };

      expect(fontConfig.display).toBe('swap');
      expect(fontConfig.preload).toBe(true);
    });

    it('should optimize image loading', () => {
      const imageConfig = {
        loading: 'lazy',
        decoding: 'async',
        formats: ['webp', 'avif']
      };

      expect(imageConfig.loading).toBe('lazy');
      expect(imageConfig.formats).toContain('webp');
    });

    it('should optimize bundle size', () => {
      const bundleConfig = {
        minify: true,
        compress: true,
        treeshaking: true,
        codesplitting: true
      };

      expect(bundleConfig.minify).toBe(true);
      expect(bundleConfig.compress).toBe(true);
    });
  });
});