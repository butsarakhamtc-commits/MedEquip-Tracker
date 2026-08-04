import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Tag, BookOpen, Check, Layers } from 'lucide-react';
import { EquipmentCatalogItem } from '../types';
import { StorageService } from '../services/storage';

interface MasterCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: EquipmentCatalogItem[];
  onRefreshData: () => void;
  onSelectCatalogItem?: (item: EquipmentCatalogItem) => void;
  isAdmin: boolean;
}

export const MasterCatalogModal: React.FC<MasterCatalogModalProps> = ({
  isOpen,
  onClose,
  catalog,
  onRefreshData,
  onSelectCatalogItem,
  isAdmin,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Partial<EquipmentCatalogItem>>({
    name: '',
    brand: '',
    model: '',
    category: 'เครื่องช่วยหายใจ',
    defaultPmMonths: 6,
    defaultCalMonths: 12,
  });

  if (!isOpen) return null;

  const canManage = isAdmin || true; // Allow catalog management for anyone managing catalog

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem.name?.trim() || !editingItem.brand?.trim() || !editingItem.model?.trim()) {
      alert('กรุณากรอกชื่อเครื่องมือ, ยี่ห้อ, และรุ่นให้ครบถ้วน');
      return;
    }

    try {
      StorageService.saveEquipmentCatalogItem(editingItem);
      alert('บันทึกข้อมูลใน Master Catalog เรียบร้อยแล้ว');
      setIsEditing(false);
      setEditingItem({
        name: '',
        brand: '',
        model: '',
        category: 'เครื่องช่วยหายใจ',
        defaultPmMonths: 6,
        defaultCalMonths: 12,
      });
      onRefreshData();
    } catch (err: any) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
  };

  const executeDelete = (id: string) => {
    StorageService.deleteEquipmentCatalogItem(id);
    setDeletingId(null);
    onRefreshData();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl p-5 sm:p-6 shadow-2xl text-slate-800 dark:text-slate-200 my-8 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400 border border-teal-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Master Catalog เครื่องมือแพทย์ (มาตรฐานแอดมิน)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                รายการ ชื่อ-ยี่ห้อ-รุ่น มาตรฐาน เพื่อให้ผู้ลงข้อมูลคลิกเลือกใช้ชื่อตรงกัน
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add/Edit Form for Catalog Managers */}
        {canManage && (
          <div className="p-4 bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-teal-900 dark:text-teal-300 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-teal-600" />
                <span>{editingItem.id ? 'แก้ไขรายการใน Catalog' : 'เพิ่มรายการใหม่ลงใน Master Catalog'}</span>
              </p>
              {isEditing && (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditingItem({ name: '', brand: '', model: '', category: 'เครื่องช่วยหายใจ', defaultPmMonths: 6, defaultCalMonths: 12 });
                  }}
                  className="text-xs text-rose-600 hover:underline font-bold"
                >
                  ยกเลิกการแก้ไข
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ชื่อเครื่องมือแพทย์ *
                  </label>
                  <input
                    type="text"
                    value={editingItem.name || ''}
                    onChange={(e) => {
                      setIsEditing(true);
                      setEditingItem({ ...editingItem, name: e.target.value });
                    }}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-teal-300 dark:border-teal-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="เช่น Infusion Pump"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ยี่ห้อ (Brand) *
                  </label>
                  <input
                    type="text"
                    value={editingItem.brand || ''}
                    onChange={(e) => {
                      setIsEditing(true);
                      setEditingItem({ ...editingItem, brand: e.target.value });
                    }}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-teal-300 dark:border-teal-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="เช่น Terumo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    รุ่น (Model) *
                  </label>
                  <input
                    type="text"
                    value={editingItem.model || ''}
                    onChange={(e) => {
                      setIsEditing(true);
                      setEditingItem({ ...editingItem, model: e.target.value });
                    }}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-teal-300 dark:border-teal-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="เช่น TE-LM800"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{editingItem.id ? 'บันทึกการแก้ไข' : 'เพิ่มเข้า Master Catalog'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Catalog List */}
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            รายการมาตรฐานที่มีอยู่ ({catalog.length} รายการ):
          </p>

          {catalog.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 hover:border-teal-400 transition-all"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {item.name}
                </p>
                <p className="text-[11px] text-slate-500">
                  ยี่ห้อ: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.brand}</span> | รุ่น: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.model}</span> | หมวด: <span className="text-teal-600 font-medium">{item.category}</span>
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {onSelectCatalogItem && (
                  <button
                    onClick={() => {
                      onSelectCatalogItem(item);
                      onClose();
                    }}
                    className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold rounded-lg shadow-sm flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>เลือกใช้นี้</span>
                  </button>
                )}

                {deletingId === item.id ? (
                  <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/80 p-1.5 rounded-lg border border-rose-200 dark:border-rose-800 animate-fadeIn">
                    <span className="text-[11px] text-rose-700 dark:text-rose-300 font-bold px-1">ยืนยันลบ?</span>
                    <button
                      type="button"
                      onClick={() => executeDelete(item.id)}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold rounded-md shadow-xs"
                    >
                      ลบเลย
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingId(null)}
                      className="px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold rounded-md"
                    >
                      ยกเลิก
                    </button>
                  </div>
                ) : (
                  canManage && (
                    <>
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setEditingItem(item);
                        }}
                        className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/50 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                        title="แก้ไข"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">แก้ไข</span>
                      </button>
                      <button
                        onClick={() => setDeletingId(item.id)}
                        className="px-2 py-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                        title="ลบออกจาก Master Catalog"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ลบ</span>
                      </button>
                    </>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
