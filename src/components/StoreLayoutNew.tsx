import { useState, useEffect } from "react";
import { HeatMapBlob } from "./HeatMapBlob";
import { HeatMapDot } from "./HeatMapDot";
import { HeatMapLegend } from "./HeatMapLegend";
import { useWebSocketReplay, type ZoneData } from "@/hooks/useWebSocketReplay";
import { useZoneDiscovery } from "@/hooks/useZoneDiscovery";

// Zone positions aligned with actual layout image (percentages)
const getZonePositions = (zones: string[]) => {
  const positions: Record<string, { x: number; y: number }> = {};
  
  // Define positions for zones A through L (12 zones total)
  const basePositions = [
    { x: 20, y: 25 },  // Zone A - Top left area
    { x: 80, y: 25 },  // Zone B - Top right area  
    { x: 20, y: 75 },  // Zone C - Bottom left area
    { x: 80, y: 75 },  // Zone D - Bottom right area
    { x: 50, y: 15 },  // Zone E - Top center
    { x: 50, y: 85 },  // Zone F - Bottom center
    { x: 10, y: 50 },  // Zone G - Left center
    { x: 90, y: 50 },  // Zone H - Right center
    { x: 35, y: 40 },  // Zone I - Center left
    { x: 65, y: 40 },  // Zone J - Center right
    { x: 35, y: 60 },  // Zone K - Lower center left
    { x: 65, y: 60 }   // Zone L - Lower center right
  ];
  
  zones.forEach((zone, index) => {
    if (index < basePositions.length) {
      positions[zone] = basePositions[index];
    } else {
      // For zones beyond L, place them in a grid pattern
      const gridIndex = index - basePositions.length;
      const gridCols = 4;
      const col = gridIndex % gridCols;
      const row = Math.floor(gridIndex / gridCols);
      positions[zone] = {
        x: 15 + (col * 20),
        y: 20 + (row * 15)
      };
    }
  });
  
  return positions;
};

interface StoreLayoutProps {
  selectedDateTime: Date | null;
  selectedZones: string[];
  onReplayStart?: (dateTime: Date) => void;
  onReplayStop?: () => void;
  isReplaying: boolean;
  isHistoricalMode: boolean;
}

export function StoreLayout({ selectedDateTime, selectedZones, onReplayStart, onReplayStop, isReplaying, isHistoricalMode }: StoreLayoutProps) {
  const { zones, isLoading: zonesLoading } = useZoneDiscovery();
  const { connect, disconnect, isConnected, currentData, error } = useWebSocketReplay();
  const [zonePositions, setZonePositions] = useState<Record<string, { x: number; y: number }>>({});

  // Update zone positions when zones are loaded
  useEffect(() => {
    if (zones.length > 0) {
      setZonePositions(getZonePositions(zones));
    }
  }, [zones]);

  // Start WebSocket replay when DateTime is selected
  useEffect(() => {
    if (selectedDateTime && selectedZones.length > 0 && isReplaying && isHistoricalMode) {
      const timeString = selectedDateTime.toLocaleTimeString('en-GB', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit', 
        second: '2-digit'
      });
      
      connect({
        start: timeString,
        zones: selectedZones,
        speed: 1.0
      });
    } else {
      disconnect();
    }
  }, [selectedDateTime, selectedZones, isReplaying, isHistoricalMode, connect, disconnect]);

  const handleStopReplay = () => {
    disconnect();
    onReplayStop?.();
  };

  // Generate heat map data from WebSocket data
  const generateHeatMapData = () => {
    if (!currentData?.zones || Object.keys(zonePositions).length === 0) {
      return { blobs: [], dots: [] };
    }

    const blobs: any[] = [];
    const dots: any[] = [];

    Object.entries(currentData.zones).forEach(([zoneName, data]: [string, any]) => {
      const position = zonePositions[zoneName];
      if (!position) return;

      // Calculate size based on population 
      const size = Math.max(20, Math.min(100, Math.sqrt(data.population || 0) * 10));
      
      // Convert heat_score (0-1) to intensity (0-100)
      const intensity = Math.round((data.heat_score || 0) * 100);
      
      // Check if crowded (population > 12)
      const isCrowded = (data.population || 0) > 12;

      // Add zone blob for overall heat
      blobs.push({
        x: position.x,
        y: position.y,
        size: isCrowded ? Math.max(size, 60) : size,
        intensity: isCrowded ? Math.max(intensity, 80) : intensity,
        zoneName,
        population: data.population || 0,
        avgDwell: data.avg_dwell || 0,
        isCrowded
      });

      // Add individual dots for each person in the zone
      if (data.dots && Array.isArray(data.dots)) {
        data.dots.forEach((dot: any) => {
          // Convert dot coordinates from zone-relative to layout-relative
          const layoutX = position.x + (dot.x - 0.5) * 15; // 15% spread around zone center
          const layoutY = position.y + (dot.y - 0.5) * 15;
          
          dots.push({
            x: Math.max(5, Math.min(95, layoutX)) / 100, // Keep within bounds and convert to 0-1
            y: Math.max(5, Math.min(95, layoutY)) / 100,
            color: dot.color,
            id: dot.id,
            dwell: dot.dwell,
            zone: zoneName
          });
        });
      }
    });

    return { blobs, dots };
  };

  const { blobs: heatMapBlobs, dots: heatMapDots } = generateHeatMapData();

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

            {/* Heat map overlay - Zone blobs for overall activity */}
            <div className="absolute inset-0">
              {heatMapBlobs.map((blob, index) => (
                blob && (
                  <div key={`blob-${blob.zoneName}-${index}`} className="relative">
                    <HeatMapBlob
                      x={blob.x}
                      y={blob.y}
                      size={blob.size}
                      intensity={blob.intensity}
                    />
                  </div>
                )
              ))}
            </div>

            {/* Individual person dots overlay */}
            <div className="absolute inset-0">
              {heatMapDots.map((dot, index) => (
                <HeatMapDot
                  key={`dot-${dot.zone}-${dot.id}-${index}`}
                  x={dot.x}
                  y={dot.y}
                  color={dot.color}
                  id={dot.id}
                  dwell={dot.dwell}
                />
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
                {selectedDateTime && (
                  <div className="text-xs text-muted-foreground mb-1">
                    Started: {selectedDateTime.toLocaleString()}
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