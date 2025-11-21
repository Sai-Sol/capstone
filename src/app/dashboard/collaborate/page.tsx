"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  Share2,
  MessageSquare,
  History,
  Copy,
  Eye,
  Pencil,
  Lock,
  Globe,
} from "lucide-react";

const mockCollaborators = [
  { id: "u1", email: "alice@quantumchain.ai", role: "owner", avatar: "A" },
  { id: "u2", email: "bob@quantumchain.ai", role: "editor", avatar: "B" },
  { id: "u3", email: "charlie@quantumchain.ai", role: "viewer", avatar: "C" },
];

const mockVersions = [
  {
    id: "v3",
    number: 3,
    changes: "Added measurement gates",
    author: "Bob Smith",
    time: "2 hours ago",
  },
  {
    id: "v2",
    number: 2,
    changes: "Fixed CNOT placement",
    author: "Alice Johnson",
    time: "4 hours ago",
  },
  {
    id: "v1",
    number: 1,
    changes: "Initial circuit creation",
    author: "Alice Johnson",
    time: "1 day ago",
  },
];

const mockComments = [
  {
    id: "c1",
    author: "Bob Smith",
    avatar: "B",
    content: "Great circuit design! Consider optimizing the gate sequence.",
    gateIndex: 2,
    time: "30 min ago",
  },
  {
    id: "c2",
    author: "Charlie Davis",
    avatar: "C",
    content: "This looks like it might have high depth. Worth reviewing?",
    time: "1 hour ago",
  },
];

export default function CollaborativePage() {
  const [shareEmail, setShareEmail] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  return (
    <div className="space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Collaborative Workspace
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Share quantum circuits, collaborate in real-time, track version history, and annotate designs with your team.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 space-y-6">
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Circuit Annotations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockComments.map((comment, idx) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 rounded-lg border border-border hover:border-primary/50 transition-all"
                >
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{comment.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm">{comment.author}</p>
                        <span className="text-xs text-muted-foreground">{comment.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
                      {comment.gateIndex !== undefined && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          Gate #{comment.gateIndex}
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              <div className="space-y-2 mt-6 pt-4 border-t border-border">
                <label className="text-sm font-medium">Add Comment</label>
                <Textarea
                  placeholder="Share your thoughts on this circuit..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-20"
                />
                <Button className="w-full">Post Comment</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Version History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockVersions.map((version, idx) => (
                  <motion.div
                    key={version.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-3 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-mono text-sm font-semibold text-primary">
                          v{version.number}
                        </p>
                        <p className="text-sm mt-1">{version.changes}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {version.author} • {version.time}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Restore
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Sharing & Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="rounded"
                    id="public"
                  />
                  <label htmlFor="public" className="text-sm cursor-pointer flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Make Public
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isPublic
                    ? "Anyone with the link can view this circuit"
                    : "Only collaborators can access this circuit"}
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-border">
                <label className="text-sm font-medium">Share with Team</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="email@example.com"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    className="text-sm"
                  />
                  <Button size="sm" variant="outline">
                    Add
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium mb-3">Share Link</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value="https://qc.ai/share/abc123xyz"
                    className="text-xs flex-1 px-2 py-1 rounded border border-border bg-background/50"
                  />
                  <Button size="sm" variant="outline">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Collaborators
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockCollaborators.map((collab, idx) => (
                <motion.div
                  key={collab.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center justify-between p-2 rounded hover:bg-background/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs">
                        {collab.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{collab.email}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {collab.role === "owner" ? (
                      <Lock className="h-3 w-3 mr-1" />
                    ) : collab.role === "editor" ? (
                      <Pencil className="h-3 w-3 mr-1" />
                    ) : (
                      <Eye className="h-3 w-3 mr-1" />
                    )}
                    {collab.role}
                  </Badge>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <Card className="quantum-card border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-sm">Real-Time Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span>Live cursor tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span>Conflict-free editing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <span>Auto-save capability</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
