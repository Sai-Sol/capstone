interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

interface Subscription {
  id: string;
  channel: string;
  callback: (data: any) => void;
}

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private subscriptions: Map<string, Subscription> = new Map();
  private reconnectAttempts = 0;
  private heartbeatTimeout: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private isDestroyed = false;

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      ...config
    };
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting || this.isConnected()) {
        resolve();
        return;
      }

      this.isConnecting = true;

      try {
        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.send('subscribe', { channels: Array.from(this.subscriptions.values()).map(s => s.channel) });
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.isConnecting = false;
          this.stopHeartbeat();
          this.handleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private handleMessage(message: WebSocketMessage) {
    const subscription = Array.from(this.subscriptions.values()).find(s => s.channel === message.type);
    if (subscription) {
      subscription.callback(message.data);
    }
  }

  private handleReconnect() {
    if (this.isDestroyed || this.reconnectAttempts >= (this.config.maxReconnectAttempts || 10)) {
      return;
    }

    this.reconnectAttempts++;
    console.log(`Reconnection attempt ${this.reconnectAttempts}`);

    setTimeout(() => {
      if (!this.isDestroyed) {
        this.connect().catch(console.error);
      }
    }, this.config.reconnectInterval);
  }

  private startHeartbeat() {
    if (this.config.heartbeatInterval) {
      this.heartbeatTimeout = setInterval(() => {
        if (this.isConnected()) {
          this.send('ping', {});
        }
      }, this.config.heartbeatInterval);
    }
  }

  private stopHeartbeat() {
    if (this.heartbeatTimeout) {
      clearInterval(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  send(type: string, data: any): boolean {
    if (!this.isConnected()) {
      return false;
    }

    try {
      const message: WebSocketMessage = {
        type,
        data,
        timestamp: Date.now()
      };
      this.ws!.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      return false;
    }
  }

  subscribe(channel: string, callback: (data: any) => void): string {
    const id = Math.random().toString(36).substr(2, 9);
    const subscription: Subscription = { id, channel, callback };
    this.subscriptions.set(id, subscription);

    if (this.isConnected()) {
      this.send('subscribe', { channels: [channel] });
    }

    return id;
  }

  unsubscribe(id: string): void {
    const subscription = this.subscriptions.get(id);
    if (subscription) {
      this.subscriptions.delete(id);
      if (this.isConnected()) {
        this.send('unsubscribe', { channels: [subscription.channel] });
      }
    }
  }

  destroy(): void {
    this.isDestroyed = true;
    this.stopHeartbeat();
    this.subscriptions.clear();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Global WebSocket manager instance
let wsManager: WebSocketManager | null = null;

export function getWebSocketManager(): WebSocketManager {
  if (!wsManager) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:9002/ws';
    wsManager = new WebSocketManager({ url: wsUrl });
  }
  return wsManager;
}

export function initializeWebSocket(): Promise<void> {
  const manager = getWebSocketManager();
  return manager.connect();
}

// React hook for WebSocket integration
import { useEffect, useState, useCallback } from 'react';

export function useWebSocket(channel: string) {
  const [data, setData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const manager = getWebSocketManager();

    const handleConnect = () => {
      setIsConnected(true);
      setError(null);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const subscriptionId = manager.subscribe(channel, (messageData) => {
      setData(messageData);
    });

    if (manager.isConnected()) {
      setIsConnected(true);
    } else {
      manager.connect().catch((err) => {
        setError(err.message);
      });
    }

    return () => {
      manager.unsubscribe(subscriptionId);
    };
  }, [channel]);

  const sendData = useCallback((type: string, data: any) => {
    const manager = getWebSocketManager();
    return manager.send(type, data);
  }, []);

  return { data, isConnected, error, sendData };
}