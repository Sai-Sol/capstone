"use client";

import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AdminDashboard from "@/components/admin-dashboard";
import { Atom, Cpu, Zap, Shield, TrendingUp, Activity, Globe, Users, Briefcase, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { useWallet } from "@/hooks/use-wallet";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function DashboardHomePage() {
  const { user } = useAuth();
  const { isConnected } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [totalJobs, setTotalJobs] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const systemMetrics = [
    { label: "Network Latency", value: "< 50ms", icon: Zap, color: "text-green-400" },
    { label: "Available Qubits", value: "1,482", icon: Atom, color: "text-blue-400" },
    { label: "Active Jobs", value: totalJobs.toString(), icon: Cpu, color: "text-purple-400" },
    { label: "Success Rate", value: "99.2%", icon: Activity, color: "text-pink-400" },
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Enhanced Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        {/* Hero Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 rounded-3xl blur-3xl -z-10" />

        <div className="flex items-center justify-center gap-6 mb-8 relative">
          {/* Animated Avatar */}
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-full blur-xl animate-pulse" />
            <Avatar className="h-20 w-20 border-4 border-white/20 shadow-2xl bg-gradient-to-br from-primary to-purple-500">
              <AvatarFallback className="bg-gradient-to-br from-primary/30 to-purple-500/30 text-white">
                <Atom size={40} className="animate-pulse"/>
              </AvatarFallback>
            </Avatar>

            {/* Floating particles around avatar */}
            <div className="absolute -top-2 -right-2 w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDuration: '2s' }} />
            <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDuration: '1.5s', animationDelay: '0.5s' }} />
            <div className="absolute top-1/2 -left-4 w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '1s' }} />
          </motion.div>

          <div className="text-left">
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-white via-primary to-purple-400 bg-clip-text text-transparent drop-shadow-2xl mb-2">
              Welcome back, {user?.name || user?.email}!
            </h1>
            <p className="text-xl text-foreground/90 font-medium">
              <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                Ready to explore quantum computing on the blockchain
              </span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-all duration-300" />
            <Badge className="relative text-green-400 border-green-400/50 px-6 py-2 bg-green-500/10 backdrop-blur-sm border-l-4 border-green-400 shadow-lg">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <Zap className="h-4 w-4" />
                <span className="font-semibold">Platform Online</span>
              </div>
            </Badge>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-all duration-300" />
            <Badge className={`relative px-6 py-2 backdrop-blur-sm border-l-4 shadow-lg ${
              isConnected
                ? "text-blue-400 border-blue-400/50 bg-blue-500/10"
                : "text-yellow-400 border-yellow-400/50 bg-yellow-500/10"
            }`}>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="font-medium">
                  {isConnected ? "Connected to MegaETH" : "Wallet Disconnected"}
                </span>
              </div>
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-foreground">
          <Zap className="h-7 w-7 text-primary" />
          Quick Actions
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/create">
            <Card className="hover:scale-105 transition-all duration-300 cursor-pointer border-green-500/20 hover:border-green-500/40 h-full">
              <CardContent className="p-6 text-center">
                <div className="p-4 bg-green-500/20 rounded-xl w-fit mx-auto mb-4">
                  <Atom className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Create Job</h3>
                <p className="text-muted-foreground text-sm">
                  Submit quantum algorithms for execution
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/results">
            <Card className="hover:scale-105 transition-all duration-300 cursor-pointer border-blue-500/20 hover:border-blue-500/40 h-full">
              <CardContent className="p-6 text-center">
                <div className="p-4 bg-blue-500/20 rounded-xl w-fit mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">View Results</h3>
                <p className="text-muted-foreground text-sm">
                  Analyze your quantum execution results
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/blockchain">
            <Card className="hover:scale-105 transition-all duration-300 cursor-pointer border-purple-500/20 hover:border-purple-500/40 h-full">
              <CardContent className="p-6 text-center">
                <div className="p-4 bg-purple-500/20 rounded-xl w-fit mx-auto mb-4">
                  <Globe className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Blockchain Hub</h3>
                <p className="text-muted-foreground text-sm">
                  Monitor network and transactions
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/history">
            <Card className="hover:scale-105 transition-all duration-300 cursor-pointer border-orange-500/20 hover:border-orange-500/40 h-full">
              <CardContent className="p-6 text-center">
                <div className="p-4 bg-orange-500/20 rounded-xl w-fit mx-auto mb-4">
                  <Activity className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Job History</h3>
                <p className="text-muted-foreground text-sm">
                  Track your quantum experiments
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
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <AdminDashboard totalJobs={totalJobs} />
        </motion.div>
      )}

      {/* System Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
      >
        <h2 className="text-2xl font-bold font-headline mb-6 flex items-center gap-3 text-foreground">
          <TrendingUp className="h-7 w-7 text-primary" />
          Platform Status
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {systemMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
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

      {/* About QuantumChain */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center gap-3 text-foreground">
              <Shield className="h-7 w-7 text-primary" />
              About QuantumChain
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg text-muted-foreground leading-relaxed">
              QuantumChain is a revolutionary platform that bridges quantum computing and blockchain technology. 
              Execute real quantum algorithms on leading quantum computers and have your results permanently verified on the ultra-fast MegaETH blockchain.
            </p>
            
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
                  <h3 className="font-semibold text-primary">Real Quantum Computing</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Execute algorithms on Google Willow, IBM Condor, and Amazon Braket quantum computers - not simulators!
                </p>
              </motion.div>
              
              <motion.div 
                className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Shield className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-green-100">Blockchain Security</h3>
                </div>
                <p className="text-sm text-green-200/80">
                  Every quantum computation is permanently recorded on the ultra-fast MegaETH blockchain for tamper-proof verification.
                </p>
              </motion.div>
              
              <motion.div 
                className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Activity className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-purple-100">Instant Verification</h3>
                </div>
                <p className="text-sm text-purple-200/80">
                  Anyone can verify your quantum results using the MegaETH blockchain - perfect for research and proving quantum advantage.
                </p>
              </motion.div>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/20">
              <h4 className="font-semibold text-primary mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Why QuantumChain is Revolutionary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-foreground">Tamper-proof quantum results</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-foreground">Access to multiple quantum computers</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-foreground">Ultra-fast MegaETH blockchain (100k+ TPS)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-foreground">Perfect for learning and research</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}