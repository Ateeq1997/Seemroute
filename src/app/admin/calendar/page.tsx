"use client";

import { useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { CalendarView } from "@/components/admin/calendar-view";

function startOfWeek(d: Date) {
  const x = new Date(d);
  x.setDate(x.getDate() - x.getDay());
  x.setHours(0, 0, 0, 0);
  return x;
}

export default function CalendarPage() {
  const searchParams = useSearchParams();
  const trips = useAppStore((s) => s.trips);
  const shifts = useAppStore((s) => s.shifts);
  const drivers = useAppStore((s) => s.drivers);
  const users = useAppStore((s) => s.users);

  const view = searchParams.get("view") === "week" ? "week" : "month";
  const anchorDate = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const anchor = new Date(anchorDate + "T00:00:00");

  let rangeStart: Date;
  let rangeEnd: Date;
  if (view === "month") {
    rangeStart = startOfWeek(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
    rangeEnd = new Date(rangeStart);
    rangeEnd.setDate(rangeEnd.getDate() + 42);
  } else {
    rangeStart = startOfWeek(anchor);
    rangeEnd = new Date(rangeStart);
    rangeEnd.setDate(rangeEnd.getDate() + 7);
  }

  const rangeTrips = trips
    .filter((t) => new Date(t.scheduledPickup) >= rangeStart && new Date(t.scheduledPickup) < rangeEnd)
    .sort((a, b) => a.scheduledPickup.localeCompare(b.scheduledPickup));
  const rangeShifts = shifts
    .filter((s) => new Date(s.startTime) >= rangeStart && new Date(s.startTime) < rangeEnd)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  function driverName(id: string | null) {
    if (!id) return null;
    const driver = drivers.find((d) => d.id === id);
    return driver ? users.find((u) => u.id === driver.userId)?.name ?? null : null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
        <p className="text-sm text-muted-foreground">Scheduled trips and driver shifts.</p>
      </div>
      <CalendarView
        view={view}
        anchorDate={anchorDate}
        trips={rangeTrips.map((t) => ({
          id: t.id,
          passengerName: t.passengerName,
          scheduledPickup: t.scheduledPickup,
          status: t.status,
          driverName: driverName(t.driverId),
        }))}
        shifts={rangeShifts.map((s) => ({
          id: s.id,
          driverName: driverName(s.driverId) ?? "Unknown",
          startTime: s.startTime,
          endTime: s.endTime,
          status: s.status,
        }))}
      />
    </div>
  );
}
