"use client";

import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AdminDashboard from "@/components/admin-dashboard";
import { Atom, Cpu, Zap, Shield, TrendingUp, Activity, Globe, Lock, Play, BookOpen, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { useWallet } from "@/hooks/use-wallet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import QuickStartGuide from "@/components/quick-start-guide";
import Link from "next/link";

export default function DashboardHomePage() {
  const { user } = useAuth();
  const { isConnected } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Atom className="h-12 w-12 text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const quantumProviders = [
    { name: "Quantum Simulator", status: "online", qubits: "20", latency: "< 1ms", description: "Educational quantum simulator" },
    { name: "Circuit Builder", status: "online", qubits: "8", latency: "< 1ms", description: "Interactive circuit design" },
    { name: "Algorithm Library", status: "online", qubits: "12", latency: "< 1ms", description: "Pre-built quantum algorithms" },
  ];

  const systemMetrics = [
    { label: "Simulation Speed", value: "< 1ms", icon: Zap, color: "text-green-400" },
    { label: "Available Qubits", value: "20", icon: Atom, color: "text-blue-400" },
    { label: "Algorithms", value: "15+", icon: Cpu, color: "text-purple-400" },
    { label: "Success Rate", value: "99.9%", icon: Activity, color: "text-pink-400" },
  ];

  return (
    <div className="space-y-8 p-6">
      <QuickStartGuide />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden mb-8"
      >
        <Card className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-blue-500/20">
          <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-blue-500/30 shadow-2xl">
                <AvatarFallback className="bg-gradient-to-br from-blue-500/20 to-blue-500/10 text-blue-500">
                  <Atom size={40} className="animate-pulse"/>
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-500 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Welcome back, {user?.name || user?.email}!
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                  Learn quantum computing through interactive simulations and experiments
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <Badge variant="outline" className="text-green-400 border-green-400/50">
                    <Zap className="mr-2 h-4 w-4" />
                    Platform Online
                  </Badge>
                  <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                    <Atom className="mr-2 h-4 w-4" />
                    Quantum Ready
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Play className="h-7 w-7 text-blue-500" />
          Quick Start
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Link href="/dashboard/lab">
            <Card className="hover:scale-105 transition-all duration-300 cursor-pointer border-blue-500/20 hover:border-blue-500/40">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-blue-500/20 rounded-xl w-fit mx-auto mb-4">
                  <Atom className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Quantum Lab</h3>
                <p className="text-muted-foreground text-sm">
                  Run quantum algorithms and see real-time results
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/blockchain">
            <Card className="hover:scale-105 transition-all duration-300 cursor-pointer border-purple-500/20 hover:border-purple-500/40">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-purple-500/20 rounded-xl w-fit mx-auto mb-4">
                  <Wallet className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Blockchain Hub</h3>
                <p className="text-muted-foreground text-sm">
                  Monitor network and manage transactions
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/history">
            <Card className="hover:scale-105 transition-all duration-300 cursor-pointer border-green-500/20 hover:border-green-500/40">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-green-500/20 rounded-xl w-fit mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Job History</h3>
                <p className="text-muted-foreground text-sm">
                  View your quantum computation history
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </motion.div>

      {/* Admin Dashboard */}
      {user?.role === 'admin' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <AdminDashboard totalJobs={0} />
        </motion.div>
      )}

      {/* Quantum Providers Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold font-headline mb-6 flex items-center gap-3">
          <Cpu className="h-7 w-7 text-primary" />
          Learning Modules
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {quantumProviders.map((provider, index) => (
            <motion.div
              key={provider.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
            >
              <Card className="hover:scale-105 transition-all duration-300 border-blue-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    {provider.name}
                    <div className={`w-3 h-3 rounded-full ${provider.status === 'online' ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{provider.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Max Qubits</span>
                    <span className="font-bold text-blue-500">{provider.qubits}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Response</span>
                    <span className="font-bold text-green-400">{provider.latency}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant="outline" className="text-green-400 border-green-400/50 capitalize">
                      {provider.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* System Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold font-headline mb-6 flex items-center gap-3">
          <TrendingUp className="h-7 w-7 text-primary" />
          Platform Stats
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {systemMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
            >
              <Card className="hover:scale-105 transition-all duration-300 border-blue-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                      <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                    </div>
                    <metric.icon className={`h-8 w-8 ${metric.color} animate-pulse`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Architecture Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card className="border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center gap-3">
              <BookOpen className="h-7 w-7 text-blue-500" />
              How Quantum Computing Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Atom className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-blue-100">1. Qubits & States</h3>
                </div>
                <p className="text-sm text-blue-200/80">
                  Quantum bits can exist in superposition, allowing them to be both 0 and 1 simultaneously, enabling parallel computation.
                </p>
              </motion.div>
              
              <motion.div 
                className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Activity className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-green-100">2. Quantum Gates</h3>
                </div>
                <p className="text-sm text-green-200/80">
                  Quantum gates manipulate qubit states, creating complex quantum circuits that perform calculations impossible for classical computers.
                </p>
              </motion.div>
              
              <motion.div 
                className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-purple-100">3. Measurement</h3>
                </div>
                <p className="text-sm text-purple-200/80">
                  When measured, quantum states collapse to classical values, revealing the results of quantum computations.
                </p>
              </motion.div>
            </div>

            {/* Key Benefits */}
            <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-blue-500/5 to-blue-500/10 border border-blue-500/20">
              <h4 className="font-semibold text-primary mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Why Learn Quantum Computing?
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span>Exponential speedup for certain problems</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span>Revolutionary applications in cryptography</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span>Drug discovery and optimization breakthroughs</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span>Future of computing and artificial intelligence</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}