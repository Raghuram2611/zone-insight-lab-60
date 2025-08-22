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
    const connectWebSocket = () => {
      try {
        ws.current = new WebSocket("ws://localhost:8000/ws");

        ws.current.onopen = () => {
          setIsConnected(true);
          console.log("WebSocket connected");
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
          console.log("WebSocket disconnected, attempting to reconnect...");
          // Attempt to reconnect after 5 seconds
          setTimeout(connectWebSocket, 5000);
        };

        ws.current.onerror = (error) => {
          console.error("WebSocket error:", error);
          setIsConnected(false);
        };
      } catch (error) {
        console.error("Failed to connect to WebSocket:", error);
        // Retry connection after 5 seconds
        setTimeout(connectWebSocket, 5000);
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