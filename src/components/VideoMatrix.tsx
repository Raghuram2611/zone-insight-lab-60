import { useRef, useImperativeHandle, forwardRef } from 'react';
import { ZoneVideo, type ZoneVideoRef } from './ZoneVideo';

interface VideoMatrixProps {
  zones: string[];
  selectedZones: string[];
  baseUrl?: string;
  className?: string;
}

export interface VideoMatrixRef {
  seekAllTo: (timeString: string) => void;
  playAll: () => void;
  pauseAll: () => void;
}

export const VideoMatrix = forwardRef<VideoMatrixRef, VideoMatrixProps>(
  ({ zones, selectedZones, baseUrl, className }, ref) => {
    const videoRefs = useRef<Record<string, ZoneVideoRef>>({});

    useImperativeHandle(ref, () => ({
      seekAllTo: (timeString: string) => {
        selectedZones.forEach(zone => {
          videoRefs.current[zone]?.seekTo(timeString);
        });
      },
      playAll: () => {
        selectedZones.forEach(zone => {
          videoRefs.current[zone]?.play();
        });
      },
      pauseAll: () => {
        selectedZones.forEach(zone => {
          videoRefs.current[zone]?.pause();
        });
      }
    }));

    const getGridCols = (count: number) => {
      if (count <= 1) return 'grid-cols-1';
      if (count <= 4) return 'grid-cols-2';
      if (count <= 6) return 'grid-cols-3';
      return 'grid-cols-4';
    };

    return (
      <div className={`grid gap-2 ${getGridCols(selectedZones.length)} ${className}`}>
        {zones.map(zone => (
          <div
            key={zone}
            className={`aspect-video ${
              selectedZones.includes(zone) ? 'block' : 'hidden'
            }`}
          >
            <ZoneVideo
              ref={(ref) => {
                if (ref) {
                  videoRefs.current[zone] = ref;
                }
              }}
              zone={zone}
              baseUrl={baseUrl}
              className="w-full h-full"
            />
          </div>
        ))}
      </div>
    );
  }
);

VideoMatrix.displayName = 'VideoMatrix';