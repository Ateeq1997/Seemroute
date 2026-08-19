"use client";

import { useAppStore } from "@/store/app-store";
import { DispatchBoard, type DispatchTrip } from "@/components/admin/dispatch-board";

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

export default function DispatchPage() {
  const trips = useAppStore((s) => s.trips);
  const drivers = useAppStore((s) => s.drivers);
  const vehicles = useAppStore((s) => s.vehicles);
  const users = useAppStore((s) => s.users);
  const clients = useAppStore((s) => s.clients);

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const todaysTrips = trips
    .filter((t) => new Date(t.scheduledPickup) >= todayStart && new Date(t.scheduledPickup) <= todayEnd)
    .sort((a, b) => a.scheduledPickup.localeCompare(b.scheduledPickup));

  const activeDrivers = drivers.filter((d) => d.status === "ACTIVE");
  const activeVehicles = vehicles.filter((v) => v.status === "ACTIVE");

  const dispatchTrips: DispatchTrip[] = todaysTrips.map((t) => {
    const driver = t.driverId ? drivers.find((d) => d.id === t.driverId) : null;
    const driverUser = driver ? users.find((u) => u.id === driver.userId) : null;
    const vehicle = t.vehicleId ? vehicles.find((v) => v.id === t.vehicleId) : null;
    const client = t.clientId ? clients.find((c) => c.id === t.clientId) : null;
    return {
      id: t.id,
      passengerName: t.passengerName,
      pickupAddress: t.pickupAddress,
      dropoffAddress: t.dropoffAddress,
      scheduledPickup: t.scheduledPickup,
      status: t.status,
      wheelchairAccess: t.wheelchairAccess,
      driver: driver && driverUser ? { id: driver.id, name: driverUser.name } : null,
      vehicle: vehicle ? { id: vehicle.id, label: `${vehicle.make} ${vehicle.model} (${vehicle.plate})` } : null,
      clientName: client?.name ?? null,
    };
  });

  const driverOptions = activeDrivers.map((d) => ({
    id: d.id,
    name: users.find((u) => u.id === d.userId)?.name ?? "Unknown",
    vehicleId: d.assignedVehicleId,
  }));
  const vehicleOptions = activeVehicles.map((v) => ({ id: v.id, label: `${v.make} ${v.model} (${v.plate})` }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dispatch board</h1>
        <p className="text-sm text-muted-foreground">Live view of today&apos;s trips across the pipeline.</p>
      </div>
      <DispatchBoard trips={dispatchTrips} drivers={driverOptions} vehicles={vehicleOptions} />
    </div>
  );
}
