"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Atom,
  Cpu,
  Zap,
  Clock,
  DollarSign,
  Activity,
  Code,
  MessageSquare,
  Lightbulb,
  Loader2,
  Terminal,
  AlertTriangle,
  Rocket,
  Package,
  CheckCircle
} from "lucide-react";
import QuantumResultsDisplay from "@/components/quantum-results-display";
import { JobTemplatesManager } from "@/components/job-templates-manager";
import { CircuitOptimizerAnalyzer } from "@/components/circuit-optimizer-analyzer";
import { BatchScheduler } from "@/components/batch-scheduler";
import Link from "next/link";

const formSchema = z.object({
  jobType: z.string().min(1, { message: "Please select a quantum provider." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  submissionType: z.enum(["prompt", "qasm", "preset"]),
  priority: z.enum(["low", "medium", "high"]),
});

const quantumProviders = [
  {
    id: "Google Willow",
    name: "Google Willow",
    qubits: 105,
    description: "Error-corrected quantum processor",
    icon: "🔵",
    latency: "< 50ms"
  },
  {
    id: "IBM Condor",
    name: "IBM Condor",
    qubits: 1121,
    description: "Large-scale quantum system",
    icon: "🔷",
    latency: "< 100ms"
  },
  {
    id: "Amazon Braket",
    name: "Amazon Braket",
    qubits: 256,
    description: "Multi-provider quantum cloud",
    icon: "🟠",
    latency: "< 75ms"
  },
];

interface PresetAlgorithm {
  id: string;
  name: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  qubits: number;
  icon: string;
  explanation: string;
  qasm: string;
}

const presetAlgorithms: PresetAlgorithm[] = [
  {
    id: "bell-state",
    name: "Bell State Creation",
    description: "Create quantum entanglement between two qubits!",
    difficulty: "Beginner",
    qubits: 2,
    icon: "🔗",
    explanation: "Bell states are fundamental for quantum information and quantum teleportation.",
    qasm: `OPENQASM 2.0;
include "qelib1.inc";
qreg q[2];
creg c[2];
h q[0];
cx q[0],q[1];
measure q -> c;`
  },
  {
    id: "quantum-random",
    name: "Quantum Random Number",
    description: "Generate truly random numbers using quantum mechanics!",
    difficulty: "Beginner",
    qubits: 4,
    icon: "🎲",
    explanation: "Unlike computer randomness, these numbers are truly unpredictable from the universe itself.",
    qasm: `OPENQASM 2.0;
include "qelib1.inc";
qreg q[4];
creg c[4];
h q[0];
h q[1];
h q[2];
h q[3];
measure q -> c;`
  },
  {
    id: "deutsch-jozsa",
    name: "Deutsch-Jozsa Algorithm",
    description: "Determine if a function is constant or balanced in one query!",
    difficulty: "Intermediate",
    qubits: 3,
    icon: "🎯",
    explanation: "A quantum algorithm that solves a problem exponentially faster than classical computers.",
    qasm: `OPENQASM 2.0;
include "qelib1.inc";
qreg q[3];
creg c[2];
x q[2];
h q[0];
h q[1];
h q[2];
cx q[0],q[2];
cx q[1],q[2];
h q[0];
h q[1];
measure q[0] -> c[0];
measure q[1] -> c[1];`
  },
  {
    id: "quantum-phase",
    name: "Quantum Phase Estimation",
    description: "Estimate eigenvalues - core of many quantum algorithms!",
    difficulty: "Advanced",
    qubits: 4,
    icon: "📐",
    explanation: "Foundation for quantum chemistry and optimization algorithms.",
    qasm: `OPENQASM 2.0;
include "qelib1.inc";
qreg q[4];
creg c[3];
h q[0];
h q[1];
h q[2];
x q[3];
cp(pi/4) q[0],q[3];
cp(pi/2) q[1],q[3];
cp(pi) q[2],q[3];
swap q[0],q[2];
h q[2];
cp(-pi/2) q[1],q[2];
h q[1];
cp(-pi/4) q[0],q[1];
h q[0];
measure q[0] -> c[0];
measure q[1] -> c[1];
measure q[2] -> c[2];`
  }
];

export default function CreatePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [savedTemplates, setSavedTemplates] = useState<any[]>([]);
  const { isConnected, address } = useWallet();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobType: "",
      description: "",
      submissionType: "preset",
      priority: "medium",
    },
  });

  const selectedJobType = form.watch("jobType");
  const descriptionValue = form.watch("description");
  const priority = form.watch("priority");

  const handlePresetSelect = (presetId: string) => {
    const preset = presetAlgorithms.find(p => p.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      form.setValue("description", preset.qasm);
      form.setValue("submissionType", "qasm");
      form.setValue("jobType", "Google Willow");
    }
  };

  const handleTemplateSelect = (template: any) => {
    form.setValue("jobType", template.jobType);
    form.setValue("description", template.algorithm);
    form.setValue("submissionType", "qasm");
    form.setValue("priority", template.priority);
    setSelectedPreset(null);
    toast({
      title: "Template Loaded",
      description: `Loaded "${template.name}" template successfully`,
    });
  };

  const handleSaveTemplate = (name: string, description: string, formData: any) => {
    setSavedTemplates([...savedTemplates, { name, description, ...formData }]);
    toast({
      title: "Template Saved",
      description: `"${name}" saved as a reusable template`,
    });
  };

  const handleBatchSubmit = async (batchJobs: any[]) => {
    toast({
      title: "Batch Submitted",
      description: `${batchJobs.length} quantum jobs queued for execution`,
    });
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!isConnected) {
      toast({
        variant: "destructive",
        title: "Wallet Required",
        description: "Please connect your wallet to submit quantum jobs.",
      });
      return;
    }

    setIsLoading(true);
    setSubmissionSuccess(false);

    try {
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const response = await fetch('/api/submit-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          jobType: values.jobType,
          description: values.description,
          provider: values.jobType,
          priority: values.priority,
          submissionType: values.submissionType,
          userId: address || "unknown",
          timestamp: Date.now(),
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const jobData = await response.json();

      setCurrentJobId(jobData.jobId || jobId);
      setSubmissionSuccess(true);

      toast({
        title: "Success! 🎉",
        description: "Your quantum job has been submitted successfully.",
      });

      form.reset({
        jobType: "",
        description: "",
        submissionType: "preset",
        priority: "medium",
      });
      setSelectedPreset(null);

      setTimeout(() => setSubmissionSuccess(false), 5000);

    } catch (error: any) {
      console.error('Job submission error:', error);

      let errorMessage = "Job submission failed. Please try again.";
      if (error.message) {
        errorMessage = error.message;
      }

      toast({
        variant: "destructive",
        title: "Submission Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Quantum Computing Studio
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Create and execute quantum algorithms on real quantum computers
        </p>
      </motion.div>

      {/* Main Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="quantum-card shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-purple-500/5">
            <CardTitle className="text-2xl flex items-center gap-3">
              <Rocket className="h-6 w-6 text-primary" />
              Create Quantum Job
            </CardTitle>
            <CardDescription>
              Choose your quantum provider and algorithm to execute
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            {submissionSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="font-semibold text-green-300">Job Submitted Successfully!</p>
                    <p className="text-sm text-green-200">Job ID: {currentJobId}</p>
                  </div>
                </div>
              </motion.div>
            )}

            <Tabs defaultValue="form" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="form">Create</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="presets">Presets</TabsTrigger>
              </TabsList>

              {/* Create Tab */}
              <TabsContent value="form" className="space-y-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    {/* Provider Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {quantumProviders.map((provider) => (
                        <motion.div
                          key={provider.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div
                            onClick={() => form.setValue("jobType", provider.id)}
                            className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                              selectedJobType === provider.id
                                ? "border-primary bg-primary/5"
                                : "border-muted bg-muted/30 hover:border-primary/50"
                            }`}
                          >
                            <div className="text-3xl mb-2">{provider.icon}</div>
                            <h3 className="font-semibold text-foreground">{provider.name}</h3>
                            <p className="text-xs text-muted-foreground mb-2">{provider.description}</p>
                            <div className="flex gap-2 text-xs">
                              <Badge variant="outline">{provider.qubits} Qubits</Badge>
                              <Badge variant="outline">{provider.latency}</Badge>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Priority */}
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Priority Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low - Standard queue</SelectItem>
                              <SelectItem value="medium">Medium - Recommended</SelectItem>
                              <SelectItem value="high">High - Priority execution</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Algorithm Description */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            Quantum Algorithm (QASM)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter your QASM code or paste a quantum circuit..."
                              className="font-mono text-sm min-h-48"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isLoading || !selectedJobType}
                      className="w-full h-12 text-base"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Rocket className="mr-2 h-5 w-5" />
                          Submit Quantum Job
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              {/* Templates Tab */}
              <TabsContent value="templates">
                <JobTemplatesManager
                  savedTemplates={savedTemplates}
                  onSelectTemplate={handleTemplateSelect}
                  onSaveTemplate={handleSaveTemplate}
                />
              </TabsContent>

              {/* Presets Tab */}
              <TabsContent value="presets" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {presetAlgorithms.map((preset) => (
                    <motion.div
                      key={preset.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -5 }}
                    >
                      <Card className="quantum-card h-full cursor-pointer hover:border-primary/50 transition-all"
                        onClick={() => handlePresetSelect(preset.id)}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="text-3xl">{preset.icon}</div>
                            <Badge variant={
                              preset.difficulty === "Beginner" ? "outline" :
                              preset.difficulty === "Intermediate" ? "secondary" :
                              "default"
                            }>
                              {preset.difficulty}
                            </Badge>
                          </div>
                          <CardTitle className="mt-3">{preset.name}</CardTitle>
                          <CardDescription>{preset.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground">{preset.explanation}</p>
                          <Badge variant="outline">{preset.qubits} Qubits Required</Badge>
                          <Button className="w-full" onClick={() => handlePresetSelect(preset.id)}>
                            <Zap className="mr-2 h-4 w-4" />
                            Use This Preset
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Additional Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <CircuitOptimizerAnalyzer />
        <BatchScheduler onBatchSubmit={handleBatchSubmit} />
      </motion.div>

      {currentJobId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-400" />
                Job Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QuantumResultsDisplay jobId={currentJobId} />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
