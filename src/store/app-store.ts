import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import { generateSeedData, nextId, type SeedDatabase } from "@/lib/seed-data";
import type {
  Trip,
  TripStatus,
  Vehicle,
  Driver,
  DriverStatus,
  Invoice,
  InvoiceStatus,
  PayrollStatus,
  BillingType,
  User,
} from "@/lib/types";

// Wraps localStorage so a blocked/unavailable storage API (private browsing,
// strict browser settings, quota errors) can never leave the app stuck on
// the loading screen — reads/writes just silently no-op instead of throwing.
const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      // ignore — data simply won't persist this session
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      // ignore
    }
  },
};

export type Session = { userId: string; role: "ADMIN" | "DRIVER"; driverId: string | null } | null;

type AppState = SeedDatabase & {
  session: Session;
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;

  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;

  createTrip: (input: Omit<Trip, "id">) => void;
  updateTrip: (id: string, input: Omit<Trip, "id">) => void;
  deleteTrip: (id: string) => void;
  assignTrip: (tripId: string, driverId: string, vehicleId: string) => void;
  unassignTrip: (tripId: string) => void;
  setTripStatus: (tripId: string, status: TripStatus) => void;

  createVehicle: (input: Omit<Vehicle, "id">) => void;
  updateVehicle: (id: string, input: Omit<Vehicle, "id">) => void;
  deleteVehicle: (id: string) => void;

  createDriver: (input: { name: string; email: string; phone: string; licenseNumber: string; licenseExpiry: string; hourlyRate: number; status: DriverStatus; assignedVehicleId: string | null }) => void;
  updateDriver: (driverId: string, userId: string, input: { name: string; email: string; phone: string; licenseNumber: string; licenseExpiry: string; hourlyRate: number; status: DriverStatus; assignedVehicleId: string | null }) => void;
  deleteDriver: (driverId: string, userId: string) => { ok: boolean; error?: string };

  generateInvoice: (clientId: string, tripIds: string[], dueInDays: number) => void;
  setInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  deleteInvoice: (id: string) => void;

  generatePayrollRun: (periodStart: string, periodEnd: string) => void;
  processPayrollRun: (id: string) => void;
  deletePayrollRun: (id: string) => void;

  recordBillingEntry: (clientId: string, type: BillingType, amount: number, description: string) => void;
};

