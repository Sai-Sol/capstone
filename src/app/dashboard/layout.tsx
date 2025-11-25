"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Loader2, Atom, BarChart3, Zap, Activity, Bell, BellOff, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/header";
import { Toaster } from "@/components/ui/toaster";
import { QuantumPlatformProvider, useQuantumPlatform } from "@/context/quantum-platform-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Navigation items with enhanced metadata
const navigationItems = [
  {
    name: 'Results',
    href: '/dashboard/results',
    icon: BarChart3,
    description: 'Real-time job results and streaming updates',
    color: 'text-purple-400'
  },
  {
    name: 'Optimize',
    href: '/dashboard/optimize',
    icon: Zap,
    description: 'Interactive quantum visualizations and circuit analysis',
    color: 'text-blue-400'
  },
  {
    name: 'Circuits',
    href: '/dashboard/circuits',
    icon: Atom,
    description: 'Circuit design and device health monitoring',
    color: 'text-green-400'
  }
];

// Inner component that uses the quantum context
function DashboardContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { state, actions } = useQuantumPlatform();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  // Count active alerts and jobs
  const activeAlerts = Object.values(state.alerts).filter(alert => !alert.acknowledged).length;
  const runningJobs = Object.values(state.jobs).filter(job => job.status === 'running').length;

  return (
    <>
      {/* Enhanced Navigation Bar */}
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link className="flex items-center space-x-2" href="/dashboard">
              <Atom className="h-6 w-6 text-primary" />
              <span className="font-bold">Quantum Platform</span>
            </Link>

            {/* Enhanced Navigation */}
            <nav className="hidden md:flex items-center gap-4">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${isActive ? 'text-primary-foreground' : item.color}`} />
                    {item.name}
                    {isActive && <CheckCircle className="h-4 w-4" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Real-time Status Indicators */}
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                state.connectionStatus === 'connected' ? 'bg-green-500' :
                state.connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                'bg-red-500'
              }`} />
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {state.connectionStatus}
              </span>
            </div>

            {/* Active Jobs */}
            {runningJobs > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                <Activity className="h-3 w-3 text-blue-400" />
                <span className="text-sm text-blue-400">{runningJobs} Running</span>
              </div>
            )}

            {/* Alerts */}
            {activeAlerts > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                <AlertTriangle className="h-3 w-3 text-red-400" />
                <span className="text-sm text-red-400">{activeAlerts} Alerts</span>
              </div>
            )}

            {/* Notifications Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            >
              {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </Button>

            {/* Quick Refresh */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Refresh all subscriptions
                if (state.activeJob) {
                  actions.subscribeToJobUpdates(state.activeJob);
                }
              }}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {children}

      {/* Global Alert Notification */}
      <AnimatePresence>
        {activeAlerts > 0 && notificationsEnabled && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-4 right-4 z-50 max-w-sm"
          >
            <div className="bg-background border border-border rounded-lg shadow-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">Active Alerts</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    You have {activeAlerts} active alert{activeAlerts > 1 ? 's' : ''} requiring attention
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setNotificationsEnabled(false);
                    setTimeout(() => setNotificationsEnabled(true), 30000);
                  }}
                >
                  ×
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [redirecting, setRedirecting] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (mounted && !loading && !user) {
      console.log("No user found, redirecting to login");
      setRedirecting(true);
      router.replace("/login");
    }
  }, [user, loading, router, mounted]);

  // Enhanced timeout for loading state with better error handling
  React.useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        if (!user && mounted && !redirecting) {
          console.log("Loading timeout reached, redirecting to login");
          setRedirecting(true);
          router.replace("/login");
        }
      }, 3000); // Reduced timeout for better UX

      return () => clearTimeout(timeout);
    }
  }, [loading, user, mounted, router, redirecting]);

  // Additional safety check for authentication
  React.useEffect(() => {
    if (mounted && !loading && !user) {
      const authCheck = setTimeout(() => {
        if (!user && !redirecting) {
          console.log("Auth check failed, forcing redirect");
          setRedirecting(true);
          router.replace("/login");
        }
      }, 1000);

      return () => clearTimeout(authCheck);
    }
  }, [mounted, loading, user, redirecting, router]);
  if (!mounted || loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl" />
            <div className="relative bg-gradient-to-br from-primary via-purple-500 to-pink-500 p-4 rounded-2xl shadow-2xl">
              <Atom className="h-12 w-12 text-white animate-pulse mx-auto" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">
              Loading platform...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <QuantumPlatformProvider>
      <div className="flex min-h-screen w-full flex-col relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900" />
        <div className="fixed inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-blue-500/5" />

        {/* Animated geometric patterns */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />

          {/* Floating particles */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDuration: '3s' }} />
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-cyan-400/60 rounded-full animate-bounce" style={{ animationDuration: '2s', animationDelay: '1s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }} />
          <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-pink-400/60 rounded-full animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '1.5s' }} />
        </div>

        <div className="relative z-10">
          <Header />
          <main className="flex-1">
            <div className="container mx-auto px-4 py-8">
              {/* Enhanced Page wrapper with glassmorphism */}
              <div className="min-h-[calc(100vh-200px)] backdrop-blur-sm bg-background/20 border border-white/10 rounded-2xl p-6 shadow-2xl">
                <DashboardContent>
                  {children}
                </DashboardContent>
              </div>
            </div>
          </main>
        </div>
        <Toaster />
      </div>
    </QuantumPlatformProvider>
  );
}