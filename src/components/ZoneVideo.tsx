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

    // Map zone names to video files - handle spaces in zone names
    const getVideoSrc = (zoneName: string) => {
      // Handle zone names with spaces by using the exact file names
      const videoMap: Record<string, string> = {
        'ATM': '/videos/ATM.mp4',
        'Chips': '/videos/Chips.mp4',
        'Cold Storage': '/videos/Cold Storage.mp4',
        'Entrance': '/videos/Entrance.mp4',
        'Office': '/videos/Office.mp4',
        // Fallback for single letter zones
        'A': '/videos/ATM.mp4',
        'B': '/videos/Chips.mp4',
        'C': '/videos/Cold Storage.mp4',
        'D': '/videos/Entrance.mp4',
        'E': '/videos/Office.mp4'
      };
      
      return videoMap[zoneName] || `/videos/${zoneName}.mp4`;
    };
    
    const videoSrc = getVideoSrc(zone);

    return (
      <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
        <video
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full object-cover"
          onTimeUpdate={handleTimeUpdate}
          onError={(e) => {
            console.error(`Failed to load video for zone ${zone}:`, e);
            // Hide the video element on error to show fallback
            const target = e.target as HTMLVideoElement;
            target.style.display = 'none';
          }}
          onLoadedData={() => {
            // Auto-play when video is loaded
            if (videoRef.current) {
              videoRef.current.play().catch(() => {
                // Silent fail for auto-play restrictions
              });
            }
          }}
          data-zone={zone}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
        />
        
        {/* Zone label */}
        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
          Zone {zone}
        </div>
        
        {/* Error fallback - always visible initially, hidden when video loads */}
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