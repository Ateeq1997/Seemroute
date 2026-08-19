"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GeneratePayrollDialog } from "@/components/admin/generate-payroll-dialog";
import { useAppStore } from "@/store/app-store";
import { toast } from "@/components/ui/toaster";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ChevronDown, ChevronRight, CheckCircle2, Plus, Trash2 } from "lucide-react";

export type PayrollRunRow = {
  id: string;
  periodStart: string;
  periodEnd: string;
  status: "PENDING" | "PROCESSED";
  processedDate: string | null;
  totalAmount: number;
  entries: { id: string; driverName: string; tripsCount: number; hoursWorked: number; hourlyRate: number; grossPay: number }[];
};

export function PayrollRunsList({ runs }: { runs: PayrollRunRow[] }) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [expanded, setExpanded] = React.useState<string | null>(runs[0]?.id ?? null);

  const processPayrollRun = useAppStore((s) => s.processPayrollRun);
  const deletePayrollRun = useAppStore((s) => s.deletePayrollRun);

  function process(id: string) {
    processPayrollRun(id);
    toast({ title: "Payroll run processed", variant: "success" });
  }
  function remove(id: string) {
    if (!confirm("Delete this payroll run?")) return;
    deletePayrollRun(id);
    toast({ title: "Payroll run deleted" });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Generate payroll run
        </Button>
      </div>

      {runs.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No payroll runs yet. Generate one from a date range.
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {runs.map((run) => (
          <Card key={run.id}>
            <CardContent className="p-0">
              <button
                className="flex w-full items-center justify-between gap-3 p-4 text-left"
                onClick={() => setExpanded(expanded === run.id ? null : run.id)}
              >
                <div className="flex items-center gap-3">
                  {expanded === run.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <div>
                    <p className="font-medium">
                      {formatDate(run.periodStart)} – {formatDate(run.periodEnd)}
                    </p>
                    <p className="text-xs text-muted-foreground">{run.entries.length} drivers</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold tabular-nums">{formatCurrency(run.totalAmount)}</span>
                  <Badge variant={run.status === "PROCESSED" ? "success" : "warning"}>{run.status}</Badge>
                </div>
              </button>
              {expanded === run.id && (
                <div className="border-t border-border px-4 pb-4 pt-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Driver</TableHead>
                        <TableHead className="text-right">Trips</TableHead>
                        <TableHead className="text-right">Hours</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                        <TableHead className="text-right">Gross pay</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {run.entries.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell className="text-sm">{e.driverName}</TableCell>
                          <TableCell className="text-right tabular-nums text-sm">{e.tripsCount}</TableCell>
                          <TableCell className="text-right tabular-nums text-sm">{e.hoursWorked.toFixed(1)}</TableCell>
                          <TableCell className="text-right tabular-nums text-sm">{formatCurrency(e.hourlyRate)}</TableCell>
                          <TableCell className="text-right tabular-nums text-sm font-medium">{formatCurrency(e.grossPay)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-3 flex justify-end gap-2">
                    {run.status === "PENDING" && (
                      <Button size="sm" onClick={() => process(run.id)}>
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Mark processed
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => remove(run.id)}>
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <GeneratePayrollDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
