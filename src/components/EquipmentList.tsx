import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  QrCode, 
  Wrench, 
  ArrowLeftRight, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  Printer,
  X,
  Camera,
  Upload,
  Image as ImageIcon,
  FileText,
  Tag
} from 'lucide-react';
import { Equipment, EquipmentStatus, User, EquipmentCatalogItem } from '../types';
import { generateNextEquipmentCode } from '../services/storage';

interface EquipmentListProps {
  equipmentList: Equipment[];
  currentUser: User;
  catalog?: EquipmentCatalogItem[];
  onOpenEquipmentDetail: (equipment: Equipment) => void;
  onOpenBorrowModal: (equipment: Equipment) => void;
  onOpenReturnModal: (borrow: any) => void;
  onOpenRecordPMModal: (equipment: Equipment) => void;
  onOpenStickerModal: (equipment: Equipment) => void;
  onSaveEquipment: (equipment: Partial<Equipment>) => void;
  onDeleteEquipment: (id: string) => void;
  onOpenMasterCatalogModal?: () => void;
}

export const EquipmentList: React.FC<EquipmentListProps> = ({
  equipmentList,
  currentUser,
  catalog = [],
  onOpenEquipmentDetail,
  onOpenBorrowModal,
  onOpenReturnModal,
  onOpenRecordPMModal,
  onOpenStickerModal,
  onSaveEquipment,
  onDeleteEquipment,
  onOpenMasterCatalogModal,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

  // Helper date adder
  const calcNextDate = (startDate: string, addMonths: number): string => {
    if (!startDate) return new Date().toISOString().split('T')[0];
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + addMonths);
    return d.toISOString().split('T')[0];
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Form State
  const [formData, setFormData] = useState<Partial<Equipment>>({
    code: '',
    name: '',
    brand: '',
    model: '',
    serialNumber: '',
    category: 'เครื่องช่วยหายใจ',
    department: 'คลังเครื่องมือกลาง',
    status: 'AVAILABLE',
    pmFrequencyMonths: 6,
    calFrequencyMonths: 12,
    lastPmDate: todayStr,
    nextPmDate: calcNextDate(todayStr, 6),
    lastCalDate: todayStr,
    nextCalDate: calcNextDate(todayStr, 12),
    supplier: '',
    price: 0,
    notes: '',
    imageUrl: '',
    nameplateImageUrl: '',
    stickerImageUrl: '',
  });

  const isReadOnly = currentUser.permissionRole === 'VIEW_ONLY';

  // Handle image file upload (convert to Base64 data URL)
  const handleFileUpload = (field: 'imageUrl' | 'nameplateImageUrl' | 'stickerImageUrl', file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('ไฟล์รูปภาพขนาดใหญ่เกิน 5MB กรุณาเลือกไฟล์ที่ขนาดเล็กลง');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Handle open add form with auto-code
  const handleOpenAddForm = () => {
    if (isReadOnly) {
      alert('บัญชีของท่านมีสิทธิ์ "ดูได้อย่างเดียว" ไม่สามารถลงทะเบียนเครื่องใหม่ได้');
      return;
    }

    const nextCode = generateNextEquipmentCode(equipmentList);
    const initPmDate = calcNextDate(todayStr, 6);
    const initCalDate = calcNextDate(todayStr, 12);

    setFormData({
      code: nextCode,
      name: '',
      brand: '',
      model: '',
      serialNumber: '',
      category: 'เครื่องช่วยหายใจ',
      department: 'คลังเครื่องมือกลาง',
      status: 'AVAILABLE',
      pmFrequencyMonths: 6,
      calFrequencyMonths: 12,
      lastPmDate: todayStr,
      nextPmDate: initPmDate,
      lastCalDate: todayStr,
      nextCalDate: initCalDate,
      supplier: '',
      price: 0,
      notes: '',
      imageUrl: '',
      nameplateImageUrl: '',
      stickerImageUrl: '',
    });
    setEditingEquipment(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditForm = (eq: Equipment) => {
    setEditingEquipment(eq);
    setFormData({ ...eq });
    setIsAddModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.serialNumber) {
      alert('กรุณากรอกชื่อเครื่องและ Serial Number');
      return;
    }
    onSaveEquipment(formData);
    setIsAddModalOpen(false);
  };

  // Filter Categories & List
  const categories = Array.from(new Set(equipmentList.map((e) => e.category || 'อื่นๆ')));

  const filteredList = equipmentList.filter((eq) => {
    const matchesSearch = 
      eq.code.toLowerCase().includes(search.toLowerCase()) ||
      eq.name.toLowerCase().includes(search.toLowerCase()) ||
      eq.brand.toLowerCase().includes(search.toLowerCase()) ||
      eq.model.toLowerCase().includes(search.toLowerCase()) ||
      eq.serialNumber.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || eq.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || eq.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Status Badge Helper
  const getStatusBadge = (status: EquipmentStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3" />
            <span>พร้อมใช้งาน</span>
          </span>
        );
      case 'BORROWED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1 w-fit">
            <ArrowLeftRight className="w-3 h-3" />
            <span>ถูกยืมอยู่</span>
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 w-fit">
            <Wrench className="w-3 h-3" />
            <span>ส่งซ่อม</span>
          </span>
        );
      case 'CALIBRATION_DUE':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3" />
            <span>ถึงรอบ PM/Cal</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700 text-slate-300 w-fit">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>ทะเบียนเครื่องมือแพทย์ (Equipment Inventory)</span>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-400 font-mono px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
              {filteredList.length} รายการ
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ลงทะเบียน จัดการ Serial Number พิมพ์ QR Code สติ๊กเกอร์ และตรวจสอบวัน PM/Calibration
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenMasterCatalogModal && (
            <button
              onClick={onOpenMasterCatalogModal}
              className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-all"
              title="จัดการชื่อ ยี่ห้อ รุ่น มาตรฐาน"
            >
              <Tag className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>⚙️ Master Catalog (แอดมิน)</span>
            </button>
          )}

          <button
            onClick={handleOpenAddForm}
            className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ ลงทะเบียนเครื่องมือแพทย์</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาตามรหัส, ชื่อเครื่อง, Serial, ยี่ห้อ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white text-slate-900 placeholder:text-slate-500 border-2 border-slate-300 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="ALL">หมวดหมู่ทั้งหมด</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="ALL">สถานะทั้งหมด</option>
          <option value="AVAILABLE">พร้อมใช้งาน (Available)</option>
          <option value="BORROWED">ถูกยืมอยู่ (Borrowed)</option>
          <option value="MAINTENANCE">ส่งซ่อม (Maintenance)</option>
          <option value="CALIBRATION_DUE">ถึงรอบ PM/Cal</option>
        </select>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.map((eq) => (
          <div
            key={eq.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-4 shadow-sm space-y-3 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              {/* Top Row: Code & Status */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 px-2.5 py-1 rounded-lg">
                  {eq.code}
                </span>
                {getStatusBadge(eq.status)}
              </div>

              {/* Equipment Main Photo Preview if available */}
              {eq.imageUrl ? (
                <div 
                  onClick={() => onOpenEquipmentDetail(eq)}
                  className="relative h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 cursor-pointer group"
                >
                  <img src={eq.imageUrl} alt={eq.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="px-2.5 py-1 bg-white/90 text-slate-900 rounded-lg text-[11px] font-bold shadow-md flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-teal-600" /> ดูรูปทั้งหมด
                    </span>
                  </div>
                </div>
              ) : null}

              {/* Title, Brand, Model */}
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm line-clamp-1">{eq.name}</h3>
                <p className="text-xs text-teal-600 dark:text-teal-300/90 font-medium mt-0.5">
                  ยี่ห้อ: {eq.brand} | รุ่น: {eq.model}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  Serial No: {eq.serialNumber}
                </p>
              </div>

              {/* Badges for attached photos */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${eq.imageUrl ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  {eq.imageUrl ? '✓ รูปหน้าเครื่อง' : 'ไม่มีรูปหน้าเครื่อง'}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${eq.nameplateImageUrl ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  {eq.nameplateImageUrl ? '✓ รูป Nameplate' : 'ไม่มีรูป Nameplate'}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${eq.stickerImageUrl ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  {eq.stickerImageUrl ? '✓ รูปสติ๊กเกอร์' : 'ไม่มีรูปสติ๊กเกอร์'}
                </span>
              </div>

              {/* Department & PM Dates */}
              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex justify-between">
                  <span>แผนก/คลัง:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{eq.department}</span>
                </div>
                <div className="flex justify-between">
                  <span>รอบ PM ถัดไป:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-mono">{eq.nextPmDate || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span>รอบ Calibration:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-mono">{eq.nextCalDate || '-'}</span>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1.5">
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onOpenStickerModal(eq)}
                  className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs flex items-center gap-1 transition-all"
                  title="พิมพ์ QR Code & สติ๊กเกอร์"
                >
                  <Printer className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span className="text-[11px] hidden sm:inline">สติ๊กเกอร์</span>
                </button>

                <button
                  onClick={() => handleOpenEditForm(eq)}
                  className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg text-xs transition-all"
                  title="แก้ไขข้อมูล"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                {eq.status === 'AVAILABLE' && (
                  <button
                    onClick={() => onOpenBorrowModal(eq)}
                    className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-lg text-xs transition-all shadow-sm"
                  >
                    ยืมเครื่อง
                  </button>
                )}

                {eq.status === 'BORROWED' && eq.currentBorrowRecord && (
                  <button
                    onClick={() => onOpenReturnModal(eq.currentBorrowRecord)}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs transition-all shadow-sm"
                  >
                    รับคืน
                  </button>
                )}

                <button
                  onClick={() => onOpenEquipmentDetail(eq)}
                  className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium rounded-lg text-xs transition-all"
                >
                  รายละเอียด
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Equipment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl p-5 sm:p-6 shadow-2xl text-slate-900 dark:text-slate-200 my-8 transition-all">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <span>{editingEquipment ? 'แก้ไขข้อมูลเครื่องมือแพทย์' : 'ลงทะเบียนเครื่องมือแพทย์ใหม่'}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              
              {/* Master Catalog Selector Box */}
              <div className="p-3 bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-teal-900 dark:text-teal-300 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-teal-600" />
                    <span>คลิกเลือกจาก Master Catalog (เพื่อชื่อ ยี่ห้อ รุ่น ที่เป็นมาตรฐาน)</span>
                  </label>
                  {onOpenMasterCatalogModal && (
                    <button
                      type="button"
                      onClick={onOpenMasterCatalogModal}
                      className="text-[11px] text-teal-700 dark:text-teal-300 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>⚙️ จัดการ Catalog</span>
                    </button>
                  )}
                </div>

                <select
                  onChange={(e) => {
                    const catId = e.target.value;
                    if (!catId) return;
                    const item = catalog.find((c) => c.id === catId);
                    if (item) {
                      setFormData((prev) => ({
                        ...prev,
                        name: item.name,
                        brand: item.brand,
                        model: item.model,
                        category: item.category || prev.category,
                      }));
                    }
                  }}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-teal-300 dark:border-teal-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">-- คลิกเลือกชื่อ ยี่ห้อ รุ่น มาตรฐาน จากคลัง Catalog --</option>
                  {catalog.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} | ยี่ห้อ: {cat.brand} | รุ่น: {cat.model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Code (Auto generated) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    รหัสเครื่อง (Equipment Code)
                  </label>
                  <input
                    type="text"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-teal-700 dark:text-teal-400 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="EQ000001"
                    required
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-0.5">* รหัสสร้างอัตโนมัติเรียงตามลำดับ</p>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    ชื่อเครื่องมือแพทย์ *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="เช่น เครื่องช่วยหายใจ, Infusion Pump"
                    required
                  />
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">ยี่ห้อ (Brand) *</label>
                  <input
                    type="text"
                    value={formData.brand || ''}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="เช่น Mindray, Hamilton, Terumo"
                    required
                  />
                </div>

                {/* Model */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">รุ่น (Model) *</label>
                  <input
                    type="text"
                    value={formData.model || ''}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="เช่น TE-LM800, T1, N12"
                    required
                  />
                </div>

                {/* Serial Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Serial Number (S/N) *</label>
                  <input
                    type="text"
                    value={formData.serialNumber || ''}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="เช่น SN-883011"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">หมวดหมู่เครื่องมือ</label>
                  <select
                    value={formData.category || 'เครื่องช่วยหายใจ'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="เครื่องช่วยหายใจ">เครื่องช่วยหายใจ (Ventilator)</option>
                    <option value="Infusion Pump">เครื่องให้สารน้ำ (Infusion Pump)</option>
                    <option value="Syringe Pump">เครื่องให้ยาไซริงค์ (Syringe Pump)</option>
                    <option value="Patient Monitor">เครื่องเฝ้าติดตามสัญญาณชีพ (Monitor)</option>
                    <option value="เครื่องผลิตออกซิเจน">เครื่องผลิตออกซิเจน (Oxygen Concentrator)</option>
                    <option value="เครื่องดูดเสมหะ">เครื่องดูดเสมหะ (Suction Machine)</option>
                    <option value="เครื่องกระตุกหัวใจ">เครื่องกระตุกหัวใจ (Defibrillator)</option>
                    <option value="เครื่องตรวจคลื่นหัวใจ">เครื่องตรวจคลื่นหัวใจ (ECG)</option>
                    <option value="อุปกรณ์การแพทย์ทั่วไป">อุปกรณ์การแพทย์ทั่วไป</option>
                  </select>
                </div>

                {/* Department / Storage */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">แผนก / คลังจัดเก็บ</label>
                  <input
                    type="text"
                    value={formData.department || ''}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="เช่น คลังเครื่องมือกลาง, ICU, Homecare"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">สถานะเครื่อง</label>
                  <select
                    value={formData.status || 'AVAILABLE'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as EquipmentStatus })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="AVAILABLE">พร้อมใช้งาน (Available)</option>
                    <option value="BORROWED">ถูกยืมอยู่ (Borrowed)</option>
                    <option value="MAINTENANCE">ส่งซ่อม (Maintenance)</option>
                    <option value="CALIBRATION_DUE">ถึงรอบ PM/Cal</option>
                  </select>
                </div>

                {/* PM Freq & Last PM Date */}
                <div className="sm:col-span-2 p-3 bg-blue-50/70 dark:bg-blue-950/30 border-2 border-blue-300 dark:border-blue-800 rounded-2xl space-y-3">
                  <p className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>การบำรุงรักษาเชิงป้องกัน (PM Schedule)</span>
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">ความถี่ทำ PM</label>
                      <select
                        value={formData.pmFrequencyMonths || 6}
                        onChange={(e) => {
                          const freq = Number(e.target.value);
                          const lastDate = formData.lastPmDate || todayStr;
                          setFormData({ 
                            ...formData, 
                            pmFrequencyMonths: freq,
                            nextPmDate: calcNextDate(lastDate, freq)
                          });
                        }}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={3}>ทุก 3 เดือน</option>
                        <option value={6}>ทุก 6 เดือน</option>
                        <option value={12}>ทุก 12 เดือน (1 ปี)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">ทำ PM ล่าสุดเมื่อ</label>
                      <input
                        type="date"
                        value={formData.lastPmDate || ''}
                        onChange={(e) => {
                          const lastDate = e.target.value;
                          const freq = formData.pmFrequencyMonths || 6;
                          setFormData({ 
                            ...formData, 
                            lastPmDate: lastDate,
                            nextPmDate: calcNextDate(lastDate, freq)
                          });
                        }}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-blue-900 dark:text-blue-300 mb-1">
                        * รอบ PM ครั้งถัดไป (แจ้งเตือน)
                      </label>
                      <input
                        type="date"
                        value={formData.nextPmDate || ''}
                        onChange={(e) => setFormData({ ...formData, nextPmDate: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border-2 border-blue-500 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Cal Freq & Last Cal Date */}
                <div className="sm:col-span-2 p-3 bg-indigo-50/70 dark:bg-indigo-950/30 border-2 border-indigo-300 dark:border-indigo-800 rounded-2xl space-y-3">
                  <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-indigo-600" />
                    <span>การสอบเทียบความแม่นยำ (Calibration Schedule)</span>
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">ความถี่ Calibration</label>
                      <select
                        value={formData.calFrequencyMonths || 12}
                        onChange={(e) => {
                          const freq = Number(e.target.value);
                          const lastDate = formData.lastCalDate || todayStr;
                          setFormData({ 
                            ...formData, 
                            calFrequencyMonths: freq,
                            nextCalDate: calcNextDate(lastDate, freq)
                          });
                        }}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value={6}>ทุก 6 เดือน</option>
                        <option value={12}>ทุก 12 เดือน (1 ปี)</option>
                        <option value={24}>ทุก 24 เดือน (2 ปี)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">ทำ Cal ล่าสุดเมื่อ</label>
                      <input
                        type="date"
                        value={formData.lastCalDate || ''}
                        onChange={(e) => {
                          const lastDate = e.target.value;
                          const freq = formData.calFrequencyMonths || 12;
                          setFormData({ 
                            ...formData, 
                            lastCalDate: lastDate,
                            nextCalDate: calcNextDate(lastDate, freq)
                          });
                        }}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-indigo-900 dark:text-indigo-300 mb-1">
                        * รอบ Cal ครั้งถัดไป (แจ้งเตือน)
                      </label>
                      <input
                        type="date"
                        value={formData.nextCalDate || ''}
                        onChange={(e) => setFormData({ ...formData, nextCalDate: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border-2 border-indigo-500 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* 📸 3 Required Images Upload Section */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>อัปโหลดรูปภาพเครื่องมือแพทย์ (แนบได้ 3 รูป)</span>
                  </p>
                  <span className="text-[11px] text-slate-500">รองรับไฟล์ภาพ JPG, PNG (ถ่ายจากมือถือได้)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  
                  {/* 1. รูปหน้าเครื่อง 1 รูป */}
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                        <span>1. รูปหน้าเครื่อง (1 รูป)</span>
                      </label>
                      {formData.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
                          className="text-[10px] text-rose-500 hover:underline font-bold"
                        >
                          ลบรูป
                        </button>
                      )}
                    </div>

                    {formData.imageUrl ? (
                      <div className="relative h-28 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                        <img src={formData.imageUrl} alt="หน้าเครื่อง" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-28 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center p-2 text-center bg-slate-50/50 dark:bg-slate-900/50">
                        <Upload className="w-5 h-5 text-slate-400 mb-1" />
                        <p className="text-[10px] text-slate-500 font-medium">คลิกถ่ายภาพ / แนบรูปหน้าเครื่อง</p>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      id="file-input-imageUrl"
                      className="hidden"
                      onChange={(e) => handleFileUpload('imageUrl', e.target.files?.[0] || null)}
                    />
                    <label
                      htmlFor="file-input-imageUrl"
                      className="block text-center w-full py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-lg cursor-pointer transition-all border border-blue-200 dark:border-blue-800"
                    >
                      📷 ถ่ายรูป / เลือกรูปหน้าเครื่อง
                    </label>
                  </div>

                  {/* 2. รูป NAMEPLATE ที่เห็น SN และชื่อเครื่องชัดเจน */}
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-amber-600" />
                        <span>2. รูป NAMEPLATE (SN ชัดเจน)</span>
                      </label>
                      {formData.nameplateImageUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, nameplateImageUrl: '' }))}
                          className="text-[10px] text-rose-500 hover:underline font-bold"
                        >
                          ลบรูป
                        </button>
                      )}
                    </div>

                    {formData.nameplateImageUrl ? (
                      <div className="relative h-28 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                        <img src={formData.nameplateImageUrl} alt="Nameplate" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-28 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center p-2 text-center bg-slate-50/50 dark:bg-slate-900/50">
                        <Upload className="w-5 h-5 text-slate-400 mb-1" />
                        <p className="text-[10px] text-slate-500 font-medium">ถ่ายรูปป้าย NAMEPLATE / SN ชัดเจน</p>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      id="file-input-nameplate"
                      className="hidden"
                      onChange={(e) => handleFileUpload('nameplateImageUrl', e.target.files?.[0] || null)}
                    />
                    <label
                      htmlFor="file-input-nameplate"
                      className="block text-center w-full py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300 text-xs font-bold rounded-lg cursor-pointer transition-all border border-amber-200 dark:border-amber-800"
                    >
                      🏷️ ถ่ายรูป / เลือกรูป Nameplate
                    </label>
                  </div>

                  {/* 3. รูปหน้าเครื่องพร้อมเห็นสติ๊กเกอร์ */}
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-emerald-600" />
                        <span>3. รูปหน้าเครื่อง + สติ๊กเกอร์</span>
                      </label>
                      {formData.stickerImageUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, stickerImageUrl: '' }))}
                          className="text-[10px] text-rose-500 hover:underline font-bold"
                        >
                          ลบรูป
                        </button>
                      )}
                    </div>

                    {formData.stickerImageUrl ? (
                      <div className="relative h-28 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                        <img src={formData.stickerImageUrl} alt="หน้าเครื่องพร้อมสติ๊กเกอร์" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-28 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center p-2 text-center bg-slate-50/50 dark:bg-slate-900/50">
                        <Upload className="w-5 h-5 text-slate-400 mb-1" />
                        <p className="text-[10px] text-slate-500 font-medium">รูปติดสติ๊กเกอร์ PM/Cal เห็นชัดเจน</p>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      id="file-input-sticker"
                      className="hidden"
                      onChange={(e) => handleFileUpload('stickerImageUrl', e.target.files?.[0] || null)}
                    />
                    <label
                      htmlFor="file-input-sticker"
                      className="block text-center w-full py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-lg cursor-pointer transition-all border border-emerald-200 dark:border-emerald-800"
                    >
                      📌 ถ่ายรูป / เลือกรูปสติ๊กเกอร์
                    </label>
                  </div>

                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">หมายเหตุ / อุปกรณ์ประกอบ</label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="รายละเอียดเพิ่มเติม เช่น มีเสาแขวน, ปลั๊กพกพา"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl text-xs shadow-md transition-all"
                >
                  บันทึกข้อมูล
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
