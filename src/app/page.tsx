"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";

export default function Home() {
  const router = useRouter();
  const session = useAppStore((s) => s.session);

  React.useEffect(() => {
    router.replace(session ? (session.role === "ADMIN" ? "/admin" : "/driver") : "/login");
  }, [session, router]);

  return null;
}
