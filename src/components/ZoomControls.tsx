import { Button } from "./ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function ZoomControls({ zoom, onZoomIn, onZoomOut, onReset }: ZoomControlsProps) {
  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-card/80 backdrop-blur-sm p-2 rounded-lg border border-border">
      <Button
        variant="ghost" 
        size="sm"
        onClick={onZoomIn}
        disabled={zoom >= 3}
        className="h-8 w-8 p-0"
      >
        <ZoomIn className="w-4 h-4" />
      </Button>
      
      <div className="text-xs text-center text-muted-foreground px-1">
        {Math.round(zoom * 100)}%
      </div>
      
      <Button
        variant="ghost"
        size="sm" 
        onClick={onZoomOut}
        disabled={zoom <= 0.5}
        className="h-8 w-8 p-0"
      >
        <ZoomOut className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onReset}
        className="h-8 w-8 p-0"
      >
        <RotateCcw className="w-4 h-4" />
      </Button>
    </div>
  );
}