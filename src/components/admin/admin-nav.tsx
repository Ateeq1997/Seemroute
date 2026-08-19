"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Radio,
  Route,
  CalendarDays,
  Truck,
  Users,
  FileText,
  Wallet,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/dispatch", label: "Dispatch", icon: Radio },
  { href: "/admin/trips", label: "Trips", icon: Route },
  { href: "/admin/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/admin/vehicles", label: "Vehicles", icon: Truck },
  { href: "/admin/drivers", label: "Drivers", icon: Users },
  { href: "/admin/invoicing", label: "Invoicing", icon: FileText },
  { href: "/admin/payroll", label: "Payroll", icon: Wallet },
  { href: "/admin/billing", label: "Billing", icon: Receipt },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map((item) => {
        const active = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
