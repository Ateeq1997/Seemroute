"use client";

import * as React from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DriverFormDialog, type EditableDriver } from "@/components/admin/driver-form-dialog";
import { useAppStore } from "@/store/app-store";
import { toast } from "@/components/ui/toaster";
import { initials } from "@/lib/utils";
import { Pencil, Plus, Trash2 } from "lucide-react";

const statusVariant: Record<string, "success" | "warning" | "secondary"> = {
  ACTIVE: "success",
  ON_LEAVE: "warning",
  INACTIVE: "secondary",
};

export function DriversTable({
  drivers,
  vehicles,
}: {
  drivers: (EditableDriver & { vehicleLabel: string | null; tripCount: number })[];
  vehicles: { id: string; label: string }[];
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<EditableDriver | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(d: EditableDriver) {
    setEditing(d);
    setDialogOpen(true);
  }
  const deleteDriver = useAppStore((s) => s.deleteDriver);

  function handleDelete(d: EditableDriver) {
    if (!confirm(`Remove ${d.name} from the roster?`)) return;
    const result = deleteDriver(d.id, d.userId);
    if (result.ok) {
      toast({ title: "Driver removed" });
    } else {
      toast({ title: "Cannot remove driver", description: result.error, variant: "destructive" });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" /> Add driver
        </Button>
      </div>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Driver</TableHead>
              <TableHead>License</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Trips</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.map((d) => (
              <TableRow key={d.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-xs text-primary">{initials(d.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Link href={`/admin/drivers/${d.id}`} className="text-sm font-medium hover:underline">
                        {d.name}
                      </Link>
                      <div className="text-xs text-muted-foreground">{d.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  <div>{d.licenseNumber}</div>
                  <div className="text-xs text-muted-foreground">Exp {d.licenseExpiry.slice(0, 10)}</div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{d.vehicleLabel ?? "Unassigned"}</TableCell>
                <TableCell className="text-sm tabular-nums">${d.hourlyRate.toFixed(2)}/hr</TableCell>
                <TableCell className="text-sm tabular-nums">{d.tripCount}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[d.status] ?? "secondary"}>{d.status.replace("_", " ")}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(d)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(d)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <DriverFormDialog open={dialogOpen} onOpenChange={setDialogOpen} driver={editing} vehicles={vehicles} />
    </div>
  );
}
