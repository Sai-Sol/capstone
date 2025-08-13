import type { Metadata } from "next";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/toaster";
import RealTimeNotifications from "@/components/real-time-notifications";
import ErrorBoundary from "@/components/error-boundary";

const WalletProvider = dynamic(
  () => import("@/contexts/wallet-context").then((mod) => ({ default: mod.WalletProvider })),
  { ssr: false }
);

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuantumChain - Blockchain Quantum Computing",
  description: "Secure quantum computing platform with blockchain verification",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <WalletProvider>
              <ErrorBoundary>
                {children}
                <Toaster />
                <RealTimeNotifications />
              </ErrorBoundary>
            </WalletProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}