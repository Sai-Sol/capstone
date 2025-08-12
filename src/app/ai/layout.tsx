"use client";

import PublicHeader from "@/components/public-header";
import { Toaster } from "@/components/ui/toaster";

// RESTORED: MegaETH Quantum Layout (removed Grok AI specific layout)
export default function QuantumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <Toaster />
    </div>
  );
}