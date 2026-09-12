// BariVara Core TypeScript Definitions matching the Backend API

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
  errorCode?: string;
  details?: unknown;
}

export interface ApiErrorPayload {
  success?: false;
  message?: string;
  errorCode?: string;
  details?: unknown;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// User & Auth
export type Role = 'OWNER' | 'MANAGER' | 'STAFF';

export interface User {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: Role;
  isActive: boolean;
  signatureFileId?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
}

export interface AuthResponseData extends AuthTokens {
  user: User;
}

// Property
export interface Property {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  city?: string | null;
  district?: string | null;
  postalCode?: string | null;
  description?: string | null;
  totalFloors: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  units?: Unit[];
  _count?: {
    units: number;
  };
}

export interface PropertySummary {
  propertyId: string;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  maintenanceUnits: number;
  activeTenants: number;
  currentMonth: {
    year: number;
    month: number;
    expected: number;
    collected: number;
    outstanding: number;
    collectionRate: number;
  };
}

// Unit
export type UnitType = 'APARTMENT' | 'FLAT' | 'ROOM' | 'SHOP' | 'OFFICE' | 'PARKING' | 'OTHER';
export type UnitStatus = 'VACANT' | 'OCCUPIED' | 'MAINTENANCE' | 'INACTIVE';

export interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  floor: number;
  unitType: UnitType;
  bedrooms?: number | null;
  bathrooms?: number | null;
  monthlyBaseRent: number;
  defaultServiceFee: number;
  defaultParkingFee: number;
  defaultExtraCharge: number;
  status: UnitStatus;
  createdAt: string;
  updatedAt: string;
  property?: Property;
  agreements?: RentalAgreement[];
}

export interface BulkUnitInput {
  unitNumber: string;
  unitType: UnitType;
  bedrooms?: number;
  bathrooms?: number;
  monthlyBaseRent: number;
  defaultServiceFee: number;
  defaultParkingFee: number;
  defaultExtraCharge: number;
}

export interface CreateUnitInput extends BulkUnitInput {
  floor: number;
  status?: UnitStatus;
}

export interface BulkCreateUnitsPayload {
  floor: number;
  units: BulkUnitInput[];
}

export interface BulkCreateUnitsResult {
  created: number;
  units: Unit[];
}

// Tenant
export interface Tenant {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  nidFrontImageId?: string | null;
  nidBackImageId?: string | null;
  permanentAddress?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  occupation?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  agreements?: RentalAgreement[];
}

// Rental Agreement
export type AgreementStatus = 'ACTIVE' | 'ENDED' | 'CANCELLED';

export interface RentalAgreement {
  id: string;
  tenantId: string;
  unitId: string;
  monthlyRent: number;
  serviceFee: number;
  parkingFee: number;
  extraCharge: number;
  dueDay: number;
  securityDeposit: number;
  startDate: string;
  endDate?: string | null;
  status: AgreementStatus;
  notes?: string | null;
  agreementDocumentId?: string;
  createdAt: string;
  updatedAt: string;
  tenant?: Tenant;
  unit?: Unit;
  monthlyRents?: MonthlyRent[];
}

// Monthly Rent
export type RentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface MonthlyRent {
  id: string;
  agreementId: string;
  month: number;
  year: number;
  rent: number;
  serviceFee: number;
  parkingFee: number;
  extraCharge: number;
  lateFee: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  paidDate?: string | null;
  status: RentStatus;
  createdAt: string;
  updatedAt: string;
  agreement?: RentalAgreement & {
    tenant?: Tenant;
    unit?: Unit & { property?: Property };
  };
  payments?: Payment[];
}

// Payment
export type PaymentMethod = 'CASH' | 'BANK' | 'BKASH' | 'NAGAD' | 'ROCKET' | 'CARD' | 'OTHER';
export type PaymentStatus = 'COMPLETED' | 'REVERSED';

