"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X, History, TrendingUp, Zap } from "lucide-react";

interface MobileSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSearch({ isOpen, onClose }: MobileSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const recentSearches = [
    "Gas optimization",
    "Staking rewards",
    "Bridge ETH",
    "Quantum jobs"
  ];

  const quickActions = [
    { label: "Submit Quantum Job", icon: Zap, href: "/dashboard/create" },
    { label: "Blockchain Hub", icon: TrendingUp, href: "/dashboard/blockchain" },
    { label: "AI Assistant", icon: History, href: "/dashboard/ai" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm"
        >
          <div className="container mx-auto p-4 h-full flex flex-col">
            {/* Search Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search quantum features, transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="quantum-input pl-10 h-12"
                  autoFocus
                />
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Search Results */}
            <div className="flex-1 space-y-6">
              {!searchQuery ? (
                <>
                  {/* Recent Searches */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Searches</h3>
                    <div className="space-y-2">
                      {recentSearches.map((search, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Button
                            variant="ghost"
                            className="w-full justify-start h-auto p-3"
                            onClick={() => setSearchQuery(search)}
                          >
                            <History className="mr-3 h-4 w-4 text-muted-foreground" />
                            <span>{search}</span>
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                      {quickActions.map((action, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                        >
                          <Card className="quantum-card">
                            <CardContent className="p-4">
                              <Button
                                variant="ghost"
                                className="w-full justify-start h-auto p-0"
                                onClick={onClose}
                              >
                                <action.icon className="mr-3 h-5 w-5 text-primary" />
                                <span>{action.label}</span>
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                    Search Results
                  </h3>
                  <p className="text-muted-foreground">
                    Search functionality will be implemented in the next update
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}