"use client";

import { create } from "zustand";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "success" | "destructive";

type Toast = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ToastStore = {
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (t) =>
    set((s) => {
      const id = Math.random().toString(36).slice(2);
      setTimeout(() => {
        useToastStore.getState().dismiss(id);
      }, 4000);
      return { toasts: [...s.toasts, { ...t, id }] };
    }),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function toast(t: { title: string; description?: string; variant?: ToastVariant }) {
  useToastStore.getState().push({ variant: "default", ...t });
}

const icons: Record<ToastVariant, React.ElementType> = {
  default: Info,
  success: CheckCircle2,
  destructive: AlertCircle,
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => {
        const Icon = icons[t.variant];
        return (
          <div
            key={t.id}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-4 shadow-lg animate-in slide-in-from-bottom-2 fade-in",
              t.variant === "destructive" && "border-destructive/50 bg-destructive text-destructive-foreground",
              t.variant === "success" && "border-success/50 bg-success text-success-foreground",
              t.variant === "default" && "border-border bg-card text-card-foreground"
            )}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1 text-sm">
              <div className="font-medium">{t.title}</div>
              {t.description && <div className="opacity-90">{t.description}</div>}
            </div>
            <button onClick={() => dismiss(t.id)} className="opacity-70 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
