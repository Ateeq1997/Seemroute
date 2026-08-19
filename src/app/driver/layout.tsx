"use client";

import { AuthGuard } from "@/components/auth-guard";
import { DriverShell } from "@/components/driver/driver-shell";

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard role="DRIVER">
      <DriverShell>{children}</DriverShell>
    </AuthGuard>
  );
}
