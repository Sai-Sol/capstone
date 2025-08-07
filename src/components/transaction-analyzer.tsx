"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  RefreshCw
} from "lucide-react";

interface TransactionAnalysis {
  hash: string;
  status: "success" | "failed" | "pending";
  gasUsed: string;
  gasPrice: string;
  value: string;
  timestamp: number;
  riskScore: number;
  insights: string[];
}

export default function TransactionAnalyzer() {
  const { toast } = useToast();
  const [txHash, setTxHash] = useState("");
  const [analysis, setAnalysis] = useState<TransactionAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeTx = async () => {
    if (!txHash.trim()) {
      toast({
        variant: "destructive",
        title: "Input Required",
        description: "Please enter a transaction hash to analyze."
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate analysis
    setTimeout(() => {
      const mockAnalysis: TransactionAnalysis = {
        hash: txHash,
        status: "success",
        gasUsed: "21,000",
        gasPrice: "15.2",
        value: "0.5",
        timestamp: Date.now() - 3600000,
        riskScore: Math.floor(Math.random() * 30) + 10,
        insights: [
          "Gas price was 12% below network average",
          "Transaction confirmed in optimal time",
          "No suspicious patterns detected",
          "Contract interaction appears legitimate"
        ]
      };

      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
      
      toast({
        title: "Analysis Complete",
        description: "Transaction has been analyzed successfully."
      });
    }, 2000);
  };

  const getRiskColor = (score: number) => {
    if (score < 20) return "text-green-400 border-green-400/50";
    if (score < 40) return "text-yellow-400 border-yellow-400/50";
    return "text-red-400 border-red-400/50";
  };

  const getRiskLabel = (score: number) => {
    if (score < 20) return "Low Risk";
    if (score < 40) return "Medium Risk";
    return "High Risk";
  };

  return (
    <div className="space-y-6">
      <Card className="quantum-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Transaction Analyzer
          </CardTitle>
          <CardDescription>Analyze blockchain transactions for insights and risk assessment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Transaction Hash</Label>
            <div className="flex gap-2">
              <Input
                placeholder="0x..."
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                className="quantum-input flex-1"
              />
              <Button
                onClick={analyzeTx}
                disabled={isAnalyzing || !txHash.trim()}
                className="quantum-button"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </div>

          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Transaction Overview */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-muted/20 to-muted/10 border border-primary/10">
                <h4 className="font-semibold text-primary mb-4">Transaction Overview</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={analysis.status === "success" ? "default" : "destructive"}>
                        {analysis.status === "success" && <CheckCircle className="mr-1 h-3 w-3" />}
                        {analysis.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Value:</span>
                      <span className="font-mono">{analysis.value} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gas Used:</span>
                      <span className="font-mono">{analysis.gasUsed}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gas Price:</span>
                      <span className="font-mono">{analysis.gasPrice} Gwei</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Risk Score:</span>
                      <Badge variant="outline" className={getRiskColor(analysis.riskScore)}>
                        {analysis.riskScore}/100
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Risk Level:</span>
                      <span className={getRiskColor(analysis.riskScore).split(' ')[0]}>
                        {getRiskLabel(analysis.riskScore)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              <div className="space-y-4">
                <h4 className="font-semibold text-primary">AI Insights</h4>
                <div className="space-y-2">
                  {analysis.insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-primary/10">
                      <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                      <span className="text-sm">{insight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on Explorer
                </Button>
                <Button variant="outline" className="flex-1">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Detailed Report
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}