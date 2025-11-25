import { NextRequest, NextResponse } from 'next/server';

// Mock database - in production, this would be a real database
const projectsStore = new Map();
const projectMembersStore = new Map();
const shareLinksStore = new Map();

interface Project {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  privacy: 'private' | 'public';
  settings: {
    allowComments: boolean;
    allowFileUploads: boolean;
  };
  created_at: number;
  updated_at: number;
}

interface ProjectMember {
  project_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  joined_at: number;
}

interface ShareLink {
  id: string;
  project_id: string;
  token: string;
  permissions: string[];
  expires_at?: number;
  created_by: string;
  created_at: number;
}

// Helper functions
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function generateToken(): string {
  return Math.random().toString(36).substr(2, 16);
}

function getUserFromRequest(request: NextRequest): { id: string; email: string; name: string } | null {
  // In a real app, you'd extract this from JWT token or session
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    // Mock user for demo - in production, verify JWT
    return {
      id: 'user-demo-1',
      email: 'demo@example.com',
      name: 'Demo User'
    };
  }

  // For demo purposes, check for demo user in headers
  const userId = request.headers.get('x-user-id');
  const userEmail = request.headers.get('x-user-email');
  const userName = request.headers.get('x-user-name');

  if (userId && userEmail && userName) {
    return { id: userId, email: userEmail, name: userName };
  }

  return null;
}

function checkProjectPermission(
  projectId: string,
  userId: string,
  requiredRole: 'owner' | 'admin' | 'editor' | 'viewer'
): boolean {
  const members = projectMembersStore.get(projectId) as ProjectMember[] || [];
  const userMember = members.find(m => m.user_id === userId);

  if (!userMember) return false;

  const roleHierarchy = {
    'owner': 4,
    'admin': 3,
    'editor': 2,
    'viewer': 1
  };

  return roleHierarchy[userMember.role] >= roleHierarchy[requiredRole];
}

// GET /api/projects - List user projects
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter');
    const search = searchParams.get('search');

    // Get all projects where user is a member
    const userProjects: Project[] = [];
    for (const [projectId, project] of projectsStore.entries()) {
      const projectData = project as Project;
      const members = projectMembersStore.get(projectId) as ProjectMember[] || [];
      const isMember = members.some(m => m.user_id === user.id);

      if (isMember) {
        // Apply filters
        let includeProject = true;

        if (filter === 'owned') {
          includeProject = projectData.owner_id === user.id;
        } else if (filter === 'shared') {
          includeProject = projectData.owner_id !== user.id;
        }

        if (search && !projectData.name.toLowerCase().includes(search.toLowerCase()) &&
            !projectData.description.toLowerCase().includes(search.toLowerCase())) {
          includeProject = false;
        }

        if (includeProject) {
          // Add member info and permissions
          const userMember = members.find(m => m.user_id === user.id);
          userProjects.push({
            ...projectData,
            member_role: userMember?.role,
            can_edit: checkProjectPermission(projectId, user.id, 'editor'),
            can_share: checkProjectPermission(projectId, user.id, 'editor'),
            can_delete: checkProjectPermission(projectId, user.id, 'admin')
          });
        }
      }
    }

    return NextResponse.json({
      projects: userProjects,
      total: userProjects.length
    });

  } catch (error) {
    console.error('Error listing projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, privacy = 'private', settings = {} } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    const projectId = generateId();
    const now = Date.now();

    const project: Project = {
      id: projectId,
      name: name.trim(),
      description: description?.trim() || '',
      owner_id: user.id,
      privacy,
      settings: {
        allowComments: settings.allowComments ?? true,
        allowFileUploads: settings.allowFileUploads ?? true
      },
      created_at: now,
      updated_at: now
    };

    // Store project
    projectsStore.set(projectId, project);

    // Add owner as member
    const member: ProjectMember = {
      project_id: projectId,
      user_id: user.id,
      role: 'owner',
      joined_at: now
    };
    projectMembersStore.set(projectId, [member]);

    return NextResponse.json({
      project,
      message: 'Project created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/projects/[id] - Get specific project
export async function GET_PROJECT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;
    const project = projectsStore.get(projectId);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if user is a member
    if (!checkProjectPermission(projectId, user.id, 'viewer')) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get project members
    const members = projectMembersStore.get(projectId) || [];

    // Get share links
    const shareLinks = Array.from(shareLinksStore.values())
      .filter((link: ShareLink) => link.project_id === projectId);

    return NextResponse.json({
      project,
      members,
      shareLinks,
      permissions: {
        can_edit: checkProjectPermission(projectId, user.id, 'editor'),
        can_share: checkProjectPermission(projectId, user.id, 'editor'),
        can_delete: checkProjectPermission(projectId, user.id, 'admin')
      }
    });

  } catch (error) {
    console.error('Error getting project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[id] - Update project
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;
    const project = projectsStore.get(projectId);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if user can edit
    if (!checkProjectPermission(projectId, user.id, 'editor')) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, privacy, settings } = body;

    const updatedProject: Project = {
      ...project,
      ...(name && { name: name.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(privacy && { privacy }),
      ...(settings && { settings: { ...project.settings, ...settings } }),
      updated_at: Date.now()
    };

    projectsStore.set(projectId, updatedProject);

    return NextResponse.json({
      project: updatedProject,
      message: 'Project updated successfully'
    });

  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;
    const project = projectsStore.get(projectId);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if user can delete (owner or admin)
    if (!checkProjectPermission(projectId, user.id, 'admin')) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Only owners can delete projects
    const members = projectMembersStore.get(projectId) || [];
    const userMember = members.find((m: ProjectMember) => m.user_id === user.id);
    if (userMember?.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only project owners can delete projects' },
        { status: 403 }
      );
    }

    // Delete project and related data
    projectsStore.delete(projectId);
    projectMembersStore.delete(projectId);

    // Delete related share links
    for (const [linkId, link] of shareLinksStore.entries()) {
      if ((link as ShareLink).project_id === projectId) {
        shareLinksStore.delete(linkId);
      }
    }

    return NextResponse.json({
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/share - Create share link
export async function CREATE_SHARE_LINK(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;
    const project = projectsStore.get(projectId);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if user can share
    if (!checkProjectPermission(projectId, user.id, 'editor')) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { permissions = ['view'], expires_at } = body;

    const shareLink: ShareLink = {
      id: generateId(),
      project_id: projectId,
      token: generateToken(),
      permissions,
      expires_at,
      created_by: user.id,
      created_at: Date.now()
    };

    shareLinksStore.set(shareLink.id, shareLink);

    const shareUrl = `${request.nextUrl.origin}/collab/${shareLink.token}`;

    return NextResponse.json({
      share_link: shareLink,
      share_url: shareUrl,
      message: 'Share link created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating share link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/invite - Invite team member
export async function INVITE_MEMBER(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;
    const project = projectsStore.get(projectId);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if user can invite members
    if (!checkProjectPermission(projectId, user.id, 'admin')) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, role = 'viewer' } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // In a real app, you would send an email invitation here
    // For demo purposes, we'll create a pending invitation

    const invitationId = generateId();
    const now = Date.now();

    return NextResponse.json({
      invitation_id: invitationId,
      email,
      role,
      project_id: projectId,
      invited_by: user.id,
      created_at: now,
      message: 'Invitation sent successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error inviting member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}