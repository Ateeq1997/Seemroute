"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/app-store";
import { toast } from "@/components/ui/toaster";

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function GeneratePayrollDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const [start, setStart] = React.useState(isoDate(weekAgo));
  const [end, setEnd] = React.useState(isoDate(today));
  const [pending, setPending] = React.useState(false);

  const generatePayrollRun = useAppStore((s) => s.generatePayrollRun);

  function handleGenerate() {
    setPending(true);
    generatePayrollRun(start, end);
    toast({ title: "Payroll run generated", variant: "success" });
    setPending(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate payroll run</DialogTitle>
          <DialogDescription>Calculates pay from completed trips and worked shifts in the period.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Period start</Label>
            <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Period end</Label>
            <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={pending}>
            {pending ? "Generating..." : "Generate run"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
