"use client";

import { useAppStore } from "@/store/app-store";
import { InvoicesTable } from "@/components/admin/invoices-table";

export default function InvoicingPage() {
  const invoices = useAppStore((s) => s.invoices);
  const invoiceLineItems = useAppStore((s) => s.invoiceLineItems);
  const clients = useAppStore((s) => s.clients);
  const trips = useAppStore((s) => s.trips);

  const sorted = [...invoices].sort((a, b) => b.issueDate.localeCompare(a.issueDate));

  const invoiceRows = sorted.map((inv) => ({
    id: inv.id,
    invoiceNo: inv.invoiceNo,
    clientName: clients.find((c) => c.id === inv.clientId)?.name ?? "Unknown",
    status: inv.status,
    issueDate: inv.issueDate,
    dueDate: inv.dueDate,
    total: inv.total,
    lineItems: invoiceLineItems
      .filter((li) => li.invoiceId === inv.id)
      .map((li) => ({ id: li.id, description: li.description, amount: li.amount })),
  }));

  const invoicedTripIds = new Set(invoiceLineItems.map((li) => li.tripId).filter(Boolean));

  const clientRows = clients.map((c) => ({
    id: c.id,
    name: c.name,
    trips: trips
      .filter((t) => t.clientId === c.id && t.status === "COMPLETED" && !invoicedTripIds.has(t.id))
      .sort((a, b) => b.scheduledPickup.localeCompare(a.scheduledPickup))
      .map((t) => ({ id: t.id, passengerName: t.passengerName, scheduledPickup: t.scheduledPickup, fare: t.fare })),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Invoicing</h1>
        <p className="text-sm text-muted-foreground">Generate and track invoices from completed trips.</p>
      </div>
      <InvoicesTable invoices={invoiceRows} clients={clientRows} />
    </div>
  );
}
