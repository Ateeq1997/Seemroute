"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VehicleFormDialog, type EditableVehicle } from "@/components/admin/vehicle-form-dialog";
import { useAppStore } from "@/store/app-store";
import { toast } from "@/components/ui/toaster";
import { formatDate } from "@/lib/utils";
import { Gauge, Pencil, Plus, Trash2, Users, Wrench } from "lucide-react";

const statusVariant: Record<string, "success" | "warning" | "destructive"> = {
  ACTIVE: "success",
  MAINTENANCE: "warning",
  OUT_OF_SERVICE: "destructive",
};

export function VehiclesGrid({ vehicles }: { vehicles: (EditableVehicle & { driverNames: string[] })[] }) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<EditableVehicle | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(v: EditableVehicle) {
    setEditing(v);
    setDialogOpen(true);
  }
  const deleteVehicle = useAppStore((s) => s.deleteVehicle);

  function handleDelete(id: string) {
    if (!confirm("Remove this vehicle from the fleet?")) return;
    deleteVehicle(id);
    toast({ title: "Vehicle removed" });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" /> Add vehicle
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((v) => (
          <Card key={v.id}>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">
                    {v.make} {v.model}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {v.year} · {v.plate}
                  </p>
                </div>
                <Badge variant={statusVariant[v.status]}>{v.status.replace(/_/g, " ")}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> {v.capacity} seats
                </div>
                <div className="flex items-center gap-1.5">
                  <Gauge className="h-3.5 w-3.5" /> {v.odometer.toLocaleString()} mi
                </div>
              </div>
              {v.nextServiceDue && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Wrench className="h-3.5 w-3.5" /> Next service {formatDate(v.nextServiceDue)}
                </div>
              )}
              {v.driverNames.length > 0 && (
                <p className="text-xs text-muted-foreground">Driver: {v.driverNames.join(", ")}</p>
              )}
              {v.notes && <p className="rounded-md bg-muted/50 p-2 text-xs">{v.notes}</p>}
              <div className="flex justify-end gap-1 pt-1">
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openEdit(v)}>
                  <Pencil className="mr-1 h-3 w-3" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-destructive hover:text-destructive"
                  onClick={() => handleDelete(v.id)}
                >
                  <Trash2 className="mr-1 h-3 w-3" /> Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <VehicleFormDialog open={dialogOpen} onOpenChange={setDialogOpen} vehicle={editing} />
    </div>
  );
}
