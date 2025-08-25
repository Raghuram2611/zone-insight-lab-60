import { useState, useEffect, useRef, useCallback } from 'react';

export interface ZoneData {
  population: number;
  avg_dwell: number;
  heat_score: number;
}

export interface WebSocketMessage {
  timestamp: string;
  zones: Record<string, ZoneData>;
}

export interface ReplayOptions {
  start: string; // HH:MM:SS
  zones: string[];
  speed?: number;
  alpha?: number;
  beta?: number;
  dwell_norm?: number;
}

export function useWebSocketReplay(baseUrl: string = 'ws://localhost:8000') {
  const [isConnected, setIsConnected] = useState(false);
  const [currentData, setCurrentData] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

  const connect = useCallback((options: ReplayOptions) => {
    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    const params = new URLSearchParams({
      start: options.start,
      zones: options.zones.join(','),
      speed: (options.speed || 1.0).toString(),
      ...(options.alpha && { alpha: options.alpha.toString() }),
      ...(options.beta && { beta: options.beta.toString() }),
      ...(options.dwell_norm && { dwell_norm: options.dwell_norm.toString() })
    });

    const wsUrl = `${baseUrl}/ws/replay?${params}`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        console.log('WebSocket connected to replay stream');
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          setCurrentData(data);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        console.log('WebSocket closed:', event.code, event.reason);
        
        // Attempt reconnection with exponential backoff
        if (reconnectAttempts.current < 5) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000;
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect(options);
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection failed');
      };
    } catch (err) {
      setError('Failed to create WebSocket connection');
      console.error('WebSocket creation error:', err);
    }
  }, [baseUrl]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setCurrentData(null);
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    isConnected,
    currentData,
    error
  };
}