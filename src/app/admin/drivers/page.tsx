"use client";

import { useAppStore } from "@/store/app-store";
import { DriversTable } from "@/components/admin/drivers-table";

export default function DriversPage() {
  const drivers = useAppStore((s) => s.drivers);
  const users = useAppStore((s) => s.users);
  const vehicles = useAppStore((s) => s.vehicles);
  const trips = useAppStore((s) => s.trips);

  const sorted = [...drivers].sort((a, b) => {
    const an = users.find((u) => u.id === a.userId)?.name ?? "";
    const bn = users.find((u) => u.id === b.userId)?.name ?? "";
    return an.localeCompare(bn);
  });

  const rows = sorted.map((d) => {
    const user = users.find((u) => u.id === d.userId)!;
    const vehicle = d.assignedVehicleId ? vehicles.find((v) => v.id === d.assignedVehicleId) : null;
    return {
      ...d,
      name: user.name,
      email: user.email,
      vehicleLabel: vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.plate})` : null,
      tripCount: trips.filter((t) => t.driverId === d.id).length,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Drivers</h1>
        <p className="text-sm text-muted-foreground">Driver roster, licensing, and vehicle assignments.</p>
      </div>
      <DriversTable
        drivers={rows}
        vehicles={vehicles.map((v) => ({ id: v.id, label: `${v.make} ${v.model} (${v.plate})` }))}
      />
    </div>
  );
}
