import React, { useState } from 'react';
import { Wrench, Calendar, AlertTriangle, CheckCircle2, ShieldAlert, Search, Filter, Plus } from 'lucide-react';
import { Equipment, PMRecord } from '../types';

interface PMCalAlertsProps {
  equipmentList: Equipment[];
  pmRecords: PMRecord[];
  onOpenRecordPMModal: (equipment: Equipment) => void;
  onOpenEquipmentDetail: (equipment: Equipment) => void;
}

export const PMCalAlerts: React.FC<PMCalAlertsProps> = ({
  equipmentList,
  pmRecords,
  onOpenRecordPMModal,
  onOpenEquipmentDetail,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'OVERDUE' | 'THIS_MONTH' | 'UPCOMING'>('ALL');
  const [search, setSearch] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().toISOString().substring(0, 7);

  // Filter equipment based on PM/Cal status
  const pmEquipments = equipmentList.filter((eq) => {
    const isOverduePm = eq.nextPmDate && eq.nextPmDate < todayStr;
    const isOverdueCal = eq.nextCalDate && eq.nextCalDate < todayStr;
    const isThisMonthPm = eq.nextPmDate && eq.nextPmDate.substring(0, 7) === currentMonth;
    const isThisMonthCal = eq.nextCalDate && eq.nextCalDate.substring(0, 7) === currentMonth;

    const matchesSearch =
      eq.code.toLowerCase().includes(search.toLowerCase()) ||
      eq.name.toLowerCase().includes(search.toLowerCase()) ||
      eq.serialNumber.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'OVERDUE') return isOverduePm || isOverdueCal;
    if (filterType === 'THIS_MONTH') return isThisMonthPm || isThisMonthCal;
    if (filterType === 'UPCOMING') return !isOverduePm && !isOverdueCal && !isThisMonthPm && !isThisMonthCal;

    return true;
  });

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>ศูนย์การแจ้งเตือน PM & Calibration</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            วางแผนบำรุงรักษาเชิงป้องกัน ตรวจเช็คมาตรฐานเครื่องมือแพทย์ และบันทึกประวัติการสอบเทียบ
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              filterType === 'ALL' 
                ? 'bg-amber-600 text-white font-bold' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            ทั้งหมด ({equipmentList.length})
          </button>
          <button
            onClick={() => setFilterType('OVERDUE')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              filterType === 'OVERDUE' 
                ? 'bg-rose-600 text-white font-bold' 
                : 'bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-300'
            }`}
          >
            เกินกำหนด (Overdue)
          </button>
          <button
            onClick={() => setFilterType('THIS_MONTH')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              filterType === 'THIS_MONTH' 
                ? 'bg-amber-600 text-white font-bold' 
                : 'bg-slate-100 dark:bg-slate-800 text-amber-700 dark:text-amber-300'
            }`}
          >
            ครบรอบเดือนนี้
          </button>
        </div>
      </div>

      {/* Equipment PM List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pmEquipments.map((eq) => {
          const isOverduePm = eq.nextPmDate && eq.nextPmDate < todayStr;
          const isOverdueCal = eq.nextCalDate && eq.nextCalDate < todayStr;
          const isThisMonthPm = eq.nextPmDate && eq.nextPmDate.substring(0, 7) === currentMonth;
          const isThisMonthCal = eq.nextCalDate && eq.nextCalDate.substring(0, 7) === currentMonth;

          return (
            <div
              key={eq.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-4 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 px-2.5 py-0.5 rounded-lg">
                    {eq.code}
                  </span>
                  {(isOverduePm || isOverdueCal) ? (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      <span>เกินกำหนดแล้ว!</span>
                    </span>
                  ) : (isThisMonthPm || isThisMonthCal) ? (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                      ถึงรอบเดือนนี้
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      ปกติ
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm line-clamp-1">{eq.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{eq.brand} {eq.model} (S/N: {eq.serialNumber})</p>
                </div>

                <div className="text-xs space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">รอบ PM ครั้งถัดไป:</span>
                    <span className={`font-mono font-semibold ${isOverduePm ? 'text-rose-600 dark:text-rose-400' : isThisMonthPm ? 'text-amber-600 dark:text-amber-300' : 'text-slate-800 dark:text-slate-200'}`}>
                      {eq.nextPmDate || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">รอบ Calibration ครั้งถัดไป:</span>
                    <span className={`font-mono font-semibold ${isOverdueCal ? 'text-rose-600 dark:text-rose-400' : isThisMonthCal ? 'text-amber-600 dark:text-amber-300' : 'text-slate-800 dark:text-slate-200'}`}>
                      {eq.nextCalDate || '-'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                <button
                  onClick={() => onOpenRecordPMModal(eq)}
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>บันทึกผล PM/Cal</span>
                </button>
                <button
                  onClick={() => onOpenEquipmentDetail(eq)}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl text-xs"
                >
                  ประวัติ
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Global PM History Log Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <span>ประวัติการตรวจเช็ค PM & Calibration ที่ผ่านมาทั้งหมด</span>
        </h2>

        {pmRecords.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">ยังไม่มีประวัติการบันทึก PM/Cal</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50">
                  <th className="py-2.5 px-3 font-semibold">วันที่ดำเนินการ</th>
                  <th className="py-2.5 px-3 font-semibold">รหัส & ชื่อเครื่อง</th>
                  <th className="py-2.5 px-3 font-semibold">รายการ (Type)</th>
                  <th className="py-2.5 px-3 font-semibold">ผู้ตรวจ / หน่วยงาน</th>
                  <th className="py-2.5 px-3 font-semibold">ผลการตรวจ</th>
                  <th className="py-2.5 px-3 font-semibold">รอบถัดไป</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pmRecords.map((pm) => (
                  <tr key={pm.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">{pm.performedDate}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      <span className="text-teal-600 dark:text-teal-400 font-mono mr-1.5">[{pm.equipmentCode}]</span>
                      {pm.equipmentName}
                    </td>
                    <td className="py-2.5 px-3 text-amber-700 dark:text-amber-300 font-semibold">{pm.type}</td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{pm.technicianName} ({pm.companyName})</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                        {pm.result}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 dark:text-slate-400">{pm.nextDueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
