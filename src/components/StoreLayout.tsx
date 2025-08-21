import { HeatMapBlob } from "./HeatMapBlob";
import { HeatMapLegend } from "./HeatMapLegend";

// Real-time heat map data from camera analytics - population and dwell time
const storeHeatData = [
  { x: 15, y: 20, size: 60, intensity: 95 }, // Entrance - high traffic, quick movement
  { x: 25, y: 35, size: 45, intensity: 40 }, // Women's clothing racks - moderate browsing
  { x: 45, y: 25, size: 35, intensity: 60 }, // Men's clothing racks - steady traffic
  { x: 65, y: 30, size: 50, intensity: 75 }, // Shoes section - longer dwell time
  { x: 75, y: 45, size: 25, intensity: 20 }, // Accessories corner - low traffic
  { x: 30, y: 55, size: 55, intensity: 85 }, // Central aisle intersection - high flow
  { x: 50, y: 65, size: 40, intensity: 55 }, // Electronics section - moderate interest
  { x: 70, y: 70, size: 35, intensity: 45 }, // Home goods - casual browsing
  { x: 20, y: 75, size: 65, intensity: 90 }, // Checkout area - high concentration
  { x: 80, y: 85, size: 30, intensity: 35 }, // Exit area - quick movement
  { x: 40, y: 80, size: 45, intensity: 65 }, // Promotional display - attention spot
  { x: 60, y: 50, size: 25, intensity: 25 }, // Fitting rooms - low but focused traffic
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
          <div className="relative w-full h-full bg-muted/10 border border-border rounded-lg overflow-hidden">
            {/* Retail Store Layout with Racks and Aisles */}
            <div className="absolute inset-4">
              {/* Entrance Area */}
              <div className="absolute top-0 left-4 w-20 h-8 bg-secondary/20 rounded border border-border/50 flex items-center justify-center text-xs text-muted-foreground">
                ENTRANCE
              </div>
              
              {/* Main Aisles */}
              <div className="absolute top-12 left-0 w-full h-1 bg-border/30"></div>
              <div className="absolute top-32 left-0 w-full h-1 bg-border/30"></div>
              <div className="absolute top-52 left-0 w-full h-1 bg-border/30"></div>
              
              {/* Vertical Aisles */}
              <div className="absolute top-0 left-24 w-1 h-full bg-border/30"></div>
              <div className="absolute top-0 left-48 w-1 h-full bg-border/30"></div>
              <div className="absolute top-0 left-72 w-1 h-full bg-border/30"></div>
              
              {/* Clothing Racks - Women's Section */}
              <div className="absolute top-16 left-8 w-12 h-6 bg-secondary/40 rounded-sm border border-border/60 flex items-center justify-center text-xs text-muted-foreground rotate-12">
                W-RACK
              </div>
              <div className="absolute top-24 left-12 w-12 h-6 bg-secondary/40 rounded-sm border border-border/60 flex items-center justify-center text-xs text-muted-foreground rotate-12">
                W-RACK
              </div>
              
              {/* Clothing Racks - Men's Section */}
              <div className="absolute top-16 left-40 w-12 h-6 bg-secondary/40 rounded-sm border border-border/60 flex items-center justify-center text-xs text-muted-foreground -rotate-12">
                M-RACK
              </div>
              <div className="absolute top-24 left-44 w-12 h-6 bg-secondary/40 rounded-sm border border-border/60 flex items-center justify-center text-xs text-muted-foreground -rotate-12">
                M-RACK
              </div>
              
              {/* Shoes Display */}
              <div className="absolute top-16 left-64 w-14 h-8 bg-secondary/40 rounded border border-border/60 flex items-center justify-center text-xs text-muted-foreground">
                SHOES
              </div>
              
              {/* Central Display Islands */}
              <div className="absolute top-36 left-16 w-16 h-12 bg-secondary/30 rounded-lg border border-border/50 flex items-center justify-center text-xs text-muted-foreground">
                DISPLAY
              </div>
              <div className="absolute top-36 left-48 w-16 h-12 bg-secondary/30 rounded-lg border border-border/50 flex items-center justify-center text-xs text-muted-foreground">
                PROMO
              </div>
              
              {/* Electronics Section */}
              <div className="absolute top-56 left-40 w-18 h-10 bg-secondary/40 rounded border border-border/60 flex items-center justify-center text-xs text-muted-foreground">
                ELECTRONICS
              </div>
              
              {/* Home Goods Racks */}
              <div className="absolute top-56 left-64 w-14 h-8 bg-secondary/40 rounded-sm border border-border/60 flex items-center justify-center text-xs text-muted-foreground rotate-6">
                HOME
              </div>
              
              {/* Checkout Counters */}
              <div className="absolute bottom-12 left-8 w-20 h-6 bg-primary/20 rounded border border-primary/40 flex items-center justify-center text-xs text-foreground">
                CHECKOUT 1-4
              </div>
              
              {/* Fitting Rooms */}
              <div className="absolute top-40 right-8 w-12 h-16 bg-secondary/50 rounded border border-border/60 flex items-center justify-center text-xs text-muted-foreground">
                FITTING
              </div>
              
              {/* Exit */}
              <div className="absolute bottom-4 right-8 w-16 h-6 bg-secondary/20 rounded border border-border/50 flex items-center justify-center text-xs text-muted-foreground">
                EXIT
              </div>
            </div>

            {/* Heat map overlay */}
            <div className="absolute inset-0">
              {storeHeatData.map((point, index) => (
                <HeatMapBlob
                  key={index}
                  x={point.x}
                  y={point.y}
                  size={point.size}
                  intensity={point.intensity}
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