import { useRef, useEffect } from "react";
import { Play } from "lucide-react";

interface VideoPlayerProps {
  videoSrc?: string | null;
  cctvUrl?: string | null;
  selectedDateTime?: string | null;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
}

export function VideoPlayer({ 
  videoSrc, 
  cctvUrl,
  selectedDateTime,
  className = "", 
  autoPlay = true, 
  muted = true 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && autoPlay) {
      // Ensure video is loaded before attempting to play
      const video = videoRef.current;
      
      const attemptPlay = () => {
        video.play().catch(() => {
          // Auto-play failed, which is normal in many browsers
        });
      };

      if (video.readyState >= 2) {
        // Video is already loaded
        attemptPlay();
      } else {
        // Wait for video to load
        video.addEventListener('loadeddata', attemptPlay, { once: true });
      }
    }
  }, [autoPlay, videoSrc, cctvUrl, selectedDateTime]);

  // Determine which source to use
  const getVideoSource = () => {
    if (selectedDateTime && cctvUrl) {
      // Use CCTV footage for historical viewing
      return `${cctvUrl}?timestamp=${selectedDateTime}`;
    }
    return videoSrc;
  };

  const currentVideoSrc = getVideoSource();

  if (!currentVideoSrc) {
    return (
      <div className={`bg-muted/30 flex items-center justify-center ${className}`}>
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
            <Play className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            {selectedDateTime ? "No CCTV footage" : "No video source"}
          </p>
          {selectedDateTime && cctvUrl && (
            <p className="text-xs text-muted-foreground">
              CCTV functionality ready for integration
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
      <video
        ref={videoRef}
        src={currentVideoSrc}
        className="w-full h-full object-cover"
        muted={muted}
        loop={!selectedDateTime} // Don't loop CCTV footage
        autoPlay
        playsInline
        preload="auto"
        onLoadedData={() => {
          // Ensure video starts playing when loaded
          if (videoRef.current && autoPlay) {
            videoRef.current.play().catch(() => {
              // Silent fail for auto-play restrictions
            });
          }
        }}
        onError={() => {
          console.warn(`Failed to load video: ${currentVideoSrc}`);
        }}
      />
      {selectedDateTime && (
        <div className="absolute top-2 left-2 bg-background/80 text-foreground text-xs px-2 py-1 rounded">
          Historical: {new Date(selectedDateTime).toLocaleString()}
        </div>
      )}
    </div>
  );
}