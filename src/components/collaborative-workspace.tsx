"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Share2,
  MessageSquare,
  History,
  Trash2,
  Edit,
  Copy,
  Eye,
  Pencil,
  Clock,
} from "lucide-react";

interface Collaborator {
  id: string;
  email: string;
  role: "owner" | "editor" | "viewer";
  joinedAt: string;
  avatar?: string;
}

interface CircuitComment {
  id: string;
  author: string;
  content: string;
  gateIndex?: number;
  createdAt: string;
  avatar?: string;
}

interface CircuitVersion {
  id: string;
  versionNumber: number;
  changes: string;
  createdAt: string;
  createdBy: string;
}

interface CollaborativeWorkspaceProps {
  circuitId: string;
  circuitName: string;
  owner: string;
  collaborators?: Collaborator[];
  comments?: CircuitComment[];
  versions?: CircuitVersion[];
  onShareClick?: () => void;
  onAddCollaborator?: (email: string, role: string) => void;
  onRemoveCollaborator?: (collaboratorId: string) => void;
  onAddComment?: (content: string, gateIndex?: number) => void;
  onRestoreVersion?: (versionId: string) => void;
}

export function CollaborativeWorkspace({
  circuitId,
  circuitName,
  owner,
  collaborators = [],
  comments = [],
  versions = [],
  onShareClick,
  onAddCollaborator,
  onRemoveCollaborator,
  onAddComment,
  onRestoreVersion,
}: CollaborativeWorkspaceProps) {
  const [newComment, setNewComment] = useState("");
  const [selectedGate, setSelectedGate] = useState<number | null>(null);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState("");
  const [newCollaboratorRole, setNewCollaboratorRole] = useState<"viewer" | "editor">("viewer");
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment?.(newComment, selectedGate ?? undefined);
      setNewComment("");
      setSelectedGate(null);
    }
  };

  const handleAddCollaborator = () => {
    if (newCollaboratorEmail.trim()) {
      onAddCollaborator?.(newCollaboratorEmail, newCollaboratorRole);
      setNewCollaboratorEmail("");
    }
  };

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      owner: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      editor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      viewer: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    };
    return colors[role] || colors.viewer;
  };

  const getRoleIcon = (role: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      owner: <Users className="h-3 w-3" />,
      editor: <Edit className="h-3 w-3" />,
      viewer: <Eye className="h-3 w-3" />,
    };
    return icons[role] || icons.viewer;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Collaboration
            </CardTitle>
            <Button size="sm" onClick={onShareClick} className="gap-2">
              <Share2 className="h-4 w-4" />
              Invite
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-400">Add Team Member</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="email@example.com"
                  value={newCollaboratorEmail}
                  onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                  className="text-sm"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {newCollaboratorRole === "editor" ? "Edit" : "View"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setNewCollaboratorRole("viewer")}>
                      Viewer
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setNewCollaboratorRole("editor")}>
                      Editor
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" onClick={handleAddCollaborator}>
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-400">Current Team</h4>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                <div className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-700">
                  <div>
                    <p className="text-sm font-medium">{owner}</p>
                    <p className="text-xs text-slate-500">You</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs gap-1 ${getRoleColor("owner")}`}
                  >
                    {getRoleIcon("owner")}
                    Owner
                  </Badge>
                </div>

                {collaborators.map((collab) => (
                  <div
                    key={collab.id}
                    className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-700"
                  >
                    <div>
                      <p className="text-sm font-medium">{collab.email}</p>
                      <p className="text-xs text-slate-500">
                        Joined {new Date(collab.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Badge
                          variant="outline"
                          className={`text-xs gap-1 cursor-pointer ${getRoleColor(collab.role)}`}
                        >
                          {getRoleIcon(collab.role)}
                          {collab.role}
                        </Badge>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel className="text-xs">Manage Access</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onRemoveCollaborator?.(collab.id)}
                          className="text-red-400"
                        >
                          <Trash2 className="h-3 w-3 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Version History
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => setShowVersionHistory(!showVersionHistory)}
            >
              <Clock className="h-4 w-4" />
              {versions.length} versions
            </Button>

            {showVersionHistory && versions.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {versions.map((version, index) => (
                  <div
                    key={version.id}
                    className="p-2 bg-slate-950 rounded border border-slate-700 text-sm space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-blue-400">
                        v{version.versionNumber}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(version.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{version.changes}</p>
                    <p className="text-xs text-slate-500">by {version.createdBy}</p>
                    {index > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-xs gap-1 mt-1"
                        onClick={() => onRestoreVersion?.(version.id)}
                      >
                        <Copy className="h-3 w-3" />
                        Restore
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Annotations & Discussion
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="p-3 bg-slate-950 rounded border border-slate-700 space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-400 mb-1 block">
                Add Comment
              </label>
              <Textarea
                placeholder="Share your thoughts or suggestions..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">
                Attach to Gate (optional)
              </label>
              <Input
                type="number"
                placeholder="Gate index"
                value={selectedGate ?? ""}
                onChange={(e) => setSelectedGate(e.target.value ? parseInt(e.target.value) : null)}
                className="text-sm"
              />
            </div>

            <Button onClick={handleAddComment} className="w-full" disabled={!newComment.trim()}>
              Post Comment
            </Button>
          </div>

          {comments.length > 0 && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <h4 className="text-sm font-medium text-slate-400">Recent Comments</h4>
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-3 bg-slate-950 rounded border border-slate-700 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{comment.author}</p>
                    <span className="text-xs text-slate-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">{comment.content}</p>
                  {comment.gateIndex !== undefined && (
                    <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400">
                      Gate {comment.gateIndex}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
