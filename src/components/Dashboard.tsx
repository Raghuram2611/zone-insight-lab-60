import { useState, useRef, useEffect } from "react";
import { VideoMatrix, type VideoMatrixRef } from "./VideoMatrix";
import { StoreLayout } from "./StoreLayoutNew";
import { useZoneDiscovery } from "@/hooks/useZoneDiscovery";
import { SimpleTimePicker } from "./SimpleTimePicker";
import { Button } from "./ui/button";
import { Play, Square, Settings } from "lucide-react";

export function Dashboard() {
  const { zones } = useZoneDiscovery();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [isReplaying, setIsReplaying] = useState(false);
  const videoMatrixRef = useRef<VideoMatrixRef>(null);

  // Initialize selected zones when zones are loaded
  useEffect(() => {
    if (zones.length > 0 && selectedZones.length === 0) {
      setSelectedZones(zones.slice(0, 4)); // Default to first 4 zones
    }
  }, [zones, selectedZones.length]);

  const handleTimeSelect = (timeString: string) => {
    setSelectedTime(timeString);
  };

  const handleStartReplay = () => {
    if (selectedTime && selectedZones.length > 0) {
      setIsReplaying(true);
      // Seek videos to selected time
      videoMatrixRef.current?.seekAllTo(selectedTime);
      videoMatrixRef.current?.playAll();
    }
  };

  const handleStopReplay = () => {
    setIsReplaying(false);
    videoMatrixRef.current?.pauseAll();
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
              {/* Zone Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Zones:</span>
                <div className="flex gap-1">
                  {zones.map(zone => (
                    <button
                      key={zone}
                      onClick={() => toggleZoneSelection(zone)}
                      className={`px-2 py-1 text-xs rounded border ${
                        selectedZones.includes(zone)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border hover:bg-muted'
                      }`}
                    >
                      {zone}
                    </button>
                  ))}
                </div>
              </div>
              
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
            <SimpleTimePicker
              onTimeSelect={handleTimeSelect}
              selectedTime={selectedTime}
            />
            
            {selectedTime && (
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
                  from {selectedTime}
                </span>
              </div>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground">
            {selectedZones.length} of {zones.length} zones selected
          </div>
        </div>
      </div>

      {/* Main Content - 50/50 Split */}
      <div className="flex min-h-[calc(100vh-160px)]">
        {/* Left Panel - Video Matrix (50%) */}
        <div className="w-1/2 flex-shrink-0 p-4">
          <div className="h-full bg-card/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">CCTV Matrix</h3>
            <VideoMatrix
              ref={videoMatrixRef}
              zones={zones}
              selectedZones={selectedZones}
              className="h-[calc(100%-60px)]"
            />
          </div>
        </div>

        {/* Right Panel - Heat Map Analytics (50%) */}
        <div className="w-1/2">
          <StoreLayout 
            selectedTime={selectedTime}
            selectedZones={selectedZones}
            onReplayStart={handleStartReplay}
            onReplayStop={handleStopReplay}
            isReplaying={isReplaying}
          />
        </div>
      </div>
    </div>
  );
}