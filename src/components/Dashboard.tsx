import { CameraPanel } from "./CameraPanel";
import { StoreLayout } from "./StoreLayout";

export function Dashboard() {
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

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Camera Feeds */}
        <div className="w-96 flex-shrink-0">
          <CameraPanel />
        </div>

        {/* Right Panel - Heat Map */}
        <div className="flex-1">
          <StoreLayout />
        </div>
      </div>
    </div>
  );
}