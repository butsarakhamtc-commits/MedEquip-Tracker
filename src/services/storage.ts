import { Equipment, BorrowRecord, PMRecord, User, CustomerCallLog, EquipmentStatus, ThemeTemplate, EquipmentCatalogItem, MaintenanceRecord, RepairUrgency } from '../types';
import { INITIAL_EQUIPMENT, INITIAL_BORROW_RECORDS, INITIAL_PM_RECORDS, INITIAL_USERS, INITIAL_CATALOG, INITIAL_MAINTENANCE_RECORDS } from '../data/mockData';

const STORAGE_KEYS = {
  EQUIPMENT: 'medequip_items_v1',
  BORROW_RECORDS: 'medequip_borrows_v1',
  PM_RECORDS: 'medequip_pms_v1',
  CURRENT_USER: 'medequip_user_v1',
  THEME: 'medequip_theme_v1',
  ALL_USERS: 'medequip_all_users_v2',
  EQUIPMENT_CATALOG: 'medequip_catalog_v1',
  MAINTENANCE_RECORDS: 'medequip_repairs_v1',
};

// Helper to calculate days elapsed
export function calculateDaysBorrowed(borrowDateStr: string): number {
  if (!borrowDateStr) return 0;
  const start = new Date(borrowDateStr);
  const now = new Date();
  // Strip time component
  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffTime = Math.max(0, now.getTime() - start.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// Generate Next Equipment Code EQ00000X
export function generateNextEquipmentCode(items: Equipment[]): string {
  let maxNum = 0;
  items.forEach((item) => {
    const match = item.code.match(/EQ(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });
  const nextNum = maxNum + 1;
  return `EQ${String(nextNum).padStart(6, '0')}`;
}

export const StorageService = {
  // Initialize storage if empty
  initStorage(): void {
    if (!localStorage.getItem(STORAGE_KEYS.EQUIPMENT)) {
      localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(INITIAL_EQUIPMENT));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BORROW_RECORDS)) {
      localStorage.setItem(STORAGE_KEYS.BORROW_RECORDS, JSON.stringify(INITIAL_BORROW_RECORDS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PM_RECORDS)) {
      localStorage.setItem(STORAGE_KEYS.PM_RECORDS, JSON.stringify(INITIAL_PM_RECORDS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ALL_USERS)) {
      localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EQUIPMENT_CATALOG)) {
      localStorage.setItem(STORAGE_KEYS.EQUIPMENT_CATALOG, JSON.stringify(INITIAL_CATALOG));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MAINTENANCE_RECORDS)) {
      localStorage.setItem(STORAGE_KEYS.MAINTENANCE_RECORDS, JSON.stringify(INITIAL_MAINTENANCE_RECORDS));
    }
  },

  resetToDefault(): void {
    localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(INITIAL_EQUIPMENT));
    localStorage.setItem(STORAGE_KEYS.BORROW_RECORDS, JSON.stringify(INITIAL_BORROW_RECORDS));
    localStorage.setItem(STORAGE_KEYS.PM_RECORDS, JSON.stringify(INITIAL_PM_RECORDS));
    localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
    localStorage.setItem(STORAGE_KEYS.EQUIPMENT_CATALOG, JSON.stringify(INITIAL_CATALOG));
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE_RECORDS, JSON.stringify(INITIAL_MAINTENANCE_RECORDS));
  },

  // Theme Template
  getTheme(): ThemeTemplate {
    this.initStorage();
    const data = localStorage.getItem(STORAGE_KEYS.THEME);
    return (data as ThemeTemplate) || 'clinical-light';
  },

  setTheme(theme: ThemeTemplate): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  // Current User & User Management
  getCurrentUser(): User {
    this.initStorage();
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : INITIAL_USERS[0];
  },

  setCurrentUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  getAllUsers(): User[] {
    this.initStorage();
    const data = localStorage.getItem(STORAGE_KEYS.ALL_USERS);
    return data ? JSON.parse(data) : INITIAL_USERS;
  },

  registerUser(userData: {
    name: string;
    email: string;
    password?: string;
    department: string;
    phone?: string;
    requestedRole: 'VIEW_ONLY' | 'SALES' | 'ADMIN';
  }): User {
    const users = this.getAllUsers();
    
    // Check if email exists
    const existing = users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existing) {
      throw new Error('อีเมลนี้ถูกลงทะเบียนไว้ในระบบแล้ว');
    }

    const roleTitleMap = {
      VIEW_ONLY: 'เจ้าหน้าที่ (ดูได้อย่างเดียว)',
      SALES: 'พนักงานขาย / เซลล์ผู้แทน',
      ADMIN: 'แอดมินผู้ดูแลระบบ',
    };

    const newUser: User = {
      id: `USR-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      password: userData.password || '123456',
      role: userData.requestedRole,
      permissionRole: userData.requestedRole,
      roleTitle: `${roleTitleMap[userData.requestedRole]} (รออนุมัติ)`,
      department: userData.department,
      phone: userData.phone || '',
      approvalStatus: 'PENDING_APPROVAL',
      requestedRole: userData.requestedRole,
      registeredAt: new Date().toISOString().split('T')[0],
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
    return newUser;
  },

  approveUser(userId: string, assignedRole: 'VIEW_ONLY' | 'SALES' | 'ADMIN'): User {
    const users = this.getAllUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index < 0) throw new Error('User not found');

    const roleTitleMap = {
      VIEW_ONLY: 'เจ้าหน้าที่ทั่วไป (ดูได้อย่างเดียว)',
      SALES: 'พนักงานขาย / เซลล์ผู้แทน',
      ADMIN: 'แอดมินผู้ดูแลระบบ',
    };

    const updatedUser: User = {
      ...users[index],
      approvalStatus: 'APPROVED',
      permissionRole: assignedRole,
      role: assignedRole,
      roleTitle: roleTitleMap[assignedRole],
    };

    users[index] = updatedUser;
    localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users));

    // If current user is updated, sync current user
    const currentUser = this.getCurrentUser();
    if (currentUser.id === userId) {
      this.setCurrentUser(updatedUser);
    }

    return updatedUser;
  },

  rejectUser(userId: string): void {
    const users = this.getAllUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index >= 0) {
      users[index].approvalStatus = 'REJECTED';
      users[index].roleTitle = 'คำขอลงทะเบียนถูกปฏิเสธ';
      localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
    }
  },

  deleteUser(userId: string): void {
    const users = this.getAllUsers().filter((u) => u.id !== userId);
    localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
  },

  // Equipment CRUD
  getEquipmentList(): Equipment[] {
    this.initStorage();
    const rawEq = localStorage.getItem(STORAGE_KEYS.EQUIPMENT);
    const rawBorrows = localStorage.getItem(STORAGE_KEYS.BORROW_RECORDS);
    const equipment: Equipment[] = rawEq ? JSON.parse(rawEq) : [];
    const borrows: BorrowRecord[] = rawBorrows ? JSON.parse(rawBorrows) : [];

    // Attach active borrow record to equipment if borrowed
    return equipment.map((eq) => {
      if (eq.status === 'BORROWED' && eq.currentBorrowId) {
        const activeBorrow = borrows.find((b) => b.id === eq.currentBorrowId && b.status === 'ACTIVE');
        return { ...eq, currentBorrowRecord: activeBorrow };
      }
      return eq;
    });
  },

  saveEquipment(item: Partial<Equipment>): Equipment {
    const list = this.getEquipmentList();
    let savedItem: Equipment;

    if (item.id) {
      // Update
      const index = list.findIndex((e) => e.id === item.id);
      if (index >= 0) {
        savedItem = {
          ...list[index],
          ...item,
          updatedAt: new Date().toISOString(),
        } as Equipment;
        list[index] = savedItem;
      } else {
        throw new Error('Equipment not found');
      }
    } else {
      // Create New
      const code = item.code || generateNextEquipmentCode(list);
      const nowStr = new Date().toISOString().split('T')[0];
      
      // Default PM/Cal calculation if dates provided
      const pmMonths = item.pmFrequencyMonths || 6;
      const calMonths = item.calFrequencyMonths || 12;

      const lastPm = item.lastPmDate || nowStr;
      const lastCal = item.lastCalDate || nowStr;

      const nextPmDate = item.nextPmDate || this.calculateNextDate(lastPm, pmMonths);
      const nextCalDate = item.nextCalDate || this.calculateNextDate(lastCal, calMonths);

      savedItem = {
        id: `eq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        code,
        name: item.name || 'เครื่องมือแพทย์ไม่ระบุชื่อ',
        brand: item.brand || 'General',
        model: item.model || 'N/A',
        serialNumber: item.serialNumber || 'SN-UNKNOWN',
        category: item.category || 'เครื่องมือแพทย์ทั่วไป',
        department: item.department || 'คลังเครื่องมือกลาง',
        status: (item.status as EquipmentStatus) || 'AVAILABLE',
        pmFrequencyMonths: pmMonths,
        calFrequencyMonths: calMonths,
        lastPmDate: lastPm,
        nextPmDate: nextPmDate,
        lastCalDate: lastCal,
        nextCalDate: nextCalDate,
        purchaseDate: item.purchaseDate || '',
        warrantyExpireDate: item.warrantyExpireDate || '',
        supplier: item.supplier || '',
        price: item.price || 0,
        notes: item.notes || '',
        imageUrl: item.imageUrl || '',
        nameplateImageUrl: item.nameplateImageUrl || '',
        stickerImageUrl: item.stickerImageUrl || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      list.unshift(savedItem);
    }

    localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(list));
    return savedItem;
  },

  deleteEquipment(id: string): void {
    const list = this.getEquipmentList().filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(list));
  },

  // Calculate next date helper
  calculateNextDate(startDateStr: string, addMonths: number): string {
    if (!startDateStr) return new Date().toISOString().split('T')[0];
    const d = new Date(startDateStr);
    d.setMonth(d.getMonth() + addMonths);
    return d.toISOString().split('T')[0];
  },

  // Borrow Operations
  borrowEquipment(params: {
    equipmentId: string;
    borrowerStaffId: string;
    borrowerStaffName: string;
    patientName: string;
    patientPhone: string;
    borrowDate: string;
    expectedReturnDate: string;
    locationWard: string;
    accessories: string;
    notes?: string;
  }): BorrowRecord {
    const eqList = this.getEquipmentList();
    const equipment = eqList.find((e) => e.id === params.equipmentId);
    if (!equipment) throw new Error('Equipment not found');

    const borrowId = `br-${Date.now()}`;
    const newBorrow: BorrowRecord = {
      id: borrowId,
      equipmentId: equipment.id,
      equipmentCode: equipment.code,
      equipmentName: equipment.name,
      borrowerStaffId: params.borrowerStaffId,
      borrowerStaffName: params.borrowerStaffName,
      patientName: params.patientName,
      patientPhone: params.patientPhone,
      borrowDate: params.borrowDate,
      expectedReturnDate: params.expectedReturnDate,
      locationWard: params.locationWard,
      accessories: params.accessories,
      notes: params.notes,
      status: 'ACTIVE',
      isCustomerCalled: false,
      callLogs: [],
    };

    // Save borrow record
    const borrows = this.getBorrowRecords();
    borrows.unshift(newBorrow);
    localStorage.setItem(STORAGE_KEYS.BORROW_RECORDS, JSON.stringify(borrows));

    // Update equipment status
    equipment.status = 'BORROWED';
    equipment.currentBorrowId = borrowId;
    equipment.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(eqList));

    return newBorrow;
  },

  returnEquipment(params: {
    borrowId: string;
    returnReceivedByStaff: string;
    returnCondition: 'GOOD' | 'NEEDS_CLEANING' | 'DAMAGED' | 'NEEDS_PM';
    returnNotes?: string;
    actualReturnDate?: string;
  }): void {
    const borrows = this.getBorrowRecords();
    const borrowIndex = borrows.findIndex((b) => b.id === params.borrowId);
    if (borrowIndex < 0) throw new Error('Borrow record not found');

    const borrow = borrows[borrowIndex];
    borrow.status = 'RETURNED';
    borrow.actualReturnDate = params.actualReturnDate || new Date().toISOString().split('T')[0];
    borrow.returnReceivedByStaff = params.returnReceivedByStaff;
    borrow.returnCondition = params.returnCondition;
    borrow.returnNotes = params.returnNotes;

    borrows[borrowIndex] = borrow;
    localStorage.setItem(STORAGE_KEYS.BORROW_RECORDS, JSON.stringify(borrows));

    // Update Equipment status back to AVAILABLE or MAINTENANCE
    const eqList = this.getEquipmentList();
    const eqIndex = eqList.findIndex((e) => e.id === borrow.equipmentId);
    if (eqIndex >= 0) {
      const eq = eqList[eqIndex];
      eq.status = params.returnCondition === 'DAMAGED' ? 'MAINTENANCE' : 'AVAILABLE';
      eq.currentBorrowId = undefined;
      eq.updatedAt = new Date().toISOString();
      eqList[eqIndex] = eq;
      localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(eqList));
    }
  },

  // Toggle Customer Call & Add Call Log
  addCustomerCallLog(params: {
    borrowId: string;
    callerName: string;
    outcome: string;
    status: 'COMPLETED' | 'NO_ANSWER' | 'SCHEDULED_RETURN' | 'EXTENDED';
    nextFollowUpDate?: string;
  }): CustomerCallLog {
    const borrows = this.getBorrowRecords();
    const borrow = borrows.find((b) => b.id === params.borrowId);
    if (!borrow) throw new Error('Borrow record not found');

    const nowFormatted = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newLog: CustomerCallLog = {
      id: `cl-${Date.now()}`,
      equipmentId: borrow.equipmentId,
      borrowId: borrow.id,
      callDate: nowFormatted,
      callerName: params.callerName,
      patientName: borrow.patientName,
      patientPhone: borrow.patientPhone,
      outcome: params.outcome,
      status: params.status,
      nextFollowUpDate: params.nextFollowUpDate,
    };

    borrow.isCustomerCalled = true;
    borrow.lastCallDate = nowFormatted;
    borrow.callLogs = borrow.callLogs || [];
    borrow.callLogs.unshift(newLog);

    if (params.status === 'EXTENDED' && params.nextFollowUpDate) {
      borrow.expectedReturnDate = params.nextFollowUpDate;
    }

    localStorage.setItem(STORAGE_KEYS.BORROW_RECORDS, JSON.stringify(borrows));
    return newLog;
  },

  toggleCustomerCallStatus(borrowId: string, called: boolean): void {
    const borrows = this.getBorrowRecords();
    const borrow = borrows.find((b) => b.id === borrowId);
    if (borrow) {
      borrow.isCustomerCalled = called;
      if (called) {
        borrow.lastCallDate = new Date().toISOString().replace('T', ' ').substring(0, 16);
      }
      localStorage.setItem(STORAGE_KEYS.BORROW_RECORDS, JSON.stringify(borrows));
    }
  },

  getBorrowRecords(): BorrowRecord[] {
    this.initStorage();
    const data = localStorage.getItem(STORAGE_KEYS.BORROW_RECORDS);
    return data ? JSON.parse(data) : [];
  },

  // PM Records
  getPMRecords(): PMRecord[] {
    this.initStorage();
    const data = localStorage.getItem(STORAGE_KEYS.PM_RECORDS);
    return data ? JSON.parse(data) : [];
  },

  recordPMCompletion(params: {
    equipmentId: string;
    type: 'PM' | 'CALIBRATION' | 'BOTH';
    performedDate: string; // YYYY-MM-DD
    technicianName: string;
    companyName?: string;
    result: 'PASS' | 'FAIL' | 'ADJUSTED';
    certificateNo?: string;
    notes?: string;
    cost?: number;
  }): PMRecord {
    const eqList = this.getEquipmentList();
    const eq = eqList.find((e) => e.id === params.equipmentId);
    if (!eq) throw new Error('Equipment not found');

    const pmMonths = eq.pmFrequencyMonths || 6;
    const calMonths = eq.calFrequencyMonths || 12;

    const nextPm = this.calculateNextDate(params.performedDate, pmMonths);
    const nextCal = this.calculateNextDate(params.performedDate, calMonths);

    // Create PM Record
    const pmRecord: PMRecord = {
      id: `pm-${Date.now()}`,
      equipmentId: eq.id,
      equipmentCode: eq.code,
      equipmentName: eq.name,
      type: params.type,
      performedDate: params.performedDate,
      nextDueDate: params.type === 'CALIBRATION' ? nextCal : nextPm,
      technicianName: params.technicianName,
      companyName: params.companyName,
      result: params.result,
      certificateNo: params.certificateNo,
      notes: params.notes,
      cost: params.cost,
    };

    const pmRecords = this.getPMRecords();
    pmRecords.unshift(pmRecord);
    localStorage.setItem(STORAGE_KEYS.PM_RECORDS, JSON.stringify(pmRecords));

    // Update equipment PM/Cal dates
    if (params.type === 'PM' || params.type === 'BOTH') {
      eq.lastPmDate = params.performedDate;
      eq.nextPmDate = nextPm;
    }
    if (params.type === 'CALIBRATION' || params.type === 'BOTH') {
      eq.lastCalDate = params.performedDate;
      eq.nextCalDate = nextCal;
    }

    // Reset status to AVAILABLE if it was MAINTENANCE or PM_DUE
    if (eq.status === 'MAINTENANCE' || eq.status === 'CALIBRATION_DUE') {
      eq.status = 'AVAILABLE';
    }
    eq.updatedAt = new Date().toISOString();

    localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(eqList));
    return pmRecord;
  },

  // Equipment Master Catalog Management
  getEquipmentCatalog(): EquipmentCatalogItem[] {
    this.initStorage();
    const data = localStorage.getItem(STORAGE_KEYS.EQUIPMENT_CATALOG);
    return data ? JSON.parse(data) : INITIAL_CATALOG;
  },

  saveEquipmentCatalogItem(item: Partial<EquipmentCatalogItem>): EquipmentCatalogItem {
    const catalog = this.getEquipmentCatalog();
    let saved: EquipmentCatalogItem;

    if (item.id) {
      const index = catalog.findIndex((c) => c.id === item.id);
      if (index >= 0) {
        saved = { ...catalog[index], ...item } as EquipmentCatalogItem;
        catalog[index] = saved;
      } else {
        throw new Error('Catalog item not found');
      }
    } else {
      saved = {
        id: `cat-${Date.now()}`,
        name: item.name || 'ชื่อเครื่องมือแพทย์ใหม่',
        brand: item.brand || 'General',
        model: item.model || 'N/A',
        category: item.category || 'เครื่องมือแพทย์ทั่วไป',
        defaultPmMonths: item.defaultPmMonths || 6,
        defaultCalMonths: item.defaultCalMonths || 12,
        createdAt: new Date().toISOString(),
      };
      catalog.unshift(saved);
    }

    localStorage.setItem(STORAGE_KEYS.EQUIPMENT_CATALOG, JSON.stringify(catalog));
    return saved;
  },

  deleteEquipmentCatalogItem(id: string): void {
    const catalog = this.getEquipmentCatalog().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.EQUIPMENT_CATALOG, JSON.stringify(catalog));
  },

  // Maintenance & Repair Request Ticket Management
  getMaintenanceRecords(): MaintenanceRecord[] {
    this.initStorage();
    const data = localStorage.getItem(STORAGE_KEYS.MAINTENANCE_RECORDS);
    return data ? JSON.parse(data) : INITIAL_MAINTENANCE_RECORDS;
  },

  createMaintenanceRecord(params: {
    equipmentId: string;
    reporterName: string;
    symptom: string;
    urgency: RepairUrgency;
    issueImageUrl?: string;
  }): MaintenanceRecord {
    const eqList = this.getEquipmentList();
    const equipment = eqList.find((e) => e.id === params.equipmentId);
    if (!equipment) throw new Error('Equipment not found');

    const repairList = this.getMaintenanceRecords();
    const ticketCount = repairList.length + 1;
    const ticketNo = `REP-${new Date().getFullYear()}-${String(ticketCount).padStart(3, '0')}`;
    const nowFormatted = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newTicket: MaintenanceRecord = {
      id: `rep-${Date.now()}`,
      ticketNo,
      equipmentId: equipment.id,
      equipmentCode: equipment.code,
      equipmentName: equipment.name,
      brand: equipment.brand,
      model: equipment.model,
      serialNumber: equipment.serialNumber,
      department: equipment.department,
      reporterName: params.reporterName,
      reportedDate: nowFormatted,
      symptom: params.symptom,
      urgency: params.urgency,
      issueImageUrl: params.issueImageUrl,
      status: 'PENDING',
    };

    repairList.unshift(newTicket);
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE_RECORDS, JSON.stringify(repairList));

    // Update equipment status to MAINTENANCE
    equipment.status = 'MAINTENANCE';
    equipment.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(eqList));

    return newTicket;
  },

  acceptMaintenanceTask(ticketId: string, technicianName: string): MaintenanceRecord {
    const repairList = this.getMaintenanceRecords();
    const index = repairList.findIndex((r) => r.id === ticketId);
    if (index < 0) throw new Error('Ticket not found');

    const nowFormatted = new Date().toISOString().replace('T', ' ').substring(0, 16);
    repairList[index].status = 'IN_PROGRESS';
    repairList[index].assignedTechnician = technicianName;
    repairList[index].acceptedDate = nowFormatted;

    localStorage.setItem(STORAGE_KEYS.MAINTENANCE_RECORDS, JSON.stringify(repairList));

    // Keep equipment status as MAINTENANCE
    return repairList[index];
  },

  completeMaintenanceTask(params: {
    ticketId: string;
    repairDetails: string;
    partsReplaced?: string;
    cost?: number;
  }): MaintenanceRecord {
    const repairList = this.getMaintenanceRecords();
    const index = repairList.findIndex((r) => r.id === params.ticketId);
    if (index < 0) throw new Error('Ticket not found');

    const ticket = repairList[index];
    const nowFormatted = new Date().toISOString().replace('T', ' ').substring(0, 16);
    
    // Calculate turnaround days
    const reported = new Date(ticket.reportedDate);
    const completed = new Date();
    const diffHours = Math.max(0, (completed.getTime() - reported.getTime()) / (1000 * 60 * 60));
    const turnaroundDays = Math.max(1, Math.round(diffHours / 24));

    ticket.status = 'COMPLETED';
    ticket.completedDate = nowFormatted;
    ticket.repairDetails = params.repairDetails;
    ticket.partsReplaced = params.partsReplaced || '';
    ticket.cost = params.cost || 0;
    ticket.repairTurnaroundDays = turnaroundDays;

    repairList[index] = ticket;
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE_RECORDS, JSON.stringify(repairList));

    // Restore equipment status to AVAILABLE
    const eqList = this.getEquipmentList();
    const eqIndex = eqList.findIndex((e) => e.id === ticket.equipmentId);
    if (eqIndex >= 0) {
      eqList[eqIndex].status = 'AVAILABLE';
      eqList[eqIndex].updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(eqList));
    }

    return ticket;
  },

  cancelMaintenanceTask(ticketId: string): void {
    const repairList = this.getMaintenanceRecords();
    const index = repairList.findIndex((r) => r.id === ticketId);
    if (index >= 0) {
      const ticket = repairList[index];
      ticket.status = 'CANCELLED';
      localStorage.setItem(STORAGE_KEYS.MAINTENANCE_RECORDS, JSON.stringify(repairList));

      // Restore equipment status to AVAILABLE
      const eqList = this.getEquipmentList();
      const eqIndex = eqList.findIndex((e) => e.id === ticket.equipmentId);
      if (eqIndex >= 0) {
        eqList[eqIndex].status = 'AVAILABLE';
        eqList[eqIndex].updatedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(eqList));
      }
    }
  }
};
