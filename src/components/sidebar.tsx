"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Home,
  Users,
  Cpu,
  BarChart,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Plus,
  Zap,
  Atom,
  TrendingUp,
  Globe,
  History,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useWallet } from "@/hooks/use-wallet";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { label: "Home", href: "/dashboard", icon: Home },
  {
    label: "Quantum AI",
    icon: Cpu,
    links: [
      { label: "AI Models", href: "/dashboard/ai" },
      { label: "Optimize", href: "/dashboard/optimize" },
      { label: "Insights", href: "/dashboard/insights" },
    ],
  },
  { label: "Create", href: "/dashboard/create", icon: Plus },
  { label: "Circuits", href: "/dashboard/circuits", icon: Atom },
  { label: "Reproducibility", href: "/dashboard/reproducibility", icon: TrendingUp },
  {
    label: "Collaboration",
    icon: Users,
    links: [
      { label: "Teams", href: "/dashboard/collaborate" },
      { label: "Share", href: "/dashboard/features" },
    ],
  },
  { label: "Results", href: "/dashboard/results", icon: BarChart },
  { label: "Blockchain", href: "/dashboard/blockchain", icon: Globe },
  { label: "History", href: "/dashboard/history", icon: History },
];

function NavLink({
  item,
  isCollapsed,
}: {
  item: any;
  isCollapsed: boolean;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const isActive = item.href === pathname;

  if (item.links) {
    return (
      <div>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() => setIsOpen(!isOpen)}
        >
          <item.icon className="h-5 w-5" />
          {!isCollapsed && <span className="ml-4">{item.label}</span>}
          {!isCollapsed && (
            <ChevronDown
              className={`ml-auto h-4 w-4 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          )}
        </Button>
        <AnimatePresence>
          {isOpen && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pl-8"
            >
              {item.links.map((link: any) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-4 px-2.5 py-2 text-sm font-medium rounded-md transition-colors ${
                    pathname === link.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link href={item.href}>
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className="w-full justify-start"
      >
        <item.icon className="h-5 w-5" />
        {!isCollapsed && <span className="ml-4">{item.label}</span>}
      </Button>
    </Link>
  );
}

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { disconnectWallet } = useWallet();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    disconnectWallet();
  };

  return (
    <div className="flex min-h-screen">
      <motion.aside
        initial={{ width: isCollapsed ? 80 : 280 }}
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3 }}
        className={`hidden md:flex flex-col border-r bg-background/80 backdrop-blur-sm`}
      >
        <div className="flex h-16 items-center justify-between p-4 border-b">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Atom className="h-8 w-8 text-primary" />
            {!isCollapsed && (
              <span className="text-xl font-bold">QuantumChain</span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <Menu /> : <X />}
          </Button>
        </div>
        <nav className="flex-1 space-y-2 p-4">
          {navItems.map((item) => (
            <NavLink key={item.label} item={item} isCollapsed={isCollapsed} />
          ))}
        </nav>
      </motion.aside>

      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Users className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex md:hidden"
          >
            <div className="w-64 border-r bg-background/95 backdrop-blur-sm">
              <div className="flex h-16 items-center justify-between p-4 border-b">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <Atom className="h-8 w-8 text-primary" />
                  <span className="text-xl font-bold">QuantumChain</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X />
                </Button>
              </div>
              <nav className="flex-1 space-y-2 p-4">
                {navItems.map((item) => (
                  <NavLink
                    key={item.label}
                    item={item}
                    isCollapsed={false}
                  />
                ))}
              </nav>
            </div>
            <div
              className="flex-1"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}