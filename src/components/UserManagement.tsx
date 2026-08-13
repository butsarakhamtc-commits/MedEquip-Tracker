import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  ShieldCheck, 
  Shield, 
  Eye, 
  ShoppingBag, 
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { User, UserPermissionRole } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface UserManagementProps {
  users: User[];
  currentUser: User;
  onApproveUser: (userId: string, assignedRole: UserPermissionRole) => void;
  onRejectUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  currentUser,
  onApproveUser,
  onRejectUser,
  onDeleteUser,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleToApprove, setSelectedRoleToApprove] = useState<Record<string, UserPermissionRole>>({});
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const pendingUsers = users.filter((u) => u.approvalStatus === 'PENDING_APPROVAL');
  const approvedUsers = users.filter((u) => u.approvalStatus === 'APPROVED');
  const rejectedUsers = users.filter((u) => u.approvalStatus === 'REJECTED');

  const filteredUsers = users.filter((u) => {
    const matchesFilter =
      filter === 'ALL' ||
      (filter === 'PENDING' && u.approvalStatus === 'PENDING_APPROVAL') ||
      (filter === 'APPROVED' && u.approvalStatus === 'APPROVED') ||
      (filter === 'REJECTED' && u.approvalStatus === 'REJECTED');

    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getRoleBadge = (role?: UserPermissionRole | string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            แอดมินโปรแกรม
          </span>
        );
      case 'SALES':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
            เซลล์ขายเครื่อง
          </span>
        );
      case 'VIEW_ONLY':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <Eye className="w-3.5 h-3.5 text-slate-600" />
            ดูได้อย่างเดียว
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white rounded-2xl p-6 shadow-md border-2 border-blue-400">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-6 h-6 text-blue-300" />
              <h1 className="text-xl font-bold tracking-tight">ระบบจัดการผู้ใช้งาน & อนุมัติสิทธิ์การเข้าใช้</h1>
            </div>
            <p className="text-xs text-blue-200">
              เพื่อความปลอดภัยของข้อมูลในหน่วยงาน เฉพาะผู้ใช้ที่ได้รับการอนุมัติสิทธิ์จากแอดมินเท่านั้นที่จะสามารถใช้งานฟังก์ชั่นต่างๆ ได้
            </p>
          </div>

          <div className="flex items-center gap-3 bg-blue-950/60 p-3 rounded-xl border border-blue-400/40 shrink-0">
            <div className="text-center px-2">
              <p className="text-xl font-bold text-amber-300">{pendingUsers.length}</p>
              <p className="text-[10px] text-blue-200">รออนุมัติ</p>
            </div>
            <div className="w-px h-8 bg-blue-700"></div>
            <div className="text-center px-2">
              <p className="text-xl font-bold text-emerald-300">{approvedUsers.length}</p>
              <p className="text-[10px] text-blue-200">อนุมัติแล้ว</p>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions Legend & Instructions */}
      <div className="bg-white dark:bg-slate-900 border-2 border-blue-300 dark:border-blue-800 rounded-2xl p-4 shadow-sm">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>คำอธิบายสิทธิ์การใช้งาน (Role Permissions):</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-slate-600" /> 1. ดูได้อย่างเดียว (View Only)
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              ดูทะเบียนเครื่องมือ ค้นหา ดูประวัติยืม-คืน ดูวัน PM/Cal ได้อย่างเดียว กดแก้ไข/ยืม/คืนไม่ได้
            </p>
          </div>

          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <p className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" /> 2. เซลล์ขายเครื่อง (Sales Rep)
            </p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
              ยืม-คืนเครื่องมือให้คนไข้/ลูกค้า บันทึกการโทรติดตามได้ แต่ไม่สามารถแก้ไขสเปคเครื่องหรือบันทึก PM ได้
            </p>
          </div>

          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-300 dark:border-blue-800">
            <p className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> 3. แอดมินโปรแกรม (Admin)
            </p>
            <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-1">
              เข้าถึงทุกฟังก์ชั่น ลงทะเบียนเครื่องใหม่ บันทึก PM/Cal อนุมัติสิทธิ์ผู้ใช้งาน และจัดการระบบทั้งหมด
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 border-2 border-blue-300 dark:border-blue-800 p-3 rounded-2xl shadow-sm">
        
        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filter === 'PENDING'
                ? 'bg-amber-500 text-slate-950 border border-amber-600 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>รออนุมัติ</span>
            {pendingUsers.length > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[10px] font-extrabold">
                {pendingUsers.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setFilter('APPROVED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filter === 'APPROVED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>อนุมัติแล้ว ({approvedUsers.length})</span>
          </button>

          <button
            onClick={() => setFilter('REJECTED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filter === 'REJECTED'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <UserX className="w-3.5 h-3.5" />
            <span>ปฏิเสธ ({rejectedUsers.length})</span>
          </button>

          <button
            onClick={() => setFilter('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            ทั้งหมด ({users.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 opacity-50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้ใช้, อีเมล, แผนก..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-blue-200 dark:border-blue-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-8 text-center text-slate-500">
            <Users className="w-10 h-10 mx-auto opacity-40 mb-2" />
            <p className="text-sm font-semibold">ไม่พบรายการผู้ใช้งานตรงตามเงื่อนไข</p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const isPending = user.approvalStatus === 'PENDING_APPROVAL';
            const isApproved = user.approvalStatus === 'APPROVED';
            const isSelf = user.id === currentUser.id;

            const selectedRole = selectedRoleToApprove[user.id] || user.requestedRole || user.permissionRole || 'VIEW_ONLY';

            return (
              <div
                key={user.id}
                className={`bg-white dark:bg-slate-900 border-2 rounded-2xl p-4 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isPending
                    ? 'border-amber-400 bg-amber-50/20 dark:bg-amber-950/20'
                    : 'border-blue-300 dark:border-blue-800'
                }`}
              >
                {/* Left info */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-slate-800 border border-blue-300 flex items-center justify-center overflow-hidden shrink-0 font-bold text-blue-700">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{user.name}</h3>
                      {isSelf && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white">
                          (คุณ)
                        </span>
                      )}
                      {getRoleBadge(user.permissionRole)}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      อีเมล/ยูสเซอร์: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{user.email}</span> | แผนก: {user.department}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                      {user.phone && <span>เบอร์โทร: {user.phone}</span>}
                      {user.registeredAt && <span>ลงทะเบียนวันที่: {user.registeredAt}</span>}
                      {user.requestedRole && (
                        <span className="text-amber-700 dark:text-amber-400 font-semibold">
                          สิทธิ์ที่ขอ: {user.requestedRole === 'SALES' ? 'เซลล์ขายเครื่อง' : user.requestedRole === 'ADMIN' ? 'แอดมิน' : 'ดูได้อย่างเดียว'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action Controls */}
                <div className="flex items-center gap-2 pt-3 border-t md:border-t-0 md:pt-0 border-slate-200 dark:border-slate-800">
                  
                  {isPending ? (
                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                      <div className="flex items-center gap-1 w-full sm:w-auto">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 shrink-0">กำหนดสิทธิ์:</span>
                        <select
                          value={selectedRole}
                          onChange={(e) =>
                            setSelectedRoleToApprove({
                              ...selectedRoleToApprove,
                              [user.id]: e.target.value as UserPermissionRole,
                            })
                          }
                          className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border-2 border-blue-300 dark:border-blue-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="VIEW_ONLY">ดูได้อย่างเดียว (View Only)</option>
                          <option value="SALES">เซลล์ขายเครื่อง (Sales Rep)</option>
                          <option value="ADMIN">แอดมินโปรแกรม (Admin)</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => onApproveUser(user.id, selectedRole)}
                          className="flex-1 sm:flex-initial px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm transition-all active:scale-95"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>อนุมัติสิทธิ์</span>
                        </button>

                        <button
                          onClick={() => onRejectUser(user.id)}
                          className="flex-1 sm:flex-initial px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>ปฏิเสธ</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-500">เปลี่ยนสิทธิ์:</span>
                        <select
                          value={user.permissionRole}
                          onChange={(e) => onApproveUser(user.id, e.target.value as UserPermissionRole)}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200"
                        >
                          <option value="VIEW_ONLY">ดูได้อย่างเดียว</option>
                          <option value="SALES">เซลล์ขายเครื่อง</option>
                          <option value="ADMIN">แอดมินโปรแกรม</option>
                        </select>
                      </div>

                      {!isSelf && (
                        <button
                          onClick={() => setDeletingUser(user)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all"
                          title="ลบผู้ใช้งาน"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirm Delete User Modal */}
      <ConfirmModal
        isOpen={!!deletingUser}
        title={`ยืนยันลบผู้ใช้งาน [${deletingUser?.name || ''}]`}
        message={`คุณต้องการลบผู้ใช้งาน "${deletingUser?.name || ''}" (${deletingUser?.email || ''}) ออกจากระบบใช่หรือไม่?`}
        onConfirm={() => {
          if (deletingUser) {
            onDeleteUser(deletingUser.id);
          }
        }}
        onClose={() => setDeletingUser(null)}
      />

    </div>
  );
};
