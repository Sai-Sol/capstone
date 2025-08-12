// REMOVED: Grok API integration - this file is no longer needed
// This endpoint has been removed as part of reverting to MegaETH testnet focus

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Grok API integration has been removed. Please use the MegaETH testnet features instead.' },
    { status: 410 }
  );
}