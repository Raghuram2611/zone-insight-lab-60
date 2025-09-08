import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Video, VideoOff } from "lucide-react";
import { Button } from "./ui/button";
import { CameraModal } from "./CameraModal";

interface CameraPanelProps {
  zones: string[];
  selectedZones: string[];
  onZoneChange: (zones: string[]) => void;
  selectedDateTime?: Date;
  isReplaying: boolean;
  onReplayStart: () => void;
  onReplayStop: () => void;
  updateInterval: number;
}

export function CameraPanel({ 
  zones, 
  selectedZones, 
  onZoneChange, 
  selectedDateTime, 
  isReplaying, 
  onReplayStart, 
  onReplayStop, 
  updateInterval 
}: CameraPanelProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  
  const zonesPerPage = 4;
  const baseUrl = "/videos";

  const handleZoneToggle = (zone: string) => {
    if (selectedZones.includes(zone)) {
      onZoneChange(selectedZones.filter(z => z !== zone));
    } else {
      onZoneChange([...selectedZones, zone]);
    }
  };

  const handleSelectAll = () => {
    if (selectedZones.length === zones.length) {
      onZoneChange([]);
    } else {
      onZoneChange(zones);
    }
  };
  const totalPages = Math.ceil(zones.length / zonesPerPage);
  const startIdx = currentPage * zonesPerPage;
  const currentZones = zones.slice(startIdx, startIdx + zonesPerPage);

  const nextPage = () => {
    setCurrentPage(prev => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage(prev => (prev - 1 + totalPages) % totalPages);
  };

  // Handle video playback when replay starts
  useEffect(() => {
    if (isReplaying && selectedDateTime) {
      // Small delay to ensure video elements are ready
      const timer = setTimeout(() => {
        const timeString = selectedDateTime.toLocaleTimeString('en-GB', { 
          hour12: false,
          hour: '2-digit',
          minute: '2-digit', 
          second: '2-digit'
        });
        const [hours, minutes, seconds] = timeString.split(':').map(Number);
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;

        // Play videos for selected zones immediately
        selectedZones.forEach(zone => {
          const video = videoRefs.current[zone];
          if (video) {
            video.currentTime = totalSeconds;
            // Ensure the video is loaded and ready
            if (video.readyState >= 2) {
              video.play().catch(console.error);
            } else {
              video.addEventListener('loadeddata', () => {
                video.currentTime = totalSeconds;
                video.play().catch(console.error);
              }, { once: true });
            }
          }
        });
      }, 100);

      return () => clearTimeout(timer);
    } else {
      // Pause all videos when not replaying
      Object.values(videoRefs.current).forEach(video => {
        if (video) {
          video.pause();
        }
      });
    }
  }, [isReplaying, selectedDateTime, selectedZones]);

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">CCTV Matrix</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {currentPage + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={prevPage}
              disabled={totalPages <= 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={totalPages <= 1}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Zone Selection - Minimal */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium">Zones</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="text-[10px] h-6 px-2"
            >
              {selectedZones.length === zones.length ? 'Clear' : 'All'}
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-1 max-h-20 overflow-y-auto">
            {zones.map((zone) => (
              <div
                key={zone}
                className={`p-1 text-[10px] rounded cursor-pointer transition-colors ${
                  selectedZones.includes(zone)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                }`}
                onClick={() => handleZoneToggle(zone)}
              >
                {zone}
              </div>
            ))}
          </div>
        </div>

        {/* Camera Grid - 2x2 Matrix */}
        <div className="grid grid-cols-2 gap-2 h-[calc(100%-120px)]">
          {Array.from({ length: zonesPerPage }).map((_, idx) => {
            const zone = currentZones[idx];
            
            if (!zone) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="aspect-video bg-camera-tile border border-border rounded-lg flex items-center justify-center"
                >
                  <div className="text-center text-muted-foreground">
                    <VideoOff className="h-6 w-6 mx-auto mb-2" />
                    <span className="text-sm">No Camera</span>
                  </div>
                </div>
              );
            }

            const isSelected = selectedZones.includes(zone);
            
            return (
              <div
                key={zone}
                className={`relative aspect-video rounded-lg border transition-all duration-200 cursor-pointer group ${
                  isSelected 
                    ? 'border-primary bg-camera-tile-active' 
                    : 'border-border bg-camera-tile hover:border-muted-foreground'
                }`}
                onClick={() => setSelectedCamera(zone)}
              >
                {/* Video Element */}
                <video
                  ref={(video) => {
                    videoRefs.current[zone] = video;
                  }}
                  className="w-full h-full object-cover rounded-lg"
                  muted
                  playsInline
                  data-zone={zone}
                  poster="/placeholder.svg"
                  onError={(e) => {
                    const target = e.target as HTMLVideoElement;
                    target.style.display = 'none';
                  }}
                >
                  <source src={`${baseUrl}/${zone}.mp4`} type="video/mp4" />
                </video>

                {/* Overlay */}
                <div className="absolute inset-0 bg-background/20 rounded-lg" />
                
                {/* Zone Label */}
                <div className="absolute top-2 left-2">
                  <div className="bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-sm font-medium text-foreground">
                    Zone {zone}
                  </div>
                </div>

                {/* Selection Indicator */}
                <div className="absolute top-2 right-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleZoneToggle(zone);
                    }}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      isSelected
                        ? 'bg-primary border-primary'
                        : 'border-muted-foreground bg-transparent hover:border-primary'
                    }`}
                  >
                    {isSelected && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                      </div>
                    )}
                  </button>
                </div>

                {/* Expand Icon */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-background/80 backdrop-blur-sm p-1 rounded">
                    <Video className="h-4 w-4 text-foreground" />
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="absolute bottom-2 left-2">
                  <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs">
                    <div className={`w-2 h-2 rounded-full ${
                      isReplaying && isSelected ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'
                    }`} />
                    <span className="text-muted-foreground">
                      {isReplaying && isSelected ? 'Playing' : 'Ready'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Camera Modal */}
      <CameraModal
        zone={selectedCamera}
        isOpen={!!selectedCamera}
        onClose={() => setSelectedCamera(null)}
        baseUrl={baseUrl}
        isReplaying={isReplaying}
        selectedDateTime={selectedDateTime}
      />
    </>
  );
}