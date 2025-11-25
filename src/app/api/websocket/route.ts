import { NextRequest } from 'next/server';
import { WebSocketServer, WebSocket } from 'ws';
import { parse } from 'url';

interface User {
  id: string;
  name?: string;
  avatar?: string;
  joinedAt: number;
  lastSeen: number;
  cursor?: { x: number; y: number };
  status: 'online' | 'away' | 'editing';
}

interface Room {
  id: string;
  users: Map<string, User>;
  createdAt: number;
  lastActivity: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface WSMessage {
  type: string;
  data: any;
  timestamp: number;
  userId?: string;
  roomId?: string;
  sequenceId?: number;
}

// Global state management
const rooms = new Map<string, Room>();
const userSessions = new Map<string, { ws: WebSocket; userId: string; roomId?: string }>();
const rateLimitMap = new Map<string, RateLimitEntry>();

// Configuration
const RATE_LIMIT_WINDOW = 10000; // 10 seconds
const RATE_LIMIT_MAX_REQUESTS = 10;
const MAX_CONNECTIONS_PER_ROOM = 100;
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const ROOM_CLEANUP_INTERVAL = 300000; // 5 minutes

// Rate limiting
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(userId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  entry.count++;
  return true;
}

// Room management
function getOrCreateRoom(roomId: string): Room {
  let room = rooms.get(roomId);

  if (!room) {
    room = {
      id: roomId,
      users: new Map(),
      createdAt: Date.now(),
      lastActivity: Date.now()
    };
    rooms.set(roomId, room);
  }

  return room;
}

function joinRoom(roomId: string, userId: string, userInfo: Partial<User>): void {
  const room = getOrCreateRoom(roomId);

  if (room.users.size >= MAX_CONNECTIONS_PER_ROOM) {
    throw new Error('Room is full');
  }

  const user: User = {
    id: userId,
    name: userInfo.name || `User ${userId.slice(0, 8)}`,
    avatar: userInfo.avatar || '',
    joinedAt: Date.now(),
    lastSeen: Date.now(),
    status: 'online'
  };

  room.users.set(userId, user);
  room.lastActivity = Date.now();
}

function leaveRoom(roomId: string, userId: string): void {
  const room = rooms.get(roomId);
  if (room) {
    room.users.delete(userId);
    room.lastActivity = Date.now();

    // Clean up empty rooms
    if (room.users.size === 0) {
      rooms.delete(roomId);
    }
  }
}

function broadcastToRoom(roomId: string, message: WSMessage, excludeUserId?: string): void {
  const room = rooms.get(roomId);
  if (!room) return;

  const messageStr = JSON.stringify(message);

  room.users.forEach((user) => {
    if (user.id !== excludeUserId) {
      const session = userSessions.get(user.id);
      if (session?.ws.readyState === WebSocket.OPEN) {
        try {
          session.ws.send(messageStr);
        } catch (error) {
          console.error(`Failed to send message to user ${user.id}:`, error);
        }
      }
    }
  });
}

function updateUserPresence(roomId: string, userId: string, presence: Partial<User>): void {
  const room = rooms.get(roomId);
  if (room) {
    const user = room.users.get(userId);
    if (user) {
      Object.assign(user, presence);
      user.lastSeen = Date.now();
      room.lastActivity = Date.now();
    }
  }
}

// Cleanup inactive users and rooms
function cleanupInactiveRooms(): void {
  const now = Date.now();
  const inactiveThreshold = 300000; // 5 minutes

  rooms.forEach((room, roomId) => {
    if (now - room.lastActivity > inactiveThreshold) {
      room.users.forEach((user, userId) => {
        const session = userSessions.get(userId);
        if (session?.ws.readyState !== WebSocket.OPEN) {
          leaveRoom(roomId, userId);
        }
      });

      if (room.users.size === 0) {
        rooms.delete(roomId);
      }
    }
  });

  // Clean up rate limit entries
  rateLimitMap.forEach((entry, userId) => {
    if (now > entry.resetTime) {
      rateLimitMap.delete(userId);
    }
  });
}

// WebSocket message handler
function handleMessage(ws: WebSocket, userId: string, message: WSMessage): void {
  try {
    const { type, data, roomId } = message;

    // Rate limiting
    if (!checkRateLimit(userId)) {
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: 'Rate limit exceeded' },
        timestamp: Date.now()
      }));
      return;
    }

    switch (type) {
      case 'auth':
        // Authentication handled during connection
        break;

      case 'room_join':
        if (data?.roomId && userId) {
          try {
            joinRoom(data.roomId, userId, data.userInfo || {});

            // Store user session with room
            const session = userSessions.get(userId);
            if (session) {
              session.roomId = data.roomId;
            }

            // Notify others in the room
            broadcastToRoom(data.roomId, {
              type: 'user_joined',
              data: { userId, userInfo: data.userInfo },
              timestamp: Date.now(),
              roomId: data.roomId
            }, userId);

            // Send current room state to user
            const room = rooms.get(data.roomId);
            if (room) {
              ws.send(JSON.stringify({
                type: 'room_state',
                data: {
                  roomId: data.roomId,
                  users: Array.from(room.users.values())
                },
                timestamp: Date.now()
              }));
            }
          } catch (error) {
            ws.send(JSON.stringify({
              type: 'error',
              data: { message: error instanceof Error ? error.message : 'Failed to join room' },
              timestamp: Date.now()
            }));
          }
        }
        break;

      case 'room_leave':
        if (roomId && userId) {
          leaveRoom(roomId, userId);

          // Update user session
          const session = userSessions.get(userId);
          if (session) {
            session.roomId = undefined;
          }

          // Notify others
          broadcastToRoom(roomId, {
            type: 'user_left',
            data: { userId },
            timestamp: Date.now(),
            roomId
          });
        }
        break;

      case 'circuit:gate_add':
      case 'circuit:gate_remove':
      case 'circuit:gate_move':
        if (roomId && userId) {
          // Circuit collaboration events
          broadcastToRoom(roomId, {
            type,
            data,
            timestamp: Date.now(),
            userId,
            roomId,
            sequenceId: message.sequenceId
          }, userId);
        }
        break;

      case 'presence_update':
        if (roomId && userId) {
          updateUserPresence(roomId, userId, data);

          broadcastToRoom(roomId, {
            type: 'presence_update',
            data: { userId, ...data },
            timestamp: Date.now(),
            roomId
          });
        }
        break;

      case 'project:share':
      case 'project:update':
      case 'project:comment':
        if (roomId && userId) {
          // Project collaboration events
          broadcastToRoom(roomId, {
            type,
            data,
            timestamp: Date.now(),
            userId,
            roomId
          });
        }
        break;

      case 'heartbeat':
        // Respond with heartbeat acknowledgment
        ws.send(JSON.stringify({
          type: 'heartbeat_ack',
          timestamp: Date.now()
        }));

        if (roomId && userId) {
          updateUserPresence(roomId, userId, { lastSeen: Date.now() });
        }
        break;

      default:
        console.warn(`Unknown message type: ${type}`);
    }
  } catch (error) {
    console.error('Error handling message:', error);
    ws.send(JSON.stringify({
      type: 'error',
      data: { message: 'Internal server error' },
      timestamp: Date.now()
    }));
  }
}

// WebSocket upgrade handler
export async function GET(request: NextRequest) {
  // This is a fallback - Next.js doesn't support WebSocket upgrades directly in API routes
  // In production, you would use a dedicated WebSocket server or Next.js Socket.IO integration

  return new Response(
    JSON.stringify({
      error: 'WebSocket connections should use wss://localhost:3000/api/websocket',
      message: 'Please connect to the WebSocket endpoint directly'
    }),
    {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// For production deployment, you would create a dedicated WebSocket server
// that can handle upgrades properly. This is a simplified implementation
// for demonstration purposes.

export const runtime = 'edge';