import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock } from "lucide-react";

interface SimpleTimePickerProps {
  onTimeSelect: (time: string) => void;
  selectedTime?: string | null;
}

export function SimpleTimePicker({ onTimeSelect, selectedTime }: SimpleTimePickerProps) {
  // Generate time options in HH:MM:SS format
  const timeOptions = Array.from({ length: 24 * 12 }, (_, i) => {
    const hours = Math.floor(i / 12);
    const minutes = (i % 12) * 5;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
  });

  return (
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4 text-muted-foreground" />
      <Select value={selectedTime || ""} onValueChange={onTimeSelect}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Select time" />
        </SelectTrigger>
        <SelectContent>
          {timeOptions.map((time) => (
            <SelectItem key={time} value={time}>
              {time.substring(0, 5)} {/* Show HH:MM only */}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}