import { NextRequest, NextResponse } from 'next/server';
import { BlockscoutMonitor } from '@/lib/blockscout-monitor';

interface MonitoringState {
  isActive: boolean;
  lastCheck: number;
  lastCount: number;
  updates: any[];
}

const monitoringState: MonitoringState = {
  isActive: false,
  lastCheck: 0,
  lastCount: 0,
  updates: []
};

export async function GET(request: NextRequest) {
  try {
    console.log('[Monitor API] GET - Fetching current monitoring state');

    const transactionCount = await BlockscoutMonitor.fetchTransactionCount(
      '0xd1471126F18d76be253625CcA75e16a0F1C5B3e2'
    );

    return NextResponse.json({
      status: 'success',
      monitoring: monitoringState,
      currentTransactionCount: transactionCount,
      lastCheck: monitoringState.lastCheck,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('[Monitor API] GET Error:', error);

    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    console.log('[Monitor API] POST - Action:', action);

    if (action === 'check-once') {
      const transactionCount = await BlockscoutMonitor.fetchTransactionCount(
        '0xd1471126F18d76be253625CcA75e16a0F1C5B3e2'
      );

      monitoringState.lastCheck = Date.now();
      monitoringState.lastCount = transactionCount;

      const update = {
        timestamp: Date.now(),
        transactionCount,
        contractCount: BlockscoutMonitor.getLastKnownCount()
      };

      monitoringState.updates.push(update);

      if (monitoringState.updates.length > 100) {
        monitoringState.updates = monitoringState.updates.slice(-100);
      }

      return NextResponse.json({
        status: 'success',
        action: 'check-once',
        transactionCount,
        update,
        timestamp: Date.now()
      });
    }

    if (action === 'start') {
      if (monitoringState.isActive) {
        return NextResponse.json(
          {
            status: 'warning',
            message: 'Monitoring already active'
          }
        );
      }

      monitoringState.isActive = true;
      monitoringState.lastCheck = Date.now();

      console.log('[Monitor API] Monitoring started');

      return NextResponse.json({
        status: 'success',
        action: 'start',
        monitoring: monitoringState,
        message: 'Monitoring started - will check periodically'
      });
    }

    if (action === 'stop') {
      monitoringState.isActive = false;

      console.log('[Monitor API] Monitoring stopped');

      return NextResponse.json({
        status: 'success',
        action: 'stop',
        monitoring: monitoringState,
        message: 'Monitoring stopped'
      });
    }

    return NextResponse.json(
      {
        status: 'error',
        message: 'Unknown action'
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Monitor API] POST Error:', error);

    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
