import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Radio } from "lucide-react";
import { VideoPlayer } from "./VideoPlayer";

interface CameraTileProps {
  cameraId: number;
  zone: string;
  isActive?: boolean;
  isOnline?: boolean;
  videoSrc?: string;
  onClick?: () => void;
}

export function CameraTile({ cameraId, zone, isActive = false, isOnline = true, videoSrc, onClick }: CameraTileProps) {
  return (
    <Card 
      className={`
        relative overflow-hidden border-2 transition-all duration-300 cursor-pointer
        ${isActive 
          ? 'border-primary bg-camera-tile-active shadow-lg shadow-primary/20' 
          : 'border-border bg-camera-tile hover:border-accent hover:bg-camera-tile-active hover:shadow-lg'
        }
      `}
      onClick={onClick}
    >
      <div className="aspect-video relative">
        {/* Video Player */}
        <VideoPlayer 
          videoSrc={videoSrc}
          className="w-full h-full"
          autoPlay={true}
          muted={true}
        />

        {/* Status indicator */}
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-black/50 rounded-full p-1">
            <Radio 
              className={`w-3 h-3 ${isOnline ? 'text-primary' : 'text-destructive'}`}
              fill="currentColor"
            />
          </div>
        </div>

        {/* Zone badge */}
        <div className="absolute bottom-2 left-2 z-10">
          <Badge variant="secondary" className="text-xs bg-black/70 text-white border-none">
            {zone}
          </Badge>
        </div>

        {/* Camera ID overlay */}
        <div className="absolute top-2 left-2 z-10">
          <div className="bg-black/70 rounded px-2 py-1">
            <span className="text-xs font-medium text-white">CAM {cameraId}</span>
          </div>
        </div>

        {/* Active state overlay */}
        {isActive && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-primary/30 rounded-lg pointer-events-none" />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </Card>
  );
}