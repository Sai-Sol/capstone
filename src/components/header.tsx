"use client";

import Link from "next/link";
import { LogOut, UserCircle, Atom, Home, PlusSquare, History, FileText, Zap, Menu, X } from "lucide-react";
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
    { href: "/dashboard/create", label: "Quantum Lab", icon: PlusSquare },
    { href: "/dashboard/history", label: "Job History", icon: History },
    { href: "/dashboard/contract", label: "Blockchain", icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md group-hover:blur-lg transition-all duration-300" />
            <div className="relative bg-gradient-to-br from-primary to-primary/70 p-2.5 rounded-xl shadow-lg">
              <Atom className="h-6 w-6 text-white quantum-pulse" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              QuantumChain
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              Quantum Computing Aggregator
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button 
                variant={pathname === item.href ? "secondary" : "ghost"} 
                className={`quantum-nav-item ${pathname === item.href ? 'bg-primary/10 text-primary border border-primary/20' : ''}`}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <WalletConnectButton />
          
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
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className={`w-2 h-2 rounded-full ${user.role === 'admin' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                      <span className="text-xs font-medium capitalize">{user.role}</span>
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
                    className={`w-full justify-start quantum-nav-item ${pathname === item.href ? 'bg-primary/10 text-primary border border-primary/20' : ''}`}
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