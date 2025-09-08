import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { Calendar, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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

interface FunnelingControlsProps {
  onFunnelData: (data: FunnelData | null) => void;
}

export function FunnelingControls({ onFunnelData }: FunnelingControlsProps) {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState("09:00:00");
  const [endTime, setEndTime] = useState("17:00:00");
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowingFunnel, setIsShowingFunnel] = useState(false);

  const handleViewFunnel = async () => {
    if (!startDate || !endDate) return;
    
    setIsLoading(true);
    try {
      const startDateTime = `${format(startDate, 'yyyy-MM-dd')} ${startTime}`;
      const endDateTime = `${format(endDate, 'yyyy-MM-dd')} ${endTime}`;
      
      const response = await fetch('/api/funnel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_time: startDateTime,
          end_time: endDateTime,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setFunnelData(data);
        setIsShowingFunnel(true);
        onFunnelData(data);
        
        // Trigger video playback for all zones
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
          video.currentTime = 0;
          video.play().catch(console.error);
        });
      }
    } catch (error) {
      console.error('Failed to fetch funnel data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-b border-border bg-card/30 p-2 space-y-3">
      <div className="grid grid-cols-2 gap-4">
        {/* Start Date/Time */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Start Date & Time</Label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "justify-start text-left font-normal flex-1",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-3 w-3" />
                  {startDate ? format(startDate, "MMM dd") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <Input
              type="time"
              step="1"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-24 text-xs"
            />
          </div>
        </div>

        {/* End Date/Time */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">End Date & Time</Label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "justify-start text-left font-normal flex-1",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-3 w-3" />
                  {endDate ? format(endDate, "MMM dd") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <Input
              type="time"
              step="1"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-24 text-xs"
            />
          </div>
        </div>
      </div>

      <Button
        onClick={handleViewFunnel}
        disabled={!startDate || !endDate || isLoading}
        size="sm"
        className="w-full"
      >
        {isLoading ? 'Loading...' : 'View Funnel'}
      </Button>

    </div>
  );
}