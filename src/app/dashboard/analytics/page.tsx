"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, ArrowRight, TrendingUp, Activity } from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Advanced Analytics
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Comprehensive analytics and insights coming in Q2 2025
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="quantum-card text-center">
          <CardHeader>
            <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl w-fit">
              <BarChart3 className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-headline">Analytics Dashboard Coming Soon</CardTitle>
            <CardDescription className="text-base">
              Advanced quantum computing analytics and performance insights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 text-left">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-semibold">Quantum Performance Metrics</h4>
                  <p className="text-sm text-muted-foreground">Real-time quantum algorithm performance tracking</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                <Activity className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-semibold">Execution Analytics</h4>
                  <p className="text-sm text-muted-foreground">Detailed analysis of quantum job execution patterns</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                <BarChart3 className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-semibold">Provider Comparison</h4>
                  <p className="text-sm text-muted-foreground">Compare performance across quantum providers</p>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <Link href="/dashboard/lab">
                <Button className="quantum-button">
                  <Activity className="mr-2 h-4 w-4" />
                  Try Quantum Lab
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}