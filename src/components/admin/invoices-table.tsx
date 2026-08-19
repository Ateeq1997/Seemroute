"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GenerateInvoiceDialog, type UninvoicedClient } from "@/components/admin/generate-invoice-dialog";
import { useAppStore } from "@/store/app-store";
import { toast } from "@/components/ui/toaster";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Send, CheckCircle2, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import type { InvoiceStatus } from "@/lib/types";

export type InvoiceRow = {
  id: string;
  invoiceNo: string;
  clientName: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  total: number;
  lineItems: { id: string; description: string; amount: number }[];
};

const statusVariant: Record<InvoiceStatus, "secondary" | "default" | "success"> = {
  DRAFT: "secondary",
  SENT: "default",
  PAID: "success",
};

export function InvoicesTable({ invoices, clients }: { invoices: InvoiceRow[]; clients: UninvoicedClient[] }) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const setInvoiceStatus = useAppStore((s) => s.setInvoiceStatus);
  const deleteInvoice = useAppStore((s) => s.deleteInvoice);

  function markSent(id: string) {
    setInvoiceStatus(id, "SENT");
    toast({ title: "Invoice marked sent" });
  }
  function markPaid(id: string) {
    setInvoiceStatus(id, "PAID");
    toast({ title: "Invoice marked paid", variant: "success" });
  }
  function remove(id: string) {
    if (!confirm("Delete this invoice?")) return;
    deleteInvoice(id);
    toast({ title: "Invoice deleted" });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Generate invoice
        </Button>
      </div>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Invoice</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-36" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                  No invoices yet. Generate one from completed trips.
                </TableCell>
              </TableRow>
            )}
            {invoices.map((inv) => (
              <React.Fragment key={inv.id}>
                <TableRow className="cursor-pointer" onClick={() => setExpanded(expanded === inv.id ? null : inv.id)}>
                  <TableCell>
                    {expanded === inv.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </TableCell>
                  <TableCell className="font-medium">{inv.invoiceNo}</TableCell>
                  <TableCell className="text-sm">{inv.clientName}</TableCell>
                  <TableCell className="text-sm">{formatDate(inv.issueDate)}</TableCell>
                  <TableCell className="text-sm">{formatDate(inv.dueDate)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[inv.status]}>{inv.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(inv.total)}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      {inv.status === "DRAFT" && (
                        <Button size="icon" variant="ghost" className="h-8 w-8" title="Mark sent" onClick={() => markSent(inv.id)}>
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {inv.status !== "PAID" && (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-success" title="Mark paid" onClick={() => markPaid(inv.id)}>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => remove(inv.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {expanded === inv.id && (
                  <TableRow>
                    <TableCell />
                    <TableCell colSpan={7} className="bg-muted/30">
                      <div className="space-y-1 py-2">
                        {inv.lineItems.map((li) => (
                          <div key={li.id} className="flex justify-between text-xs text-muted-foreground">
                            <span>{li.description}</span>
                            <span className="tabular-nums">{formatCurrency(li.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
      <GenerateInvoiceDialog open={dialogOpen} onOpenChange={setDialogOpen} clients={clients} />
    </div>
  );
}
