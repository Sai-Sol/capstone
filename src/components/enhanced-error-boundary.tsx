"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, Home, Bug, Copy, ExternalLink } from "lucide-react";

interface EnhancedErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId?: string;
}

interface EnhancedErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

class EnhancedErrorBoundary extends React.Component<EnhancedErrorBoundaryProps, EnhancedErrorBoundaryState> {
  constructor(props: EnhancedErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): EnhancedErrorBoundaryState {
    return { 
      hasError: true, 
      error,
      errorId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Enhanced ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log error to analytics
    if (typeof window !== 'undefined') {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'error',
          metadata: {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            errorId: this.state.errorId
          }
        })
      }).catch(console.error);
    }
  }

  copyErrorDetails = () => {
    const errorDetails = {
      id: this.state.errorId,
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
  };

  reportError = () => {
    const errorDetails = {
      id: this.state.errorId,
      message: this.state.error?.message,
      timestamp: new Date().toISOString()
    };
    
    // In a real app, this would send to an error reporting service
    console.log('Error reported:', errorDetails);
  };

  render() {
    if (this.state.hasError) {
      const reset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined, errorId: undefined });
      };

      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} reset={reset} />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-lg"
          >
            <Card className="quantum-card">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-red-500/20 rounded-full w-fit">
                  <Bug className="h-8 w-8 text-red-400" />
                </div>
                <CardTitle className="text-2xl font-headline text-red-400">
                  Application Error
                </CardTitle>
                <CardDescription>
                  An unexpected error occurred in the quantum computing platform
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <Alert className="border-red-500/20 bg-red-500/5">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <div className="font-semibold text-red-400 mb-1">Error Details</div>
                    {this.state.error?.message || "An unexpected error occurred"}
                    {this.state.errorId && (
                      <div className="text-xs text-red-300/60 mt-2">
                        Error ID: {this.state.errorId}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
                
                {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Stack Trace</span>
                      <Button variant="ghost" size="sm" onClick={this.copyErrorDetails}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Details
                      </Button>
                    </div>
                    <pre className="text-xs bg-muted/50 p-3 rounded-lg overflow-auto max-h-32 font-mono">
                      {this.state.error.stack}
                    </pre>
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button onClick={reset} className="quantum-button">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/dashboard'}
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Go Home
                  </Button>
                </div>

                {process.env.NODE_ENV === 'production' && (
                  <div className="pt-4 border-t border-primary/20">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={this.reportError}
                      className="w-full"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Report This Error
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EnhancedErrorBoundary;