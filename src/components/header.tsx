"use client";

import Link from "next/link";
import { Atom } from "lucide-react";
import { Button } from "@/components/ui/button";
import WalletConnectButton from "./wallet-connect-button";
import { ThemeToggle } from "./theme-toggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md group-hover:blur-lg transition-all duration-300" />
            <div className="relative bg-gradient-to-br from-primary to-primary/70 p-2.5 rounded-xl shadow-lg">
              <Atom className="h-6 w-6 text-white animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              QuantumChain
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              🚀 Quantum Computing Platform
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <WalletConnectButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}