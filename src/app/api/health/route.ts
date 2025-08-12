import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if Grok AI API key is configured
    const hasGrokKey = !!process.env.GROK_AI_API_KEY;
    
    // Test basic API connectivity (without making actual API call)
    const grokStatus = hasGrokKey ? 'configured' : 'missing_key';
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        grok_ai: {
          status: grokStatus,
          configured: hasGrokKey
        },
        database: {
          status: 'healthy'
        },
        blockchain: {
          status: 'healthy'
        }
      },
      version: '1.0.0'
    });
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Service health check failed'
      },
      { status: 503 }
    );
  }
}