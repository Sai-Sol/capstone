import { NextRequest, NextResponse } from 'next/server';
import { blockchain } from '@/lib/blockchain-core';
import { consensus } from '@/lib/consensus';
import { walletManager } from '@/lib/wallet-manager';
import { performanceMonitor } from '@/lib/performance-monitor';

export async function GET(request: NextRequest) {
  const startTime = performance.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        return NextResponse.json({
          network: blockchain.getNetworkStats(),
          consensus: consensus.getConsensusStats(),
          timestamp: Date.now()
        });

      case 'chain':
        const limit = parseInt(searchParams.get('limit') || '10');
        const chain = blockchain.getChain().slice(-limit);
        return NextResponse.json({
          blocks: chain,
          totalBlocks: blockchain.getChain().length,
          timestamp: Date.now()
        });

      case 'pending':
        return NextResponse.json({
          transactions: blockchain.getPendingTransactions(),
          count: blockchain.getPendingTransactions().length,
          timestamp: Date.now()
        });

      case 'validators':
        return NextResponse.json({
          validators: consensus.getValidators(),
          stats: consensus.getConsensusStats(),
          timestamp: Date.now()
        });

      default:
        return NextResponse.json({
          network: blockchain.getNetworkStats(),
          latestBlock: blockchain.getLatestBlock(),
          pendingTransactions: blockchain.getPendingTransactions().length,
          timestamp: Date.now()
        });
    }
  } catch (error) {
    console.error('Blockchain API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch blockchain data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    const duration = performance.now() - startTime;
    performanceMonitor.endTimer('blockchain-api-get');
    
    if (duration > 1000) {
      console.warn(`Slow blockchain API call: ${duration.toFixed(2)}ms`);
    }
  }
}

export async function POST(request: NextRequest) {
  performanceMonitor.startTimer('blockchain-api-post');
  
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'create_transaction':
        const { from, to, amount, privateKey } = data;
        
        if (!from || !to || !amount) {
          return NextResponse.json(
            { error: 'Missing required fields: from, to, amount' },
            { status: 400 }
          );
        }

        const transaction = blockchain.createTransaction(from, to, amount, privateKey);
        const success = blockchain.addTransaction(transaction);
        
        if (success) {
          return NextResponse.json({
            success: true,
            transaction,
            message: 'Transaction added to pending pool'
          });
        } else {
          return NextResponse.json(
            { error: 'Transaction validation failed' },
            { status: 400 }
          );
        }

      case 'mine_block':
        const { minerAddress } = data;
        
        if (!minerAddress) {
          return NextResponse.json(
            { error: 'Miner address is required' },
            { status: 400 }
          );
        }

        const newBlock = blockchain.mineBlock(minerAddress);
        
        if (newBlock) {
          return NextResponse.json({
            success: true,
            block: newBlock,
            message: 'Block mined successfully'
          });
        } else {
          return NextResponse.json(
            { error: 'No pending transactions to mine' },
            { status: 400 }
          );
        }

      case 'validate_chain':
        const isValid = blockchain.validateChain();
        return NextResponse.json({
          isValid,
          message: isValid ? 'Blockchain is valid' : 'Blockchain validation failed'
        });

      case 'add_validator':
        const { validatorAddress, stake } = data;
        
        if (!validatorAddress || !stake) {
          return NextResponse.json(
            { error: 'Validator address and stake are required' },
            { status: 400 }
          );
        }

        const validatorAdded = consensus.addValidator(validatorAddress, stake);
        
        if (validatorAdded) {
          return NextResponse.json({
            success: true,
            message: 'Validator added successfully'
          });
        } else {
          return NextResponse.json(
            { error: 'Failed to add validator (insufficient stake?)' },
            { status: 400 }
          );
        }

      case 'get_balance':
        const { address } = data;
        
        if (!address) {
          return NextResponse.json(
            { error: 'Address is required' },
            { status: 400 }
          );
        }

        const balance = blockchain.getAccountBalance(address);
        const walletAnalytics = walletManager.getWalletAnalytics(address);
        
        return NextResponse.json({
          address,
          balance,
          analytics: walletAnalytics,
          timestamp: Date.now()
        });

      case 'estimate_fee':
        const { toAddress, txAmount, txData } = data;
        
        const estimatedFee = walletManager.estimateTransactionFee(toAddress, txAmount, txData);
        
        return NextResponse.json({
          estimatedFee,
          gasPrice: 20, // gwei
          timestamp: Date.now()
        });

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Blockchain API POST error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process blockchain request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    performanceMonitor.endTimer('blockchain-api-post');
  }
}