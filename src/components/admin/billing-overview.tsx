"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatTile } from "@/components/admin/stat-tile";
import { RecordBillingDialog } from "@/components/admin/record-billing-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ChevronDown, ChevronRight, Plus, Wallet, AlertCircle, Building2 } from "lucide-react";

export type BillingClient = {
  id: string;
  name: string;
  accountType: string;
  balance: number;
  records: { id: string; type: string; amount: number; description: string | null; recordDate: string }[];
};

const typeVariant: Record<string, "default" | "success" | "secondary"> = {
  CHARGE: "default",
  PAYMENT: "success",
  ADJUSTMENT: "secondary",
};

export function BillingOverview({ clients }: { clients: BillingClient[] }) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const totalOutstanding = clients.reduce((sum, c) => sum + Math.max(0, c.balance), 0);
  const clientsWithBalance = clients.filter((c) => c.balance > 0).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Total outstanding" value={formatCurrency(totalOutstanding)} icon={Wallet} accent="warning" />
        <StatTile label="Accounts with balance" value={String(clientsWithBalance)} icon={AlertCircle} accent="destructive" />
        <StatTile label="Total accounts" value={String(clients.length)} icon={Building2} accent="primary" />
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Record billing entry
        </Button>
      </div>

      <div className="space-y-3">
        {clients.map((c) => (
          <Card key={c.id}>
            <CardContent className="p-0">
              <button
                className="flex w-full items-center justify-between gap-3 p-4 text-left"
                onClick={() => setExpanded(expanded === c.id ? null : c.id)}
              >
                <div className="flex items-center gap-3">
                  {expanded === c.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.accountType.replace(/_/g, " ")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-semibold tabular-nums ${c.balance > 0 ? "text-warning" : "text-muted-foreground"}`}>
                    {formatCurrency(c.balance)}
                  </span>
                  {c.balance > 0 ? <Badge variant="warning">Outstanding</Badge> : <Badge variant="secondary">Current</Badge>}
                </div>
              </button>
              {expanded === c.id && (
                <div className="space-y-1 border-t border-border px-4 pb-4 pt-3">
                  {c.records.length === 0 && <p className="text-sm text-muted-foreground">No billing history.</p>}
                  {c.records.map((r) => (
                    <div key={r.id} className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Badge variant={typeVariant[r.type] ?? "secondary"} className="text-[10px]">
                          {r.type}
                        </Badge>
                        <span className="text-muted-foreground">{r.description ?? "—"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{formatDate(r.recordDate)}</span>
                        <span className={`tabular-nums font-medium ${r.amount > 0 ? "text-foreground" : "text-success"}`}>
                          {r.amount > 0 ? "+" : ""}
                          {formatCurrency(r.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <RecordBillingDialog open={dialogOpen} onOpenChange={setDialogOpen} clients={clients.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
