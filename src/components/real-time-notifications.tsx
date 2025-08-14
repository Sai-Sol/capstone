"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/use-websocket";
import { Bell, CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: number;
  autoClose?: boolean;
}

export default function RealTimeNotifications() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const { isConnected: wsConnected, lastMessage } = useWebSocket('wss://api.quantumchain.io/ws', {
    onMessage: (message) => {
      setConnectionError(null);
      if (isEnabled && message.type === 'transaction') {
        const notification: Notification = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'success',
          title: 'Transaction Confirmed',
          message: `${message.data.type} transaction completed: ${message.data.value} ETH`,
          timestamp: message.timestamp,
          autoClose: true
        };
        
        addNotification(notification);
        
        // Also show toast for important transactions
        if (parseFloat(message.data.value) > 1) {
          toast({
            title: "Large Transaction Detected",
            description: `${message.data.value} ETH transaction confirmed`,
          });
        }
      }
    },
    onConnect: () => {
      setConnectionError(null);
      if (isEnabled) {
        const notification: Notification = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'success',
          title: 'Connected',
          message: 'Real-time updates are now active',
          timestamp: Date.now(),
          autoClose: true
        };
        addNotification(notification);
      }
    },
    onDisconnect: () => {
      setConnectionError("Real-time updates disconnected");
      if (isEnabled) {
        const notification: Notification = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'warning',
          title: 'Disconnected',
          message: 'Real-time updates are temporarily unavailable',
          timestamp: Date.now(),
          autoClose: false
        };
        addNotification(notification);
      }
    },
    onError: (error) => {
      setConnectionError("Connection error occurred");
      console.error("WebSocket error:", error);
    }
  });

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only 5 notifications
    
    if (notification.autoClose) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return AlertTriangle;
      default: return Info;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-500/20 bg-green-500/5';
      case 'warning': return 'border-yellow-500/20 bg-yellow-500/5';
      case 'error': return 'border-red-500/20 bg-red-500/5';
      default: return 'border-blue-500/20 bg-blue-500/5';
    }
  };

  if (!isEnabled || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => {
          const Icon = getNotificationIcon(notification.type);
          
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`p-4 ${getNotificationColor(notification.type)} border backdrop-blur-sm`}>
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 mt-0.5 ${
                    notification.type === 'success' ? 'text-green-400' :
                    notification.type === 'warning' ? 'text-yellow-400' :
                    notification.type === 'error' ? 'text-red-400' :
                    'text-blue-400'
                  }`} />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm">{notification.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground/60 mt-2">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-60 hover:opacity-100"
                    onClick={() => removeNotification(notification.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}