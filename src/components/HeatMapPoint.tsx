interface HeatMapPointProps {
  x: number;
  y: number;
  size: number;
  intensity: number;
  count: number;
  duration: string;
}

export function HeatMapPoint({ x, y, size, intensity, count, duration }: HeatMapPointProps) {
  const getColorClass = (intensity: number) => {
    if (intensity >= 80) return 'bg-heat-critical';
    if (intensity >= 60) return 'bg-heat-high';
    if (intensity >= 40) return 'bg-heat-medium';
    return 'bg-heat-low';
  };

  const getOpacity = (intensity: number) => {
    return Math.max(0.4, intensity / 100);
  };

  return (
    <div
      className="absolute group cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      {/* Main circle */}
      <div
        className={`
          w-full h-full rounded-full ${getColorClass(intensity)}
          shadow-lg border-2 border-white/20
          animate-pulse
        `}
        style={{
          opacity: getOpacity(intensity),
        }}
      />

      {/* Pulse effect */}
      <div
        className={`
          absolute inset-0 rounded-full ${getColorClass(intensity)}
          animate-ping
        `}
        style={{
          opacity: getOpacity(intensity) * 0.3,
        }}
      />

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
          <div className="text-sm font-medium text-foreground">{count} people</div>
          <div className="text-xs text-muted-foreground">Avg. time: {duration}</div>
          <div className="text-xs text-muted-foreground">Activity: {intensity}%</div>
        </div>
      </div>
    </div>
  );
}