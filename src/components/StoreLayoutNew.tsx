import { useState } from "react";
import { HeatMapBlob } from "./HeatMapBlob";
import { HeatMapLegend } from "./HeatMapLegend";
import { DateTimePicker } from "./DateTimePicker";
import { useWebSocket, type WebSocketData } from "@/hooks/useWebSocket";

// Zone positions aligned with actual layout image (percentages)
const zonePositions = {
  "Entrance": { x: 95, y: 80 },
  "ATM": { x: 10, y: 90 },
  "Office": { x: 10, y: 25 },
  "Cold Storage": { x: 45, y: 12 },
  "Household": { x: 8, y: 50 },
  "Dry Goods": { x: 35, y: 45 },
  "Coffee Bar": { x: 75, y: 75 },
  "Beverages": { x: 95, y: 15 },
  "Automotive": { x: 35, y: 85 },
  "Chips": { x: 35, y: 60 },
  "Magazines": { x: 65, y: 85 },
  "Candy": { x: 35, y: 75 }
};

interface StoreLayoutProps {
  onDateTimeSelect?: (datetime: string | null) => void;
}

interface PlaybackState {
  isPlaying: boolean;
  currentIndex: number;
  timestamps: string[];
  intervalId: NodeJS.Timeout | null;
}

export function StoreLayout({ onDateTimeSelect }: StoreLayoutProps) {
  const { liveData, historicalData, isConnected } = useWebSocket();
  const [isHistoricalMode, setIsHistoricalMode] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<string | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentIndex: 0,
    timestamps: [],
    intervalId: null
  });

  const handleDateTimeSelect = (datetime: string | null) => {
    setSelectedDateTime(datetime);
    onDateTimeSelect?.(datetime);
    
    // Start timeline playback from selected time
    if (datetime && isHistoricalMode) {
      startTimelinePlayback(datetime);
    }
  };

  const handleToggleMode = () => {
    setIsHistoricalMode(!isHistoricalMode);
    if (isHistoricalMode) {
      // Stop playback and reset
      stopTimelinePlayback();
      setSelectedDateTime(null);
      onDateTimeSelect?.(null);
    }
  };

  const startTimelinePlayback = (startTime: string) => {
    // Stop any existing playback
    stopTimelinePlayback();
    
    // Get all timestamps from selected time onwards
    const allTimestamps = Object.keys(historicalData).sort();
    const startIndex = allTimestamps.findIndex(t => t >= startTime);
    const playbackTimestamps = startIndex >= 0 ? allTimestamps.slice(startIndex) : [];
    
    if (playbackTimestamps.length === 0) return;
    
    setPlaybackState(prev => ({
      ...prev,
      isPlaying: true,
      currentIndex: 0,
      timestamps: playbackTimestamps
    }));
    
    // Start interval to play through timestamps
    const intervalId = setInterval(() => {
      setPlaybackState(prev => {
        if (prev.currentIndex >= prev.timestamps.length - 1) {
          // End of playback, restart from beginning
          return { ...prev, currentIndex: 0 };
        }
        const nextIndex = prev.currentIndex + 1;
        const nextTimestamp = prev.timestamps[nextIndex];
        setSelectedDateTime(nextTimestamp);
        onDateTimeSelect?.(nextTimestamp);
        return { ...prev, currentIndex: nextIndex };
      });
    }, 2000); // 2 second intervals to match backend frequency
    
    setPlaybackState(prev => ({ ...prev, intervalId }));
  };

  const stopTimelinePlayback = () => {
    setPlaybackState(prev => {
      if (prev.intervalId) {
        clearInterval(prev.intervalId);
      }
      return {
        isPlaying: false,
        currentIndex: 0,
        timestamps: [],
        intervalId: null
      };
    });
  };

  // Get current data to display
  const getCurrentData = (): WebSocketData | null => {
    if (isHistoricalMode && selectedDateTime) {
      // Use exact timestamp if available, otherwise find closest
      return historicalData[selectedDateTime] || null;
    }
    return liveData;
  };

  const currentData = getCurrentData();

  // Generate heat map blobs from current data
  const generateHeatMapBlobs = () => {
    if (!currentData?.zones) return [];

    return Object.entries(currentData.zones).map(([zoneName, data]) => {
      const position = zonePositions[zoneName as keyof typeof zonePositions];
      if (!position) return null;

      // Calculate size based on population (min 20, max 80)
      const size = Math.max(20, Math.min(80, data.population * 2));
      
      // Convert heat_score to intensity (0-100)
      const intensity = Math.round(data.heat_score * 100);

      return {
        x: position.x,
        y: position.y,
        size,
        intensity,
        zoneName
      };
    }).filter(Boolean);
  };

  const heatMapBlobs = generateHeatMapBlobs();

  return (
    <div className="h-full bg-dashboard-panel p-4 overflow-hidden">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-foreground">Live Heat Map Analytics</h2>
        <p className="text-sm text-muted-foreground">
          {isConnected ? "Connected" : "Disconnected"} • 
          {isHistoricalMode ? (playbackState.isPlaying ? "Playing Timeline" : "Historical Mode") : "Live Mode"}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 h-[calc(100%-80px)]">
        {/* Store layout with background image */}
        <div className="col-span-2">
          <div className="relative w-full h-full bg-muted/10 border border-border rounded-lg overflow-hidden">
            {/* Background layout image */}
            <img
              src="/Layout/layout.jpg"
              alt="Store Layout"
              className="absolute inset-0 w-full h-full object-cover opacity-90"
            />
            
            {/* Dark overlay for better heat map visibility */}
            <div className="absolute inset-0 bg-background/20" />

            {/* Heat map overlay */}
            <div className="absolute inset-0">
              {heatMapBlobs.map((blob, index) => (
                blob && (
                  <HeatMapBlob
                    key={`${blob.zoneName}-${index}`}
                    x={blob.x}
                    y={blob.y}
                    size={blob.size}
                    intensity={blob.intensity}
                  />
                )
              ))}
            </div>

            {/* Zone labels overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {Object.entries(zonePositions).map(([zoneName, position]) => (
                <div
                  key={zoneName}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-foreground bg-background/70 px-2 py-1 rounded border border-border/50"
                  style={{
                    left: `${position.x}%`,
                    top: `${position.y - 8}%`,
                  }}
                >
                  {zoneName}
                </div>
              ))}
            </div>

            {/* Connection status overlay */}
            {!isConnected && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="text-destructive font-medium">WebSocket Disconnected</div>
                  <div className="text-sm text-muted-foreground">Attempting to reconnect...</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Legend & Controls */}
        <div className="space-y-4">
          <HeatMapLegend />
          
          {/* View History Button */}
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4">
            <button
              onClick={handleToggleMode}
              className="w-full bg-accent hover:bg-accent/80 text-accent-foreground py-3 px-4 rounded-lg font-medium transition-colors"
            >
              {isHistoricalMode ? "Switch to Live" : "View Historical Heatmap"}
            </button>
          </div>
          
          {isHistoricalMode && (
            <DateTimePicker
              onDateTimeSelect={handleDateTimeSelect}
              isHistoricalMode={isHistoricalMode}
              onToggleMode={handleToggleMode}
              availableTimestamps={Object.keys(historicalData)}
            />
          )}
          
          {/* Playback Controls */}
          {isHistoricalMode && playbackState.isPlaying && (
            <div className="bg-primary/20 border border-primary/40 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Timeline Playback</div>
              <div className="text-sm font-medium text-foreground flex items-center justify-between">
                <span>Playing from selected time</span>
                <button
                  onClick={stopTimelinePlayback}
                  className="text-xs px-2 py-1 bg-destructive/20 text-destructive rounded border border-destructive/40 hover:bg-destructive/30"
                >
                  Stop
                </button>
              </div>
            </div>
          )}
          
          {/* Current data info */}
          {currentData && (
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4">
              <div className="text-xs text-muted-foreground mb-2">Current Data</div>
              <div className="text-sm font-medium text-foreground">
                Store: {currentData.store_id}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(currentData.timestamp).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Zones: {Object.keys(currentData.zones).length}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}