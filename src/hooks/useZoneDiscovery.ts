import { useState, useEffect } from 'react';

export function useZoneDiscovery(baseUrl: string = 'http://localhost:8000') {
  const [zones, setZones] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);

  const fetchZones = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Add timeout and better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${baseUrl}/zones`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setZones(data.zones || []);
      setIsBackendAvailable(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch zones';
      setError(errorMessage);
      setIsBackendAvailable(false);
      
      // Only log errors that aren't network connectivity issues
      if (!errorMessage.includes('Failed to fetch') && !errorMessage.includes('AbortError')) {
        console.error('Zone fetch error:', err);
      }
      
      // Use zones that correspond to available videos
      const defaultZones = ['ATM', 'Chips', 'Cold Storage', 'Entrance', 'Office'];
      setZones(defaultZones);
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
    isBackendAvailable,
    refetch: fetchZones
  };
}