"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Code, 
  Decode, 
  FileText, 
  Copy,
  CheckCircle,
  AlertTriangle,
  Zap,
  Hash
} from "lucide-react";

interface DecodedData {
  functionName: string;
  parameters: Array<{
    name: string;
    type: string;
    value: string;
  }>;
  gasUsed: string;
  status: "success" | "failed";
  logs: Array<{
    event: string;
    data: Record<string, any>;
  }>;
}

export default function AdminDecoder() {
  const { toast } = useToast();
  const [inputData, setInputData] = useState("");
  const [inputType, setInputType] = useState("transaction");
  const [decodedData, setDecodedData] = useState<DecodedData | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);

  const sampleTransactions = [
    {
      type: "ERC-20 Transfer",
      hash: "0xa9059cbb000000000000000000000000742d35cc6c6c0532925a3b8d4c5f207e88319b4500000000000000000000000000000000000000000000000de0b6b3a7640000",
      description: "Transfer 1000 tokens to address"
    },
    {
      type: "Uniswap Swap",
      hash: "0x7ff36ab5000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d00000000000000000000000000000000000000000000000000000000628ba7a7",
      description: "Swap ETH for tokens on Uniswap"
    },
    {
      type: "NFT Mint",
      hash: "0x40c10f19000000000000000000000000742d35cc6c6c0532925a3b8d4c5f207e88319b450000000000000000000000000000000000000000000000000000000000000001",
      description: "Mint NFT to address"
    }
  ];

  const decodeData = async () => {
    if (!inputData.trim()) {
      toast({
        variant: "destructive",
        title: "Input Required",
        description: "Please enter transaction data to decode."
      });
      return;
    }

    setIsDecoding(true);

    // Simulate decoding process
    setTimeout(() => {
      // Mock decoded data based on input
      const mockDecoded: DecodedData = {
        functionName: inputData.startsWith("0xa9059cbb") ? "transfer" : 
                     inputData.startsWith("0x7ff36ab5") ? "swapExactETHForTokens" :
                     inputData.startsWith("0x40c10f19") ? "mint" : "unknownFunction",
        parameters: inputData.startsWith("0xa9059cbb") ? [
          { name: "to", type: "address", value: "0x742d35cc6c6c0532925a3b8d4c5f207e88319b45" },
          { name: "amount", type: "uint256", value: "1000000000000000000000" }
        ] : inputData.startsWith("0x7ff36ab5") ? [
          { name: "amountOutMin", type: "uint256", value: "0" },
          { name: "path", type: "address[]", value: "[0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2]" },
          { name: "to", type: "address", value: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D" },
          { name: "deadline", type: "uint256", value: "1650000000" }
        ] : [
          { name: "to", type: "address", value: "0x742d35cc6c6c0532925a3b8d4c5f207e88319b45" },
          { name: "tokenId", type: "uint256", value: "1" }
        ],
        gasUsed: "21000",
        status: "success",
        logs: [
          {
            event: "Transfer",
            data: {
              from: "0x0000000000000000000000000000000000000000",
              to: "0x742d35cc6c6c0532925a3b8d4c5f207e88319b45",
              value: "1000000000000000000000"
            }
          }
        ]
      };

      setDecodedData(mockDecoded);
      setIsDecoding(false);
      
      toast({
        title: "Data Decoded Successfully",
        description: "Transaction data has been parsed and decoded."
      });
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Data has been copied to your clipboard."
    });
  };

  const loadSample = (sampleHash: string) => {
    setInputData(sampleHash);
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Blockchain Data Decoder
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Advanced tool for decoding blockchain transaction data into human-readable format
        </p>
        <Badge variant="destructive" className="mt-4">
          Admin Only
        </Badge>
      </motion.div>

      {/* Input Section */}
      <Card className="quantum-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            Data Input
          </CardTitle>
          <CardDescription>Enter blockchain data to decode</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Data Type</Label>
            <Select value={inputType} onValueChange={setInputType}>
              <SelectTrigger className="quantum-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transaction">Transaction Data</SelectItem>
                <SelectItem value="event">Event Log</SelectItem>
                <SelectItem value="calldata">Function Call Data</SelectItem>
                <SelectItem value="bytecode">Contract Bytecode</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Raw Data</Label>
            <Textarea
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="0x..."
              className="quantum-input min-h-[120px] font-mono text-sm"
            />
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={decodeData}
              disabled={isDecoding || !inputData.trim()}
              className="quantum-button flex-1"
            >
              {isDecoding ? (
                <>
                  <Decode className="mr-2 h-4 w-4 animate-spin" />
                  Decoding...
                </>
              ) : (
                <>
                  <Decode className="mr-2 h-4 w-4" />
                  Decode Data
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setInputData("")}>
              Clear
            </Button>
          </div>

          {/* Sample Data */}
          <div className="space-y-3">
            <Label>Sample Data</Label>
            <div className="grid gap-2">
              {sampleTransactions.map((sample, index) => (
                <div key={index} className="p-3 rounded-lg bg-muted/20 border border-primary/10">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{sample.type}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => loadSample(sample.hash)}
                    >
                      Load Sample
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{sample.description}</p>
                  <p className="text-xs font-mono text-muted-foreground mt-1">
                    {sample.hash.substring(0, 50)}...
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Decoded Output */}
      {decodedData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Decoded Output
              </CardTitle>
              <CardDescription>Human-readable interpretation of blockchain data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Function Information */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-primary">Function Call</h4>
                  <Badge variant={decodedData.status === "success" ? "default" : "destructive"}>
                    {decodedData.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Function:</span>
                    <code className="font-mono text-sm bg-muted/30 px-2 py-1 rounded">
                      {decodedData.functionName}()
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(decodedData.functionName)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Gas Used:</span>
                    <span className="font-mono text-sm">{decodedData.gasUsed}</span>
                  </div>
                </div>
              </div>

              {/* Parameters */}
              <div className="space-y-4">
                <h4 className="font-semibold text-primary flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Parameters
                </h4>
                <div className="space-y-3">
                  {decodedData.parameters.map((param, index) => (
                    <div key={index} className="p-3 rounded-lg bg-muted/20 border border-primary/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{param.name}</span>
                          <Badge variant="outline">{param.type}</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(param.value)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <code className="text-sm font-mono break-all">{param.value}</code>
                      
                      {/* Value interpretation */}
                      {param.type === "uint256" && param.value.length > 10 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <span>Decimal: </span>
                          <span className="font-mono">
                            {(parseInt(param.value) / 1e18).toFixed(4)} (assuming 18 decimals)
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Event Logs */}
              {decodedData.logs.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-primary flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Event Logs
                  </h4>
                  <div className="space-y-3">
                    {decodedData.logs.map((log, index) => (
                      <div key={index} className="p-3 rounded-lg bg-muted/20 border border-primary/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{log.event}</Badge>
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        </div>
                        <div className="space-y-1">
                          {Object.entries(log.data).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{key}:</span>
                              <code className="font-mono">{value}</code>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Export Options */}
              <div className="flex gap-4 pt-4 border-t border-primary/20">
                <Button variant="outline" className="flex-1">
                  <FileText className="mr-2 h-4 w-4" />
                  Export as JSON
                </Button>
                <Button variant="outline" className="flex-1">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Help Section */}
      <Card className="quantum-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Usage Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <Alert className="border-blue-500/20 bg-blue-500/5">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Security Notice:</strong> This tool is for administrative use only. 
                Never decode sensitive data in untrusted environments.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h5 className="font-semibold mb-2">Supported Data Types:</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Transaction input data</li>
                  <li>• Event logs and topics</li>
                  <li>• Function call data</li>
                  <li>• Contract bytecode</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold mb-2">Features:</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• ABI-based decoding</li>
                  <li>• Parameter type inference</li>
                  <li>• Value interpretation</li>
                  <li>• Export capabilities</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}