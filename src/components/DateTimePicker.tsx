import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Clock, Play, Square as StopIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  onDateTimeSelect: (datetime: string | null) => void;
  isHistoricalMode: boolean;
  onToggleMode: () => void;
  availableTimestamps: string[];
}

export function DateTimePicker({ 
  onDateTimeSelect, 
  isHistoricalMode, 
  onToggleMode,
  availableTimestamps 
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Generate time options
  const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
    const hours = Math.floor(i / 4);
    const minutes = (i % 4) * 15;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  });

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date && selectedTime) {
      const datetime = `${format(date, 'yyyy-MM-dd')}T${selectedTime}:00`;
      onDateTimeSelect(datetime);
    }
    setIsCalendarOpen(false);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (selectedDate && time) {
      const datetime = `${format(selectedDate, 'yyyy-MM-dd')}T${time}:00`;
      onDateTimeSelect(datetime);
    }
  };

  const handleToggleMode = () => {
    onToggleMode();
    if (!isHistoricalMode) {
      // Switching to live mode
      onDateTimeSelect(null);
      setSelectedDate(undefined);
      setSelectedTime(undefined);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Timeline Control</h3>
        <Button
          onClick={handleToggleMode}
          variant={isHistoricalMode ? "destructive" : "default"}
          size="sm"
          className="gap-2"
        >
          {isHistoricalMode ? (
            <>
              <StopIcon className="w-4 h-4" />
              Stop Historical
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              View Historical
            </>
          )}
        </Button>
      </div>

      {isHistoricalMode && (
        <div className="space-y-3">
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4">
            <div className="text-xs text-muted-foreground mb-2">Select Date</div>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4">
            <div className="text-xs text-muted-foreground mb-2">Select Time</div>
            <Select value={selectedTime} onValueChange={handleTimeSelect}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <SelectValue placeholder="Select time" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedDate && selectedTime && (
            <div className="bg-accent/50 border border-accent rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Viewing Historical Data</div>
              <div className="text-sm font-medium text-foreground">
                {format(selectedDate, "PPP")} at {selectedTime}
              </div>
            </div>
          )}
        </div>
      )}

      {!isHistoricalMode && (
        <div className="bg-primary/20 border border-primary/40 rounded-lg p-3">
          <div className="text-xs text-muted-foreground">Live Mode</div>
          <div className="text-sm font-medium text-foreground flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Real-time Data
          </div>
        </div>
      )}
    </div>
  );
}