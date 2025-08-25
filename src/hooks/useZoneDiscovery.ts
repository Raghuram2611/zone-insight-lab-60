import { useState, useEffect } from 'react';

export function useZoneDiscovery(baseUrl: string = 'http://localhost:8000') {
  const [zones, setZones] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchZones = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${baseUrl}/zones`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch zones: ${response.statusText}`);
      }
      
      const data = await response.json();
      setZones(data.zones || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch zones');
      console.error('Error fetching zones:', err);
      // Fallback to default zones if API fails
      setZones(['A', 'B', 'C', 'D']);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, [baseUrl]);

  return {
    zones,
    isLoading,
    error,
    refetch: fetchZones
  };
}