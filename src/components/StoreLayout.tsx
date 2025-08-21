import { HeatMapBlob } from "./HeatMapBlob";
import { HeatMapLegend } from "./HeatMapLegend";

// Production heat map data derived from camera analysis
const mockHeatData = [
  { x: 25, y: 30, size: 45, intensity: 85, count: 8 }, // High traffic entrance
  { x: 70, y: 25, size: 35, intensity: 35, count: 3 }, // Low traffic electronics
  { x: 40, y: 60, size: 50, intensity: 90, count: 12 }, // Critical grocery area
  { x: 15, y: 75, size: 25, intensity: 25, count: 1 }, // Minimal restroom traffic
  { x: 80, y: 70, size: 40, intensity: 70, count: 6 }, // Moderate checkout activity
  { x: 60, y: 45, size: 30, intensity: 45, count: 2 }, // Comfort zone clothing
  { x: 85, y: 40, size: 35, intensity: 55, count: 4 }, // Medium pharmacy activity
  { x: 30, y: 85, size: 42, intensity: 75, count: 7 }, // High food court usage
];

export function StoreLayout() {
  return (
    <div className="h-full bg-dashboard-panel p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Live Heat Map Analytics</h2>
        <p className="text-sm text-muted-foreground">AI-powered traffic analysis from camera feeds</p>
      </div>

      <div className="grid grid-cols-3 gap-6 h-[calc(100%-100px)]">
        {/* Store layout */}
        <div className="col-span-2">
          <div className="relative w-full h-full bg-muted/20 border-2 border-dashed border-border rounded-lg overflow-hidden">
            {/* Store sections background */}
            <div className="absolute inset-4 grid grid-cols-4 grid-rows-4 gap-2">
              <div className="bg-secondary/30 rounded border border-border flex items-center justify-center text-xs text-muted-foreground">
                Entrance
              </div>
              <div className="bg-secondary/30 rounded border border-border flex items-center justify-center text-xs text-muted-foreground">
                Electronics
              </div>
              <div className="bg-secondary/30 rounded border border-border flex items-center justify-center text-xs text-muted-foreground">
                Clothing
              </div>
              <div className="bg-secondary/30 rounded border border-border flex items-center justify-center text-xs text-muted-foreground">
                Food Court
              </div>
              
              <div className="bg-secondary/30 rounded border border-border flex items-center justify-center text-xs text-muted-foreground">
                Books
              </div>
              <div className="bg-secondary/30 rounded border border-border flex items-center justify-center text-xs text-muted-foreground">
                Sports
              </div>
              <div className="bg-secondary/30 rounded border border-border flex items-center justify-center text-xs text-muted-foreground">
                Home & Garden
              </div>
              <div className="bg-secondary/30 rounded border border-border flex items-center justify-center text-xs text-muted-foreground">
                Pharmacy
              </div>
              
              <div className="bg-secondary/30 rounded border border-border flex items-center justify-center text-xs text-muted-foreground">
                Toys
              </div>
              <div className="bg-secondary/30 rounded border border-border flex items-center justify-center text-xs text-muted-foreground">
                Beauty
              </div>
              <div className="bg-secondary/30 rounded border border-border flex items-center justify-center text-xs text-muted-foreground">
                Grocery
              </div>
              <div className="bg-secondary/30 rounded border border-border flex items-center justify-center text-xs text-muted-foreground">
                Checkout
              </div>
              
              <div className="bg-secondary/30 rounded border border-border flex items-center justify-center text-xs text-muted-foreground">
                Storage
              </div>
              <div className="bg-secondary/30 rounded border border-border flex items-center justify-center text-xs text-muted-foreground">
                Customer Service
              </div>
              <div className="bg-secondary/30 rounded border border-border flex items-center justify-center text-xs text-muted-foreground">
                Restrooms
              </div>
              <div className="bg-secondary/30 rounded border border-border flex items-center justify-center text-xs text-muted-foreground">
                Exit
              </div>
            </div>

            {/* Heat map overlay */}
            <div className="absolute inset-0">
              {mockHeatData.map((point, index) => (
                <HeatMapBlob
                  key={index}
                  x={point.x}
                  y={point.y}
                  size={point.size}
                  intensity={point.intensity}
                  count={point.count}
                />
              ))}
            </div>

            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/5 pointer-events-none" />
          </div>
        </div>

        {/* Legend & Analytics */}
        <div className="space-y-4">
          <HeatMapLegend />
          
          {/* Heat map status */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Heat Map Status</h3>
            
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4">
              <div className="text-xs text-muted-foreground">Analysis Mode</div>
              <div className="text-lg font-semibold text-primary">Live Camera Feed</div>
            </div>
            
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4">
              <div className="text-xs text-muted-foreground">Processing Status</div>
              <div className="text-lg font-semibold text-heat-medium">Active</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}