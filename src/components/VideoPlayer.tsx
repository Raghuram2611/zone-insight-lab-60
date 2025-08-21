import { useRef, useEffect } from "react";
import { Play } from "lucide-react";

interface VideoPlayerProps {
  videoSrc?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
}

export function VideoPlayer({ 
  videoSrc, 
  className = "", 
  autoPlay = true, 
  muted = true 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && autoPlay) {
      videoRef.current.play().catch(() => {
        // Auto-play failed, which is normal in many browsers
      });
    }
  }, [autoPlay, videoSrc]);

  if (!videoSrc) {
    return (
      <div className={`bg-muted/30 flex items-center justify-center ${className}`}>
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
            <Play className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">No video source</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full h-full object-cover"
        muted={muted}
        loop
        autoPlay
        playsInline
      />
    </div>
  );
}