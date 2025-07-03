import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DataSeries } from "@/lib/time-series-data";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TimeSeriesChartProps {
  dataSeries: DataSeries[];
  selectedSeries: string[];
}

interface ChartData {
  time: string;
  timestamp: string;
  [key: string]: string | number;
}

export function TimeSeriesChart({
  dataSeries,
  selectedSeries,
}: TimeSeriesChartProps) {
  // Transform data for recharts
  const chartData: ChartData[] = React.useMemo(() => {
    if (selectedSeries.length === 0) return [];

    // Get all unique timestamps from selected series
    const allTimestamps = new Set<number>();
    selectedSeries.forEach((seriesId) => {
      const series = dataSeries.find((s) => s.id === seriesId);
      if (series) {
        series.data.forEach((point) => {
          if (point.time) {
            allTimestamps.add(point.time);
          }
        });
      }
    });

    // Sort timestamps and take last 100 points for performance
    const sortedTimestamps = Array.from(allTimestamps).sort().slice(-100);

    return sortedTimestamps.map((timestamp) => {
      const date = new Date(timestamp);
      const dataPoint: ChartData = {
        time: format(date, "HH:mm:ss.SSS"),
        timestamp: date.toISOString(),
      };

      selectedSeries.forEach((seriesId) => {
        const series = dataSeries.find((s) => s.id === seriesId);
        if (series) {
          const point = series.data.find((p) => p.time === timestamp);
          dataPoint[seriesId] = point ? point.value : 0;
        }
      });

      return dataPoint;
    });
  }, [dataSeries, selectedSeries]);

  // Calculate stats for selected metrics
  const metricStats = React.useMemo(() => {
    return selectedSeries
      .map((seriesId) => {
        const series = dataSeries.find((s) => s.id === seriesId);
        if (!series) return null;

        const values = series.data.map((d) => d.value);
        const current = values[values.length - 1];
        const previous = values[values.length - 2];
        const change = previous ? ((current - previous) / previous) * 100 : 0;
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        const max = Math.max(...values);
        const min = Math.min(...values);

        return {
          series,
          current,
          change,
          avg,
          max,
          min,
        };
      })
      .filter(Boolean);
  }, [dataSeries, selectedSeries]);

  if (selectedSeries.length === 0) {
    return (
      <div className="flex-1 p-6">
        <Card className="h-full flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-muted mx-auto flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium">No Data Selected</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Select one or more data sources from the sidebar to view time
                series charts and analytics
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6">
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricStats.map((stat) => {
          if (!stat) return null;

          const getTrendIcon = () => {
            if (stat.change > 0)
              return <TrendingUp className="h-4 w-4 text-green-500" />;
            if (stat.change < 0)
              return <TrendingDown className="h-4 w-4 text-red-500" />;
            return <Minus className="h-4 w-4 text-gray-500" />;
          };

          const getTrendColor = () => {
            if (stat.change > 0) return "text-green-600";
            if (stat.change < 0) return "text-red-600";
            return "text-gray-600";
          };

          return (
            <Card key={stat.series.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: stat.series.color }}
                    />
                    <CardTitle className="text-sm font-medium">
                      {stat.series.name}
                    </CardTitle>
                  </div>
                  {getTrendIcon()}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">
                    {stat.current.toLocaleString()}
                    {stat.series.unit ? ` ${stat.series.unit}` : ""}
                  </div>
                  <div className={`text-xs ${getTrendColor()}`}>
                    {stat.change > 0 ? "+" : ""}
                    {stat.change.toFixed(1)}% from yesterday
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Avg:{" "}
                    {stat.avg.toLocaleString(undefined, {
                      maximumFractionDigits: 1,
                    })}
                    {stat.series.unit ? ` ${stat.series.unit}` : ""}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Time Series Analysis</CardTitle>
          <CardDescription>
            Trend analysis for selected metrics over the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="time"
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--card-foreground))",
                  }}
                  labelFormatter={(value) => `Time: ${value}`}
                  formatter={(value: number, name: string) => {
                    const series = dataSeries.find((s) => s.id === name);
                    return [
                      `${value.toLocaleString()}${series?.unit ? ` ${series.unit}` : ""}`,
                      series?.name || name,
                    ];
                  }}
                />
                <Legend
                  formatter={(value: string) => {
                    const series = dataSeries.find((s) => s.id === value);
                    return series?.name || value;
                  }}
                />
                {selectedSeries.map((seriesId) => {
                  const series = dataSeries.find((s) => s.id === seriesId);
                  if (!series) return null;

                  return (
                    <Line
                      key={seriesId}
                      type="monotone"
                      dataKey={seriesId}
                      stroke={series.color}
                      strokeWidth={2}
                      dot={{ fill: series.color, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: series.color, strokeWidth: 2 }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
