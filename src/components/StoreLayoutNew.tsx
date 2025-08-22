import { useState } from "react";
import { HeatMapBlob } from "./HeatMapBlob";
import { HeatMapLegend } from "./HeatMapLegend";
import { DateTimePicker } from "./DateTimePicker";
import { useWebSocket, type WebSocketData } from "@/hooks/useWebSocket";

// Zone positions on the layout image (percentages)
const zonePositions = {
  "Entrance": { x: 15, y: 20 },
  "ATM": { x: 25, y: 35 },
  "Office": { x: 45, y: 25 },
  "Cold Storage": { x: 65, y: 30 },
  "Household": { x: 75, y: 45 },
  "Dry Goods": { x: 30, y: 55 },
  "Coffee Bar": { x: 50, y: 65 },
  "Beverages": { x: 70, y: 70 },
  "Automotive": { x: 20, y: 75 },
  "Chips": { x: 80, y: 85 },
  "Magazines": { x: 40, y: 80 },
  "Candy": { x: 60, y: 50 }
};

interface StoreLayoutProps {
  onDateTimeSelect?: (datetime: string | null) => void;
}

export function StoreLayout({ onDateTimeSelect }: StoreLayoutProps) {
  const { liveData, historicalData, isConnected } = useWebSocket();
  const [isHistoricalMode, setIsHistoricalMode] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<string | null>(null);

  const handleDateTimeSelect = (datetime: string | null) => {
    setSelectedDateTime(datetime);
    onDateTimeSelect?.(datetime);
  };

  const handleToggleMode = () => {
    setIsHistoricalMode(!isHistoricalMode);
    if (isHistoricalMode) {
      setSelectedDateTime(null);
      onDateTimeSelect?.(null);
    }
  };

  // Get current data to display
  const getCurrentData = (): WebSocketData | null => {
    if (isHistoricalMode && selectedDateTime) {
      // Find closest historical data to selected time
      const timestamps = Object.keys(historicalData).sort();
      const closestTimestamp = timestamps.reduce((closest, current) => {
        const currentDiff = Math.abs(new Date(current).getTime() - new Date(selectedDateTime).getTime());
        const closestDiff = Math.abs(new Date(closest).getTime() - new Date(selectedDateTime).getTime());
        return currentDiff < closestDiff ? current : closest;
      }, timestamps[0]);
      
      return closestTimestamp ? historicalData[closestTimestamp] : null;
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
    <div className="h-full bg-dashboard-panel p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Live Heat Map Analytics</h2>
        <p className="text-sm text-muted-foreground">
          {isConnected ? "Connected" : "Disconnected"} • 
          {isHistoricalMode ? "Historical Mode" : "Live Mode"}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 h-[calc(100%-100px)]">
        {/* Store layout with background image */}
        <div className="col-span-2">
          <div className="relative w-full h-full bg-muted/10 border border-border rounded-lg overflow-hidden">
            {/* Background layout image */}
            <img
              src="/Layout/layout.jpg"
              alt="Store Layout"
              className="absolute inset-0 w-full h-full object-cover opacity-80"
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
          
          <DateTimePicker
            onDateTimeSelect={handleDateTimeSelect}
            isHistoricalMode={isHistoricalMode}
            onToggleMode={handleToggleMode}
            availableTimestamps={Object.keys(historicalData)}
          />
          
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