import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "./VideoPlayer";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  cameraId: number;
  zone: string;
  videoSrc?: string;
}

export function CameraModal({ isOpen, onClose, cameraId, zone, videoSrc }: CameraModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-card border border-border rounded-lg shadow-2xl max-w-4xl w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card/90 backdrop-blur-sm">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Camera {cameraId}</h2>
            <p className="text-sm text-muted-foreground">{zone} Zone</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Video Player */}
        <div className="aspect-video">
          <VideoPlayer 
            videoSrc={videoSrc}
            className="w-full h-full rounded-b-lg"
            autoPlay={true}
            muted={false}
          />
        </div>
      </div>
    </div>
  );
}