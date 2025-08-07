"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { 
  Wallet, 
  Send, 
  QrCode, 
  Shield, 
  Key,
  Copy,
  ExternalLink,
  RefreshCw,
  Plus,
  Trash2
} from "lucide-react";

interface WalletAccount {
  address: string;
  name: string;
  balance: string;
  isActive: boolean;
}

interface SavedAddress {
  address: string;
  name: string;
  category: string;
}

export default function AdvancedWalletManager() {
  const { isConnected, address, balance } = useWallet();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [newAddressName, setNewAddressName] = useState("");
  const [newAddressValue, setNewAddressValue] = useState("");
  const [newAddressCategory, setNewAddressCategory] = useState("personal");

  useEffect(() => {
    if (isConnected) {
      loadWalletData();
    }
  }, [isConnected]);

  const loadWalletData = () => {
    const mockAccounts: WalletAccount[] = [
      {
        address: address || "",
        name: "Main Account",
        balance: balance || "0",
        isActive: true
      }
    ];

    const mockSavedAddresses: SavedAddress[] = [
      {
        address: "0x742d35Cc6c6C0532925a3b8d4c5f207E88319b45",
        name: "Exchange Wallet",
        category: "exchange"
      },
      {
        address: "0x8ba1f109551bD432803012645Hac136c22C177ec",
        name: "DeFi Protocol",
        category: "defi"
      }
    ];

    setAccounts(mockAccounts);
    setSavedAddresses(mockSavedAddresses);
  };

  const addSavedAddress = () => {
    if (!newAddressName || !newAddressValue) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please fill in all fields."
      });
      return;
    }

    const newAddress: SavedAddress = {
      address: newAddressValue,
      name: newAddressName,
      category: newAddressCategory
    };

    setSavedAddresses(prev => [...prev, newAddress]);
    setNewAddressName("");
    setNewAddressValue("");
    
    toast({
      title: "Address Saved",
      description: "Address has been added to your contacts."
    });
  };

  const removeSavedAddress = (addressToRemove: string) => {
    setSavedAddresses(prev => prev.filter(addr => addr.address !== addressToRemove));
    toast({
      title: "Address Removed",
      description: "Address has been removed from your contacts."
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Address copied to clipboard."
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "personal": return "text-blue-400 border-blue-400/50";
      case "exchange": return "text-green-400 border-green-400/50";
      case "defi": return "text-purple-400 border-purple-400/50";
      default: return "text-gray-400 border-gray-400/50";
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/30 h-14">
          <TabsTrigger value="accounts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Wallet className="mr-2 h-4 w-4" />
            Accounts
          </TabsTrigger>
          <TabsTrigger value="contacts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <QrCode className="mr-2 h-4 w-4" />
            Contacts
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="mt-8">
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Wallet Accounts
              </CardTitle>
              <CardDescription>Manage your connected wallet accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accounts.map((account, index) => (
                  <motion.div
                    key={account.address}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-gradient-to-r from-muted/20 to-muted/10 border border-primary/10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Wallet className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{account.name}</p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {account.address.slice(0, 10)}...{account.address.slice(-8)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{account.balance} ETH</p>
                        <div className="flex items-center gap-2 mt-1">
                          {account.isActive && (
                            <Badge variant="outline" className="text-green-400 border-green-400/50">
                              Active
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(account.address)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="mt-8">
          <div className="space-y-6">
            {/* Add New Contact */}
            <Card className="quantum-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Add Contact
                </CardTitle>
                <CardDescription>Save frequently used addresses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      placeholder="Contact name"
                      value={newAddressName}
                      onChange={(e) => setNewAddressName(e.target.value)}
                      className="quantum-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input
                      placeholder="0x..."
                      value={newAddressValue}
                      onChange={(e) => setNewAddressValue(e.target.value)}
                      className="quantum-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select
                      value={newAddressCategory}
                      onChange={(e) => setNewAddressCategory(e.target.value)}
                      className="quantum-input h-10 w-full"
                    >
                      <option value="personal">Personal</option>
                      <option value="exchange">Exchange</option>
                      <option value="defi">DeFi Protocol</option>
                    </select>
                  </div>
                </div>
                <Button onClick={addSavedAddress} className="quantum-button">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Contact
                </Button>
              </CardContent>
            </Card>

            {/* Saved Contacts */}
            <Card className="quantum-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-primary" />
                  Saved Contacts
                </CardTitle>
                <CardDescription>Your saved wallet addresses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {savedAddresses.map((contact, index) => (
                    <motion.div
                      key={contact.address}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-xl bg-gradient-to-r from-muted/20 to-muted/10 border border-primary/10"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="font-bold text-primary text-sm">{contact.name[0]}</span>
                          </div>
                          <div>
                            <p className="font-semibold">{contact.name}</p>
                            <p className="text-sm text-muted-foreground font-mono">
                              {contact.address.slice(0, 10)}...{contact.address.slice(-8)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getCategoryColor(contact.category)}>
                            {contact.category}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(contact.address)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-400"
                            onClick={() => removeSavedAddress(contact.address)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-8">
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage your wallet security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/5 to-green-600/10 border border-green-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="h-5 w-5 text-green-400" />
                    <span className="font-semibold text-green-200">Wallet Security Status</span>
                  </div>
                  <p className="text-sm text-green-200/80">Your wallet is secured with industry-standard encryption</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex-col">
                    <Key className="h-6 w-6 mb-2 text-blue-400" />
                    <span className="font-semibold">Export Private Key</span>
                    <span className="text-xs text-muted-foreground">Backup your wallet</span>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex-col">
                    <QrCode className="h-6 w-6 mb-2 text-purple-400" />
                    <span className="font-semibold">Generate QR Code</span>
                    <span className="text-xs text-muted-foreground">Share your address</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}