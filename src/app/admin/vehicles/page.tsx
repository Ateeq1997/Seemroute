"use client";

import { useAppStore } from "@/store/app-store";
import { VehiclesGrid } from "@/components/admin/vehicles-grid";

export default function VehiclesPage() {
  const vehicles = useAppStore((s) => s.vehicles);
  const drivers = useAppStore((s) => s.drivers);
  const users = useAppStore((s) => s.users);

  const sorted = [...vehicles].sort((a, b) => a.plate.localeCompare(b.plate));

  const rows = sorted.map((v) => ({
    ...v,
    driverNames: drivers
      .filter((d) => d.assignedVehicleId === v.id)
      .map((d) => users.find((u) => u.id === d.userId)?.name)
      .filter((n): n is string => !!n),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Vehicles</h1>
        <p className="text-sm text-muted-foreground">Fleet roster, capacity, and maintenance status.</p>
      </div>
      <VehiclesGrid vehicles={rows} />
    </div>
  );
}
