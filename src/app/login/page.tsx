"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Atom, Zap, Shield } from "lucide-react";
import { motion } from "framer-motion";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(3, { message: "Password must be at least 3 characters." }),
});

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user) {
      router.replace("/dashboard");
    }
  }, [mounted, user, router]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const user = await login(values);
      if (user) {
        toast({
          title: "Quantum Access Granted 🚀",
          description: `Welcome to the quantum realm, ${user.email}!`,
        });
        router.push("/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Invalid credentials. Please verify your quantum key.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Quantum tunnel disrupted. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-primary/20 animate-ping" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        <Card className="w-full max-w-md quantum-card shadow-2xl">
          <CardHeader className="text-center pb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
              className="mx-auto mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl" />
                <div className="relative bg-gradient-to-br from-primary via-purple-500 to-pink-500 p-4 rounded-2xl shadow-2xl">
                  <Atom className="h-12 w-12 text-white quantum-pulse" />
                </div>
              </div>
            </motion.div>
            
            <CardTitle className="text-4xl font-headline font-bold bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent neon-text">
              QuantumChain
            </CardTitle>
            <CardDescription className="text-base mt-3 text-muted-foreground">
              Secure blockchain-based quantum computing platform
            </CardDescription>
            
            {/* Feature highlights */}
            <div className="flex justify-center gap-4 mt-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="h-4 w-4 text-primary" />
                <span>Sub-ms Latency</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />
                <span>Tamper-Proof</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Demo Credentials Helper */}
                <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/5 to-blue-600/10 border border-blue-500/20">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-blue-400 mb-1">Demo Access</p>
                      <p className="text-xs text-blue-200/80">
                        Admin: admin@example.com / 456 • User: p1@example.com / 123
                      </p>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your quantum access email" 
                          className="quantum-input h-12"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••••••" 
                          className="quantum-input h-12"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full h-12 quantum-button font-semibold text-base" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Establishing Quantum Link...
                    </>
                  ) : (
                    <>
                      <Atom className="mr-2 h-5 w-5" />
                      Access Quantum Network
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* Professional Security Notice */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/5 to-green-600/10 border border-green-500/20">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-400 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-green-400 mb-1">Secure Platform</p>
                  <p className="text-xs text-green-200/80">
                    Bank-grade encryption protects your quantum computing sessions.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}