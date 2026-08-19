"use client";

import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import { StatTile } from "@/components/admin/stat-tile";
import { TripsPerDayChart, TripStatusChart } from "@/components/admin/dashboard-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatTime } from "@/lib/utils";
import { CalendarClock, CarFront, Route, Users2, Wallet } from "lucide-react";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

const statusColor: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  REQUESTED: "secondary",
  ASSIGNED: "default",
  EN_ROUTE: "warning",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

export default function DashboardPage() {
  const trips = useAppStore((s) => s.trips);
  const vehicles = useAppStore((s) => s.vehicles);
  const shifts = useAppStore((s) => s.shifts);
  const payrollRuns = useAppStore((s) => s.payrollRuns);
  const drivers = useAppStore((s) => s.drivers);
  const clients = useAppStore((s) => s.clients);

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const todaysTrips = trips
    .filter((t) => new Date(t.scheduledPickup) >= todayStart && new Date(t.scheduledPickup) <= todayEnd)
    .sort((a, b) => a.scheduledPickup.localeCompare(b.scheduledPickup));

  const activeVehicles = vehicles.filter((v) => v.status === "ACTIVE").length;
  const driversOnShift = shifts.filter((s) => s.status === "ACTIVE").length;

  const revenueThisWeek = trips
    .filter((t) => t.status === "COMPLETED" && new Date(t.scheduledPickup) >= weekAgo)
    .reduce((sum, t) => sum + t.fare, 0);

  const upcomingPayroll = payrollRuns
    .filter((r) => r.status === "PENDING")
    .sort((a, b) => a.periodEnd.localeCompare(b.periodEnd))[0];

  const days: { day: string; trips: number; revenue: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push({ day: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(d), trips: 0, revenue: 0 });
  }
  const sevenDaysAgo = startOfDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));
  for (const t of trips) {
    const pickup = new Date(t.scheduledPickup);
    if (pickup < sevenDaysAgo) continue;
    const diffDays = Math.floor((startOfDay(now).getTime() - startOfDay(pickup).getTime()) / 86400000);
    const idx = 6 - diffDays;
    if (idx >= 0 && idx < 7) {
      days[idx].trips += 1;
      days[idx].revenue += t.fare;
    }
  }

  const monthTrips = trips.filter((t) => new Date(t.scheduledPickup) >= thirtyDaysAgo);
  const statusCounts = monthTrips.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1;
    return acc;
  }, {});
  const statusChartData = Object.entries(statusCounts).map(([name, value]) => ({ name: name.replace("_", " "), value }));

  function driverName(id: string | null) {
    if (!id) return null;
    const driver = drivers.find((d) => d.id === id);
    return driver ? useAppStore.getState().users.find((u) => u.id === driver.userId)?.name ?? null : null;
  }
  function clientName(id: string | null) {
    return id ? clients.find((c) => c.id === id)?.name ?? null : null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(now)}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatTile label="Today's trips" value={String(todaysTrips.length)} icon={Route} hint={`${todaysTrips.filter((t) => t.status === "COMPLETED").length} completed`} />
        <StatTile label="Active vehicles" value={`${activeVehicles}/${vehicles.length}`} icon={CarFront} accent="success" />
        <StatTile label="Drivers on shift" value={String(driversOnShift)} icon={Users2} accent="primary" />
        <StatTile label="Revenue this week" value={formatCurrency(revenueThisWeek)} icon={Wallet} accent="success" />
        <StatTile
          label="Upcoming payroll"
          value={upcomingPayroll ? formatCurrency(upcomingPayroll.totalAmount) : "—"}
          hint={upcomingPayroll ? `Due ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(upcomingPayroll.periodEnd))}` : "None pending"}
          icon={CalendarClock}
          accent="warning"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TripsPerDayChart data={days} />
        </div>
        <TripStatusChart data={statusChartData.length ? statusChartData : [{ name: "No data", value: 1 }]} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Today&apos;s schedule</CardTitle>
          <Link href="/admin/dispatch" className="text-sm text-primary hover:underline">
            View dispatch board →
          </Link>
        </CardHeader>
        <CardContent className="space-y-1">
          {todaysTrips.length === 0 && <p className="text-sm text-muted-foreground">No trips scheduled today.</p>}
          {todaysTrips.slice(0, 6).map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="w-14 shrink-0 text-sm font-medium tabular-nums">{formatTime(t.scheduledPickup)}</div>
                <div>
                  <p className="text-sm font-medium">{t.passengerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {clientName(t.clientId) ?? "Private"} · {driverName(t.driverId) ?? "Unassigned"}
                  </p>
                </div>
              </div>
              <Badge variant={statusColor[t.status]}>{t.status.replace("_", " ")}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
