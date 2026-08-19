"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/store/app-store";
import { toast } from "@/components/ui/toaster";
import type { DriverStatus } from "@/lib/types";

export type EditableDriver = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  hourlyRate: number;
  status: DriverStatus;
  assignedVehicleId: string | null;
};

type DriverInput = {
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  hourlyRate: number;
  status: DriverStatus;
  assignedVehicleId: string | null;
};

const emptyForm = (): DriverInput => ({
  name: "",
  email: "",
  phone: "",
  licenseNumber: "",
  licenseExpiry: "",
  hourlyRate: 20,
  status: "ACTIVE",
  assignedVehicleId: null,
});

export function DriverFormDialog({
  open,
  onOpenChange,
  driver,
  vehicles,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver: EditableDriver | null;
  vehicles: { id: string; label: string }[];
}) {
  const [form, setForm] = React.useState<DriverInput>(emptyForm());
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setForm(
        driver
          ? {
              name: driver.name,
              email: driver.email,
              phone: driver.phone,
              licenseNumber: driver.licenseNumber,
              licenseExpiry: driver.licenseExpiry.slice(0, 10),
              hourlyRate: driver.hourlyRate,
              status: driver.status,
              assignedVehicleId: driver.assignedVehicleId,
            }
          : emptyForm()
      );
    }
  }, [open, driver]);

  function set<K extends keyof DriverInput>(key: K, value: DriverInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const createDriver = useAppStore((s) => s.createDriver);
  const updateDriver = useAppStore((s) => s.updateDriver);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    if (driver) {
      updateDriver(driver.id, driver.userId, form);
      toast({ title: "Driver updated", variant: "success" });
    } else {
      createDriver(form);
      toast({ title: "Driver added", description: "Default password: password123", variant: "success" });
    }
    setPending(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{driver ? "Edit driver" : "Add driver"}</DialogTitle>
          <DialogDescription>Profile, license, and assignment details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Hourly rate ($)</Label>
              <Input
                type="number"
                step="0.5"
                value={form.hourlyRate}
                onChange={(e) => set("hourlyRate", parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>License number</Label>
              <Input value={form.licenseNumber} onChange={(e) => set("licenseNumber", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>License expiry</Label>
              <Input
                type="date"
                value={form.licenseExpiry}
                onChange={(e) => set("licenseExpiry", e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v as DriverStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="ON_LEAVE">On leave</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assigned vehicle</Label>
              <Select
                value={form.assignedVehicleId ?? "none"}
                onValueChange={(v) => set("assignedVehicleId", v === "none" ? null : v)}
              >
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
          {!driver && (
            <p className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
              New driver accounts are created with the default password <span className="font-medium">password123</span>.
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : driver ? "Save changes" : "Add driver"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
