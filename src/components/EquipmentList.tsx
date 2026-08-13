import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  QrCode, 
  Wrench, 
  ArrowLeftRight, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  Printer,
  X,
  Camera,
  Upload,
  Image as ImageIcon,
  FileText,
  Tag
} from 'lucide-react';
import { Equipment, EquipmentStatus, User, EquipmentCatalogItem, BorrowRecord, MaintenanceRecord } from '../types';
import { generateNextEquipmentCode, calculateDaysBorrowed } from '../services/storage';
import { ConfirmModal } from './ConfirmModal';

interface EquipmentListProps {
  equipmentList: Equipment[];
  currentUser: User;
  borrowRecords?: BorrowRecord[];
  maintenanceList?: MaintenanceRecord[];
  catalog?: EquipmentCatalogItem[];
  onOpenEquipmentDetail: (equipment: Equipment) => void;
  onOpenBorrowModal: (equipment: Equipment) => void;
  onOpenReturnModal: (borrow: any) => void;
  onOpenRecordPMModal: (equipment: Equipment) => void;
  onOpenStickerModal: (equipment: Equipment) => void;
  onSaveEquipment: (equipment: Partial<Equipment>) => void;
  onDeleteEquipment: (id: string) => void;
  onDeleteAllEquipment?: () => void;
  onOpenMasterCatalogModal?: () => void;
}

