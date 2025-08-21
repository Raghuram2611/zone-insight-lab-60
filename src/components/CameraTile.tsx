import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Radio } from "lucide-react";

interface CameraTileProps {
  cameraId: number;
  zone: string;
  isActive?: boolean;
  isOnline?: boolean;
}

export function CameraTile({ cameraId, zone, isActive = false, isOnline = true }: CameraTileProps) {
  return (
    <Card className={`
      relative overflow-hidden border-2 transition-all duration-300
      ${isActive 
        ? 'border-primary bg-camera-tile-active shadow-lg shadow-primary/20' 
        : 'border-border bg-camera-tile hover:border-accent hover:bg-camera-tile-active'
      }
    `}>
      <div className="aspect-video bg-gradient-to-br from-muted to-background p-4 relative">
        {/* Status indicator */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <Radio 
            className={`w-3 h-3 ${isOnline ? 'text-primary' : 'text-destructive'}`}
            fill="currentColor"
          />
        </div>

        {/* Camera placeholder content */}
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center space-y-2">
            <Eye className="w-8 h-8 mx-auto text-muted-foreground" />
            <div className="text-sm font-medium text-foreground">Camera {cameraId}</div>
          </div>
        </div>

        {/* Zone badge */}
        <div className="absolute bottom-2 left-2">
          <Badge variant="secondary" className="text-xs">
            {zone}
          </Badge>
        </div>

        {/* Overlay for active state */}
        {isActive && (
          <div className="absolute inset-0 bg-primary/5 border-2 border-primary/20 rounded-lg" />
        )}
      </div>
    </Card>
  );
}