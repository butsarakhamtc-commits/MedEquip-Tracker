import React, { useState, useRef } from 'react';
import { Download, Upload, FileSpreadsheet, Database, X, CheckCircle2, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { StorageService } from '../services/storage';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataImported: () => void;
  currentCount: number;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  onDataImported,
  currentCount,
}) => {
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({
    type: null,
    text: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    StorageService.exportAllDataJSON();
    setStatusMessage({
      type: 'success',
      text: 'ดาวน์โหลดไฟล์สำรองข้อมูล (.json) เรียบร้อยแล้ว! สามารถนำไฟล์นี้ไปกด "นำเข้า" ในเว็บที่ Deploy ใหม่ได้ทันที',
    });
  };

  const handleExportCSV = () => {
    StorageService.exportEquipmentCSV();
    setStatusMessage({
      type: 'success',
      text: 'ส่งออกไฟล์ตาราง Excel / CSV เรียบร้อยแล้ว!',
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = StorageService.importAllDataJSON(content);
        if (result.success) {
          setStatusMessage({
            type: 'success',
            text: result.message,
          });
          onDataImported();
        } else {
          setStatusMessage({
            type: 'error',
            text: result.message,
          });
        }
      }
    };
    reader.onerror = () => {
      setStatusMessage({
        type: 'error',
        text: 'ไม่สามารถอ่านไฟล์ได้ โปรดลองอีกครั้ง',
      });
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="p-3 bg-teal-100 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 rounded-2xl text-teal-700 dark:text-teal-300">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>สำรอง & ย้ายข้อมูล (Backup / Restore)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ย้ายข้อมูลเครื่องมือแพทย์ {currentCount} เครื่อง และประวัติทั้งหมดข้ามระบบหรือย้ายเครื่อง
            </p>
          </div>
        </div>

        {/* Explanation Alert */}
        <div className="p-3.5 bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800/80 rounded-2xl text-xs space-y-1.5 text-sky-900 dark:text-sky-200">
          <div className="flex items-center gap-2 font-bold text-sky-800 dark:text-sky-300">
            <Info className="w-4 h-4 shrink-0 text-sky-600 dark:text-sky-400" />
            <span>คำแนะนำสำหรับการย้ายข้อมูลไปลิงก์ Deploy ใหม่:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
            <li>เปิดเว็บจาก<strong>เครื่องเดิมที่ลงทะเบียน 57 เครื่องไว้</strong> แล้วกด <strong className="text-teal-700 dark:text-teal-300">"ส่งออกไฟล์สำรอง (.json)"</strong></li>
            <li>เปิดลิงก์ที่ **Deploy ออกไปแล้ว** แล้วกดเปิดเมนูนี้ แล้วเลือก <strong className="text-blue-700 dark:text-blue-300">"นำเข้าไฟล์สำรอง (.json)"</strong></li>
            <li>ข้อมูลทั้ง 57 เครื่องรวมถึงประวัติทั้งหมดจะถูกกู้คืนและแสดงผลบนเว็บใหม่ทันที!</li>
          </ol>
        </div>

        {/* Status Message Display */}
        {statusMessage.type && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in duration-200 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span className="font-medium">{statusMessage.text}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-1">
          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            className="w-full p-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold rounded-2xl shadow-md flex items-center justify-between text-xs sm:text-sm transition-all active:scale-98 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold">1. ส่งออกไฟล์สำรองข้อมูล (.json)</p>
                <p className="text-[11px] font-normal text-teal-100">บันทึกเครื่องมือแพทย์ทั้งหมด ({currentCount} เครื่อง) + ประวัติลงไฟล์</p>
              </div>
            </div>
            <span className="text-xs bg-white/20 px-2.5 py-1 rounded-lg font-mono">Export JSON</span>
          </button>

          {/* Import JSON */}
          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 border-2 border-slate-300 dark:border-slate-700 font-bold rounded-2xl flex items-center justify-between text-xs sm:text-sm transition-all active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 rounded-xl">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold">2. นำเข้าข้อมูลจากไฟล์สำรอง (.json)</p>
                  <p className="text-[11px] font-normal text-slate-500 dark:text-slate-400">เลือกไฟล์ MedEquip_Backup_*.json เพื่อกู้คืนข้อมูล</p>
                </div>
              </div>
              <span className="text-xs bg-blue-600 text-white px-2.5 py-1 rounded-lg font-bold">Import</span>
            </button>
          </div>

          {/* Export CSV / Excel */}
          <button
            onClick={handleExportCSV}
            className="w-full p-3 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold rounded-2xl flex items-center justify-between text-xs transition-all"
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>3. ส่งออกตารางทะเบียนเป็นไฟล์ Excel / CSV</span>
            </div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">.CSV</span>
          </button>

          {/* Reset to Default 57 items */}
          <button
            onClick={() => {
              if (window.confirm('⚠️ คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้น (57 เครื่องมือแพทย์) ใช่หรือไม่?')) {
                StorageService.resetToDefault();
                setStatusMessage({
                  type: 'success',
                  text: 'รีเซ็ตข้อมูลเป็นชุดเริ่มต้น 57 รายการเรียบร้อยแล้ว!',
                });
                onDataImported();
              }
            }}
            className="w-full p-3 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 font-bold rounded-2xl flex items-center justify-between text-xs transition-all"
          >
            <div className="flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>4. โหลดข้อมูลตัวอย่างมาตรฐาน (57 เครื่องมือแพทย์)</span>
            </div>
            <span className="text-[11px] text-amber-700 dark:text-amber-400 font-mono">Reset 57</span>
          </button>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            จำนวนข้อมูลปัจจุบัน: <strong className="text-teal-600 dark:text-teal-400 font-mono">{currentCount} เครื่อง</strong>
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
