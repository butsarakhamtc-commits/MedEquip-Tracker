import React, { useState } from 'react';
import { 
  X, 
  Stethoscope, 
  User as UserIcon, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  PhoneCall, 
  CheckCircle2, 
  Wrench, 
  ArrowLeftRight, 
  Printer, 
  Plus, 
  History,
  ShieldCheck,
  PhoneOff,
  AlertCircle,
  Camera,
  FileText,
  Tag,
  Maximize2,
  Image as ImageIcon
} from 'lucide-react';
import { Equipment, BorrowRecord, PMRecord } from '../types';
import { calculateDaysBorrowed } from '../services/storage';

interface EquipmentDetailModalProps {
  equipment: Equipment | null;
  borrowRecords: BorrowRecord[];
  pmRecords: PMRecord[];
  onClose: () => void;
  onOpenBorrowModal: (equipment: Equipment) => void;
  onOpenReturnModal: (borrow: BorrowRecord) => void;
  onOpenRecordPMModal: (equipment: Equipment) => void;
  onOpenStickerModal: (equipment: Equipment) => void;
  onOpenCustomerCallModal: (borrow: BorrowRecord) => void;
}

export const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({
  equipment,
  borrowRecords,
  pmRecords,
  onClose,
  onOpenBorrowModal,
  onOpenReturnModal,
  onOpenRecordPMModal,
  onOpenStickerModal,
  onOpenCustomerCallModal,
}) => {
  if (!equipment) return null;

  const [activeTab, setActiveTab] = useState<'info' | 'borrow_history' | 'pm_history'>('info');
  const [zoomImage, setZoomImage] = useState<{ url: string; title: string } | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const activeBorrow = borrowRecords.find(
    (b) => b.equipmentId === equipment.id && b.status === 'ACTIVE'
  );

  const pastBorrows = borrowRecords.filter(
    (b) => b.equipmentId === equipment.id
  );

  const devicePmHistory = pmRecords.filter(
    (p) => p.equipmentId === equipment.id
  );

  const daysBorrowed = activeBorrow ? calculateDaysBorrowed(activeBorrow.borrowDate) : 0;
  const isOverdue = activeBorrow && activeBorrow.expectedReturnDate < todayStr;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl p-5 sm:p-6 shadow-xl text-slate-800 dark:text-slate-200 my-8 space-y-5">
        
        {/* Modal Top Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-teal-500/20 border border-blue-200 dark:border-teal-500/30 flex items-center justify-center text-blue-600 dark:text-teal-400 shrink-0">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-blue-700 dark:text-teal-400 bg-blue-50 dark:bg-teal-500/10 border border-blue-200 dark:border-teal-500/20 px-2.5 py-0.5 rounded-lg">
                  {equipment.code}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  equipment.status === 'AVAILABLE'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : equipment.status === 'BORROWED'
                    ? 'bg-sky-50 text-sky-800 border border-sky-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {equipment.status === 'AVAILABLE' && 'พร้อมใช้งาน'}
                  {equipment.status === 'BORROWED' && 'ถูกยืมใช้งาน'}
                  {equipment.status === 'MAINTENANCE' && 'ส่งซ่อม'}
                  {equipment.status === 'CALIBRATION_DUE' && 'ถึงรอบ PM/Cal'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{equipment.name}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ยี่ห้อ: <span className="text-slate-800 dark:text-slate-200">{equipment.brand}</span> | รุ่น: <span className="text-slate-800 dark:text-slate-200">{equipment.model}</span> | Serial No: <span className="text-slate-800 dark:text-slate-200 font-mono">{equipment.serialNumber}</span>
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2.5 border-b-2 transition-all ${
              activeTab === 'info'
                ? 'border-blue-600 text-blue-700 dark:text-teal-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            ข้อมูลเครื่อง & สถิติ
          </button>
          <button
            onClick={() => setActiveTab('borrow_history')}
            className={`px-4 py-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'borrow_history'
                ? 'border-blue-600 text-blue-700 dark:text-teal-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>ประวัติการยืม-คืน ({pastBorrows.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('pm_history')}
            className={`px-4 py-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'pm_history'
                ? 'border-teal-500 text-teal-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>ประวัติ PM/Cal ({devicePmHistory.length})</span>
          </button>
        </div>

        {/* TAB 1: General Info & Active Borrow Call Status */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            
            {/* ACTIVE BORROW HIGHLIGHT BOX */}
            {activeBorrow ? (
              <div className="p-4 bg-sky-950/40 border border-sky-800/60 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-sky-800/60 pb-2">
                  <span className="text-xs font-bold text-sky-300 flex items-center gap-2">
                    <ArrowLeftRight className="w-4 h-4 text-sky-400" />
                    <span>ข้อมูลการยืมใช้งานปัจจุบัน (Active Loan)</span>
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-sky-500/20 text-sky-200 border border-sky-500/30">
                    ยืมไปแล้ว {daysBorrowed} วัน
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-slate-400">ยืมไปให้คนไข้:</p>
                    <p className="font-bold text-white text-sm mt-0.5">{activeBorrow.patientName}</p>
                    <p className="text-sky-300 font-mono mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-sky-400" />
                      <span>{activeBorrow.patientPhone}</span>
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400">พนักงานผู้ยืม:</p>
                    <p className="font-semibold text-slate-200 mt-0.5">{activeBorrow.borrowerStaffName}</p>
                    <p className="text-slate-400 mt-1">สถานที่: {activeBorrow.locationWard}</p>
                  </div>

                  <div>
                    <p className="text-slate-400">วันที่ยืม:</p>
                    <p className="font-medium text-slate-200">{activeBorrow.borrowDate}</p>
                  </div>

                  <div>
                    <p className="text-slate-400">กำหนดส่งคืน:</p>
                    <p className={`font-bold ${isOverdue ? 'text-rose-400 font-mono' : 'text-slate-200'}`}>
                      {activeBorrow.expectedReturnDate} {isOverdue && '(เลยกำหนดแล้ว!)'}
                    </p>
                  </div>
                </div>

                {/* CUSTOMER FOLLOW-UP CALL STATUS SECTION */}
                <div className="pt-3 border-t border-sky-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <PhoneCall className="w-4 h-4 text-amber-400" />
                      <span>สถานะการโทรติดตามลูกค้า (Follow-up Call):</span>
                    </p>
                    {activeBorrow.isCustomerCalled ? (
                      <p className="text-xs text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>โทรติดตามแล้วเมื่อ {activeBorrow.lastCallDate}</span>
                      </p>
                    ) : (
                      <p className="text-xs text-amber-400 font-medium mt-0.5 flex items-center gap-1">
                        <PhoneOff className="w-3.5 h-3.5" />
                        <span>ยังไม่ได้โทรติดตามลูกค้า (เมื่อครบเวลา)</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenCustomerCallModal(activeBorrow)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl text-xs transition-all flex items-center gap-1.5"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>+ บันทึกการโทรหาคนไข้</span>
                    </button>
                    <button
                      onClick={() => onOpenReturnModal(activeBorrow)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-xs transition-all"
                    >
                      ทำรายการรับคืน
                    </button>
                  </div>
                </div>

                {/* Call logs list if any */}
                {activeBorrow.callLogs && activeBorrow.callLogs.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-sky-800/40 text-xs space-y-1.5">
                    <p className="text-[11px] font-semibold text-slate-300">ประวัติการโทรติดตามล่าสุด:</p>
                    {activeBorrow.callLogs.map((log) => (
                      <div key={log.id} className="p-2 bg-slate-900/60 rounded-lg text-[11px] space-y-0.5">
                        <div className="flex justify-between text-slate-400">
                          <span>{log.callDate} โดย {log.callerName}</span>
                          <span className="text-amber-300 font-semibold">{log.status}</span>
                        </div>
                        <p className="text-slate-200">{log.outcome}</p>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            ) : (
              <div className="p-3.5 bg-emerald-950/30 border border-emerald-800/50 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-300">เครื่องอยู่ในสต๊อก (พร้อมยืมใช้งาน)</p>
                    <p className="text-[11px] text-slate-400">แผนกจัดเก็บ: {equipment.department}</p>
                  </div>
                </div>
                <button
                  onClick={() => onOpenBorrowModal(equipment)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
                >
                  ยืมเครื่องนี้
                </button>
              </div>
            )}

            {/* DETAILS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
              <div>
                <span className="text-slate-400">หมวดหมู่:</span>
                <p className="font-semibold text-slate-100">{equipment.category}</p>
              </div>

              <div>
                <span className="text-slate-400">แผนกประจำเครื่อง:</span>
                <p className="font-semibold text-slate-100">{equipment.department}</p>
              </div>

              <div>
                <span className="text-slate-400">ถึงรอบ PM ถัดไป:</span>
                <p className="font-bold text-amber-300 font-mono">{equipment.nextPmDate || '-'}</p>
                <p className="text-[10px] text-slate-500">ความถี่ทุก {equipment.pmFrequencyMonths} เดือน</p>
              </div>

              <div>
                <span className="text-slate-400">ถึงรอบ Calibration ถัดไป:</span>
                <p className="font-bold text-amber-300 font-mono">{equipment.nextCalDate || '-'}</p>
                <p className="text-[10px] text-slate-500">ความถี่ทุก {equipment.calFrequencyMonths} เดือน</p>
              </div>

              <div>
                <span className="text-slate-400">ผู้จำหน่าย / บริษัท:</span>
                <p className="text-slate-200">{equipment.supplier || '-'}</p>
              </div>

              <div>
                <span className="text-slate-400">ราคาประเมิน:</span>
                <p className="text-slate-200">{equipment.price ? `${equipment.price.toLocaleString()} บาท` : '-'}</p>
              </div>
            </div>

            {/* NOTES */}
            {equipment.notes && (
              <div className="text-xs bg-slate-950/30 p-3 rounded-xl border border-slate-800">
                <span className="font-semibold text-slate-400">หมายเหตุ / อุปกรณ์ประกอบ:</span>
                <p className="text-slate-300 mt-1">{equipment.notes}</p>
              </div>
            )}

            {/* 📸 3 PHOTO GALLERY SECTION */}
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <p className="text-xs font-bold text-slate-100 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-teal-400" />
                  <span>รูปภาพหลักฐานเครื่องมือแพทย์ (3 รูป)</span>
                </p>
                <span className="text-[11px] text-slate-400">คลิกที่รูปเพื่อขยายเต็มจอ</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. รูปหน้าเครื่อง */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 space-y-2 flex flex-col justify-between">
                  <p className="text-[11px] font-bold text-blue-300 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span>1. รูปหน้าเครื่อง</span>
                  </p>
                  {equipment.imageUrl ? (
                    <div 
                      onClick={() => setZoomImage({ url: equipment.imageUrl!, title: 'รูปหน้าเครื่องมือแพทย์ (1 รูป)' })}
                      className="relative h-32 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 cursor-pointer group"
                    >
                      <img src={equipment.imageUrl} alt="รูปหน้าเครื่อง" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 rounded-lg border border-dashed border-slate-800 bg-slate-950/50 flex flex-col items-center justify-center text-center p-2">
                      <Camera className="w-6 h-6 text-slate-600 mb-1" />
                      <p className="text-[10px] text-slate-500">ยังไม่มีรูปหน้าเครื่อง</p>
                    </div>
                  )}
                </div>

                {/* 2. รูป Nameplate */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 space-y-2 flex flex-col justify-between">
                  <p className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>2. รูป Nameplate (SN ชัดเจน)</span>
                  </p>
                  {equipment.nameplateImageUrl ? (
                    <div 
                      onClick={() => setZoomImage({ url: equipment.nameplateImageUrl!, title: 'รูป NAMEPLATE ( Serial Number & ชื่อเครื่องชัดเจน )' })}
                      className="relative h-32 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 cursor-pointer group"
                    >
                      <img src={equipment.nameplateImageUrl} alt="Nameplate" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 rounded-lg border border-dashed border-slate-800 bg-slate-950/50 flex flex-col items-center justify-center text-center p-2">
                      <FileText className="w-6 h-6 text-slate-600 mb-1" />
                      <p className="text-[10px] text-slate-500">ยังไม่มีรูป Nameplate</p>
                    </div>
                  )}
                </div>

                {/* 3. รูปหน้าเครื่องพร้อมเห็นสติ๊กเกอร์ */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 space-y-2 flex flex-col justify-between">
                  <p className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-emerald-400" />
                    <span>3. รูปหน้าเครื่อง + สติ๊กเกอร์</span>
                  </p>
                  {equipment.stickerImageUrl ? (
                    <div 
                      onClick={() => setZoomImage({ url: equipment.stickerImageUrl!, title: 'รูปหน้าเครื่องพร้อมเห็นสติ๊กเกอร์ PM/Cal' })}
                      className="relative h-32 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 cursor-pointer group"
                    >
                      <img src={equipment.stickerImageUrl} alt="หน้าเครื่องพร้อมสติ๊กเกอร์" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 rounded-lg border border-dashed border-slate-800 bg-slate-950/50 flex flex-col items-center justify-center text-center p-2">
                      <Tag className="w-6 h-6 text-slate-600 mb-1" />
                      <p className="text-[10px] text-slate-500">ยังไม่มีรูปติดสติ๊กเกอร์</p>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 2: Borrow History */}
        {activeTab === 'borrow_history' && (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {pastBorrows.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">ยังไม่มีประวัติการยืมเครื่องนี้</p>
            ) : (
              pastBorrows.map((b) => (
                <div key={b.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-100">คนไข้: {b.patientName} ({b.patientPhone})</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      b.status === 'ACTIVE' ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {b.status === 'ACTIVE' ? 'กำลังยืมอยู่' : 'คืนแล้ว'}
                    </span>
                  </div>
                  <p className="text-slate-400">ผู้ยืม: {b.borrowerStaffName} | สถานที่: {b.locationWard}</p>
                  <p className="text-slate-400 font-mono">
                    วันยืม: {b.borrowDate} | กำหนดคืน: {b.expectedReturnDate} {b.actualReturnDate && `| คืนจริง: ${b.actualReturnDate}`}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: PM History */}
        {activeTab === 'pm_history' && (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            <div className="flex justify-between items-center">
              <p className="text-xs font-semibold text-slate-400">รายการประวัติการซ่อมบำรุง/สอบเทียบ</p>
              <button
                onClick={() => onOpenRecordPMModal(equipment)}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium"
              >
                + บันทึก PM/Cal ใหม่
              </button>
            </div>

            {devicePmHistory.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">ยังไม่มีบันทึกประวัติ PM/Calibration</p>
            ) : (
              devicePmHistory.map((pm) => (
                <div key={pm.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-300">ประเภท: {pm.type}</span>
                    <span className="text-emerald-400 font-mono font-bold">ผลตรวจ: {pm.result}</span>
                  </div>
                  <p className="text-slate-300">วันที่ทำ: {pm.performedDate} | รอบถัดไป: {pm.nextDueDate}</p>
                  <p className="text-slate-400">ผู้ตรวจ: {pm.technicianName} ({pm.companyName || 'ภายใน'})</p>
                  {pm.notes && <p className="text-slate-400 italic">หมายเหตุ: {pm.notes}</p>}
                </div>
              ))
            )}
          </div>
        )}

        {/* Modal Bottom Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-800">
          <button
            onClick={() => onOpenStickerModal(equipment)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์ QR Code สติ๊กเกอร์</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenRecordPMModal(equipment)}
              className="px-3.5 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-medium flex items-center gap-1"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>บันทึก PM/Cal</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>

        {/* LIGHTBOX MODAL */}
        {zoomImage && (
          <div 
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
            onClick={() => setZoomImage(null)}
          >
            <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-3 shadow-2xl space-y-3" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 px-2">
                <span className="text-sm font-bold text-teal-400">{zoomImage.title}</span>
                <button 
                  onClick={() => setZoomImage(null)}
                  className="p-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="max-h-[75vh] flex items-center justify-center overflow-auto rounded-xl bg-slate-950 p-2">
                <img src={zoomImage.url} alt="Zoom" className="max-h-[70vh] w-auto object-contain rounded-lg shadow-md" />
              </div>
              <p className="text-center text-xs text-slate-400">คลิกบริเวณภายนอกหรือปุ่ม X เพื่อปิดภาพ</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
