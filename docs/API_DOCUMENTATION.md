# QuantumChain API Documentation

## Overview

The QuantumChain API provides comprehensive access to quantum computing, blockchain operations, and platform analytics. All endpoints are RESTful and return JSON responses with consistent error handling.

**Base URL**: `https://your-domain.com/api`
**Authentication**: Session-based (where required)
**Rate Limiting**: 100 requests per minute per IP

---

## Authentication

### Session Management

Most endpoints require user authentication through session tokens stored in localStorage.

**Authentication Flow:**
1. User logs in through `/login` page
2. Session token stored in localStorage as `quantum-user`
3. Token included in subsequent API requests
4. Session validated on protected endpoints

---

## Core System APIs

### Health Check

**Endpoint**: `GET /api/health`
**Purpose**: System health monitoring and service status
**Authentication**: None required

**Response Format:**
```json
{
  "status": "healthy" | "degraded" | "unhealthy",
  "timestamp": "2025-01-XX",
  "services": {
    "database": {
      "status": "healthy",
      "responseTime": 15
    },
    "blockchain": {
      "status": "healthy", 
      "responseTime": 45
    },
    "quantum_analysis": {
      "status": "healthy",
      "responseTime": 25
    },
    "megaeth_testnet": {
      "status": "healthy",
      "configured": true,
      "rpcUrl": "https://testnet.megaeth.io",
      "chainId": 9000
    }
  },
  "version": "2.0.0",
  "uptime": 3600,
  "memory": {
    "heapUsed": 50000000,
    "heapTotal": 100000000,
    "external": 5000000
  },
  "environment": "production"
}
```

**Status Codes:**
- `200`: All services healthy
- `503`: One or more services degraded/unhealthy

### System Metrics

**Endpoint**: `GET /api/system`
**Purpose**: System performance and resource monitoring
**Authentication**: None required

**Response Format:**
```json
{
  "uptime": 3600,
  "memory": {
    "heapUsed": 50000000,
    "heapTotal": 100000000,
    "external": 5000000
  },
  "timestamp": 1640995200000,
  "environment": "production",
  "version": "2.0.0",
  "features": {
    "quantumComputing": true,
    "blockchainIntegration": true,
    "aiAssistant": true,
    "postQuantumCrypto": true
  },
  "performance": {
    "heapUsedMB": 48,
    "heapTotalMB": 95,
    "externalMB": 5,
    "uptimeHours": 1.0
  },
  "status": "operational"
}
```

**System Actions** (`POST /api/system`):
```json
{
  "action": "gc" | "clear_cache"
}
```

---

## Blockchain APIs

### Blockchain Operations

**Endpoint**: `GET /api/blockchain`
**Purpose**: Blockchain network interaction and monitoring
**Authentication**: None required

**Query Parameters:**
- `action`: `stats` | `health` | `gas-prices`

#### Network Statistics (`?action=stats`)
```json
{
  "network": {
    "chainId": 9000,
    "name": "MegaETH Testnet",
    "blockNumber": 1234567,
    "gasPrice": "2.0 gwei",
    "difficulty": "1000000000000000",
    "hashRate": "2.5 TH/s",
    "validators": 150,
    "tps": 750,
    "networkLoad": 25
  },
  "performance": {
    "latency": 35,
    "blockTime": 2,
    "finality": 12,
    "uptime": 99.9
  },
  "timestamp": 1640995200000,
  "responseTime": 45.2
}
```

#### Network Health (`?action=health`)
```json
{
  "status": "healthy" | "degraded" | "down",
  "rpcEndpoint": "https://testnet.megaeth.io",
  "responseTime": 50,
  "lastCheck": 1640995200000,
  "error": null
}
```

#### Gas Prices (`?action=gas-prices`)
```json
{
  "slow": "1.6",
  "standard": "2.0", 
  "fast": "3.0",
  "rapid": "4.0",
  "unit": "gwei",
  "lastUpdated": 1640995200000
}
```

### Blockchain Operations (POST)

**Endpoint**: `POST /api/blockchain`
**Purpose**: Transaction validation and blockchain operations
**Authentication**: Required for some actions

**Request Format:**
```json
{
  "action": "validate-transaction" | "estimate-gas" | "check-contract",
  "data": {
    "to": "0x...",
    "value": "1.0",
    "gasLimit": 21000,
    "data": "0x..."
  }
}
```

#### Transaction Validation
**Response:**
```json
{
  "isValid": true,
  "errors": [],
  "warnings": ["High gas price detected"],
  "timestamp": 1640995200000
}
```

