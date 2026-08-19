"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AssignTripDialog } from "@/components/admin/assign-trip-dialog";
import { useAppStore } from "@/store/app-store";
import { toast } from "@/components/ui/toaster";
import { formatTime, cn } from "@/lib/utils";
import { ArrowRight, MapPin, Undo2, User } from "lucide-react";
import type { TripStatus } from "@/lib/types";

export type DispatchTrip = {
  id: string;
  passengerName: string;
  pickupAddress: string;
  dropoffAddress: string;
  scheduledPickup: string;
  status: TripStatus;
  wheelchairAccess: boolean;
  driver: { id: string; name: string } | null;
  vehicle: { id: string; label: string } | null;
  clientName: string | null;
};

const COLUMNS: { key: TripStatus; label: string; nextLabel?: string; next?: TripStatus }[] = [
  { key: "REQUESTED", label: "Requested" },
  { key: "ASSIGNED", label: "Assigned", nextLabel: "Start trip", next: "EN_ROUTE" },
  { key: "EN_ROUTE", label: "En route", nextLabel: "Complete", next: "COMPLETED" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
];

export function DispatchBoard({
  trips,
  drivers,
  vehicles,
}: {
  trips: DispatchTrip[];
  drivers: { id: string; name: string; vehicleId?: string | null }[];
  vehicles: { id: string; label: string }[];
}) {
  const [assignTarget, setAssignTarget] = React.useState<DispatchTrip | null>(null);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const setTripStatus = useAppStore((s) => s.setTripStatus);
  const unassignTrip = useAppStore((s) => s.unassignTrip);

  function advance(trip: DispatchTrip, status: TripStatus) {
    setPendingId(trip.id);
    setTripStatus(trip.id, status);
    toast({ title: `Trip marked ${status.replace("_", " ").toLowerCase()}`, variant: "success" });
    setPendingId(null);
  }

  function cancel(trip: DispatchTrip) {
    setPendingId(trip.id);
    setTripStatus(trip.id, "CANCELLED");
    toast({ title: "Trip cancelled" });
    setPendingId(null);
  }

  function unassign(trip: DispatchTrip) {
    setPendingId(trip.id);
    unassignTrip(trip.id);
    toast({ title: "Trip unassigned" });
    setPendingId(null);
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {COLUMNS.map((col) => {
          const colTrips = trips.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold">{col.label}</h3>
                <Badge variant="outline">{colTrips.length}</Badge>
              </div>
              <div className="flex flex-1 flex-col gap-2 rounded-lg bg-muted/40 p-2 min-h-[120px]">
                {colTrips.length === 0 && (
                  <p className="px-2 py-4 text-center text-xs text-muted-foreground">No trips</p>
                )}
                {colTrips.map((trip) => (
                  <Card key={trip.id} className={cn("shadow-none", pendingId === trip.id && "opacity-60")}>
                    <CardContent className="space-y-2 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-tight">{trip.passengerName}</p>
                        <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                          {formatTime(trip.scheduledPickup)}
                        </span>
                      </div>
                      <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                        <span className="line-clamp-2">
                          {trip.pickupAddress} → {trip.dropoffAddress}
                        </span>
                      </div>
                      {trip.wheelchairAccess && (
                        <Badge variant="outline" className="text-[10px]">
                          Wheelchair access
                        </Badge>
                      )}
                      {trip.driver && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          {trip.driver.name} · {trip.vehicle?.label}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {col.key === "REQUESTED" && (
                          <Button size="sm" className="h-7 text-xs" onClick={() => setAssignTarget(trip)}>
                            Assign
                          </Button>
                        )}
                        {col.next && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            disabled={pendingId === trip.id}
                            onClick={() => advance(trip, col.next!)}
                          >
                            {col.nextLabel} <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        )}
                        {col.key === "ASSIGNED" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            disabled={pendingId === trip.id}
                            onClick={() => unassign(trip)}
                          >
                            <Undo2 className="mr-1 h-3 w-3" /> Unassign
                          </Button>
                        )}
                        {(col.key === "REQUESTED" || col.key === "ASSIGNED") && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-destructive hover:text-destructive"
                            disabled={pendingId === trip.id}
                            onClick={() => cancel(trip)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <AssignTripDialog
        open={!!assignTarget}
        onOpenChange={(o) => !o && setAssignTarget(null)}
        tripId={assignTarget?.id ?? null}
        passengerName={assignTarget?.passengerName}
        drivers={drivers}
        vehicles={vehicles}
      />
    </>
  );
}
