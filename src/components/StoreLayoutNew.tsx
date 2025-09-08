import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from './ui/card';
import { HeatMapBlob } from './HeatMapBlob';
import { HeatMapDot } from './HeatMapDot';
import { HeatMapLegend } from './HeatMapLegend';
import { ZoomControls } from './ZoomControls';
import { useZoneDiscovery } from '@/hooks/useZoneDiscovery';
import { useWebSocketReplay } from '@/hooks/useWebSocketReplay';

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
    { x: 50, y: 40 },  // Zone K - Dead center
    { x: 35, y: 60 },  // Zone L - Lower center left
  ];

  // Assign positions to actual zones
  zones.forEach((zone, index) => {
    if (index < basePositions.length) {
      positions[zone] = basePositions[index];
    } else {
      // For additional zones, create a grid pattern
      const gridCols = Math.ceil(Math.sqrt(zones.length - basePositions.length));
      const gridIndex = index - basePositions.length;
      const row = Math.floor(gridIndex / gridCols);
      const col = gridIndex % gridCols;
      
      positions[zone] = {
        x: 15 + (col * 70) / Math.max(1, gridCols - 1),
        y: 15 + (row * 70) / Math.max(1, Math.ceil((zones.length - basePositions.length) / gridCols) - 1),
      };
    }
  });
  
  return positions;
};

export interface DotData {
  id: string;
  x: number;
  y: number;
  dwell: number;
  color: string;
}

export interface ZoneData {
  population: number;
  avg_dwell: number;
  heat_score: number;
  size_scale?: number;
  crowded?: boolean;
  dots?: DotData[];
}

export interface WebSocketMessage {
  timestamp: string;
  zones: Record<string, ZoneData>;
}

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
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastUpdateRef = useRef<number>(0);
  
  const { zones } = useZoneDiscovery();
  const { connect, disconnect, isConnected, currentData, error } = useWebSocketReplay();
  
  const [zonePositions, setZonePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [filteredData, setFilteredData] = useState<WebSocketMessage | null>(null);

  // Update zone positions when zones change
  useEffect(() => {
    if (zones.length > 0) {
      setZonePositions(getZonePositions(zones));
    }
  }, [zones]);

  // Filter data based on update interval
  useEffect(() => {
    if (currentData) {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateRef.current;
      
      if (timeSinceLastUpdate >= updateInterval * 1000) {
        setFilteredData(currentData);
        lastUpdateRef.current = now;
      }
    }
  }, [currentData, updateInterval]);

  // Handle WebSocket connection for replay
  useEffect(() => {
    if (isHistoricalMode && isReplaying && selectedDateTime && selectedZones.length > 0) {
      const timeString = selectedDateTime.toTimeString().split(' ')[0]; // Get HH:MM:SS format
      
      connect({
        start: timeString,
        zones: selectedZones,
        speed: 1.0,
        alpha: 0.5,
        beta: 0.3,
        dwell_norm: 30
      });
      
      onReplayStart?.();
      
      // Auto-play videos
      setTimeout(() => {
        selectedZones.forEach(zone => {
          const video = document.querySelector(`video[data-zone="${zone}"]`) as HTMLVideoElement;
          if (video) {
            const [hours, minutes, seconds] = timeString.split(':').map(Number);
            const totalSeconds = hours * 3600 + minutes * 60 + seconds;
            video.currentTime = totalSeconds;
            video.play().catch(console.error);
          }
        });
      }, 500);
    } else if (!isReplaying) {
      disconnect();
      onReplayStop?.();
    }

    return () => {
      if (!isReplaying) {
        disconnect();
      }
    };
  }, [isReplaying, selectedDateTime, selectedZones, connect, disconnect, onReplayStart, onReplayStop, isHistoricalMode]);

  const generateHeatMapData = useCallback(() => {
    if (!filteredData) return { blobs: [], dots: [] };

    const blobs: Array<{
      x: number;
      y: number;
      size: number;
      intensity: number;
      zone: string;
      count: number;
    }> = [];

    const dots: Array<{
      id: string;
      x: number;
      y: number;
      color: "blue" | "green" | "yellow" | "red";
      dwell: number;
    }> = [];

    // Process each zone in the filtered data
    Object.entries(filteredData.zones).forEach(([zoneName, zoneData]) => {
      if (!selectedZones.includes(zoneName) || !zonePositions[zoneName]) return;

      const position = zonePositions[zoneName];
      
      // If we have individual dots data from WebSocket, use that
      if (zoneData.dots && zoneData.dots.length > 0) {
        zoneData.dots.forEach((dot) => {
          // Convert relative coordinates (0-1) to percentage coordinates
          const dotX = position.x + (dot.x - 0.5) * 15; // Spread dots within 15% of zone center
          const dotY = position.y + (dot.y - 0.5) * 15;
          
          // Map color string to valid color type
          let validColor: "blue" | "green" | "yellow" | "red" = 'blue';
          if (dot.color === 'red' || dot.color === 'yellow' || dot.color === 'green') {
            validColor = dot.color;
          }
          
          dots.push({
            id: `${zoneName}-${dot.id}`,
            x: Math.max(2, Math.min(98, dotX)),
            y: Math.max(2, Math.min(98, dotY)),
            color: validColor,
            dwell: dot.dwell
          });
        });

        // Create enhanced blur blob for the zone
        const baseSize = Math.max(40, Math.min(150, zoneData.dots.length * 12));
        const intensity = Math.min(100, (zoneData.avg_dwell / 30) * 100);
        
        blobs.push({
          x: position.x,
          y: position.y,
          size: baseSize,
          intensity: Math.max(30, intensity),
          zone: zoneName,
          count: zoneData.dots.length
        });
      } else {
        // Fallback: generate synthetic data if no individual dots provided
        const population = zoneData.population || 0;
        const avgDwell = zoneData.avg_dwell || 0;
        
        if (population > 0) {
          // Create main zone blob
          const baseSize = Math.max(30, Math.min(120, population * 8));
          const intensity = Math.min(100, (avgDwell / 30) * 100);
          
          blobs.push({
            x: position.x,
            y: position.y,
            size: baseSize,
            intensity: Math.max(20, intensity),
            zone: zoneName,
            count: population
          });

          // Generate individual dots around the zone center
          for (let i = 0; i < population; i++) {
            const angle = (i / population) * 2 * Math.PI;
            const radius = Math.random() * 8;
            const dotX = position.x + Math.cos(angle) * radius;
            const dotY = position.y + Math.sin(angle) * radius;
            
            let color: "blue" | "green" | "yellow" | "red" = 'blue';
            const randomDwell = Math.random() * 40;
            if (randomDwell > 30) color = 'red';
            else if (randomDwell > 15) color = 'yellow';
            
            dots.push({
              id: `${zoneName}-${i}`,
              x: Math.max(2, Math.min(98, dotX)),
              y: Math.max(2, Math.min(98, dotY)),
              color: color,
              dwell: Math.round(randomDwell)
            });
          }
        }
      }
    });

    return { blobs, dots };
  }, [filteredData, selectedZones, zonePositions]);

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
                <div className="text-muted-foreground">{filteredData.timestamp}</div>
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