#### Gas Estimation
**Response:**
```json
{
  "gasEstimate": 65000,
  "gasPrice": 2.0,
  "totalCost": "0.00013000",
  "breakdown": {
    "base": 21000,
    "data": 4000,
    "contract": 40000
  },
  "timestamp": 1640995200000
}
```

### MegaETH Integration

**Endpoint**: `GET /api/megaeth`
**Purpose**: MegaETH-specific operations and utilities
**Authentication**: None required

**Query Parameters:**
- `action`: `network-status` | `gas-prices` | `faucet-info` | `contracts`

#### Network Status (`?action=network-status`)
```json
{
  "status": "operational",
  "config": {
    "chainId": 9000,
    "rpcUrls": ["https://testnet.megaeth.io"],
    "blockExplorerUrls": ["https://www.megaexplorer.xyz/"]
  },
  "performance": {
    "blockTime": 2,
    "maxTps": 100000,
    "currentTps": 750,
    "networkLoad": 25
  },
  "timestamp": 1640995200000
}
```

#### Faucet Information (`?action=faucet-info`)
```json
{
  "faucetUrl": "https://faucet.megaeth.io",
  "dailyLimit": "10 ETH",
  "cooldown": "24 hours",
  "requirements": [
    "Valid Ethereum address",
    "Not exceeded daily limit"
  ],
  "timestamp": 1640995200000
}
```

---

## Quantum Computing APIs

### Job Submission

**Endpoint**: `POST /api/submit-job`
**Purpose**: Submit quantum computing jobs for execution
**Authentication**: Required

**Request Format:**
```json
{
  "jobType": "Google Willow" | "IBM Condor" | "Amazon Braket",
  "description": "Quantum algorithm description or QASM code",
  "provider": "Google Willow",
  "priority": "low" | "medium" | "high",
  "submissionType": "prompt" | "qasm" | "preset",
  "txHash": "0x...",
  "userId": "user@example.com",
  "metadata": {
    "estimatedQubits": 4,
    "estimatedTime": "30s",
    "algorithmType": "Bell State"
  }
}
```

**Response Format:**
```json
{
  "jobId": "job_1640995200000_abc123",
  "status": "submitted",
  "estimatedCompletion": 1640995230000,
  "queuePosition": 3,
  "provider": "Google Willow"
}
```

**Error Responses:**
```json
{
  "error": "Missing required fields: jobType and description",
  "details": "Both jobType and description are required for job submission",
  "timestamp": 1640995200000
}
```

### Job Status Tracking

**Endpoint**: `GET /api/job-status/[id]`
**Purpose**: Real-time job execution monitoring
**Authentication**: Required

**Response Format:**
```json
{
  "jobId": "job_1640995200000_abc123",
  "status": "running" | "completed" | "failed",
  "progress": 75,
  "submittedAt": 1640995200000,
  "completedAt": 1640995230000,
  "duration": 30000,
  "isComplete": true,
  "userId": "user@example.com",
  "results": {
    "measurements": {
      "00": 487,
      "01": 13,
      "10": 12,
      "11": 488
    },
    "fidelity": "97.8%",
    "executionTime": "23.4ms",
    "circuitDepth": 2,
    "shots": 1024,
    "algorithm": "Bell State",
    "provider": "Google Willow"
  },
  "error": null
}
```

### Quantum Job History

**Endpoint**: `GET /api/quantum-jobs`
**Purpose**: Retrieve historical quantum job data
**Authentication**: Required

**Query Parameters:**
- `user`: Filter by user address (admin only)
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset
- `provider`: Filter by quantum provider
- `status`: Filter by job status

**Response Format:**
```json
{
  "jobs": [
    {
      "id": "job_1",
      "user": "0x1234567890123456789012345678901234567890",
      "jobType": "Google Willow",
      "description": "Bell state creation with Hadamard and CNOT gates",
      "txHash": "0xabcdef1234567890abcdef1234567890abcdef12",
      "timestamp": 1640995200000,
      "status": "confirmed",
      "results": {
        "fidelity": "97.8%",
        "executionTime": "23.4ms"
      }
    }
  ],
  "total": 25,
  "pagination": {
    "limit": 50,
    "offset": 0,
    "hasMore": false
  },
  "timestamp": 1640995200000
}
```

---

## Analytics APIs

### Analytics Tracking

**Endpoint**: `POST /api/analytics`
**Purpose**: Track user events and system analytics
**Authentication**: Optional

**Request Format:**
```json
{
  "type": "job_submitted" | "job_completed" | "wallet_connected" | "page_view",
  "userId": "user@example.com",
  "metadata": {
    "provider": "Google Willow",
    "algorithm": "Bell State",
    "executionTime": 23400,
    "success": true
  }
}
```

