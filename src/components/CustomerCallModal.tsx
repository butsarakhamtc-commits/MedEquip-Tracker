import React, { useState } from 'react';
import { X, PhoneCall, Calendar, User, Phone, CheckCircle2, Clock } from 'lucide-react';
import { BorrowRecord } from '../types';

interface CustomerCallModalProps {
  borrowRecord: BorrowRecord | null;
  callerStaffName: string;
  onClose: () => void;
  onSaveCallLog: (params: {
    borrowId: string;
    callerName: string;
    outcome: string;
    status: 'COMPLETED' | 'NO_ANSWER' | 'SCHEDULED_RETURN' | 'EXTENDED';
    nextFollowUpDate?: string;
  }) => void;
}

export const CustomerCallModal: React.FC<CustomerCallModalProps> = ({
  borrowRecord,
  callerStaffName,
  onClose,
  onSaveCallLog,
}) => {
  if (!borrowRecord) return null;

  const [callerName, setCallerName] = useState(callerStaffName);
  const [callStatus, setCallStatus] = useState<'COMPLETED' | 'NO_ANSWER' | 'SCHEDULED_RETURN' | 'EXTENDED'>('SCHEDULED_RETURN');
  const [outcome, setOutcome] = useState('โทรสอบถามอาการคนไข้และนัดส่งคืนเครื่อง');
  const [nextDate, setNextDate] = useState(borrowRecord.expectedReturnDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outcome) {
      alert('กรุณากรอกรายละเอียดผลการโทร');
      return;
    }

    onSaveCallLog({
      borrowId: borrowRecord.id,
      callerName,
      outcome,
      status: callStatus,
      nextFollowUpDate: (callStatus === 'SCHEDULED_RETURN' || callStatus === 'EXTENDED') ? nextDate : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-xl text-slate-800 dark:text-slate-200 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">บันทึกการโทรติดตามคนไข้/ลูกค้า</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                รหัสเครื่อง: <span className="text-blue-700 dark:text-teal-400 font-mono font-bold">{borrowRecord.equipmentCode}</span> ({borrowRecord.equipmentName})
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient Summary Card */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1 mb-4">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">ชื่อคนไข้:</span>
            <span className="font-bold text-slate-900 dark:text-white">{borrowRecord.patientName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">เบอร์โทรศัพท์:</span>
            <span className="text-amber-700 dark:text-amber-300 font-mono font-bold">{borrowRecord.patientPhone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">กำหนดคืนเดิม:</span>
            <span className="text-slate-700 dark:text-slate-300">{borrowRecord.expectedReturnDate}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Caller Staff */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              พนักงานผู้โทรติดตาม *
            </label>
            <input
              type="text"
              value={callerName}
              onChange={(e) => setCallerName(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          {/* Outcome Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ผลการติดต่อ / สถานะการโทร *
            </label>
            <select
              value={callStatus}
              onChange={(e) => setCallStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="SCHEDULED_RETURN">นัดหมายวันส่งคืนเรียบร้อย (Scheduled Return)</option>
              <option value="EXTENDED">คนไข้ขอขยายเวลายืมต่อ (Extended)</option>
              <option value="COMPLETED">รับสายแล้ว - สอบถามอาการคนไข้เรียบร้อย (Completed)</option>
              <option value="NO_ANSWER">ติดต่อไม่ได้ / ไม่มีผู้รับสาย (No Answer)</option>
            </select>
          </div>

          {/* New return date if scheduled/extended */}
          {(callStatus === 'SCHEDULED_RETURN' || callStatus === 'EXTENDED') && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {callStatus === 'EXTENDED' ? 'วันกำหนดคืนใหม่ (ขยายเวลา)' : 'วันนัดหมายส่งคืนเครื่อง'}
              </label>
              <input
                type="date"
                value={nextDate}
                onChange={(e) => setNextDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
          )}

          {/* Detailed Outcome Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              รายละเอียด/บันทึกคำพูดคนไข้ *
            </label>
            <textarea
              rows={3}
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="เช่น ญาติแจ้งว่าคนไข้ถอดท่อช่วยหายใจแล้ว จะนำเครื่องมาคืนภายในวันที่ 10 ส.ค."
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-xs shadow-md transition-all"
            >
              บันทึกการโทร
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
