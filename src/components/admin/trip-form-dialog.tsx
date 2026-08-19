"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/store/app-store";
import { toast } from "@/components/ui/toaster";
import type { Trip, TripStatus } from "@/lib/types";

export type TripFormOption = { id: string; label: string };

export type EditableTrip = Trip;

type TripInput = Omit<Trip, "id" | "actualPickup" | "actualDropoff" | "passengerPhone" | "notes"> & {
  passengerPhone: string;
  notes: string;
};

const STATUS_OPTIONS: TripStatus[] = ["REQUESTED", "ASSIGNED", "EN_ROUTE", "COMPLETED", "CANCELLED"];

function toLocalInputValue(iso?: string) {
  const d = iso ? new Date(iso) : new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const emptyForm = (): TripInput => ({
  clientId: null,
  passengerName: "",
  passengerPhone: "",
  pickupAddress: "",
  dropoffAddress: "",
  scheduledPickup: toLocalInputValue(),
  status: "REQUESTED",
  driverId: null,
  vehicleId: null,
  fare: 0,
  mileage: null,
  wheelchairAccess: false,
  notes: "",
});

export function TripFormDialog({
  open,
  onOpenChange,
  trip,
  clients,
  drivers,
  vehicles,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: EditableTrip | null;
  clients: TripFormOption[];
  drivers: TripFormOption[];
  vehicles: TripFormOption[];
}) {
  const [form, setForm] = React.useState<TripInput>(emptyForm());
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setForm(
        trip
          ? {
              clientId: trip.clientId,
              passengerName: trip.passengerName,
              passengerPhone: trip.passengerPhone ?? "",
              pickupAddress: trip.pickupAddress,
              dropoffAddress: trip.dropoffAddress,
              scheduledPickup: toLocalInputValue(trip.scheduledPickup),
              status: trip.status,
              driverId: trip.driverId,
              vehicleId: trip.vehicleId,
              fare: trip.fare,
              mileage: trip.mileage,
              wheelchairAccess: trip.wheelchairAccess,
              notes: trip.notes ?? "",
            }
          : emptyForm()
      );
    }
  }, [open, trip]);

  function set<K extends keyof TripInput>(key: K, value: TripInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const createTrip = useAppStore((s) => s.createTrip);
  const updateTrip = useAppStore((s) => s.updateTrip);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const payload = {
      ...form,
      passengerPhone: form.passengerPhone || null,
      notes: form.notes || null,
      scheduledPickup: new Date(form.scheduledPickup).toISOString(),
      actualPickup: trip?.actualPickup ?? null,
      actualDropoff: trip?.actualDropoff ?? null,
    };
    if (trip) {
      updateTrip(trip.id, payload);
      toast({ title: "Trip updated", variant: "success" });
    } else {
      createTrip(payload);
      toast({ title: "Trip created", variant: "success" });
    }
    setPending(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{trip ? "Edit trip" : "New trip"}</DialogTitle>
          <DialogDescription>Enter passenger, pickup/dropoff, and assignment details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Passenger name</Label>
              <Input value={form.passengerName} onChange={(e) => set("passengerName", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Passenger phone</Label>
              <Input value={form.passengerPhone} onChange={(e) => set("passengerPhone", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pickup address</Label>
              <Input value={form.pickupAddress} onChange={(e) => set("pickupAddress", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Dropoff address</Label>
              <Input value={form.dropoffAddress} onChange={(e) => set("dropoffAddress", e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Scheduled pickup</Label>
              <Input
                type="datetime-local"
                value={form.scheduledPickup}
                onChange={(e) => set("scheduledPickup", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v as TripStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Client / account</Label>
              <Select value={form.clientId ?? "none"} onValueChange={(v) => set("clientId", v === "none" ? null : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Private" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Private / none</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Driver</Label>
              <Select value={form.driverId ?? "none"} onValueChange={(v) => set("driverId", v === "none" ? null : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {drivers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Vehicle</Label>
              <Select value={form.vehicleId ?? "none"} onValueChange={(v) => set("vehicleId", v === "none" ? null : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Fare ($)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.fare}
                onChange={(e) => set("fare", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Mileage</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={form.mileage ?? ""}
                onChange={(e) => set("mileage", e.target.value ? parseFloat(e.target.value) : null)}
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={form.wheelchairAccess} onCheckedChange={(c) => set("wheelchairAccess", !!c)} />
                Wheelchair access
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : trip ? "Save changes" : "Create trip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
