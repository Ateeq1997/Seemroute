"use client";

import { useAppStore } from "@/store/app-store";
import { TodayTripsClient } from "@/components/driver/today-trips-client";

export default function DriverTodayPage() {
  const session = useAppStore((s) => s.session);

  if (!session?.driverId) return null;

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold tracking-tight">My trips</h1>
      <TodayTripsClient driverId={session.driverId} />
    </div>
  );
}
