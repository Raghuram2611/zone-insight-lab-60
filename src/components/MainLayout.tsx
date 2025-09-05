import { useState } from "react";
import { TopHeader } from "./TopHeader";
import { CameraPanel } from "./CameraPanel";
import { FeatureThumbnails } from "./FeatureThumbnails";
import { StoreLayout } from "./StoreLayoutNew";
import { DateTimePicker } from "./DateTimePicker";
import { UpdateIntervalSelector } from "./UpdateIntervalSelector";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useZoneDiscovery } from "@/hooks/useZoneDiscovery";
import { Play, Square } from "lucide-react";

export function MainLayout() {
  const [selectedDateTime, setSelectedDateTime] = useState<Date | undefined>();
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [isReplaying, setIsReplaying] = useState(false);
  const [isHistoricalMode, setIsHistoricalMode] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState("heatmap");
  const [updateInterval, setUpdateInterval] = useState(1);

  const { zones } = useZoneDiscovery();

  const handleDateTimeSelect = (dateTime: Date) => {
    setSelectedDateTime(dateTime);
    if (isHistoricalMode && dateTime) {
      // Auto-start replay when valid datetime is selected in historical mode
      setIsReplaying(true);
    }
  };

  const handleModeToggle = (isHistorical: boolean) => {
    setIsHistoricalMode(isHistorical);
    setIsReplaying(false);
    setSelectedDateTime(undefined);
  };

  const handleStartReplay = () => {
    if (selectedDateTime && selectedZones.length > 0) {
      setIsReplaying(true);
    }
  };

  const handleStopReplay = () => {
    setIsReplaying(false);
    // Refresh the page as requested
    window.location.reload();
  };

  const toggleZoneSelection = (zone: string) => {
    setSelectedZones(prev => 
      prev.includes(zone) 
        ? prev.filter(z => z !== zone)
        : [...prev, zone]
    );
  };

  const renderFeatureContent = () => {
    switch (selectedFeature) {
      case "heatmap":
        return (
          <StoreLayout
            selectedDateTime={selectedDateTime}
            selectedZones={selectedZones}
            onReplayStart={handleStartReplay}
            onReplayStop={handleStopReplay}
            isReplaying={isReplaying}
            isHistoricalMode={isHistoricalMode}
            updateInterval={updateInterval}
          />
        );
      case "graph":
        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Analytics Graph</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center text-muted-foreground">
                Analytics graph coming soon...
              </div>
            </CardContent>
          </Card>
        );
      case "storefunneling":
        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Store Funneling</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center text-muted-foreground">
                Store funneling analysis coming soon...
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <TopHeader />
      
      {/* Main content area with top padding for fixed header */}
      <div className="flex-1 mt-16 overflow-hidden">
        <div className="h-full grid grid-cols-2 gap-4 p-4">
          {/* Left Panel - Camera Matrix */}
          <div className="flex flex-col gap-4 overflow-hidden">
            {/* Controls */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <DateTimePicker
                    selectedDateTime={selectedDateTime}
                    onDateTimeSelect={handleDateTimeSelect}
                    onModeToggle={handleModeToggle}
                    isHistoricalMode={isHistoricalMode}
                  />
                  
                  <div className="flex items-center gap-4">
                    <UpdateIntervalSelector
                      value={updateInterval}
                      onChange={setUpdateInterval}
                    />
                    
                    <div className="flex gap-2 ml-auto">
                      <Button
                        onClick={handleStartReplay}
                        disabled={!selectedDateTime || selectedZones.length === 0 || isReplaying}
                        variant="default"
                        size="sm"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Replay
                      </Button>
                      
                      <Button
                        onClick={handleStopReplay}
                        disabled={!isReplaying}
                        variant="destructive"
                        size="sm"
                      >
                        <Square className="w-4 h-4 mr-2" />
                        Stop
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Camera Panel */}
            <div className="flex-1 overflow-hidden">
              <CameraPanel
                zones={zones}
                selectedZones={selectedZones}
                onZoneToggle={toggleZoneSelection}
                isReplaying={isReplaying}
                selectedDateTime={selectedDateTime}
              />
            </div>

            {/* Zone Selection List */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Selected Zones ({selectedZones.length})</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {selectedZones.map(zone => (
                    <div
                      key={zone}
                      className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-medium"
                    >
                      Zone {zone}
                    </div>
                  ))}
                  {selectedZones.length === 0 && (
                    <div className="text-muted-foreground text-xs">
                      No zones selected. Click zone buttons in camera panel to select.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Feature Content */}
          <div className="flex flex-col gap-4 overflow-hidden">
            {/* Feature Selection */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Features</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <FeatureThumbnails
                  selectedFeature={selectedFeature}
                  onFeatureSelect={setSelectedFeature}
                />
              </CardContent>
            </Card>

            {/* Feature Content */}
            <div className="flex-1 overflow-hidden">
              {renderFeatureContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}