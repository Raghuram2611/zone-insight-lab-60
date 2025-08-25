import { useState } from "react";
import { HeatMapBlob } from "./HeatMapBlob";
import { HeatMapLegend } from "./HeatMapLegend";
import { DateTimePicker } from "./DateTimePicker";
import { useZoneData, type TimeSeriesData } from "@/hooks/useZoneData";

// Zone positions aligned with actual layout image (percentages)
const zonePositions = {
  "Zone A": { x: 25, y: 30 },
  "Zone B": { x: 75, y: 30 },
  "Zone C": { x: 25, y: 70 },
  "Zone D": { x: 75, y: 70 },
  // Future zones (E-L) can be added here
  "Zone E": { x: 50, y: 20 },
  "Zone F": { x: 50, y: 80 },
  "Zone G": { x: 15, y: 50 },
  "Zone H": { x: 85, y: 50 },
  "Zone I": { x: 35, y: 45 },
  "Zone J": { x: 65, y: 45 },
  "Zone K": { x: 35, y: 55 },
  "Zone L": { x: 65, y: 55 }
};

interface StoreLayoutProps {
  onDateTimeSelect: (dateTime: string | null) => void;
  selectedDateTime?: string | null;
  isHistoricalMode: boolean;
  onTimelineUpdate?: (currentTime: string, progress: { current: number; total: number }) => void;
}

interface PlaybackState {
  isPlaying: boolean;
  currentIndex: number;
  timestamps: string[];
  intervalId: NodeJS.Timeout | null;
}

export function StoreLayout({ onDateTimeSelect, selectedDateTime, isHistoricalMode, onTimelineUpdate }: StoreLayoutProps) {
  const { processedData, isLoading, error } = useZoneData();
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentIndex: 0,
    timestamps: [],
    intervalId: null
  });

  const handleDateTimeSelect = (dateTime: string | null) => {
    onDateTimeSelect(dateTime);
    
    if (dateTime) {
      startTimelinePlayback(dateTime);
    } else {
      stopTimelinePlayback();
    }
  };

  // Get all timestamps for the selected date
  const getTimestampsForDate = (selectedDateTime: string) => {
    const selectedDate = selectedDateTime.split('T')[0]; // Get just the date part
    return Object.keys(processedData)
      .filter(timestamp => timestamp.startsWith(selectedDate))
      .sort();
  };

  const startTimelinePlayback = (startTime: string) => {
    stopTimelinePlayback();
    
    // Get all timestamps for the selected date, starting from the selected time
    const dateTimestamps = getTimestampsForDate(startTime);
    const startIndex = dateTimestamps.findIndex(t => t >= startTime);
    const playbackTimestamps = startIndex >= 0 ? dateTimestamps.slice(startIndex) : [];
    
    if (playbackTimestamps.length === 0) return;
    
    // Set initial state with the exact selected timestamp or closest available
    const initialTimestamp = playbackTimestamps[0];
    onDateTimeSelect(initialTimestamp);
    
    // Notify parent component about timeline update
    onTimelineUpdate?.(initialTimestamp, { current: 1, total: playbackTimestamps.length });
    
    setPlaybackState(prev => ({
      ...prev,
      isPlaying: true,
      currentIndex: 0,
      timestamps: playbackTimestamps
    }));
    
    // Start playback from the second timestamp if available
    if (playbackTimestamps.length > 1) {
      const intervalId = setInterval(() => {
        setPlaybackState(prev => {
          const nextIndex = prev.currentIndex + 1;
          
          // If we've reached the end, stop playback
          if (nextIndex >= prev.timestamps.length) {
            clearInterval(prev.intervalId!);
            onTimelineUpdate?.(prev.timestamps[prev.timestamps.length - 1], 
              { current: prev.timestamps.length, total: prev.timestamps.length });
            return {
              ...prev,
              isPlaying: false,
              intervalId: null
            };
          }
          
          const nextTimestamp = prev.timestamps[nextIndex];
          onDateTimeSelect(nextTimestamp);
          onTimelineUpdate?.(nextTimestamp, { current: nextIndex + 1, total: prev.timestamps.length });
          return { ...prev, currentIndex: nextIndex };
        });
      }, 2000); // 2 seconds per timestamp for better viewing
      
      setPlaybackState(prev => ({ ...prev, intervalId }));
    }
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

  const getCurrentData = () => {
    if (isHistoricalMode && selectedDateTime) {
      return processedData[selectedDateTime] || null;
    }
    // For live mode, get the latest timestamp
    const latestTimestamp = Object.keys(processedData).sort().pop();
    return latestTimestamp ? processedData[latestTimestamp] : null;
  };

  const currentData = getCurrentData();

  // Generate heat map blobs from current data
  const generateHeatMapBlobs = () => {
    if (!currentData?.zones) return [];

    return Object.entries(currentData.zones).map(([zoneName, data]: [string, any]) => {
      const position = zonePositions[zoneName as keyof typeof zonePositions];
      if (!position) return null;

      // Calculate size based on count (min 20, max 80)
      const size = Math.max(20, Math.min(80, (data.population || 0) * 3));
      
      // Calculate intensity based on count and crowding
      let intensity = Math.round((data.heat_score || 0) * 100);
      if (data.is_crowded) {
        intensity = Math.max(intensity, 80); // Ensure crowded areas are highly visible
      }

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
          {error ? "Error loading data" : (isLoading ? "Loading..." : "Data loaded")} • 
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

            {/* Error status overlay */}
            {error && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="text-destructive font-medium">Data Load Error</div>
                  <div className="text-sm text-muted-foreground">{error}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Legend & Controls */}
        <div className="space-y-4">
          <HeatMapLegend />
          
          {/* Playback Controls */}
          {isHistoricalMode && playbackState.isPlaying && (
            <div className="bg-primary/20 border border-primary/40 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Timeline Playback</div>
              <div className="text-sm font-medium text-foreground">
                <div className="flex items-center justify-between mb-1">
                  <span>Playing from selected time</span>
                  <button
                    onClick={stopTimelinePlayback}
                    className="text-xs px-2 py-1 bg-destructive/20 text-destructive rounded border border-destructive/40 hover:bg-destructive/30"
                  >
                    Stop
                  </button>
                </div>
                <div className="text-xs text-muted-foreground mb-1">
                  {playbackState.currentIndex + 1} of {playbackState.timestamps.length} timestamps
                </div>
                <div className="text-xs text-muted-foreground">
                  Current: {playbackState.timestamps[playbackState.currentIndex] && 
                    new Date(playbackState.timestamps[playbackState.currentIndex]).toLocaleTimeString()}
                </div>
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