"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Star, Copy, Trash2, Plus, Clock, Zap, Filter, Search } from "lucide-react";

const mockTemplates = [
  {
    id: "t1",
    name: "Bell State Creator",
    description: "Creates maximally entangled Bell states for quantum cryptography",
    algorithm: "Bell State",
    priority: "high",
    qubits: 2,
    usageCount: 24,
    isFavorite: true,
    createdAt: "2024-01-15",
  },
  {
    id: "t2",
    name: "Grover's Algorithm",
    description: "Search algorithm for unstructured databases",
    algorithm: "Grover's Search",
    priority: "medium",
    qubits: 3,
    usageCount: 12,
    isFavorite: false,
    createdAt: "2024-01-10",
  },
  {
    id: "t3",
    name: "VQE Circuit",
    description: "Variational Quantum Eigensolver for molecular simulation",
    algorithm: "VQE",
    priority: "high",
    qubits: 5,
    usageCount: 8,
    isFavorite: true,
    createdAt: "2024-01-08",
  },
  {
    id: "t4",
    name: "Quantum Fourier Transform",
    description: "Core component for Shor's algorithm",
    algorithm: "QFT",
    priority: "medium",
    qubits: 4,
    usageCount: 5,
    isFavorite: false,
    createdAt: "2024-01-05",
  },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState(mockTemplates);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<(typeof mockTemplates)[0] | null>(null);

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = !filterPriority || t.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const favoriteTemplates = templates.filter((t) => t.isFavorite);

  const handleToggleFavorite = (id: string) => {
    setTemplates(
      templates.map((t) => (t.id === id ? { ...t, isFavorite: !t.isFavorite } : t))
    );
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-amber-400 to-orange-400 bg-clip-text text-transparent mb-4">
          Job Templates Library
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Save and reuse previous jobs. Smart templating system for rapid job creation and experimentation.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="space-y-6"
      >
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="all">All Templates</TabsTrigger>
            <TabsTrigger value="favorites">
              <Star className="h-4 w-4 mr-2" />
              Favorites
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterPriority || ""}
                  onChange={(e) => setFilterPriority(e.target.value || null)}
                  className="px-4 py-2 rounded-lg border border-border bg-background text-sm"
                >
                  <option value="">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {filteredTemplates.map((template, idx) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="quantum-card h-full hover:border-primary/50 transition-all cursor-pointer group">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {template.algorithm}
                            </p>
                          </div>
                          <button
                            onClick={() => handleToggleFavorite(template.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Star
                              className={`h-5 w-5 ${
                                template.isFavorite
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className={getPriorityColor(template.priority)}>
                            {template.priority}
                          </Badge>
                          <Badge variant="outline" className="text-blue-400 border-blue-500/50">
                            {template.qubits}q
                          </Badge>
                          <Badge variant="outline" className="text-green-400 border-green-500/50">
                            <Zap className="h-3 w-3 mr-1" />
                            {template.usageCount}x
                          </Badge>
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-border">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setSelectedTemplate(template)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Use
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            {favoriteTemplates.length === 0 ? (
              <Card className="quantum-card">
                <CardContent className="pt-6 text-center">
                  <Star className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No favorites yet. Star templates to add them here!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {favoriteTemplates.map((template, idx) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="quantum-card h-full hover:border-primary/50 transition-all cursor-pointer group">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {template.algorithm}
                            </p>
                          </div>
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                        <div className="flex gap-2">
                          <Badge variant="outline" className={getPriorityColor(template.priority)}>
                            {template.priority}
                          </Badge>
                          <Badge variant="outline" className="text-blue-400 border-blue-500/50">
                            {template.qubits}q
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline" className="w-full">
                          <Copy className="h-4 w-4 mr-2" />
                          Use Template
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="quantum-card border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Smart Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Quick Reuse</h4>
                <p className="text-sm text-muted-foreground">
                  Load any template with one click and modify parameters instantly.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Usage Tracking</h4>
                <p className="text-sm text-muted-foreground">
                  See how often each template is used to identify your most effective designs.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Favorites System</h4>
                <p className="text-sm text-muted-foreground">
                  Star your go-to templates for instant access from the favorites tab.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
