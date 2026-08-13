import React, { useState } from 'react';
import { X, QrCode, Search, Stethoscope, ArrowRight, Camera } from 'lucide-react';
import { Equipment } from '../types';

interface QRScannerModalProps {
  equipmentList: Equipment[];
  onClose: () => void;
  onSelectEquipment: (equipment: Equipment) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  equipmentList,
  onClose,
  onSelectEquipment,
}) => {
  const [scanCode, setScanCode] = useState('');
  const [isSimulatingCamera, setIsSimulatingCamera] = useState(true);

  const matchedDevice = equipmentList.find(
    (e) => e.code.toLowerCase() === scanCode.trim().toLowerCase() ||
           e.serialNumber.toLowerCase() === scanCode.trim().toLowerCase()
  );

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (matchedDevice) {
      onSelectEquipment(matchedDevice);
      onClose();
    } else {
      alert(`ไม่พบเครื่องมือแพทย์รหัส "${scanCode}" กรุณาตรวจสอบรหัสอีกครั้ง`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-xl text-slate-800 dark:text-slate-200 my-8 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 dark:bg-teal-500/20 dark:text-teal-400 border border-blue-200">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">สแกน QR Code เครื่องมือแพทย์</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">สแกนจากสติ๊กเกอร์เพื่อค้นหาและทำรายการยืม-คืนทันที</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Simulation Box */}
        <div className="relative w-full h-48 bg-slate-950 rounded-2xl border-2 border-dashed border-teal-500/40 flex flex-col items-center justify-center text-center p-4 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-teal-500/10 via-transparent to-teal-500/10 animate-pulse pointer-events-none" />
          
          <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-2 shadow-inner">
            <Camera className="w-8 h-8 animate-bounce" />
          </div>

          <p className="text-xs font-semibold text-teal-300">กล้องพร้อมสแกน QR Code</p>
          <p className="text-[11px] text-slate-400 mt-0.5">หรือพิมพ์รหัส (EQ000001, EQ000002) ด้านล่าง</p>

          {/* Quick Click Sample Buttons */}
          <div className="mt-3 flex flex-wrap gap-1.5 justify-center z-10">
            {equipmentList.slice(0, 4).map((eq) => (
              <button
                key={eq.id}
                type="button"
                onClick={() => {
                  setScanCode(eq.code);
                  onSelectEquipment(eq);
                  onClose();
                }}
                className="px-2 py-0.5 bg-slate-800 hover:bg-teal-600 text-teal-300 hover:text-white font-mono text-[10px] rounded border border-slate-700 transition-all"
              >
                สแกน {eq.code}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input Fallback */}
        <form onSubmit={handleScanSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              หรือป้อนรหัสเครื่องมือ / Serial Number
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={scanCode}
                onChange={(e) => setScanCode(e.target.value)}
                placeholder="เช่น EQ000001 หรือ SN-883011"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                autoFocus
              />
            </div>
          </div>

          {matchedDevice && (
            <div className="p-3 bg-teal-950/40 border border-teal-800/60 rounded-xl text-xs space-y-1">
              <p className="text-teal-300 font-bold">พบเครื่องมือแพทย์:</p>
              <p className="text-white font-semibold">{matchedDevice.code} - {matchedDevice.name}</p>
              <p className="text-slate-400">{matchedDevice.brand} {matchedDevice.model} | สถานะ: {matchedDevice.status}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={!scanCode}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 text-white font-semibold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <span>ค้นหาเครื่องนี้</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
