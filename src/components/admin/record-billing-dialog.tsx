"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/store/app-store";
import { toast } from "@/components/ui/toaster";

export function RecordBillingDialog({
  open,
  onOpenChange,
  clients,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: { id: string; name: string }[];
}) {
  const [clientId, setClientId] = React.useState("");
  const [type, setType] = React.useState<"PAYMENT" | "ADJUSTMENT" | "CHARGE">("PAYMENT");
  const [amount, setAmount] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setClientId("");
      setType("PAYMENT");
      setAmount("");
      setDescription("");
    }
  }, [open]);

  const recordBillingEntry = useAppStore((s) => s.recordBillingEntry);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId || !amount) return;
    setPending(true);
    recordBillingEntry(clientId, type, parseFloat(amount), description);
    toast({ title: "Billing entry recorded", variant: "success" });
    setPending(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record billing entry</DialogTitle>
          <DialogDescription>Add a manual payment, adjustment, or charge to a client&apos;s ledger.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Client / account</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAYMENT">Payment (reduces balance)</SelectItem>
                  <SelectItem value="ADJUSTMENT">Credit adjustment</SelectItem>
                  <SelectItem value="CHARGE">Manual charge</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount ($)</Label>
              <Input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional note" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!clientId || !amount || pending}>
              {pending ? "Saving..." : "Record entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
