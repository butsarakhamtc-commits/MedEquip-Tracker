import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Printer, QrCode as QrIcon, Check, Stethoscope } from 'lucide-react';
import { Equipment } from '../types';

interface StickerPrintModalProps {
  selectedEquipment: Equipment | null;
  allEquipment: Equipment[];
  onClose: () => void;
}

// Single Sticker Card Component with QR Canvas
const StickerCard: React.FC<{ equipment: Equipment }> = ({ equipment }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      // Data inside QR Code: Equipment Code and JSON metadata
      const qrData = JSON.stringify({
        code: equipment.code,
        name: equipment.name,
        sn: equipment.serialNumber,
      });

      QRCode.toCanvas(canvasRef.current, qrData, {
        width: 100,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      }, (err) => {
        if (err) console.error(err);
      });
    }
  }, [equipment]);

  return (
    <div className="w-[280px] h-[150px] bg-white text-slate-900 border-2 border-slate-900 p-2.5 rounded-lg flex gap-2 shadow-sm font-sans shrink-0 print:border-black print:shadow-none break-inside-avoid">
      
      {/* Left: QR Code */}
      <div className="flex flex-col items-center justify-between border-r border-slate-300 pr-2 shrink-0">
        <canvas ref={canvasRef} className="w-[90px] h-[90px]" />
        <span className="font-mono text-[11px] font-black text-slate-900 tracking-tight">
          {equipment.code}
        </span>
      </div>

      {/* Right: Details */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden text-left py-0.5">
        <div>
          <div className="flex items-center gap-1 text-[9px] font-bold text-slate-600 uppercase border-b border-slate-200 pb-1 mb-1">
            <Stethoscope className="w-3 h-3 text-teal-700 shrink-0" />
            <span className="truncate">ศูนย์เครื่องมือแพทย์</span>
          </div>
          <h4 className="font-bold text-[11px] text-slate-950 leading-tight line-clamp-2">
            {equipment.name}
          </h4>
        </div>

        <div className="text-[9px] text-slate-700 space-y-0.5 font-medium">
          <p className="truncate">ยี่ห้อ: <span className="font-bold text-slate-950">{equipment.brand}</span> {equipment.model}</p>
          <p className="font-mono truncate">S/N: {equipment.serialNumber}</p>
          <p className="text-[8px] text-teal-800 font-bold mt-0.5">
            PM/Cal: {equipment.nextPmDate || equipment.nextCalDate || 'N/A'}
          </p>
        </div>
      </div>

    </div>
  );
};

export const StickerPrintModal: React.FC<StickerPrintModalProps> = ({
  selectedEquipment,
  allEquipment,
  onClose,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    selectedEquipment ? [selectedEquipment.id] : allEquipment.map((e) => e.id)
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(allEquipment.map((e) => e.id));
  };

  const handlePrint = () => {
    window.print();
  };

  const printableItems = allEquipment.filter((e) => selectedIds.includes(e.id));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl p-5 sm:p-6 shadow-xl text-slate-800 dark:text-slate-200 my-8 space-y-4">
        
        {/* Header - Hidden during print */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 dark:bg-teal-500/20 dark:text-teal-400 border border-blue-200">
              <QrIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">พิมพ์สติ๊กเกอร์ QR Code ติดเครื่องมือแพทย์</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                สติ๊กเกอร์ขนาดเล็กะทัดรัด (50x30mm) พิมพ์ลงกระดาษสติ๊กเกอร์เพื่อแปะบนตัวเครื่อง
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selection Controls - Hidden during print */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 print:hidden text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">เลือกพิมพ์ ({selectedIds.length} / {allEquipment.length}):</span>
            <button
              onClick={selectAll}
              className="text-teal-400 hover:underline font-semibold"
            >
              เลือกทั้งหมด
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-slate-400 hover:underline"
            >
              ล้างตัวเลือก
            </button>
          </div>

          <button
            onClick={handlePrint}
            disabled={selectedIds.length === 0}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์สติ๊กเกอร์ ({selectedIds.length} แผ่น)</span>
          </button>
        </div>

        {/* Select Equipment Checklist - Hidden during print */}
        <div className="max-h-36 overflow-y-auto border border-slate-800 rounded-xl p-2 bg-slate-950/40 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs print:hidden">
          {allEquipment.map((eq) => {
            const isChecked = selectedIds.includes(eq.id);
            return (
              <label
                key={eq.id}
                onClick={() => toggleSelect(eq.id)}
                className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                  isChecked
                    ? 'bg-teal-500/10 border-teal-500/40 text-teal-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isChecked ? 'bg-teal-500 border-teal-400 text-slate-950' : 'border-slate-600'}`}>
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div className="truncate">
                  <p className="font-mono font-bold text-[11px]">{eq.code}</p>
                  <p className="text-[10px] truncate">{eq.name}</p>
                </div>
              </label>
            );
          })}
        </div>

        {/* STICKER PREVIEW & PRINT CANVAS */}
        <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 max-h-[450px] overflow-y-auto print:bg-white print:p-0 print:border-none print:max-h-none">
          <div className="flex flex-wrap gap-4 justify-center print:gap-3 print:justify-start">
            {printableItems.length === 0 ? (
              <p className="text-xs text-slate-500 py-10">กรุณาเลือกเครื่องมือแพทย์ที่ต้องการพิมพ์สติ๊กเกอร์</p>
            ) : (
              printableItems.map((eq) => (
                <StickerCard key={eq.id} equipment={eq} />
              ))
            )}
          </div>
        </div>

        {/* Footer actions - Hidden during print */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
          >
            ปิดหน้าต่าง
          </button>
          <button
            onClick={handlePrint}
            disabled={selectedIds.length === 0}
            className="px-5 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 text-white font-semibold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>สั่งพิมพ์สติ๊กเกอร์</span>
          </button>
        </div>

      </div>
    </div>
  );
};
