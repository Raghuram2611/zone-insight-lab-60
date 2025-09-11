// Utility functions for video handling

export interface VideoConfig {
  zone: string;
  filename: string;
  displayName: string;
}

// Map of available video files in the public/videos directory
export const VIDEO_CONFIGS: VideoConfig[] = [
  { zone: 'ATM', filename: 'ATM.mp4', displayName: 'ATM Zone' },
  { zone: 'Chips', filename: 'Chips.mp4', displayName: 'Chips Zone' },
  { zone: 'Cold Storage', filename: 'Cold Storage.mp4', displayName: 'Cold Storage' },
  { zone: 'Entrance', filename: 'Entrance.mp4', displayName: 'Entrance Zone' },
  { zone: 'Office', filename: 'Office.mp4', displayName: 'Office Zone' }
];

export function getVideoPath(zone: string): string {
  const config = VIDEO_CONFIGS.find(v => v.zone === zone);
  if (config) {
    return `/videos/${config.filename}`;
  }
  
  // Fallback for unknown zones
  return `/videos/${zone}.mp4`;
}

export function getAvailableZones(): string[] {
  return VIDEO_CONFIGS.map(config => config.zone);
}

export function getDisplayName(zone: string): string {
  const config = VIDEO_CONFIGS.find(v => v.zone === zone);
  return config?.displayName || `Zone ${zone}`;
}

// Auto-play helper with error handling
export async function playVideo(videoElement: HTMLVideoElement): Promise<boolean> {
  try {
    await videoElement.play();
    return true;
  } catch (error) {
    console.warn('Auto-play prevented:', error);
    return false;
  }
}

// Check if video file exists
export async function checkVideoExists(zone: string): Promise<boolean> {
  try {
    const videoPath = getVideoPath(zone);
    const response = await fetch(videoPath, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}