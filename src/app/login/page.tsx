"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Bus } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const login = useAppStore((s) => s.login);
  const session = useAppStore((s) => s.session);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (session) {
      router.replace(session.role === "ADMIN" ? "/admin" : "/driver");
    }
  }, [session, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = login(email, password);
    if (!result.ok) {
      setError(result.error ?? "Invalid email or password.");
      setPending(false);
      return;
    }
    const updated = useAppStore.getState().session;
    router.replace(updated?.role === "ADMIN" ? "/admin" : "/driver");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Bus className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">Seemroute</CardTitle>
          <CardDescription>Passenger transport management</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@seemroute.com"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <div className="mt-5 rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
            <p className="mb-1 font-medium text-foreground">Demo accounts</p>
            <p>Admin: admin@seemroute.com / password123</p>
            <p>Driver: marcus@seemroute.com / password123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
