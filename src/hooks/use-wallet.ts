"use client";

import { useContext } from "react";
import { WalletContext } from "@/contexts/wallet-context";

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
