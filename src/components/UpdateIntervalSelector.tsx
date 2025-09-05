import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";

interface UpdateIntervalSelectorProps {
  value: number;
  onChange: (interval: number) => void;
}

const intervals = [
  { value: 1, label: "1 second" },
  { value: 2, label: "2 seconds" },
  { value: 5, label: "5 seconds" },
  { value: 10, label: "10 seconds" },
  { value: 15, label: "15 seconds" },
  { value: 30, label: "30 seconds" }
];

export function UpdateIntervalSelector({ value, onChange }: UpdateIntervalSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="update-interval" className="text-sm text-muted-foreground whitespace-nowrap">
        Update every:
      </Label>
      <Select value={value.toString()} onValueChange={(val) => onChange(parseInt(val))}>
        <SelectTrigger id="update-interval" className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-popover z-50">
          {intervals.map((interval) => (
            <SelectItem key={interval.value} value={interval.value.toString()}>
              {interval.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}