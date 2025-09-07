import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { WalletProvider } from "@/contexts/wallet-context";
import { Toaster } from "@/components/ui/toaster";
import RealTimeNotifications from "@/components/real-time-notifications";
import EnhancedErrorBoundary from "@/components/enhanced-error-boundary";
import PerformanceOptimizer from "@/components/performance-optimizer";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap'
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: '--font-space-grotesk',
  display: 'swap'
});

export const metadata: Metadata = {
  title: "QuantumChain - MegaETH Quantum Computing",
  description: "Secure quantum computing platform with ultra-fast MegaETH blockchain verification",
  keywords: "quantum computing, MegaETH, blockchain, smart contracts, multi-wallet",
  authors: [{ name: "QuantumChain Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-body`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <WalletProvider>
              <EnhancedErrorBoundary>
                <PerformanceOptimizer />
                {children}
                <Toaster />
                <RealTimeNotifications />
              </EnhancedErrorBoundary>
            </WalletProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}