export interface Payment {
  id: string;
  monthlyRentId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string | null;
  paymentDate: string;
  receivedBy?: string | null;
  note?: string | null;
  status: PaymentStatus;
  ownerSignatureSnapshotId?: string | null;
  ownerSignatureSnapshot?: Media | null;
  owner?: { id: string; name: string | null; signatureFileId?: string | null } | null;
  createdAt: string;
  updatedAt: string;
  monthlyRent?: MonthlyRent;
}

// Expense
export type ExpenseCategory =
  | 'ELECTRICITY'
  | 'WATER'
  | 'GAS'
  | 'MAINTENANCE'
  | 'REPAIR'
  | 'SECURITY'
  | 'CLEANING'
  | 'SALARY'
  | 'TAX'
  | 'OTHER';

export interface Expense {
  id: string;
  propertyId: string;
  category: ExpenseCategory;
  amount: number;
  expenseDate: string;
  description?: string | null;
  paymentMethod: PaymentMethod;
  reference?: string | null;
  receiptFileId?: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  property?: Property;
}

// Reminder
export type ReminderType = 'UPCOMING_DUE' | 'DUE_TODAY' | 'OVERDUE' | 'PAYMENT_CONFIRMATION' | 'CUSTOM';
export type ReminderChannel = 'IN_APP' | 'PUSH' | 'EMAIL' | 'SMS' | 'WHATSAPP';
export type ReminderStatus = 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED';

export interface Reminder {
  id: string;
  monthlyRentId?: string | null;
  tenantId: string;
  type: ReminderType;
  scheduledAt: string;
  sentAt?: string | null;
  status: ReminderStatus;
  channel: ReminderChannel;
  message: string;
  createdAt: string;
  updatedAt: string;
  tenant?: Tenant;
  monthlyRent?: MonthlyRent;
}

// Dashboard Overview
export interface DashboardOverview {
  totalProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  maintenanceUnits: number;
  totalTenants: number;
  occupancyRate: number;
  currentMonth: {
    year: number;
    month: number;
    expected: number;
    collected: number;
    outstanding: number;
    collectionRate: number;
    paidCount: number;
    partialCount: number;
    pendingCount: number;
    overdueCount: number;
  };
}

// Reports
export interface MonthlyReport {
  year: number;
  month: number;
  propertyId?: string;
  totalProperties: number;
  totalUnits: number;
  totalTenants: number;
  financialSummary: {
    expectedRent: number;
    collectedRent: number;
    outstandingRent: number;
    totalExpenses: number;
    netIncome: number;
    collectionRate: number;
  };
  rentsByStatus: {
    paid: number;
    partial: number;
    pending: number;
    overdue: number;
  };
}

// ─── File Upload / Media ──────────────────────────────────────────────────────

export type FileCategory =
  | 'PROFILE_IMAGE'
  | 'PROPERTY_IMAGE'
  | 'TENANT_FRONT_NID'
  | 'TENANT_BACK_NID'
  | 'TENANT_DOCUMENT'
  | 'AGREEMENT_DOCUMENT'
  | 'PAYMENT_RECEIPT'
  | 'OWNER_SIGNATURE'
  | 'OTHER';

export type FileStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'DELETED';

export interface Media {
  id: string;
  originalName: string;
  bucket: string;
  mimeType: string;
  size: number;
  category: FileCategory;
  entityType?: string | null;
  entityId?: string | null;
  uploadedBy: string;
  status: FileStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RequestUploadUrlPayload {
  category: FileCategory;
  originalName: string;
  mimeType: string;
  size: number;
  entityType?: string;
  entityId?: string;
}

export interface UploadUrlResponse {
  fileId: string;
  uploadUrl: string;
  token?: string;
  storagePath: string;
  bucket: string;
  expiresAt: string;
}

export interface FileDownloadUrlResponse {
  url: string;
  isTemporary: boolean;
  expiresAt: string | null;
}
