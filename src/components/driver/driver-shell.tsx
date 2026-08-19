"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bus, CalendarClock, ListChecks, LogOut, WifiOff } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useOnlineStatus } from "@/lib/use-online-status";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/driver", label: "Today", icon: ListChecks },
  { href: "/driver/schedule", label: "Schedule", icon: CalendarClock },
];

export function DriverShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isOnline = useOnlineStatus();

  const session = useAppStore((s) => s.session);
  const user = useAppStore((s) => s.users.find((u) => u.id === session?.userId));
  const driver = useAppStore((s) => s.drivers.find((d) => d.id === session?.driverId));
  const vehicle = useAppStore((s) => s.vehicles.find((v) => v.id === driver?.assignedVehicleId));
  const logout = useAppStore((s) => s.logout);

  const vehicleLabel = vehicle ? `${vehicle.make} ${vehicle.model} · ${vehicle.plate}` : null;

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Bus className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">{user?.name}</p>
              {vehicleLabel && <p className="text-[11px] leading-tight text-muted-foreground">{vehicleLabel}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
        {!isOnline && (
          <div className="flex items-center justify-center gap-2 bg-warning/15 px-4 py-2 text-xs font-medium text-warning">
            <WifiOff className="h-3.5 w-3.5" />
            Offline — your data is stored on this device and keeps working
          </div>
        )}
      </header>

      <main className="flex-1 px-4 py-4 pb-20">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-background">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
