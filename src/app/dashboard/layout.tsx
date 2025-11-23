"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Loader2, Atom } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/header";
import { Toaster } from "@/components/ui/toaster";

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
            {/* Page wrapper with glassmorphism */}
            <div className="min-h-[calc(100vh-200px)] backdrop-blur-sm bg-background/20 border border-white/10 rounded-2xl p-6 shadow-2xl">
              {children}
            </div>
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}