import React, { useState } from 'react';
import { X, Wrench, Calendar, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Equipment } from '../types';

interface PMCalModalProps {
  equipment: Equipment | null;
  technicianName: string;
  onClose: () => void;
  onSavePM: (params: {
    equipmentId: string;
    type: 'PM' | 'CALIBRATION' | 'BOTH';
    performedDate: string;
    technicianName: string;
    companyName?: string;
    result: 'PASS' | 'FAIL' | 'ADJUSTED';
    certificateNo?: string;
    notes?: string;
    cost?: number;
  }) => void;
}

export const PMCalModal: React.FC<PMCalModalProps> = ({
  equipment,
  technicianName,
  onClose,
  onSavePM,
}) => {
  if (!equipment) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const [type, setType] = useState<'PM' | 'CALIBRATION' | 'BOTH'>('BOTH');
  const [performedDate, setPerformedDate] = useState(todayStr);
  const [techName, setTechName] = useState(technicianName || 'วิศวกร ธนพล การดี');
  const [companyName, setCompanyName] = useState('แผนกวิศวกรรมการแพทย์ ในโรงพยาบาล');
  const [result, setResult] = useState<'PASS' | 'FAIL' | 'ADJUSTED'>('PASS');
  const [certificateNo, setCertificateNo] = useState(`CAL-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`);
  const [cost, setCost] = useState<number>(0);
  const [notes, setNotes] = useState('ทำความสะอาด เปลี่ยนแผ่นกรองฝุ่น ทดสอบแรงดันและฟังก์ชั่นความปลอดภัยผ่านเกณฑ์');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePM({
      equipmentId: equipment.id,
      type,
      performedDate,
      technicianName: techName,
      companyName,
      result,
      certificateNo,
      notes,
      cost,
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
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">บันทึกผล PM / Calibration</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                รหัสเครื่อง: <span className="text-blue-700 dark:text-teal-400 font-mono font-bold">{equipment.code}</span> ({equipment.name})
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Equipment summary */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">ยี่ห้อ/รุ่น:</span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold">{equipment.brand} {equipment.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Serial No:</span>
              <span className="font-mono text-blue-700 dark:text-teal-300 font-medium">{equipment.serialNumber}</span>
            </div>
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              รายการที่ดำเนินการ *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('PM')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  type === 'PM' ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                บำรุงรักษา (PM)
              </button>
              <button
                type="button"
                onClick={() => setType('CALIBRATION')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  type === 'CALIBRATION' ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                สอบเทียบ (Calibration)
              </button>
              <button
                type="button"
                onClick={() => setType('BOTH')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  type === 'BOTH' ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                ทำทั้ง PM & Cal
              </button>
            </div>
          </div>

          {/* Performed Date & Result */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                วันที่ดำเนินการ *
              </label>
              <input
                type="date"
                value={performedDate}
                onChange={(e) => setPerformedDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ผลการทดสอบ *
              </label>
              <select
                value={result}
                onChange={(e) => setResult(e.target.value as any)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="PASS">ผ่านเกณฑ์ (PASS)</option>
                <option value="ADJUSTED">ปรับแต่งค่าแล้วผ่าน (ADJUSTED)</option>
                <option value="FAIL">ไม่ผ่านเกณฑ์ (FAIL - ต้องส่งซ่อม)</option>
              </select>
            </div>
          </div>

          {/* Technician & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ชื่อผู้ตรวจเช็ค/วิศวกร *
              </label>
              <input
                type="text"
                value={techName}
                onChange={(e) => setTechName(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                หน่วยงาน/บริษัทผู้ให้บริการ
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="เช่น แผนกวิศวกรรมการแพทย์ / บริษัทภายนอก"
              />
            </div>
          </div>

          {/* Certificate & Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                เลขที่ใบรับรอง (Certificate No.)
              </label>
              <input
                type="text"
                value={certificateNo}
                onChange={(e) => setCertificateNo(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ค่าบริการ/ค่าอะไหล่ (บาท)
              </label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              รายละเอียดการตรวจซ่อมบำรุง
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Submit */}
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
              บันทึกผล PM/Cal
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