**Response Format:**
```json
{
  "success": true,
  "eventId": "evt_1640995200000_abc123",
  "timestamp": 1640995200000
}
```

### Analytics Retrieval

**Endpoint**: `GET /api/analytics`
**Purpose**: Retrieve analytics data and insights
**Authentication**: Required (Admin only)

**Query Parameters:**
- `type`: Filter by event type
- `userId`: Filter by user
- `limit`: Number of results (default: 100)
- `startDate`: Start date filter
- `endDate`: End date filter

**Response Format:**
```json
{
  "events": [
    {
      "id": "evt_1640995200000_abc123",
      "type": "job_submitted",
      "userId": "user@example.com",
      "metadata": {
        "provider": "Google Willow",
        "algorithm": "Bell State"
      },
      "timestamp": 1640995200000
    }
  ],
  "summary": {
    "totalEvents": 1000,
    "eventTypes": ["job_submitted", "job_completed", "wallet_connected"],
    "timeRange": {
      "earliest": 1640908800000,
      "latest": 1640995200000
    }
  },
  "timestamp": 1640995200000
}
```

### Execution Insights

**Endpoint**: `GET /api/execution-insights`
**Purpose**: Quantum execution performance analytics
**Authentication**: Required

**Query Parameters:**
- `timeRange`: `1d` | `7d` | `30d` | `90d`
- `algorithm`: Filter by algorithm type
- `provider`: Filter by quantum provider

**Response Format:**
```json
{
  "metrics": [
    {
      "algorithmName": "Bell State Creation",
      "provider": "Google Willow",
      "executionTime": {
        "simulated": 0.468,
        "real": 23.4,
        "improvement": 5000
      },
      "resourceUsage": {
        "qubits": 2,
        "gates": 3,
        "circuitDepth": 2,
        "fidelity": 97.8
      },
      "performance": {
        "efficiency": 96,
        "accuracy": 97.8,
        "scalability": 95,
        "complexity": "Low"
      },
      "costAnalysis": {
        "megaethCost": 0.001,
        "computeCost": 0.0006,
        "totalCost": 0.0016
      },
      "runCount": 45,
      "lastRun": 1640995200000
    }
  ],
  "insights": {
    "fastest": "Bell State Creation",
    "mostEfficient": "Quantum Superposition",
    "mostAccurate": "Bell State Creation",
    "recommendation": "Your algorithms are well-optimized for beginners. Consider exploring Grover's Search for the next challenge.",
    "trends": {
      "averageImprovement": 4250.5,
      "totalExecutions": 150,
      "averageFidelity": 94.2
    }
  },
  "metadata": {
    "timeRange": "7d",
    "totalAlgorithms": 6,
    "lastUpdated": 1640995200000,
    "responseTime": 45.2
  }
}
```

---

## Error Handling APIs

### Error Reporting

**Endpoint**: `POST /api/error-reporting`
**Purpose**: Submit error reports for analysis
**Authentication**: Optional

**Request Format:**
```json
{
  "errorId": "err_1640995200000_abc123",
  "message": "Transaction failed due to insufficient gas",
  "category": "blockchain",
  "severity": "high",
  "context": {
    "component": "WalletConnectButton",
    "action": "sendTransaction",
    "walletAddress": "0x...",
    "transactionHash": "0x..."
  },
  "userAgent": "Mozilla/5.0...",
  "url": "https://app.quantumchain.io/dashboard/blockchain",
  "userId": "user@example.com"
}
```

**Response Format:**
```json
{
  "success": true,
  "reportId": "err_1640995200000_abc123",
  "message": "Error report submitted successfully",
  "timestamp": 1640995200000
}
```

### Error Analytics

**Endpoint**: `GET /api/error-reporting`
**Purpose**: Retrieve error analytics and trends
**Authentication**: Required (Admin only)

**Query Parameters:**
- `category`: Filter by error category
- `severity`: Filter by error severity
- `limit`: Number of results (default: 50)
- `userId`: Filter by user

**Response Format:**
```json
{
  "reports": [
    {
      "errorId": "err_1640995200000_abc123",
      "message": "Transaction failed",
      "category": "blockchain",
      "severity": "high",
      "context": {...},
      "userAgent": "Mozilla/5.0...",
      "url": "https://app.quantumchain.io/dashboard",
      "timestamp": 1640995200000,
      "userId": "user@example.com"
    }
  ],
  "analytics": {
    "totalReports": 100,
    "categoryCounts": {
      "network": 25,
      "wallet": 20,
      "blockchain": 15,
      "quantum": 10,
      "auth": 5,
      "validation": 15,
      "system": 10
    },
    "severityCounts": {
      "low": 40,
      "medium": 35,
      "high": 20,
      "critical": 5
    },
    "timeRange": {
      "earliest": 1640908800000,
      "latest": 1640995200000
    }
  },
  "timestamp": 1640995200000
}
```

