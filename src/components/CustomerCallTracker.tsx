import React, { useState } from 'react';
import { PhoneCall, Search, Phone, User, Calendar, Clock, CheckCircle2, PhoneOff, ArrowLeftRight } from 'lucide-react';
import { BorrowRecord, CustomerCallLog } from '../types';

interface CustomerCallTrackerProps {
  borrowRecords: BorrowRecord[];
  onOpenCustomerCallModal: (borrow: BorrowRecord) => void;
  onToggleCustomerCallStatus: (borrowId: string, called: boolean) => void;
}

export const CustomerCallTracker: React.FC<CustomerCallTrackerProps> = ({
  borrowRecords,
  onOpenCustomerCallModal,
  onToggleCustomerCallStatus,
}) => {
  const [search, setSearch] = useState('');
  const [callFilter, setCallFilter] = useState<'PENDING' | 'CALLED' | 'ALL'>('PENDING');

  const activeBorrows = borrowRecords.filter((b) => b.status === 'ACTIVE');

  const filteredBorrows = activeBorrows.filter((b) => {
    const matchesSearch =
      b.equipmentCode.toLowerCase().includes(search.toLowerCase()) ||
      b.equipmentName.toLowerCase().includes(search.toLowerCase()) ||
      b.patientName.toLowerCase().includes(search.toLowerCase()) ||
      b.patientPhone.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (callFilter === 'PENDING') return !b.isCustomerCalled;
    if (callFilter === 'CALLED') return b.isCustomerCalled;

    return true;
  });

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-amber-400" />
            <span>ระบบติดตามโทรหาคนไข้ / ลูกค้า (Customer Follow-up Calls)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            เมื่อเครื่องถูกยืมหรือใกล้ครบกำหนด ค้นหาคนไข้ โทรสอบถามอาการ และบันทึกประวัติการโทรติดตาม
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setCallFilter('PENDING')}
            className={`px-3.5 py-2 rounded-xl font-medium transition-all ${
              callFilter === 'PENDING' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-amber-300'
            }`}
          >
            ยังไม่ได้โทร ({activeBorrows.filter((b) => !b.isCustomerCalled).length})
          </button>
          <button
            onClick={() => setCallFilter('CALLED')}
            className={`px-3.5 py-2 rounded-xl font-medium transition-all ${
              callFilter === 'CALLED' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-emerald-300'
            }`}
          >
            โทรติดตามแล้ว ({activeBorrows.filter((b) => b.isCustomerCalled).length})
          </button>
          <button
            onClick={() => setCallFilter('ALL')}
            className={`px-3.5 py-2 rounded-xl font-medium transition-all ${
              callFilter === 'ALL' ? 'bg-sky-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
            }`}
          >
            ทั้งหมด ({activeBorrows.length})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="ค้นหาตามชื่อคนไข้, เบอร์โทร, รหัสเครื่อง..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredBorrows.length === 0 ? (
          <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
            ไม่พบรายการโทรติดตามในเงื่อนไขนี้
          </div>
        ) : (
          filteredBorrows.map((b) => (
            <div
              key={b.id}
              className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 rounded-lg">
                    {b.equipmentCode}
                  </span>
                  <h3 className="font-bold text-white text-sm">{b.equipmentName}</h3>
                </div>

                {b.isCustomerCalled ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>โทรติดตามแล้ว</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 w-fit">
                    <PhoneOff className="w-3.5 h-3.5" />
                    <span>รอดำเนินการโทรหาคนไข้</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <p className="text-slate-400">คนไข้ผู้ยืม:</p>
                  <p className="font-bold text-white text-sm mt-0.5">{b.patientName}</p>
                  <p className="text-amber-300 font-mono font-bold mt-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>{b.patientPhone}</span>
                  </p>
                </div>

                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <p className="text-slate-400">สถานที่ยืมไปใช้:</p>
                  <p className="font-semibold text-slate-200 mt-0.5">{b.locationWard}</p>
                  <p className="text-slate-400 mt-1">ผู้ยืม: {b.borrowerStaffName}</p>
                </div>

                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <p className="text-slate-400">วันยืม & กำหนดคืน:</p>
                  <p className="text-slate-200 mt-0.5">เริ่มยืม: {b.borrowDate}</p>
                  <p className="text-amber-300 font-mono font-bold mt-1">กำหนดคืน: {b.expectedReturnDate}</p>
                </div>
              </div>

              {/* Call History */}
              {b.callLogs && b.callLogs.length > 0 && (
                <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 text-xs space-y-1.5">
                  <p className="font-semibold text-slate-300">ประวัติการโทรหาคนไข้:</p>
                  {b.callLogs.map((log) => (
                    <div key={log.id} className="p-2 bg-slate-900 rounded-lg text-[11px]">
                      <div className="flex justify-between text-slate-400">
                        <span>วันที่ {log.callDate} โดย {log.callerName}</span>
                        <span className="text-amber-300 font-bold">{log.status}</span>
                      </div>
                      <p className="text-slate-200 mt-0.5">{log.outcome}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => onToggleCustomerCallStatus(b.id, !b.isCustomerCalled)}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  {b.isCustomerCalled ? 'สลับเป็น "ยังไม่ได้โทร"' : 'ทำเครื่องหมาย "โทรติดตามแล้ว"'}
                </button>

                <button
                  onClick={() => onOpenCustomerCallModal(b)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>+ บันทึกผลการโทร</span>
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};
