"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Users,
  MessageCircle,
  FileText,
  Share,
  Lock,
  Globe,
  Clock,
  Settings,
  Download,
  Upload,
  History,
  Zap,
  Play,
  Save,
  Eye,
  Edit,
  Trash2,
  Copy,
  ExternalLink
} from "lucide-react";
import { CircuitBuilder, QuantumCircuit } from "./circuit-builder";
import { useWebSocket } from "@/hooks/use-websocket";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline';
  cursor?: { x: number; y: number };
  color: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  owner: User;
  members: User[];
  circuits: QuantumCircuit[];
  permissions: {
    canEdit: boolean;
    canShare: boolean;
    canDelete: boolean;
  };
  settings: {
    isPublic: boolean;
    allowComments: boolean;
    allowFileUploads: boolean;
  };
  shareLinks: ShareLink[];
  createdAt: number;
  updatedAt: number;
}

export interface ShareLink {
  id: string;
  token: string;
  permissions: string[];
  expiresAt?: number;
  createdAt: number;
  createdBy: User;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
  circuitId?: string;
  gateId?: string;
  parentId?: string;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details?: any;
  timestamp: number;
}

interface ProjectWorkspaceProps {
  project: Project;
  currentUser: User;
  onUpdateProject?: (project: Project) => void;
  onLeaveProject?: () => void;
  readOnly?: boolean;
}

const USER_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
];

