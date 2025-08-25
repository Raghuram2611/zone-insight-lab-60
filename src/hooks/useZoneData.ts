import { useState, useEffect } from "react";

export interface ZoneCountData {
  Time: string;
  Count: number;
}

export interface ZoneApiData {
  StoreId: string;
  Floor: string;
  Zone: string;
  Count: ZoneCountData[];
}

export interface ProcessedZoneData {
  population: number;
  avg_time: number;
  heat_score: number;
  dwell_time: number;
  is_crowded: boolean;
}

export interface TimeSeriesData {
  [timestamp: string]: {
    store_id: string;
    timestamp: string;
    zones: Record<string, ProcessedZoneData>;
  };
}

const ZONE_NAMES = ['Zone A', 'Zone B', 'Zone C', 'Zone D']; // Expandable to Zone L later
const API_BASE_URL = 'http://localhost:8000'; // Adjust as needed

export function useZoneData() {
  const [zoneData, setZoneData] = useState<Record<string, ZoneApiData>>({});
  const [processedData, setProcessedData] = useState<TimeSeriesData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchZoneData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const promises = ZONE_NAMES.map(async (zoneName) => {
        const zoneKey = zoneName.toLowerCase().replace(' ', '_');
        const response = await fetch(`${API_BASE_URL}/zone/${zoneKey}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ${zoneName}: ${response.statusText}`);
        }
        
        const data: ZoneApiData = await response.json();
        return { zoneName, data };
      });

      const results = await Promise.all(promises);
      const newZoneData: Record<string, ZoneApiData> = {};
      
      results.forEach(({ zoneName, data }) => {
        newZoneData[zoneName] = data;
      });

      setZoneData(newZoneData);
      processTimeSeriesData(newZoneData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch zone data');
      console.error('Error fetching zone data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const processTimeSeriesData = (rawZoneData: Record<string, ZoneApiData>) => {
    const timeSeriesMap: TimeSeriesData = {};
    
    // Get all unique timestamps across all zones
    const allTimestamps = new Set<string>();
    Object.values(rawZoneData).forEach(zoneData => {
      zoneData.Count.forEach(countData => {
        allTimestamps.add(countData.Time);
      });
    });

    // Process data for each timestamp
    allTimestamps.forEach(timestamp => {
      const zonesAtTime: Record<string, ProcessedZoneData> = {};
      
      Object.entries(rawZoneData).forEach(([zoneName, zoneData]) => {
        const countData = zoneData.Count.find(c => c.Time === timestamp);
        
        if (countData) {
          const count = countData.Count;
          const is_crowded = count > 12;
          
          // Calculate dwell time (simulate based on count - you can adjust this logic)
          const dwell_time = Math.max(30, count * 15); // Minimum 30 seconds, increases with count
          
          // Calculate heat score (0-1 scale based on count and crowding)
          const heat_score = Math.min(1, (count / 20) + (is_crowded ? 0.3 : 0));
          
          zonesAtTime[zoneName] = {
            population: count,
            avg_time: dwell_time,
            heat_score,
            dwell_time,
            is_crowded
          };
        }
      });

      if (Object.keys(zonesAtTime).length > 0) {
        // Create a proper timestamp format (assuming Time is HH:MM:SS)
        const today = new Date().toISOString().split('T')[0];
        const fullTimestamp = `${today}T${timestamp}`;
        
        timeSeriesMap[fullTimestamp] = {
          store_id: Object.values(rawZoneData)[0]?.StoreId || 'Unknown',
          timestamp: fullTimestamp,
          zones: zonesAtTime
        };
      }
    });

    setProcessedData(timeSeriesMap);
  };

  useEffect(() => {
    fetchZoneData();
    
    // Set up periodic refresh (every 30 seconds)
    const interval = setInterval(fetchZoneData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    zoneData,
    processedData,
    isLoading,
    error,
    refreshData: fetchZoneData
  };
}