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
  AlertTriangle
} from 'lucide-react';
import { BorrowRecord, Equipment } from '../types';
import { calculateDaysBorrowed } from '../services/storage';

interface BorrowListProps {
  borrowRecords: BorrowRecord[];
  equipmentList: Equipment[];
  onOpenBorrowModalForDevice: () => void;
  onOpenReturnModal: (borrow: BorrowRecord) => void;
  onOpenCustomerCallModal: (borrow: BorrowRecord) => void;
  onToggleCustomerCallStatus: (borrowId: string, called: boolean) => void;
  onOpenEquipmentDetail: (equipment: Equipment) => void;
}

export const BorrowList: React.FC<BorrowListProps> = ({
  borrowRecords,
  equipmentList,
  onOpenBorrowModalForDevice,
  onOpenReturnModal,
  onOpenCustomerCallModal,
  onToggleCustomerCallStatus,
  onOpenEquipmentDetail,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'RETURNED' | 'PENDING_CALL'>('ALL');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredBorrows = borrowRecords.filter((b) => {
    const matchesSearch =
      b.equipmentCode.toLowerCase().includes(search.toLowerCase()) ||
      b.equipmentName.toLowerCase().includes(search.toLowerCase()) ||
      b.patientName.toLowerCase().includes(search.toLowerCase()) ||
      b.patientPhone.toLowerCase().includes(search.toLowerCase()) ||
      b.borrowerStaffName.toLowerCase().includes(search.toLowerCase()) ||
      b.locationWard.toLowerCase().includes(search.toLowerCase());

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
            ค้นหาข้อมูลสถานที่ยืม วันที่ยืม จำนวนวันที่ยืม รอบ PM/Cal และสถานะการติดต่อติดตามผล
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
            placeholder="ค้นหาตามรหัส (EQ000001), ชื่อเครื่อง, ชื่อคนไข้, เบอร์โทร..."
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
                  <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 px-2.5 py-1 rounded-lg">
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

              {/* Middle Row: Patient Info, Location, Dates & PM Due */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                
                {/* Patient & Borrower */}
                <div className="space-y-1 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-slate-500 dark:text-slate-400">ข้อมูลคนไข้ & พนักงานผู้ยืม:</p>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{borrow.patientName}</p>
                  <p className="text-amber-700 dark:text-amber-300 font-mono flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>{borrow.patientPhone}</span>
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">ผู้ยืม: <span className="text-slate-800 dark:text-slate-200">{borrow.borrowerStaffName}</span></p>
                </div>

                {/* Location & Borrow Dates */}
                <div className="space-y-1 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-slate-500 dark:text-slate-400">สถานที่ยืมไปใช้:</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{borrow.locationWard}</p>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    วันยืม: <span className="text-slate-800 dark:text-slate-200 font-mono">{borrow.borrowDate}</span>
                  </p>
                  <p className={`font-mono ${isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                    กำหนดคืน: {borrow.expectedReturnDate} {isOverdue && '(เลยกำหนดแล้ว!)'}
                  </p>
                </div>

                {/* Next PM/Cal Date on device */}
                <div className="space-y-1 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-slate-500 dark:text-slate-400">ข้อมูล PM / Calibration เครื่อง:</p>
                  <p className="text-slate-800 dark:text-slate-200">
                    ยี่ห้อ/รุ่น: <span className="font-medium">{eq?.brand} {eq?.model}</span>
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    รอบ PM ถัดไป: <span className="text-amber-700 dark:text-amber-300 font-mono font-bold">{eq?.nextPmDate || '-'}</span>
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    รอบ Cal ถัดไป: <span className="text-amber-700 dark:text-amber-300 font-mono font-bold">{eq?.nextCalDate || '-'}</span>
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
                </div>

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
