"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Atom, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRedirect = useCallback(async () => {
    if (mounted && !loading) {
      if (redirecting) return;
      
      setRedirecting(true);
      setError(null);
      
      try {
        if (user) {
          await router.replace("/dashboard");
        } else {
          await router.replace("/login");
        }
      } catch (error: any) {
        console.error("Navigation error:", error);
        setError("Navigation failed. Please try refreshing the page.");
        setRedirecting(false);
      }
    }
  }, [user, loading, router, mounted, redirecting]);

  useEffect(() => {
    // Add a small delay to prevent race conditions
    const timer = setTimeout(handleRedirect, 100);
    return () => clearTimeout(timer);
  }, [handleRedirect]);

  // Timeout fallback
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (mounted && !loading && !redirecting) {
        setError("Page loading timeout. Please refresh or try again.");
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [mounted, loading, redirecting]);

  if (!mounted || loading || redirecting) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl" />
            <div className="relative bg-gradient-to-br from-primary via-purple-500 to-pink-500 p-6 rounded-2xl shadow-2xl">
              <Atom className="h-16 w-16 text-white quantum-pulse mx-auto" />
            </div>
          </div>
          <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            QuantumChain
          </h1>
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">
              {loading ? "Initializing quantum platform..." : "Redirecting..."}
            </p>
          </div>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 max-w-md"
            >
              <Alert className="border-red-500/20 bg-red-500/5">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-center">
                  {error}
                </AlertDescription>
              </Alert>
              <div className="flex gap-3 mt-4 justify-center">
                <Button 
                  onClick={() => window.location.reload()} 
                  className="quantum-button"
                >
                  Refresh Page
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push("/login")}
                >
                  Go to Login
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  return null;
}