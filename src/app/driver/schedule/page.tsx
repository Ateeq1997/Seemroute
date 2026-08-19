"use client";

import { useAppStore } from "@/store/app-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime } from "@/lib/utils";
import { CalendarClock } from "lucide-react";

const statusVariant: Record<string, "secondary" | "default" | "success" | "destructive"> = {
  SCHEDULED: "secondary",
  ACTIVE: "default",
  COMPLETED: "success",
  MISSED: "destructive",
};

export default function DriverSchedulePage() {
  const session = useAppStore((s) => s.session);
  const allShifts = useAppStore((s) => s.shifts);

  const sorted = allShifts
    .filter((sh) => sh.driverId === session?.driverId)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const grouped = new Map<string, typeof sorted>();
  for (const s of sorted) {
    const key = new Date(s.startTime).toDateString();
    grouped.set(key, [...(grouped.get(key) ?? []), s]);
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold tracking-tight">My schedule</h1>
      {sorted.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
          <CalendarClock className="h-8 w-8" />
          <p className="text-sm">No shifts scheduled.</p>
        </div>
      )}
      <div className="space-y-4">
        {Array.from(grouped.entries()).map(([day, dayShifts]) => (
          <div key={day}>
            <p className="mb-2 text-sm font-semibold text-muted-foreground">{formatDate(dayShifts[0].startTime)}</p>
            <div className="space-y-2">
              {dayShifts.map((s) => (
                <Card key={s.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <p className="font-medium">
                      {formatTime(s.startTime)} – {formatTime(s.endTime)}
                    </p>
                    <Badge variant={statusVariant[s.status]}>{s.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
