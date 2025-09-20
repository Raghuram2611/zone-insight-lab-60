import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Activity, BarChart3, TrendingUp, MessageSquare } from "lucide-react";

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
  },

];

export function FeatureThumbnails({ onFeatureSelect, selectedFeature }: FeatureThumbnailsProps) {
  return (
    <div className="flex gap-2 p-2">
      {features.map((feature) => {
        const Icon = feature.icon;
        const isSelected = selectedFeature === feature.id;
        
        return (
          <Card 
            key={feature.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md min-w-0 ${
              isSelected ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-accent/10'
            }`}
            onClick={() => onFeatureSelect(feature.id)}
          >
            <CardContent className="p-2">
              <div className="flex flex-col items-center gap-1 text-center">
                <div className={`p-1.5 rounded-md bg-secondary ${feature.color}`}>
                  <Icon className="w-3 h-3" />
                </div>
                <div>
                  <h3 className="font-medium text-xs leading-none">{feature.title}</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">
                    {feature.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}