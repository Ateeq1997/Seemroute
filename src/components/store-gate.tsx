"use client";

import * as React from "react";
import { Bus } from "lucide-react";
import { useAppStore } from "@/store/app-store";

export function StoreGate({ children }: { children: React.ReactNode }) {
  const hasHydrated = useAppStore((s) => s.hasHydrated);

  React.useEffect(() => {
    // Safety net: if hydration hasn't reported back for any reason within a
    // couple seconds, stop waiting and render with whatever state we have
    // rather than leaving the user stuck on the loading screen forever.
    const timeout = setTimeout(() => {
      if (!useAppStore.getState().hasHydrated) {
        useAppStore.setState({ hasHydrated: true });
      }
    }, 2000);

    // Keep tabs on the same device in sync: when another tab writes to
    // localStorage (e.g. a driver marks a trip complete), pick it up here.
    function handleStorage(e: StorageEvent) {
      if (e.key === "seemroute-data") {
        useAppStore.persist.rehydrate();
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Bus className="h-6 w-6" />
          </div>
          <p className="text-sm text-muted-foreground">Loading Seemroute…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
