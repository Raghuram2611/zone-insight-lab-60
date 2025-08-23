import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Grid3X3 } from "lucide-react";
import { CameraTile } from "./CameraTile";
import { CameraModal } from "./CameraModal";

const mockCameras = [
  { id: 1, zone: "Entrance", videoSrc: "/videos/Entrance.mp4", cctvUrl: null },
  { id: 2, zone: "ATM", videoSrc: "/videos/ATM.mp4", cctvUrl: null },
  { id: 3, zone: "Office", videoSrc: "/videos/Office.mp4", cctvUrl: null },
  { id: 4, zone: "Cold Storage", videoSrc: "/videos/Cold Storage.mp4", cctvUrl: null },
  { id: 5, zone: "Household", videoSrc: null, cctvUrl: null },
  { id: 6, zone: "Dry Goods", videoSrc: null, cctvUrl: null },
  { id: 7, zone: "Coffee Bar", videoSrc: null, cctvUrl: null },
  { id: 8, zone: "Beverages", videoSrc: null, cctvUrl: null },
  { id: 9, zone: "Automotive", videoSrc: null, cctvUrl: null },
  { id: 10, zone: "Chips", videoSrc: "/videos/Chips.mp4", cctvUrl: null },
  { id: 11, zone: "Magazines", videoSrc: null, cctvUrl: null },
  { id: 12, zone: "Candy", videoSrc: null, cctvUrl: null },
];

interface CameraPanelProps {
  selectedDateTime?: string | null;
}

export function CameraPanel({ selectedDateTime }: CameraPanelProps) {
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
                cctvUrl={camera.cctvUrl}
                selectedDateTime={selectedDateTime}
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

          {/* View Historical Heatmap Button */}
          <div className="mt-6">
            <Button
              variant="outline"
              className="w-full border-border hover:bg-secondary"
            >
              View Historical Heatmap
            </Button>
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
        cctvUrl={selectedCamera?.cctvUrl}
        selectedDateTime={selectedDateTime}
      />
    </>
  );
}