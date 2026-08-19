"use client";

import * as React from "react";
import { Bus, X } from "lucide-react";
import { AdminNav } from "./admin-nav";
import { AdminTopbar } from "./admin-topbar";
import { cn } from "@/lib/utils";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-14 items-center gap-2 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bus className="h-4 w-4" />
          </div>
          <span className="font-semibold text-sidebar-foreground">Seemroute</span>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <AdminNav />
        </div>
        <div className="p-4 text-xs text-sidebar-foreground/50">Admin console · v1.0</div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-sidebar">
            <div className="flex h-14 items-center justify-between gap-2 px-5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Bus className="h-4 w-4" />
                </div>
                <span className="font-semibold text-sidebar-foreground">Seemroute</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-sidebar-foreground/70">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-2" onClick={() => setMobileOpen(false)}>
              <AdminNav />
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <AdminTopbar onMenuClick={() => setMobileOpen(true)} />
        <main className={cn("flex-1 p-4 lg:p-6")}>{children}</main>
      </div>
    </div>
  );
}
