import React, { useState } from 'react';
import { 
  PackageCheck, 
  ArrowLeftRight, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  PhoneCall, 
  Calendar, 
  Clock, 
  Eye, 
  Phone,
  PhoneOff,
  Search,
  ExternalLink,
  ShieldAlert,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { Equipment, BorrowRecord } from '../types';
import { calculateDaysBorrowed } from '../services/storage';

interface DashboardProps {
  equipmentList: Equipment[];
  borrowRecords: BorrowRecord[];
  onOpenEquipmentDetail: (equipment: Equipment) => void;
  onOpenBorrowModal: (equipment: Equipment) => void;
  onOpenReturnModal: (borrow: BorrowRecord) => void;
  onOpenCustomerCallModal: (borrow: BorrowRecord) => void;
  onOpenRecordPMModal: (equipment: Equipment) => void;
  onNavigateToTab: (tab: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  equipmentList,
  borrowRecords,
  onOpenEquipmentDetail,
  onOpenBorrowModal,
  onOpenReturnModal,
  onOpenCustomerCallModal,
  onOpenRecordPMModal,
  onNavigateToTab,
}) => {
  const now = new Date();
  const currentMonthValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  // Selected Month State ('ALL' or 'YYYY-MM')
  const [selectedMonthStr, setSelectedMonthStr] = useState<string>(currentMonthValue);
  const todayStr = now.toISOString().split('T')[0];

  const isAllTime = selectedMonthStr === 'ALL';

  // Helper for formatted Thai Date representation
  let formattedMonthTitle = 'ข้อมูลทั้งหมดในระบบ (All Time)';
  if (!isAllTime) {
    const [y, m] = selectedMonthStr.split('-').map(Number);
    const selectedDateObj = new Date(y, m - 1, 1);
    formattedMonthTitle = selectedDateObj.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
  }

  // Handle previous/next month navigation
  const handlePrevMonth = () => {
    if (isAllTime) {
      setSelectedMonthStr(currentMonthValue);
      return;
    }
    const [y, m] = selectedMonthStr.split('-').map(Number);
    let newY = y;
    let newM = m - 1;
    if (newM < 1) {
      newM = 12;
      newY -= 1;
    }
    setSelectedMonthStr(`${newY}-${String(newM).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    if (isAllTime) {
      setSelectedMonthStr(currentMonthValue);
      return;
    }
    const [y, m] = selectedMonthStr.split('-').map(Number);
    let newY = y;
    let newM = m + 1;
    if (newM > 12) {
      newM = 1;
      newY += 1;
    }
    setSelectedMonthStr(`${newY}-${String(newM).padStart(2, '0')}`);
  };

  // Generate list of available months for selection
  const monthOptions = [
    { value: 'ALL', label: 'ข้อมูลทั้งหมดในระบบ (All Time)' }
  ];
  for (let i = -18; i <= 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthOptions.push({
      value: val,
      label: d.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' }),
    });
  }

  // Key metrics
  const totalEquipment = equipmentList.length;
  const availableInStock = equipmentList.filter((e) => e.status === 'AVAILABLE').length;
  const currentlyBorrowed = equipmentList.filter((e) => e.status === 'BORROWED').length;
  const maintenanceCount = equipmentList.filter((e) => e.status === 'MAINTENANCE' || e.status === 'OUT_OF_SERVICE').length;

  // Filtered PM/CAL due based on selected month / ALL
  const pmCalDueFiltered = equipmentList.filter((e) => {
    if (isAllTime) {
      return Boolean(e.nextPmDate || e.nextCalDate);
    }
    const isPmThisMonth = e.nextPmDate && e.nextPmDate.substring(0, 7) === selectedMonthStr;
    const isCalThisMonth = e.nextCalDate && e.nextCalDate.substring(0, 7) === selectedMonthStr;
    const isOverduePm = selectedMonthStr === currentMonthValue && e.nextPmDate && e.nextPmDate < todayStr;
    const isOverdueCal = selectedMonthStr === currentMonthValue && e.nextCalDate && e.nextCalDate < todayStr;
    return isPmThisMonth || isCalThisMonth || isOverduePm || isOverdueCal;
  });

  // Filtered Borrow Records based on selected month / ALL
  const filteredBorrows = borrowRecords.filter((b) => {
    if (isAllTime) return true;
    const inBorrowMonth = b.borrowDate && b.borrowDate.substring(0, 7) === selectedMonthStr;
    const inReturnMonth = b.actualReturnDate && b.actualReturnDate.substring(0, 7) === selectedMonthStr;
    const inExpectedMonth = b.expectedReturnDate && b.expectedReturnDate.substring(0, 7) === selectedMonthStr;
    return inBorrowMonth || inReturnMonth || inExpectedMonth;
  });

  // Active borrowed records (overall)
  const activeBorrows = borrowRecords.filter((b) => b.status === 'ACTIVE');

  // Categories breakdown
  const categoryCounts: Record<string, { total: number; available: number }> = {};
  equipmentList.forEach((e) => {
    const cat = e.category || 'อื่นๆ';
    if (!categoryCounts[cat]) {
      categoryCounts[cat] = { total: 0, available: 0 };
    }
    categoryCounts[cat].total += 1;
    if (e.status === 'AVAILABLE') {
      categoryCounts[cat].available += 1;
    }
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Date Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs text-slate-900 dark:text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Dashboard - สรุปภาพรวมระบบเครื่องมือแพทย์
            </h1>
            
            {/* Interactive Month/Year Badge & Navigation */}
            <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2 py-1 rounded-xl shadow-xs">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 hover:bg-blue-200/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-lg transition-all"
                title="เดือนก่อนหน้า"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 text-xs font-bold text-blue-800 dark:text-blue-200">
                <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <select
                  value={selectedMonthStr}
                  onChange={(e) => setSelectedMonthStr(e.target.value)}
                  className="bg-transparent text-xs font-bold text-blue-900 dark:text-blue-200 cursor-pointer focus:outline-none py-0.5"
                >
                  {monthOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-white text-slate-900 font-medium">
                      {opt.value === 'ALL' ? opt.label : `ประจำเดือน ${opt.label}`}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 hover:bg-blue-200/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-lg transition-all"
                title="เดือนถัดไป"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            สรุปสถิติมุมมองข้อมูล <span className="font-bold text-blue-700 dark:text-blue-300">{formattedMonthTitle}</span> - คุณสามารถคลิกลูกศรหรือเลือกช่วงเวลาจากตัวเลือกเพื่อดูข้อมูลย้อนหลังหรือดูข้อมูลทั้งหมดได้
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToTab('borrows')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-all"
          >
            ค้นหาเครื่องยืม
          </button>
          <button
            onClick={() => onNavigateToTab('equipment')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
          >
            ดูทะเบียนทั้งหมด
          </button>
        </div>
      </div>

      {/* Metric Cards Grid - Soft Pastel Clinical Palette */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Total Devices */}
        <div className="bg-white dark:bg-slate-900 border border-blue-200/90 dark:border-blue-900/60 rounded-2xl p-4 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">เครื่องมือทั้งหมด</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 rounded-xl border border-blue-100 dark:border-blue-900">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{totalEquipment}</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">ในระบบคลังเครื่องมือ</p>
        </div>

        {/* Available in Stock */}
        <div className="bg-white dark:bg-slate-900 border border-emerald-200/90 dark:border-emerald-900/60 rounded-2xl p-4 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">คงเหลือที่สต๊อก</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 rounded-xl border border-emerald-100 dark:border-emerald-900">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{availableInStock}</div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-500/80 mt-1 font-medium">
            พร้อมส่งมอบ ({totalEquipment > 0 ? Math.round((availableInStock / totalEquipment) * 100) : 0}%)
          </p>
        </div>

        {/* Currently Borrowed */}
        <div className="bg-white dark:bg-slate-900 border border-sky-200/90 dark:border-sky-900/60 rounded-2xl p-4 shadow-xs hover:border-sky-300 transition-all">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">ถูกยืมไปใช้งาน</span>
            <div className="p-2 bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-300 rounded-xl border border-sky-100 dark:border-sky-900">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-sky-700 dark:text-sky-400">{currentlyBorrowed}</div>
          <p className="text-[11px] text-sky-600 dark:text-sky-300/80 mt-1 font-medium">อยู่กับคนไข้ / หอผู้ป่วย</p>
        </div>

        {/* PM / CAL Due */}
        <div className="bg-white dark:bg-slate-900 border border-amber-200/90 dark:border-amber-900/60 rounded-2xl p-4 shadow-xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {isAllTime ? 'รอบ PM/Cal ทั้งหมด' : 'รอบ PM/Cal ช่วงนี้'}
            </span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-300 rounded-xl border border-amber-100 dark:border-amber-900">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{pmCalDueFiltered.length}</div>
          <p className="text-[11px] text-amber-600 dark:text-amber-300/80 mt-1 font-medium">
            {isAllTime ? 'มีรอบตรวจในระบบ' : 'ต้องตรวจเช็คสภาพ'}
          </p>
        </div>

        {/* Maintenance / Broken */}
        <div className="bg-white dark:bg-slate-900 border border-rose-200/90 dark:border-rose-900/60 rounded-2xl p-4 shadow-xs hover:border-rose-300 transition-all col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">ส่งซ่อม / ชำรุด</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 rounded-xl border border-rose-100 dark:border-rose-900">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-700 dark:text-rose-400">{maintenanceCount}</div>
          <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">อยู่ระหว่างส่งซ่อมบริษัท</p>
        </div>

      </div>

      {/* SECTION 1: รายการยืม-คืน ในช่วงเวลาที่เลือก / ทั้งหมด */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <span>
                {isAllTime
                  ? `ประวัติรายการยืม-คืน ทั้งหมดในระบบ (${filteredBorrows.length} รายการ)`
                  : `รายการยืม-คืน ประจำเดือน ${formattedMonthTitle} (${filteredBorrows.length} รายการ)`}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              แสดงรหัสเครื่อง ผู้ยืม คนไข้ สถานะการยืม/คืน และบันทึกการติดต่อติดตามผล
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('borrows')}
            className="text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>ดูรายการยืมทั้งหมด</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {filteredBorrows.length === 0 ? (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
            ไม่มีประวัติรายการยืม-คืนในช่วงเวลาที่เลือก
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50">
                  <th className="py-3 px-3 font-semibold">รหัสเครื่อง / ชื่อเครื่อง</th>
                  <th className="py-3 px-3 font-semibold">ผู้ยืม (พนักงาน)</th>
                  <th className="py-3 px-3 font-semibold">ชื่อคนไข้ & เบอร์โทร</th>
                  <th className="py-3 px-3 font-semibold">วันยืม & กำหนดคืน</th>
                  <th className="py-3 px-3 font-semibold">สถานะการยืม</th>
                  <th className="py-3 px-3 font-semibold">สถานะการติดต่อติดตาม</th>
                  <th className="py-3 px-3 font-semibold text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredBorrows.map((borrow) => {
                  const daysElapsed = calculateDaysBorrowed(borrow.borrowDate);
                  const isOverdue = borrow.status === 'ACTIVE' && borrow.expectedReturnDate < todayStr;
                  const eq = equipmentList.find((e) => e.id === borrow.equipmentId);

                  return (
                    <tr key={borrow.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                      {/* Code & Name */}
                      <td className="py-3 px-3">
                        <div className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 px-2 py-0.5 rounded inline-block mb-1">
                          {borrow.equipmentCode}
                        </div>
                        <div className="font-medium text-slate-900 dark:text-slate-200 text-xs line-clamp-1">
                          {borrow.equipmentName}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          สถานที่: {borrow.locationWard}
                        </div>
                      </td>

                      {/* Borrower */}
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                        <div className="font-medium">{borrow.borrowerStaffName}</div>
                      </td>

                      {/* Patient & Phone */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{borrow.patientName}</div>
                        <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{borrow.patientPhone}</span>
                        </div>
                      </td>

                      {/* Borrow Date & Return Date */}
                      <td className="py-3 px-3">
                        <div className="text-slate-600 dark:text-slate-300">เริ่ม: {borrow.borrowDate}</div>
                        {borrow.status === 'RETURNED' ? (
                          <div className="text-emerald-600 dark:text-emerald-400 font-medium">
                            คืนแล้ว: {borrow.actualReturnDate}
                          </div>
                        ) : (
                          <div className={`font-medium ${isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                            กำหนดคืน: {borrow.expectedReturnDate} {isOverdue && '(เกินกำหนด!)'}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        {borrow.status === 'RETURNED' ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>คืนเรียบร้อย</span>
                          </span>
                        ) : (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                            daysElapsed > 14 
                              ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30' 
                              : 'bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30'
                          }`}>
                            <Clock className="w-3 h-3" />
                            <span>ยืมอยู่ ({daysElapsed} วัน)</span>
                          </span>
                        )}
                      </td>

                      {/* Call Status */}
                      <td className="py-3 px-3">
                        {borrow.isCustomerCalled ? (
                          <div className="flex flex-col gap-1 items-start">
                            <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 rounded-full text-[11px] font-semibold flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span>โทรติดตามแล้ว</span>
                            </span>
                            {borrow.lastCallDate && (
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">{borrow.lastCallDate}</span>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1 items-start">
                            <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 rounded-full text-[11px] font-semibold flex items-center gap-1">
                              <PhoneOff className="w-3 h-3" />
                              <span>ยังไม่ได้โทร</span>
                            </span>
                            {borrow.status === 'ACTIVE' && (
                              <button
                                onClick={() => onOpenCustomerCallModal(borrow)}
                                className="text-[10px] text-teal-600 dark:text-teal-400 hover:underline font-medium"
                              >
                                + บันทึกการโทร
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {borrow.status === 'ACTIVE' && (
                            <button
                              onClick={() => onOpenReturnModal(borrow)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs transition-all shadow-sm"
                            >
                              รับคืน
                            </button>
                          )}
                          <button
                            onClick={() => eq && onOpenEquipmentDetail(eq)}
                            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-all"
                            title="ดูรายละเอียดเครื่อง"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2: รอบ PM / CAL ในช่วงเวลาที่เลือก / ทั้งหมด */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>
                {isAllTime
                  ? `รอบ PM / Calibration ทั้งหมดในระบบ (${pmCalDueFiltered.length} เครื่อง)`
                  : `รอบ PM / Calibration ประจำเดือน ${formattedMonthTitle} (${pmCalDueFiltered.length} เครื่อง)`}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              เครื่องมือแพทย์ที่ถึงกำหนดส่งตรวจเช็คบำรุงรักษา หรือสอบเทียบความแม่นยำในช่วงเวลาที่เลือก
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('pm_cal')}
            className="text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>จัดการ PM/Cal ทั้งหมด</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {pmCalDueFiltered.length === 0 ? (
          <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-sm">
            ไม่มีเครื่องมือแพทย์ที่ถึงรอบ PM/Cal ในช่วงเวลาที่เลือก
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pmCalDueFiltered.map((eq) => {
              const isPmDue = eq.nextPmDate && eq.nextPmDate.substring(0, 7) === selectedMonthStr;
              const isCalDue = eq.nextCalDate && eq.nextCalDate.substring(0, 7) === selectedMonthStr;
              const isOverduePm = eq.nextPmDate && eq.nextPmDate < todayStr;
              const isOverdueCal = eq.nextCalDate && eq.nextCalDate < todayStr;

              return (
                <div
                  key={eq.id}
                  className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl space-y-3 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 px-2 py-0.5 rounded">
                        {eq.code}
                      </span>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mt-1.5 line-clamp-1">{eq.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{eq.brand} - {eq.model}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                      {eq.department}
                    </span>
                  </div>

                  {/* Due Dates breakdown */}
                  <div className="space-y-1 text-xs pt-1 border-t border-slate-200 dark:border-slate-800/80">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">รอบ PM:</span>
                      <span className={`font-mono ${isOverduePm ? 'text-rose-600 dark:text-rose-400 font-bold' : isPmDue ? 'text-amber-600 dark:text-amber-300 font-semibold' : 'text-slate-700 dark:text-slate-300'}`}>
                        {eq.nextPmDate || '-'} {isOverduePm && '(เลยกำหนด!)'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">รอบ Calibration:</span>
                      <span className={`font-mono ${isOverdueCal ? 'text-rose-600 dark:text-rose-400 font-bold' : isCalDue ? 'text-amber-600 dark:text-amber-300 font-semibold' : 'text-slate-700 dark:text-slate-300'}`}>
                        {eq.nextCalDate || '-'} {isOverdueCal && '(เลยกำหนด!)'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => onOpenRecordPMModal(eq)}
                      className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg text-xs transition-all flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>บันทึก PM/Cal แล้ว</span>
                    </button>
                    <button
                      onClick={() => onOpenEquipmentDetail(eq)}
                      className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs transition-all"
                    >
                      รายละเอียด
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 3: สต๊อกคงเหลือตามหมวดหมู่ */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <PackageCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>คงเหลือที่สต๊อกแยกตามหมวดหมู่ (Stock Availability)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(categoryCounts).map(([catName, stats]) => {
            const availPercent = stats.total > 0 ? Math.round((stats.available / stats.total) * 100) : 0;
            return (
              <div
                key={catName}
                className="p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs truncate max-w-[150px]">
                    {catName}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {stats.available} / {stats.total} เครื่อง
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all rounded-full"
                    style={{ width: `${availPercent}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>พร้อมยืม: {stats.available}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{availPercent}% สต๊อก</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
