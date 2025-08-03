"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Contract } from "ethers";
import { motion, AnimatePresence } from "framer-motion";

import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Terminal, Zap, Clock, DollarSign, Activity, Cpu, Atom, Code, MessageSquare } from "lucide-react";

import { CONTRACT_ADDRESS } from "@/lib/constants";
import { quantumJobLoggerABI } from "@/lib/contracts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Badge } from "./ui/badge";

const formSchema = z.object({
  jobType: z.string().min(1, { message: "Job type cannot be empty." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  submissionType: z.enum(["prompt", "qasm"]),
  priority: z.enum(["low", "medium", "high"]),
  estimatedCost: z.string().optional(),
});

const computerTimeFactors: Record<string, { base: number; factor: number; cost: number; qubits: number }> = {
  "Google Willow": { base: 15, factor: 0.08, cost: 0.0018, qubits: 105 },
  "IBM Condor": { base: 20, factor: 0.12, cost: 0.0015, qubits: 1121 },
  "Amazon Braket": { base: 18, factor: 0.15, cost: 0.0012, qubits: 256 },
};

const priorityMultipliers = {
  low: 1,
  medium: 1.5,
  high: 2.5,
};

const priorityConfig = {
  low: { color: "text-green-400 border-green-400/50", label: "Standard", desc: "Normal queue processing" },
  medium: { color: "text-yellow-400 border-yellow-400/50", label: "Priority", desc: "Faster execution" },
  high: { color: "text-red-400 border-red-400/50", label: "Express", desc: "Immediate processing" },
};

interface JobSubmissionFormProps {
  onJobLogged: () => void;
}

export default function JobSubmissionForm({ onJobLogged }: JobSubmissionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [gasEstimate, setGasEstimate] = useState<string | null>(null);
  const { isConnected, signer, provider } = useWallet();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobType: "Google Willow",
      description: "",
      submissionType: "prompt",
      priority: "medium",
      estimatedCost: "",
    },
  });

  const selectedJobType = form.watch("jobType");
  const descriptionValue = form.watch("description");
  const priority = form.watch("priority");
  const submissionType = form.watch("submissionType");
  
  const { estimatedTime, estimatedCost, qubitCount } = useMemo(() => {
    if (!selectedJobType || !descriptionValue) return { 
      estimatedTime: "5 - 10 seconds", 
      estimatedCost: "0.001 ETH",
      qubitCount: "2-5"
    };
    
    const { base, factor, cost, qubits } = computerTimeFactors[selectedJobType];
    const length = descriptionValue.length;
    const baseTime = base + length * factor;
    const priorityMultiplier = priorityMultipliers[priority];
    
    const timeInSeconds = baseTime / priorityMultiplier;
    const highTimeInSeconds = timeInSeconds * 1.5;
    const totalCost = cost * priorityMultiplier;

    // Estimate qubit usage based on description complexity
    const complexityFactor = Math.min(length / 100, 1);
    const estimatedQubits = Math.ceil(2 + (qubits * 0.1 * complexityFactor));

    const formatDisplayTime = (seconds: number) => {
      if (seconds < 60) return `${Math.round(seconds)} sec`;
      return `${(seconds / 60).toFixed(1)} min`;
    };
    
    const timeRange = highTimeInSeconds < 60 
      ? `${Math.round(timeInSeconds)} - ${Math.round(highTimeInSeconds)} seconds`
      : `${formatDisplayTime(timeInSeconds)} - ${formatDisplayTime(highTimeInSeconds)}`;

    return {
      estimatedTime: timeRange,
      estimatedCost: `${totalCost.toFixed(4)} ETH`,
      qubitCount: `${Math.max(2, estimatedQubits - 2)} - ${estimatedQubits}`
    };
  }, [selectedJobType, descriptionValue, priority]);

  // Estimate gas cost
  const estimateGas = async () => {
    if (!signer || !provider) return;
    
    try {
      const contract = new Contract(CONTRACT_ADDRESS, quantumJobLoggerABI, signer);
      const gasEstimate = await contract.logJob.estimateGas(
        form.getValues().jobType,
        form.getValues().description
      );
      const gasPrice = await provider.getFeeData();
      const totalGasCost = gasEstimate * (gasPrice.gasPrice || BigInt(0));
      setGasEstimate((Number(totalGasCost) / 1e18).toFixed(6));
    } catch (error) {
      console.error("Gas estimation failed:", error);
    }
  };

  const handleLogJob = async (values: z.infer<typeof formSchema>) => {
    if (!signer) {
      toast({
        variant: "destructive",
        title: "Quantum Link Required",
        description: "Please connect your MetaMask wallet to access the quantum network.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const contract = new Contract(CONTRACT_ADDRESS, quantumJobLoggerABI, signer);
      
      const jobMetadata = {
        type: values.jobType,
        description: values.description,
        submissionType: values.submissionType,
        priority: values.priority,
        timestamp: Date.now(),
        estimatedCost: estimatedCost,
        estimatedTime: estimatedTime,
        qubitCount: qubitCount,
      };

      const jobDescription = JSON.stringify(jobMetadata);

      toast({
        title: "Quantum Transaction Initiated 🔮",
        description: "Please confirm the blockchain transaction in your wallet.",
      });

      await estimateGas();

      const tx = await contract.logJob(values.jobType, jobDescription);
      
      toast({
        title: "Quantum Job Submitted ⚡",
        description: "Your job is being processed on the quantum network...",
      });

      await tx.wait();

      toast({
        title: "Success! Quantum Job Logged 🎉",
        description: "Your quantum computation has been securely recorded on the blockchain.",
        action: (
          <Button asChild variant="link" size="sm">
            <a href={`https://www.megaexplorer.xyz/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer">
              View Transaction
            </a>
          </Button>
        ),
      });

      form.reset({
        jobType: values.jobType,
        description: "",
        submissionType: values.submissionType,
        priority: "medium",
      });
      
      onJobLogged();
      
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.reason || error.message || "Quantum tunnel disrupted.";
      toast({
        variant: "destructive",
        title: "Quantum Error",
        description: errorMessage.length > 100 ? `${errorMessage.substring(0, 100)}...` : errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="quantum-card shadow-2xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleLogJob)}>
          <CardHeader className="pb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <CardTitle className="font-headline text-3xl flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Terminal className="h-7 w-7 text-primary" />
                </div>
                Quantum Lab
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Submit quantum algorithms to leading providers and log results immutably on the blockchain
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Provider and Priority Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="jobType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-base font-medium">
                      <Cpu className="h-5 w-5 text-primary" />
                      Quantum Provider
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="quantum-input h-12">
                          <SelectValue placeholder="Select quantum computer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background/95 backdrop-blur-sm border-primary/20">
                        <SelectItem value="Google Willow">
                          <div className="flex items-center gap-3 py-1">
                            <div className="w-3 h-3 bg-blue-500 rounded-full quantum-pulse"></div>
                            <div>
                              <div className="font-medium">Google Willow</div>
                              <div className="text-xs text-muted-foreground">105 qubits • Error correction</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="IBM Condor">
                          <div className="flex items-center gap-3 py-1">
                            <div className="w-3 h-3 bg-indigo-500 rounded-full quantum-pulse"></div>
                            <div>
                              <div className="font-medium">IBM Condor</div>
                              <div className="text-xs text-muted-foreground">1,121 qubits • Enterprise grade</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="Amazon Braket">
                          <div className="flex items-center gap-3 py-1">
                            <div className="w-3 h-3 bg-orange-500 rounded-full quantum-pulse"></div>
                            <div>
                              <div className="font-medium">Amazon Braket</div>
                              <div className="text-xs text-muted-foreground">256 qubits • Multi-provider</div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-base font-medium">
                      <Activity className="h-5 w-5 text-primary" />
                      Execution Priority
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="quantum-input h-12">
                          <SelectValue placeholder="Select priority level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background/95 backdrop-blur-sm border-primary/20">
                        {Object.entries(priorityConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-3 py-1">
                              <Badge variant="outline" className={config.color}>
                                {config.label}
                              </Badge>
                              <div className="text-sm">{config.desc}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Job Input Tabs */}
            <Tabs 
              defaultValue="prompt" 
              onValueChange={(value) => form.setValue('submissionType', value as "prompt" | "qasm")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 bg-muted/30 h-12">
                <TabsTrigger 
                  value="prompt" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Natural Language
                </TabsTrigger>
                <TabsTrigger 
                  value="qasm" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2"
                >
                  <Code className="h-4 w-4" />
                  QASM Code
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="prompt" className="mt-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">Quantum Algorithm Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your quantum computing task (e.g., 'Create a quantum circuit to demonstrate Bell state entanglement using Hadamard and CNOT gates')" 
                          className="quantum-input min-h-[140px] font-mono text-sm resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <div className="text-xs text-muted-foreground mt-2">
                        Tip: Be specific about the quantum algorithm, gates, and expected outcomes for better results.
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="qasm" className="mt-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">QASM Circuit Code</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={`OPENQASM 2.0;
include "qelib1.inc";

qreg q[2];
creg c[2];

h q[0];
cx q[0],q[1];
measure q -> c;`} 
                          className="quantum-input min-h-[140px] font-mono text-sm resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <div className="text-xs text-muted-foreground mt-2">
                        Enter your OpenQASM 2.0 or 3.0 quantum circuit code directly.
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            {/* Real-time Estimates */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-blue-400" />
                  <span className="text-sm font-medium text-blue-200">Execution Time</span>
                </div>
                <p className="text-xl font-bold text-blue-100">{estimatedTime}</p>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-400" />
                  <span className="text-sm font-medium text-green-200">Compute Cost</span>
                </div>
                <p className="text-xl font-bold text-green-100">{estimatedCost}</p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Atom className="h-5 w-5 text-purple-400" />
                  <span className="text-sm font-medium text-purple-200">Qubits Used</span>
                </div>
                <p className="text-xl font-bold text-purple-100">{qubitCount}</p>
              </div>
              
              {gasEstimate && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-pink-400" />
                    <span className="text-sm font-medium text-pink-200">Gas Fee</span>
                  </div>
                  <p className="text-xl font-bold text-pink-100">{gasEstimate} ETH</p>
                </div>
              )}
            </motion.div>

            {/* Provider Info */}
            {selectedJobType && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Cpu className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold text-primary">Provider Details</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Qubits:</span>
                    <div className="font-bold text-primary">{computerTimeFactors[selectedJobType].qubits}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Base Latency:</span>
                    <div className="font-bold text-green-400">{computerTimeFactors[selectedJobType].base}ms</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cost Factor:</span>
                    <div className="font-bold text-yellow-400">{computerTimeFactors[selectedJobType].cost} ETH/job</div>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
          
          <CardFooter className="flex-col items-stretch gap-4 pt-6">
            <Button 
              type="submit" 
              disabled={isLoading || !isConnected} 
              className="w-full h-14 quantum-button font-semibold text-base"
              onClick={() => estimateGas()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" /> 
                  Processing Quantum Transaction...
                </>
              ) : (
                <>
                  <Terminal className="mr-3 h-5 w-5" />
                  Submit to Quantum Network
                </>
              )}
            </Button>

            <AnimatePresence>
              {!isConnected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Alert className="border-yellow-500/20 bg-yellow-500/5">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <AlertTitle className="text-yellow-500">Quantum Link Required</AlertTitle>
                    <AlertDescription className="text-yellow-200/80">
                      Connect your MetaMask wallet to submit quantum jobs to the blockchain network.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}