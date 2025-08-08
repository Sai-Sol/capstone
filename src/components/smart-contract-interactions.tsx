"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { 
  Code, 
  Play, 
  Eye, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Zap,
  Settings
} from "lucide-react";

function getStatusColor(status: string) {
  switch (status) {
    case "active": return "text-green-400 border-green-400/50";
    case "pending": return "text-yellow-400 border-yellow-400/50";
    case "completed": return "text-blue-400 border-blue-400/50";
    default: return "text-gray-400 border-gray-400/50";
  }
}

interface ContractFunction {
  name: string;
  type: "read" | "write";
  inputs: Array<{
    name: string;
    type: string;
    placeholder: string;
  }>;
  description: string;
}

export default function SmartContractInteractions() {
  const { isConnected, address } = useWallet();
  const { toast } = useToast();
  const [contractAddress, setContractAddress] = useState("");
  const [contractABI, setContractABI] = useState("");
  const [selectedFunction, setSelectedFunction] = useState<ContractFunction | null>(null);
  const [functionInputs, setFunctionInputs] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  // Sample contract functions for demonstration
  const sampleFunctions: ContractFunction[] = [
    {
      name: "balanceOf",
      type: "read",
      inputs: [{ name: "account", type: "address", placeholder: "0x..." }],
      description: "Get token balance of an address"
    },
    {
      name: "transfer",
      type: "write",
      inputs: [
        { name: "to", type: "address", placeholder: "0x..." },
        { name: "amount", type: "uint256", placeholder: "1000000000000000000" }
      ],
      description: "Transfer tokens to another address"
    },
    {
      name: "approve",
      type: "write",
      inputs: [
        { name: "spender", type: "address", placeholder: "0x..." },
        { name: "amount", type: "uint256", placeholder: "1000000000000000000" }
      ],
      description: "Approve another address to spend tokens"
    },
    {
      name: "totalSupply",
      type: "read",
      inputs: [],
      description: "Get total token supply"
    }
  ];

  const handleFunctionCall = async () => {
    if (!selectedFunction || !isConnected) {
      toast({
        variant: "destructive",
        title: "Invalid State",
        description: "Please connect wallet and select a function."
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate contract interaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (selectedFunction.type === "read") {
        // Simulate read result
        const mockResults = {
          "balanceOf": "1000000000000000000000",
          "totalSupply": "1000000000000000000000000",
          "name": "Sample Token",
          "symbol": "SMPL"
        };
        setResult(mockResults[selectedFunction.name as keyof typeof mockResults] || "0");
        
        toast({
          title: "Function Called",
          description: `Successfully called ${selectedFunction.name}`
        });
      } else {
        // Simulate write transaction
        const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        setResult(`Transaction Hash: ${txHash}`);
        
        toast({
          title: "Transaction Sent",
          description: "Your transaction has been submitted to the network."
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Function Call Failed",
        description: "Failed to call contract function."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleContract = () => {
    setContractAddress("0xA0b86a33E6441b8435b662f0E2d0B8A0E6F4B2C3");
    setContractABI(`[
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "to", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]`);
    toast({
      title: "Sample Contract Loaded",
      description: "ERC-20 token contract loaded for testing."
    });
  };

  if (!isConnected) {
    return (
      <Alert className="border-yellow-500/20 bg-yellow-500/5">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Please connect your wallet to interact with smart contracts.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contract Setup */}
      <Card className="quantum-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            Smart Contract Setup
          </CardTitle>
          <CardDescription>Configure contract address and ABI for interaction</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Contract Address</Label>
            <div className="flex gap-2">
              <Input
                placeholder="0x..."
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                className="quantum-input flex-1"
              />
              <Button variant="outline" onClick={loadSampleContract}>
                Load Sample
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Contract ABI</Label>
            <Textarea
              placeholder="Paste contract ABI JSON here..."
              value={contractABI}
              onChange={(e) => setContractABI(e.target.value)}
              className="quantum-input min-h-[120px] font-mono text-xs"
            />
          </div>

          {contractAddress && contractABI && (
            <Alert className="border-green-500/20 bg-green-500/5">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Contract configured successfully. You can now interact with its functions.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Function Selection */}
      <Card className="quantum-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Available Functions
          </CardTitle>
          <CardDescription>Select a function to interact with</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {sampleFunctions.map((func, index) => (
              <motion.div
                key={func.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedFunction?.name === func.name
                    ? 'border-primary bg-primary/10'
                    : 'border-muted hover:border-primary/50'
                }`}
                onClick={() => setSelectedFunction(func)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">{func.name}</span>
                    <Badge variant={func.type === 'read' ? 'secondary' : 'default'}>
                      {func.type === 'read' ? <Eye className="mr-1 h-3 w-3" /> : <Zap className="mr-1 h-3 w-3" />}
                      {func.type}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{func.description}</p>
                {func.inputs.length > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Inputs: {func.inputs.map(input => `${input.name} (${input.type})`).join(', ')}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Function Execution */}
      {selectedFunction && (
        <Card className="quantum-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Execute Function: {selectedFunction.name}
            </CardTitle>
            <CardDescription>{selectedFunction.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedFunction.inputs.map((input, index) => (
              <div key={input.name} className="space-y-2">
                <Label>{input.name} ({input.type})</Label>
                <Input
                  placeholder={input.placeholder}
                  value={functionInputs[input.name] || ""}
                  onChange={(e) => setFunctionInputs(prev => ({
                    ...prev,
                    [input.name]: e.target.value
                  }))}
                  className="quantum-input"
                />
              </div>
            ))}

            <Button
              onClick={handleFunctionCall}
              disabled={isLoading}
              className="w-full quantum-button"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {selectedFunction.type === 'read' ? 'Reading...' : 'Executing...'}
                </>
              ) : (
                <>
                  {selectedFunction.type === 'read' ? (
                    <Eye className="mr-2 h-4 w-4" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  {selectedFunction.type === 'read' ? 'Call Function' : 'Send Transaction'}
                </>
              )}
            </Button>

            {result && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-muted/20 to-muted/10 border border-primary/10">
                <h4 className="font-semibold text-primary mb-2">Result:</h4>
                <pre className="text-sm font-mono whitespace-pre-wrap break-all">
                  {result}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="quantum-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common smart contract operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto p-4 flex-col">
              <Eye className="h-6 w-6 mb-2 text-blue-400" />
              <span className="font-semibold">Read Contract</span>
              <span className="text-xs text-muted-foreground">View contract state</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex-col">
              <Zap className="h-6 w-6 mb-2 text-green-400" />
              <span className="font-semibold">Write Contract</span>
              <span className="text-xs text-muted-foreground">Execute transactions</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex-col">
              <Code className="h-6 w-6 mb-2 text-purple-400" />
              <span className="font-semibold">Verify Contract</span>
              <span className="text-xs text-muted-foreground">Verify source code</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex-col">
              <FileText className="h-6 w-6 mb-2 text-yellow-400" />
              <span className="font-semibold">Contract Events</span>
              <span className="text-xs text-muted-foreground">Monitor events</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}