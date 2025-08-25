import { useState, useEffect } from "react";
import { HeatMapBlob } from "./HeatMapBlob";
import { HeatMapLegend } from "./HeatMapLegend";
import { useWebSocketReplay, type ZoneData } from "@/hooks/useWebSocketReplay";
import { useZoneDiscovery } from "@/hooks/useZoneDiscovery";

// Zone positions aligned with actual layout image (percentages)
const getZonePositions = (zones: string[]) => {
  const positions: Record<string, { x: number; y: number }> = {};
  const basePositions = [
    { x: 25, y: 30 }, { x: 75, y: 30 }, { x: 25, y: 70 }, { x: 75, y: 70 },
    { x: 50, y: 20 }, { x: 50, y: 80 }, { x: 15, y: 50 }, { x: 85, y: 50 },
    { x: 35, y: 45 }, { x: 65, y: 45 }, { x: 35, y: 55 }, { x: 65, y: 55 }
  ];
  
  zones.forEach((zone, index) => {
    if (index < basePositions.length) {
      positions[zone] = basePositions[index];
    }
  });
  
  return positions;
};

interface StoreLayoutProps {
  selectedTime: string | null;
  selectedZones: string[];
  onReplayStart?: (timeString: string) => void;
  onReplayStop?: () => void;
  isReplaying: boolean;
}

export function StoreLayout({ selectedTime, selectedZones, onReplayStart, onReplayStop, isReplaying }: StoreLayoutProps) {
  const { zones, isLoading: zonesLoading } = useZoneDiscovery();
  const { connect, disconnect, isConnected, currentData, error } = useWebSocketReplay();
  const [zonePositions, setZonePositions] = useState<Record<string, { x: number; y: number }>>({});

  // Update zone positions when zones are loaded
  useEffect(() => {
    if (zones.length > 0) {
      setZonePositions(getZonePositions(zones));
    }
  }, [zones]);

  // Start WebSocket replay when time is selected
  useEffect(() => {
    if (selectedTime && selectedZones.length > 0 && isReplaying) {
      connect({
        start: selectedTime,
        zones: selectedZones,
        speed: 1.0
      });
    } else {
      disconnect();
    }
  }, [selectedTime, selectedZones, isReplaying, connect, disconnect]);

  const handleStopReplay = () => {
    disconnect();
    onReplayStop?.();
  };

  // Generate heat map blobs from WebSocket data
  const generateHeatMapBlobs = () => {
    if (!currentData?.zones || Object.keys(zonePositions).length === 0) return [];

    return Object.entries(currentData.zones).map(([zoneName, data]: [string, ZoneData]) => {
      const position = zonePositions[zoneName];
      if (!position) return null;

      // Calculate size based on population (min 20, max 100)
      const size = Math.max(20, Math.min(100, Math.sqrt(data.population) * 10));
      
      // Convert heat_score (0-1) to intensity (0-100)
      const intensity = Math.round(data.heat_score * 100);
      
      // Check if crowded (population > 12)
      const isCrowded = data.population > 12;

      return {
        x: position.x,
        y: position.y,
        size: isCrowded ? Math.max(size, 60) : size, // Ensure crowded areas are visible
        intensity: isCrowded ? Math.max(intensity, 80) : intensity,
        zoneName,
        population: data.population,
        avgDwell: data.avg_dwell,
        isCrowded
      };
    }).filter(Boolean);
  };

  const heatMapBlobs = generateHeatMapBlobs();

  return (
    <div className="h-full bg-dashboard-panel p-4 overflow-hidden">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-foreground">Real-time Heat Map Analytics</h2>
        <p className="text-sm text-muted-foreground">
          {error ? "WebSocket Error" : (zonesLoading ? "Loading zones..." : `${zones.length} zones available`)} • 
          {isReplaying ? (isConnected ? "Replay Active" : "Connecting...") : "Standby"}
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
                  <div key={`${blob.zoneName}-${index}`} className="relative">
                    <HeatMapBlob
                      x={blob.x}
                      y={blob.y}
                      size={blob.size}
                      intensity={blob.intensity}
                    />
                    {/* Zone info tooltip */}
                    <div
                      className="absolute transform -translate-x-1/2 -translate-y-full text-xs bg-black/80 text-white px-2 py-1 rounded pointer-events-none opacity-0 hover:opacity-100 transition-opacity"
                      style={{
                        left: `${blob.x}%`,
                        top: `${blob.y}%`,
                      }}
                    >
                      <div>Zone {blob.zoneName}</div>
                      <div>People: {blob.population}</div>
                      <div>Dwell: {blob.avgDwell?.toFixed(1)}s</div>
                      {blob.isCrowded && <div className="text-red-400">CROWDED</div>}
                    </div>
                  </div>
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
          
          {/* Replay Status */}
          {isReplaying && (
            <div className="bg-primary/20 border border-primary/40 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">WebSocket Replay</div>
              <div className="text-sm font-medium text-foreground">
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                  <button
                    onClick={handleStopReplay}
                    className="text-xs px-2 py-1 bg-destructive/20 text-destructive rounded border border-destructive/40 hover:bg-destructive/30"
                  >
                    Stop
                  </button>
                </div>
                {selectedTime && (
                  <div className="text-xs text-muted-foreground mb-1">
                    Started: {selectedTime}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Zones: {selectedZones.join(', ')}
                </div>
              </div>
            </div>
          )}
          
          {/* Current data info */}
          {currentData && (
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4">
              <div className="text-xs text-muted-foreground mb-2">Current Frame</div>
              <div className="text-sm font-medium text-foreground">
                Time: {currentData.timestamp}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Active Zones: {Object.keys(currentData.zones).length}
              </div>
              <div className="mt-2 space-y-1">
                {Object.entries(currentData.zones).map(([zone, data]) => (
                  <div key={zone} className="text-xs flex justify-between">
                    <span>Zone {zone}:</span>
                    <span>{data.population} people</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}