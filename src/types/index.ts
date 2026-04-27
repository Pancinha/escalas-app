export type UserRole = "ADMIN" | "MANAGER" | "VIEWER";
export type ScheduleStatus = "DRAFT" | "PUBLISHED" | "LOCKED";
export type DayType = "sat" | "sun" | "holiday" | "normal";
export type AuditAction = "CREATE" | "UPDATE" | "DELETE";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

export interface Unit {
  id: string;
  name: string;
  active: boolean;
}

export interface Sector {
  id: string;
  name: string;
  color: string;
  minCoverage: number;
  unitId: string;
  active: boolean;
  unit?: Unit;
  _count?: { employees: number };
}

export interface Employee {
  id: string;
  name: string;
  registration?: string;
  sectorId: string;
  unitId: string;
  active: boolean;
  hiredAt: string;
  photoUrl?: string;
  sector?: Sector;
  unit?: Unit;
}

export interface OccurrenceType {
  id: string;
  code: string;
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  isAbsence: boolean;
  isBranchShift: boolean;
  isSystem: boolean;
  active: boolean;
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
  type: string;
  unitId?: string;
}

export interface Schedule {
  id: string;
  year: number;
  month: number;
  unitId: string;
  status: ScheduleStatus;
  notes?: string;
  createdById: string;
  publishedAt?: string;
  createdAt: string;
  unit?: Unit;
  createdBy?: User;
  entries?: ScheduleEntry[];
}

export interface ScheduleEntry {
  id: string;
  scheduleId: string;
  employeeId: string;
  date: string;
  occurrenceTypeId?: string;
  note?: string;
  occurrenceType?: OccurrenceType;
  employee?: Employee;
}

export interface ScheduleGridData {
  schedule: Schedule;
  employees: Employee[];
  entries: ScheduleEntry[];
  days: string[];
  holidays: string[];
  occurrenceTypes: OccurrenceType[];
}

export interface DashboardStats {
  totalEmployees: number;
  activeSchedules: number;
  todayAbsences: number;
  todayCoverage: { sectorName: string; present: number; total: number; min: number }[];
}
