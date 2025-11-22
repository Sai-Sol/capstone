"use client";

import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminDashboard from "@/components/admin-dashboard";
import {
  Atom,
  Cpu,
  Zap,
  Shield,
  TrendingUp,
  Activity,
  Globe,
  Users,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useWallet } from "@/hooks/use-wallet";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function InfoCard({
  title,
  description,
  icon: Icon,
  href,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{
          scale: 1.05,
          boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
        }}
        className="glass-effect-soft rounded-lg p-6 flex flex-col h-full"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">{title}</h3>
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <p className="text-muted-foreground mt-2 flex-1">{description}</p>
        <Button variant="link" className="mt-4 p-0">
          Learn More <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    </Link>
  );
}

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

  const overviewStats = [
    { label: "Total Jobs", value: totalJobs, icon: Cpu },
    { label: "Success Rate", value: "99.2%", icon: TrendingUp },
    { label: "Qubits Available", value: 1482, icon: Atom },
    { label: "Network Latency", value: "<50ms", icon: Zap },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect-soft rounded-lg p-6"
      >
        <h1 className="text-4xl font-bold heading-glow">
          Welcome back, {user?.name || "User"}
        </h1>
        <p className="text-muted-foreground mt-2">
          Here&apos;s a quick overview of your quantum computing dashboard.
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
          >
            <Card className="glass-effect-soft">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <InfoCard
          title="Create New Job"
          description="Submit a new quantum algorithm for execution on our state-of-the-art quantum computers."
          icon={Zap}
          href="/dashboard/create"
        />
        <InfoCard
          title="View Results"
          description="Analyze the results of your past quantum computations and visualize the output."
          icon={BarChart3}
          href="/dashboard/results"
        />
        <InfoCard
          title="Blockchain Explorer"
          description="Explore the MegaETH blockchain and view the transaction history of your quantum jobs."
          icon={Globe}
          href="/dashboard/blockchain"
        />
      </div>

      {user?.role === "admin" && <AdminDashboard totalJobs={totalJobs} />}
    </div>
  );
}