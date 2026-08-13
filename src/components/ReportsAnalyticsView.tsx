import React, { useState } from 'react';
import { 
  FileBarChart, 
  Download, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  PhoneCall, 
  ArrowLeftRight, 
  Hammer,
  ShieldAlert,
  Percent,
  Calendar,
  Layers,
  Filter
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { Equipment, BorrowRecord, PMRecord, MaintenanceRecord, CustomerCallLog } from '../types';

interface ReportsAnalyticsViewProps {
  equipmentList: Equipment[];
  borrowList: BorrowRecord[];
  pmList: PMRecord[];
  maintenanceList: MaintenanceRecord[];
}

export const ReportsAnalyticsView: React.FC<ReportsAnalyticsViewProps> = ({
  equipmentList,
  borrowList,
  pmList,
  maintenanceList,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');

  // Filter Borrows by selected month
  const monthlyBorrows = borrowList.filter((b) => b.borrowDate && b.borrowDate.startsWith(selectedMonth));

  // Count total customer call logs made in this month
  let monthlyCallCount = 0;
  borrowList.forEach((b) => {
    (b.callLogs || []).forEach((c) => {
      if (c.callDate && c.callDate.startsWith(selectedMonth)) {
        monthlyCallCount++;
      }
    });
  });

  // Overdue Borrows & Overdue Calls
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueBorrows = borrowList.filter((b) => b.status === 'ACTIVE' && b.expectedReturnDate < todayStr);
  const overdueCallsPending = borrowList.filter((b) => b.status === 'ACTIVE' && b.expectedReturnDate < todayStr && !b.isCustomerCalled);

  // Overdue PM/Cal
  const overduePmCalList = equipmentList.filter((e) => {
    const isPmOverdue = e.nextPmDate && e.nextPmDate < todayStr;
    const isCalOverdue = e.nextCalDate && e.nextCalDate < todayStr;
    return isPmOverdue || isCalOverdue;
  });

  // Monthly Repairs
  const monthlyRepairs = maintenanceList.filter((r) => r.reportedDate && r.reportedDate.startsWith(selectedMonth));
  const completedRepairs = maintenanceList.filter((r) => r.status === 'COMPLETED');
  
  // Average Repair Turnaround Days
  const totalRepairDays = completedRepairs.reduce((sum, r) => sum + (r.repairTurnaroundDays || 1), 0);
  const avgRepairDays = completedRepairs.length > 0 ? (totalRepairDays / completedRepairs.length).toFixed(1) : '0';

  // KPI Percentages
  // 1. On-time PM/Cal Compliance Rate (%)
  const totalEquipmentCount = equipmentList.length;
  const compliantEquipmentCount = totalEquipmentCount - overduePmCalList.length;
  const pmComplianceRate = totalEquipmentCount > 0 ? Math.round((compliantEquipmentCount / totalEquipmentCount) * 100) : 100;

  // 2. On-time Return Rate (%)
  const totalCompletedBorrows = borrowList.filter((b) => b.status === 'RETURNED').length;
  const returnedOnTimeCount = borrowList.filter((b) => b.status === 'RETURNED' && b.actualReturnDate && b.actualReturnDate <= b.expectedReturnDate).length;
  const onTimeReturnRate = totalCompletedBorrows > 0 ? Math.round((returnedOnTimeCount / totalCompletedBorrows) * 100) : 95;

  // 3. Equipment Availability Rate (%)
  const availableEquipmentCount = equipmentList.filter((e) => e.status === 'AVAILABLE').length;
  const availabilityRate = totalEquipmentCount > 0 ? Math.round((availableEquipmentCount / totalEquipmentCount) * 100) : 100;

  // Chart Data 1: Category Distribution
  const categoryCounts: { [cat: string]: number } = {};
  equipmentList.forEach((e) => {
    categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
  });
  const categoryChartData = Object.keys(categoryCounts).map((cat) => ({
    name: cat,
    value: categoryCounts[cat],
  }));

  // Chart Data 2: Equipment Status Breakdown
  const statusCounts = {
    AVAILABLE: equipmentList.filter((e) => e.status === 'AVAILABLE').length,
    BORROWED: equipmentList.filter((e) => e.status === 'BORROWED').length,
    MAINTENANCE: equipmentList.filter((e) => e.status === 'MAINTENANCE').length,
    CALIBRATION_DUE: equipmentList.filter((e) => e.status === 'CALIBRATION_DUE').length,
  };

  const statusChartData = [
    { name: 'พร้อมใช้งาน (Available)', value: statusCounts.AVAILABLE, color: '#10b981' },
    { name: 'ถูกยืมอยู่ (Borrowed)', value: statusCounts.BORROWED, color: '#3b82f6' },
    { name: 'ส่งซ่อมแซม (Maintenance)', value: statusCounts.MAINTENANCE, color: '#f97316' },
    { name: 'ถึงกำหนด PM/Cal', value: statusCounts.CALIBRATION_DUE, color: '#f43f5e' },
  ].filter((d) => d.value > 0);

  // Equipment Item Repairs Frequency Table
  const repairFreqMap: { [eqCode: string]: { name: string; brand: string; count: number; lastSymptom: string } } = {};
  maintenanceList.forEach((r) => {
    if (!repairFreqMap[r.equipmentCode]) {
      repairFreqMap[r.equipmentCode] = {
        name: r.equipmentName,
        brand: `${r.brand} ${r.model}`,
        count: 0,
        lastSymptom: r.symptom,
      };
    }
    repairFreqMap[r.equipmentCode].count++;
  });

  const repairFreqList = Object.keys(repairFreqMap).map((code) => ({
    code,
    ...repairFreqMap[code],
  })).sort((a, b) => b.count - a.count);

  // Export CSV Helper
  const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
      + [headers.join(','), ...rows.map((e) => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Monthly Borrow Report
  const exportBorrowCSV = () => {
    const headers = ['ID', 'Equipment Code', 'Equipment Name', 'Borrower', 'Patient', 'Patient Phone', 'Borrow Date', 'Expected Return Date', 'Actual Return Date', 'Status', 'Customer Called'];
    const rows = borrowList.map((b) => [
      b.id,
      b.equipmentCode,
      b.equipmentName,
      b.borrowerStaffName,
      b.patientName,
      b.patientPhone,
      b.borrowDate,
      b.expectedReturnDate,
      b.actualReturnDate || '-',
      b.status,
      b.isCustomerCalled ? 'Yes' : 'No',
    ]);
    downloadCSV(`Borrow_Report_${selectedMonth}.csv`, headers, rows);
  };

  // Export Maintenance Report
  const exportMaintenanceCSV = () => {
    const headers = ['Ticket No', 'Equipment Code', 'Equipment Name', 'Serial Number', 'Department', 'Reporter', 'Reported Date', 'Symptom', 'Urgency', 'Status', 'Technician', 'Completed Date', 'Turnaround Days', 'Cost'];
    const rows = maintenanceList.map((r) => [
      r.ticketNo,
      r.equipmentCode,
      r.equipmentName,
      r.serialNumber,
      r.department,
      r.reporterName,
      r.reportedDate,
      r.symptom,
      r.urgency,
      r.status,
      r.assignedTechnician || '-',
      r.completedDate || '-',
      r.repairTurnaroundDays || 0,
      r.cost || 0,
    ]);
    downloadCSV(`Maintenance_Report_${selectedMonth}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 rounded-2xl border border-blue-200 dark:border-blue-800 shrink-0">
            <FileBarChart className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              รายงานและดัชนีชี้วัดประสิทธิภาพ (Executive KPI Dashboard)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              สรุปอัตราการยืม การโทรติดตาม การซ่อมบำรุง และเปอร์เซ็นต์ KPI ประจำเดือน
            </p>
          </div>
        </div>

        {/* Month Selector & CSV Export */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>รอบเดือน:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent font-bold text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <button
            onClick={exportBorrowCSV}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
            title="ส่งออกรายงานการยืม-คืนเป็น CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">ส่งออก CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Percentages (Executive Summary Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: PM/Cal Compliance */}
        <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">PM/Cal Compliance Rate</span>
            <Percent className="w-5 h-5 text-emerald-200" />
          </div>
          <p className="text-3xl font-black">{pmComplianceRate}%</p>
          <p className="text-[11px] text-emerald-100 font-medium">
            ผ่านเกณฑ์ PM/Cal ตรงตามกำหนด ({compliantEquipmentCount}/{totalEquipmentCount} เครื่อง)
          </p>
        </div>

        {/* KPI 2: On-Time Return Rate */}
        <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-800 text-white rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-100">On-Time Return Rate</span>
            <ArrowLeftRight className="w-5 h-5 text-blue-200" />
          </div>
          <p className="text-3xl font-black">{onTimeReturnRate}%</p>
          <p className="text-[11px] text-blue-100 font-medium">
            อัตราการคืนเครื่องมือแพทย์ตรงตามกำหนดเวลา
          </p>
        </div>

        {/* KPI 3: Equipment Availability Rate */}
        <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-700 text-white rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-100">Equipment Availability</span>
            <CheckCircle2 className="w-5 h-5 text-amber-200" />
          </div>
          <p className="text-3xl font-black">{availabilityRate}%</p>
          <p className="text-[11px] text-amber-100 font-medium">
            เครื่องพร้อมใช้งานทันที ({availableEquipmentCount}/{totalEquipmentCount} เครื่อง)
          </p>
        </div>

        {/* KPI 4: Avg Repair Turnaround */}
        <div className="p-4 bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Avg Repair Turnaround</span>
            <Wrench className="w-5 h-5 text-slate-300" />
          </div>
          <p className="text-3xl font-black">{avgRepairDays} <span className="text-sm font-normal">วัน</span></p>
          <p className="text-[11px] text-slate-300 font-medium">
            ระยะเวลาเฉลี่ยที่ใช้ในการซ่อมแซมเสร็จสิ้น
          </p>
        </div>

      </div>

      {/* Grid of Key Monthly Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Monthly Borrows */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">การยืมในเดือนนี้</span>
            <ArrowLeftRight className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {monthlyBorrows.length} <span className="text-xs font-normal text-slate-500">ครั้ง</span>
          </p>
          <p className="text-[10px] text-slate-400">บันทึกการเบิกยืมทั้งหมดประจำเดือน {selectedMonth}</p>
        </div>

        {/* Metric 2: Monthly Calls */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">การโทรตามลูกค้า</span>
            <PhoneCall className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {monthlyCallCount} <span className="text-xs font-normal text-slate-500">ครั้ง</span>
          </p>
          <p className="text-[10px] text-slate-400">
            เลยกำหนดการโทรติดตาม: <span className="font-bold text-rose-500">{overdueCallsPending.length} รายการ</span>
          </p>
        </div>

        {/* Metric 3: PM/Cal Overdue */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">เลยรอบ PM/Cal</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {overduePmCalList.length} <span className="text-xs font-normal text-slate-500">เครื่อง</span>
          </p>
          <p className="text-[10px] text-slate-400">ต้องดำเนินการบำรุงรักษาอย่างเร่งด่วน</p>
        </div>

        {/* Metric 4: Monthly Repairs */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">การส่งซ่อมเดือนนี้</span>
            <Hammer className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {monthlyRepairs.length} <span className="text-xs font-normal text-slate-500">ครั้ง</span>
          </p>
          <p className="text-[10px] text-slate-400">
            ปิดงานแล้ว: <span className="font-bold text-emerald-600">{completedRepairs.length} งาน</span>
          </p>
        </div>

      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Category Distribution Bar Chart */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>สถิติจำนวนเครื่องมือแพทย์แบ่งตามหมวดหมู่</span>
            </p>
            <span className="text-[11px] text-slate-400 font-mono">รวม {equipmentList.length} เครื่อง</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="value" name="จำนวนเครื่อง" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Equipment Status Pie Chart */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>สัดส่วนสถานะการทำงานของเครื่องมือแพทย์</span>
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Equipment Repair Frequency Raw Data Table */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-orange-500" />
              <span>ประวัติความถี่ในการส่งซ่อมแยกตามรายเครื่อง (Repair Frequency Analysis)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              วิเคราะห์เครื่องที่มีสถิติต้นทุนซ่อมบ่อยครั้ง เพื่อวางแผนปลดระวางหรือซื้อใหม่
            </p>
          </div>

          <button
            onClick={exportMaintenanceCSV}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออกรายงานซ่อม CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-950">
                <th className="p-3">รหัสเครื่อง (Code)</th>
                <th className="p-3">ชื่อเครื่องมือแพทย์</th>
                <th className="p-3">ยี่ห้อ / รุ่น</th>
                <th className="p-3 text-center">เคยซ่อมแล้ว (ครั้ง)</th>
                <th className="p-3">อาการเล่าล่าสุด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-800 dark:text-slate-200">
              {repairFreqList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">ยังไม่มีประวัติการส่งซ่อมในระบบ</td>
                </tr>
              ) : (
                repairFreqList.map((item) => (
                  <tr key={item.code} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-blue-700 dark:text-blue-400">{item.code}</td>
                    <td className="p-3 font-semibold">{item.name}</td>
                    <td className="p-3 text-slate-500">{item.brand}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                        item.count >= 3 ? 'bg-rose-100 text-rose-800 font-extrabold' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {item.count} ครั้ง
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 truncate max-w-xs">{item.lastSymptom}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
