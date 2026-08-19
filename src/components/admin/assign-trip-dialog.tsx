"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/store/app-store";
import { toast } from "@/components/ui/toaster";

type DriverOption = { id: string; name: string; vehicleId?: string | null };
type VehicleOption = { id: string; label: string };

export function AssignTripDialog({
  open,
  onOpenChange,
  tripId,
  passengerName,
  drivers,
  vehicles,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string | null;
  passengerName?: string;
  drivers: DriverOption[];
  vehicles: VehicleOption[];
}) {
  const [driverId, setDriverId] = React.useState<string>("");
  const [vehicleId, setVehicleId] = React.useState<string>("");
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setDriverId("");
      setVehicleId("");
    }
  }, [open]);

  React.useEffect(() => {
    const driver = drivers.find((d) => d.id === driverId);
    if (driver?.vehicleId) setVehicleId(driver.vehicleId);
  }, [driverId, drivers]);

  const assignTrip = useAppStore((s) => s.assignTrip);

  function handleAssign() {
    if (!tripId || !driverId || !vehicleId) return;
    setPending(true);
    assignTrip(tripId, driverId, vehicleId);
    toast({ title: "Trip assigned", description: "Driver and vehicle have been assigned.", variant: "success" });
    setPending(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign trip</DialogTitle>
          <DialogDescription>{passengerName ? `Passenger: ${passengerName}` : "Choose a driver and vehicle."}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Driver</Label>
            <Select value={driverId} onValueChange={setDriverId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a driver" />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Vehicle</Label>
            <Select value={vehicleId} onValueChange={setVehicleId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!driverId || !vehicleId || pending}>
            {pending ? "Assigning..." : "Assign trip"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
