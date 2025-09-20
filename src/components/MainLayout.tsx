import { useState } from "react";
import { TopHeader } from "./TopHeader";
import { CameraPanel } from "./CameraPanel";
import { FeatureThumbnails } from "./FeatureThumbnails";
import { DateTimePicker } from "./DateTimePicker";
import { StoreLayout } from "./StoreLayoutNew";
import { UpdateIntervalSelector } from "./UpdateIntervalSelector";
import { FunnelingControls } from "./FunnelingControls";
import { AnalyticsPanel } from "./AnalyticsPanel";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { useZoneDiscovery } from "@/hooks/useZoneDiscovery";
import { BarChart3, TrendingUp } from "lucide-react";
import { Chatbot } from "./Chatbot";

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
  const [showHistoricalMode, setShowHistoricalMode] = useState(false);

  const { zones } = useZoneDiscovery();

  return (
    <div className="h-screen bg-background overflow-hidden">
      {/* Fixed Header */}
      <TopHeader selectedDateTime={selectedDateTime} onLogout={onLogout} />
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Panel - Camera Matrix */}
        <div className="w-1/2 border-r border-border bg-card/95 backdrop-blur-sm">
          <div className="p-6">
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
        </div>

        {/* Right Panel - Features */}
        <div className="w-1/2 flex flex-col bg-background">
          {/* Feature Selection */}
          <div className="border-b border-border bg-card/95 backdrop-blur-sm p-4">
            <FeatureThumbnails
              selectedFeature={selectedFeature}
              onFeatureSelect={setSelectedFeature}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-auto p-3">
            {selectedFeature === 'heatmap' && (
              <div className="h-full space-y-6">
                {!showHistoricalMode ? (
                  <div className="text-center py-4">
                    <Button
                      onClick={() => setShowHistoricalMode(true)}
                      variant="default"
                      className="min-w-[140px]"
                    >
                      View Historical
                    </Button>
                  </div>
                ) : (
                  <Card className="border border-border/50">
                    <CardContent className="p-4 space-y-6">
                      {!selectedDateTime ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">Select Start Time</h4>
                            <Button
                              onClick={() => {
                                setShowHistoricalMode(false);
                                setSelectedDateTime(undefined);
                                setIsReplaying(false);
                              }}
                              variant="ghost"
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </div>
                          <DateTimePicker
                            onDateTimeSelect={setSelectedDateTime}
                            onModeToggle={() => {}}
                            isHistoricalMode={true}
                            selectedDateTime={selectedDateTime}
                          />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <div className="font-medium">Start Time Selected</div>
                              <div className="text-muted-foreground">
                                {selectedDateTime.toLocaleDateString()} • {selectedDateTime.toLocaleTimeString()}
                              </div>
                            </div>
                            <Button
                              onClick={() => {
                                setSelectedDateTime(undefined);
                              }}
                              variant="ghost"
                              size="sm"
                            >
                              Change Time
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <UpdateIntervalSelector
                                value={updateInterval}
                                onChange={setUpdateInterval}
                              />
                            </div>
                            <Button
                              onClick={() => setIsReplaying(!isReplaying)}
                              disabled={selectedZones.length === 0}
                              variant={isReplaying ? "destructive" : "default"}
                            >
                              {isReplaying ? 'Stop Replay' : 'Start Replay'}
                            </Button>
                          </div>

                          <div className="text-sm text-muted-foreground text-center">
                            {selectedZones.length} zones selected
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <div className="h-full p-2">
                  <StoreLayout
                    selectedDateTime={selectedDateTime}
                    selectedZones={selectedZones}
                    onReplayStart={() => setIsReplaying(true)}
                    onReplayStop={() => setIsReplaying(false)}
                    isReplaying={isReplaying}
                    isHistoricalMode={showHistoricalMode}
                    updateInterval={updateInterval}
                  />
                </div>
              </div>
            )}
            
            {selectedFeature === 'graph' && (
              <AnalyticsPanel />
            )}

            {selectedFeature === 'storefunneling' && (
              <div className="space-y-6">
                <FunnelingControls onFunnelData={setFunnelData} />

                {funnelData ? (
                  <Card className="border border-border/50">
                    <CardContent className="p-6">
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

                        {/* Professional Funnel Chart */}
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-center mb-6">Customer Flow Funnel</h4>
                          
                          {/* Funnel Container with SVG Shape */}
                          <div className="relative mx-auto" style={{ width: '400px', height: '500px' }}>
                            {/* SVG Funnel Background */}
                            <svg 
                              className="absolute inset-0 w-full h-full" 
                              viewBox="0 0 400 500" 
                              style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))' }}
                            >
                              <defs>
                                <linearGradient id="funnelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
                                  <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.7" />
                                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
                                </linearGradient>
                                <linearGradient id="funnelBorder" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                                  <stop offset="100%" stopColor="hsl(var(--primary-foreground))" />
                                </linearGradient>
                              </defs>
                              
                              {/* Main Funnel Shape */}
                              <path
                                d="M 80 60 L 320 60 L 280 150 L 120 150 Z M 120 150 L 280 150 L 250 240 L 150 240 Z M 150 240 L 250 240 L 220 330 L 180 330 Z M 180 330 L 220 330 L 210 420 L 190 420 Z"
                                fill="url(#funnelGradient)"
                                stroke="url(#funnelBorder)"
                                strokeWidth="2"
                                className="transition-all duration-500"
                              />
                              
                              {/* Funnel Segments */}
                              {funnelData.zones
                                .sort((a, b) => b.percentage - a.percentage)
                                .map((zone, index) => {
                                  const segmentHeight = 90;
                                  const yPos = 60 + index * segmentHeight;
                                  
                                  return (
                                    <g key={zone.zone}>
                                      {/* Segment Separator Line */}
                                      <line
                                        x1={80 + index * 20}
                                        y1={yPos}
                                        x2={320 - index * 20}
                                        y2={yPos}
                                        stroke="hsl(var(--border))"
                                        strokeWidth="1"
                                        strokeDasharray="5,5"
                                        opacity="0.6"
                                      />
                                    </g>
                                  );
                                })}
                            </svg>

                            <div className="absolute inset-0 pointer-events-none">
                              {funnelData.zones
                                .sort((a, b) => b.percentage - a.percentage)
                                .map((zone, index) => {
                                  const segmentHeight = 90;
                                  const yPos = 60 + index * segmentHeight + 30;
                                  
                                  return (
                                    <div
                                      key={zone.zone}
                                      className="absolute transform -translate-x-1/2"
                                      style={{
                                        left: '50%',
                                        top: `${yPos}px`,
                                        width: '280px'
                                      }}
                                    >
                                      <div className="bg-white/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg text-center">
                                        <div className="flex justify-between items-center">
                                          <span className="font-bold text-lg text-foreground">Zone {zone.zone}</span>
                                          <span className="text-xl font-bold text-primary">{zone.percentage.toFixed(1)}%</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-1 flex justify-between">
                                          <span>{zone.unique_visitors} visitors</span>
                                          <span>{Math.floor(zone.total_time_sec / 60)}min avg</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2 mt-2">
                                          <div 
                                            className="bg-primary rounded-full h-2 transition-all duration-500"
                                            style={{ width: `${zone.percentage}%` }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                          
                          {/* Roamers Section - Outside Funnel */}
                          <div className="relative mt-8 mx-auto max-w-xs">
                            <div className="bg-gradient-to-r from-accent/20 to-accent/30 border border-accent/50 rounded-lg p-4 text-center">
                              <div className="text-lg font-bold text-accent">{funnelData.roamers} Roamers</div>
                              <div className="text-sm text-muted-foreground mt-1">
                                Visitors who browsed without zone-specific engagement
                              </div>
                            </div>
                          </div>
                          
                          {/* Funnel Statistics */}
                          <div className="mt-6 bg-muted/30 rounded-lg p-4">
                            <h5 className="font-semibold text-center mb-3">Conversion Insights</h5>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="text-center">
                                <div className="font-bold text-primary">
                                  {((funnelData.zones[0]?.percentage || 0) - (funnelData.zones[funnelData.zones.length - 1]?.percentage || 0)).toFixed(1)}%
                                </div>
                                <div className="text-muted-foreground">Drop-off Rate</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-green-600">
                                  {(funnelData.zones.reduce((sum, z) => sum + z.total_time_sec, 0) / funnelData.zones.length / 60).toFixed(1)}min
                                </div>
                                <div className="text-muted-foreground">Avg Engagement</div>
                              </div>
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
      
      <Chatbot />
    </div>
  );
}