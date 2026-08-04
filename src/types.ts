export type EquipmentStatus = 'AVAILABLE' | 'BORROWED' | 'MAINTENANCE' | 'CALIBRATION_DUE' | 'OUT_OF_SERVICE';

export type UserRole = 'ADMIN' | 'BIOMED' | 'NURSE' | 'STAFF' | 'SALES' | 'VIEW_ONLY';

// Permission roles specified by user request
export type UserPermissionRole = 'VIEW_ONLY' | 'SALES' | 'ADMIN';
export type UserApprovalStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export type ThemeTemplate = 'clinical-light' | 'dark-slate' | 'emerald-health' | 'ocean-blue';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole | string;
  permissionRole: UserPermissionRole; // VIEW_ONLY | SALES | ADMIN
  roleTitle: string;
  department: string;
  phone?: string;
  avatar?: string;
  approvalStatus: UserApprovalStatus; // PENDING_APPROVAL | APPROVED | REJECTED
  requestedRole?: UserPermissionRole;
  registeredAt?: string;
}

export interface CustomerCallLog {
  id: string;
  equipmentId: string;
  borrowId: string;
  callDate: string; // ISO date format YYYY-MM-DD HH:mm
  callerName: string; // Staff who made the call
  patientName: string;
  patientPhone: string;
  outcome: string; // e.g., "นัดส่งคืนวันที่ 10 ส.ค.", "ขอขยายเวลายืมต่อ 7 วัน", "รับสายแล้ว - เครื่องทำงานปกติ"
  status: 'COMPLETED' | 'NO_ANSWER' | 'SCHEDULED_RETURN' | 'EXTENDED';
  nextFollowUpDate?: string;
}

export interface BorrowRecord {
  id: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  borrowerStaffId: string;
  borrowerStaffName: string; // พนักงานผู้ยืม
  patientName: string; // ชื่อคนไข้
  patientPhone: string; // เบอร์โทรคนไข้
  borrowDate: string; // YYYY-MM-DD
  expectedReturnDate: string; // YYYY-MM-DD
  actualReturnDate?: string; // YYYY-MM-DD
  locationWard: string; // แผนก / ตึก / Homecare
  accessories: string; // อุปกรณ์เสริม
  notes?: string;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
  returnReceivedByStaff?: string; // พนักงานผู้รับคืน
  returnCondition?: 'GOOD' | 'NEEDS_CLEANING' | 'DAMAGED' | 'NEEDS_PM';
  returnNotes?: string;
  
  // Follow-up call status
  isCustomerCalled: boolean; // มีการโทรหาลูกค้ารึยัง
  lastCallDate?: string;
  callLogs: CustomerCallLog[];
}

export interface PMRecord {
  id: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  type: 'PM' | 'CALIBRATION' | 'BOTH';
  performedDate: string; // YYYY-MM-DD
  nextDueDate: string; // YYYY-MM-DD
  technicianName: string;
  companyName?: string;
  result: 'PASS' | 'FAIL' | 'ADJUSTED';
  certificateNo?: string;
  notes?: string;
  cost?: number;
}

// Master Equipment Catalog (Admin Managed template for Name, Brand, Model)
export interface EquipmentCatalogItem {
  id: string;
  name: string; // ชื่อเครื่องมือแพทย์มาตรฐาน
  brand: string; // ยี่ห้อ
  model: string; // รุ่น
  category: string; // หมวดหมู่
  defaultPmMonths?: number;
  defaultCalMonths?: number;
  createdAt?: string;
}

// Repair & Maintenance Ticket System
export type RepairUrgency = 'NORMAL' | 'URGENT' | 'EMERGENCY';
export type RepairStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface MaintenanceRecord {
  id: string;
  ticketNo: string; // e.g. REP-2026-001
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  brand: string;
  model: string;
  serialNumber: string;
  department: string;
  
  // Reporter info
  reporterName: string;
  reportedDate: string; // YYYY-MM-DD HH:mm
  symptom: string; // อาการเสียเกิดจากอะไร / สาเหตุ
  urgency: RepairUrgency;
  issueImageUrl?: string; // รูปถ่ายอาการเสีย
  
  // Workflow & Technician
  status: RepairStatus;
  assignedTechnician?: string; // ช่างผู้รับงานซ่อม
  acceptedDate?: string; // วันเวลาที่ช่างกดรับงาน
  completedDate?: string; // วันเวลาที่ซ่อมเสร็จและปิดงาน
  
  // Repair Outcome & Details
  repairDetails?: string; // รายละเอียดการซ่อม / วิธีแก้ไข
  partsReplaced?: string; // อะไหล่ที่เปลี่ยน
  cost?: number; // ค่าใช้จ่ายในการซ่อม
  repairTurnaroundDays?: number; // ระยะเวลาซ่อม (วัน)
}

export interface Equipment {
  id: string;
  code: string; // e.g. EQ000001
  name: string; // e.g. เครื่องช่วยหายใจชนิดควบคุมปริมาตร
  brand: string; // e.g. Hamilton / Mindray / Terumo
  model: string; // e.g. C1 / T5
  serialNumber: string; // e.g. SN-8839210
  category: string; // e.g. เครื่องช่วยหายใจ, Infusion Pump, Monitor
  department: string; // e.g. คลังกลาง (Central Supply), ICU, ER
  status: EquipmentStatus;
  
  // PM & Calibration settings
  pmFrequencyMonths: number; // e.g. 6 or 12
  calFrequencyMonths: number; // e.g. 12
  lastPmDate: string; // YYYY-MM-DD
  nextPmDate: string; // YYYY-MM-DD
  lastCalDate: string; // YYYY-MM-DD
  nextCalDate: string; // YYYY-MM-DD
  
  // Purchase & Details
  purchaseDate?: string;
  warrantyExpireDate?: string;
  supplier?: string;
  price?: number;
  notes?: string;
  imageUrl?: string; // รูปหน้าเครื่อง 1 รูป
  nameplateImageUrl?: string; // รูป NAMEPLATE ที่เห็น SN และชื่อเครื่องชัดเจน
  stickerImageUrl?: string; // รูปหน้าเครื่องพร้อมเห็นสติ๊กเกอร์ PM/Cal
  
  // Current Active Borrow Info (if status === 'BORROWED')
  currentBorrowId?: string;
  currentBorrowRecord?: BorrowRecord;
  
  createdAt: string;
  updatedAt: string;
}

export interface FilterOptions {
  searchQuery: string;
  category: string;
  status: string;
  pmCalFilter: 'ALL' | 'PM_DUE_MONTH' | 'CAL_DUE_MONTH' | 'OVERDUE_PM' | 'OVERDUE_CAL';
  customerCallFilter: 'ALL' | 'CALLED' | 'PENDING_CALL';
}
