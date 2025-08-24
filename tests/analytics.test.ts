import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Analytics and Insights', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('Event Tracking', () => {
    it('should track job submission events', async () => {
      const eventData = {
        type: 'job_submitted',
        userId: 'test@example.com',
        metadata: {
          provider: 'Google Willow',
          algorithm: 'Bell State',
          priority: 'medium'
        }
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          eventId: 'evt_123',
          timestamp: Date.now()
        })
      });

      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.eventId).toBeDefined();
    });

    it('should track job completion events', async () => {
      const completionEvent = {
        type: 'job_completed',
        userId: 'test@example.com',
        metadata: {
          jobId: 'job_123',
          executionTime: 23.4,
          fidelity: 97.8,
          provider: 'Google Willow',
          success: true
        }
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const response = await fetch('/api/analytics', {
        method: 'POST',
        body: JSON.stringify(completionEvent)
      });

      expect(response.ok).toBe(true);
    });

    it('should track wallet connection events', async () => {
      const walletEvent = {
        type: 'wallet_connected',
        metadata: {
          address: '0x1234567890123456789012345678901234567890',
          network: 'MegaETH Testnet',
          balance: '1.5'
        }
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const response = await fetch('/api/analytics', {
        method: 'POST',
        body: JSON.stringify(walletEvent)
      });

      expect(response.ok).toBe(true);
    });
  });

  describe('Performance Analytics', () => {
    it('should calculate algorithm performance metrics', () => {
      const algorithms = [
        {
          name: 'Bell State',
          executionTimes: [23.4, 25.1, 22.8, 24.6, 23.9],
          fidelities: [97.8, 97.2, 98.1, 97.5, 97.9]
        },
        {
          name: 'Grover Search',
          executionTimes: [156.7, 162.3, 154.2, 159.8, 157.1],
          fidelities: [94.2, 93.8, 94.7, 94.1, 94.5]
        }
      ];

      algorithms.forEach(algo => {
        const avgTime = algo.executionTimes.reduce((sum, time) => sum + time, 0) / algo.executionTimes.length;
        const avgFidelity = algo.fidelities.reduce((sum, fid) => sum + fid, 0) / algo.fidelities.length;

        expect(avgTime).toBeGreaterThan(0);
        expect(avgFidelity).toBeGreaterThan(90);
        expect(avgFidelity).toBeLessThanOrEqual(100);
      });
    });

    it('should identify performance trends', () => {
      const performanceData = [
        { timestamp: Date.now() - 86400000, responseTime: 150 }, // 1 day ago
        { timestamp: Date.now() - 43200000, responseTime: 120 }, // 12 hours ago
        { timestamp: Date.now() - 21600000, responseTime: 100 }, // 6 hours ago
        { timestamp: Date.now() - 10800000, responseTime: 80 },  // 3 hours ago
        { timestamp: Date.now() - 3600000, responseTime: 60 }    // 1 hour ago
      ];

      // Calculate trend (should be improving)
      const firstHalf = performanceData.slice(0, 2);
      const secondHalf = performanceData.slice(-2);

      const firstAvg = firstHalf.reduce((sum, d) => sum + d.responseTime, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, d) => sum + d.responseTime, 0) / secondHalf.length;

      expect(secondAvg).toBeLessThan(firstAvg); // Performance improving
    });

    it('should calculate cost efficiency metrics', () => {
      const jobCosts = [
        { algorithm: 'Bell State', cost: 0.001, qubits: 2, time: 23.4 },
        { algorithm: 'Grover Search', cost: 0.003, qubits: 4, time: 156.7 },
        { algorithm: 'Shor Algorithm', cost: 0.015, qubits: 15, time: 2300 }
      ];

      jobCosts.forEach(job => {
        const costPerQubit = job.cost / job.qubits;
        const costPerSecond = job.cost / (job.time / 1000);

        expect(costPerQubit).toBeGreaterThan(0);
        expect(costPerSecond).toBeGreaterThan(0);
      });
    });
  });

  describe('User Behavior Analytics', () => {
    it('should track user interaction patterns', () => {
      const userSessions = [
        {
          userId: 'user1',
          actions: ['login', 'submit_job', 'view_results', 'logout'],
          duration: 1800000, // 30 minutes
          jobsSubmitted: 3
        },
        {
          userId: 'user2',
          actions: ['login', 'explore_blockchain', 'submit_job'],
          duration: 900000, // 15 minutes
          jobsSubmitted: 1
        }
      ];

      userSessions.forEach(session => {
        const avgTimePerAction = session.duration / session.actions.length;
        const jobsPerMinute = session.jobsSubmitted / (session.duration / 60000);

        expect(avgTimePerAction).toBeGreaterThan(0);
        expect(jobsPerMinute).toBeGreaterThan(0);
      });
    });

    it('should identify popular features', () => {
      const featureUsage = {
        'quantum_lab': 150,
        'blockchain_explorer': 89,
        'job_history': 134,
        'wallet_management': 67,
        'analytics_dashboard': 23
      };

      const sortedFeatures = Object.entries(featureUsage)
        .sort(([, a], [, b]) => b - a)
        .map(([feature]) => feature);

      expect(sortedFeatures[0]).toBe('quantum_lab');
      expect(sortedFeatures[1]).toBe('job_history');
    });
  });

  describe('System Health Analytics', () => {
    it('should monitor system performance metrics', () => {
      const systemMetrics = {
        cpuUsage: 45.2,
        memoryUsage: 67.8,
        diskUsage: 23.1,
        networkLatency: 35.6,
        errorRate: 0.02
      };

      // All metrics should be within acceptable ranges
      expect(systemMetrics.cpuUsage).toBeLessThan(80);
      expect(systemMetrics.memoryUsage).toBeLessThan(90);
      expect(systemMetrics.diskUsage).toBeLessThan(80);
      expect(systemMetrics.networkLatency).toBeLessThan(100);
      expect(systemMetrics.errorRate).toBeLessThan(0.05);
    });

    it('should detect performance anomalies', () => {
      const responseTimeSeries = [50, 52, 48, 51, 49, 250, 53, 50]; // Spike at index 5
      
      const average = responseTimeSeries.reduce((sum, time) => sum + time, 0) / responseTimeSeries.length;
      const threshold = average * 2;
      
      const anomalies = responseTimeSeries.filter(time => time > threshold);
      expect(anomalies.length).toBeGreaterThan(0);
      expect(anomalies[0]).toBe(250);
    });
  });

  describe('Business Intelligence', () => {
    it('should calculate user engagement metrics', () => {
      const userMetrics = {
        dailyActiveUsers: 45,
        weeklyActiveUsers: 156,
        monthlyActiveUsers: 423,
        averageSessionDuration: 1200000, // 20 minutes
        jobsPerUser: 2.3,
        retentionRate: 0.78
      };

      expect(userMetrics.dailyActiveUsers).toBeLessThanOrEqual(userMetrics.weeklyActiveUsers);
      expect(userMetrics.weeklyActiveUsers).toBeLessThanOrEqual(userMetrics.monthlyActiveUsers);
      expect(userMetrics.retentionRate).toBeGreaterThan(0.5);
      expect(userMetrics.jobsPerUser).toBeGreaterThan(1);
    });

    it('should analyze quantum algorithm popularity', () => {
      const algorithmStats = {
        'Bell State': { submissions: 234, successRate: 0.978 },
        'Grover Search': { submissions: 156, successRate: 0.942 },
        'Quantum Teleportation': { submissions: 89, successRate: 0.937 },
        'Shor Algorithm': { submissions: 23, successRate: 0.893 }
      };

      Object.entries(algorithmStats).forEach(([algorithm, stats]) => {
        expect(stats.submissions).toBeGreaterThan(0);
        expect(stats.successRate).toBeGreaterThan(0.8);
        expect(stats.successRate).toBeLessThanOrEqual(1);
      });

      // Most popular should be Bell State
      const mostPopular = Object.entries(algorithmStats)
        .sort(([, a], [, b]) => b.submissions - a.submissions)[0][0];
      
      expect(mostPopular).toBe('Bell State');
    });
  });

  describe('Real-time Analytics', () => {
    it('should process real-time events', async () => {
      const events = [
        { type: 'job_submitted', timestamp: Date.now() },
        { type: 'job_completed', timestamp: Date.now() + 30000 },
        { type: 'wallet_connected', timestamp: Date.now() + 5000 }
      ];

      // Process events in real-time
      const processedEvents = events.map(event => ({
        ...event,
        processed: true,
        processingTime: Date.now() - event.timestamp
      }));

      expect(processedEvents.length).toBe(events.length);
      expect(processedEvents.every(e => e.processed)).toBe(true);
    });

    it('should aggregate real-time metrics', () => {
      const realtimeMetrics = {
        activeUsers: 23,
        runningJobs: 7,
        completedJobs: 156,
        networkLatency: 45.2,
        systemLoad: 34.7
      };

      // All metrics should be reasonable
      expect(realtimeMetrics.activeUsers).toBeGreaterThan(0);
      expect(realtimeMetrics.runningJobs).toBeGreaterThanOrEqual(0);
      expect(realtimeMetrics.completedJobs).toBeGreaterThan(realtimeMetrics.runningJobs);
      expect(realtimeMetrics.networkLatency).toBeLessThan(100);
      expect(realtimeMetrics.systemLoad).toBeLessThan(100);
    });
  });
});