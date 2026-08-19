"use client";

import * as React from "react";
import { useAppStore } from "@/store/app-store";
import type { Trip, TripStatus } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatTime, cn } from "@/lib/utils";
import { MapPin, Navigation, CheckCircle2, XCircle, Users } from "lucide-react";

const statusColor: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  ASSIGNED: "default",
  EN_ROUTE: "warning",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export function TodayTripsClient({ driverId }: { driverId: string }) {
  const allTrips = useAppStore((s) => s.trips);
  const clients = useAppStore((s) => s.clients);
  const vehicles = useAppStore((s) => s.vehicles);
  const setTripStatus = useAppStore((s) => s.setTripStatus);

  const trips = allTrips.filter((t) => t.driverId === driverId);
  const sorted = [...trips].sort((a, b) => a.scheduledPickup.localeCompare(b.scheduledPickup));
  const todayTrips = sorted.filter((t) => isToday(t.scheduledPickup) && t.status !== "CANCELLED");
  const upcomingTrips = sorted.filter((t) => !isToday(t.scheduledPickup) && t.status !== "COMPLETED" && t.status !== "CANCELLED");

  function clientName(id: string | null) {
    return id ? clients.find((c) => c.id === id)?.name ?? null : null;
  }
  function vehicleLabel(id: string | null) {
    const v = id ? vehicles.find((v) => v.id === id) : null;
    return v ? `${v.make} ${v.model} (${v.plate})` : null;
  }

  if (trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
        <Users className="h-8 w-8" />
        <p className="text-sm">No trips assigned yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Today</h2>
        {todayTrips.length === 0 && <p className="text-sm text-muted-foreground">No trips scheduled today.</p>}
        {todayTrips.map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            clientName={clientName(trip.clientId)}
            vehicleLabel={vehicleLabel(trip.vehicleId)}
            onUpdate={setTripStatus}
          />
        ))}
      </section>

      {upcomingTrips.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Upcoming</h2>
          {upcomingTrips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              clientName={clientName(trip.clientId)}
              vehicleLabel={vehicleLabel(trip.vehicleId)}
              onUpdate={setTripStatus}
            />
          ))}
        </section>
      )}
    </div>
  );
}

function TripCard({
  trip,
  clientName,
  onUpdate,
}: {
  trip: Trip;
  clientName: string | null;
  vehicleLabel: string | null;
  onUpdate: (tripId: string, status: TripStatus) => void;
}) {
  const [pending, setPending] = React.useState(false);

  function handle(status: TripStatus) {
    setPending(true);
    onUpdate(trip.id, status);
    setPending(false);
  }

  return (
    <Card className={cn(pending && "opacity-60")}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium">{trip.passengerName}</p>
            <p className="text-xs text-muted-foreground">{clientName ?? "Private"}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-sm font-medium tabular-nums">{formatTime(trip.scheduledPickup)}</span>
            <Badge variant={statusColor[trip.status] ?? "secondary"}>{trip.status.replace("_", " ")}</Badge>
          </div>
        </div>

        <div className="space-y-1 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
            <span>{trip.pickupAddress}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
            <span>{trip.dropoffAddress}</span>
          </div>
        </div>

        {trip.wheelchairAccess && (
          <Badge variant="outline" className="text-[10px]">
            Wheelchair access
          </Badge>
        )}

        {(trip.status === "ASSIGNED" || trip.status === "EN_ROUTE") && (
          <div className="flex gap-2 pt-1">
            {trip.status === "ASSIGNED" && (
              <Button size="sm" className="flex-1" disabled={pending} onClick={() => handle("EN_ROUTE")}>
                <Navigation className="mr-1.5 h-4 w-4" /> Start trip
              </Button>
            )}
            {trip.status === "EN_ROUTE" && (
              <Button size="sm" className="flex-1" disabled={pending} onClick={() => handle("COMPLETED")}>
                <CheckCircle2 className="mr-1.5 h-4 w-4" /> Complete
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:text-destructive"
              disabled={pending}
              onClick={() => handle("CANCELLED")}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