---

## Performance APIs

### Performance Monitoring

**Endpoint**: `GET /api/performance`
**Purpose**: System performance metrics and analysis
**Authentication**: Required (Admin only)

**Query Parameters:**
- `operation`: Filter by specific operation
- `threshold`: Slow query threshold in ms (default: 1000)

**Response Format:**
```json
{
  "summary": {
    "totalMetrics": 500,
    "averageDuration": 125.5,
    "slowQueries": 15,
    "uniqueOperations": 25
  },
  "slowQueries": [
    {
      "name": "blockchain_api_get",
      "duration": 1250.5,
      "timestamp": 1640995200000,
      "metadata": {
        "action": "stats",
        "endpoint": "/api/blockchain"
      }
    }
  ],
  "recentMetrics": [
    {
      "name": "job_submission",
      "duration": 45.2,
      "timestamp": 1640995200000,
      "metadata": {
        "provider": "Google Willow",
        "jobType": "Bell State"
      }
    }
  ],
  "timestamp": 1640995200000
}
```

### Performance Operations

**Endpoint**: `DELETE /api/performance`
**Purpose**: Clear performance metrics
**Authentication**: Required (Admin only)

**Response Format:**
```json
{
  "success": true,
  "message": "Performance metrics cleared",
  "timestamp": 1640995200000
}
```

---

## Debug APIs

### Debug Information

**Endpoint**: `GET /api/debug`
**Purpose**: Development debugging and diagnostics
**Authentication**: Required (Development only)

**Query Parameters:**
- `system`: Include system information (`true`/`false`)
- `performance`: Include performance data (`true`/`false`)

**Response Format:**
```json
{
  "timestamp": 1640995200000,
  "environment": "development",
  "version": "2.0.0",
  "uptime": 3600,
  "system": {
    "memory": {
      "heapUsed": 50000000,
      "heapTotal": 100000000
    },
    "platform": "linux",
    "nodeVersion": "v18.17.0",
    "pid": 12345
  },
  "performance": {
    "summary": {
      "totalMetrics": 100,
      "averageDuration": 85.5
    },
    "slowOperations": [],
    "recentMetrics": []
  },
  "services": {
    "wallet": "operational",
    "blockchain": "operational", 
    "quantum": "operational",
    "ai": "operational"
  }
}
```

### Debug Actions

**Endpoint**: `POST /api/debug`
**Purpose**: Execute debugging operations
**Authentication**: Required (Development only)

**Request Format:**
```json
{
  "action": "test_wallet" | "test_blockchain" | "clear_cache" | "simulate_error",
  "data": {}
}
```

**Response Examples:**

**Wallet Test:**
```json
{
  "success": true,
  "message": "Wallet connection test completed",
  "timestamp": 1640995200000
}
```

**Blockchain Test:**
```json
{
  "success": true,
  "message": "Blockchain connection test completed",
  "network": "MegaETH Testnet",
  "timestamp": 1640995200000
}
```

---

## Error Response Format

All API endpoints follow a consistent error response format:

### Standard Error Response

```json
{
  "error": "Human-readable error message",
  "errorId": "err_1640995200000_abc123",
  "timestamp": 1640995200000,
  "details": "Additional error context (development only)",
  "suggestions": [
    "Check your wallet connection",
    "Verify network settings",
    "Try again in a few moments"
  ]
}
```

### HTTP Status Codes

- **200**: Success
- **400**: Bad Request (validation error)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (resource doesn't exist)
- **429**: Too Many Requests (rate limit exceeded)
- **500**: Internal Server Error (system error)
- **503**: Service Unavailable (service down)

### Error Categories

**Validation Errors (400):**
```json
{
  "error": "Invalid input parameters",
  "validation": {
    "jobType": "Job type is required",
    "description": "Description must be at least 10 characters"
  },
  "timestamp": 1640995200000
}
```

**Authentication Errors (401):**
```json
{
  "error": "Authentication required",
  "message": "Please log in to access this resource",
  "loginUrl": "/login",
  "timestamp": 1640995200000
}
```

**Rate Limit Errors (429):**
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60,
  "limit": 100,
  "window": "1 minute",
  "timestamp": 1640995200000
}
```

---

## WebSocket APIs (Future Implementation)

### Real-time Updates

**Endpoint**: `wss://your-domain.com/ws`
**Purpose**: Real-time notifications and updates
**Authentication**: Required

