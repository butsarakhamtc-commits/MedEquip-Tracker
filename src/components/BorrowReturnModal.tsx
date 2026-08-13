import React, { useState, useEffect } from 'react';
import { X, ArrowLeftRight, User, Phone, MapPin, Calendar, CheckCircle2, AlertTriangle, Stethoscope, Building2, UserCheck, Search } from 'lucide-react';
import { Equipment, BorrowRecord, User as UserType } from '../types';

interface BorrowReturnModalProps {
  mode: 'BORROW' | 'RETURN';
  equipment: Equipment | null;
  equipmentList?: Equipment[];
  borrowRecord: BorrowRecord | null;
  currentUser: UserType;
  users: UserType[];
  onClose: () => void;
  onConfirmBorrow: (params: {
    equipmentId: string;
    borrowerStaffId: string;
    borrowerStaffName: string;
    hospitalName?: string;
    saleName?: string;
    salePhone?: string;
    patientName: string;
    patientPhone: string;
    borrowDate: string;
    expectedReturnDate: string;
    locationWard: string;
    accessories: string;
    notes?: string;
  }) => void;
  onConfirmReturn: (params: {
    borrowId: string;
    returnReceivedByStaff: string;
    returnCondition: 'GOOD' | 'NEEDS_CLEANING' | 'DAMAGED' | 'NEEDS_PM';
    returnNotes?: string;
  }) => void;
}

