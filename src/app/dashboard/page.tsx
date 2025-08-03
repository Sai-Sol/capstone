"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AdminDashboard from "@/components/admin-dashboard";
import { Atom, Cpu, Zap, Shield, TrendingUp, Activity, Globe, Lock, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useWallet } from "@/hooks/use-wallet";
import { Badge } from "@/components/ui/badge";

export default function DashboardHomePage() {
  const { user } = useAuth();
  const { isConnected, address } = useWallet();

  const quantumProviders = [
    { name: "Google Willow", status: "online", qubits: "105", latency: "12ms" },
    { name: "IBM Condor", status: "online", qubits: "1121", latency: "8ms" },
    { name: "Amazon Braket", status: "online", qubits: "256", latency: "15ms" },
  ];

  const systemMetrics = [
    { label: "Network Latency", value: "< 1ms", icon: Zap, color: "text-green-400" },
    { label: "Active Nodes", value: "2,847", icon: Globe, color: "text-blue-400" },
    { label: "Security Level", value: "Military", icon: Lock, color: "text-purple-400" },
    { label: "Gas Efficiency", value: "99.8%", icon: Activity, color: "text-pink-400" },
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 circuit-lines opacity-20" />
        <div className="relative quantum-card p-8 rounded-2xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-primary/30 shadow-2xl quantum-glow">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                  <Atom size={40} className="quantum-pulse"/>
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-4xl font-bold font-headline tracking-tight bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent neon-text">
                  Welcome back, {user?.name || user?.email}!
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                  Access the world's most advanced quantum computers through our secure blockchain platform
                </p>
                <div className="flex items-center gap-4 mt-4">
                  {isConnected ? (
                    <Badge variant="outline" className="text-green-400 border-green-400/50 status-indicator status-online">
                      <Zap className="mr-2 h-4 w-4" />
                      Wallet Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-yellow-400 border-yellow-400/50">
                      <Shield className="mr-2 h-4 w-4" />
                      Connect Wallet to Continue
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                    <Activity className="mr-2 h-4 w-4" />
                    MegaETH L2 Network
                  </Badge>
                </div>
              </div>
            </div>
          </div>
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
          Quantum Provider Network
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {quantumProviders.map((provider, index) => (
            <motion.div
              key={provider.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
            >
              <Card className="quantum-card hover:scale-105 transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-headline">{provider.name}</CardTitle>
                    <div className={`w-3 h-3 rounded-full ${provider.status === 'online' ? 'bg-green-400' : 'bg-red-400'} quantum-pulse`} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Qubits Available</span>
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
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold font-headline mb-6 flex items-center gap-3">
          <TrendingUp className="h-7 w-7 text-primary" />
          Network Performance
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {systemMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
            >
              <Card className="quantum-card hover:scale-105 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                      <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                    </div>
                    <metric.icon className={`h-8 w-8 ${metric.color} floating-particle`} />
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
        <Card className="quantum-card">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center gap-3">
              <Shield className="h-7 w-7 text-primary" />
              Quantum-Blockchain Architecture
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
                    <Cpu className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-blue-100">1. Quantum Execution</h3>
                </div>
                <p className="text-sm text-blue-200/80">
                  Jobs are executed on quantum cloud platforms (Google Willow, IBM Condor, Amazon Braket) with real-time monitoring and sub-millisecond latency.
                </p>
              </motion.div>
              
              <motion.div 
                className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Zap className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-green-100">2. Blockchain Logging</h3>
                </div>
                <p className="text-sm text-green-200/80">
                  Results are cryptographically hashed and permanently stored on MegaETH's immutable ledger with enterprise-grade security.
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
                  <h3 className="font-semibold text-purple-100">3. Tamper-Proof Verification</h3>
                </div>
                <p className="text-sm text-purple-200/80">
                  Users can independently verify computational integrity through blockchain records, ensuring complete transparency and trust.
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
                  <span>Eliminates tampering risks through blockchain immutability</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Independent verification of quantum computations</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Complete audit trail with cryptographic proof</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>High-throughput L2 blockchain for enterprise scale</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}