function emptySeed(): SeedDatabase {
  return {
    users: [],
    vehicles: [],
    drivers: [],
    shifts: [],
    clients: [],
    trips: [],
    invoices: [],
    invoiceLineItems: [],
    billingRecords: [],
    payrollRuns: [],
    payrollEntries: [],
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...(typeof window === "undefined" ? emptySeed() : generateSeedData()),
      session: null,
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),

      login: (email, password) => {
        const user = get().users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
        if (!user || user.password !== password) {
          return { ok: false, error: "Invalid email or password." };
        }
        const driver = get().drivers.find((d) => d.userId === user.id);
        set({ session: { userId: user.id, role: user.role, driverId: driver?.id ?? null } });
        return { ok: true };
      },
      logout: () => set({ session: null }),

      createTrip: (input) => set((s) => ({ trips: [{ ...input, id: nextId("trip") }, ...s.trips] })),
      updateTrip: (id, input) =>
        set((s) => ({ trips: s.trips.map((t) => (t.id === id ? { ...input, id } : t)) })),
      deleteTrip: (id) => set((s) => ({ trips: s.trips.filter((t) => t.id !== id) })),
      assignTrip: (tripId, driverId, vehicleId) =>
        set((s) => ({
          trips: s.trips.map((t) => (t.id === tripId ? { ...t, driverId, vehicleId, status: "ASSIGNED" as TripStatus } : t)),
        })),
      unassignTrip: (tripId) =>
        set((s) => ({
          trips: s.trips.map((t) => (t.id === tripId ? { ...t, driverId: null, vehicleId: null, status: "REQUESTED" as TripStatus } : t)),
        })),
      setTripStatus: (tripId, status) =>
        set((s) => ({
          trips: s.trips.map((t) => {
            if (t.id !== tripId) return t;
            const now = new Date().toISOString();
            return {
              ...t,
              status,
              actualPickup: status === "EN_ROUTE" ? now : t.actualPickup,
              actualDropoff: status === "COMPLETED" ? now : t.actualDropoff,
            };
          }),
        })),

      createVehicle: (input) => set((s) => ({ vehicles: [{ ...input, id: nextId("veh") }, ...s.vehicles] })),
      updateVehicle: (id, input) =>
        set((s) => ({ vehicles: s.vehicles.map((v) => (v.id === id ? { ...input, id } : v)) })),
      deleteVehicle: (id) =>
        set((s) => ({
          vehicles: s.vehicles.filter((v) => v.id !== id),
          drivers: s.drivers.map((d) => (d.assignedVehicleId === id ? { ...d, assignedVehicleId: null } : d)),
          trips: s.trips.map((t) => (t.vehicleId === id ? { ...t, vehicleId: null } : t)),
        })),

      createDriver: (input) =>
        set((s) => {
          const user: User = { id: nextId("user"), email: input.email, password: "password123", name: input.name, role: "DRIVER" };
          const driver: Driver = {
            id: nextId("drv"),
            userId: user.id,
            phone: input.phone,
            licenseNumber: input.licenseNumber,
            licenseExpiry: input.licenseExpiry,
            hourlyRate: input.hourlyRate,
            status: input.status,
            assignedVehicleId: input.assignedVehicleId,
            hireDate: new Date().toISOString(),
          };
          return { users: [...s.users, user], drivers: [...s.drivers, driver] };
        }),
      updateDriver: (driverId, userId, input) =>
        set((s) => ({
          users: s.users.map((u) => (u.id === userId ? { ...u, name: input.name, email: input.email } : u)),
          drivers: s.drivers.map((d) =>
            d.id === driverId
              ? {
                  ...d,
                  phone: input.phone,
                  licenseNumber: input.licenseNumber,
                  licenseExpiry: input.licenseExpiry,
                  hourlyRate: input.hourlyRate,
                  status: input.status,
                  assignedVehicleId: input.assignedVehicleId,
                }
              : d
          ),
        })),
      deleteDriver: (driverId, userId) => {
        const hasPayroll = get().payrollEntries.some((e) => e.driverId === driverId);
        if (hasPayroll) {
          return { ok: false, error: "This driver has payroll history and cannot be removed." };
        }
        set((s) => ({
          drivers: s.drivers.filter((d) => d.id !== driverId),
          users: s.users.filter((u) => u.id !== userId),
          trips: s.trips.map((t) => (t.driverId === driverId ? { ...t, driverId: null } : t)),
        }));
        return { ok: true };
      },

      generateInvoice: (clientId, tripIds, dueInDays) =>
        set((s) => {
          const trips = s.trips.filter((t) => tripIds.includes(t.id));
          const subtotal = trips.reduce((sum, t) => sum + t.fare, 0);
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + dueInDays);
          const invoiceId = nextId("inv");
          const invoiceNo = `INV-${1001 + s.invoices.length}`;
          const invoice: Invoice = {
            id: invoiceId,
            invoiceNo,
            clientId,
            status: "DRAFT",
            issueDate: new Date().toISOString(),
            dueDate: dueDate.toISOString(),
            paidDate: null,
            subtotal,
            tax: 0,
            total: subtotal,
            notes: null,
          };
          const lineItems = trips.map((t) => ({
            id: nextId("li"),
            invoiceId,
            tripId: t.id,
            description: `Transport — ${t.passengerName} (${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(t.scheduledPickup))})`,
            quantity: 1,
            unitPrice: t.fare,
            amount: t.fare,
          }));
          return {
            invoices: [invoice, ...s.invoices],
            invoiceLineItems: [...s.invoiceLineItems, ...lineItems],
            billingRecords: [
              {
                id: nextId("bill"),
                clientId,
                invoiceId,
                type: "CHARGE" as BillingType,
                amount: subtotal,
                balance: subtotal,
                description: `Invoice ${invoiceNo} issued`,
                recordDate: new Date().toISOString(),
              },
              ...s.billingRecords,
            ],
          };
        }),
      setInvoiceStatus: (invId, status) =>
        set((s) => {
          const invoice = s.invoices.find((i) => i.id === invId);
          if (!invoice) return {};
          const updatedInvoices = s.invoices.map((i) =>
            i.id === invId ? { ...i, status, paidDate: status === "PAID" ? new Date().toISOString() : i.paidDate } : i
          );
          if (status !== "PAID") return { invoices: updatedInvoices };
          return {
            invoices: updatedInvoices,
            billingRecords: [
              {
                id: nextId("bill"),
                clientId: invoice.clientId,
                invoiceId: invId,
                type: "PAYMENT" as BillingType,
                amount: -invoice.total,
                balance: 0,
                description: `Payment received for ${invoice.invoiceNo}`,
                recordDate: new Date().toISOString(),
              },
              ...s.billingRecords,
            ],
          };
        }),
      deleteInvoice: (invId) =>
        set((s) => ({
          invoices: s.invoices.filter((i) => i.id !== invId),
          invoiceLineItems: s.invoiceLineItems.filter((li) => li.invoiceId !== invId),
          billingRecords: s.billingRecords.filter((b) => b.invoiceId !== invId),
        })),

      generatePayrollRun: (periodStart, periodEnd) =>
        set((s) => {
          const start = new Date(periodStart);
          const end = new Date(periodEnd);
          const runId = nextId("pr");
          const entries = [];
          let total = 0;
          for (const driver of s.drivers.filter((d) => d.status === "ACTIVE")) {
            const tripsCount = s.trips.filter(
              (t) => t.driverId === driver.id && t.status === "COMPLETED" && new Date(t.scheduledPickup) >= start && new Date(t.scheduledPickup) <= end
            ).length;
            const hoursWorked = s.shifts
              .filter(
                (sh) =>
                  sh.driverId === driver.id &&
                  (sh.status === "COMPLETED" || sh.status === "ACTIVE") &&
                  new Date(sh.startTime) >= start &&
                  new Date(sh.startTime) <= end
              )
              .reduce((sum, sh) => sum + (new Date(sh.endTime).getTime() - new Date(sh.startTime).getTime()) / 3_600_000, 0);
            if (tripsCount === 0 && hoursWorked === 0) continue;
            const grossPay = Math.round(hoursWorked * driver.hourlyRate * 100) / 100;
            total += grossPay;
            entries.push({
              id: nextId("pe"),
              payrollRunId: runId,
              driverId: driver.id,
              tripsCount,
              hoursWorked: Math.round(hoursWorked * 100) / 100,
              hourlyRate: driver.hourlyRate,
              grossPay,
            });
          }
          return {
            payrollRuns: [
              { id: runId, periodStart, periodEnd, status: "PENDING" as PayrollStatus, processedDate: null, totalAmount: total },
              ...s.payrollRuns,
            ],
            payrollEntries: [...s.payrollEntries, ...entries],
          };
        }),
      processPayrollRun: (runId) =>
        set((s) => ({
          payrollRuns: s.payrollRuns.map((r) => (r.id === runId ? { ...r, status: "PROCESSED", processedDate: new Date().toISOString() } : r)),
        })),
      deletePayrollRun: (runId) =>
        set((s) => ({
          payrollRuns: s.payrollRuns.filter((r) => r.id !== runId),
          payrollEntries: s.payrollEntries.filter((e) => e.payrollRunId !== runId),
        })),

      recordBillingEntry: (clientId, type, amount, description) =>
        set((s) => {
          const signedAmount = type === "CHARGE" ? Math.abs(amount) : -Math.abs(amount);
          const currentBalance = s.billingRecords.filter((r) => r.clientId === clientId).reduce((sum, r) => sum + r.amount, 0);
          return {
            billingRecords: [
              {
                id: nextId("bill"),
                clientId,
                invoiceId: null,
                type,
                amount: signedAmount,
                balance: currentBalance + signedAmount,
                description: description || null,
                recordDate: new Date().toISOString(),
              },
              ...s.billingRecords,
            ],
          };
        }),
    }),
    {
      name: "seemroute-data",
      storage: createJSONStorage(() => safeStorage),
      onRehydrateStorage: () => () => {
        // Always flip this — even if rehydration errored or found nothing —
        // so the UI never gets stuck waiting on a hydration that failed silently.
        useAppStore.setState({ hasHydrated: true });
      },
    }
  )
);
