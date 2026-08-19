import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  accent?: "primary" | "success" | "warning" | "destructive";
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            accent === "success" && "bg-success/10 text-success",
            accent === "warning" && "bg-warning/10 text-warning",
            accent === "destructive" && "bg-destructive/10 text-destructive",
            (!accent || accent === "primary") && "bg-primary/10 text-primary"
          )}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>
      </CardContent>
    </Card>
  );
}
