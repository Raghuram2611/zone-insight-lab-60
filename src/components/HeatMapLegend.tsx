import { Card } from "@/components/ui/card";

export function HeatMapLegend() {
  const intensityLevels = [
    { label: "Low", color: "bg-heat-low", range: "0-39%" },
    { label: "Medium", color: "bg-heat-medium", range: "40-59%" },
    { label: "High", color: "bg-heat-high", range: "60-79%" },
    { label: "Critical", color: "bg-heat-critical", range: "80-100%" },
  ];

  const sizeLevels = [
    { size: 20, label: "1-5 people" },
    { size: 30, label: "6-15 people" },
    { size: 40, label: "16-30 people" },
    { size: 50, label: "30+ people" },
  ];

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border">
      <div className="p-4 space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2">Time Spent (Color)</h4>
          <div className="space-y-1">
            {intensityLevels.map((level) => (
              <div key={level.label} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${level.color}`} />
                <span className="text-xs text-muted-foreground">{level.label}</span>
                <span className="text-xs text-muted-foreground">({level.range})</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2">People Count (Size)</h4>
          <div className="space-y-1">
            {sizeLevels.map((level, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="rounded-full bg-primary/60"
                  style={{ width: `${level.size/2}px`, height: `${level.size/2}px` }}
                />
                <span className="text-xs text-muted-foreground">{level.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}