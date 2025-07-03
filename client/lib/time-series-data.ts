export interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
  time: number; // milliseconds since epoch
}

export interface TemperatureLimit {
  high?: number;
  low?: number;
  enabled: boolean;
}

export interface DataSeries {
  id: string;
  name: string;
  description: string;
  color: string;
  data: TimeSeriesDataPoint[];
  unit?: string;
  baseValue: number;
  currentValue: number;
  lastUpdateTime: number;
  limits: TemperatureLimit;
}

// Generate real-time temperature reading
export const generateRealTimeValue = (series: DataSeries): number => {
  const now = Date.now();
  const timeDiff = now - series.lastUpdateTime;

  // Simulate realistic temperature variation
  const timeBasedTrend = Math.sin(now / 10000) * 2; // Slow oscillation
  const randomNoise = (Math.random() - 0.5) * 0.5; // Small random variation
  const driftFactor = (Math.random() - 0.5) * 0.1; // Very small drift

  const newValue =
    series.baseValue + timeBasedTrend + randomNoise + driftFactor;
  return Math.round(newValue * 100) / 100;
};

// Initialize data series with historical data (last 30 seconds)
const initializeHistoricalData = (
  baseValue: number,
  channelIndex: number,
): TimeSeriesDataPoint[] => {
  const data: TimeSeriesDataPoint[] = [];
  const now = Date.now();
  const duration = 30000; // 30 seconds of history

  for (let i = duration; i >= 0; i -= 100) {
    // Every 100ms for 30 seconds
    const timestamp = now - i;
    const date = new Date(timestamp);

    // Generate realistic historical variation
    const trend = Math.sin(timestamp / 10000) * 2;
    const noise = (Math.random() - 0.5) * 0.5;
    const value = Math.max(0, baseValue + trend + noise);

    data.push({
      timestamp: date.toISOString(),
      value: Math.round(value * 100) / 100,
      time: timestamp,
    });
  }

  return data;
};

// Generate a single channel data series
export const createChannel = (index: number): DataSeries => {
  const baseValue = 20 + index * 2 + (Math.random() - 0.5) * 5; // Base temperature with variation
  const now = Date.now();

  return {
    id: `channel_${index}`,
    name: `Channel ${index}`,
    description: `Temperature sensor channel ${index}`,
    color: `hsl(${(index * 23) % 360}, 70%, 50%)`,
    unit: "°C",
    baseValue,
    currentValue: baseValue,
    lastUpdateTime: now,
    data: initializeHistoricalData(baseValue, index),
    limits: {
      enabled: false,
    },
  };
};

// Update a channel with new real-time data
export const updateChannelData = (series: DataSeries): DataSeries => {
  const now = Date.now();
  const newValue = generateRealTimeValue(series);

  const newDataPoint: TimeSeriesDataPoint = {
    timestamp: new Date(now).toISOString(),
    value: newValue,
    time: now,
  };

  // Keep only last 30 seconds of data (300 points at 100ms intervals)
  const maxDataPoints = 300;
  const updatedData = [...series.data, newDataPoint];

  if (updatedData.length > maxDataPoints) {
    updatedData.shift(); // Remove oldest point
  }

  return {
    ...series,
    data: updatedData,
    currentValue: newValue,
    lastUpdateTime: now,
  };
};

// Check if current value exceeds limits
export const checkLimits = (series: DataSeries): "high" | "low" | null => {
  if (!series.limits.enabled) return null;

  if (
    series.limits.high !== undefined &&
    series.currentValue > series.limits.high
  ) {
    return "high";
  }

  if (
    series.limits.low !== undefined &&
    series.currentValue < series.limits.low
  ) {
    return "low";
  }

  return null;
};

// Initial data with only Channel 0
export const initialDataSeries: DataSeries[] = [createChannel(0)];
