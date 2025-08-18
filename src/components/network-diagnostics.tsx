"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Wifi, 
  WifiOff, 
  Activity, 
  Clock, 
  Zap, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Globe,
  Database,
  Shield
} from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { MEGAETH_TESTNET_CONFIG } from "@/lib/megaeth-config";

interface DiagnosticTest {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  result?: string;
  error?: string;
}

export default function NetworkDiagnostics() {
  const { provider, isConnected } = useWallet();
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tests, setTests] = useState<DiagnosticTest[]>([
    {
      id: 'rpc-connectivity',
      name: 'RPC Connectivity',
      description: 'Test connection to MegaETH RPC endpoint',
      status: 'pending'
    },
    {
      id: 'network-latency',
      name: 'Network Latency',
      description: 'Measure network response time',
      status: 'pending'
    },
    {
      id: 'block-sync',
      name: 'Block Synchronization',
      description: 'Verify blockchain synchronization',
      status: 'pending'
    },
    {
      id: 'contract-access',
      name: 'Contract Accessibility',
      description: 'Test smart contract interaction',
      status: 'pending'
    },
    {
      id: 'wallet-integration',
      name: 'Wallet Integration',
      description: 'Verify wallet connection and signing',
      status: 'pending'
    }
  ]);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setProgress(0);
    
    // Reset all tests
    setTests(prev => prev.map(test => ({ ...test, status: 'pending', duration: undefined, result: undefined, error: undefined })));
    
    const totalTests = tests.length;
    
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      
      // Update test status to running
      setTests(prev => prev.map(t => 
        t.id === test.id ? { ...t, status: 'running' } : t
      ));
      
      const startTime = performance.now();
      
      try {
        await runIndividualTest(test.id);
        const duration = performance.now() - startTime;
        
        setTests(prev => prev.map(t => 
          t.id === test.id ? { 
            ...t, 
            status: 'passed', 
            duration,
            result: getTestResult(test.id, duration)
          } : t
        ));
        
      } catch (error: any) {
        const duration = performance.now() - startTime;
        
        setTests(prev => prev.map(t => 
          t.id === test.id ? { 
            ...t, 
            status: 'failed', 
            duration,
            error: error.message
          } : t
        ));
      }
      
      setProgress(((i + 1) / totalTests) * 100);
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay between tests
    }
    
    setIsRunning(false);
    
    const failedTests = tests.filter(t => t.status === 'failed').length;
    const passedTests = tests.filter(t => t.status === 'passed').length;
    
    toast({
      title: failedTests === 0 ? "All Tests Passed! ✅" : "Diagnostics Complete",
      description: `${passedTests} passed, ${failedTests} failed`,
      variant: failedTests === 0 ? "default" : "destructive"
    });
  };

  const runIndividualTest = async (testId: string): Promise<void> => {
    switch (testId) {
      case 'rpc-connectivity':
        const response = await fetch('https://testnet.megaeth.io', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_blockNumber',
            params: [],
            id: 1
          }),
          signal: AbortSignal.timeout(5000)
        });
        if (!response.ok) throw new Error('RPC endpoint unreachable');
        break;
        
      case 'network-latency':
        const latencyStart = performance.now();
        await fetch('/api/health', { signal: AbortSignal.timeout(3000) });
        const latency = performance.now() - latencyStart;
        if (latency > 2000) throw new Error('High latency detected');
        break;
        
      case 'block-sync':
        if (!provider) throw new Error('Provider not available');
        const blockNumber = await provider.getBlockNumber();
        if (blockNumber === 0) throw new Error('Block synchronization failed');
        break;
        
      case 'contract-access':
        if (!provider) throw new Error('Provider not available');
        const code = await provider.getCode(MEGAETH_TESTNET_CONFIG.contracts.quantumJobLogger);
        if (code === '0x') throw new Error('Contract not found');
        break;
        
      case 'wallet-integration':
        if (!isConnected) throw new Error('Wallet not connected');
        if (!provider) throw new Error('Provider not available');
        const network = await provider.getNetwork();
        if (Number(network.chainId) !== MEGAETH_TESTNET_CONFIG.chainId) {
          throw new Error('Wrong network');
        }
        break;
        
      default:
        throw new Error('Unknown test');
    }
  };

  const getTestResult = (testId: string, duration: number): string => {
    switch (testId) {
      case 'rpc-connectivity':
        return 'RPC endpoint responsive';
      case 'network-latency':
        return `${duration.toFixed(0)}ms response time`;
      case 'block-sync':
        return 'Blockchain synchronized';
      case 'contract-access':
        return 'Contract accessible';
      case 'wallet-integration':
        return 'Wallet properly connected';
      default:
        return 'Test completed';
    }
  };

  const getTestIcon = (test: DiagnosticTest) => {
    switch (test.status) {
      case 'passed': return CheckCircle;
      case 'failed': return AlertTriangle;
      case 'running': return RefreshCw;
      default: return Clock;
    }
  };

  const getTestColor = (test: DiagnosticTest) => {
    switch (test.status) {
      case 'passed': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'running': return 'text-blue-400';
      default: return 'text-muted-foreground';
    }
  };

  const overallStatus = tests.every(t => t.status === 'passed') ? 'healthy' :
                      tests.some(t => t.status === 'failed') ? 'issues' : 'unknown';

  return (
    <Card className="quantum-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Network Diagnostics
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={
              overallStatus === 'healthy' ? "text-green-400 border-green-400/50" :
              overallStatus === 'issues' ? "text-red-400 border-red-400/50" :
              "text-yellow-400 border-yellow-400/50"
            }>
              {overallStatus === 'healthy' ? (
                <>
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Healthy
                </>
              ) : overallStatus === 'issues' ? (
                <>
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Issues Detected
                </>
              ) : (
                <>
                  <Clock className="mr-1 h-3 w-3" />
                  Unknown
                </>
              )}
            </Badge>
            <Button 
              onClick={runDiagnostics} 
              disabled={isRunning}
              size="sm"
              className="quantum-button"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Activity className="mr-2 h-4 w-4" />
                  Run Tests
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        {isRunning && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Running diagnostics...</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Test Results */}
        <div className="space-y-3">
          {tests.map((test, index) => {
            const TestIcon = getTestIcon(test);
            const testColor = getTestColor(test);
            
            return (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-4 rounded-lg bg-muted/10 border border-primary/10 hover:bg-muted/20 transition-colors"
              >
                <TestIcon className={`h-5 w-5 ${testColor} ${test.status === 'running' ? 'animate-spin' : ''}`} />
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{test.name}</span>
                    <Badge variant="outline" className={`text-xs ${testColor} border-current/50`}>
                      {test.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{test.description}</p>
                  
                  {test.result && (
                    <p className="text-xs text-green-400 mt-1">✓ {test.result}</p>
                  )}
                  
                  {test.error && (
                    <p className="text-xs text-red-400 mt-1">✗ {test.error}</p>
                  )}
                  
                  {test.duration && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Completed in {test.duration.toFixed(0)}ms
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t border-primary/20">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm" asChild>
              <a href={MEGAETH_TESTNET_CONFIG.tools.statusUrl} target="_blank" rel="noopener noreferrer">
                <Globe className="mr-2 h-4 w-4" />
                Network Status
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={MEGAETH_TESTNET_CONFIG.tools.docsUrl} target="_blank" rel="noopener noreferrer">
                <Database className="mr-2 h-4 w-4" />
                Documentation
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}