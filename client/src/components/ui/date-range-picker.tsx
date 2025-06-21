import { format, subDays } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  className?: string;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
  onDateFromChange: (date: string | undefined) => void;
  onDateToChange: (date: string | undefined) => void;
}

type PresetValue = "none" | "today" | "7d" | "30d" | "custom";

export function DateRangePicker({
  className,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: DateRangePickerProps) {
  const [preset, setPreset] = React.useState<PresetValue>("none");
  const [isCustomPopoverOpen, setIsCustomPopoverOpen] = React.useState(false);

  const [tempDateFrom, setTempDateFrom] = React.useState<string | undefined>();
  const [tempDateTo, setTempDateTo] = React.useState<string | undefined>();

  const today = new Date();
  const presets = [
    {
      value: "none" as const,
      label: "All dates",
      dateFrom: undefined,
      dateTo: undefined,
    },
    {
      value: "today" as const,
      label: "Today",
      dateFrom: format(today, "yyyy-MM-dd"),
      dateTo: format(today, "yyyy-MM-dd"),
    },
    {
      value: "7d" as const,
      label: "Last 7 days",
      dateFrom: format(subDays(today, 7), "yyyy-MM-dd"),
      dateTo: format(today, "yyyy-MM-dd"),
    },
    {
      value: "30d" as const,
      label: "Last 30 days",
      dateFrom: format(subDays(today, 30), "yyyy-MM-dd"),
      dateTo: format(today, "yyyy-MM-dd"),
    },
    {
      value: "custom" as const,
      label: "Custom range...",
      dateFrom: undefined,
      dateTo: undefined,
    },
  ];

  const handlePresetChange = (value: string) => {
    if (value === "custom") {
      handleCustomPopoverOpen();
      return;
    }

    const selectedPreset = presets.find((p) => p.value === value);
    setPreset(value as PresetValue);

    if (selectedPreset) {
      onDateFromChange(selectedPreset.dateFrom);
      onDateToChange(selectedPreset.dateTo);
    }
  };

  const handleCustomRangeApply = () => {
    setIsCustomPopoverOpen(false);
    onDateFromChange(tempDateFrom);
    onDateToChange(tempDateTo);
    if (tempDateFrom || tempDateTo) {
      setPreset("custom");
    } else {
      setPreset("none");
    }
  };

  const handleCustomPopoverClose = () => {
    setIsCustomPopoverOpen(false);
    setTempDateFrom(dateFrom);
    setTempDateTo(dateTo);
  };

  const handleCustomPopoverOpen = () => {
    setIsCustomPopoverOpen(true);
    setTempDateFrom(dateFrom);
    setTempDateTo(dateTo);
  };

  const getSelectDisplayValue = () => {
    if (!dateFrom && !dateTo) {
      return "All dates";
    }

    if (preset !== "custom") {
      return presets.find((p) => p.value === preset)?.label ?? "All dates";
    }

    if (dateFrom && dateTo) {
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      return `${format(fromDate, "MMM d")} - ${format(toDate, "MMM d, yyyy")}`;
    }

    if (dateFrom) {
      return `From ${format(new Date(dateFrom), "MMM d, yyyy")}`;
    }

    if (dateTo) {
      return `Until ${format(new Date(dateTo), "MMM d, yyyy")}`;
    }

    return "All dates";
  };

  React.useEffect(() => {
    if (!dateFrom && !dateTo) {
      setPreset("none");
      return;
    }

    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");
    const sevenDaysAgoStr = format(subDays(today, 7), "yyyy-MM-dd");
    const thirtyDaysAgoStr = format(subDays(today, 30), "yyyy-MM-dd");

    if (dateFrom === todayStr && dateTo === todayStr) {
      setPreset("today");
    } else if (dateFrom === sevenDaysAgoStr && dateTo === todayStr) {
      setPreset("7d");
    } else if (dateFrom === thirtyDaysAgoStr && dateTo === todayStr) {
      setPreset("30d");
    } else {
      setPreset("custom");
    }
  }, [dateFrom, dateTo]);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select value={preset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue>{getSelectDisplayValue()}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {presets.map((presetItem) => (
            <SelectItem
              key={presetItem.value}
              value={presetItem.value}
              onSelect={() => {
                if (presetItem.value === "custom") {
                  // setTimeout to allow the select to close first
                  setTimeout(() => {
                    handleCustomPopoverOpen();
                  }, 0);
                }
              }}
            >
              {presetItem.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isCustomPopoverOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={handleCustomPopoverClose}
        >
          <div
            className="relative bg-background border rounded-lg shadow-lg w-auto p-0"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Custom Date Range</h4>
                <p className="text-xs text-muted-foreground">
                  Select a custom date range for filtering
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">From Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !tempDateFrom && "text-muted-foreground",
                        )}
                        size="sm"
                        variant="outline"
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {tempDateFrom
                          ? format(new Date(tempDateFrom), "MMM d, yyyy")
                          : "Start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        disabled={{ after: new Date() }}
                        mode="single"
                        selected={
                          tempDateFrom ? new Date(tempDateFrom) : undefined
                        }
                        onSelect={(date) => {
                          setTempDateFrom(
                            date ? format(date, "yyyy-MM-dd") : undefined,
                          );
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">To Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !tempDateTo && "text-muted-foreground",
                        )}
                        size="sm"
                        variant="outline"
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {tempDateTo
                          ? format(new Date(tempDateTo), "MMM d, yyyy")
                          : "End date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        disabled={{
                          after: new Date(),
                          before: tempDateFrom
                            ? new Date(tempDateFrom)
                            : undefined,
                        }}
                        mode="single"
                        selected={tempDateTo ? new Date(tempDateTo) : undefined}
                        onSelect={(date) => {
                          setTempDateTo(
                            date ? format(date, "yyyy-MM-dd") : undefined,
                          );
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setTempDateFrom(undefined);
                    setTempDateTo(undefined);
                  }}
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  type="button"
                  onClick={handleCustomRangeApply}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
