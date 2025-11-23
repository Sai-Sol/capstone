"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  MessageSquare,
  Calendar,
  Clock,
  TrendingUp,
  Plus,
  Search,
  Filter,
  Star,
  GitBranch,
  Eye,
  MessageCircle,
  ThumbsUp,
  Share2,
  Bell,
  Settings,
  UserPlus,
  Hash,
  Lock,
  Globe,
  Zap,
  Target,
  Award
} from "lucide-react";

const mockCollaborations = [
  {
    id: "collab-001",
    title: "Quantum Error Correction Research",
    description: "Developing novel error correction codes for surface topologies",
    participants: 12,
    status: "active",
    tags: ["error-correction", "surface-code", "research"],
    progress: 75,
    lastActivity: "2 hours ago",
    creator: "Dr. Sarah Chen",
    privacy: "public"
  },
  {
    id: "collab-002",
    title: "VQE Algorithm Optimization",
    description: "Improving variational quantum eigensolver performance on noisy hardware",
    participants: 8,
    status: "active",
    tags: ["vqe", "optimization", "nisyq"],
    progress: 45,
    lastActivity: "5 hours ago",
    creator: "Prof. Michael Roberts",
    privacy: "team"
  },
  {
    id: "collab-003",
    title: "Quantum Machine Learning",
    description: "Exploring quantum neural networks and quantum data encoding",
    participants: 15,
    status: "planning",
    tags: ["qml", "neural-networks", "encoding"],
    progress: 20,
    lastActivity: "1 day ago",
    creator: "Dr. Emily Watson",
    privacy: "public"
  }
];

const mockTeamMembers = [
  {
    id: "user-001",
    name: "Dr. Sarah Chen",
    avatar: "/avatars/sarah.jpg",
    role: "Quantum Physicist",
    expertise: ["Quantum Algorithms", "Error Correction"],
    contributions: 156,
    reputation: 4.8
  },
  {
    id: "user-002",
    name: "Prof. Michael Roberts",
    avatar: "/avatars/michael.jpg",
    role: "Computer Scientist",
    expertise: ["Quantum Computing", "Optimization"],
    contributions: 203,
    reputation: 4.9
  },
  {
    id: "user-003",
    name: "Dr. Emily Watson",
    avatar: "/avatars/emily.jpg",
    role: "ML Researcher",
    expertise: ["Machine Learning", "Quantum ML"],
    contributions: 127,
    reputation: 4.7
  }
];

export default function CollaboratePage() {
  const [activeTab, setActiveTab] = useState("projects");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filteredProjects = mockCollaborations.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Quantum Collaboration Hub
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Connect with quantum researchers worldwide, share insights, and accelerate breakthrough discoveries together.
            </p>
          </div>
          <div className="flex gap-2">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
            <Button variant="outline">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Members
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card className="quantum-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Active Projects</span>
            </div>
            <div className="text-2xl font-bold text-primary">24</div>
            <p className="text-xs text-green-400">+3 this week</p>
          </CardContent>
        </Card>

        <Card className="quantum-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <span className="text-sm text-muted-foreground">Contributors</span>
            </div>
            <div className="text-2xl font-bold text-green-400">186</div>
            <p className="text-xs text-muted-foreground">From 42 institutions</p>
          </CardContent>
        </Card>

        <Card className="quantum-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              <span className="text-sm text-muted-foreground">Active Discussions</span>
            </div>
            <div className="text-2xl font-bold text-yellow-400">89</div>
            <p className="text-xs text-muted-foreground">243 responses</p>
          </CardContent>
        </Card>

        <Card className="quantum-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-5 w-5 text-purple-400" />
              <span className="text-sm text-muted-foreground">Published Papers</span>
            </div>
            <div className="text-2xl font-bold text-purple-400">15</div>
            <p className="text-xs text-muted-foreground">Co-authored results</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex gap-4 items-center"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects, discussions, or members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="team">Team Members</TabsTrigger>
            <TabsTrigger value="activity">Activity Feed</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="mt-6">
            <div className="grid gap-4">
              {filteredProjects.map((project, idx) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="quantum-card hover:scale-[1.02] transition-all cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{project.title}</h3>
                            <Badge variant={project.status === "active" ? "default" : "secondary"}>
                              {project.status}
                            </Badge>
                            {project.privacy === "team" ? (
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            ) : (
                              <Globe className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                          <p className="text-muted-foreground mb-3">{project.description}</p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.tags.map((tag, tagIdx) => (
                              <Badge key={tagIdx} variant="outline" className="text-xs">
                                <Hash className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                            <Users className="h-4 w-4" />
                            {project.participants}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {project.lastActivity}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src="" alt={project.creator} />
                            <AvatarFallback className="text-xs">{project.creator.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">{project.creator}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="discussions" className="mt-6">
            <Card className="quantum-card">
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">Active Discussions</h3>
                <p className="text-muted-foreground mb-4">
                  Join the conversation about quantum computing research and breakthroughs
                </p>
                <Button>View All Discussions</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockTeamMembers.map((member, idx) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="quantum-card hover:scale-[1.02] transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold">{member.name}</h4>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex flex-wrap gap-1">
                          {member.expertise.map((skill, skillIdx) => (
                            <Badge key={skillIdx} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span>{member.reputation}</span>
                        </div>
                        <div className="text-muted-foreground">
                          {member.contributions} contributions
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Message
                        </Button>
                        <Button size="sm" className="flex-1">
                          <UserPlus className="h-3 w-3 mr-1" />
                          Follow
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <Card className="quantum-card">
              <CardContent className="p-8 text-center">
                <Clock className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">Recent Activity</h3>
                <p className="text-muted-foreground mb-4">
                  Stay updated with the latest developments in your projects and discussions
                </p>
                <Button>View Activity Feed</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}