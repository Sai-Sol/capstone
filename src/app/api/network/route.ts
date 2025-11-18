import { NextRequest, NextResponse } from 'next/server';
import { baseConfig } from '@/lib/base-config';
import { NetworkUtils } from '@/lib/network-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'network-status':
        const networkHealth = await NetworkUtils.checkNetworkHealth();
        return NextResponse.json({
          ...networkHealth,
          config: {
            chainId: baseConfig.chainId,
            rpcUrls: baseConfig.rpcUrls,
            blockExplorerUrls: base.blockExplorerUrls,
          },
          timestamp: Date.now()
        });

      default:
        return NextResponse.json({
          network: 'Base Network',
          chainId: baseConfig.chainId,
          status: 'operational',
          timestamp: Date.now()
        });
    }

  } catch (error) {
    console.error('Network API error:', error);
    return NextResponse.json(
      {
        error: 'Network API request failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'validate-network':
        const { chainId } = data;
        const isValid = chainId === baseConfig.chainId;

        return NextResponse.json({
          isValid,
          expectedChainId: baseConfig.chainId,
          currentChainId: chainId,
          message: isValid ? 'Connected to Base Network' : 'Wrong network',
          timestamp: Date.now()
        });

      default:
        return NextResponse.json(
          { error: 'Unknown network action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Network POST API error:', error);
    return NextResponse.json(
      {
        error: 'Network operation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}