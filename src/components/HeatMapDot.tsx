import { memo } from "react";

interface HeatMapDotProps {
  x: number; // 0-1 range
  y: number; // 0-1 range
  color: "blue" | "green" | "yellow" | "red";
  id: string;
  dwell: number;
  size?: number; // base size multiplier
}

const COLOR_MAP = {
  blue: "hsl(var(--heat-very-low))",     // Fast movement
  green: "hsl(var(--heat-medium))",      // Normal dwell
  yellow: "hsl(var(--heat-high))",       // Longer dwell
  red: "hsl(var(--heat-critical))"       // Extended dwell
};

const SHADOW_MAP = {
  blue: "0 0 15px hsl(var(--heat-very-low) / 0.6)",
  green: "0 0 20px hsl(var(--heat-medium) / 0.7)", 
  yellow: "0 0 25px hsl(var(--heat-high) / 0.8)",
  red: "0 0 30px hsl(var(--heat-critical) / 0.9)"
};

export const HeatMapDot = memo(function HeatMapDot({ 
  x, 
  y, 
  color, 
  id, 
  dwell,
  size = 1 
}: HeatMapDotProps) {
  // Calculate dot size based on dwell time
  const baseSize = 8 + (Math.log(dwell + 1) * 3); // Logarithmic scaling
  const dotSize = Math.max(6, Math.min(24, baseSize * size));
  
  // Create smooth blending effect
  const blurRadius = dotSize * 0.6;
  
  return (
    <div
      className="absolute pointer-events-none animate-pulse"
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        transform: 'translate(-50%, -50%)',
        width: `${dotSize}px`,
        height: `${dotSize}px`,
      }}
    >
      {/* Outer glow for blending */}
      <div
        className="absolute inset-0 rounded-full opacity-40"
        style={{
          background: `radial-gradient(circle, ${COLOR_MAP[color]} 0%, transparent 70%)`,
          filter: `blur(${blurRadius}px)`,
          transform: `scale(2)`,
        }}
      />
      
      {/* Main dot */}
      <div
        className="absolute inset-0 rounded-full opacity-80"
        style={{
          backgroundColor: COLOR_MAP[color],
          boxShadow: SHADOW_MAP[color],
          filter: `blur(1px)`,
        }}
      />
      
      {/* Inner highlight */}
      <div
        className="absolute inset-0 rounded-full opacity-60"
        style={{
          background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 60%)`,
        }}
      />

      {/* Tooltip on hover */}
      <div 
        className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-background/90 text-foreground text-xs px-2 py-1 rounded border border-border whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-auto z-10"
        style={{ minWidth: 'max-content' }}
      >
        ID: {id} • {dwell}s
      </div>
    </div>
  );
});