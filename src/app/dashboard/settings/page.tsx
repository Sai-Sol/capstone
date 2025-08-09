"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, ArrowRight, User, Bell, Shield, Palette } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Settings & Preferences
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Advanced settings and customization options
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
              <Settings className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-headline">Advanced Settings Coming Soon</CardTitle>
            <CardDescription className="text-base">
              Comprehensive settings and customization features planned for Q2 2025
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 text-left">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-semibold">Profile Management</h4>
                  <p className="text-sm text-muted-foreground">Advanced user profile and preferences</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                <Bell className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-semibold">Notification Center</h4>
                  <p className="text-sm text-muted-foreground">Customizable alerts and notifications</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-semibold">Security Settings</h4>
                  <p className="text-sm text-muted-foreground">Two-factor auth and security preferences</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                <Palette className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-semibold">Theme Customization</h4>
                  <p className="text-sm text-muted-foreground">Advanced theme and UI customization</p>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <Link href="/dashboard">
                <Button className="quantum-button">
                  <Settings className="mr-2 h-4 w-4" />
                  Back to Dashboard
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