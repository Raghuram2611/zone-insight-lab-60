import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CameraTile } from "./CameraTile";

const mockCameras = [
  { id: 1, zone: "Entrance" },
  { id: 2, zone: "Electronics" },
  { id: 3, zone: "Clothing" },
  { id: 4, zone: "Food Court" },
  { id: 5, zone: "Checkout A" },
  { id: 6, zone: "Checkout B" },
  { id: 7, zone: "Storage" },
  { id: 8, zone: "Parking" },
  { id: 9, zone: "Security" },
  { id: 10, zone: "Manager" },
  { id: 11, zone: "Break Room" },
  { id: 12, zone: "Loading" },
];

export function CameraPanel() {
  const [currentPage, setCurrentPage] = useState(0);
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

  return (
    <div className="h-full bg-dashboard-panel border-r border-border">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Camera Feeds</h2>
            <p className="text-sm text-muted-foreground">
              Showing {currentPage * camerasPerPage + 1}-{Math.min((currentPage + 1) * camerasPerPage, mockCameras.length)} of {mockCameras.length}
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

        <div className="space-y-4">
          {getCurrentCameras().map((camera, index) => (
            <CameraTile
              key={camera.id}
              cameraId={camera.id}
              zone={camera.zone}
              isActive={index === 0}
              isOnline={Math.random() > 0.1}
            />
          ))}
        </div>

        {/* Page indicators */}
        <div className="flex justify-center mt-6 gap-2">
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
      </div>
    </div>
  );
}