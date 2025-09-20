import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { X, Maximize2, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";

interface CameraModalProps {
  zone: string | null;
  isOpen: boolean;
  onClose: () => void;
  baseUrl?: string;
  isReplaying?: boolean;
  selectedDateTime?: Date | null;
}

export function CameraModal({ zone, isOpen, onClose, baseUrl = "http://localhost:8000", isReplaying = false, selectedDateTime }: CameraModalProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!zone) return null;

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  console.log(`${baseUrl}/videos/${zone}.mp4`)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`max-w-4xl w-full p-0 ${isFullscreen ? 'max-w-none w-screen h-screen' : ''}`}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="relative w-full h-full">
          {/* Header */}
          <DialogHeader className="absolute top-0 left-0 right-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border p-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold">
                Zone {zone} - Live Feed
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="h-8 w-8 p-0"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="h-8 w-8 p-0"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Video Content */}
          <div className={`w-full ${isFullscreen ? 'h-screen' : 'h-96 mt-16'}`}>
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
              className="w-full h-full object-cover bg-background"
              controls
              muted={isMuted}
              autoPlay
              playsInline
              onError={(e) => {
                console.error('Video load error for zone:', zone);
              }}
            >
              <source src={`${baseUrl}/${zone}.mp4`} type="video/mp4" />
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <div className="text-center">
                  <div className="text-muted-foreground mb-2">No video source available</div>
                  <div className="text-sm text-muted-foreground">Zone {zone}</div>
                </div>
              </div>
            </video>
          </div>

          {/* Info Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm border-t border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-foreground">Live Stream</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Zone {zone} • Camera Feed
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}