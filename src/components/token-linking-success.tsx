"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ExternalLink, Zap, ArrowRight } from "lucide-react";

interface TokenLinkingSuccessProps {
  address: string;
  onClose: () => void;
  autoRedirect?: boolean;
}

export default function TokenLinkingSuccess({ 
  address, 
  onClose, 
  autoRedirect = true 
}: TokenLinkingSuccessProps) {
  const [countdown, setCountdown] = useState(5);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!autoRedirect) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setIsRedirecting(true);
          handleRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRedirect]);

  const handleRedirect = () => {
    setIsRedirecting(true);
    
    // Open MegaETH testnet interface in new tab
    window.open('https://testnet.megaeth.com/#2', '_blank', 'noopener,noreferrer');
    
    // Close modal after redirect
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleManualRedirect = () => {
    handleRedirect();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md"
        >
          <Card className="quantum-card shadow-2xl border-green-500/30">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mx-auto mb-4 p-4 bg-gradient-to-r from-green-500/20 to-green-600/10 rounded-2xl w-fit"
              >
                <CheckCircle className="h-12 w-12 text-green-400 quantum-pulse" />
              </motion.div>
              
              <CardTitle className="text-2xl font-headline text-green-400 mb-2">
                🎉 MegaETH Tokens Linked!
              </CardTitle>
              
              <div className="space-y-2">
                <Badge variant="outline" className="text-green-400 border-green-400/50">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Successfully Connected
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Your wallet is now connected to the MegaETH network
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Wallet Info */}
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium text-green-200">Connected Wallet</span>
                </div>
                <code className="text-xs font-mono text-green-100 break-all">
                  {address}
                </code>
              </div>

              {/* Redirect Info */}
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <ExternalLink className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-200">Next Steps</span>
                </div>
                <p className="text-xs text-blue-200/80 mb-3">
                  You'll be redirected to the MegaETH testnet interface to complete your token setup.
                </p>
                
                {autoRedirect && countdown > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    <span className="text-xs text-blue-300">
                      Redirecting in {countdown} seconds...
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  onClick={handleManualRedirect}
                  disabled={isRedirecting}
                  className="flex-1 quantum-button"
                >
                  {isRedirecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Redirecting...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Go to MegaETH Interface
                    </>
                  )}
                </Button>
                
                <Button variant="outline" onClick={onClose}>
                  Stay Here
                </Button>
              </div>

              {/* Additional Info */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  You can access the MegaETH interface anytime from your wallet dropdown
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}