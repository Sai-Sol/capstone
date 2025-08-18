"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { parseEther, formatEther } from "ethers";
import { 
  Send, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  DollarSign,
  Clock,
  Zap
} from "lucide-react";

const formSchema = z.object({
  to: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
    message: "Please enter a valid Ethereum address.",
  }),
  amount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, {
    message: "Please enter a valid amount greater than 0.",
  }),
});

export default function SendTransactionForm() {
  const { provider, signer, address, balance, isConnected } = useWallet();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [estimatedGas, setEstimatedGas] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      to: "",
      amount: "",
    },
  });

  const watchedAmount = form.watch("amount");
  const watchedTo = form.watch("to");

  // Estimate gas when form values change
  React.useEffect(() => {
    const estimateGas = async () => {
      if (!provider || !watchedTo || !watchedAmount || !address) return;
      
      try {
        const gasEstimate = await provider.estimateGas({
          from: address,
          to: watchedTo,
          value: parseEther(watchedAmount),
        });
        
        const feeData = await provider.getFeeData();
        const gasPrice = feeData.gasPrice || 0n;
        const totalGasCost = gasEstimate * gasPrice;
        
        setEstimatedGas(formatEther(totalGasCost));
      } catch (error) {
        setEstimatedGas(null);
      }
    };

    const timeoutId = setTimeout(estimateGas, 500);
    return () => clearTimeout(timeoutId);
  }, [watchedTo, watchedAmount, provider, address]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!signer || !provider) {
      toast({
        variant: "destructive",
        title: "Wallet Error",
        description: "Please connect your wallet first.",
      });
      return;
    }

    setIsLoading(true);
    setTxHash(null);

    try {
      // Validate balance
      const amountWei = parseEther(values.amount);
      const currentBalance = await provider.getBalance(address!);
      
      if (amountWei > currentBalance) {
        throw new Error("Insufficient balance for this transaction.");
      }

      // Estimate gas
      const gasEstimate = await provider.estimateGas({
        from: address,
        to: values.to,
        value: amountWei,
      });

      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice || 0n;
      const totalGasCost = gasEstimate * gasPrice;

      if (amountWei + totalGasCost > currentBalance) {
        throw new Error("Insufficient balance to cover transaction and gas fees.");
      }

      toast({
        title: "Transaction Initiated 🚀",
        description: "Please confirm the transaction in your wallet.",
      });

      // Send transaction
      const tx = await signer.sendTransaction({
        to: values.to,
        value: amountWei,
        gasLimit: gasEstimate,
        gasPrice: gasPrice,
      });

      setTxHash(tx.hash);

      toast({
        title: "Transaction Sent! ⏳",
        description: "Waiting for confirmation...",
        action: (
          <Button asChild variant="link" size="sm">
            <a href={`https://etherscan.io/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer">
              View Transaction
            </a>
          </Button>
        ),
      });

      // Wait for confirmation
      const receipt = await tx.wait();

      if (receipt?.status === 1) {
        toast({
          title: "Transaction Confirmed! ✅",
          description: `Successfully sent ${values.amount} ETH`,
        });
        
        // Reset form
        form.reset();
        setTxHash(null);
        
        // Refresh balance
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error("Transaction failed");
      }

    } catch (error: any) {
      console.error("Transaction error:", error);
      
      let errorMessage = "Transaction failed.";
      
      if (error.code === 4001) {
        errorMessage = "Transaction cancelled by user.";
      } else if (error.code === -32603) {
        errorMessage = "Insufficient funds for gas fees.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        variant: "destructive",
        title: "Transaction Error",
        description: errorMessage,
      });
      
      setTxHash(null);
    } finally {
      setIsLoading(false);
    }
  }

  if (!isConnected) {
    return (
      <Card className="quantum-card">
        <CardContent className="p-6 text-center">
          <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">Connect Your Wallet</h3>
          <p className="text-muted-foreground mb-4">
            Connect your wallet to send transactions
          </p>
          <Button onClick={handleConnect} className="quantum-button">
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="quantum-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Send className="h-5 w-5 text-primary" />
          Send Transaction
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Recipient Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="0x..." 
                      className="quantum-input font-mono"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Amount (ETH)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.000001"
                      placeholder="0.0" 
                      className="quantum-input"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                  {balance && (
                    <p className="text-xs text-muted-foreground">
                      Available: {parseFloat(balance).toFixed(6)} ETH
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Transaction Estimates */}
            {estimatedGas && watchedAmount && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-blue-400" />
                    <span className="text-xs text-blue-200">Gas Fee</span>
                  </div>
                  <p className="text-sm font-bold text-blue-100">
                    ~{parseFloat(estimatedGas).toFixed(6)} ETH
                  </p>
                </div>
                
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-green-200">Total Cost</span>
                  </div>
                  <p className="text-sm font-bold text-green-100">
                    {(parseFloat(watchedAmount) + parseFloat(estimatedGas)).toFixed(6)} ETH
                  </p>
                </div>
              </motion.div>
            )}

            {/* Transaction Status */}
            {txHash && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Alert className="border-green-500/20 bg-green-500/5">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-foreground">
                    <div className="font-semibold text-green-400 mb-1">Transaction Sent!</div>
                    <div className="text-xs font-mono break-all">{txHash}</div>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            <Button 
              type="submit" 
              disabled={isLoading || !isConnected} 
              className="w-full quantum-button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Transaction...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Transaction
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}