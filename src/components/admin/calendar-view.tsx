"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Route, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, formatTime } from "@/lib/utils";

export type CalendarTrip = {
  id: string;
  passengerName: string;
  scheduledPickup: string;
  status: string;
  driverName: string | null;
};

export type CalendarShift = {
  id: string;
  driverName: string;
  startTime: string;
  endTime: string;
  status: string;
};

const statusColor: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  REQUESTED: "secondary",
  ASSIGNED: "default",
  EN_ROUTE: "warning",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

function isoDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = x.getDay();
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function CalendarView({
  trips,
  shifts,
  view,
  anchorDate,
}: {
  trips: CalendarTrip[];
  shifts: CalendarShift[];
  view: "month" | "week";
  anchorDate: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const anchor = new Date(anchorDate + "T00:00:00");

  function navigate(newView: "month" | "week", newAnchor: Date) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", newView);
    params.set("date", isoDate(newAnchor));
    router.push(`${pathname}?${params.toString()}`);
  }

  function shift(amount: number) {
    const next = new Date(anchor);
    if (view === "month") next.setMonth(next.getMonth() + amount);
    else next.setDate(next.getDate() + amount * 7);
    navigate(view, next);
  }

  const tripsByDay = new Map<string, CalendarTrip[]>();
  for (const t of trips) {
    const key = isoDate(new Date(t.scheduledPickup));
    tripsByDay.set(key, [...(tripsByDay.get(key) ?? []), t]);
  }
  const shiftsByDay = new Map<string, CalendarShift[]>();
  for (const s of shifts) {
    const key = isoDate(new Date(s.startTime));
    shiftsByDay.set(key, [...(shiftsByDay.get(key) ?? []), s]);
  }

  const cells: Date[] = [];
  if (view === "month") {
    const firstOfMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const gridStart = startOfWeek(firstOfMonth);
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(d.getDate() + i);
      cells.push(d);
    }
  } else {
    const weekStart = startOfWeek(anchor);
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      cells.push(d);
    }
  }

  const title =
    view === "month"
      ? new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(anchor)
      : `Week of ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(cells[0])}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => shift(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="min-w-[180px] text-lg font-semibold">{title}</h2>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => shift(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate(view, new Date())}>
            Today
          </Button>
        </div>
        <Tabs value={view} onValueChange={(v) => navigate(v as "month" | "week", anchor)}>
          <TabsList>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border text-xs font-medium text-muted-foreground">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="bg-muted/50 px-2 py-1.5 text-center">
            {d}
          </div>
        ))}
      </div>
      <div
        className={cn(
          "grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border",
          view === "week" && "grid-rows-1"
        )}
      >
        {cells.map((d, i) => {
          const key = isoDate(d);
          const inMonth = view === "week" || d.getMonth() === anchor.getMonth();
          const isToday = key === isoDate(new Date());
          const dayTrips = tripsByDay.get(key) ?? [];
          const dayShifts = shiftsByDay.get(key) ?? [];
          return (
            <div
              key={i}
              className={cn(
                "min-h-[110px] bg-background p-1.5",
                !inMonth && "bg-muted/20 text-muted-foreground",
                view === "week" && "min-h-[320px]"
              )}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className={cn("flex h-5 w-5 items-center justify-center rounded-full text-xs", isToday && "bg-primary text-primary-foreground")}>
                  {d.getDate()}
                </span>
                {dayShifts.length > 0 && (
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    <User className="h-2.5 w-2.5" /> {dayShifts.length}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {dayTrips.slice(0, view === "week" ? 12 : 3).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-1 truncate rounded bg-muted px-1 py-0.5 text-[10px]"
                    title={`${t.passengerName} · ${t.driverName ?? "Unassigned"}`}
                  >
                    <Route className="h-2.5 w-2.5 shrink-0" />
                    <span className="truncate">
                      {formatTime(t.scheduledPickup)} {t.passengerName}
                    </span>
                  </div>
                ))}
                {dayTrips.length > (view === "week" ? 12 : 3) && (
                  <div className="text-[10px] text-muted-foreground">+{dayTrips.length - (view === "week" ? 12 : 3)} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Legend:</span>
        {Object.entries(statusColor).map(([status, variant]) => (
          <Badge key={status} variant={variant} className="text-[10px]">
            {status.replace("_", " ")}
          </Badge>
        ))}
      </div>
    </div>
  );
}
