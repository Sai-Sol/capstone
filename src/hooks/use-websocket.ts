"use client";

import { useEffect, useRef, useState } from "react";

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus('connecting');
    
    try {
      // For demo purposes, we'll simulate WebSocket connection
      // In a real implementation, you would use: new WebSocket(url)
      
      // Simulate connection success
      setTimeout(() => {
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
        onConnect?.();
        
        // Simulate periodic messages
        const messageInterval = setInterval(() => {
          if (connectionStatus === 'connected') {
            const mockMessage: WebSocketMessage = {
              type: 'transaction',
              data: {
                hash: `0x${Math.random().toString(16).substr(2, 8)}...`,
                type: ["Transfer", "Swap", "Contract Call"][Math.floor(Math.random() * 3)],
                value: (Math.random() * 10).toFixed(4),
                gasPrice: (10 + Math.random() * 20).toFixed(1)
              },
              timestamp: Date.now()
            };
            
            setLastMessage(mockMessage);
            onMessage?.(mockMessage);
          }
        }, 5000);

        // Store interval reference for cleanup
        wsRef.current = { close: () => clearInterval(messageInterval) } as any;
        
      }, 1000);
      
    } catch (error) {
      setConnectionStatus('error');
      onError?.(error as Event);
      scheduleReconnect();
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setConnectionStatus('disconnected');
    onDisconnect?.();
  };

  const scheduleReconnect = () => {
    if (reconnectAttemptsRef.current < maxReconnectAttempts) {
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectAttemptsRef.current++;
        connect();
      }, reconnectInterval);
    }
  };

  const sendMessage = (message: any) => {
    if (wsRef.current && isConnected) {
      // In a real WebSocket implementation:
      // wsRef.current.send(JSON.stringify(message));
      
      // For demo, we'll just log the message
      console.log('Sending WebSocket message:', message);
    }
  };

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [url]);

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
    reconnectAttempts: reconnectAttemptsRef.current
  };
}