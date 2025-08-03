"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CONTRACT_ADDRESS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Check, Clipboard, FileText, ExternalLink, Shield, Zap, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function ContractInfo() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    toast({
        title: "Address Copied! 📋",
        description: "Smart contract address copied to clipboard."
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const contractFeatures = [
    { icon: Shield, label: "Immutable Logging", desc: "Tamper-proof quantum job records" },
    { icon: Zap, label: "Sub-ms Latency", desc: "Lightning-fast transaction processing" },
    { icon: Globe, label: "Decentralized", desc: "No single point of failure" },
  ];

  return (
    <div className="space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Blockchain Infrastructure
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore the smart contract powering our quantum-blockchain integration
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="quantum-card shadow-2xl">
          <CardHeader className="pb-6">
            <CardTitle className="font-headline text-3xl flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <FileText className="h-7 w-7 text-primary" />
              </div>
              QuantumJobLogger Contract
            </CardTitle>
            <CardDescription className="text-base">
              The immutable smart contract that securely logs all quantum computations on MegaETH's L2 blockchain.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Contract Address */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
                <Clipboard className="h-5 w-5" />
                Contract Address
              </h3>
              <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-xl border border-primary/20">
                <code className="font-mono text-sm break-all flex-1 text-primary">
                  {CONTRACT_ADDRESS}
                </code>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={copyToClipboard}
                  className="quantum-button shrink-0"
                >
                  {copied ? <Check className="h-4 w-4 text-green-400" /> : <Clipboard className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Network Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-5 w-5 text-blue-400" />
                  <span className="font-medium text-blue-200">Network</span>
                </div>
                <p className="text-lg font-bold text-blue-100">MegaETH Testnet</p>
                <p className="text-xs text-blue-200/80">High-performance L2</p>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-green-400" />
                  <span className="font-medium text-green-200">Latency</span>
                </div>
                <p className="text-lg font-bold text-green-100">< 1ms</p>
                <p className="text-xs text-green-200/80">Sub-millisecond</p>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-purple-400" />
                  <span className="font-medium text-purple-200">Security</span>
                </div>
                <p className="text-lg font-bold text-purple-100">Military</p>
                <p className="text-xs text-purple-200/80">Enterprise grade</p>
              </div>
            </div>

            {/* Contract Features */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-primary">Smart Contract Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {contractFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 hover:scale-105 transition-transform duration-300"
                  >
                    <feature.icon className="h-8 w-8 text-primary mb-3" />
                    <h4 className="font-semibold text-primary mb-2">{feature.label}</h4>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={`https://www.megaexplorer.xyz/address/${CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button className="w-full quantum-button h-12">
                  <ExternalLink className="mr-2 h-5 w-5" />
                  View on MegaETH Explorer
                </Button>
              </a>
              
              <Button 
                variant="outline" 
                className="flex-1 h-12 border-primary/20 hover:bg-primary/10"
                onClick={() => window.open('https://docs.megaeth.io/', '_blank')}
              >
                <FileText className="mr-2 h-5 w-5" />
                Network Documentation
              </Button>
            </div>

            {/* Technical Details */}
            <div className="p-6 rounded-xl bg-gradient-to-r from-muted/20 to-muted/10 border border-primary/10">
              <h4 className="font-semibold text-primary mb-4">Technical Specifications</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contract Type:</span>
                    <span className="font-medium">Quantum Job Logger</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Compiler:</span>
                    <span className="font-medium">Solidity 0.8.19</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gas Optimization:</span>
                    <span className="font-medium text-green-400">Enabled</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Verification:</span>
                    <span className="font-medium text-green-400">Verified</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Audit Status:</span>
                    <span className="font-medium text-green-400">Passed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Upgradeable:</span>
                    <span className="font-medium text-red-400">No (Immutable)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}