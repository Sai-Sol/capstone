"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Wallet, 
  Download, 
  CheckCircle, 
  AlertTriangle,
  ExternalLink,
  Shield,
  Zap,
  Globe
} from "lucide-react";
import { SUPPORTED_WALLETS, detectWallets, type WalletProvider } from "@/lib/wallet-providers";
import { useToast } from "@/hooks/use-toast";

interface WalletSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletSelect: (wallet: WalletProvider) => Promise<void>;
  isConnecting: boolean;
  selectedWallet: string | null;
}

export default function WalletSelectionModal({
  isOpen,
  onClose,
  onWalletSelect,
  isConnecting,
  selectedWallet
}: WalletSelectionModalProps) {
  const { toast } = useToast();
  const { installed, notInstalled } = detectWallets();

  const handleWalletClick = async (wallet: WalletProvider) => {
    if (!wallet.isInstalled()) {
      toast({
        variant: "destructive",
        title: "Wallet Not Installed",
        description: `${wallet.name} is not installed. Please install it first.`,
        action: (
          <Button asChild variant="link" size="sm">
            <a href={wallet.downloadUrl} target="_blank" rel="noopener noreferrer">
              Download
            </a>
          </Button>
        ),
      });
      return;
    }

    // Directly connect without confirmation modal
    try {
      await onWalletSelect(wallet);
      onClose();
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-sm border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            Link MegaETH Tokens
          </DialogTitle>
          <DialogDescription className="text-base">
            Choose your preferred wallet to link MegaETH tokens for quantum computing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* MegaETH Network Info */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-primary">🚀 MegaETH Token Network</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Chain ID:</span>
                <div className="font-mono font-bold text-primary">9000</div>
              </div>
              <div>
                <span className="text-muted-foreground">Block Time:</span>
                <div className="font-mono font-bold text-green-400">~2s</div>
              </div>
              <div>
                <span className="text-muted-foreground">Max TPS:</span>
                <div className="font-mono font-bold text-blue-400">100k+</div>
              </div>
              <div>
                <span className="text-muted-foreground">Gas Fees:</span>
                <div className="font-mono font-bold text-purple-400">Ultra Low</div>
              </div>
            </div>
          </div>

          {/* Installed Wallets */}
          {installed.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                Available Wallets
              </h3>
              <div className="grid gap-3">
                {installed.map((wallet) => (
                  <motion.div
                    key={wallet.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                        selectedWallet === wallet.id 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleWalletClick(wallet)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="text-3xl">{wallet.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-lg">{wallet.name}</h4>
                              <Badge variant="outline" className="text-green-400 border-green-400/50">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Installed
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{wallet.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {isConnecting && selectedWallet === wallet.id ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                                <span className="text-sm text-primary">Linking...</span>
                              </div>
                            ) : (
                              <Button variant="outline" size="sm">
                                Link Now
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Not Installed Wallets */}
          {notInstalled.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Download className="h-5 w-5 text-yellow-400" />
                Install Additional Wallets
              </h3>
              <div className="grid gap-3">
                {notInstalled.map((wallet) => (
                  <motion.div
                    key={wallet.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="border-dashed border-2 border-muted-foreground/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="text-3xl opacity-50">{wallet.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-lg text-muted-foreground">{wallet.name}</h4>
                              <Badge variant="outline" className="text-yellow-400 border-yellow-400/50">
                                <Download className="mr-1 h-3 w-3" />
                                Not Installed
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{wallet.description}</p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={wallet.downloadUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="mr-2 h-4 w-4" />
                              Install
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* No Wallets Available */}
          {installed.length === 0 && (
            <Alert className="border-yellow-500/20 bg-yellow-500/5">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold text-yellow-400 mb-2">No Wallets Detected</div>
                <p className="text-yellow-200/80 mb-3">
                  You need a Web3 wallet to interact with the MegaETH blockchain. 
                  Please install one of the supported wallets above.
                </p>
                <div className="flex items-center gap-2 text-xs text-yellow-300/60">
                  <Shield className="h-3 w-3" />
                  <div className="font-mono font-bold text-purple-400">Minimal MegaETH</div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Security Notice */}
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-200">🛡️ Security Notice</span>
            </div>
            <p className="text-xs text-blue-200/80">
              Your wallet connection is secured with enterprise-grade encryption. 
              QuantumChain never stores your private keys or seed phrases.
            </p>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}