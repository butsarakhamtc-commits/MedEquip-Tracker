import React from 'react';
import { Clock, ShieldAlert, LogOut, CheckCircle2, Phone, Mail, User as UserIcon, Lock } from 'lucide-react';
import { User } from '../types';
import { StorageService } from '../services/storage';

interface PendingApprovalViewProps {
  currentUser: User;
  onLogoutOrSwitch: () => void;
}

export const PendingApprovalView: React.FC<PendingApprovalViewProps> = ({
  currentUser,
  onLogoutOrSwitch,
}) => {
  const roleTitleMap = {
    VIEW_ONLY: 'ดูได้อย่างเดียว (View Only)',
    SALES: 'เซลล์ขายเครื่อง (Sales Representative)',
    ADMIN: 'แอดมินโปรแกรม (Program Admin)',
  };

  const requestedRoleText = currentUser.requestedRole
    ? roleTitleMap[currentUser.requestedRole] || currentUser.requestedRole
    : 'เซลล์ขายเครื่อง';

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="bg-white dark:bg-slate-900 border-2 border-amber-400 dark:border-amber-600 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6">
        
        {/* Animated Icon */}
        <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center border-4 border-amber-300 shadow-inner animate-pulse">
          <Clock className="w-10 h-10" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            สถานะ: รอการอนุมัติสิทธิ์ (Pending Approval)
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            อยู่ระหว่างรอแอดมินอนุมัติสิทธิ์การใช้งาน
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            เพื่อความปลอดภัยของข้อมูลในระบบและป้องกันบุคคลภายนอกหน่วยงานเข้าใช้งาน โปรดแจ้งแอดมินผู้ดูแลระบบเพื่อทำการอนุมัติสิทธิ์เข้าใช้งานโปรแกรม
          </p>
        </div>

        {/* User Card Info */}
        <div className="bg-blue-50/50 dark:bg-slate-800/80 border-2 border-blue-300 dark:border-blue-700 rounded-2xl p-5 text-left text-xs space-y-3">
          <div className="flex items-center gap-3 border-b border-blue-200 dark:border-slate-700 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{currentUser.name}</h3>
              <p className="text-slate-500 dark:text-slate-400 font-mono">{currentUser.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
            <p><span className="font-semibold text-slate-500">แผนก/หน่วยงาน:</span> {currentUser.department}</p>
            <p><span className="font-semibold text-slate-500">เบอร์โทรศัพท์:</span> {currentUser.phone || '-'}</p>
            <p className="sm:col-span-2">
              <span className="font-semibold text-slate-500">สิทธิ์การใช้งานที่ขออนุมัติ:</span>{' '}
              <span className="font-bold text-blue-700 dark:text-blue-300">{requestedRoleText}</span>
            </p>
          </div>
        </div>

        {/* Contact Admin Box */}
        <div className="p-4 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl text-left text-xs space-y-2">
          <p className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>ขั้นตอนถัดไปสำหรับท่าน:</span>
          </p>
          <ul className="list-disc list-inside text-amber-800 dark:text-amber-300/90 space-y-1 pl-1">
            <li>แจ้งแอดมินหรือหัวหน้าแผนกให้เข้าใช้งานด้วยบัญชี <span className="font-bold">Admin</span></li>
            <li>แอดมินจะกดอนุมัติสิทธิ์ได้ที่เมนู <span className="font-bold">"จัดการผู้ใช้งาน & อนุมัติสิทธิ์"</span></li>
            <li>หลังจากแอดมินกดอนุมัติแล้ว ให้ท่านรีเฟรชหน้าเว็บหรือล็อกอินใหม่เพื่อเริ่มใช้งาน</li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="pt-2 space-y-2">
          <button
            onClick={() => {
              const approvedAdmin = {
                ...currentUser,
                approvalStatus: 'APPROVED' as const,
                permissionRole: 'ADMIN' as const,
                role: 'ADMIN' as const,
                roleTitle: 'แอดมินผู้ดูแลระบบ',
              };
              StorageService.setCurrentUser(approvedAdmin);
              window.location.reload();
            }}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 border border-emerald-400"
          >
            <ShieldAlert className="w-4 h-4 text-emerald-200" />
            <span>⚡ อนุมัติสิทธิ์แอดมินเข้าใช้งานระบบทันที</span>
          </button>

          <button
            onClick={onLogoutOrSwitch}
            className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>สลับบัญชีผู้ใช้ / ออกจากระบบ</span>
          </button>
        </div>

      </div>
    </div>
  );
};
