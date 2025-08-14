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
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (mounted && !loading && !user && !redirecting) {
      setRedirecting(true);
      router.replace("/login").catch((error) => {
        console.error("Redirect failed:", error);
        setError("Navigation failed. Please refresh the page.");
        setRedirecting(false);
      });
    }
  }, [user, loading, router, mounted, redirecting]);

  if (!mounted || loading || redirecting) {
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
              {loading ? "Loading quantum platform..." : "Redirecting..."}
            </p>
          </div>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 max-w-md text-center"
            >
              <Alert className="border-red-500/20 bg-red-500/5">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button 
                onClick={() => window.location.reload()} 
                className="quantum-button mt-4"
              >
                Refresh Page
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex-1">{children}</main>
      <Toaster />
    </div>
  );
}