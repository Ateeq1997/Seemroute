"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/store/app-store";
import { toast } from "@/components/ui/toaster";
import type { Vehicle } from "@/lib/types";

export type EditableVehicle = Vehicle;

type VehicleInput = Omit<Vehicle, "id" | "vin" | "notes"> & {
  vin: string;
  notes: string;
};

const emptyForm = (): VehicleInput => ({
  make: "",
  model: "",
  year: new Date().getFullYear(),
  plate: "",
  capacity: 4,
  status: "ACTIVE",
  vin: "",
  odometer: 0,
  lastServiceDate: null,
  nextServiceDue: null,
  notes: "",
});

export function VehicleFormDialog({
  open,
  onOpenChange,
  vehicle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: EditableVehicle | null;
}) {
  const [form, setForm] = React.useState<VehicleInput>(emptyForm());
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setForm(
        vehicle
          ? {
              make: vehicle.make,
              model: vehicle.model,
              year: vehicle.year,
              plate: vehicle.plate,
              capacity: vehicle.capacity,
              status: vehicle.status,
              vin: vehicle.vin ?? "",
              odometer: vehicle.odometer,
              lastServiceDate: vehicle.lastServiceDate?.slice(0, 10) ?? null,
              nextServiceDue: vehicle.nextServiceDue?.slice(0, 10) ?? null,
              notes: vehicle.notes ?? "",
            }
          : emptyForm()
      );
    }
  }, [open, vehicle]);

  function set<K extends keyof VehicleInput>(key: K, value: VehicleInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const createVehicle = useAppStore((s) => s.createVehicle);
  const updateVehicle = useAppStore((s) => s.updateVehicle);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const payload = { ...form, vin: form.vin || null, notes: form.notes || null };
    if (vehicle) {
      updateVehicle(vehicle.id, payload);
      toast({ title: "Vehicle updated", variant: "success" });
    } else {
      createVehicle(payload);
      toast({ title: "Vehicle added", variant: "success" });
    }
    setPending(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{vehicle ? "Edit vehicle" : "Add vehicle"}</DialogTitle>
          <DialogDescription>Fleet details and maintenance status.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Make</Label>
              <Input value={form.make} onChange={(e) => set("make", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Model</Label>
              <Input value={form.model} onChange={(e) => set("model", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Input type="number" value={form.year} onChange={(e) => set("year", parseInt(e.target.value) || 0)} required />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Plate</Label>
              <Input value={form.plate} onChange={(e) => set("plate", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Capacity</Label>
              <Input
                type="number"
                value={form.capacity}
                onChange={(e) => set("capacity", parseInt(e.target.value) || 0)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v as VehicleInput["status"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="OUT_OF_SERVICE">Out of service</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>VIN</Label>
              <Input value={form.vin} onChange={(e) => set("vin", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Odometer (mi)</Label>
              <Input type="number" value={form.odometer} onChange={(e) => set("odometer", parseInt(e.target.value) || 0)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Last service date</Label>
              <Input
                type="date"
                value={form.lastServiceDate ?? ""}
                onChange={(e) => set("lastServiceDate", e.target.value || null)}
              />
            </div>
            <div className="space-y-2">
              <Label>Next service due</Label>
              <Input
                type="date"
                value={form.nextServiceDue ?? ""}
                onChange={(e) => set("nextServiceDue", e.target.value || null)}
              />
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
              {pending ? "Saving..." : vehicle ? "Save changes" : "Add vehicle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
