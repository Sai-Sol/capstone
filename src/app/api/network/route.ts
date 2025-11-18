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
        const isValid = chainId === MEGAETH_TESTNET_CONFIG.chainId;
        
        return NextResponse.json({
          isValid,
          expectedChainId: MEGAETH_TESTNET_CONFIG.chainId,
          currentChainId: chainId,
          message: isValid ? 'Connected to MegaETH Testnet' : MEGAETH_ERRORS.WRONG_NETWORK,
          timestamp: Date.now()
        });

      case 'estimate-gas':
        const { to, value, data: txData } = data;
        
        let gasEstimate = 21000; // Base transaction cost
        
        if (txData && txData.length > 0) {
          gasEstimate += txData.length * 16; // Data cost
        }
        
        if (to === MEGAETH_TESTNET_CONFIG.contracts.quantumJobLogger) {
          gasEstimate += 50000; // Contract interaction cost
        }

        const gasPrice = MegaETHUtils.getOptimizedGasSettings('standard').gasPrice;
        const totalCost = (gasEstimate * gasPrice) / 1e18; // Convert to ETH

        return NextResponse.json({
          gasEstimate,
          gasPrice: gasPrice / 1e9, // Convert to gwei for display
          totalCost,
          optimized: true,
          timestamp: Date.now()
        });

      case 'check-contract':
        const { contractAddress } = data;
        const isKnownContract = Object.values(MEGAETH_TESTNET_CONFIG.contracts).includes(contractAddress);
        
        return NextResponse.json({
          isKnownContract,
          contractType: isKnownContract ? 'QuantumJobLogger' : 'Unknown',
          verified: isKnownContract,
          explorerUrl: `${MEGAETH_TESTNET_CONFIG.blockExplorerUrls[0]}address/${contractAddress}`,
          timestamp: Date.now()
        });

      default:
        return NextResponse.json(
          { error: 'Unknown MegaETH action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('MegaETH POST API error:', error);
    return NextResponse.json(
      { 
        error: 'MegaETH operation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}