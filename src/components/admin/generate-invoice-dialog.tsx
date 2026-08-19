"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/store/app-store";
import { toast } from "@/components/ui/toaster";
import { formatCurrency, formatDate } from "@/lib/utils";

export type UninvoicedClient = {
  id: string;
  name: string;
  trips: { id: string; passengerName: string; scheduledPickup: string; fare: number }[];
};

export function GenerateInvoiceDialog({
  open,
  onOpenChange,
  clients,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: UninvoicedClient[];
}) {
  const [clientId, setClientId] = React.useState<string>("");
  const [selectedTripIds, setSelectedTripIds] = React.useState<string[]>([]);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setClientId("");
      setSelectedTripIds([]);
    }
  }, [open]);

  const client = clients.find((c) => c.id === clientId);
  const selectedTrips = client?.trips.filter((t) => selectedTripIds.includes(t.id)) ?? [];
  const subtotal = selectedTrips.reduce((s, t) => s + t.fare, 0);

  function toggleTrip(id: string) {
    setSelectedTripIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const generateInvoice = useAppStore((s) => s.generateInvoice);

  function handleGenerate() {
    if (!clientId || selectedTripIds.length === 0) return;
    setPending(true);
    generateInvoice(clientId, selectedTripIds, 30);
    toast({ title: "Invoice generated", variant: "success" });
    setPending(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Generate invoice</DialogTitle>
          <DialogDescription>Bill completed trips for a client or account.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Client / account</Label>
            <Select value={clientId} onValueChange={(v) => { setClientId(v); setSelectedTripIds([]); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id} disabled={c.trips.length === 0}>
                    {c.name} {c.trips.length === 0 ? "(no unbilled trips)" : `(${c.trips.length} unbilled)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {client && (
            <div className="space-y-2">
              <Label>Completed trips to bill</Label>
              <div className="max-h-56 space-y-1 overflow-y-auto rounded-md border border-border p-2">
                {client.trips.length === 0 && (
                  <p className="p-2 text-sm text-muted-foreground">No unbilled completed trips for this client.</p>
                )}
                {client.trips.map((t) => (
                  <label key={t.id} className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50">
                    <span className="flex items-center gap-2">
                      <Checkbox checked={selectedTripIds.includes(t.id)} onCheckedChange={() => toggleTrip(t.id)} />
                      <span>
                        {t.passengerName} <span className="text-xs text-muted-foreground">· {formatDate(t.scheduledPickup)}</span>
                      </span>
                    </span>
                    <span className="tabular-nums">{formatCurrency(t.fare)}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-sm font-medium">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={!clientId || selectedTripIds.length === 0 || pending}>
            {pending ? "Generating..." : "Generate invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
