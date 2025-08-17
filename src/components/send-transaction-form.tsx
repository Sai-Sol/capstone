"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, Zap, DollarSign, Clock, AlertTriangle, CheckCircle } from "lucide-react";

const formSchema = z.object({
  to: z.string().regex(/^0x[a-fA-F0-9]{40}$/, { message: "Invalid Ethereum address format" }),
  amount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0 && num <= 1000;
  }, { message: "Amount must be between 0 and 1000 ETH" }),
});

export default function SendTransactionForm() {
  const { isConnected, signer, balance, error, clearError } = useWallet();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      to: "",
      amount: "",
    },
  });

  const watchedAmount = form.watch("amount");
  const watchedTo = form.watch("to");

  // Estimate transaction fee
  const estimateFee = async () => {
    if (!watchedTo || !watchedAmount || !isConnected) return;
    
    try {
      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'estimate_fee',
          toAddress: watchedTo,
          txAmount: parseFloat(watchedAmount)
        })
      });
      
      const data = await response.json();
      if (data.estimatedFee) {
        setEstimatedFee(data.estimatedFee.toFixed(6));
      }
    } catch (error) {
      console.error('Fee estimation failed:', error);
    }
  };

  const handleSendTransaction = async (values: z.infer<typeof formSchema>) => {
    if (!signer || !isConnected) {
      toast({
        variant: "destructive",
        title: "Wallet Required",
        description: "Please connect your wallet to send transactions.",
      });
      return;
    }

    const amount = parseFloat(values.amount);
    const currentBalance = parseFloat(balance || "0");
    
    if (amount > currentBalance) {
      toast({
        variant: "destructive",
        title: "Insufficient Balance",
        description: `You need ${amount} ETH but only have ${currentBalance.toFixed(4)} ETH`,
      });
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      // Send transaction directly through ethers
      const tx = await signer.sendTransaction({
        to: values.to,
        value: (amount * 1e18).toString(), // Convert to wei
        gasLimit: 21000
      });

      setTxHash(tx.hash);

      toast({
        title: "Transaction Sent! 🚀",
        description: `Transaction hash: ${tx.hash.slice(0, 10)}...`,
        action: (
          <Button asChild variant="link" size="sm">
            <a href={`https://www.megaexplorer.xyz/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer">
              View on Explorer
            </a>
          </Button>
        ),
      });

      // Wait for confirmation
      await tx.wait();
      
      toast({
        title: "Transaction Confirmed! ✅",
        description: `Successfully sent ${amount} ETH to ${values.to.slice(0, 8)}...`,
      });

      form.reset();
      setEstimatedFee(null);
      setTxHash(null);
    } catch (error: any) {
      console.error('Transaction failed:', error);
      
      let errorMessage = "Transaction failed";
      if (error.code === 4001) {
        errorMessage = "Transaction cancelled by user";
      } else if (error.code === -32603) {
        errorMessage = "Insufficient funds for gas";
      } else if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="quantum-card shadow-2xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Send className="h-7 w-7 text-primary" />
          </div>
          Send ETH Transaction
        </CardTitle>
        <CardDescription className="text-base">
          Send ETH to any address on the MegaETH network
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSendTransaction)} className="space-y-6">
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-base font-medium">
                    <Send className="h-5 w-5 text-primary" />
                    Recipient Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0x1234567890123456789012345678901234567890"
                      className="quantum-input h-12 font-mono"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        estimateFee();
                      }}
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
                  <FormLabel className="flex items-center gap-2 text-base font-medium">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Amount (ETH)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.0001"
                      placeholder="0.1"
                      className="quantum-input h-12"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        estimateFee();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  {balance && (
                    <div className="text-sm text-muted-foreground">
                      Available: {parseFloat(balance).toFixed(4)} ETH
                    </div>
                  )}
                </FormItem>
              )}
            />

            {/* Transaction Summary */}
            {watchedAmount && watchedTo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20"
              >
                <h4 className="font-semibold text-primary mb-3">Transaction Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">{watchedAmount} ETH</span>
                  </div>
                  {estimatedFee && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimated Fee:</span>
                      <span className="font-medium">{estimatedFee} ETH</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-primary/20 pt-2">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-bold text-primary">
                      {(parseFloat(watchedAmount) + parseFloat(estimatedFee || "0")).toFixed(6)} ETH
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !isConnected}
              className="w-full h-14 quantum-button font-semibold text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Sending Transaction...
                </>
              ) : (
                <>
                  <Send className="mr-3 h-5 w-5" />
                  Send ETH
                </>
              )}
            </Button>

            {txHash && (
              <Alert className="border-blue-500/20 bg-blue-500/5">
                <CheckCircle className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-blue-200/80">
                  <div className="font-semibold text-blue-400 mb-1">Transaction Submitted</div>
                  <div className="font-mono text-xs break-all">{txHash}</div>
                </AlertDescription>
              </Alert>
            )}
            {!isConnected && (
              <Alert className="border-yellow-500/20 bg-yellow-500/5">
                <Zap className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-yellow-200/80">
                  Connect your wallet to send transactions.
                </AlertDescription>
              </Alert>
            )}

            {error && isConnected && (
              <Alert className="border-red-500/20 bg-red-500/5">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-200/80">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}