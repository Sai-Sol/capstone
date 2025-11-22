"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Save, Copy, Trash2, Plus, Clock, Star, MoreVertical, Zap } from "lucide-react";

interface JobTemplate {
  id: string;
  name: string;
  description: string;
  jobType: string;
  algorithm: string;
  priority: "low" | "medium" | "high";
  tags: string[];
  createdAt: string;
  usageCount: number;
  isFavorite: boolean;
}

interface JobTemplatesManagerProps {
  templates?: JobTemplate[];
  onSelectTemplate?: (template: JobTemplate) => void;
  onSaveTemplate?: (name: string, description: string, template: any) => void;
  currentFormData?: any;
}

export function JobTemplatesManager({
  templates = [],
  onSelectTemplate,
  onSaveTemplate,
  currentFormData,
}: JobTemplatesManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [localTemplates, setLocalTemplates] = useState<JobTemplate[]>(templates);

  const handleSaveTemplate = () => {
    if (templateName.trim() && currentFormData) {
      const newTemplate: JobTemplate = {
        id: Date.now().toString(),
        name: templateName,
        description: templateDescription,
        jobType: currentFormData.jobType,
        algorithm: currentFormData.description,
        priority: currentFormData.priority,
        tags: [],
        createdAt: new Date().toISOString(),
        usageCount: 0,
        isFavorite: false,
      };

      setLocalTemplates([newTemplate, ...localTemplates]);
      onSaveTemplate?.(templateName, templateDescription, currentFormData);

      setTemplateName("");
      setTemplateDescription("");
      setIsOpen(false);
    }
  };

  const handleDeleteTemplate = (id: string) => {
    setLocalTemplates(localTemplates.filter((t) => t.id !== id));
  };

  const handleToggleFavorite = (id: string) => {
    setLocalTemplates(
      localTemplates.map((t) =>
        t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
      )
    );
  };

  const filteredTemplates = localTemplates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = !filterPriority || template.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const favoriteTemplates = filteredTemplates.filter((t) => t.isFavorite);
  const otherTemplates = filteredTemplates.filter((t) => !t.isFavorite);

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-400" />
              Quick Job Templates
            </CardTitle>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Save as Template
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700">
                <DialogHeader>
                  <DialogTitle>Create New Template</DialogTitle>
                  <DialogDescription>
                    Save your current quantum job configuration as a reusable template
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Template Name</label>
                    <Input
                      placeholder="e.g., Bell State Experiment"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Describe what this template does..."
                      value={templateDescription}
                      onChange={(e) => setTemplateDescription(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <Button onClick={handleSaveTemplate} className="w-full gap-2">
                    <Save className="h-4 w-4" />
                    Save Template
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-48"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterPriority(null)}
              className={!filterPriority ? "bg-slate-700/50" : ""}
            >
              All
            </Button>
            {["low", "medium", "high"].map((priority) => (
              <Button
                key={priority}
                variant="outline"
                size="sm"
                onClick={() => setFilterPriority(filterPriority === priority ? null : priority)}
                className={filterPriority === priority ? "bg-slate-700/50" : ""}
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Button>
            ))}
          </div>

          {favoriteTemplates.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-blue-400 uppercase">Favorites</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {favoriteTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onSelect={() => onSelectTemplate?.(template)}
                    onDelete={() => handleDeleteTemplate(template.id)}
                    onToggleFavorite={() => handleToggleFavorite(template.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {otherTemplates.length > 0 && (
            <div className="space-y-2">
              {favoriteTemplates.length > 0 && (
                <h4 className="text-xs font-semibold text-slate-400 uppercase mt-4">Other Templates</h4>
              )}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {otherTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onSelect={() => onSelectTemplate?.(template)}
                    onDelete={() => handleDeleteTemplate(template.id)}
                    onToggleFavorite={() => handleToggleFavorite(template.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredTemplates.length === 0 && (
            <div className="text-center py-6 text-slate-400">
              <p className="text-sm">No templates found</p>
              <p className="text-xs mt-1">Save your first quantum job configuration as a template</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface TemplateCardProps {
  template: JobTemplate;
  onSelect: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

function TemplateCard({ template, onSelect, onDelete, onToggleFavorite }: TemplateCardProps) {
  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      low: "bg-green-500/10 text-green-400 border-green-500/20",
      medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      high: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return colors[priority] || colors.low;
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-slate-950 rounded border border-slate-700 hover:border-slate-600 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-sm truncate">{template.name}</p>
          <Star
            className={`h-4 w-4 cursor-pointer flex-shrink-0 ${
              template.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-slate-500"
            }`}
            onClick={onToggleFavorite}
          />
        </div>
        <p className="text-xs text-slate-400 mb-2 line-clamp-1">{template.description}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={`text-xs ${getPriorityColor(template.priority)}`}>
            {template.priority}
          </Badge>
          <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20">
            {template.jobType}
          </Badge>
          <div className="text-xs text-slate-500 ml-auto flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {template.usageCount} uses
          </div>
        </div>
      </div>

      <div className="flex gap-1 flex-shrink-0">
        <Button
          size="sm"
          variant="ghost"
          onClick={onSelect}
          className="h-8 w-8 p-0 gap-0"
          title="Use this template"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onDelete} className="text-red-400">
              <Trash2 className="h-3 w-3 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