export const BorrowReturnModal: React.FC<BorrowReturnModalProps> = ({
  mode,
  equipment,
  equipmentList = [],
  borrowRecord,
  currentUser,
  users,
  onClose,
  onConfirmBorrow,
  onConfirmReturn,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate default 7 days expected return
  const nextWeekDate = new Date();
  nextWeekDate.setDate(nextWeekDate.getDate() + 7);
  const defaultReturnStr = nextWeekDate.toISOString().split('T')[0];

  // Equipment Selection State
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>(
    equipment?.id || ''
  );
  const [equipmentSearchQuery, setEquipmentSearchQuery] = useState<string>('');

  useEffect(() => {
    if (equipment) {
      setSelectedEquipmentId(equipment.id);
    }
  }, [equipment]);

  // Search across ALL equipment in catalog/list
  const matchingEquipments = equipmentList.filter((eq) => {
    if (!equipmentSearchQuery.trim()) return true;
    const q = equipmentSearchQuery.toLowerCase().trim();
    return (
      eq.code.toLowerCase().includes(q) ||
      eq.name.toLowerCase().includes(q) ||
      eq.brand.toLowerCase().includes(q) ||
      eq.model.toLowerCase().includes(q) ||
      eq.serialNumber.toLowerCase().includes(q) ||
      (eq.dnNumber && eq.dnNumber.toLowerCase().includes(q)) ||
      eq.category.toLowerCase().includes(q) ||
      eq.department.toLowerCase().includes(q) ||
      eq.id.toLowerCase().includes(q)
    );
  });

  // Auto select exact match if user types full code / DN / S/N
  useEffect(() => {
    if (equipmentSearchQuery.trim()) {
      const q = equipmentSearchQuery.toLowerCase().trim();
      const exactMatch = equipmentList.find(
        (e) =>
          e.code.toLowerCase() === q ||
          (e.dnNumber && e.dnNumber.toLowerCase() === q) ||
          e.serialNumber.toLowerCase() === q
      );
      if (exactMatch) {
        setSelectedEquipmentId(exactMatch.id);
      }
    }
  }, [equipmentSearchQuery, equipmentList]);

  // Current selected equipment object
  const activeEquipment =
    equipmentList.find((e) => e.id === selectedEquipmentId) || (selectedEquipmentId ? equipment : null);

  // Borrow Form State
  const [hospitalName, setHospitalName] = useState('');
  const [saleName, setSaleName] = useState('');
  const [salePhone, setSalePhone] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [borrowerStaffName, setBorrowerStaffName] = useState(currentUser.name);
  const [borrowDate, setBorrowDate] = useState(todayStr);
  const [expectedReturnDate, setExpectedReturnDate] = useState(defaultReturnStr);
  const [locationWard, setLocationWard] = useState('Homecare (บ้านพักคนไข้)');
  const [accessories, setAccessories] = useState('สายไฟ, ปลั๊กพ่วง, คู่มือใช้งาน');
  const [borrowNotes, setBorrowNotes] = useState('');

  // Return Form State
  const [receivingStaffName, setReceivingStaffName] = useState(currentUser.name);
  const [returnCondition, setReturnCondition] = useState<'GOOD' | 'NEEDS_CLEANING' | 'DAMAGED' | 'NEEDS_PM'>('GOOD');
  const [returnNotes, setReturnNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'BORROW') {
      if (!selectedEquipmentId || !activeEquipment) {
        alert('กรุณาเลือกเครื่องมือแพทย์ที่ต้องการยืม');
        return;
      }
      if (!patientName || !patientPhone) {
        alert('กรุณากรอกชื่อคนไข้และเบอร์โทรศัพท์');
        return;
      }
      onConfirmBorrow({
        equipmentId: activeEquipment.id,
        borrowerStaffId: currentUser.id,
        borrowerStaffName,
        hospitalName,
        saleName,
        salePhone,
        patientName,
        patientPhone,
        borrowDate,
        expectedReturnDate,
        locationWard,
        accessories,
        notes: borrowNotes,
      });
    } else {
      if (!borrowRecord) return;
      onConfirmReturn({
        borrowId: borrowRecord.id,
        returnReceivedByStaff: receivingStaffName,
        returnCondition,
        returnNotes,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl p-5 sm:p-6 shadow-xl text-slate-800 dark:text-slate-200 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${mode === 'BORROW' ? 'bg-sky-50 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400 border border-sky-200' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200'}`}>
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {mode === 'BORROW' ? 'แบบฟอร์มยืมเครื่องมือแพทย์' : 'แบบฟอร์มรับคืนเครื่องมือแพทย์'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {mode === 'BORROW' 
                  ? activeEquipment 
                    ? `รหัสเครื่อง: ${activeEquipment.code} - ${activeEquipment.name}`
                    : 'เลือกเครื่องมือแพทย์ที่ต้องการยืมจากรายการ'
                  : `รหัสเครื่อง: ${borrowRecord?.equipmentCode} - ${borrowRecord?.equipmentName}`}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'BORROW' ? (
            <>
              {/* Equipment Selector */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span>ค้นหา/เลือกเครื่องมือแพทย์ที่จะยืม (ค้นหาด้วยรหัสเครื่อง, DN, S/N, ชื่อ) *</span>
                  </span>
                  {activeEquipment && (
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>เลือกเรียบร้อยแล้ว</span>
                    </span>
                  )}
                </label>

                {/* Selected Active Equipment Summary Card */}
                {activeEquipment ? (
                  <div className="p-3.5 bg-emerald-50/90 dark:bg-emerald-950/40 border-2 border-emerald-400 dark:border-emerald-700 rounded-2xl shadow-xs space-y-2">
                    <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black bg-emerald-600 text-white px-2.5 py-1 rounded-lg shadow-2xs">
                          {activeEquipment.code}
                        </span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                          {activeEquipment.name}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEquipmentId('');
                          setEquipmentSearchQuery('');
                        }}
                        className="text-xs font-bold text-sky-700 hover:text-sky-900 dark:text-sky-300 bg-white dark:bg-slate-900 border border-sky-300 dark:border-sky-800 px-2.5 py-1 rounded-lg shadow-2xs hover:bg-sky-50 transition-all flex items-center gap-1"
                      >
                        <span>🔄 เปลี่ยนเครื่อง / ค้นหาใหม่</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-700 dark:text-slate-300 pt-1">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block text-[11px]">ยี่ห้อ/รุ่น:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{activeEquipment.brand} {activeEquipment.model}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block text-[11px]">S/N:</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{activeEquipment.serialNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block text-[11px]">รหัส DN:</span>
                        <span className="font-mono font-bold text-sky-700 dark:text-sky-300">{activeEquipment.dnNumber || '-'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Live Search Input Box */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-sky-600 dark:text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={equipmentSearchQuery}
                        onChange={(e) => setEquipmentSearchQuery(e.target.value)}
                        placeholder="พิมพ์ค้นหารหัสเครื่อง (เช่น EQ000001), DN, S/N, หรือชื่อเครื่อง..."
                        className="w-full pl-10 pr-9 py-2.5 bg-sky-50/50 dark:bg-slate-950 border-2 border-sky-300 dark:border-sky-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
                      />
                      {equipmentSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setEquipmentSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold bg-slate-200 dark:bg-slate-800 rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Dropdown Selector */}
                    <select
                      value={selectedEquipmentId}
                      onChange={(e) => setSelectedEquipmentId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
                      required
                    >
                      <option value="">-- หรือคลิกเลือกจากรายการเครื่องมือแพทย์ ({matchingEquipments.length} เครื่อง) --</option>
                      {matchingEquipments.map((eq) => (
                        <option key={eq.id} value={eq.id}>
                          [{eq.code}] {eq.name} - {eq.brand} {eq.model} (S/N: {eq.serialNumber}) {eq.dnNumber ? `[DN: ${eq.dnNumber}]` : ''} {eq.status !== 'AVAILABLE' ? `(${eq.status})` : ''}
                        </option>
                      ))}
                    </select>

                    {/* Interactive Matching Results List */}
                    {matchingEquipments.length > 0 ? (
                      <div className="max-h-44 overflow-y-auto space-y-1.5 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 bg-slate-50 dark:bg-slate-950/40">
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-2 py-0.5">
                          ผลการค้นหา ({matchingEquipments.length} เครื่อง) - คลิกเพื่อเลือกยืม:
                        </p>
                        {matchingEquipments.map((eq) => {
                          const isSelected = eq.id === selectedEquipmentId;
                          const isAvailable = eq.status === 'AVAILABLE';
                          return (
                            <button
                              key={eq.id}
                              type="button"
                              onClick={() => setSelectedEquipmentId(eq.id)}
                              className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 ${
                                isSelected
                                  ? 'bg-sky-600 text-white font-bold shadow-xs'
                                  : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-950/50 border border-slate-200 dark:border-slate-800 shadow-2xs'
                              }`}
                            >
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`font-mono text-xs px-2 py-0.5 rounded-md font-extrabold ${
                                  isSelected ? 'bg-sky-800 text-white' : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200'
                                }`}>
                                  {eq.code}
                                </span>
                                <span className="font-bold truncate">{eq.name}</span>
                                <span className={`text-[11px] ${isSelected ? 'text-sky-100' : 'text-slate-500 dark:text-slate-400'}`}>
                                  ({eq.brand} {eq.model})
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-[11px] shrink-0">
                                {eq.dnNumber && (
                                  <span className={`font-mono px-1.5 py-0.5 rounded ${
                                    isSelected ? 'bg-sky-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                  }`}>
                                    DN: {eq.dnNumber}
                                  </span>
                                )}
                                <span className={`font-mono px-1.5 py-0.5 rounded ${
                                  isSelected ? 'bg-sky-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                }`}>
                                  S/N: {eq.serialNumber}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded font-bold ${
                                  isAvailable 
                                    ? isSelected ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : isSelected ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                }`}>
                                  {isAvailable ? 'พร้อมยืม' : eq.status}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-3 text-center bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900">
                        <p className="text-xs text-amber-800 dark:text-amber-300 font-bold">
                          ไม่พบเครื่องมือแพทย์ที่ตรงกับคำค้นหา "{equipmentSearchQuery}"
                        </p>
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                          ลองตรวจสอบรหัสเครื่อง (เช่น EQ000001) หรือเปลี่ยนคำค้นหา
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Device Preview Details */}
              {activeEquipment && (
                <div className="p-3.5 bg-sky-50/60 dark:bg-slate-950/60 border border-sky-200 dark:border-sky-900 rounded-xl text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">รหัสเครื่องมือ:</span>
                    <span className="font-mono font-bold text-sky-700 dark:text-sky-400 bg-white dark:bg-sky-950 border border-sky-200 dark:border-sky-800 px-2 py-0.5 rounded">
                      {activeEquipment.code}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">ชื่อเครื่องมือแพทย์:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{activeEquipment.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">ยี่ห้อ / รุ่น / S/N:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {activeEquipment.brand} {activeEquipment.model} (S/N: {activeEquipment.serialNumber})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">หมวดหมู่ & สถานที่จัดเก็บ:</span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {activeEquipment.category} | {activeEquipment.department}
                    </span>
                  </div>
                </div>
              )}

              {/* Hospital Name */}
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>โรงพยาบาลอะไร *</span>
                </label>
                <input
                  type="text"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="เช่น โรงพยาบาลศิริราช, โรงพยาบาลบำรุงราษฎร์, Homecare"
                  required
                />
              </div>

              {/* Sale Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>ชื่อ SALE คนไหน</span>
                  </label>
                  <input
                    type="text"
                    value={saleName}
                    onChange={(e) => setSaleName(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="เช่น คุณสมชาย (Sale)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>เบอร์ SALE</span>
                  </label>
                  <input
                    type="text"
                    value={salePhone}
                    onChange={(e) => setSalePhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="089-123-4567"
                  />
                </div>
              </div>

              {/* Patient Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                    ชื่อ-นามสกุล คนไข้ *
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="เช่น นายสมศักดิ์ รักดี"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                    เบอร์โทรศัพท์คนไข้/ญาติ *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="081-234-5678"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Borrower Staff */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  เจ้าหน้าที่ผู้ทำรายการยืม (Staff / Nurse) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={borrowerStaffName}
                    onChange={(e) => setBorrowerStaffName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="เช่น พว. อารียา มั่นคง"
                    required
                  />
                </div>
              </div>

              {/* Borrow Date & Return Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    วันที่ยืม *
                  </label>
                  <input
                    type="date"
                    value={borrowDate}
                    onChange={(e) => setBorrowDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    วันกำหนดส่งคืน *
                  </label>
                  <input
                    type="date"
                    value={expectedReturnDate}
                    onChange={(e) => setExpectedReturnDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>
              </div>

              {/* Location / Ward */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  สถานที่ยืมไปใช้ (Ward / แผนก / Homecare) *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={locationWard}
                    onChange={(e) => setLocationWard(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="เช่น Ward 3 ห้อง 301 หรือ Homecare บ้านพักลาดพร้าว"
                    required
                  />
                </div>
              </div>

              {/* Accessories */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  อุปกรณ์ประกอบที่ยืมไปด้วย
                </label>
                <input
                  type="text"
                  value={accessories}
                  onChange={(e) => setAccessories(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="เช่น สายไฟ, ท่อช่วยหายใจ, กระปุกน้ำเกลือ"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">หมายเหตุเพิ่มเติม</label>
                <textarea
                  rows={2}
                  value={borrowNotes}
                  onChange={(e) => setBorrowNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="เช่น แพทย์สั่งให้ใช้สังเกตอาการ 7 วัน"
                />
              </div>
            </>
          ) : (
            <>
              {/* Return Form Details */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">รหัสเครื่อง:</span>
                  <span className="font-mono font-bold text-blue-700 dark:text-teal-400">{borrowRecord?.equipmentCode}</span>
                </div>
                {borrowRecord?.hospitalName && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">โรงพยาบาล:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{borrowRecord.hospitalName}</span>
                  </div>
                )}
                {borrowRecord?.saleName && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">SALE ผู้ดูแล:</span>
                    <span className="text-slate-800 dark:text-slate-200">{borrowRecord.saleName} {borrowRecord.salePhone ? `(${borrowRecord.salePhone})` : ''}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">คนไข้ผู้ยืม:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{borrowRecord?.patientName} ({borrowRecord?.patientPhone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">ยืมเมื่อวันที่:</span>
                  <span className="text-slate-700 dark:text-slate-300">{borrowRecord?.borrowDate}</span>
                </div>
              </div>

              {/* Receiving Staff */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  เจ้าหน้าที่ผู้รับคืน *
                </label>
                <input
                  type="text"
                  value={receivingStaffName}
                  onChange={(e) => setReceivingStaffName(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Condition upon Return */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  สภาพเครื่องมือตอนรับคืน *
                </label>
                <select
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="GOOD">สมบูรณ์ปกติ พร้อมนำเก็บเข้าสต๊อก (Good)</option>
                  <option value="NEEDS_CLEANING">ต้องทำความสะอาด/ฆ่าเชื้อก่อนเก็บ (Needs Cleaning)</option>
                  <option value="NEEDS_PM">ต้องส่งเช็ครอบ PM/Calibration ก่อนใช้ต่อ (Needs PM)</option>
                  <option value="DAMAGED">ชำรุด/มีปัญหา ต้องส่งซ่อม (Damaged/Maintenance)</option>
                </select>
              </div>

              {/* Return Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">หมายเหตุรับคืน</label>
                <textarea
                  rows={2}
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="เช่น ได้รับอุปกรณ์คืนครบถ้วน ตรวจเช็คแบตเตอรี่แล้ว"
                />
              </div>
            </>
          )}

          {/* Form Actions */}
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
              className={`px-5 py-2 font-semibold rounded-xl text-xs shadow-md transition-all text-white ${
                mode === 'BORROW'
                  ? 'bg-sky-600 hover:bg-sky-500'
                  : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              {mode === 'BORROW' ? 'ยืนยันการยืมเครื่อง' : 'ยืนยันการรับคืน'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
