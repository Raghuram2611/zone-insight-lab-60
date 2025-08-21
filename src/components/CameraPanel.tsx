import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Grid3X3 } from "lucide-react";
import { CameraTile } from "./CameraTile";
import { CameraModal } from "./CameraModal";

const mockCameras = [
  { id: 1, zone: "Entrance", videoSrc: undefined }, // Users can add their MP4 files here
  { id: 2, zone: "Electronics", videoSrc: undefined },
  { id: 3, zone: "Clothing", videoSrc: undefined },
  { id: 4, zone: "Food Court", videoSrc: undefined },
  { id: 5, zone: "Checkout A", videoSrc: undefined },
  { id: 6, zone: "Checkout B", videoSrc: undefined },
  { id: 7, zone: "Storage", videoSrc: undefined },
  { id: 8, zone: "Parking", videoSrc: undefined },
  { id: 9, zone: "Security", videoSrc: undefined },
  { id: 10, zone: "Manager", videoSrc: undefined },
  { id: 11, zone: "Break Room", videoSrc: undefined },
  { id: 12, zone: "Loading", videoSrc: undefined },
];

export function CameraPanel() {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCamera, setSelectedCamera] = useState<typeof mockCameras[0] | null>(null);
  const [activeCamera, setActiveCamera] = useState<number>(1);
  const camerasPerPage = 4;
  const totalPages = Math.ceil(mockCameras.length / camerasPerPage);

  const getCurrentCameras = () => {
    const start = currentPage * camerasPerPage;
    return mockCameras.slice(start, start + camerasPerPage);
  };

  const handlePrevious = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  const handleCameraClick = (camera: typeof mockCameras[0]) => {
    setActiveCamera(camera.id);
    setSelectedCamera(camera);
  };

  return (
    <>
      <div className="h-full bg-dashboard-panel border-r border-border">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Grid3X3 className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Camera Matrix</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Live security feeds • Page {currentPage + 1} of {totalPages}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                className="border-border hover:bg-secondary"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                className="border-border hover:bg-secondary"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 2x2 Camera Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {getCurrentCameras().map((camera) => (
              <CameraTile
                key={camera.id}
                cameraId={camera.id}
                zone={camera.zone}
                videoSrc={camera.videoSrc}
                isActive={camera.id === activeCamera}
                isOnline={Math.random() > 0.1}
                onClick={() => handleCameraClick(camera)}
              />
            ))}
          </div>

          {/* Page indicators */}
          <div className="flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  i === currentPage ? 'bg-primary' : 'bg-muted hover:bg-accent'
                }`}
              />
            ))}
          </div>

          {/* Live Stats */}
          <div className="mt-6 space-y-3">
            <div className="text-sm font-medium text-foreground mb-2">Live Statistics</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card/30 rounded-lg p-3 border border-border/50">
                <div className="text-xs text-muted-foreground">Active Cameras</div>
                <div className="text-lg font-semibold text-primary">12</div>
              </div>
              <div className="bg-card/30 rounded-lg p-3 border border-border/50">
                <div className="text-xs text-muted-foreground">Motion Detected</div>
                <div className="text-lg font-semibold text-heat-high">4</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      <CameraModal
        isOpen={!!selectedCamera}
        onClose={() => setSelectedCamera(null)}
        cameraId={selectedCamera?.id || 0}
        zone={selectedCamera?.zone || ""}
        videoSrc={selectedCamera?.videoSrc}
      />
    </>
  );
}