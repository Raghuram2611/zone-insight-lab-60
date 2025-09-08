import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

interface ZoneVideoProps {
  zone: string;
  baseUrl?: string;
  className?: string;
  onTimeUpdate?: (currentTime: number) => void;
}

export interface ZoneVideoRef {
  seekTo: (timeString: string) => void;
  play: () => void;
  pause: () => void;
  getCurrentTime: () => number;
}

export const ZoneVideo = forwardRef<ZoneVideoRef, ZoneVideoProps>(
  ({ zone, baseUrl = 'http://localhost:8000', className, onTimeUpdate }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useImperativeHandle(ref, () => ({
      seekTo: (timeString: string) => {
        if (videoRef.current) {
          // Convert HH:MM:SS to seconds from video start
          // Assuming video starts at 10:00:00 for now - this should be configurable
          const videoStartTime = "10:00:00";
          const targetSeconds = timeStringToSeconds(timeString);
          const videoStartSeconds = timeStringToSeconds(videoStartTime);
          const seekTime = Math.max(0, targetSeconds - videoStartSeconds);
          
          videoRef.current.currentTime = seekTime;
        }
      },
      play: () => {
        videoRef.current?.play();
      },
      pause: () => {
        videoRef.current?.pause();
      },
      getCurrentTime: () => {
        return videoRef.current?.currentTime || 0;
      }
    }));

    const timeStringToSeconds = (timeString: string): number => {
      const [hours, minutes, seconds] = timeString.split(':').map(Number);
      return hours * 3600 + minutes * 60 + seconds;
    };

    const handleTimeUpdate = () => {
      if (videoRef.current && onTimeUpdate) {
        onTimeUpdate(videoRef.current.currentTime);
      }
    };

    const videoSrc = `/videos/${zone}.mp4`;

    return (
      <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
        <video
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full object-cover"
          onTimeUpdate={handleTimeUpdate}
          onError={(e) => {
            console.error(`Failed to load video for zone ${zone}:`, e);
          }}
          data-zone={zone}
          muted
          playsInline
          preload="metadata"
        />
        
        {/* Zone label */}
        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
          Zone {zone}
        </div>
        
        {/* Error fallback */}
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20 text-muted-foreground">
          <div className="text-center">
            <div className="text-lg font-medium">Zone {zone}</div>
            <div className="text-sm">Video Loading...</div>
          </div>
        </div>
      </div>
    );
  }
);

ZoneVideo.displayName = 'ZoneVideo';