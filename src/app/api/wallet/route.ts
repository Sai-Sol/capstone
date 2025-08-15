import { NextRequest, NextResponse } from 'next/server';
import { walletManager } from '@/lib/wallet-manager';
import { blockchain } from '@/lib/blockchain-core';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const action = searchParams.get('action');

    if (address) {
      switch (action) {
        case 'balance':
          const balance = walletManager.updateBalance(address);
          return NextResponse.json({
            address,
            balance,
            timestamp: Date.now()
          });

        case 'history':
          const history = walletManager.getTransactionHistory(address);
          return NextResponse.json({
            address,
            history,
            count: history.length,
            timestamp: Date.now()
          });

        case 'analytics':
          const analytics = walletManager.getWalletAnalytics(address);
          return NextResponse.json({
            analytics,
            timestamp: Date.now()
          });

        case 'portfolio':
          const portfolio = walletManager.getPortfolioValue(address);
          return NextResponse.json({
            address,
            portfolio,
            timestamp: Date.now()
          });

        default:
          const account = walletManager.getAccount(address);
          if (!account) {
            return NextResponse.json(
              { error: 'Account not found' },
              { status: 404 }
            );
          }

          return NextResponse.json({
            account: {
              address: account.address,
              balance: account.balance,
              nonce: account.nonce,
              label: account.label,
              createdAt: account.createdAt
            },
            timestamp: Date.now()
          });
      }
    }

    // Return all accounts
    const accounts = walletManager.getAllAccounts().map(account => ({
      address: account.address,
      balance: account.balance,
      label: account.label,
      createdAt: account.createdAt
    }));

    return NextResponse.json({
      accounts,
      count: accounts.length,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Wallet API GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();

    switch (action) {
      case 'create_account':
        const { label } = data;
        const newAccount = walletManager.createAccount(label);
        
        return NextResponse.json({
          success: true,
          account: {
            address: newAccount.address,
            balance: newAccount.balance,
            label: newAccount.label,
            createdAt: newAccount.createdAt
          },
          message: 'Account created successfully'
        });

      case 'send_transaction':
        const { from, to, amount, data: txData } = data;
        
        if (!from || !to || !amount) {
          return NextResponse.json(
            { error: 'Missing required fields: from, to, amount' },
            { status: 400 }
          );
        }

        try {
          const transaction = await walletManager.sendTransaction(from, to, amount, txData);
          
          return NextResponse.json({
            success: true,
            transaction,
            message: 'Transaction sent successfully'
          });
        } catch (error: any) {
          return NextResponse.json(
            { error: error.message },
            { status: 400 }
          );
        }

      case 'call_contract':
        const { contractAddress, method, params, caller, value, gasLimit } = data;
        
        if (!contractAddress || !method || !caller) {
          return NextResponse.json(
            { error: 'Missing required fields: contractAddress, method, caller' },
            { status: 400 }
          );
        }

        try {
          const result = await walletManager.callContract(
            contractAddress,
            method,
            params || [],
            caller,
            value || 0,
            gasLimit || 100000
          );
          
          return NextResponse.json({
            success: true,
            result,
            message: 'Contract call executed successfully'
          });
        } catch (error: any) {
          return NextResponse.json(
            { error: error.message },
            { status: 400 }
          );
        }

      case 'estimate_fee':
        const { toAddress, txAmount, txData } = data;
        
        if (!toAddress || !txAmount) {
          return NextResponse.json(
            { error: 'Missing required fields: toAddress, txAmount' },
            { status: 400 }
          );
        }

        const estimatedFee = walletManager.estimateTransactionFee(toAddress, txAmount, txData);
        
        return NextResponse.json({
          estimatedFee,
          gasPrice: 20,
          timestamp: Date.now()
        });

      case 'import_wallet':
        const { walletData, importLabel } = data;
        
        if (!walletData) {
          return NextResponse.json(
            { error: 'Wallet data is required' },
            { status: 400 }
          );
        }

        try {
          const importedAccount = walletManager.importWallet(walletData, importLabel);
          
          return NextResponse.json({
            success: true,
            account: {
              address: importedAccount.address,
              balance: importedAccount.balance,
              label: importedAccount.label,
              createdAt: importedAccount.createdAt
            },
            message: 'Wallet imported successfully'
          });
        } catch (error: any) {
          return NextResponse.json(
            { error: `Import failed: ${error.message}` },
            { status: 400 }
          );
        }

      case 'export_wallet':
        const { exportAddress } = data;
        
        if (!exportAddress) {
          return NextResponse.json(
            { error: 'Address is required' },
            { status: 400 }
          );
        }

        try {
          const walletData = walletManager.exportWallet(exportAddress);
          
          return NextResponse.json({
            success: true,
            walletData,
            message: 'Wallet exported successfully'
          });
        } catch (error: any) {
          return NextResponse.json(
            { error: error.message },
            { status: 400 }
          );
        }

      default:
        return NextResponse.json(
          { error: 'Unknown wallet action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Wallet API POST error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process wallet request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}