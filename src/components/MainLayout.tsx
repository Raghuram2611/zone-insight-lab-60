import { useState } from "react";
import { TopHeader } from "./TopHeader";
import { CameraPanel } from "./CameraPanel";
import { FeatureThumbnails } from "./FeatureThumbnails";
import { DateTimePicker } from "./DateTimePicker";
import { StoreLayout } from "./StoreLayoutNew";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { useZoneDiscovery } from "@/hooks/useZoneDiscovery";
import { BarChart3, TrendingUp } from "lucide-react";

interface MainLayoutProps {
  onLogout: () => void;
}

export function MainLayout({ onLogout }: MainLayoutProps) {
  const [selectedDateTime, setSelectedDateTime] = useState<Date | undefined>();
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [isReplaying, setIsReplaying] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState("heatmap");
  const [updateInterval, setUpdateInterval] = useState(1);

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
                  <Button
                    onClick={isReplaying ? () => setIsReplaying(false) : () => setIsReplaying(true)}
                    disabled={selectedZones.length === 0}
                    size="sm"
                    variant={isReplaying ? "destructive" : "default"}
                  >
                    {isReplaying ? 'Stop Replay' : 'Start Replay'}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {selectedZones.length} zones selected
                  </span>
                </div>
              )}
            </div>
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
              <div className="h-full flex items-center justify-center p-4">
                <Card className="max-w-2xl w-full bg-card/60 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <TrendingUp className="w-16 h-16 text-accent mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-3">Store Funneling Analysis</h3>
                    <p className="text-muted-foreground">
                      Advanced customer flow patterns and conversion analytics
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}