import { NextRequest, NextResponse } from 'next/server';
import { blockchain } from '@/lib/blockchain-core';
import { consensus } from '@/lib/consensus';

interface MiningSession {
  id: string;
  minerAddress: string;
  startTime: number;
  isActive: boolean;
  blocksFound: number;
  hashRate: number;
  earnings: number;
}

// In-memory mining sessions (use database in production)
const miningSessions = new Map<string, MiningSession>();

export async function POST(request: NextRequest) {
  try {
    const { action, minerAddress, sessionId } = await request.json();

    switch (action) {
      case 'start_mining':
        if (!minerAddress) {
          return NextResponse.json(
            { error: 'Miner address is required' },
            { status: 400 }
          );
        }

        const newSessionId = `mining_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const session: MiningSession = {
          id: newSessionId,
          minerAddress,
          startTime: Date.now(),
          isActive: true,
          blocksFound: 0,
          hashRate: 0,
          earnings: 0
        };

        miningSessions.set(newSessionId, session);

        // Start mining process
        startMiningProcess(newSessionId);

        return NextResponse.json({
          success: true,
          sessionId: newSessionId,
          message: 'Mining session started'
        });

      case 'stop_mining':
        if (!sessionId) {
          return NextResponse.json(
            { error: 'Session ID is required' },
            { status: 400 }
          );
        }

        const session = miningSessions.get(sessionId);
        if (!session) {
          return NextResponse.json(
            { error: 'Mining session not found' },
            { status: 404 }
          );
        }

        session.isActive = false;
        miningSessions.set(sessionId, session);

        return NextResponse.json({
          success: true,
          session,
          message: 'Mining session stopped'
        });

      case 'get_session':
        if (!sessionId) {
          return NextResponse.json(
            { error: 'Session ID is required' },
            { status: 400 }
          );
        }

        const requestedSession = miningSessions.get(sessionId);
        if (!requestedSession) {
          return NextResponse.json(
            { error: 'Mining session not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          session: requestedSession,
          networkStats: blockchain.getNetworkStats(),
          timestamp: Date.now()
        });

      default:
        return NextResponse.json(
          { error: 'Unknown mining action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Mining API error:', error);
    return NextResponse.json(
      { 
        error: 'Mining operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const minerAddress = searchParams.get('miner');

    if (minerAddress) {
      // Get sessions for specific miner
      const minerSessions = Array.from(miningSessions.values())
        .filter(session => session.minerAddress === minerAddress);

      return NextResponse.json({
        sessions: minerSessions,
        totalEarnings: minerSessions.reduce((sum, s) => sum + s.earnings, 0),
        totalBlocks: minerSessions.reduce((sum, s) => sum + s.blocksFound, 0)
      });
    }

    // Get all active mining sessions
    const activeSessions = Array.from(miningSessions.values())
      .filter(session => session.isActive);

    const networkStats = blockchain.getNetworkStats();
    const consensusStats = consensus.getConsensusStats();

    return NextResponse.json({
      activeSessions,
      networkStats,
      consensusStats,
      totalMiners: activeSessions.length,
      totalHashRate: activeSessions.reduce((sum, s) => sum + s.hashRate, 0),
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Mining GET API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mining data' },
      { status: 500 }
    );
  }
}

async function startMiningProcess(sessionId: string): Promise<void> {
  const session = miningSessions.get(sessionId);
  if (!session || !session.isActive) {
    return;
  }

  try {
    // Simulate mining process
    const miningInterval = setInterval(async () => {
      const currentSession = miningSessions.get(sessionId);
      if (!currentSession || !currentSession.isActive) {
        clearInterval(miningInterval);
        return;
      }

      // Update hash rate (simulated)
      currentSession.hashRate = 1000000 + Math.random() * 500000; // 1-1.5 MH/s

      // Attempt to mine a block (simplified probability)
      const miningSuccess = Math.random() < 0.1; // 10% chance per attempt
      
      if (miningSuccess && blockchain.getPendingTransactions().length > 0) {
        const newBlock = blockchain.mineBlock(currentSession.minerAddress);
        
        if (newBlock) {
          currentSession.blocksFound++;
          currentSession.earnings += newBlock.reward;
          
          console.log(`Block ${newBlock.index} mined by ${currentSession.minerAddress}`);
        }
      }

      miningSessions.set(sessionId, currentSession);
    }, 5000); // Check every 5 seconds

    // Stop mining after 5 minutes for demo
    setTimeout(() => {
      clearInterval(miningInterval);
      const finalSession = miningSessions.get(sessionId);
      if (finalSession) {
        finalSession.isActive = false;
        miningSessions.set(sessionId, finalSession);
      }
    }, 300000);

  } catch (error) {
    console.error(`Mining process error for session ${sessionId}:`, error);
    const errorSession = miningSessions.get(sessionId);
    if (errorSession) {
      errorSession.isActive = false;
      miningSessions.set(sessionId, errorSession);
    }
  }
}