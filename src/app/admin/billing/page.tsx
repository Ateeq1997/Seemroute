"use client";

import { useAppStore } from "@/store/app-store";
import { BillingOverview } from "@/components/admin/billing-overview";

export default function BillingPage() {
  const clients = useAppStore((s) => s.clients);
  const billingRecords = useAppStore((s) => s.billingRecords);

  const rows = clients.map((c) => {
    const records = billingRecords
      .filter((r) => r.clientId === c.id)
      .sort((a, b) => b.recordDate.localeCompare(a.recordDate));
    const balance = records.reduce((sum, r) => sum + r.amount, 0);
    return { id: c.id, name: c.name, accountType: c.accountType, balance, records };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground">Client account balances and billing history.</p>
      </div>
      <BillingOverview clients={rows} />
    </div>
  );
}
