"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
  userId?: string;
  roomId?: string;
  sequenceId?: number;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  userId?: string;
  roomId?: string;
  enableMessageQueue?: boolean;
}

interface QueuedMessage {
  message: any;
  timestamp: number;
  retryCount: number;
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    userId,
    roomId,
    enableMessageQueue = true
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const messageQueueRef = useRef<QueuedMessage[]>([]);
  const sequenceIdRef = useRef(0);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getNextSequenceId = useCallback(() => {
    return ++sequenceIdRef.current;
  }, []);

  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'heartbeat',
          timestamp: Date.now(),
          userId,
          roomId
        }));
      }
    }, 30000); // 30 seconds
  }, [userId, roomId]);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const processMessageQueue = useCallback(() => {
    if (messageQueueRef.current.length === 0) return;

    const queuedMessages = [...messageQueueRef.current];
    messageQueueRef.current = [];

    queuedMessages.forEach(({ message, retryCount }) => {
      if (retryCount < 3) {
        sendMessage(message, false);
      }
    });
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    setIsReconnecting(reconnectAttempts > 0);
    setConnectionStatus('connecting');

    try {
      const wsUrl = url.startsWith('ws://') || url.startsWith('wss://')
        ? url
        : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}${url}`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        setConnectionStatus('connected');
        setReconnectAttempts(0);
        setIsReconnecting(false);

        // Send authentication and room join
        if (userId || roomId) {
          sendMessage({
            type: 'auth',
            data: { userId, roomId }
          }, false);
        }

        startHeartbeat();
        processMessageQueue();
        onConnect?.();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);

          // Handle heartbeat response
          if (message.type === 'heartbeat_ack') {
            return;
          }

          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        stopHeartbeat();
        onDisconnect?.();

        // Attempt reconnection if not explicitly closed
        if (!event.wasClean && reconnectAttempts < maxReconnectAttempts) {
          const timeout = reconnectInterval * Math.pow(2, reconnectAttempts); // Exponential backoff

          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, timeout);
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          setConnectionStatus('error');
          onError?.(new Error('Max reconnection attempts reached'));
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
        onError?.(error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('error');
      onError?.(error as Event);
    }
  }, [url, userId, roomId, reconnectAttempts, maxReconnectAttempts, reconnectInterval, onConnect, onDisconnect, onError, startHeartbeat, stopHeartbeat, processMessageQueue]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    stopHeartbeat();

    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect');
      wsRef.current = null;
    }

    setIsConnected(false);
    setConnectionStatus('disconnected');
    setReconnectAttempts(0);
    setIsReconnecting(false);
    messageQueueRef.current = [];
  }, [stopHeartbeat]);

  const sendMessage = useCallback((message: any, queueIfOffline = enableMessageQueue) => {
    const messageWithMeta = {
      ...message,
      timestamp: Date.now(),
      userId,
      roomId,
      sequenceId: getNextSequenceId()
    };

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(messageWithMeta));
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
        if (queueIfOffline) {
          messageQueueRef.current.push({
            message: messageWithMeta,
            timestamp: Date.now(),
            retryCount: 0
          });
        }
      }
    } else if (queueIfOffline) {
      messageQueueRef.current.push({
        message: messageWithMeta,
        timestamp: Date.now(),
        retryCount: 0
      });
    } else {
      console.warn('WebSocket not connected, message dropped:', messageWithMeta);
    }
  }, [userId, roomId, enableMessageQueue, getNextSequenceId]);

  const joinRoom = useCallback((newRoomId: string) => {
    sendMessage({
      type: 'room_join',
      data: { roomId: newRoomId }
    });
  }, [sendMessage]);

  const leaveRoom = useCallback(() => {
    sendMessage({
      type: 'room_leave',
      data: { roomId }
    });
  }, [roomId, sendMessage]);

  const updatePresence = useCallback((data: any) => {
    sendMessage({
      type: 'presence_update',
      data
    });
  }, [sendMessage]);

  // Initialize connection
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []); // Only run once on mount

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      stopHeartbeat();
    };
  }, [stopHeartbeat]);

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
    reconnectAttempts,
    isReconnecting,
    joinRoom,
    leaveRoom,
    updatePresence,
    queuedMessages: messageQueueRef.current.length
  };
}