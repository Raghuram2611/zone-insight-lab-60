interface HeatMapBlobProps {
  x: number;
  y: number;
  size: number;
  intensity: number;
  count: number;
}

export function HeatMapBlob({ x, y, size, intensity, count }: HeatMapBlobProps) {
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

  // Create organic blob shape using CSS and size variations
  const getBlobStyle = (size: number, count: number) => {
    const baseSize = Math.max(20, size * (0.8 + count * 0.1));
    return {
      width: `${baseSize}px`,
      height: `${baseSize * 0.9}px`, // Slightly oval
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
      {/* Main blob */}
      <div
        className={`
          ${getColorClass(intensity)}
          blur-sm transition-all duration-700
        `}
        style={{
          ...getBlobStyle(size, count),
          opacity: getOpacity(intensity),
        }}
      />

      {/* Inner highlight for depth */}
      <div
        className={`
          absolute top-1/4 left-1/4 ${getColorClass(intensity)}
          blur-xs
        `}
        style={{
          ...getBlobStyle(size * 0.4, count),
          opacity: getOpacity(intensity) * 0.8,
        }}
      />

      {/* Soft glow effect */}
      <div
        className={`
          absolute -inset-2 ${getColorClass(intensity)}
          blur-lg animate-pulse
        `}
        style={{
          ...getBlobStyle(size * 1.2, count),
          opacity: getOpacity(intensity) * 0.3,
        }}
      />
    </div>
  );
}