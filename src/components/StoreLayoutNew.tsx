import { useState, useEffect, useRef } from "react";
import { HeatMapBlob } from "./HeatMapBlob";
import { HeatMapDot } from "./HeatMapDot";
import { HeatMapLegend } from "./HeatMapLegend";
import { ZoomControls } from "./ZoomControls";
import { useWebSocketReplay, type ZoneData } from "@/hooks/useWebSocketReplay";
import { useZoneDiscovery } from "@/hooks/useZoneDiscovery";
import { Card, CardContent } from "./ui/card";

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
  selectedDateTime?: Date;
  selectedZones: string[];
  onReplayStart?: () => void;
  onReplayStop?: () => void;
  isReplaying: boolean;
  isHistoricalMode: boolean;
  updateInterval?: number;
}

export function StoreLayout({ 
  selectedDateTime, 
  selectedZones, 
  onReplayStart, 
  onReplayStop, 
  isReplaying, 
  isHistoricalMode, 
  updateInterval = 1 
}: StoreLayoutProps) {
  const { zones, isLoading: zonesLoading } = useZoneDiscovery();
  const { connect, disconnect, isConnected, currentData, error } = useWebSocketReplay();
  const [zonePositions, setZonePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [zoom, setZoom] = useState(1);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
  const [filteredData, setFilteredData] = useState(currentData);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle data filtering based on update interval
  useEffect(() => {
    const now = Date.now();
    if (currentData && (now - lastUpdateTime >= updateInterval * 1000)) {
      setFilteredData(currentData);
      setLastUpdateTime(now);
    }
  }, [currentData, updateInterval, lastUpdateTime]);

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

  // Generate heat map data from WebSocket data with zone clustering
  const generateHeatMapData = () => {
    if (!filteredData?.zones || Object.keys(zonePositions).length === 0) {
      return { blobs: [], dots: [] };
    }

    const blobs: any[] = [];
    const dots: any[] = [];
    const zoneData: Record<string, { totalPop: number, totalDwell: number, positions: any[] }> = {};

    // First pass: collect zone data
    Object.entries(filteredData.zones).forEach(([zoneName, data]: [string, any]) => {
      const position = zonePositions[zoneName];
      if (!position || !selectedZones.includes(zoneName)) return;

      const { population, avg_dwell, heat_score } = data;
      
      if (!zoneData[zoneName]) {
        zoneData[zoneName] = { totalPop: 0, totalDwell: 0, positions: [] };
      }
      
      zoneData[zoneName].totalPop += population;
      zoneData[zoneName].totalDwell = avg_dwell;
      zoneData[zoneName].positions.push(position);
    });

    // Second pass: create cohesive blobs and clustered dots
    Object.entries(zoneData).forEach(([zoneName, data]) => {
      const position = zonePositions[zoneName];
      if (!position) return;

      const { totalPop, totalDwell } = data;
      const heat_score = Math.min(1, totalDwell / 30); // Normalize dwell time to heat score

      // Create larger, more cohesive blob for the entire zone
      blobs.push({
        x: position.x,
        y: position.y,
        size: Math.max(30, totalPop * 12), // Larger base size
        intensity: Math.min(100, heat_score * 100),
        zone: zoneName,
        count: totalPop
      });

      // Create clustered dots closer to zone center
      for (let i = 0; i < totalPop; i++) {
        const angle = (i / totalPop) * 2 * Math.PI;
        const radius = 0.08 + Math.random() * 0.04; // Closer clustering
        const dotX = position.x + Math.cos(angle) * radius;
        const dotY = position.y + Math.sin(angle) * radius;
        
        dots.push({
          id: `${zoneName}-${i}`,
          x: Math.max(0, Math.min(1, dotX / 100)),
          y: Math.max(0, Math.min(1, dotY / 100)),
          dwell: totalDwell,
          color: heat_score > 0.8 ? 'red' : heat_score > 0.6 ? 'yellow' : heat_score > 0.4 ? 'green' : 'blue'
        });
      }
    });

    return { blobs, dots };
  };

  const handleZoomIn = () => setZoom(prev => Math.min(3, prev + 0.2));
  const handleZoomOut = () => setZoom(prev => Math.max(0.5, prev - 0.2));
  const handleResetZoom = () => setZoom(1);

  const { blobs: heatMapBlobs, dots: heatMapDots } = generateHeatMapData();

  return (
    <Card className="h-full overflow-hidden">
      <CardContent className="p-0 h-full relative">
        <div 
          ref={containerRef}
          className="w-full h-full bg-dashboard-panel overflow-auto relative"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            transition: 'transform 0.3s ease'
          }}
        >
          <div className="relative w-full h-full bg-muted/10 border border-border rounded-lg overflow-hidden min-h-full min-w-full">
            {/* Background layout image */}
            <img
              src="/Layout/layout.jpg"
              alt="Store Layout"
              className="absolute inset-0 w-full h-full object-cover opacity-90"
            />
            
            {/* Dark overlay for better heat map visibility */}
            <div className="absolute inset-0 bg-background/20" />

            {/* Heat map overlay - Zone blobs for overall activity */}
            <div className="absolute inset-0 pointer-events-none">
              {heatMapBlobs.map((blob, index) => (
                <HeatMapBlob
                  key={`blob-${index}`}
                  x={blob.x}
                  y={blob.y}
                  size={blob.size}
                  intensity={blob.intensity}
                  zone={blob.zone}
                  count={blob.count}
                />
              ))}
            </div>

            {/* Individual person dots overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {heatMapDots.map((dot) => (
                <HeatMapDot
                  key={dot.id}
                  x={dot.x}
                  y={dot.y}
                  color={dot.color}
                  id={dot.id}
                  dwell={dot.dwell}
                />
              ))}
            </div>

            {/* Zone labels - only show for unselected zones */}
            <div className="absolute inset-0 pointer-events-none">
              {Object.entries(zonePositions)
                .filter(([zoneName]) => !selectedZones.includes(zoneName))
                .map(([zoneName, position]) => (
                  <div
                    key={zoneName}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-foreground bg-background/70 px-2 py-1 rounded border border-border/50 opacity-60"
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

        {/* Zoom Controls */}
        <ZoomControls
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleResetZoom}
        />

        {/* Status indicators */}
        <div className="absolute top-4 left-4 space-y-2">
          {/* WebSocket connection status */}
          <div className="bg-card/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* Update interval indicator */}
          <div className="bg-card/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-border">
            <div className="text-sm">
              <div className="font-medium">Update Rate</div>
              <div className="text-muted-foreground">Every {updateInterval}s</div>
            </div>
          </div>

          {/* Current data timestamp */}
          {filteredData && (
            <div className="bg-card/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-border">
              <div className="text-sm">
                <div className="font-medium">Last Update</div>
                <div className="text-muted-foreground">{new Date(filteredData.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="bg-destructive/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-border">
              <div className="text-sm text-destructive-foreground">
                <div className="font-medium">Connection Error</div>
                <div className="text-xs">{error}</div>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4">
          <HeatMapLegend />
        </div>
      </CardContent>
    </Card>
  );
}