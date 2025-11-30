import { NextRequest, NextResponse } from 'next/server';

interface BlockScoutTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeUnix: number;
  status: string;
  method: string;
  gasUsed: string;
  blockNumber: number;
  type: string;
}

interface BlockScoutResponse {
  items: Array<{
    hash: string;
    from: {
      hash: string;
    };
    to: {
      hash: string;
    } | null;
    value: string;
    timestamp: string;
    status: string;
    method: string;
    gas_used: string;
    block: number;
    type: string;
  }>;
  next_page_params: any;
}

const BLOCKSCOUT_API = 'https://megaeth-testnet-v2.blockscout.com/api/v2';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const limit = searchParams.get('limit') || '20';

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BLOCKSCOUT_API}/addresses/${address}/transactions?limit=${limit}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`BlockScout API error: ${response.statusText}`);
    }

    const data: BlockScoutResponse = await response.json();

    const transactions: BlockScoutTransaction[] = data.items.map((tx) => ({
      hash: tx.hash,
      from: tx.from.hash,
      to: tx.to?.hash || '0x0000000000000000000000000000000000000000',
      value: tx.value,
      timeUnix: Math.floor(new Date(tx.timestamp).getTime() / 1000),
      status: tx.status || 'unknown',
      method: tx.method || 'transfer',
      gasUsed: tx.gas_used || '0',
      blockNumber: tx.block,
      type: tx.type || 'tx',
    }));

    return NextResponse.json({
      success: true,
      address,
      totalTransactions: transactions.length,
      transactions,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('BlockScout API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch transactions from BlockScout',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