**Message Format:**
```json
{
  "type": "job_update" | "blockchain_event" | "system_notification",
  "data": {
    "jobId": "job_123",
    "status": "completed",
    "results": {...}
  },
  "timestamp": 1640995200000
}
```

**Subscription Types:**
- `job_updates`: Quantum job status changes
- `blockchain_events`: Transaction confirmations
- `system_notifications`: System status updates
- `error_alerts`: Critical error notifications

---

## API Usage Examples

### JavaScript/TypeScript Examples

#### Submit Quantum Job
```typescript
const submitQuantumJob = async (jobData: {
  jobType: string;
  description: string;
  priority: string;
}) => {
  try {
    const response = await fetch('/api/submit-job', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Job submission failed:', error);
    throw error;
  }
};
```

#### Monitor Job Status
```typescript
const monitorJobStatus = async (jobId: string) => {
  const pollStatus = async (): Promise<any> => {
    const response = await fetch(`/api/job-status/${jobId}`);
    const data = await response.json();
    
    if (data.status === 'running') {
      // Continue polling
      setTimeout(pollStatus, 2000);
    }
    
    return data;
  };
  
  return pollStatus();
};
```

#### Get Network Statistics
```typescript
const getNetworkStats = async () => {
  try {
    const response = await fetch('/api/blockchain?action=stats');
    const stats = await response.json();
    
    return {
      blockNumber: stats.network.blockNumber,
      gasPrice: stats.network.gasPrice,
      networkLoad: stats.network.networkLoad,
      latency: stats.performance.latency
    };
  } catch (error) {
    console.error('Failed to fetch network stats:', error);
    return null;
  }
};
```

### Python Examples

#### Submit Job (Python)
```python
import requests
import json

def submit_quantum_job(job_data):
    url = "https://your-domain.com/api/submit-job"
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, headers=headers, json=job_data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Job submission failed: {e}")
        return None

# Usage
job_data = {
    "jobType": "Google Willow",
    "description": "Bell state creation",
    "priority": "medium",
    "submissionType": "prompt"
}

result = submit_quantum_job(job_data)
if result:
    print(f"Job submitted: {result['jobId']}")
```

---

## Rate Limiting

### Rate Limit Configuration

**Global Limits:**
- **API Requests**: 100 per minute per IP
- **Job Submissions**: 10 per minute per user
- **Wallet Operations**: 50 per minute per wallet
- **Analytics Events**: 200 per minute per session

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995260
X-RateLimit-Window: 60
```

### Rate Limit Responses

**Rate Limit Exceeded (429):**
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 45,
  "limit": 100,
  "window": "1 minute",
  "remaining": 0,
  "resetTime": 1640995260,
  "timestamp": 1640995200000
}
```

---

## API Versioning

### Version Strategy

**Current Version**: v1 (implicit)
**Future Versioning**: URL-based (`/api/v2/...`)

**Backward Compatibility:**
- Maintain v1 endpoints for 12 months after v2 release
- Deprecation warnings in response headers
- Migration guides for breaking changes

### Version Headers

**Response Headers:**
```
API-Version: 1.0
Deprecation-Warning: This endpoint will be deprecated in v2.0
Sunset: 2025-12-31
```

---

## SDK & Client Libraries (Future)

### Official SDKs

**Planned Languages:**
- JavaScript/TypeScript
- Python
- Go
- Rust

**SDK Features:**
- Automatic authentication handling
- Built-in retry mechanisms
- Type-safe interfaces
- Error handling utilities

### Example SDK Usage

```typescript
// Future SDK example
import { QuantumChainSDK } from '@quantumchain/sdk';

const client = new QuantumChainSDK({
  apiKey: 'your-api-key',
  environment: 'production'
});

// Submit quantum job
const job = await client.quantum.submitJob({
  provider: 'Google Willow',
  algorithm: 'Bell State Creation',
  priority: 'medium'
});

// Monitor progress
await client.quantum.waitForCompletion(job.id);
```

---

## Conclusion

The QuantumChain API provides comprehensive access to all platform features with:

✅ **Consistent Interface**: RESTful design with predictable responses
✅ **Comprehensive Error Handling**: Detailed error information and recovery guidance
✅ **Real-time Capabilities**: Live updates and monitoring
✅ **Security First**: Authentication, validation, and rate limiting
✅ **Performance Optimized**: Fast response times and efficient operations
✅ **Developer Friendly**: Clear documentation and examples

For additional support or questions about the API, please refer to the technical documentation or contact the development team.

---

*API Documentation Version 2.0 - Last Updated: January 2025*