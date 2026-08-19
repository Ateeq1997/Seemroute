"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import type { Role } from "@/lib/types";

export function AuthGuard({ role, children }: { role: Role; children: React.ReactNode }) {
  const session = useAppStore((s) => s.session);
  const router = useRouter();

  React.useEffect(() => {
    if (!session) {
      router.replace("/login");
      return;
    }
    if (session.role !== role) {
      router.replace(session.role === "ADMIN" ? "/admin" : "/driver");
    }
  }, [session, role, router]);

  if (!session || session.role !== role) return null;

  return <>{children}</>;
}
