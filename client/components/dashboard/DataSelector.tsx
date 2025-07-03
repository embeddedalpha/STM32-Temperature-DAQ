import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DataSeries,
  TemperatureLimit,
  checkLimits,
} from "@/lib/time-series-data";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Settings, AlertTriangle } from "lucide-react";

interface DataSelectorProps {
  dataSeries: DataSeries[];
  selectedSeries: string[];
  onSelectionChange: (seriesId: string, checked: boolean) => void;
  onAddChannel: () => void;
  onRemoveChannels: () => void;
  onUpdateLimits: (seriesId: string, limits: TemperatureLimit) => void;
}

export function DataSelector({
  dataSeries,
  selectedSeries,
  onSelectionChange,
  onAddChannel,
  onRemoveChannels,
  onUpdateLimits,
}: DataSelectorProps) {
  const [limitDialogOpen, setLimitDialogOpen] = useState(false);
  const [currentEditingSeries, setCurrentEditingSeries] =
    useState<DataSeries | null>(null);
  const [tempLimits, setTempLimits] = useState<TemperatureLimit>({
    enabled: false,
  });

  const handleLimitEdit = (series: DataSeries) => {
    setCurrentEditingSeries(series);
    setTempLimits({ ...series.limits });
    setLimitDialogOpen(true);
  };

  const handleLimitSave = () => {
    if (currentEditingSeries) {
      onUpdateLimits(currentEditingSeries.id, tempLimits);
      setLimitDialogOpen(false);
      setCurrentEditingSeries(null);
    }
  };
  return (
    <div className="w-full lg:w-80 border-r border-b lg:border-b-0 bg-background/50 p-4 lg:p-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Channels</CardTitle>
          <CardDescription>
            Select metrics to display on the chart
          </CardDescription>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={onRemoveChannels}
              disabled={selectedSeries.length === 0}
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={onAddChannel}
            >
              <Plus className="h-4 w-4" />
              Add Channel
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {dataSeries.map((series) => {
            const isSelected = selectedSeries.includes(series.id);
            const limitStatus = checkLimits(series);

            return (
              <div
                key={series.id}
                className={cn(
                  "flex items-start space-x-3 rounded-lg border p-3 transition-colors",
                  isSelected
                    ? "border-primary/50 bg-primary/5"
                    : "border-border hover:border-primary/30",
                  limitStatus &&
                    "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950",
                )}
              >
                <Checkbox
                  id={series.id}
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    onSelectionChange(series.id, checked as boolean)
                  }
                  className="mt-0.5"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: series.color }}
                    />
                    <label
                      htmlFor={series.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {series.name}
                    </label>
                    {series.unit && (
                      <Badge variant="secondary" className="text-xs h-5">
                        {series.unit}
                      </Badge>
                    )}
                    {limitStatus && (
                      <Badge
                        variant="destructive"
                        className="text-xs h-5 gap-1"
                      >
                        <AlertTriangle className="h-3 w-3" />
                        {limitStatus.toUpperCase()}
                      </Badge>
                    )}
                    {series.limits.enabled && !limitStatus && (
                      <Badge variant="outline" className="text-xs h-5">
                        LIMITED
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {series.description}
                    </p>
                    <p className="text-xs font-medium">
                      {series.currentValue.toFixed(1)}°C
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleLimitEdit(series)}>
                      <Settings className="mr-2 h-4 w-4" />
                      Set Limits
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="mt-6 rounded-lg border bg-accent/30 p-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="font-medium">
            {selectedSeries.length} metrics selected
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Select multiple metrics to compare trends and patterns
        </p>
      </div>

      <Dialog open={limitDialogOpen} onOpenChange={setLimitDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Configure Temperature Limits</DialogTitle>
            <DialogDescription>
              Set high and low temperature thresholds for{" "}
              {currentEditingSeries?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enabled">Enable Limits</Label>
              <Switch
                id="enabled"
                checked={tempLimits.enabled}
                onCheckedChange={(checked) =>
                  setTempLimits((prev) => ({ ...prev, enabled: checked }))
                }
              />
            </div>

            {tempLimits.enabled && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="high-limit" className="text-right">
                    High Limit
                  </Label>
                  <Input
                    id="high-limit"
                    type="number"
                    placeholder="°C"
                    value={tempLimits.high ?? ""}
                    onChange={(e) =>
                      setTempLimits((prev) => ({
                        ...prev,
                        high: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      }))
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="low-limit" className="text-right">
                    Low Limit
                  </Label>
                  <Input
                    id="low-limit"
                    type="number"
                    placeholder="°C"
                    value={tempLimits.low ?? ""}
                    onChange={(e) =>
                      setTempLimits((prev) => ({
                        ...prev,
                        low: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      }))
                    }
                    className="col-span-3"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleLimitSave}>
              Save Limits
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