export function ProjectWorkspace({
  project,
  currentUser,
  onUpdateProject,
  onLeaveProject,
  readOnly = false
}: ProjectWorkspaceProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCircuit, setSelectedCircuit] = useState<QuantumCircuit | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newComment, setNewComment] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [newShareLink, setNewShareLink] = useState<{
    permissions: string[];
    expiresAt?: number;
  }>({
    permissions: ['view']
  });

  const commentsEndRef = useRef<HTMLDivElement>(null);

  const {
    sendMessage,
    isConnected,
    connectionStatus,
    updatePresence,
    onlineUsers
  } = useWebSocket('/api/websocket', {
    userId: currentUser.id,
    roomId: `project-${project.id}`,
    onMessage: handleWebSocketMessage,
    onConnect: () => {
      updatePresence({ status: 'online' });
    }
  });

  function handleWebSocketMessage(message: any) {
    switch (message.type) {
      case 'project:update':
        if (message.userId !== currentUser.id && onUpdateProject) {
          onUpdateProject(message.data.project);
        }
        break;

      case 'project:comment':
        setComments(prev => [...prev, message.data.comment]);
        break;

      case 'project:activity':
        setActivities(prev => [message.data.activity, ...prev].slice(0, 50)); // Keep last 50 activities
        break;

      case 'presence_update':
        // Handle user presence updates
        break;

      case 'project:share_created':
        // Handle new share link creation
        break;
    }
  }

  const handleAddComment = useCallback(() => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      content: newComment.trim(),
      timestamp: Date.now()
    };

    setComments(prev => [...prev, comment]);
    setNewComment('');

    if (isConnected) {
      sendMessage({
        type: 'project:comment',
        data: { comment }
      });
    }

    // Add activity
    addActivity('commented', { comment: comment.content });
  }, [newComment, currentUser, isConnected, sendMessage]);

  const addActivity = useCallback((action: string, details?: any) => {
    const activity: Activity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      details,
      timestamp: Date.now()
    };

    setActivities(prev => [activity, ...prev]);

    if (isConnected) {
      sendMessage({
        type: 'project:activity',
        data: { activity }
      });
    }
  }, [currentUser, isConnected, sendMessage]);

  const handleCreateShareLink = useCallback(() => {
    if (!project.permissions.canShare || readOnly) return;

    const shareLink: ShareLink = {
      id: `share-${Date.now()}`,
      token: Math.random().toString(36).substr(2, 16),
      permissions: newShareLink.permissions,
      expiresAt: newShareLink.expiresAt,
      createdAt: Date.now(),
      createdBy: currentUser
    };

    const updatedProject = {
      ...project,
      shareLinks: [...project.shareLinks, shareLink],
      updatedAt: Date.now()
    };

    onUpdateProject?.(updatedProject);

    if (isConnected) {
      sendMessage({
        type: 'project:share_created',
        data: { shareLink }
      });
    }

    addActivity('created share link', { permissions: newShareLink.permissions });
    setShareDialogOpen(false);
    setNewShareLink({ permissions: ['view'] });
  }, [project, currentUser, newShareLink, readOnly, onUpdateProject, isConnected, sendMessage, addActivity]);

  const handleCopyShareLink = useCallback((token: string) => {
    const url = `${window.location.origin}/collab/${token}`;
    navigator.clipboard.writeText(url);
    // You could add a toast notification here
  }, []);

  const handleDeleteShareLink = useCallback((linkId: string) => {
    if (!project.permissions.canDelete || readOnly) return;

    const updatedProject = {
      ...project,
      shareLinks: project.shareLinks.filter(link => link.id !== linkId),
      updatedAt: Date.now()
    };

    onUpdateProject?.(updatedProject);
    addActivity('deleted share link');
  }, [project, readOnly, onUpdateProject, addActivity]);

  const formatTimestamp = useCallback((timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }, []);

  // Auto-scroll comments to bottom
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const generateShareUrl = (token: string) => {
    return `${window.location.origin}/collab/${token}`;
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <Input
                  value={project.name}
                  onChange={(e) => !readOnly && onUpdateProject?.({
                    ...project,
                    name: e.target.value,
                    updatedAt: Date.now()
                  })}
                  className="text-xl font-semibold bg-slate-800 border-slate-600 text-white"
                  disabled={readOnly}
                />
                <div className="flex items-center gap-2">
                  {project.settings.isPublic ? (
                    <Globe className="h-4 w-4 text-green-400" />
                  ) : (
                    <Lock className="h-4 w-4 text-yellow-400" />
                  )}
                  <Badge variant={project.settings.isPublic ? "default" : "secondary"} className="text-xs">
                    {project.settings.isPublic ? 'Public' : 'Private'}
                  </Badge>
                </div>
              </div>
              <Input
                value={project.description}
                onChange={(e) => !readOnly && onUpdateProject?.({
                  ...project,
                  description: e.target.value,
                  updatedAt: Date.now()
                })}
                className="text-sm text-slate-400 bg-slate-800 border-slate-600 mt-2"
                placeholder="Project description"
                disabled={readOnly}
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm text-slate-400">
                <Users className="h-4 w-4" />
                <span>{project.members.length + 1}</span>
              </div>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />

              {project.permissions.canShare && (
                <Button
                  variant="outline"
                  onClick={() => setShareDialogOpen(true)}
                  className="gap-2 border-slate-600"
                  disabled={readOnly}
                >
                  <Share className="h-4 w-4" />
                  Share
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => {
                  // Download project data
                  const projectData = JSON.stringify(project, null, 2);
                  const blob = new Blob([projectData], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${project.name.replace(/\s+/g, '_')}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="gap-2 border-slate-600"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700">
              <FileText className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="circuits" className="data-[state=active]:bg-slate-700">
              <Zap className="h-4 w-4 mr-2" />
              Circuits ({project.circuits.length})
            </TabsTrigger>
            <TabsTrigger value="discussion" className="data-[state=active]:bg-slate-700">
              <MessageCircle className="h-4 w-4 mr-2" />
              Discussion ({comments.length})
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-slate-700">
              <History className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="flex-1 overflow-auto">
            <div className="space-y-4">
              {/* Project Info */}
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Project Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{project.circuits.length}</div>
                      <div className="text-sm text-slate-400">Circuits</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{project.members.length + 1}</div>
                      <div className="text-sm text-slate-400">Members</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{project.shareLinks.length}</div>
                      <div className="text-sm text-slate-400">Share Links</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{formatTimestamp(project.updatedAt)}</div>
                      <div className="text-sm text-slate-400">Last Updated</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Team Members */}
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-400" />
                    Team Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Owner */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-500 text-white">
                          {project.owner.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium text-white">{project.owner.name}</div>
                        <div className="text-sm text-slate-400">{project.owner.email}</div>
                      </div>
                      <Badge variant="default" className="bg-blue-500">Owner</Badge>
                    </div>

                    {/* Members */}
                    {project.members.map((member) => (
                      <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback style={{ backgroundColor: member.color }} className="text-white">
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium text-white">{member.name}</div>
                          <div className="text-sm text-slate-400">{member.email}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            member.status === 'online' ? 'bg-green-500' :
                            member.status === 'away' ? 'bg-yellow-500' : 'bg-slate-500'
                          }`} />
                          <span className="text-sm text-slate-400">{member.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Share Links */}
              {project.shareLinks.length > 0 && (
                <Card className="bg-slate-900 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Share className="h-5 w-5 text-green-400" />
                      Share Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {project.shareLinks.map((link) => (
                        <div key={link.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800">
                          <div className="flex-1">
                            <div className="font-mono text-sm text-white truncate">
                              {generateShareUrl(link.token)}
                            </div>
                            <div className="text-xs text-slate-400">
                              {link.permissions.join(', ')} • Created {formatTimestamp(link.createdAt)}
                              {link.expiresAt && ` • Expires ${formatTimestamp(link.expiresAt)}`}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopyShareLink(link.token)}
                              className="h-7 w-7 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            {project.permissions.canDelete && !readOnly && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteShareLink(link.id)}
                                className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="circuits" className="flex-1 overflow-hidden">
            {selectedCircuit ? (
              <div className="h-full">
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCircuit(null)}
                    className="gap-2 border-slate-600"
                  >
                    ← Back to Circuits
                  </Button>
                  <span className="text-sm text-slate-400">
                    Editing: {selectedCircuit.name}
                  </span>
                </div>
                <div className="h-[calc(100%-3rem)]">
                  <CircuitBuilder
                    initialCircuit={selectedCircuit}
                    onSave={(circuit) => {
                      const updatedProject = {
                        ...project,
                        circuits: project.circuits.map(c =>
                          c.id === circuit.id ? circuit : c
                        ),
                        updatedAt: Date.now()
                      };
                      onUpdateProject?.(updatedProject);
                      addActivity('updated circuit', { circuitName: circuit.name });
                    }}
                    onExport={(circuit) => {
                      // Handle circuit export
                    }}
                    roomId={`project-${project.id}-circuit-${selectedCircuit.id}`}
                    userId={currentUser.id}
                    readOnly={readOnly}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {project.circuits.length === 0 ? (
                  <Card className="bg-slate-900 border-slate-700">
                    <CardContent className="text-center py-12">
                      <Zap className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No Circuits Yet</h3>
                      <p className="text-slate-400 mb-4">Create your first quantum circuit for this project.</p>
                      <Button
                        onClick={() => {
                          const newCircuit: QuantumCircuit = {
                            id: `circuit-${Date.now()}`,
                            name: 'New Circuit',
                            description: '',
                            qubitCount: 4,
                            gates: [],
                            metadata: {
                              created: Date.now(),
                              modified: Date.now(),
                              version: 1
                            }
                          };
                          setSelectedCircuit(newCircuit);
                        }}
                        disabled={readOnly}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Circuit
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {project.circuits.map((circuit) => (
                      <Card
                        key={circuit.id}
                        className="cursor-pointer hover:border-primary/50 transition-all bg-slate-900 border-slate-700"
                        onClick={() => setSelectedCircuit(circuit)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base text-white">{circuit.name}</CardTitle>
                          {circuit.description && (
                            <CardDescription className="text-xs text-slate-400 line-clamp-2">
                              {circuit.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span>{circuit.qubitCount} qubits</span>
                            <span>{circuit.gates.length} gates</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-2">
                            Modified {formatTimestamp(circuit.metadata?.modified || circuit.metadata?.created || 0)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="discussion" className="flex-1 overflow-hidden flex flex-col">
            <Card className="bg-slate-900 border-slate-700 flex-1 flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-white">Discussion</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {/* Comments List */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {comments.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-slate-600 mx-auto mb-2" />
                      <p className="text-slate-400">No comments yet. Start the conversation!</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-slate-800">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="bg-blue-500 text-white text-sm">
                            {comment.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-white text-sm">{comment.userName}</span>
                            <span className="text-xs text-slate-500">{formatTimestamp(comment.timestamp)}</span>
                          </div>
                          <p className="text-sm text-slate-300">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={commentsEndRef} />
                </div>

                {/* Comment Input */}
                {!readOnly && (
                  <div className="border-t border-slate-700 pt-4">
                    <div className="flex gap-2">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 bg-slate-800 border-slate-600 text-white resize-none"
                        rows={2}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment();
                          }
                        }}
                      />
                      <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                        Send
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="flex-1 overflow-auto">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-white text-sm">{activity.userName}</span>
                            <span className="text-xs text-slate-500">{formatTimestamp(activity.timestamp)}</span>
                          </div>
                          <p className="text-sm text-slate-300">
                            {activity.action}
                            {activity.details && (
                              <span className="text-slate-400">
                                {' ' + JSON.stringify(activity.details)}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Share Dialog */}
      {shareDialogOpen && (
        <Card className="absolute top-4 right-4 w-96 bg-slate-900 border-slate-700 z-50">
          <CardHeader>
            <CardTitle className="text-white">Share Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Permissions</Label>
              <div className="space-y-2 mt-2">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newShareLink.permissions.includes('view')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewShareLink(prev => ({
                          ...prev,
                          permissions: [...prev.permissions, 'view']
                        }));
                      } else {
                        setNewShareLink(prev => ({
                          ...prev,
                          permissions: prev.permissions.filter(p => p !== 'view')
                        }));
                      }
                    }}
                  />
                  Can view
                </Label>
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newShareLink.permissions.includes('edit')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewShareLink(prev => ({
                          ...prev,
                          permissions: [...prev.permissions, 'edit']
                        }));
                      } else {
                        setNewShareLink(prev => ({
                          ...prev,
                          permissions: prev.permissions.filter(p => p !== 'edit')
                        }));
                      }
                    }}
                  />
                  Can edit
                </Label>
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newShareLink.permissions.includes('share')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewShareLink(prev => ({
                          ...prev,
                          permissions: [...prev.permissions, 'share']
                        }));
                      } else {
                        setNewShareLink(prev => ({
                          ...prev,
                          permissions: prev.permissions.filter(p => p !== 'share')
                        }));
                      }
                    }}
                  />
                  Can share
                </Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateShareLink} className="flex-1">
                Create Link
              </Button>
              <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}