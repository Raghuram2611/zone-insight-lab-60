interface HeatMapBlobProps {
  x: number;
  y: number;
  size: number;
  intensity: number;
  zone?: string;
  count?: number;
}

export function HeatMapBlob({ x, y, size, intensity, zone, count }: HeatMapBlobProps) {
  const getColorClass = (intensity: number) => {
    if (intensity >= 80) return 'bg-heat-critical';
    if (intensity >= 60) return 'bg-heat-high';
    if (intensity >= 40) return 'bg-heat-medium';
    if (intensity >= 20) return 'bg-heat-low';
    return 'bg-heat-very-low';
  };

  const getOpacity = (intensity: number) => {
    return Math.max(0.6, intensity / 100);
  };

  // Create individual ID blobs with expanded blur
  const getBlobStyle = (size: number) => {
    const baseSize = Math.max(15, size * 0.8); // Smaller individual blobs
    const variation = intensity * 0.02;
    return {
      width: `${baseSize}px`,
      height: `${baseSize * (0.8 + variation)}px`,
      borderRadius: `${baseSize * 0.6}px ${baseSize * 0.4}px ${baseSize * 0.5}px ${baseSize * 0.7}px`,
    };
  };

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
      style={{
        left: `${x}%`,
        top: `${y}%`,
      }}
    >
      {/* Main blob with enhanced blur */}
      <div
        className={`
          ${getColorClass(intensity)}
          transition-all duration-700
        `}
        style={{
          ...getBlobStyle(size),
          opacity: getOpacity(intensity),
          filter: 'blur(25px)', // Enhanced blur intensity
        }}
      />

      {/* Additional blur layer for expanded effect */}
      <div
        className={`
          absolute inset-0 ${getColorClass(intensity)}
        `}
        style={{
          ...getBlobStyle(size * 1.5),
          opacity: getOpacity(intensity) * 0.4,
          filter: 'blur(40px)',
          transform: 'scale(1.3)',
        }}
      />

      {/* Zone label and count */}
      {zone && count && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className="bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
            <div className="text-foreground">{zone}</div>
            <div className="text-muted-foreground">{count}</div>
          </div>
        </div>
      )}

      {/* Outer glow for maximum visibility */}
      <div
        className={`
          absolute -inset-8 ${getColorClass(intensity)}
          animate-pulse
        `}
        style={{
          ...getBlobStyle(size * 2.5),
          opacity: getOpacity(intensity) * 0.2,
          filter: 'blur(60px)',
        }}
      />
    </div>
  );
}