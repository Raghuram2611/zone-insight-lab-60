import { useState } from "react";
import { ChevronLeft, ChevronRight, Video, VideoOff } from "lucide-react";
import { Button } from "./ui/button";
import { CameraModal } from "./CameraModal";

interface CameraPanelProps {
  zones: string[];
  selectedZones: string[];
  onZoneToggle: (zone: string) => void;
  baseUrl?: string;
  isReplaying?: boolean;
  selectedDateTime?: Date | null;
}

export function CameraPanel({ zones, selectedZones, onZoneToggle, baseUrl = "http://localhost:8000", isReplaying = false, selectedDateTime }: CameraPanelProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  
  const zonesPerPage = 4;
  const totalPages = Math.ceil(zones.length / zonesPerPage);
  const startIdx = currentPage * zonesPerPage;
  const currentZones = zones.slice(startIdx, startIdx + zonesPerPage);

  const nextPage = () => {
    setCurrentPage(prev => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage(prev => (prev - 1 + totalPages) % totalPages);
  };

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

        {/* Camera Grid */}
        <div className="grid grid-cols-2 gap-3 h-[calc(100%-60px)]">
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
                    if (video && isReplaying && selectedDateTime) {
                      const timeString = selectedDateTime.toLocaleTimeString('en-GB', { 
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit', 
                        second: '2-digit'
                      });
                      const [hours, minutes, seconds] = timeString.split(':').map(Number);
                      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
                      video.currentTime = totalSeconds;
                      video.play();
                    }
                  }}
                  className="w-full h-full object-cover rounded-lg"
                  muted
                  playsInline
                  poster="/placeholder.svg"
                  onError={(e) => {
                    const target = e.target as HTMLVideoElement;
                    target.style.display = 'none';
                  }}
                >
                  <source src={`${baseUrl}/videos/${zone}.mp4`} type="video/mp4" />
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
                      onZoneToggle(zone);
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
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-muted-foreground">Live</span>
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