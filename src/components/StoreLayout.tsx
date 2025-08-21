import { HeatMapPoint } from "./HeatMapPoint";
import { HeatMapLegend } from "./HeatMapLegend";

const mockHeatData = [
  { x: 25, y: 30, size: 45, intensity: 85, count: 28, duration: "8.5 min" },
  { x: 70, y: 25, size: 35, intensity: 65, count: 12, duration: "5.2 min" },
  { x: 40, y: 60, size: 50, intensity: 90, count: 35, duration: "12.3 min" },
  { x: 15, y: 75, size: 25, intensity: 35, count: 6, duration: "2.1 min" },
  { x: 80, y: 70, size: 40, intensity: 70, count: 18, duration: "6.8 min" },
  { x: 60, y: 45, size: 30, intensity: 45, count: 9, duration: "3.7 min" },
  { x: 85, y: 40, size: 35, intensity: 55, count: 14, duration: "4.5 min" },
  { x: 30, y: 85, size: 42, intensity: 75, count: 22, duration: "9.1 min" },
];

export function StoreLayout() {
  return (
    <div className="h-full bg-dashboard-panel p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Store Heat Map</h2>
        <p className="text-sm text-muted-foreground">Real-time customer traffic and engagement zones</p>
      </div>

      <div className="grid grid-cols-4 gap-6 h-[calc(100%-100px)]">
        {/* Store layout */}
        <div className="col-span-3">
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
                <HeatMapPoint
                  key={index}
                  x={point.x}
                  y={point.y}
                  size={point.size}
                  intensity={point.intensity}
                  count={point.count}
                  duration={point.duration}
                />
              ))}
            </div>

            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/5 pointer-events-none" />
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-4">
          <HeatMapLegend />
          
          {/* Real-time stats */}
          <div className="space-y-2">
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Total Visitors</div>
              <div className="text-lg font-semibold text-foreground">144</div>
            </div>
            
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Peak Zone</div>
              <div className="text-sm font-medium text-foreground">Grocery</div>
            </div>
            
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Avg. Dwell Time</div>
              <div className="text-sm font-medium text-foreground">6.8 min</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}