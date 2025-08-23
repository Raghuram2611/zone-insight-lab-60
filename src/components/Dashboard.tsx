import { useState } from "react";
import { CameraPanel } from "./CameraPanel";
import { StoreLayout } from "./StoreLayoutNew";

export function Dashboard() {
  const [selectedDateTime, setSelectedDateTime] = useState<string | null>(null);
  const [isHistoricalMode, setIsHistoricalMode] = useState(false);
  const [timelineProgress, setTimelineProgress] = useState<{ current: number; total: number } | null>(null);

  const handleToggleMode = () => {
    setIsHistoricalMode(!isHistoricalMode);
    if (isHistoricalMode) {
      setSelectedDateTime(null);
      setTimelineProgress(null);
    }
  };

  const handleTimelineUpdate = (currentTime: string, progress: { current: number; total: number }) => {
    setTimelineProgress(progress);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Store Analytics Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Real-time customer traffic monitoring and heat map analysis
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-muted-foreground">Live</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - 50/50 Split */}
      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Left Panel - Camera Matrix (50%) */}
        <div className="w-1/2 flex-shrink-0">
          <CameraPanel 
            selectedDateTime={selectedDateTime} 
            onDateTimeSelect={setSelectedDateTime}
            isHistoricalMode={isHistoricalMode}
            onToggleMode={handleToggleMode}
            timelineProgress={timelineProgress}
          />
        </div>

        {/* Right Panel - Heat Map Analytics (50%) */}
        <div className="w-1/2">
          <StoreLayout 
            onDateTimeSelect={setSelectedDateTime} 
            selectedDateTime={selectedDateTime}
            isHistoricalMode={isHistoricalMode}
            onTimelineUpdate={handleTimelineUpdate}
          />
        </div>
      </div>
    </div>
  );
}