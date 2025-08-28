import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Play, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface DateTimePickerProps {
  onDateTimeSelect: (dateTime: Date) => void;
  onModeToggle: (isHistorical: boolean) => void;
  isHistoricalMode: boolean;
  selectedDateTime?: Date | null;
}

export function DateTimePicker({ 
  onDateTimeSelect, 
  onModeToggle, 
  isHistoricalMode,
  selectedDateTime 
}: DateTimePickerProps) {
  const [date, setDate] = useState<Date>(selectedDateTime || new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [timeInput, setTimeInput] = useState(() => {
    if (selectedDateTime) {
      return format(selectedDateTime, "HH:mm:ss");
    }
    return format(new Date(), "HH:mm:ss");
  });

  // Generate time options (every 30 seconds)
  const generateTimeOptions = () => {
    const options = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 5) {
        for (let s = 0; s < 60; s += 30) {
          const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
          options.push(time);
        }
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      const [hours, minutes, seconds] = timeInput.split(':').map(Number);
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(hours, minutes, seconds);
      onDateTimeSelect(newDateTime);
      setIsCalendarOpen(false);
    }
  };

  const handleTimeSelect = (time: string) => {
    setTimeInput(time);
    const [hours, minutes, seconds] = time.split(':').map(Number);
    const newDateTime = new Date(date);
    newDateTime.setHours(hours, minutes, seconds);
    onDateTimeSelect(newDateTime);
  };

  const handleTimeInputChange = (value: string) => {
    setTimeInput(value);
    
    // Validate time format HH:MM:SS
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5]?[0-9]):([0-5]?[0-9])$/;
    if (timeRegex.test(value)) {
      const [hours, minutes, seconds] = value.split(':').map(Number);
      const newDateTime = new Date(date);
      newDateTime.setHours(hours, minutes, seconds);
      onDateTimeSelect(newDateTime);
    }
  };

  const handleToggleMode = () => {
    onModeToggle(!isHistoricalMode);
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleToggleMode}
          variant={isHistoricalMode ? "destructive" : "default"}
          size="sm"
          className="min-w-[140px]"
        >
          {isHistoricalMode ? (
            <>
              <Square className="w-4 h-4 mr-2" />
              Stop Historical
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              View Historical
            </>
          )}
        </Button>
        
        <div className="text-sm text-muted-foreground">
          {isHistoricalMode ? "Historical Mode" : "Live Mode"}
        </div>
      </div>

      {/* Historical Mode Controls */}
      {isHistoricalMode && (
        <div className="space-y-4 p-4 border border-border rounded-lg bg-card/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Date</Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Time (HH:MM:SS)</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="10:30:45"
                  value={timeInput}
                  onChange={(e) => handleTimeInputChange(e.target.value)}
                  className="flex-1"
                  pattern="^([0-1]?[0-9]|2[0-3]):([0-5]?[0-9]):([0-5]?[0-9])$"
                />
                <Select value={timeInput} onValueChange={handleTimeSelect}>
                  <SelectTrigger className="w-12">
                    <Clock className="h-4 w-4" />
                  </SelectTrigger>
                  <SelectContent className="h-60">
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Selected DateTime Display */}
          {date && timeInput && (
            <div className="text-center p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Selected Time</div>
              <div className="text-lg font-mono font-medium text-foreground">
                {format(date, "MMM dd, yyyy")} • {timeInput}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Live Mode Display */}
      {!isHistoricalMode && (
        <div className="text-center p-4 border border-border rounded-lg bg-card/30">
          <div className="flex items-center justify-center gap-2 text-green-500 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Real-time Data</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Showing live camera feeds and heat map data
          </div>
        </div>
      )}
    </div>
  );
}