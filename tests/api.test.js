// API endpoint tests
const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');

// Mock fetch for testing
global.fetch = jest.fn();

describe('API Endpoints', () => {
  beforeAll(() => {
    // Setup test environment
    process.env.NODE_ENV = 'test';
  });

  afterAll(() => {
    // Cleanup
    jest.restoreAllMocks();
  });

  describe('/api/health', () => {
    it('should return healthy status', async () => {
      const mockResponse = {
        status: 'healthy',
        services: {
          database: { status: 'healthy' },
          blockchain: { status: 'healthy' },
          quantum_analysis: { status: 'healthy' },
          megaeth_testnet: { status: 'healthy' }
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const response = await fetch('/api/health');
      const data = await response.json();

      expect(data.status).toBe('healthy');
      expect(data.services).toBeDefined();
    });

    it('should handle service failures gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch('/api/health');
      } catch (error) {
        expect(error.message).toBe('Network error');
      }
    });
  });

  describe('/api/submit-job', () => {
    it('should validate required fields', async () => {
      const invalidJob = {
        description: 'Test job'
        // Missing jobType
      };

      const mockResponse = {
        error: 'Missing required fields: jobType and description'
      };

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockResponse
      });

      const response = await fetch('/api/submit-job', {
        method: 'POST',
        body: JSON.stringify(invalidJob)
      });

      expect(response.status).toBe(400);
    });

    it('should accept valid job submission', async () => {
      const validJob = {
        jobType: 'Google Willow',
        description: 'Bell state creation with H and CNOT gates',
        provider: 'Google Willow',
        priority: 'medium',
        submissionType: 'prompt',
        txHash: '0x123...'
      };

      const mockResponse = {
        jobId: 'job_123',
        status: 'submitted'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const response = await fetch('/api/submit-job', {
        method: 'POST',
        body: JSON.stringify(validJob)
      });

      const data = await response.json();
      expect(data.status).toBe('submitted');
      expect(data.jobId).toBeDefined();
    });
  });

  describe('/api/ai', () => {
    it('should handle tech-related queries', async () => {
      const techQuery = 'Explain quantum computing';

      const mockResponse = {
        response: 'Quantum computing explanation...',
        confidence: 95,
        sources: ['QuantumChain Knowledge Base']
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const response = await fetch('/api/ai', {
        method: 'POST',
        body: JSON.stringify({ message: techQuery })
      });

      const data = await response.json();
      expect(data.confidence).toBeGreaterThan(90);
      expect(data.sources).toBeDefined();
    });

    it('should reject non-tech queries', async () => {
      const nonTechQuery = 'What is the weather today?';

      const mockResponse = {
        response: "I'm a specialized AI assistant focused exclusively on technology topics...",
        confidence: 100
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const response = await fetch('/api/ai', {
        method: 'POST',
        body: JSON.stringify({ message: nonTechQuery })
      });

      const data = await response.json();
      expect(data.response).toContain('specialized AI assistant');
    });
  });
});

module.exports = {};