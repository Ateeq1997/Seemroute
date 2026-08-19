"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { initials } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

export function AdminTopbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter();
  const session = useAppStore((s) => s.session);
  const user = useAppStore((s) => s.users.find((u) => u.id === session?.userId));
  const logout = useAppStore((s) => s.logout);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full outline-none">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials(user?.name ?? "?")}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="font-medium">{user?.name}</div>
              <div className="text-xs font-normal text-muted-foreground">{user?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
