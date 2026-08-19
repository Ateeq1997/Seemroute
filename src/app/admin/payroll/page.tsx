"use client";

import { useAppStore } from "@/store/app-store";
import { PayrollRunsList } from "@/components/admin/payroll-runs-list";

export default function PayrollPage() {
  const payrollRuns = useAppStore((s) => s.payrollRuns);
  const payrollEntries = useAppStore((s) => s.payrollEntries);
  const drivers = useAppStore((s) => s.drivers);
  const users = useAppStore((s) => s.users);

  const sorted = [...payrollRuns].sort((a, b) => b.periodStart.localeCompare(a.periodStart));

  const rows = sorted.map((r) => ({
    ...r,
    entries: payrollEntries
      .filter((e) => e.payrollRunId === r.id)
      .map((e) => {
        const driver = drivers.find((d) => d.id === e.driverId);
        const user = driver ? users.find((u) => u.id === driver.userId) : null;
        return { ...e, driverName: user?.name ?? "Unknown" };
      }),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payroll</h1>
        <p className="text-sm text-muted-foreground">Per-driver pay period summaries based on completed trips and hours.</p>
      </div>
      <PayrollRunsList runs={rows} />
    </div>
  );
}
