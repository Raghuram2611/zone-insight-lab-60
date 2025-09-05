import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Activity, BarChart3, TrendingUp } from "lucide-react";

interface FeatureThumbnailsProps {
  onFeatureSelect: (feature: string) => void;
  selectedFeature: string;
}

const features = [
  {
    id: "heatmap",
    title: "Heat Map",
    description: "Zone activity visualization",
    icon: Activity,
    color: "text-heat-high"
  },
  {
    id: "graph",
    title: "Analytics Graph",
    description: "Real-time metrics",
    icon: BarChart3,
    color: "text-primary"
  },
  {
    id: "storefunneling",
    title: "Store Funneling",
    description: "Customer flow analysis",
    icon: TrendingUp,
    color: "text-accent"
  }
];

export function FeatureThumbnails({ onFeatureSelect, selectedFeature }: FeatureThumbnailsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 p-4">
      {features.map((feature) => {
        const Icon = feature.icon;
        const isSelected = selectedFeature === feature.id;
        
        return (
          <Card 
            key={feature.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              isSelected ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-accent/10'
            }`}
            onClick={() => onFeatureSelect(feature.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-secondary ${feature.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}