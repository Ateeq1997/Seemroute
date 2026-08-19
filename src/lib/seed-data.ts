import type {
  User,
  Vehicle,
  Driver,
  Shift,
  Client,
  Trip,
  Invoice,
  InvoiceLineItem,
  BillingRecord,
  PayrollRun,
  PayrollEntry,
} from "./types";

let seq = 0;
function id(prefix: string) {
  seq += 1;
  return `${prefix}_${Date.now().toString(36)}${seq.toString(36)}`;
}

function daysAgo(n: number, hour = 9, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}
function daysFromNow(n: number, hour = 9, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}
function shortDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(iso));
}

export type SeedDatabase = {
  users: User[];
  vehicles: Vehicle[];
  drivers: Driver[];
  shifts: Shift[];
  clients: Client[];
  trips: Trip[];
  invoices: Invoice[];
  invoiceLineItems: InvoiceLineItem[];
  billingRecords: BillingRecord[];
  payrollRuns: PayrollRun[];
  payrollEntries: PayrollEntry[];
};

export const DEMO_PASSWORD = "password123";

export function generateSeedData(): SeedDatabase {
  const users: User[] = [];
  const vehicles: Vehicle[] = [];
  const drivers: Driver[] = [];
  const shifts: Shift[] = [];
  const clients: Client[] = [];
  const trips: Trip[] = [];
  const invoices: Invoice[] = [];
  const invoiceLineItems: InvoiceLineItem[] = [];
  const billingRecords: BillingRecord[] = [];
  const payrollRuns: PayrollRun[] = [];
  const payrollEntries: PayrollEntry[] = [];

  // ------------------------------------------------------------------
  // Users
  // ------------------------------------------------------------------
  const admin: User = {
    id: id("user"),
    email: "admin@seemroute.com",
    password: DEMO_PASSWORD,
    name: "Alex Morgan",
    role: "ADMIN",
  };
  users.push(admin);

  // ------------------------------------------------------------------
  // Vehicles
  // ------------------------------------------------------------------
  const vehicleSeed: Omit<Vehicle, "id">[] = [
    { make: "Ford", model: "Transit", year: 2022, plate: "NEMT-101", capacity: 4, status: "ACTIVE", vin: "1FTBW3XM4NKA00101", odometer: 38210, lastServiceDate: daysAgo(40), nextServiceDue: daysFromNow(50), notes: null },
    { make: "Dodge", model: "Grand Caravan", year: 2021, plate: "NEMT-102", capacity: 5, status: "ACTIVE", vin: "2C4RDGCG4MR500102", odometer: 52890, lastServiceDate: daysAgo(20), nextServiceDue: daysFromNow(70), notes: null },
    { make: "Toyota", model: "Sienna (Wheelchair)", year: 2023, plate: "NEMT-103", capacity: 3, status: "ACTIVE", vin: "5TDYZ3DC7PS000103", odometer: 15420, lastServiceDate: daysAgo(10), nextServiceDue: daysFromNow(80), notes: null },
    { make: "Ford", model: "Transit", year: 2020, plate: "NEMT-104", capacity: 4, status: "MAINTENANCE", vin: "1FTBW3XM4LKA00104", odometer: 71340, lastServiceDate: daysAgo(2), nextServiceDue: daysFromNow(1), notes: "In shop for brake replacement, back in service tomorrow." },
    { make: "Chevrolet", model: "Express", year: 2019, plate: "NEMT-105", capacity: 6, status: "ACTIVE", vin: "1GAZGPFG4K1000105", odometer: 88760, lastServiceDate: daysAgo(55), nextServiceDue: daysFromNow(35), notes: null },
    { make: "Honda", model: "Odyssey", year: 2022, plate: "NEMT-106", capacity: 5, status: "OUT_OF_SERVICE", vin: "5FNRL6H80NB000106", odometer: 44210, lastServiceDate: daysAgo(90), nextServiceDue: null, notes: "Awaiting transmission diagnostics." },
  ];
  for (const v of vehicleSeed) vehicles.push({ ...v, id: id("veh") });

  // ------------------------------------------------------------------
  // Drivers
  // ------------------------------------------------------------------
  const driverSeed = [
    { name: "Marcus Reed", email: "marcus@seemroute.com", license: "DL-88213", phone: "555-0101", rate: 24 },
    { name: "Priya Nair", email: "priya@seemroute.com", license: "DL-73921", phone: "555-0102", rate: 22 },
    { name: "Diego Alvarez", email: "diego@seemroute.com", license: "DL-56104", phone: "555-0103", rate: 23 },
    { name: "Hannah Kim", email: "hannah@seemroute.com", license: "DL-34982", phone: "555-0104", rate: 25 },
    { name: "Tyrell Jackson", email: "tyrell@seemroute.com", license: "DL-91027", phone: "555-0105", rate: 21 },
    { name: "Sofia Rossi", email: "sofia@seemroute.com", license: "DL-20948", phone: "555-0106", rate: 24 },
  ];
  driverSeed.forEach((d, i) => {
    const user: User = { id: id("user"), email: d.email, password: DEMO_PASSWORD, name: d.name, role: "DRIVER" };
    users.push(user);
    drivers.push({
      id: id("drv"),
      userId: user.id,
      licenseNumber: d.license,
      licenseExpiry: daysFromNow(365 + i * 30),
      phone: d.phone,
      hireDate: daysAgo(180 + i * 40),
      hourlyRate: d.rate,
      status: "ACTIVE",
      assignedVehicleId: vehicles[i % vehicles.length].id,
    });
  });

  // ------------------------------------------------------------------
  // Shifts
  // ------------------------------------------------------------------
  drivers.forEach((driver, di) => {
    for (let day = -7; day <= 3; day++) {
      if ((day + di) % 3 === 0) continue;
      const status: Shift["status"] = day < 0 ? "COMPLETED" : day === 0 ? "ACTIVE" : "SCHEDULED";
      shifts.push({
        id: id("shift"),
        driverId: driver.id,
        startTime: daysAgo(-day, 7, 0),
        endTime: daysAgo(-day, 15, 0),
        status,
        notes: null,
      });
    }
  });

  // ------------------------------------------------------------------
  // Clients
  // ------------------------------------------------------------------
  const clientSeed: { name: string; phone: string; email: string | null; type: Client["accountType"] }[] = [
    { name: "Riverside Senior Living", phone: "555-0201", email: "billing@riversideseniors.org", type: "FACILITY" },
    { name: "Metro Dialysis Center", phone: "555-0202", email: "ap@metrodialysis.com", type: "FACILITY" },
    { name: "Eleanor Whitfield", phone: "555-0203", email: null, type: "PRIVATE_PAY" },
    { name: "James Okafor", phone: "555-0204", email: "j.okafor@mail.com", type: "PRIVATE_PAY" },
    { name: "Sunrise Medicaid Transport Program", phone: "555-0205", email: "claims@sunrisemedicaid.gov", type: "MEDICAID" },
    { name: "BlueCross Regional Insurance", phone: "555-0206", email: "claims@bcregional.com", type: "INSURANCE" },
    { name: "Grace Community Rehab", phone: "555-0207", email: "intake@gracerehab.org", type: "FACILITY" },
    { name: "Dorothy Simmons", phone: "555-0208", email: null, type: "PRIVATE_PAY" },
  ];
  for (const c of clientSeed) {
    clients.push({ id: id("cli"), name: c.name, contactPhone: c.phone, contactEmail: c.email, accountType: c.type, billingNotes: null });
  }

  const passengerNames = ["Ruth Bennett", "Harold Kim", "Maria Gonzalez", "Walter Chen", "Betty Osei", "Frank Delgado", "Alice Novak", "Samuel Boateng", "Nancy Alvarez", "George Patel"];
  const addresses = ["412 Maple St", "88 Riverside Dr", "1200 Oak Ave", "56 Elm Ct", "990 Birchwood Ln", "215 Sunset Blvd", "77 Willow Way", "340 Cedar Park", "8 Hilltop Rd", "601 Lakeview Ter"];
  const dialysisCenter = "Metro Dialysis Center, 500 Health Pkwy";
  const clinic = "Riverside Medical Clinic, 220 Care St";
  const hospital = "St. Agnes Hospital, 1 Hospital Dr";

  // ------------------------------------------------------------------
  // Trips
  // ------------------------------------------------------------------
  let idx = 0;
  for (let day = -10; day <= -1; day++) {
    const tripsToday = 3 + (Math.abs(day) % 3);
    for (let t = 0; t < tripsToday; t++) {
      const driver = drivers[idx % drivers.length];
      const vehicle = vehicles[idx % vehicles.length];
      const client = clients[idx % clients.length];
      const pax = passengerNames[idx % passengerNames.length];
      const pickup = addresses[idx % addresses.length];
      const dropoff = [dialysisCenter, clinic, hospital][idx % 3];
      const scheduled = daysAgo(-day, 8 + ((t * 2) % 8), 0);
      const cancelled = idx % 11 === 0;
      const fare = 32 + ((idx * 7) % 40);

      trips.push({
        id: id("trip"),
        clientId: client.id,
        passengerName: pax,
        passengerPhone: "555-01" + (10 + (idx % 80)),
        pickupAddress: pickup,
        dropoffAddress: dropoff,
        scheduledPickup: scheduled,
        actualPickup: cancelled ? null : scheduled,
        actualDropoff: cancelled ? null : new Date(new Date(scheduled).getTime() + 35 * 60000).toISOString(),
        status: cancelled ? "CANCELLED" : "COMPLETED",
        driverId: cancelled ? null : driver.id,
        vehicleId: cancelled ? null : vehicle.id,
        mileage: cancelled ? null : 4 + ((idx * 3) % 18),
        fare: cancelled ? 0 : fare,
        wheelchairAccess: idx % 5 === 0,
        notes: cancelled ? "Passenger cancelled — rescheduled by facility." : null,
      });
      idx++;
    }
  }

  const todaySlots: { status: Trip["status"]; hour: number }[] = [
    { status: "COMPLETED", hour: 7 },
    { status: "COMPLETED", hour: 8 },
    { status: "EN_ROUTE", hour: 10 },
    { status: "ASSIGNED", hour: 12 },
    { status: "ASSIGNED", hour: 13 },
    { status: "REQUESTED", hour: 15 },
    { status: "REQUESTED", hour: 16 },
    { status: "REQUESTED", hour: 17 },
  ];
  todaySlots.forEach((slot, i) => {
    const driver = slot.status === "REQUESTED" ? null : drivers[i % drivers.length];
    const vehicle = slot.status === "REQUESTED" ? null : vehicles[i % vehicles.length];
    const client = clients[i % clients.length];
    const scheduled = daysAgo(0, slot.hour, 0);
    trips.push({
      id: id("trip"),
      clientId: client.id,
      passengerName: passengerNames[(i + 3) % passengerNames.length],
      passengerPhone: "555-02" + (10 + i),
      pickupAddress: addresses[(i + 2) % addresses.length],
      dropoffAddress: [dialysisCenter, clinic, hospital][i % 3],
      scheduledPickup: scheduled,
      actualPickup: slot.status === "COMPLETED" || slot.status === "EN_ROUTE" ? scheduled : null,
      actualDropoff: slot.status === "COMPLETED" ? new Date(new Date(scheduled).getTime() + 30 * 60000).toISOString() : null,
      status: slot.status,
      driverId: driver?.id ?? null,
      vehicleId: vehicle?.id ?? null,
      mileage: slot.status === "COMPLETED" ? 6 + i : null,
      fare: slot.status === "COMPLETED" ? 38 + i * 2 : 0,
      wheelchairAccess: i % 4 === 0,
      notes: null,
    });
  });

  for (let day = 1; day <= 5; day++) {
    const tripsToday = 2 + (day % 3);
    for (let t = 0; t < tripsToday; t++) {
      const assign = (day + t) % 2 === 0;
      const driver = assign ? drivers[(day + t) % drivers.length] : null;
      const vehicle = assign ? vehicles[(day + t) % vehicles.length] : null;
      const client = clients[(day + t) % clients.length];
      trips.push({
        id: id("trip"),
        clientId: client.id,
        passengerName: passengerNames[(day + t + 5) % passengerNames.length],
        passengerPhone: "555-03" + (10 + day + t),
        pickupAddress: addresses[(day + t + 4) % addresses.length],
        dropoffAddress: [dialysisCenter, clinic, hospital][(day + t) % 3],
        scheduledPickup: daysFromNow(day, 8 + t * 2, 0),
        actualPickup: null,
        actualDropoff: null,
        status: assign ? "ASSIGNED" : "REQUESTED",
        driverId: driver?.id ?? null,
        vehicleId: vehicle?.id ?? null,
        mileage: null,
        fare: 0,
        wheelchairAccess: (day + t) % 5 === 0,
        notes: null,
      });
    }
  }

  // ------------------------------------------------------------------
  // Invoices from completed trips
  // ------------------------------------------------------------------
  const completedTrips = trips.filter((t) => t.status === "COMPLETED");
  const byClient = new Map<string, Trip[]>();
  for (const trip of completedTrips) {
    if (!trip.clientId) continue;
    const arr = byClient.get(trip.clientId) ?? [];
    arr.push(trip);
    byClient.set(trip.clientId, arr);
  }

  let invoiceCounter = 1001;
  const invoiceStatuses: Invoice["status"][] = ["PAID", "SENT", "DRAFT"];
  let clientIdx = 0;
  for (const [clientId, clientTrips] of Array.from(byClient.entries())) {
    const chunks = [clientTrips.slice(0, Math.ceil(clientTrips.length / 2)), clientTrips.slice(Math.ceil(clientTrips.length / 2))].filter(
      (c) => c.length > 0
    );
    for (const chunk of chunks) {
      const subtotal = chunk.reduce((sum, t) => sum + t.fare, 0);
      const status = invoiceStatuses[clientIdx % invoiceStatuses.length];
      const issueDate = daysAgo(6);
      const invoiceId = id("inv");
      invoices.push({
        id: invoiceId,
        invoiceNo: `INV-${invoiceCounter++}`,
        clientId,
        status,
        issueDate,
        dueDate: daysFromNow(24),
        paidDate: status === "PAID" ? daysAgo(1) : null,
        subtotal,
        tax: 0,
        total: subtotal,
        notes: null,
      });
      for (const t of chunk) {
        invoiceLineItems.push({
          id: id("li"),
          invoiceId,
          tripId: t.id,
          description: `Transport — ${t.passengerName} (${shortDate(t.scheduledPickup)})`,
          quantity: 1,
          unitPrice: t.fare,
          amount: t.fare,
        });
      }

      billingRecords.push({
        id: id("bill"),
        clientId,
        invoiceId,
        type: "CHARGE",
        amount: subtotal,
        balance: status === "PAID" ? 0 : subtotal,
        description: `Invoice ${invoiceCounter - 1} issued`,
        recordDate: issueDate,
      });
      if (status === "PAID") {
        billingRecords.push({
          id: id("bill"),
          clientId,
          invoiceId,
          type: "PAYMENT",
          amount: -subtotal,
          balance: 0,
          description: `Payment received`,
          recordDate: daysAgo(1),
        });
      }
      clientIdx++;
    }
  }

  billingRecords.push({
    id: id("bill"),
    clientId: clients[0].id,
    invoiceId: null,
    type: "ADJUSTMENT",
    amount: -15,
    balance: 0,
    description: "Goodwill credit — late arrival",
    recordDate: daysAgo(3),
  });

  // ------------------------------------------------------------------
  // Payroll
  // ------------------------------------------------------------------
  const processedRunId = id("pr");
  let processedTotal = 0;
  const processedEntries: PayrollEntry[] = drivers.map((driver, i) => {
    const tripsCount = 8 + (i % 5);
    const hoursWorked = 32 + (i % 6) * 2;
    const grossPay = Math.round(hoursWorked * driver.hourlyRate * 100) / 100;
    processedTotal += grossPay;
    return { id: id("pe"), payrollRunId: processedRunId, driverId: driver.id, tripsCount, hoursWorked, hourlyRate: driver.hourlyRate, grossPay };
  });
  payrollRuns.push({
    id: processedRunId,
    periodStart: daysAgo(14),
    periodEnd: daysAgo(8),
    status: "PROCESSED",
    processedDate: daysAgo(7),
    totalAmount: processedTotal,
  });
  payrollEntries.push(...processedEntries);

  const pendingRunId = id("pr");
  let pendingTotal = 0;
  const pendingEntries: PayrollEntry[] = drivers.map((driver, i) => {
    const tripsCount = 4 + (i % 4);
    const hoursWorked = 16 + (i % 5) * 2;
    const grossPay = Math.round(hoursWorked * driver.hourlyRate * 100) / 100;
    pendingTotal += grossPay;
    return { id: id("pe"), payrollRunId: pendingRunId, driverId: driver.id, tripsCount, hoursWorked, hourlyRate: driver.hourlyRate, grossPay };
  });
  payrollRuns.push({
    id: pendingRunId,
    periodStart: daysAgo(7),
    periodEnd: daysFromNow(0),
    status: "PENDING",
    processedDate: null,
    totalAmount: pendingTotal,
  });
  payrollEntries.push(...pendingEntries);

  return { users, vehicles, drivers, shifts, clients, trips, invoices, invoiceLineItems, billingRecords, payrollRuns, payrollEntries };
}

export function nextId(prefix: string) {
  return id(prefix);
}
