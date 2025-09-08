import { useState } from "react";
import { TopHeader } from "./TopHeader";
import { CameraPanel } from "./CameraPanel";
import { FeatureThumbnails } from "./FeatureThumbnails";
import { DateTimePicker } from "./DateTimePicker";
import { StoreLayout } from "./StoreLayoutNew";
import { UpdateIntervalSelector } from "./UpdateIntervalSelector";
import { FunnelingControls } from "./FunnelingControls";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { useZoneDiscovery } from "@/hooks/useZoneDiscovery";
import { BarChart3, TrendingUp } from "lucide-react";

interface MainLayoutProps {
  onLogout: () => void;
}

interface FunnelData {
  store_population_start: number;
  store_population_end: number;
  total_visitors_period: number;
  zones: Array<{
    zone: string;
    unique_visitors: number;
    total_time_sec: number;
    percentage: number;
  }>;
  roamers: number;
}

export function MainLayout({ onLogout }: MainLayoutProps) {
  const [selectedDateTime, setSelectedDateTime] = useState<Date | undefined>();
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [isReplaying, setIsReplaying] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState("heatmap");
  const [updateInterval, setUpdateInterval] = useState(1);
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null);

  const { zones } = useZoneDiscovery();

  return (
    <div className="h-screen bg-background overflow-hidden">
      {/* Fixed Header */}
      <TopHeader selectedDateTime={selectedDateTime} onLogout={onLogout} />
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Panel - Camera Matrix (50%) */}
        <div className="w-1/2 border-r border-border bg-card/50 flex flex-col">
          <CameraPanel
            zones={zones}
            selectedZones={selectedZones}
            onZoneChange={setSelectedZones}
            selectedDateTime={selectedDateTime}
            isReplaying={isReplaying}
            onReplayStart={() => setIsReplaying(true)}
            onReplayStop={() => setIsReplaying(false)}
            updateInterval={updateInterval}
          />
        </div>

        {/* Right Panel - Features and Layout (50%) */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          {/* Compact Feature Selection */}
          <div className="border-b border-border bg-card/30 py-1">
            <FeatureThumbnails
              selectedFeature={selectedFeature}
              onFeatureSelect={setSelectedFeature}
            />
          </div>

          {/* Date/Time Controls for Heatmap */}
          {selectedFeature === 'heatmap' && (
            <div className="border-b border-border bg-card/30 p-2">
              <DateTimePicker
                onDateTimeSelect={setSelectedDateTime}
                onModeToggle={(historical) => {
                  if (!historical) {
                    setIsReplaying(false);
                    setSelectedDateTime(undefined);
                  }
                }}
                isHistoricalMode={!!selectedDateTime}
                selectedDateTime={selectedDateTime}
              />
              
              {selectedDateTime && (
                <div className="mt-2 flex items-center gap-2">
                  <UpdateIntervalSelector
                    value={updateInterval}
                    onChange={setUpdateInterval}
                  />
                  <Button
                    onClick={isReplaying ? () => window.location.reload() : () => setIsReplaying(true)}
                    disabled={selectedZones.length === 0}
                    size="sm"
                    variant={isReplaying ? "destructive" : "default"}
                  >
                    {isReplaying ? 'Stop' : 'Start Replay'}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {selectedZones.length} zones selected
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Store Funneling Controls */}
          {selectedFeature === 'storefunneling' && (
            <FunnelingControls onFunnelData={setFunnelData} />
          )}

          {/* Main Content - Scrollable with more space */}
          <div className="flex-1 overflow-auto">
            {selectedFeature === 'heatmap' && (
              <div className="h-full p-2">
                <StoreLayout
                  selectedDateTime={selectedDateTime}
                  selectedZones={selectedZones}
                  onReplayStart={() => setIsReplaying(true)}
                  onReplayStop={() => setIsReplaying(false)}
                  isReplaying={isReplaying}
                  isHistoricalMode={!!selectedDateTime}
                  updateInterval={updateInterval}
                />
              </div>
            )}
            
            {selectedFeature === 'graph' && (
              <div className="h-full flex items-center justify-center p-4">
                <Card className="max-w-2xl w-full bg-card/60 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <BarChart3 className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-3">Analytics Dashboard</h3>
                    <p className="text-muted-foreground">
                      Real-time analytics and performance metrics visualization
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {selectedFeature === 'storefunneling' && (
              <div className="h-full p-2">
                {funnelData ? (
                  <Card className="h-full bg-card/60 backdrop-blur-sm">
                    <CardContent className="p-6 h-full overflow-auto">
                      <div className="space-y-6">
                        {/* Store Stats */}
                        <div className="grid grid-cols-3 gap-6 text-center">
                          <div className="bg-primary/10 rounded-lg p-4">
                            <div className="text-2xl font-bold text-primary">{funnelData.store_population_start}</div>
                            <div className="text-sm text-muted-foreground">Start Population</div>
                          </div>
                          <div className="bg-primary/10 rounded-lg p-4">
                            <div className="text-2xl font-bold text-primary">{funnelData.total_visitors_period}</div>
                            <div className="text-sm text-muted-foreground">Total Visitors</div>
                          </div>
                          <div className="bg-primary/10 rounded-lg p-4">
                            <div className="text-2xl font-bold text-primary">{funnelData.store_population_end}</div>
                            <div className="text-sm text-muted-foreground">End Population</div>
                          </div>
                        </div>

                        {/* Funnel Chart */}
                        <div className="space-y-3">
                          <h4 className="text-lg font-semibold text-center mb-4">Customer Flow Funnel</h4>
                          {funnelData.zones
                            .sort((a, b) => b.percentage - a.percentage)
                            .map((zone, index) => (
                              <div key={zone.zone} className="relative">
                                <div
                                  className="bg-gradient-to-r from-primary/90 to-primary/70 rounded-lg p-4 text-white relative overflow-hidden transition-all duration-300 hover:scale-105"
                                  style={{
                                    width: `${Math.max(zone.percentage, 15)}%`,
                                    marginLeft: `${(100 - Math.max(zone.percentage, 15)) / 2}%`,
                                    minWidth: '200px'
                                  }}
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="font-semibold text-lg">Zone {zone.zone}</span>
                                    <span className="text-lg font-bold">{zone.percentage.toFixed(1)}%</span>
                                  </div>
                                  <div className="text-sm opacity-90 mt-1">
                                    {zone.unique_visitors} visitors • {Math.floor(zone.total_time_sec / 60)}min avg
                                  </div>
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 pointer-events-none" />
                                </div>
                              </div>
                            ))}
                          
                          {/* Roamers */}
                          <div className="relative mt-6">
                            <div className="bg-gradient-to-r from-accent/90 to-accent/70 rounded-lg p-3 text-white text-center transition-all duration-300 hover:scale-105" style={{width: '60%', marginLeft: '20%'}}>
                              <span className="font-semibold text-lg">Roamers: {funnelData.roamers}</span>
                              <div className="text-sm opacity-90">Visitors who didn't engage with specific zones</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <Card className="max-w-2xl w-full bg-card/60 backdrop-blur-sm">
                      <CardContent className="p-8 text-center">
                        <TrendingUp className="w-16 h-16 text-accent mx-auto mb-4" />
                        <h3 className="text-xl font-medium mb-3">Store Funneling Analysis</h3>
                        <p className="text-muted-foreground">
                          Select date range above and click "View Funnel" to see analysis
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}