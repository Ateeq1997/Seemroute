"use client";

import { useAppStore } from "@/store/app-store";
import { TripsTable } from "@/components/admin/trips-table";

export default function TripsPage() {
  const trips = useAppStore((s) => s.trips);
  const clients = useAppStore((s) => s.clients);
  const drivers = useAppStore((s) => s.drivers);
  const vehicles = useAppStore((s) => s.vehicles);
  const users = useAppStore((s) => s.users);

  const sorted = [...trips].sort((a, b) => b.scheduledPickup.localeCompare(a.scheduledPickup));

  const rows = sorted.map((t) => {
    const driver = t.driverId ? drivers.find((d) => d.id === t.driverId) : null;
    const driverUser = driver ? users.find((u) => u.id === driver.userId) : null;
    const vehicle = t.vehicleId ? vehicles.find((v) => v.id === t.vehicleId) : null;
    const client = t.clientId ? clients.find((c) => c.id === t.clientId) : null;
    return {
      ...t,
      driverName: driverUser?.name ?? null,
      vehicleLabel: vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.plate})` : null,
      clientName: client?.name ?? null,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Trips</h1>
        <p className="text-sm text-muted-foreground">Full trip history — create, edit, and manage every ride.</p>
      </div>
      <TripsTable
        trips={rows}
        clients={clients.map((c) => ({ id: c.id, label: c.name }))}
        drivers={drivers.map((d) => ({ id: d.id, label: users.find((u) => u.id === d.userId)?.name ?? "Unknown" }))}
        vehicles={vehicles.map((v) => ({ id: v.id, label: `${v.make} ${v.model} (${v.plate})` }))}
      />
    </div>
  );
}
