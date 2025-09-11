import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { DateTimePicker } from "./DateTimePicker";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { BarChart3, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface ZoneGraphData {
  zones: Record<string, Array<{ time: string; count: number }>>;
}

interface ZonePieData {
  zones: Array<{ zone: string; visitors: number; percentage: number }>;
}

interface AnalyticsPanelProps {}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function AnalyticsPanel({}: AnalyticsPanelProps) {
  const [startDateTime, setStartDateTime] = useState<Date | null>(null);
  const [endDateTime, setEndDateTime] = useState<Date | null>(null);
  const [isZoneAnalytics, setIsZoneAnalytics] = useState(true);
  const [zoneGraphData, setZoneGraphData] = useState<ZoneGraphData | null>(null);
  const [zonePieData, setZonePieData] = useState<ZonePieData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!startDateTime || !endDateTime) {
      toast.error("Please select both start and end date/times");
      return;
    }

    setIsLoading(true);
    try {
      const startTimeStr = format(startDateTime, "HH:mm:ss");
      const endTimeStr = format(endDateTime, "HH:mm:ss");

      if (isZoneAnalytics) {
        // Try to call zone-graphs API, fallback to mock data
        try {
          const response = await fetch("http://localhost:8000/zone-graphs", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              start_time: startTimeStr,
              end_time: endTimeStr,
            }),
          });

          if (!response.ok) {
            throw new Error("API not available");
          }

          const data: ZoneGraphData = await response.json();
          setZoneGraphData(data);
          setZonePieData(null);
        } catch {
          // Provide mock data for demonstration
          const mockZoneData: ZoneGraphData = {
            zones: {
              "ATM": [
                { time: startTimeStr, count: 3 },
                { time: "10:30:00", count: 5 },
                { time: "11:00:00", count: 4 },
                { time: endTimeStr, count: 6 }
              ],
              "Chips": [
                { time: startTimeStr, count: 8 },
                { time: "10:30:00", count: 12 },
                { time: "11:00:00", count: 10 },
                { time: endTimeStr, count: 15 }
              ],
              "Cold Storage": [
                { time: startTimeStr, count: 2 },
                { time: "10:30:00", count: 3 },
                { time: "11:00:00", count: 1 },
                { time: endTimeStr, count: 4 }
              ],
              "Entrance": [
                { time: startTimeStr, count: 12 },
                { time: "10:30:00", count: 18 },
                { time: "11:00:00", count: 15 },
                { time: endTimeStr, count: 20 }
              ]
            }
          };
          setZoneGraphData(mockZoneData);
          setZonePieData(null);
          toast.success("Showing demo data (backend unavailable)");
        }
      } else {
        // Try to call zone-pie API, fallback to mock data
        try {
          const response = await fetch("http://localhost:8000/zone-pie", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              start_time: startTimeStr,
              end_time: endTimeStr,
            }),
          });

          if (!response.ok) {
            throw new Error("API not available");
          }

          const data: ZonePieData = await response.json();
          setZonePieData(data);
          setZoneGraphData(null);
        } catch {
          // Provide mock data for demonstration
          const mockPieData: ZonePieData = {
            zones: [
              { zone: "ATM", visitors: 18, percentage: 15.0 },
              { zone: "Chips", visitors: 45, percentage: 37.5 },
              { zone: "Cold Storage", visitors: 10, percentage: 8.3 },
              { zone: "Entrance", visitors: 47, percentage: 39.2 }
            ]
          };
          setZonePieData(mockPieData);
          setZoneGraphData(null);
          toast.success("Showing demo data (backend unavailable)");
        }
      }
    } catch (error) {
      console.error("Error in analytics:", error);
      toast.error("Failed to generate analytics");
    } finally {
      setIsLoading(false);
    }
  };

  const renderZoneGraphs = () => {
    if (!zoneGraphData) return null;

    const zoneEntries = Object.entries(zoneGraphData.zones);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {zoneEntries.map(([zone, data]) => (
          <Card key={zone} className="bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Zone {zone} - Traffic Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="time" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))"
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderPieChart = () => {
    if (!zonePieData) return null;

    return (
      <Card className="bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Individual Zone Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={zonePieData.zones}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ zone, percentage }) => `Zone ${zone}: ${percentage.toFixed(1)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="visitors"
                >
                  {zonePieData.zones.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))"
                  }}
                  formatter={(value, name) => [`${value} visitors`, `Zone ${name}`]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Zone Statistics */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
            {zonePieData.zones.map((zone, index) => (
              <div key={zone.zone} className="bg-background/50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium">Zone {zone.zone}</span>
                </div>
                <div className="text-2xl font-bold text-primary">{zone.visitors}</div>
                <div className="text-sm text-muted-foreground">visitors</div>
                <div className="text-lg font-semibold mt-1">{zone.percentage.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      {/* Controls */}
      <Card className="bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Analytics Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Time Selectors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Start Date & Time</Label>
              <DateTimePicker
                onDateTimeSelect={setStartDateTime}
                onModeToggle={() => {}} // Not used in analytics
                isHistoricalMode={false}
                selectedDateTime={startDateTime}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">End Date & Time</Label>
              <DateTimePicker
                onDateTimeSelect={setEndDateTime}
                onModeToggle={() => {}} // Not used in analytics
                isHistoricalMode={false}
                selectedDateTime={endDateTime}
              />
            </div>
          </div>

          {/* Analytics Type Toggle */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Analytics Type</Label>
            <div className="flex bg-muted/30 rounded-lg p-1 w-fit">
              <button
                onClick={() => setIsZoneAnalytics(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  isZoneAnalytics 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Zone Analysis
              </button>
              <button
                onClick={() => setIsZoneAnalytics(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  !isZoneAnalytics 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Individual Analysis
              </button>
            </div>
          </div>

          {/* Analyze Button */}
          <Button
            onClick={handleAnalyze}
            disabled={!startDateTime || !endDateTime || isLoading}
            className="w-full"
          >
            {isLoading ? "Analyzing..." : "Analyze"}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex-1 overflow-auto">
        {!zoneGraphData && !zonePieData && (
          <div className="h-full flex items-center justify-center">
            <Card className="max-w-md w-full bg-card/60 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <BarChart3 className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-3">Analytics Dashboard</h3>
                <p className="text-muted-foreground">
                  Configure time range and analytics type above to view insights
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {isZoneAnalytics && zoneGraphData && renderZoneGraphs()}
        {!isZoneAnalytics && zonePieData && renderPieChart()}
      </div>
    </div>
  );
}