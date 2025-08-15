"use client";

import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AdminDashboard from "@/components/admin-dashboard";
import JobSubmissionForm from "@/components/job-submission-form";
import { Atom, Cpu, Zap, Shield, TrendingUp, Activity, Globe, Lock, Play, BookOpen, Lightbulb, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { useWallet } from "@/hooks/use-wallet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Pickaxe, BarChart3, PlusSquare } from "lucide-react";
import Link from "next/link";

export default function DashboardHomePage() {
  const { user } = useAuth();
  const { isConnected } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [jobsLastUpdated, setJobsLastUpdated] = useState(Date.now());
  const [totalJobs, setTotalJobs] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleJobLogged = () => {
    setJobsLastUpdated(Date.now());
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Atom className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const quantumProviders = [
    { name: "Google Willow", status: "online", qubits: "105", latency: "< 50ms", description: "Error-corrected quantum processor" },
    { name: "IBM Condor", status: "online", qubits: "1,121", latency: "< 100ms", description: "Large-scale quantum system" },
    { name: "Amazon Braket", status: "online", qubits: "256", latency: "< 75ms", description: "Multi-provider quantum cloud" },
  ];

  const systemMetrics = [
    { label: "Network Latency", value: "< 50ms", icon: Zap, color: "text-green-400" },
    { label: "Available Qubits", value: "1,482", icon: Atom, color: "text-blue-400" },
    { label: "Active Jobs", value: totalJobs.toString(), icon: Cpu, color: "text-purple-400" },
    { label: "Success Rate", value: "99.2%", icon: Activity, color: "text-pink-400" },
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden mb-8"
      >
        <Card className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-primary/20">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-4 border-primary/30 shadow-2xl">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                    <Atom size={40} className="animate-pulse"/>
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Welcome back, {user?.name || user?.email}!
                  </h1>
                  <p className="text-lg text-muted-foreground mt-2">
                    Execute quantum algorithms and log results immutably on the blockchain
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    <Badge variant="outline" className="text-green-400 border-green-400/50">
                      <Zap className="mr-2 h-4 w-4" />
                      Platform Online
                    </Badge>
                    <Badge variant="outline" className={isConnected ? "text-blue-400 border-blue-400/50" : "text-yellow-400 border-yellow-400/50"}>
                      <Wallet className="mr-2 h-4 w-4" />
                      {isConnected ? "Wallet Connected" : "Wallet Disconnected"}
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
          <Play className="h-7 w-7 text-primary" />
          Quick Actions
        </h2>
        <div className="grid gap-6 md:grid-cols-2">

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

          <Link href="/dashboard/explorer">
            <Card className="hover:scale-105 transition-all duration-300 cursor-pointer border-blue-500/20 hover:border-blue-500/40">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-blue-500/20 rounded-xl w-fit mx-auto mb-4">
                  <Search className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Blockchain Explorer</h3>
                <p className="text-muted-foreground text-sm">
                  Explore blocks, transactions, and network data
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/wallet">
            <Card className="hover:scale-105 transition-all duration-300 cursor-pointer border-yellow-500/20 hover:border-yellow-500/40">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-yellow-500/20 rounded-xl w-fit mx-auto mb-4">
                  <Wallet className="h-8 w-8 text-yellow-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Wallet Manager</h3>
                <p className="text-muted-foreground text-sm">
                  Manage accounts and send transactions
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/mining">
            <Card className="hover:scale-105 transition-all duration-300 cursor-pointer border-orange-500/20 hover:border-orange-500/40">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-orange-500/20 rounded-xl w-fit mx-auto mb-4">
                  <Pickaxe className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Mining Pool</h3>
                <p className="text-muted-foreground text-sm">
                  Participate in network mining
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/create">
            <Card className="hover:scale-105 transition-all duration-300 cursor-pointer border-green-500/20 hover:border-green-500/40">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-green-500/20 rounded-xl w-fit mx-auto mb-4">
                  <PlusSquare className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Submit Job</h3>
                <p className="text-muted-foreground text-sm">
                  Create and submit quantum computing jobs
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </motion.div>

      {/* Job Submission Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <JobSubmissionForm onJobLogged={handleJobLogged} />
      </motion.div>

      {/* Admin Dashboard */}
      {user?.role === 'admin' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <AdminDashboard totalJobs={totalJobs} />
        </motion.div>
      )}

      {/* Quantum Providers Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold font-headline mb-6 flex items-center gap-3">
          <Cpu className="h-7 w-7 text-primary" />
          Quantum Providers
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {quantumProviders.map((provider, index) => (
            <motion.div
              key={provider.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
            >
              <Card className="hover:scale-105 transition-all duration-300 border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    {provider.name}
                    <div className={`w-3 h-3 rounded-full ${provider.status === 'online' ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{provider.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Qubits</span>
                    <span className="font-bold text-primary">{provider.qubits}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Latency</span>
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
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <h2 className="text-2xl font-bold font-headline mb-6 flex items-center gap-3">
          <TrendingUp className="h-7 w-7 text-primary" />
          System Metrics
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {systemMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
            >
              <Card className="hover:scale-105 transition-all duration-300 border-primary/20">
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
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center gap-3">
              <Shield className="h-7 w-7 text-primary" />
              Blockchain Security Architecture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Atom className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-primary">1. Quantum Execution</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Quantum algorithms are executed on real quantum processors with cryptographic result verification.
                </p>
              </motion.div>
              
              <motion.div 
                className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Lock className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-green-100">2. Blockchain Logging</h3>
                </div>
                <p className="text-sm text-green-200/80">
                  Results are immutably logged on MegaETH blockchain, ensuring tamper-proof verification.
                </p>
              </motion.div>
              
              <motion.div 
                className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Shield className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-purple-100">3. Verification</h3>
                </div>
                <p className="text-sm text-purple-200/80">
                  Users can independently verify computational integrity through blockchain records.
                </p>
              </motion.div>
            </div>

            {/* Key Benefits */}
            <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
              <h4 className="font-semibold text-primary mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Why QuantumChain?
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Immutable quantum computation logging</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Tamper-proof result verification</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Multi-provider quantum access</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Decentralized trust architecture</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}