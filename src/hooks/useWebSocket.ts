import { useEffect, useRef, useState } from "react";

export interface ZoneData {
  population: number;
  avg_time: number;
  heat_score: number;
}

export interface WebSocketData {
  store_id: string;
  timestamp: string;
  zones: Record<string, ZoneData>;
}

export interface HistoricalData {
  [timestamp: string]: WebSocketData;
}

export function useWebSocket() {
  const [liveData, setLiveData] = useState<WebSocketData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData>({});
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;
    
    const connectWebSocket = () => {
      try {
        ws.current = new WebSocket("ws://localhost:8000/ws");

        ws.current.onopen = () => {
          setIsConnected(true);
          reconnectAttempts = 0;
          console.log("Live WebSocket connected");
        };

        ws.current.onmessage = (event) => {
          try {
            const data: WebSocketData = JSON.parse(event.data);
            setLiveData(data);
            
            // Store in historical data
            setHistoricalData(prev => ({
              ...prev,
              [data.timestamp]: data
            }));
          } catch (error) {
            console.error("Error parsing WebSocket data:", error);
          }
        };

        ws.current.onclose = () => {
          setIsConnected(false);
          
          // Only attempt reconnection if under max attempts
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            const delay = Math.pow(2, reconnectAttempts) * 1000; // Exponential backoff
            setTimeout(connectWebSocket, delay);
          } else {
            console.log("Max WebSocket reconnection attempts reached");
            // Provide mock data for demonstration
            setLiveData({
              store_id: "demo-store",
              timestamp: new Date().toISOString(),
              zones: {
                "ATM": { population: 3, avg_time: 45, heat_score: 0.6 },
                "Chips": { population: 8, avg_time: 120, heat_score: 0.8 },
                "Cold Storage": { population: 2, avg_time: 30, heat_score: 0.3 },
                "Entrance": { population: 12, avg_time: 15, heat_score: 0.9 },
                "Office": { population: 5, avg_time: 180, heat_score: 0.5 }
              }
            });
          }
        };

        ws.current.onerror = (error) => {
          setIsConnected(false);
          // Don't log network connection errors aggressively
        };
      } catch (error) {
        setIsConnected(false);
        // Fallback to mock data if WebSocket fails entirely
        if (reconnectAttempts >= maxReconnectAttempts) {
          setLiveData({
            store_id: "demo-store",
            timestamp: new Date().toISOString(),
            zones: {
              "ATM": { population: 3, avg_time: 45, heat_score: 0.6 },
              "Chips": { population: 8, avg_time: 120, heat_score: 0.8 },
              "Cold Storage": { population: 2, avg_time: 30, heat_score: 0.3 },
              "Entrance": { population: 12, avg_time: 15, heat_score: 0.9 },
              "Office": { population: 5, avg_time: 180, heat_score: 0.5 }
            }
          });
        }
      }
    };

    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  return {
    liveData,
    historicalData,
    isConnected
  };
}