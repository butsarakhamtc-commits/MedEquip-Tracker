import React, { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  X, 
  Upload, 
  Image as ImageIcon, 
  DollarSign, 
  FileText, 
  Hammer,
  ShieldAlert,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { MaintenanceRecord, Equipment, User, RepairUrgency, RepairStatus } from '../types';
import { StorageService } from '../services/storage';
import { ConfirmModal } from './ConfirmModal';

interface MaintenanceViewProps {
  maintenanceList: MaintenanceRecord[];
  equipmentList: Equipment[];
  currentUser: User;
  onRefreshData: () => void;
  onDeleteMaintenanceRecord?: (ticketId: string) => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  maintenanceList,
  equipmentList,
  currentUser,
  onRefreshData,
  onDeleteMaintenanceRecord,
}) => {
  const [activeStatusTab, setActiveStatusTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('ALL');

  // Modals state
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [acceptingTicket, setAcceptingTicket] = useState<MaintenanceRecord | null>(null);
  const [completingTicket, setCompletingTicket] = useState<MaintenanceRecord | null>(null);
  const [deletingTicket, setDeletingTicket] = useState<MaintenanceRecord | null>(null);

  // Form State: New Ticket
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('');
  const [reporterName, setReporterName] = useState<string>(currentUser.name || '');
  const [urgency, setUrgency] = useState<RepairUrgency>('NORMAL');
  const [symptom, setSymptom] = useState<string>('');
  const [issueImageUrl, setIssueImageUrl] = useState<string>('');

  // Form State: Accept Ticket
  const [technicianName, setTechnicianName] = useState<string>(currentUser.name || '');

  // Form State: Complete Ticket
  const [repairDetails, setRepairDetails] = useState<string>('');
  const [partsReplaced, setPartsReplaced] = useState<string>('');
  const [repairCost, setRepairCost] = useState<number>(0);

  // Handle Photo Upload
  const handlePhotoUpload = (file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('ขนาดไฟล์ภาพใหญ่เกิน 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setIssueImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit New Repair Request
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipmentId) {
      alert('กรุณาเลือกเครื่องมือแพทย์ที่ต้องการส่งซ่อม');
      return;
    }
    if (!symptom.trim()) {
      alert('กรุณาระบุอาการเสีย / สาเหตุปัญหา');
      return;
    }

    try {
      StorageService.createMaintenanceRecord({
        equipmentId: selectedEquipmentId,
        reporterName,
        symptom,
        urgency,
        issueImageUrl,
      });

      alert('ลงทะเบียนแจ้งซ่อมเรียบร้อยแล้ว');
      setIsNewTicketModalOpen(false);
      
      // Reset
      setSelectedEquipmentId('');
      setSymptom('');
      setIssueImageUrl('');
      setUrgency('NORMAL');
      onRefreshData();
    } catch (err: any) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
  };

  // Submit Accept Repair Work
  const handleAcceptTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptingTicket) return;
    if (!technicianName.trim()) {
      alert('กรุณาระบุชื่อช่าง / วิศวกรผู้รับงาน');
      return;
    }

    try {
      StorageService.acceptMaintenanceTask(acceptingTicket.id, technicianName);
      alert(`ช่าง ${technicianName} กดรับงานซ่อม [${acceptingTicket.ticketNo}] เรียบร้อยแล้ว`);
      setAcceptingTicket(null);
      onRefreshData();
    } catch (err: any) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
  };

  // Submit Complete Repair Work
  const handleCompleteTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingTicket) return;
    if (!repairDetails.trim()) {
      alert('กรุณาระบุรายละเอียดการซ่อมแก้ไข');
      return;
    }

    try {
      StorageService.completeMaintenanceTask({
        ticketId: completingTicket.id,
        repairDetails,
        partsReplaced,
        cost: Number(repairCost) || 0,
      });

      alert(`ปิดงานซ่อม [${completingTicket.ticketNo}] เรียบร้อยแล้ว เครื่องมือพร้อมกลับมาใช้งาน`);
      setCompletingTicket(null);
      setRepairDetails('');
      setPartsReplaced('');
      setRepairCost(0);
      onRefreshData();
    } catch (err: any) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
  };

  // Filter List
  const filteredList = maintenanceList.filter((ticket) => {
    // Status Filter
    if (activeStatusTab !== 'ALL' && ticket.status !== activeStatusTab) return false;
    
    // Urgency Filter
    if (selectedUrgency !== 'ALL' && ticket.urgency !== selectedUrgency) return false;

    // Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNo = ticket.ticketNo.toLowerCase().includes(q);
      const matchEq = ticket.equipmentName.toLowerCase().includes(q) || ticket.equipmentCode.toLowerCase().includes(q);
      const matchSN = ticket.serialNumber.toLowerCase().includes(q);
      const matchReporter = ticket.reporterName.toLowerCase().includes(q);
      const matchTech = (ticket.assignedTechnician || '').toLowerCase().includes(q);
      return matchNo || matchEq || matchSN || matchReporter || matchTech;
    }

    return true;
  });

  const pendingCount = maintenanceList.filter((r) => r.status === 'PENDING').length;
  const inProgressCount = maintenanceList.filter((r) => r.status === 'IN_PROGRESS').length;
  const completedCount = maintenanceList.filter((r) => r.status === 'COMPLETED').length;

  const getUrgencyBadge = (u: RepairUrgency) => {
    switch (u) {
      case 'EMERGENCY':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse flex items-center gap-1"><ShieldAlert className="w-3 h-3"/> ด่วนที่สุด (Emergency)</span>;
      case 'URGENT':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> ด่วน (Urgent)</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">ปกติ (Normal)</span>;
    }
  };

  const getStatusBadge = (s: RepairStatus) => {
    switch (s) {
      case 'PENDING':
        return <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> รอช่างรับงาน</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800 flex items-center gap-1"><Hammer className="w-3.5 h-3.5 animate-bounce"/> กำลังซ่อมแซม</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> ซ่อมเสร็จปิดงาน</span>;
      default:
        return <span className="px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-100 text-slate-600">ยกเลิก</span>;
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 rounded-2xl border border-orange-200 dark:border-orange-800 shrink-0">
            <Hammer className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>ระบบแจ้งซ่อม & ติดตามงานซ่อมแซม</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-normal">
                {maintenanceList.length} รายการ
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              แจ้งเครื่องมือชำรุด/มีปัญหา ค้นหาด้วยรหัส SN ช่างรับงานซ่อม และบันทึกผลปิดงาน
            </p>
          </div>
        </div>

        {/* Action Button: New Repair Ticket */}
        <button
          onClick={() => {
            setReporterName(currentUser.name || '');
            setIsNewTicketModalOpen(true);
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>แจ้งซ่อมเครื่องมือแพทย์</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* รอช่างรับงาน (Pending) */}
        <div style={{ backgroundColor: '#662b07' }} className="p-4 rounded-2xl flex items-center justify-between text-white shadow-sm border border-amber-900/40">
          <div>
            <p className="text-xs font-bold text-amber-100">รอช่างรับงาน (Pending)</p>
            <p className="text-2xl font-black text-white mt-1">{pendingCount} <span className="text-xs font-normal opacity-80">งาน</span></p>
          </div>
          <div className="p-2.5 bg-white/10 text-amber-200 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* กำลังซ่อมแซม (In Progress) */}
        <div style={{ backgroundColor: '#12256f' }} className="p-4 rounded-2xl flex items-center justify-between text-white shadow-sm border border-blue-900/40">
          <div>
            <p className="text-xs font-bold text-blue-100">กำลังซ่อมแซม (In Progress)</p>
            <p className="text-2xl font-black text-white mt-1">{inProgressCount} <span className="text-xs font-normal opacity-80">งาน</span></p>
          </div>
          <div className="p-2.5 bg-white/10 text-blue-200 rounded-xl">
            <Hammer className="w-5 h-5" />
          </div>
        </div>

        {/* ซ่อมเสร็จปิดงาน (Completed) */}
        <div style={{ backgroundColor: '#0e6f52' }} className="p-4 rounded-2xl flex items-center justify-between text-white shadow-sm border border-emerald-900/40">
          <div>
            <p className="text-xs font-bold text-emerald-100">ซ่อมเสร็จปิดงาน (Completed)</p>
            <p className="text-2xl font-black text-white mt-1">{completedCount} <span className="text-xs font-normal opacity-80">งาน</span></p>
          </div>
          <div className="p-2.5 bg-white/10 text-emerald-200 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: 'ทั้งหมด' },
              { id: 'PENDING', label: `รอช่างรับงาน (${pendingCount})` },
              { id: 'IN_PROGRESS', label: `กำลังซ่อม (${inProgressCount})` },
              { id: 'COMPLETED', label: `ซ่อมเสร็จ (${completedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveStatusTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeStatusTab === tab.id
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input & Urgency Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหารหัสใบซ่อม, SN, เครื่อง..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="ALL">ความเร่งด่วนทั้งหมด</option>
              <option value="EMERGENCY">ด่วนที่สุด (Emergency)</option>
              <option value="URGENT">ด่วน (Urgent)</option>
              <option value="NORMAL">ปกติ (Normal)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">ไม่พบรายการแจ้งซ่อม</p>
            <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหา หรือกดปุ่ม "แจ้งซ่อมเครื่องมือแพทย์" เพื่อลงทะเบียนใหม่</p>
          </div>
        ) : (
          filteredList.map((ticket) => (
            <div 
              key={ticket.id}
              className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-orange-300 dark:hover:border-orange-800 transition-all space-y-3"
            >
              {/* Header line */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-orange-700 dark:text-orange-400 px-2.5 py-1 bg-orange-50 dark:bg-orange-950/60 rounded-lg border border-orange-200 dark:border-orange-800">
                    {ticket.ticketNo}
                  </span>
                  {getUrgencyBadge(ticket.urgency)}
                  {getStatusBadge(ticket.status)}
                </div>

                <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>แจ้งซ่อมเมื่อ: {ticket.reportedDate}</span>
                </span>
              </div>

              {/* Body details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Device Info */}
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="text-blue-700 dark:text-teal-400 font-mono">{ticket.equipmentCode}</span>
                    <span>{ticket.equipmentName}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    ยี่ห้อ/รุ่น: <span className="font-semibold text-slate-700 dark:text-slate-300">{ticket.brand} {ticket.model}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    S/N: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{ticket.serialNumber}</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    แผนก: {ticket.department} | ผู้แจ้ง: <span className="font-semibold text-slate-700 dark:text-slate-300">{ticket.reporterName}</span>
                  </p>
                </div>

                {/* Symptom & Cause */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5 md:col-span-1">
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>อาการเสีย / สาเหตุ:</span>
                  </p>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    {ticket.symptom}
                  </p>
                  {ticket.issueImageUrl && (
                    <a 
                      href={ticket.issueImageUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline font-bold mt-1"
                    >
                      <ImageIcon className="w-3 h-3" />
                      <span>ดูรูปถ่ายอาการเสีย</span>
                    </a>
                  )}
                </div>

                {/* Technician & Action Status */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                      <span>ช่างผู้รับผิดชอบ:</span>
                    </p>
                    {ticket.assignedTechnician ? (
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {ticket.assignedTechnician}
                      </p>
                    ) : (
                      <p className="text-xs text-amber-600 font-medium italic">ยังไม่มีช่างกดรับงาน</p>
                    )}

                    {ticket.acceptedDate && (
                      <p className="text-[10px] text-slate-400 font-mono">รับงานเมื่อ: {ticket.acceptedDate}</p>
                    )}

                    {ticket.completedDate && (
                      <p className="text-[10px] text-emerald-600 font-bold font-mono">
                        ปิดงานเมื่อ: {ticket.completedDate} (ใช้เวลา {ticket.repairTurnaroundDays || 1} วัน)
                      </p>
                    )}
                  </div>

                  {/* Actions Buttons */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                    {ticket.status === 'PENDING' && (
                      <button
                        onClick={() => {
                          setTechnicianName(currentUser.name || '');
                          setAcceptingTicket(ticket);
                        }}
                        className="flex-1 py-1.5 px-3 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>กดรับงานซ่อม</span>
                      </button>
                    )}

                    {ticket.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => {
                          setCompletingTicket(ticket);
                          setRepairDetails('');
                          setPartsReplaced('');
                          setRepairCost(0);
                        }}
                        className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>บันทึกผล & ปิดงานซ่อม</span>
                      </button>
                    )}

                    {ticket.status === 'COMPLETED' && (
                      <div className="text-right flex-1">
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                          ค่าบริการ: ฿{(ticket.cost || 0).toLocaleString()}
                        </span>
                      </div>
                    )}

                    {onDeleteMaintenanceRecord && currentUser.permissionRole !== 'VIEW_ONLY' && (
                      <button
                        onClick={() => setDeletingTicket(ticket)}
                        className="p-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl text-xs transition-all shrink-0"
                        title="ลบใบแจ้งซ่อมนี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                </div>

              </div>

              {/* Show repair outcome detail if completed */}
              {ticket.status === 'COMPLETED' && ticket.repairDetails && (
                <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs space-y-1">
                  <p className="font-bold text-emerald-900 dark:text-emerald-300">ผลการซ่อมและแก้ไขปัญหา:</p>
                  <p className="text-slate-800 dark:text-slate-200">{ticket.repairDetails}</p>
                  {ticket.partsReplaced && (
                    <p className="text-slate-500 font-medium">อะไหล่ที่เปลี่ยน: {ticket.partsReplaced}</p>
                  )}
                </div>
              )}

            </div>
          ))
        )}
      </div>

      {/* MODAL 1: แจ้งซ่อมเครื่องมือแพทย์ใหม่ */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-xl text-slate-800 dark:text-slate-200 my-8 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-50 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border border-orange-200">
                  <Hammer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">ลงทะเบียนแจ้งซ่อมเครื่องมือแพทย์</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">ระบุรหัสเครื่องมือและอาการเสียเพื่อส่งเรื่องให้ทีมช่าง</p>
                </div>
              </div>

              <button onClick={() => setIsNewTicketModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              
              {/* Select Equipment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  เลือกเครื่องมือแพทย์ที่ชำรุด/มีปัญหา *
                </label>
                <select
                  value={selectedEquipmentId}
                  onChange={(e) => setSelectedEquipmentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">-- กรุณาเลือกเครื่องมือแพทย์ (ค้นหาด้วยรหัส/SN) --</option>
                  {equipmentList.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      [{eq.code}] {eq.name} (SN: {eq.serialNumber}) - {eq.department}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reporter & Urgency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ชื่อผู้แจ้งซ่อม *
                  </label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="เช่น พว. สมหญิง / เซลล์สมชาย"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ระดับความเร่งด่วน *
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as RepairUrgency)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="NORMAL">ปกติ (Normal)</option>
                    <option value="URGENT">ด่วน (Urgent)</option>
                    <option value="EMERGENCY">ด่วนที่สุด (Emergency)</option>
                  </select>
                </div>
              </div>

              {/* Symptom Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  อาการเสีย / เกิดจากอะไร *
                </label>
                <textarea
                  rows={3}
                  value={symptom}
                  onChange={(e) => setSymptom(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="เช่น เครื่องเปิดไม่ติด, มีเสียงเตือน Battery Warning, สายไฟชำรุด, ลมรั่ว..."
                  required
                />
              </div>

              {/* Upload Image for Issue */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-orange-600" />
                  <span>แนบรูปถ่ายอาการเสีย (ถ้ามี)</span>
                </label>

                {issueImageUrl ? (
                  <div className="relative h-28 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img src={issueImageUrl} alt="รูปถ่ายอาการเสีย" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setIssueImageUrl('')}
                      className="absolute top-1 right-1 px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded-md shadow"
                    >
                      ลบรูป
                    </button>
                  </div>
                ) : (
                  <div className="h-20 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center p-2 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      id="file-repair-photo"
                      className="hidden"
                      onChange={(e) => handlePhotoUpload(e.target.files?.[0] || null)}
                    />
                    <label
                      htmlFor="file-repair-photo"
                      className="cursor-pointer text-xs text-orange-600 font-bold flex items-center gap-1.5 hover:underline"
                    >
                      <Upload className="w-4 h-4" />
                      <span>ถ่ายภาพ / เลือกไฟล์รูปภาพอาการเสีย</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Modal buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewTicketModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  บันทึกการแจ้งซ่อม
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: ช่างกดรับงานซ่อม */}
      {acceptingTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-xl text-slate-800 dark:text-slate-200 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">รับงานซ่อม [{acceptingTicket.ticketNo}]</h3>
              </div>
              <button onClick={() => setAcceptingTicket(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1">
              <p><span className="text-slate-500">เครื่องมือ:</span> <span className="font-bold text-slate-900 dark:text-white">{acceptingTicket.equipmentName}</span></p>
              <p><span className="text-slate-500">อาการเสีย:</span> <span className="text-amber-700 dark:text-amber-400 font-semibold">{acceptingTicket.symptom}</span></p>
            </div>

            <form onSubmit={handleAcceptTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ชื่อช่าง / วิศวกรผู้รับงานซ่อม *
                </label>
                <input
                  type="text"
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="เช่น วิศวกร ธนพล / ช่างวิเชียร"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAcceptingTicket(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-medium text-xs rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  ยืนยันรับงานซ่อม
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL 3: ช่างกดปิดงานซ่อม */}
      {completingTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-xl text-slate-800 dark:text-slate-200 my-8 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">บันทึกผล & ปิดงานซ่อม [{completingTicket.ticketNo}]</h3>
              </div>
              <button onClick={() => setCompletingTicket(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteTask} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  รายละเอียดการซ่อมแก้ไข *
                </label>
                <textarea
                  rows={3}
                  value={repairDetails}
                  onChange={(e) => setRepairDetails(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="เช่น ทำการเปลี่ยนแบตเตอรี่ก้อนใหม่ Calibrate แรงดัน และทดสอบการทำงานผ่านเกณฑ์มาตรฐาน..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    อะไหล่ที่เปลี่ยน (ถ้ามี)
                  </label>
                  <input
                    type="text"
                    value={partsReplaced}
                    onChange={(e) => setPartsReplaced(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="เช่น Battery 12V 7Ah, Board"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ค่าบริการ/ค่าอะไหล่ (บาท)
                  </label>
                  <input
                    type="number"
                    value={repairCost}
                    onChange={(e) => setRepairCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCompletingTicket(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-medium text-xs rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  บันทึกปิดงานซ่อม
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Confirm Delete Ticket Modal */}
      {onDeleteMaintenanceRecord && (
        <ConfirmModal
          isOpen={!!deletingTicket}
          title={`ยืนยันลบใบแจ้งซ่อม [${deletingTicket?.ticketNo || ''}]`}
          message={`คุณต้องการลบใบแจ้งซ่อมเลขที่ [${deletingTicket?.ticketNo || ''}] ของเครื่อง ${deletingTicket?.equipmentName || ''} ออกจากระบบใช่หรือไม่?`}
          onConfirm={() => {
            if (deletingTicket) {
              onDeleteMaintenanceRecord(deletingTicket.id);
            }
          }}
          onClose={() => setDeletingTicket(null)}
        />
      )}

    </div>
  );
};
