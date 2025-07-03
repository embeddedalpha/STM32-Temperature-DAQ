import { Button } from "@/components/ui/button";
import { BarChart3, Calendar, Download, Settings } from "lucide-react";

export function DashboardHeader() {
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <BarChart3 className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Temperature DAQ</h1>
              <p className="text-xs text-muted-foreground">
                Real-time Temperature Monitoring
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-2 hidden sm:flex">
            <Calendar className="h-4 w-4" />
            <span className="hidden md:inline">Real-time</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 hidden sm:flex">
            <Download className="h-4 w-4" />
            <span className="hidden md:inline">Export</span>
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
