import { Card } from "@/components/ui/card";

export function HeatMapLegend() {
  const intensityLevels = [
    { label: "Minimal", color: "bg-heat-very-low" },
    { label: "Low", color: "bg-heat-low" },
    { label: "Moderate", color: "bg-heat-medium" },
    { label: "High", color: "bg-heat-high" },
    { label: "Maximum", color: "bg-heat-critical" },
  ];

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border">
      <div className="p-4">
        <h4 className="text-sm font-semibold text-foreground mb-3">Activity Levels</h4>
        <div className="space-y-2">
          {intensityLevels.map((level) => (
            <div key={level.label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${level.color}`} />
              <span className="text-xs text-muted-foreground">{level.label}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}