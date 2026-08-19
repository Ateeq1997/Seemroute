"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate, formatDateTime, initials } from "@/lib/utils";
import { ArrowLeft, Mail, Phone } from "lucide-react";

const statusColor: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  REQUESTED: "secondary",
  ASSIGNED: "default",
  EN_ROUTE: "warning",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

export default function DriverDetailPage() {
  const params = useParams<{ id: string }>();
  const driver = useAppStore((s) => s.drivers.find((d) => d.id === params.id));
  const user = useAppStore((s) => s.users.find((u) => u.id === driver?.userId));
  const vehicle = useAppStore((s) => s.vehicles.find((v) => v.id === driver?.assignedVehicleId));
  const allTrips = useAppStore((s) => s.trips);
  const allShifts = useAppStore((s) => s.shifts);
  const allPayrollEntries = useAppStore((s) => s.payrollEntries);
  const payrollRuns = useAppStore((s) => s.payrollRuns);
  const trips = allTrips.filter((t) => t.driverId === params.id);
  const shifts = allShifts.filter((sh) => sh.driverId === params.id);
  const payrollEntries = allPayrollEntries.filter((e) => e.driverId === params.id);

  if (!driver || !user) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">Driver not found.</p>
        <Link href="/admin/drivers" className="text-sm text-primary hover:underline">
          Back to drivers
        </Link>
      </div>
    );
  }

  const sortedTrips = [...trips].sort((a, b) => b.scheduledPickup.localeCompare(a.scheduledPickup)).slice(0, 20);
  const sortedShifts = [...shifts].sort((a, b) => b.startTime.localeCompare(a.startTime)).slice(0, 10);
  const sortedPayroll = [...payrollEntries].slice(0, 5);

  const completedTrips = trips.filter((t) => t.status === "COMPLETED");
  const totalEarnedFromTrips = completedTrips.reduce((sum, t) => sum + t.fare, 0);

  return (
    <div className="space-y-6">
      <Link href="/admin/drivers" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to drivers
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-primary/10 text-lg text-primary">{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{user.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {user.email}</span>
              <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {driver.phone}</span>
            </div>
          </div>
        </div>
        <Badge variant={driver.status === "ACTIVE" ? "success" : "secondary"} className="w-fit">
          {driver.status.replace("_", " ")}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">License</p>
            <p className="mt-1 font-medium">{driver.licenseNumber}</p>
            <p className="text-xs text-muted-foreground">Expires {formatDate(driver.licenseExpiry)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Vehicle</p>
            <p className="mt-1 font-medium">{vehicle ? `${vehicle.make} ${vehicle.model}` : "Unassigned"}</p>
            <p className="text-xs text-muted-foreground">{vehicle?.plate}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Hourly rate</p>
            <p className="mt-1 font-medium">{formatCurrency(driver.hourlyRate)}/hr</p>
            <p className="text-xs text-muted-foreground">Hired {formatDate(driver.hireDate)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Completed trips</p>
            <p className="mt-1 font-medium">{completedTrips.length}</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(totalEarnedFromTrips)} in fares</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent trip history</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Passenger</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Fare</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTrips.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                    No trips yet.
                  </TableCell>
                </TableRow>
              )}
              {sortedTrips.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="text-sm font-medium">{t.passengerName}</TableCell>
                  <TableCell className="text-sm">{formatDateTime(t.scheduledPickup)}</TableCell>
                  <TableCell>
                    <Badge variant={statusColor[t.status]}>{t.status.replace("_", " ")}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(t.fare)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shift schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sortedShifts.length === 0 && <p className="text-sm text-muted-foreground">No shifts scheduled.</p>}
            {sortedShifts.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                <span>{formatDateTime(s.startTime)} – {formatDateTime(s.endTime)}</span>
                <Badge variant="outline">{s.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payroll history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sortedPayroll.length === 0 && <p className="text-sm text-muted-foreground">No payroll entries yet.</p>}
            {sortedPayroll.map((e) => {
              const run = payrollRuns.find((r) => r.id === e.payrollRunId);
              return (
                <div key={e.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                  <span>{run ? `${formatDate(run.periodStart)} – ${formatDate(run.periodEnd)}` : "—"}</span>
                  <span className="font-medium tabular-nums">{formatCurrency(e.grossPay)}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