export const EquipmentList: React.FC<EquipmentListProps> = ({
  equipmentList,
  currentUser,
  borrowRecords = [],
  maintenanceList = [],
  catalog = [],
  onOpenEquipmentDetail,
  onOpenBorrowModal,
  onOpenReturnModal,
  onOpenRecordPMModal,
  onOpenStickerModal,
  onSaveEquipment,
  onDeleteEquipment,
  onDeleteAllEquipment,
  onOpenMasterCatalogModal,
}) => {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

  // Confirm Modal State
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const isReadOnly = currentUser.permissionRole === 'VIEW_ONLY';

  // Delete single equipment handler
  const handleDeleteSingle = (eq: Equipment) => {
    if (isReadOnly) {
      setConfirmModalConfig({
        isOpen: true,
        title: 'ไม่มีสิทธิ์ดำเนินการ',
        message: 'บัญชีของท่านมีสิทธิ์ "ดูได้อย่างเดียว" ไม่สามารถลบเครื่องมือได้',
        onConfirm: () => {},
      });
      return;
    }

    const message = eq.status === 'BORROWED'
      ? `⚠️ เครื่องมือ [${eq.code}] ${eq.name} กำลังถูกยืมใช้งานอยู่!\n\nคุณยืนยันที่จะลบเครื่องนี้ออกจากทะเบียนหรือไม่?`
      : `คุณต้องการลบเครื่องมือแพทย์ [${eq.code}] ${eq.name} (S/N: ${eq.serialNumber}) ออกจากทะเบียนใช่หรือไม่?`;

    setConfirmModalConfig({
      isOpen: true,
      title: `ยืนยันการลบ [${eq.code}]`,
      message,
      onConfirm: () => {
        onDeleteEquipment(eq.id);
        if (editingEquipment?.id === eq.id) {
          setIsAddModalOpen(false);
        }
      },
    });
  };

  // Delete all equipment handler
  const handleDeleteAll = () => {
    if (isReadOnly) {
      setConfirmModalConfig({
        isOpen: true,
        title: 'ไม่มีสิทธิ์ดำเนินการ',
        message: 'บัญชีของท่านมีสิทธิ์ "ดูได้อย่างเดียว" ไม่สามารถลบข้อมูลได้',
        onConfirm: () => {},
      });
      return;
    }
    if (equipmentList.length === 0) {
      setConfirmModalConfig({
        isOpen: true,
        title: 'ไม่มีข้อมูล',
        message: 'ไม่มีข้อมูลเครื่องมือในทะเบียนอยู่แล้ว',
        onConfirm: () => {},
      });
      return;
    }

    setConfirmModalConfig({
      isOpen: true,
      title: 'ลบข้อมูลเครื่องมือทั้งหมด',
      message: `⚠️ คุณต้องการลบข้อมูลเครื่องมือแพทย์ทั้งหมดในระบบจำนวน ${equipmentList.length} รายการใช่หรือไม่?\n\n(การลบนี้จะล้างเครื่องทดสอบในระบบออก เพื่อให้คุณเริ่มต้นลงทะเบียนข้อมูลเครื่องมือแพทย์ของจริงได้เลย)`,
      onConfirm: () => {
        if (onDeleteAllEquipment) {
          onDeleteAllEquipment();
        } else {
          equipmentList.forEach((e) => onDeleteEquipment(e.id));
        }
        setIsAddModalOpen(false);
      },
    });
  };

  // Helper date adder
  const calcNextDate = (startDate: string, addMonths: number): string => {
    if (!startDate) return '';
    const d = new Date(startDate);
    if (isNaN(d.getTime())) return '';
    d.setMonth(d.getMonth() + addMonths);
    return d.toISOString().split('T')[0];
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Form State
  const [formData, setFormData] = useState<Partial<Equipment>>({
    code: '',
    productCode: '',
    name: '',
    brand: '',
    model: '',
    serialNumber: '',
    dnNumber: '',
    category: 'เครื่องช่วยหายใจ',
    department: 'คลังเครื่องมือกลาง',
    status: 'AVAILABLE',
    pmFrequencyMonths: 6,
    calFrequencyMonths: 12,
    lastPmDate: '',
    nextPmDate: '',
    lastCalDate: '',
    nextCalDate: '',
    supplier: '',
    price: 0,
    notes: '',
  });

  // Handle open add form with auto-code
  const handleOpenAddForm = () => {
    if (isReadOnly) {
      alert('บัญชีของท่านมีสิทธิ์ "ดูได้อย่างเดียว" ไม่สามารถลงทะเบียนเครื่องใหม่ได้');
      return;
    }

    const nextCode = generateNextEquipmentCode(equipmentList);

    setFormData({
      code: nextCode,
      productCode: '',
      name: '',
      brand: '',
      model: '',
      serialNumber: '',
      dnNumber: '',
      category: 'เครื่องช่วยหายใจ',
      department: 'คลังเครื่องมือกลาง',
      status: 'AVAILABLE',
      pmFrequencyMonths: 6,
      calFrequencyMonths: 12,
      lastPmDate: '',
      nextPmDate: '',
      lastCalDate: '',
      nextCalDate: '',
      supplier: '',
      price: 0,
      notes: '',
    });
    setEditingEquipment(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditForm = (eq: Equipment) => {
    setEditingEquipment(eq);
    setFormData({ ...eq });
    setIsAddModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.serialNumber) {
      alert('กรุณากรอกชื่อเครื่องและ Serial Number');
      return;
    }
    onSaveEquipment(formData);
    setIsAddModalOpen(false);
  };

  // Filter List
  const filteredList = equipmentList.filter((eq) => {
    const matchesSearch = 
      eq.code.toLowerCase().includes(search.toLowerCase()) ||
      (eq.productCode && eq.productCode.toLowerCase().includes(search.toLowerCase())) ||
      eq.name.toLowerCase().includes(search.toLowerCase()) ||
      eq.brand.toLowerCase().includes(search.toLowerCase()) ||
      eq.model.toLowerCase().includes(search.toLowerCase()) ||
      eq.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      (eq.dnNumber && eq.dnNumber.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = selectedStatus === 'ALL' || eq.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Status Badge Helper
  const getStatusBadge = (status: EquipmentStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>พร้อมใช้งาน</span>
          </span>
        );
      case 'BORROWED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30 flex items-center gap-1 w-fit">
            <ArrowLeftRight className="w-3 h-3 text-sky-600 dark:text-sky-400" />
            <span>ถูกยืมอยู่</span>
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 flex items-center gap-1 w-fit">
            <Wrench className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            <span>ส่งซ่อม</span>
          </span>
        );
      case 'CALIBRATION_DUE':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>ถึงรอบ PM/Cal</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700 text-slate-300 w-fit">
            {status}
          </span>
        );
    }
  };

  // Status Counts
  const availableCount = equipmentList.filter((e) => e.status === 'AVAILABLE').length;
  const borrowedCount = equipmentList.filter((e) => e.status === 'BORROWED').length;
  const maintenanceCount = equipmentList.filter((e) => e.status === 'MAINTENANCE').length;
  const duePmCalCount = equipmentList.filter((e) => e.status === 'CALIBRATION_DUE').length;

  return (
    <div className="space-y-5">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>ทะเบียนเครื่องมือแพทย์ (Equipment Inventory)</span>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-400 font-mono px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
              {filteredList.length} / {equipmentList.length} รายการ
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ลงทะเบียน จัดการ Serial Number ตรวจสอบสถานะการยืมใช้งาน การส่งซ่อม และวัน PM/Calibration
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenMasterCatalogModal && (
            <button
              onClick={onOpenMasterCatalogModal}
              className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-all"
              title="จัดการชื่อ ยี่ห้อ รุ่น มาตรฐาน"
            >
              <Tag className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>⚙️ Master Catalog (แอดมิน)</span>
            </button>
          )}

          {equipmentList.length > 0 && !isReadOnly && (
            <button
              onClick={handleDeleteAll}
              className="px-3.5 py-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold rounded-xl text-xs sm:text-sm border border-rose-200 dark:border-rose-800 flex items-center justify-center gap-1.5 transition-all shadow-2xs"
              title="ลบเครื่องมือทั้งหมดในระบบเพื่อลงทะเบียนข้อมูลจริง"
            >
              <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>ลบเครื่องมือทั้งหมด</span>
            </button>
          )}

          <button
            onClick={handleOpenAddForm}
            className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ ลงทะเบียนเครื่องมือแพทย์</span>
          </button>
        </div>
      </div>

      {/* Quick Status Chips & Filter Bar */}
      <div className="space-y-3">
        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedStatus('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              selectedStatus === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            ทั้งหมด ({equipmentList.length})
          </button>

          <button
            onClick={() => setSelectedStatus('AVAILABLE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              selectedStatus === 'AVAILABLE'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>พร้อมใช้งาน ({availableCount})</span>
          </button>

          <button
            onClick={() => setSelectedStatus('BORROWED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              selectedStatus === 'BORROWED'
                ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                : 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800 hover:bg-sky-100'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>ถูกยืมอยู่ ({borrowedCount})</span>
          </button>

          <button
            onClick={() => setSelectedStatus('MAINTENANCE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              selectedStatus === 'MAINTENANCE'
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>ส่งซ่อม ({maintenanceCount})</span>
          </button>

          <button
            onClick={() => setSelectedStatus('CALIBRATION_DUE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              selectedStatus === 'CALIBRATION_DUE'
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>ถึงรอบ PM/Cal ({duePmCalCount})</span>
          </button>
        </div>

        {/* Search & Filter Dropdown Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาตามรหัส, รหัสสินค้า, ชื่อเครื่อง, Serial, ยี่ห้อ, DN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="ALL">กรองตามสถานะ: แสดงทั้งหมด</option>
            <option value="AVAILABLE">พร้อมใช้งาน (Available)</option>
            <option value="BORROWED">ถูกยืมอยู่ (Borrowed)</option>
            <option value="MAINTENANCE">ส่งซ่อม (Maintenance)</option>
            <option value="CALIBRATION_DUE">ถึงรอบ PM/Cal</option>
          </select>
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.map((eq) => {
          // Resolve active borrow record if borrowed
          const activeBorrow = eq.status === 'BORROWED' 
            ? (eq.currentBorrowRecord || borrowRecords.find(b => (b.equipmentId === eq.id || b.equipmentCode === eq.code) && b.status === 'ACTIVE'))
            : null;

          // Resolve active maintenance ticket if in maintenance
          const activeTicket = eq.status === 'MAINTENANCE'
            ? maintenanceList.find(m => (m.equipmentId === eq.id || m.equipmentCode === eq.code) && m.status !== 'COMPLETED')
            : null;

          return (
            <div
              key={eq.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-4 shadow-sm space-y-3 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                {/* Top Row: Code & Status */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 px-2.5 py-1 rounded-lg">
                    {eq.code}
                  </span>
                  {getStatusBadge(eq.status)}
                </div>

                {/* Title, Brand, Model, S/N, DN */}
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm line-clamp-1">{eq.name}</h3>
                  <p className="text-xs text-teal-600 dark:text-teal-300/90 font-medium mt-0.5">
                    ยี่ห้อ: {eq.brand} | รุ่น: {eq.model}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono mt-1 text-slate-700 dark:text-slate-300">
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      S/N: {eq.serialNumber}
                    </span>
                    {eq.productCode && (
                      <span className="bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800 font-bold">
                        รหัสสินค้า: {eq.productCode}
                      </span>
                    )}
                    <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 font-bold">
                      DN: {eq.dnNumber || '-'}
                    </span>
                  </div>
                </div>

                {/* ACTIVE STATUS HIGHLIGHT CARD (Show who borrowed or maintenance reason) */}
                {eq.status === 'BORROWED' && activeBorrow && (
                  <div className="p-2.5 bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800/80 rounded-xl text-xs space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between text-sky-900 dark:text-sky-200 font-bold border-b border-sky-200/80 dark:border-sky-800/60 pb-1">
                      <span className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300">
                        <ArrowLeftRight className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                        <span>ถูกยืมอยู่โดย</span>
                      </span>
                      <span className="text-[10px] bg-sky-200/80 dark:bg-sky-800/80 text-sky-900 dark:text-sky-100 px-2 py-0.5 rounded-full font-mono font-bold">
                        {calculateDaysBorrowed(activeBorrow.borrowDate)} วันแล้ว
                      </span>
                    </div>
                    
                    <div className="space-y-0.5 text-slate-800 dark:text-slate-200 pt-0.5">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400">ผู้ป่วย / ผู้ยืม:</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{activeBorrow.patientName || activeBorrow.borrowerStaffName}</span>
                      </div>
                      {activeBorrow.patientPhone && (
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400">เบอร์ติดต่อ:</span>
                          <span className="font-mono font-semibold text-sky-700 dark:text-sky-300">{activeBorrow.patientPhone}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400">วอร์ด / จุดใช้งาน:</span>
                        <span className="font-bold text-teal-700 dark:text-teal-300">{activeBorrow.locationWard || activeBorrow.hospitalName || 'ไม่ระบุ'}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] pt-1 border-t border-sky-100 dark:border-sky-900/40 text-slate-500 dark:text-slate-400">
                        <span>วันที่ยืม: <strong className="text-slate-700 dark:text-slate-300">{activeBorrow.borrowDate}</strong></span>
                        <span>ผู้ทำรายการ: <strong className="text-slate-700 dark:text-slate-300">{activeBorrow.saleName || activeBorrow.borrowerStaffName || '-'}</strong></span>
                      </div>
                    </div>
                  </div>
                )}

                {eq.status === 'MAINTENANCE' && (
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 rounded-xl text-xs space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between text-rose-900 dark:text-rose-200 font-bold border-b border-rose-200/80 dark:border-rose-800/60 pb-1">
                      <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
                        <Wrench className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                        <span>สถานะส่งซ่อม {activeTicket ? `[${activeTicket.ticketNo}]` : ''}</span>
                      </span>
                      <span className="text-[10px] bg-rose-200/80 dark:bg-rose-900/80 text-rose-900 dark:text-rose-100 px-2 py-0.5 rounded-full font-bold">
                        {activeTicket ? (activeTicket.status === 'PENDING' ? 'รอดำเนินการ' : activeTicket.status === 'IN_PROGRESS' ? 'กำลังซ่อม' : 'รออะไหล่') : 'ส่งซ่อม'}
                      </span>
                    </div>
                    
                    <div className="space-y-0.5 text-slate-800 dark:text-slate-200 pt-0.5">
                      <div className="text-[11px] text-slate-700 dark:text-slate-300">
                        <span className="text-slate-500 dark:text-slate-400">อาการเสีย: </span>
                        <strong className="font-medium">{activeTicket?.symptom || 'ส่งซ่อมบำรุง/แก้ไข'}</strong>
                      </div>
                      {activeTicket && (
                        <div className="flex justify-between items-center text-[10px] pt-1 border-t border-rose-100 dark:border-rose-900/40 text-slate-500 dark:text-slate-400">
                          <span>แจ้งโดย: {activeTicket.reporterName}</span>
                          <span>วันที่แจ้ง: {activeTicket.reportedDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {eq.status === 'AVAILABLE' && (
                  <div className="p-2 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-xs text-emerald-900 dark:text-emerald-300 flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>พร้อมยืมใช้งาน (ประจำที่: {eq.department})</span>
                    </span>
                  </div>
                )}

                {/* Department & PM Dates */}
                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex justify-between">
                    <span>แผนกประจำเครื่อง:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{eq.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>รอบ PM ถัดไป:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-mono">{eq.nextPmDate || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>รอบ Calibration:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-mono">{eq.nextCalDate || '-'}</span>
                  </div>
                </div>
              </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1.5">
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEditForm(eq)}
                  className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs flex items-center gap-1 transition-all font-semibold"
                  title="แก้ไขข้อมูล"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span className="text-[11px]">แก้ไข</span>
                </button>
                {!isReadOnly && (
                  <button
                    onClick={() => handleDeleteSingle(eq)}
                    className="p-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-lg text-xs flex items-center gap-1 transition-all font-semibold"
                    title="ลบเครื่องมือแพทย์นี้"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="text-[11px]">ลบ</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {eq.status === 'AVAILABLE' && (
                  <button
                    onClick={() => onOpenBorrowModal(eq)}
                    className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-lg text-xs transition-all shadow-sm"
                  >
                    ยืมเครื่อง
                  </button>
                )}

                {eq.status === 'BORROWED' && eq.currentBorrowRecord && (
                  <button
                    onClick={() => onOpenReturnModal(eq.currentBorrowRecord)}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs transition-all shadow-sm"
                  >
                    รับคืน
                  </button>
                )}

                <button
                  onClick={() => onOpenEquipmentDetail(eq)}
                  className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium rounded-lg text-xs transition-all"
                >
                  รายละเอียด
                </button>
              </div>

            </div>
          </div>
        );
      })}
      </div>

      {/* Add / Edit Equipment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl p-5 sm:p-6 shadow-2xl text-slate-900 dark:text-slate-200 my-8 transition-all">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <span>{editingEquipment ? 'แก้ไขข้อมูลเครื่องมือแพทย์' : 'ลงทะเบียนเครื่องมือแพทย์ใหม่'}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              
              {/* Master Catalog Selector Box */}
              <div className="p-3 bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-teal-900 dark:text-teal-300 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-teal-600" />
                    <span>คลิกเลือกจาก Master Catalog (เพื่อชื่อ ยี่ห้อ รุ่น ที่เป็นมาตรฐาน)</span>
                  </label>
                  {onOpenMasterCatalogModal && (
                    <button
                      type="button"
                      onClick={onOpenMasterCatalogModal}
                      className="text-[11px] text-teal-700 dark:text-teal-300 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>⚙️ จัดการ Catalog</span>
                    </button>
                  )}
                </div>

                <select
                  onChange={(e) => {
                    const catId = e.target.value;
                    if (!catId) return;
                    const item = catalog.find((c) => c.id === catId);
                    if (item) {
                      setFormData((prev) => ({
                        ...prev,
                        name: item.name,
                        brand: item.brand,
                        model: item.model,
                        productCode: item.productCode || prev.productCode || '',
                        category: item.category || prev.category,
                        pmFrequencyMonths: item.defaultPmMonths || prev.pmFrequencyMonths,
                        calFrequencyMonths: item.defaultCalMonths || prev.calFrequencyMonths,
                      }));
                    }
                  }}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-teal-300 dark:border-teal-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">-- คลิกเลือกชื่อ ยี่ห้อ รุ่น มาตรฐาน จากคลัง Catalog --</option>
                  {catalog.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.productCode ? `[รหัส: ${cat.productCode}] ` : ''}{cat.name} | ยี่ห้อ: {cat.brand} | รุ่น: {cat.model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Code (Auto generated) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    รหัสเครื่อง (Equipment Code)
                  </label>
                  <input
                    type="text"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-teal-700 dark:text-teal-400 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="EQ000001"
                    required
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-0.5">* รหัสสร้างอัตโนมัติเรียงตามลำดับ</p>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    ชื่อเครื่องมือแพทย์ *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="เช่น เครื่องช่วยหายใจ, Infusion Pump"
                    required
                  />
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">ยี่ห้อ (Brand) *</label>
                  <input
                    type="text"
                    value={formData.brand || ''}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="เช่น Mindray, Hamilton, Terumo"
                    required
                  />
                </div>

                {/* Model */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">รุ่น (Model) *</label>
                  <input
                    type="text"
                    value={formData.model || ''}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="เช่น TE-LM800, T1, N12"
                    required
                  />
                </div>

                {/* Serial Number, Product Code & DN */}
                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Serial Number (S/N) *
                    </label>
                    <input
                      type="text"
                      value={formData.serialNumber || ''}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="เช่น SN-883011"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-700 dark:text-purple-400 mb-1">
                      รหัสสินค้า (Product Code)
                    </label>
                    <input
                      type="text"
                      value={formData.productCode || ''}
                      onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                      className="w-full px-3 py-2 bg-purple-50/50 dark:bg-slate-900 border border-purple-300 dark:border-purple-800 rounded-xl text-xs text-purple-900 dark:text-purple-200 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="เช่น PRD-90214 / SKU-102"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-700 dark:text-blue-400 mb-1">
                      รหัส DN (Delivery Note)
                    </label>
                    <input
                      type="text"
                      value={formData.dnNumber || ''}
                      onChange={(e) => setFormData({ ...formData, dnNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-blue-50/50 dark:bg-slate-900 border border-blue-300 dark:border-blue-800 rounded-xl text-xs text-blue-900 dark:text-blue-200 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="เช่น DN-2026/089"
                    />
                  </div>
                </div>

                {/* Department / Storage */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">แผนก / คลังจัดเก็บ</label>
                  <input
                    type="text"
                    value={formData.department || ''}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="เช่น คลังเครื่องมือกลาง, ICU, Homecare"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">สถานะเครื่อง</label>
                  <select
                    value={formData.status || 'AVAILABLE'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as EquipmentStatus })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="AVAILABLE">พร้อมใช้งาน (Available)</option>
                    <option value="BORROWED">ถูกยืมอยู่ (Borrowed)</option>
                    <option value="MAINTENANCE">ส่งซ่อม (Maintenance)</option>
                    <option value="CALIBRATION_DUE">ถึงรอบ PM/Cal</option>
                  </select>
                </div>

                {/* PM Freq & Last PM Date */}
                <div className="sm:col-span-2 p-3 bg-blue-50/70 dark:bg-blue-950/30 border-2 border-blue-300 dark:border-blue-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>การบำรุงรักษาเชิงป้องกัน (PM Schedule)</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, lastPmDate: '', nextPmDate: '' })}
                      className="text-[11px] text-slate-500 hover:text-rose-600 dark:text-slate-400 font-bold bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700"
                      title="ไม่ระบุวัน PM (-)"
                    >
                      ล้างวัน PM / ไม่ระบุ (-)
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">ความถี่ทำ PM</label>
                      <select
                        value={formData.pmFrequencyMonths || 6}
                        onChange={(e) => {
                          const freq = Number(e.target.value);
                          const lastDate = formData.lastPmDate;
                          setFormData({ 
                            ...formData, 
                            pmFrequencyMonths: freq,
                            nextPmDate: lastDate ? calcNextDate(lastDate, freq) : ''
                          });
                        }}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={3}>ทุก 3 เดือน</option>
                        <option value={6}>ทุก 6 เดือน</option>
                        <option value={12}>ทุก 12 เดือน (1 ปี)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">ทำ PM ล่าสุดเมื่อ</label>
                      <input
                        type="date"
                        value={formData.lastPmDate || ''}
                        onChange={(e) => {
                          const lastDate = e.target.value;
                          const freq = formData.pmFrequencyMonths || 6;
                          setFormData({ 
                            ...formData, 
                            lastPmDate: lastDate,
                            nextPmDate: lastDate ? calcNextDate(lastDate, freq) : ''
                          });
                        }}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-blue-900 dark:text-blue-300 mb-1">
                        รอบ PM ครั้งถัดไป
                      </label>
                      <input
                        type="date"
                        value={formData.nextPmDate || ''}
                        onChange={(e) => setFormData({ ...formData, nextPmDate: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border-2 border-blue-500 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Cal Freq & Last Cal Date */}
                <div className="sm:col-span-2 p-3 bg-indigo-50/70 dark:bg-indigo-950/30 border-2 border-indigo-300 dark:border-indigo-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-indigo-600" />
                      <span>การสอบเทียบความแม่นยำ (Calibration Schedule)</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, lastCalDate: '', nextCalDate: '' })}
                      className="text-[11px] text-slate-500 hover:text-rose-600 dark:text-slate-400 font-bold bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700"
                      title="ไม่ระบุวัน Calibration (-)"
                    >
                      ล้างวัน Cal / ไม่ระบุ (-)
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">ความถี่ Calibration</label>
                      <select
                        value={formData.calFrequencyMonths || 12}
                        onChange={(e) => {
                          const freq = Number(e.target.value);
                          const lastDate = formData.lastCalDate;
                          setFormData({ 
                            ...formData, 
                            calFrequencyMonths: freq,
                            nextCalDate: lastDate ? calcNextDate(lastDate, freq) : ''
                          });
                        }}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value={6}>ทุก 6 เดือน</option>
                        <option value={12}>ทุก 12 เดือน (1 ปี)</option>
                        <option value={24}>ทุก 24 เดือน (2 ปี)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">ทำ Cal ล่าสุดเมื่อ</label>
                      <input
                        type="date"
                        value={formData.lastCalDate || ''}
                        onChange={(e) => {
                          const lastDate = e.target.value;
                          const freq = formData.calFrequencyMonths || 12;
                          setFormData({ 
                            ...formData, 
                            lastCalDate: lastDate,
                            nextCalDate: lastDate ? calcNextDate(lastDate, freq) : ''
                          });
                        }}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-indigo-900 dark:text-indigo-300 mb-1">
                        รอบ Cal ครั้งถัดไป
                      </label>
                      <input
                        type="date"
                        value={formData.nextCalDate || ''}
                        onChange={(e) => setFormData({ ...formData, nextCalDate: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border-2 border-indigo-500 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">หมายเหตุ / อุปกรณ์ประกอบ</label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="รายละเอียดเพิ่มเติม เช่น มีเสาแขวน, ปลั๊กพกพา"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <div>
                  {editingEquipment && !isReadOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        handleDeleteSingle(editingEquipment);
                        setIsAddModalOpen(false);
                      }}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 font-bold rounded-xl text-xs border border-rose-200 dark:border-rose-800 flex items-center gap-1.5 transition-all shadow-2xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ลบเครื่องนี้</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl text-xs shadow-md transition-all"
                  >
                    บันทึกข้อมูล
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModalConfig.isOpen}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        onConfirm={confirmModalConfig.onConfirm}
        onClose={() => setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
};
