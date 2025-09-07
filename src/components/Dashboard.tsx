import { useState, useRef, useEffect } from "react";
import { VideoMatrix, type VideoMatrixRef } from "./VideoMatrix";
import { StoreLayout } from "./StoreLayoutNew";
import { CameraPanel } from "./CameraPanel";
import { DateTimePicker } from "./DateTimePicker";
import { useZoneDiscovery } from "@/hooks/useZoneDiscovery";
import { Button } from "./ui/button";
import { Play, Square } from "lucide-react";

export function Dashboard() {
  const { zones } = useZoneDiscovery();
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [isReplaying, setIsReplaying] = useState(false);
  const [isHistoricalMode, setIsHistoricalMode] = useState(false);
  const videoMatrixRef = useRef<VideoMatrixRef>(null);

  // Initialize selected zones when zones are loaded
  useEffect(() => {
    if (zones.length > 0 && selectedZones.length === 0) {
      setSelectedZones(zones.slice(0, 4)); // Default to first 4 zones
    }
  }, [zones, selectedZones.length]);

  const handleDateTimeSelect = (dateTime: Date) => {
    setSelectedDateTime(dateTime);
    if (isHistoricalMode) {
      handleStartReplay();
    }
  };

  const handleModeToggle = (historical: boolean) => {
    setIsHistoricalMode(historical);
    if (!historical) {
      setIsReplaying(false);
      setSelectedDateTime(null);
      videoMatrixRef.current?.pauseAll();
    }
  };

  const handleStartReplay = () => {
    if (selectedDateTime && selectedZones.length > 0 && isHistoricalMode) {
      setIsReplaying(true);
      // Seek videos to selected time
      const timeString = selectedDateTime.toLocaleTimeString('en-GB', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit', 
        second: '2-digit'
      });
      videoMatrixRef.current?.seekAllTo(timeString);
      videoMatrixRef.current?.playAll();
    }
  };

  const handleStopReplay = () => {
    setIsReplaying(false);
    videoMatrixRef.current?.pauseAll();
    // Refresh the page
    window.location.reload();
  };

  const toggleZoneSelection = (zone: string) => {
    setSelectedZones(prev => 
      prev.includes(zone) 
        ? prev.filter(z => z !== zone)
        : [...prev, zone]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Smart Store
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>powered by</span>
                  <img 
                    src="/logo.png" 
                    alt="Company Logo" 
                    className="h-5 w-auto"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isReplaying ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                <span className="text-sm text-muted-foreground">
                  {isReplaying ? 'Replay Active' : 'Standby'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Controls Bar */}
      <div className="border-b border-border bg-card/30 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <DateTimePicker
              onDateTimeSelect={handleDateTimeSelect}
              onModeToggle={handleModeToggle}
              isHistoricalMode={isHistoricalMode}
              selectedDateTime={selectedDateTime}
            />
            
            {isHistoricalMode && selectedDateTime && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={isReplaying ? handleStopReplay : handleStartReplay}
                  disabled={selectedZones.length === 0}
                  size="sm"
                  variant={isReplaying ? "destructive" : "default"}
                >
                  {isReplaying ? (
                    <>
                      <Square className="w-4 h-4 mr-2" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Replay
                    </>
                  )}
                </Button>
                
                <span className="text-sm text-muted-foreground">
                  from {selectedDateTime.toLocaleString()}
                </span>
              </div>
            )}
          </div>
          
        </div>
      </div>

      {/* Main Content - 50/50 Split */}
      <div className="flex min-h-[calc(100vh-160px)]">
        {/* Left Panel - Camera Panel (50%) */}
        <div className="w-1/2 flex-shrink-0 p-4">
          <div className="h-full bg-card/30 rounded-lg p-4 flex flex-col">
            <CameraPanel
              zones={zones}
              selectedZones={selectedZones}
              onZoneChange={setSelectedZones}
              selectedDateTime={selectedDateTime}
              isReplaying={isReplaying}
              onReplayStart={() => setIsReplaying(true)}
              onReplayStop={() => setIsReplaying(false)}
              updateInterval={1}
            />
            
            {/* Zone Selector moved below camera panels */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-muted-foreground">Select Zones:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {zones.map(zone => (
                  <button
                    key={zone}
                    onClick={() => toggleZoneSelection(zone)}
                    className={`px-2 py-1 text-xs rounded border transition-colors ${
                      selectedZones.includes(zone)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:bg-muted'
                    }`}
                  >
                    Zone {zone}
                  </button>
                ))}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {selectedZones.length} of {zones.length} zones selected
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Heat Map Analytics (50%) */}
        <div className="w-1/2">
          <StoreLayout 
            selectedDateTime={selectedDateTime}
            selectedZones={selectedZones}
            onReplayStart={handleStartReplay}
            onReplayStop={handleStopReplay}
            isReplaying={isReplaying}
            isHistoricalMode={isHistoricalMode}
          />
        </div>
      </div>
    </div>
  );
}