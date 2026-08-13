import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  Search, 
  Phone, 
  PhoneCall, 
  PhoneOff, 
  Clock, 
  Calendar, 
  User, 
  MapPin, 
  CheckCircle2, 
  Plus, 
  History,
  Eye,
  AlertTriangle,
  Building2,
  UserCheck,
  Trash2
} from 'lucide-react';
import { BorrowRecord, Equipment, User as UserType } from '../types';
import { calculateDaysBorrowed } from '../services/storage';
import { ConfirmModal } from './ConfirmModal';

interface BorrowListProps {
  borrowRecords: BorrowRecord[];
  equipmentList: Equipment[];
  currentUser?: UserType;
  onOpenBorrowModalForDevice: () => void;
  onOpenReturnModal: (borrow: BorrowRecord) => void;
  onOpenCustomerCallModal: (borrow: BorrowRecord) => void;
  onToggleCustomerCallStatus: (borrowId: string, called: boolean) => void;
  onOpenEquipmentDetail: (equipment: Equipment) => void;
  onDeleteBorrowRecord?: (borrowId: string) => void;
}

export const BorrowList: React.FC<BorrowListProps> = ({
  borrowRecords,
  equipmentList,
  currentUser,
  onOpenBorrowModalForDevice,
  onOpenReturnModal,
  onOpenCustomerCallModal,
  onToggleCustomerCallStatus,
  onOpenEquipmentDetail,
  onDeleteBorrowRecord,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'RETURNED' | 'PENDING_CALL'>('ALL');
  const [deletingBorrow, setDeletingBorrow] = useState<BorrowRecord | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredBorrows = borrowRecords.filter((b) => {
    const query = search.toLowerCase();
    const matchesSearch =
      b.equipmentCode.toLowerCase().includes(query) ||
      b.equipmentName.toLowerCase().includes(query) ||
      (b.hospitalName && b.hospitalName.toLowerCase().includes(query)) ||
      (b.saleName && b.saleName.toLowerCase().includes(query)) ||
      (b.salePhone && b.salePhone.toLowerCase().includes(query)) ||
      b.patientName.toLowerCase().includes(query) ||
      b.patientPhone.toLowerCase().includes(query) ||
      b.borrowerStaffName.toLowerCase().includes(query) ||
      b.locationWard.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (statusFilter === 'ACTIVE') return b.status === 'ACTIVE';
    if (statusFilter === 'RETURNED') return b.status === 'RETURNED';
    if (statusFilter === 'PENDING_CALL') return b.status === 'ACTIVE' && !b.isCustomerCalled;

    return true;
  });

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <span>ระบบยืม-คืน & ติดตามสอบถามอาการคนไข้</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ค้นหาข้อมูลตามชื่อโรงพยาบาล, ชื่อ SALE, เบอร์ SALE, ชื่อคนไข้, เบอร์คนไข้, วันที่ยืม และสถานะการติดตามผล
          </p>
        </div>

        <button
          onClick={onOpenBorrowModalForDevice}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ ทำรายการยืมเครื่องใหม่</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาตามโรงพยาบาล, ชื่อ SALE, เบอร์ SALE, ชื่อคนไข้, รหัสเครื่อง..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white text-slate-900 placeholder:text-slate-500 border-2 border-slate-300 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 text-xs flex-wrap">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-2 rounded-xl font-medium transition-all ${
              statusFilter === 'ALL' 
                ? 'bg-sky-600 text-white font-bold' 
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            ประวัติยืมทั้งหมด ({borrowRecords.length})
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-2 rounded-xl font-medium transition-all ${
              statusFilter === 'ACTIVE' 
                ? 'bg-sky-600 text-white font-bold' 
                : 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            กำลังยืมอยู่
          </button>
          <button
            onClick={() => setStatusFilter('PENDING_CALL')}
            className={`px-3 py-2 rounded-xl font-medium transition-all ${
              statusFilter === 'PENDING_CALL' 
                ? 'bg-amber-600 text-white font-bold' 
                : 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            ยังไม่ได้โทรติดตาม
          </button>
        </div>
      </div>

      {/* Borrow Cards / List */}
      <div className="space-y-3">
        {filteredBorrows.map((borrow) => {
          const daysElapsed = calculateDaysBorrowed(borrow.borrowDate);
          const isOverdue = borrow.status === 'ACTIVE' && borrow.expectedReturnDate < todayStr;
          const eq = equipmentList.find((e) => e.id === borrow.equipmentId);

          return (
            <div
              key={borrow.id}
              className={`p-4 bg-white dark:bg-slate-900 border rounded-2xl shadow-sm space-y-3 transition-all ${
                isOverdue
                  ? 'border-rose-300 dark:border-rose-800/80 bg-rose-50/20 dark:bg-slate-900/90'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Top Row: Code, Status, Days Elapsed */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 px-2.5 py-1 rounded-lg">
                    {borrow.equipmentCode}
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{borrow.equipmentName}</h3>
                </div>

                <div className="flex items-center gap-2">
                  {borrow.status === 'ACTIVE' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30">
                      กำลังยืมอยู่
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      คืนแล้วเมื่อ {borrow.actualReturnDate}
                    </span>
                  )}

                  {borrow.status === 'ACTIVE' && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                      daysElapsed > 14
                        ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
                        : 'bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30'
                    }`}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>ยืมไปแล้ว {daysElapsed} วัน</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Middle Row: Hospital & SALE, Patient Info, Location & Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                
                {/* 1. Hospital & Sale Info */}
                <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold">
                    <Building2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span>โรงพยาบาล & SALE ผู้ดูแล:</span>
                  </p>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">
                    {borrow.hospitalName || 'ไม่ระบุโรงพยาบาล'}
                  </p>
                  <div className="text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                    <p className="flex items-center gap-1 font-medium">
                      <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                      <span>SALE: {borrow.saleName || 'ไม่ระบุ'}</span>
                    </p>
                    {borrow.salePhone && (
                      <p className="text-slate-500 dark:text-slate-400 font-mono pl-4">
                        โทร: {borrow.salePhone}
                      </p>
                    )}
                  </div>
                </div>

                {/* 2. Patient & Borrower Info */}
                <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span>ข้อมูลคนไข้ & เบอร์โทร:</span>
                  </p>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{borrow.patientName}</p>
                  <p className="text-amber-700 dark:text-amber-300 font-mono font-bold flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>{borrow.patientPhone}</span>
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                    ผู้ยืม/บันทึก: <span className="text-slate-800 dark:text-slate-200 font-medium">{borrow.borrowerStaffName}</span>
                  </p>
                </div>

                {/* 3. Location & Borrow Dates */}
                <div className="space-y-1 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span>สถานที่ยืมไปใช้ / กำหนดคืน:</span>
                  </p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{borrow.locationWard}</p>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    วันยืม: <span className="text-slate-800 dark:text-slate-200 font-mono font-medium">{borrow.borrowDate}</span>
                  </p>
                  <p className={`font-mono ${isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                    กำหนดคืน: {borrow.expectedReturnDate} {isOverdue && '(เลยกำหนดแล้ว!)'}
                  </p>
                </div>

              </div>

              {/* Bottom Row: Customer Follow-up Call Status & Action Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">สถานะการโทรติดตามลูกค้า:</span>
                  {borrow.isCustomerCalled ? (
                    <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span>โทรติดตามเรียบร้อยแล้ว ({borrow.lastCallDate})</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 rounded-full text-xs font-semibold flex items-center gap-1">
                      <PhoneOff className="w-3 h-3" />
                      <span>ยังไม่ได้โทรติดตาม</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {borrow.status === 'ACTIVE' && (
                    <>
                      <button
                        onClick={() => onOpenCustomerCallModal(borrow)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl text-xs flex items-center gap-1 transition-all shadow-sm"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>+ บันทึกการโทรหาคนไข้</span>
                      </button>

                      <button
                        onClick={() => onOpenReturnModal(borrow)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition-all shadow-sm"
                      >
                        รับคืนเครื่อง
                      </button>
                    </>
                  )}

                  {eq && (
                    <button
                      onClick={() => onOpenEquipmentDetail(eq)}
                      className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs"
                      title="ดูรายละเอียดเครื่อง"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}

                  {onDeleteBorrowRecord && currentUser?.permissionRole !== 'VIEW_ONLY' && (
                    <button
                      onClick={() => setDeletingBorrow(borrow)}
                      className="p-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl text-xs transition-all"
                      title="ลบรายการยืมนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>

            </div>
          );
        })}
      </div>

      {/* Confirm Delete Modal */}
      {onDeleteBorrowRecord && (
        <ConfirmModal
          isOpen={!!deletingBorrow}
          title={`ยืนยันลบรายการยืม [${deletingBorrow?.equipmentCode || ''}]`}
          message={`คุณต้องการลบประวัติยืมเครื่อง [${deletingBorrow?.equipmentCode || ''}] ของคุณ ${deletingBorrow?.patientName || ''} ออกจากระบบใช่หรือไม่?`}
          onConfirm={() => {
            if (deletingBorrow) {
              onDeleteBorrowRecord(deletingBorrow.id);
            }
          }}
          onClose={() => setDeletingBorrow(null)}
        />
      )}

    </div>
  );
};
