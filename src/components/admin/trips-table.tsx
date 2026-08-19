"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TripFormDialog, type EditableTrip, type TripFormOption } from "@/components/admin/trip-form-dialog";
import { useAppStore } from "@/store/app-store";
import { toast } from "@/components/ui/toaster";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Pencil, Plus, Trash2 } from "lucide-react";

const statusColor: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  REQUESTED: "secondary",
  ASSIGNED: "default",
  EN_ROUTE: "warning",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

export function TripsTable({
  trips,
  clients,
  drivers,
  vehicles,
}: {
  trips: (EditableTrip & { driverName: string | null; vehicleLabel: string | null; clientName: string | null })[];
  clients: TripFormOption[];
  drivers: TripFormOption[];
  vehicles: TripFormOption[];
}) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<EditableTrip | null>(null);

  const filtered = trips.filter((t) => {
    const matchesSearch =
      !search ||
      t.passengerName.toLowerCase().includes(search.toLowerCase()) ||
      t.pickupAddress.toLowerCase().includes(search.toLowerCase()) ||
      t.dropoffAddress.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(t: EditableTrip) {
    setEditing(t);
    setDialogOpen(true);
  }
  const deleteTrip = useAppStore((s) => s.deleteTrip);

  function handleDelete(id: string) {
    if (!confirm("Delete this trip? This cannot be undone.")) return;
    deleteTrip(id);
    toast({ title: "Trip deleted" });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Search passenger or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-xs"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="REQUESTED">Requested</SelectItem>
              <SelectItem value="ASSIGNED">Assigned</SelectItem>
              <SelectItem value="EN_ROUTE">En route</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" /> New trip
        </Button>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Passenger</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Driver / Vehicle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Fare</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                  No trips match your filters.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <div className="font-medium">{t.passengerName}</div>
                  <div className="text-xs text-muted-foreground">{t.clientName ?? "Private"}</div>
                </TableCell>
                <TableCell className="max-w-[220px]">
                  <div className="truncate text-xs text-muted-foreground">
                    {t.pickupAddress} → {t.dropoffAddress}
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">{formatDateTime(t.scheduledPickup)}</TableCell>
                <TableCell className="text-sm">
                  {t.driverName ? (
                    <>
                      <div>{t.driverName}</div>
                      <div className="text-xs text-muted-foreground">{t.vehicleLabel}</div>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={statusColor[t.status]}>{t.status.replace("_", " ")}</Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(t.fare)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(t)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(t.id)}
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

      <TripFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        trip={editing}
        clients={clients}
        drivers={drivers}
        vehicles={vehicles}
      />
    </div>
  );
}
