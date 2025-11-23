"use client";

import Link from "next/link";
import { LogOut, UserCircle, Atom, Home, Plus, History, Globe, Menu, X, BarChart3, TrendingUp, Users, Zap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import WalletConnectButton from "./wallet-connect-button";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWallet } from "@/hooks/use-wallet";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const { user, logout } = useAuth();
  const { disconnectWallet } = useWallet();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    disconnectWallet();
    router.push("/login");
  };

  const navItems = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/dashboard/create", label: "Create", icon: Plus },
    { href: "/dashboard/optimize", label: "Optimize", icon: Zap },
    { href: "/dashboard/circuits", label: "Circuits", icon: Atom },
    { href: "/dashboard/reproducibility", label: "Reproducibility", icon: TrendingUp },
    { href: "/dashboard/collaborate", label: "Collaborate", icon: Users },
    { href: "/dashboard/results", label: "Results", icon: BarChart3 },
    { href: "/dashboard/blockchain", label: "Blockchain", icon: Globe },
    { href: "/dashboard/history", label: "History", icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/20 bg-background/40 backdrop-blur-xl supports-[backdrop-filter]:bg-background/20 shadow-2xl">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-blue-500/5 backdrop-blur-3xl" />

      <div className="container flex h-16 items-center justify-between px-4 relative">
        {/* Enhanced Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            {/* Multi-layer glow effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 group-hover:from-primary/40 group-hover:to-purple-500/40" />
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-xl blur-lg group-hover:blur-lg transition-all duration-500 group-hover:from-primary/30 group-hover:to-purple-500/30" />

            {/* Main logo container */}
            <div className="relative bg-gradient-to-br from-primary via-purple-500 to-indigo-500 p-3 rounded-xl shadow-xl border border-white/20 backdrop-blur-sm">
              <Atom className="h-7 w-7 text-white animate-pulse drop-shadow-lg" />

              {/* Floating particles */}
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-primary to-purple-400 bg-clip-text text-transparent drop-shadow-lg">
              QuantumChain
            </span>
            <span className="text-xs text-primary/80 font-medium flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75 animate-ping"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              Advanced Quantum Computing
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button 
                variant={pathname === item.href ? "secondary" : "ghost"} 
                className={`transition-all duration-300 text-foreground ${pathname === item.href ? 'bg-primary/10 text-primary border border-primary/20' : ''}`}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          <WalletConnectButton />
          <ThemeToggle />
          
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* User menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="overflow-hidden rounded-full border border-primary/20 bg-background/50 backdrop-blur-sm"
                >
                  <UserCircle className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-sm border-primary/20">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-foreground">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || ""}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className={`w-2 h-2 rounded-full ${user?.role === 'admin' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                      <span className="text-xs font-medium capitalize text-foreground">{user?.role || 'user'}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-400 hover:text-red-300">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-primary/20 bg-background/95 backdrop-blur-xl"
          >
            <nav className="container px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                  <Button 
                    variant={pathname === item.href ? "secondary" : "ghost"} 
                    className={`w-full justify-start transition-all duration-300 text-foreground ${pathname === item.href ? 'bg-primary/10 text-primary border border-primary/20' : ''}`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}