"use client";

import PublicHeader from "@/components/public-header";
import { Toaster } from "@/components/ui/toaster";

export default function AILayout({
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