export type Role = "ADMIN" | "DRIVER";

export type TripStatus = "REQUESTED" | "ASSIGNED" | "EN_ROUTE" | "COMPLETED" | "CANCELLED";
export type VehicleStatus = "ACTIVE" | "MAINTENANCE" | "OUT_OF_SERVICE";
export type InvoiceStatus = "DRAFT" | "SENT" | "PAID";
export type PayrollStatus = "PENDING" | "PROCESSED";
export type ShiftStatus = "SCHEDULED" | "ACTIVE" | "COMPLETED" | "MISSED";
export type DriverStatus = "ACTIVE" | "ON_LEAVE" | "INACTIVE";
export type AccountType = "PRIVATE_PAY" | "MEDICAID" | "INSURANCE" | "FACILITY";
export type BillingType = "CHARGE" | "PAYMENT" | "ADJUSTMENT";

export type User = {
  id: string;
  email: string;
  password: string;
  name: string;
  role: Role;
};

export type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  capacity: number;
  status: VehicleStatus;
  vin: string | null;
  odometer: number;
  lastServiceDate: string | null;
  nextServiceDue: string | null;
  notes: string | null;
};

export type Driver = {
  id: string;
  userId: string;
  licenseNumber: string;
  licenseExpiry: string;
  phone: string;
  hireDate: string;
  hourlyRate: number;
  status: DriverStatus;
  assignedVehicleId: string | null;
};

export type Shift = {
  id: string;
  driverId: string;
  startTime: string;
  endTime: string;
  status: ShiftStatus;
  notes: string | null;
};

export type Client = {
  id: string;
  name: string;
  contactPhone: string;
  contactEmail: string | null;
  accountType: AccountType;
  billingNotes: string | null;
};

export type Trip = {
  id: string;
  clientId: string | null;
  passengerName: string;
  passengerPhone: string | null;
  pickupAddress: string;
  dropoffAddress: string;
  scheduledPickup: string;
  actualPickup: string | null;
  actualDropoff: string | null;
  status: TripStatus;
  driverId: string | null;
  vehicleId: string | null;
  mileage: number | null;
  fare: number;
  notes: string | null;
  wheelchairAccess: boolean;
};

export type InvoiceLineItem = {
  id: string;
  invoiceId: string;
  tripId: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};

export type Invoice = {
  id: string;
  invoiceNo: string;
  clientId: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paidDate: string | null;
  subtotal: number;
  tax: number;
  total: number;
  notes: string | null;
};

export type BillingRecord = {
  id: string;
  clientId: string;
  invoiceId: string | null;
  type: BillingType;
  amount: number;
  balance: number;
  description: string | null;
  recordDate: string;
};

export type PayrollRun = {
  id: string;
  periodStart: string;
  periodEnd: string;
  status: PayrollStatus;
  processedDate: string | null;
  totalAmount: number;
};

export type PayrollEntry = {
  id: string;
  payrollRunId: string;
  driverId: string;
  tripsCount: number;
  hoursWorked: number;
  hourlyRate: number;
  grossPay: number;
};
