"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  MessageSquare,
  Phone,
  Video,
  Search,
  Settings,
  MoreVertical,
  Circle,
  Bell,
  BellOff,
  Pin,
  Mute,
  Volume2,
  UserPlus,
  Shield,
  Crown,
  Zap,
  Activity
} from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  cursor?: { x: number; y: number };
  currentActivity?: string;
  color: string;
  lastSeen: number;
  isTyping?: boolean;
}

export interface DirectMessage {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  timestamp: number;
  read: boolean;
  type: 'text' | 'file' | 'circuit';
}

interface TeamCollaborationProps {
  projectId: string;
  currentUserId: string;
  members: TeamMember[];
  onInviteMember?: () => void;
  onMemberRoleChange?: (userId: string, role: TeamMember['role']) => void;
  onRemoveMember?: (userId: string) => void;
}

const USER_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
];

const ACTIVITY_MESSAGES = [
  'is viewing the circuit',
  'is editing a gate',
  'is adding a new gate',
  'is optimizing the circuit',
  'is running a simulation',
  'is viewing properties',
  'is analyzing results'
];

export function TeamCollaboration({
  projectId,
  currentUserId,
  members,
  onInviteMember,
  onMemberRoleChange,
  onRemoveMember
}: TeamCollaborationProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [userActivities, setUserActivities] = useState<Record<string, string>>({});
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    sendMessage,
    isConnected,
    updatePresence
  } = useWebSocket('/api/websocket', {
    userId: currentUserId,
    roomId: `project-${projectId}-team`,
    onMessage: handleWebSocketMessage,
    onConnect: () => {
      updatePresence({ status: 'online' });
    }
  });

  function handleWebSocketMessage(message: any) {
    switch (message.type) {
      case 'presence_update':
        if (message.data.userId !== currentUserId) {
          setUserActivities(prev => ({
            ...prev,
            [message.data.userId]: message.data.activity || 'is active'
          }));
        }
        break;

      case 'user_typing':
        if (message.data.userId !== currentUserId) {
          setUserActivities(prev => ({
            ...prev,
            [message.data.userId]: 'is typing...'
          }));
          setTimeout(() => {
            setUserActivities(prev => ({
              ...prev,
              [message.data.userId]: prev[message.data.userId] === 'is typing...' ? 'is active' : prev[message.data.userId]
            }));
          }, 3000);
        }
        break;

      case 'direct_message':
        setDirectMessages(prev => [...prev, message.data.message]);
        if (notifications && message.data.message.fromUserId !== currentUserId) {
          // Show notification
          showNotification(message.data.message);
        }
        break;

      case 'call_request':
        // Handle incoming call request
        handleIncomingCall(message.data.fromUserId);
        break;
    }
  }

  const showNotification = (message: DirectMessage) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('New Message', {
        body: message.content,
        icon: '/favicon.ico'
      });
    }
  };

  const handleIncomingCall = (fromUserId: string) => {
    const caller = members.find(m => m.id === fromUserId);
    if (caller) {
      const acceptCall = window.confirm(`${caller.name} is calling you. Accept?`);
      if (acceptCall) {
        setIsInCall(true);
        sendMessage({
          type: 'call_accepted',
          data: { fromUserId, toUserId: fromUserId }
        });
      }
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedMember) return;

    const message: DirectMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fromUserId: currentUserId,
      toUserId: selectedMember.id,
      content: messageInput.trim(),
      timestamp: Date.now(),
      read: false,
      type: 'text'
    };

    setDirectMessages(prev => [...prev, message]);
    sendMessage({
      type: 'direct_message',
      data: { message }
    });

    setMessageInput('');
  };

  const handleStartCall = (memberId: string) => {
    sendMessage({
      type: 'call_request',
      data: { fromUserId: currentUserId, toUserId: memberId }
    });
    setIsInCall(true);
  };

  const handleRoleChange = (memberId: string, newRole: TeamMember['role']) => {
    onMemberRoleChange?.(memberId, newRole);
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !showOnlineOnly || member.status === 'online' || member.status === 'busy';
    return matchesSearch && matchesStatus;
  });

  const getMessagesForUser = (userId: string) => {
    return directMessages.filter(msg =>
      (msg.fromUserId === currentUserId && msg.toUserId === userId) ||
      (msg.fromUserId === userId && msg.toUserId === currentUserId)
    ).sort((a, b) => a.timestamp - b.timestamp);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-slate-500';
      default: return 'bg-slate-500';
    }
  };

  const getRoleIcon = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner': return <Crown className="h-3 w-3 text-yellow-400" />;
      case 'admin': return <Shield className="h-3 w-3 text-blue-400" />;
      case 'editor': return <Edit className="h-3 w-3 text-green-400" />;
      case 'viewer': return <Activity className="h-3 w-3 text-slate-400" />;
      default: return null;
    }
  };

  // Auto-scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [directMessages, selectedMember]);

  // Simulate user activities
  useEffect(() => {
    const interval = setInterval(() => {
      members.forEach(member => {
        if (member.id !== currentUserId && Math.random() > 0.7) {
          const randomActivity = ACTIVITY_MESSAGES[Math.floor(Math.random() * ACTIVITY_MESSAGES.length)];
          setUserActivities(prev => ({
            ...prev,
            [member.id]: randomActivity
          }));
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [members, currentUserId]);

  return (
    <div className="flex h-full bg-slate-900 border-slate-700">
      {/* Members List */}
      <div className="w-80 border-r border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-400" />
              Team Members
              <Badge variant="secondary" className="text-xs">
                {members.filter(m => m.status === 'online').length} online
              </Badge>
            </h3>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setNotifications(!notifications)}
                className="h-8 w-8 p-0"
              >
                {notifications ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onInviteMember}
                className="h-8 w-8 p-0"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-600 text-white text-sm"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="rounded border-slate-600"
              />
              Show online only
            </label>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className={`p-3 border-b border-slate-800 cursor-pointer transition-colors ${
                selectedMember?.id === member.id ? 'bg-slate-800' : 'hover:bg-slate-800/50'
              }`}
              onClick={() => setSelectedMember(member)}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback style={{ backgroundColor: member.color }} className="text-white">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${getStatusColor(member.status)}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white truncate">{member.name}</span>
                    {getRoleIcon(member.role)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{member.email}</span>
                    {member.isTyping && (
                      <span className="text-blue-400">typing...</span>
                    )}
                  </div>
                  {userActivities[member.id] && (
                    <div className="text-xs text-slate-500 truncate">
                      {userActivities[member.id]}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedMember ? (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-slate-700 bg-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback style={{ backgroundColor: selectedMember.color }} className="text-white">
                    {selectedMember.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-white">{selectedMember.name}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedMember.status)}`} />
                    {selectedMember.status}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStartCall(selectedMember.id)}
                  disabled={isInCall}
                  className="gap-2 border-slate-600"
                >
                  <Phone className="h-4 w-4" />
                  {isInCall ? 'In Call' : 'Call'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 border-slate-600"
                >
                  <Video className="h-4 w-4" />
                  Video
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {getMessagesForUser(selectedMember.id).map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.fromUserId === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.fromUserId === currentUserId
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-white'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {isInCall && (
            <div className="p-3 bg-green-900/20 border-b border-green-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-400">📞 In call with {selectedMember.name}</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsMuted(!isMuted)}
                    className="h-8 w-8 p-0"
                  >
                    {isMuted ? <Mute className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setIsInCall(false)}
                    className="h-8 px-3"
                  >
                    End Call
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 border-t border-slate-700">
            <div className="flex gap-2">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={`Message ${selectedMember.name}...`}
                className="flex-1 bg-slate-800 border-slate-600 text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Users className="h-16 w-16 text-slate-600 mx-auto" />
            <h3 className="text-xl font-semibold text-white">Select a team member</h3>
            <p className="text-slate-400">Choose a team member to start chatting or see their activity.</p>
          </div>
        </div>
      )}
    </div>
  );
}