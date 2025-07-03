import React, { useState, useEffect, useRef } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DataSelector } from "@/components/dashboard/DataSelector";
import { TimeSeriesChart } from "@/components/dashboard/TimeSeriesChart";
import {
  initialDataSeries,
  createChannel,
  updateChannelData,
  DataSeries,
  TemperatureLimit,
} from "@/lib/time-series-data";

export default function Index() {
  const [dataSeries, setDataSeries] = useState<DataSeries[]>(initialDataSeries);
  const [selectedSeries, setSelectedSeries] = useState<string[]>(["channel_0"]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleSelectionChange = (seriesId: string, checked: boolean) => {
    setSelectedSeries((prev) =>
      checked ? [...prev, seriesId] : prev.filter((id) => id !== seriesId),
    );
  };

  const handleAddChannel = () => {
    const nextChannelIndex = dataSeries.length;
    const newChannel = createChannel(nextChannelIndex);
    setDataSeries((prev) => [...prev, newChannel]);
  };

  const handleRemoveChannels = () => {
    // Remove selected channels from dataSeries
    setDataSeries((prev) =>
      prev.filter((series) => !selectedSeries.includes(series.id)),
    );
    // Clear selected series since they're being removed
    setSelectedSeries([]);
  };

  const handleUpdateLimits = (seriesId: string, limits: TemperatureLimit) => {
    setDataSeries((prev) =>
      prev.map((series) =>
        series.id === seriesId ? { ...series, limits } : series,
      ),
    );
  };

  // Real-time data updates
  useEffect(() => {
    // Update every 100ms for smooth real-time visualization (1ms would be too intensive)
    intervalRef.current = setInterval(() => {
      setDataSeries((prevSeries) =>
        prevSeries.map((series) => updateChannelData(series)),
      );
    }, 100); // 100ms interval for better performance than 1ms

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="flex flex-col lg:flex-row">
        <DataSelector
          dataSeries={dataSeries}
          selectedSeries={selectedSeries}
          onSelectionChange={handleSelectionChange}
          onAddChannel={handleAddChannel}
          onRemoveChannels={handleRemoveChannels}
          onUpdateLimits={handleUpdateLimits}
        />
        <TimeSeriesChart
          dataSeries={dataSeries}
          selectedSeries={selectedSeries}
        />
      </div>
    </div>
  );
}
