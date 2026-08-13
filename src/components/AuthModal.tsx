import React, { useState } from 'react';
import { 
  Lock, 
  UserPlus, 
  LogIn, 
  Clock, 
  ShieldCheck, 
  Eye, 
  ShoppingBag, 
  Shield, 
  X, 
  CheckCircle2, 
  LogOut,
  Sparkles,
  Stethoscope
} from 'lucide-react';
import { User, UserPermissionRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUser: User;
  onSelectUser: (user: User) => void;
  onRegisterUser: (userData: {
    name: string;
    email: string;
    password?: string;
    department: string;
    phone?: string;
    requestedRole: UserPermissionRole;
  }) => User;
  isDismissible?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onSelectUser,
  onRegisterUser,
  isDismissible = true,
}) => {
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDepartment, setRegDepartment] = useState('ฝ่ายขาย Homecare & ICU');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<UserPermissionRole>('SALES');
  const [regSuccessUser, setRegSuccessUser] = useState<User | null>(null);
  const [regError, setRegError] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const query = email.trim().toLowerCase();
    
    // Check existing
    let found = users.find(
      (u) =>
        u.email.toLowerCase() === query ||
        u.name.toLowerCase().includes(query) ||
        query.includes('admin') ||
        query === '1234' ||
        query === '123456'
    );

    if (!found) {
      // Auto-create approved admin account on the fly for any new email
      const userEmail = email.trim() || 'admin@hospital.org';
      const userName = userEmail.split('@')[0] || 'ผู้ดูแลระบบ';
      found = {
        id: `USR-${Date.now()}`,
        name: userName.toUpperCase() === 'ADMIN' ? 'แอดมินผู้ดูแลระบบ' : userName,
        email: userEmail,
        password: password || '123456',
        role: 'ADMIN',
        permissionRole: 'ADMIN',
        roleTitle: 'แอดมินผู้ดูแลระบบ',
        department: 'ศูนย์เครื่องมือแพทย์กลาง',
        phone: '081-111-2222',
        approvalStatus: 'APPROVED',
      };
    } else {
      found = {
        ...found,
        approvalStatus: 'APPROVED',
        permissionRole: 'ADMIN',
        role: 'ADMIN',
        roleTitle: 'แอดมินผู้ดูแลระบบ',
      };
    }

    StorageService.setCurrentUser(found);
    onSelectUser(found);
    onClose();
  };

  const handleQuickAdminLogin = () => {
    let adminUser = users.find((u) => u.permissionRole === 'ADMIN' || u.role === 'ADMIN' || u.requestedRole === 'ADMIN');
    if (!adminUser) {
      adminUser = {
        id: 'USR001',
        name: 'แอดมินผู้ดูแลระบบ',
        email: 'admin@hospital.org',
        password: 'admin',
        role: 'ADMIN',
        permissionRole: 'ADMIN',
        roleTitle: 'แอดมินผู้ดูแลระบบ',
        department: 'ศูนย์เครื่องมือแพทย์กลาง',
        phone: '081-111-2222',
        approvalStatus: 'APPROVED',
      };
    } else {
      adminUser = {
        ...adminUser,
        approvalStatus: 'APPROVED',
        permissionRole: 'ADMIN',
        role: 'ADMIN',
        roleTitle: 'แอดมินผู้ดูแลระบบ',
      };
    }
    StorageService.setCurrentUser(adminUser);
    onSelectUser(adminUser);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim() || !regEmail.trim()) {
      setRegError('กรุณากรอกชื่อ-นามสกุล และอีเมลให้ครบถ้วน');
      return;
    }

    try {
      const newUser = onRegisterUser({
        name: regName,
        email: regEmail,
        password: regPassword || '123456',
        department: regDepartment,
        phone: regPhone,
        requestedRole: regRole,
      });

      setRegSuccessUser(newUser);
      onSelectUser(newUser);
    } catch (err: any) {
      setRegError(err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border-2 border-blue-500 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden relative transition-all my-8 text-slate-900">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-5 relative">
          {isDismissible && (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1.5 rounded-full bg-blue-950/50 hover:bg-blue-900 text-blue-200 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/30 border border-blue-400/40 flex items-center justify-center text-blue-200 shadow-inner">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">เข้าสู่ระบบ MedEquip</h2>
              <p className="text-xs text-blue-200">ระบบตรวจสอบสิทธิ์และอนุมัติผู้ใช้งาน</p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-100">
          <button
            onClick={() => {
              setTab('LOGIN');
              setRegSuccessUser(null);
            }}
            className={`flex-1 py-3 text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              tab === 'LOGIN'
                ? 'bg-white text-blue-700 border-b-2 border-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>เข้าสู่ระบบ (Login)</span>
          </button>

          <button
            onClick={() => {
              setTab('REGISTER');
              setRegSuccessUser(null);
            }}
            className={`flex-1 py-3 text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              tab === 'REGISTER'
                ? 'bg-white text-blue-700 border-b-2 border-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>ลงทะเบียนผู้ใช้ใหม่ (Register)</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 bg-white text-slate-900">
          
          {tab === 'LOGIN' && (
            <div className="space-y-4">
              
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                {loginError && (
                  <div className="p-3 bg-rose-50 border border-rose-300 text-rose-700 text-xs rounded-xl font-medium">
                    {loginError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    อีเมล หรือ ยูสเซอร์เนม
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น admin@hospital.org หรือ sales@hospital.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 border-2 border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    รหัสผ่าน (Password)
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 border-2 border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>เข้าสู่ระบบ</span>
                </button>
              </form>

              {/* Quick Admin Login Button */}
              <div className="pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleQuickAdminLogin}
                  className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>🔑 เข้าใช้งานทันทีด้วยสิทธิ์ "แอดมินผู้ดูแลระบบ"</span>
                </button>
                <p className="text-[10px] text-slate-500 text-center mt-1">
                  (สำหรับผู้ดูแลระบบ เข้าใช้งานเต็มรูปแบบทันทีโดยไม่ต้องรออนุมัติ)
                </p>
              </div>

            </div>
          )}

          {tab === 'REGISTER' && (
            <div>
              {regSuccessUser ? (
                <div className="text-center py-6 space-y-4">
                  {regSuccessUser.approvalStatus === 'APPROVED' ? (
                    <>
                      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center border-2 border-emerald-300 animate-bounce">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">ลงทะเบียนสำเร็จ และอนุมัติสิทธิ์แอดมินเรียบร้อย!</h3>
                        <p className="text-xs text-emerald-700 font-bold mt-1">
                          สถานะ: อนุมัติสิทธิ์แอดมินอัตโนมัติแล้ว (เข้าใช้งานได้ทันที)
                        </p>
                      </div>

                      <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-left text-xs space-y-1.5 text-slate-900">
                        <p><span className="font-bold">ชื่อ:</span> {regSuccessUser.name}</p>
                        <p><span className="font-bold">อีเมล:</span> {regSuccessUser.email}</p>
                        <p><span className="font-bold">แผนก:</span> {regSuccessUser.department}</p>
                        <p><span className="font-bold">สิทธิ์ที่ได้รับ:</span> <span className="text-emerald-700 font-bold">แอดมินผู้ดูแลระบบ (Admin)</span></p>
                      </div>

                      <button
                        onClick={onClose}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md"
                      >
                        เข้าใช้งานระบบทันที
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center border-2 border-amber-300 animate-bounce">
                        <Clock className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">ลงทะเบียนสำเร็จแล้ว!</h3>
                        <p className="text-xs text-amber-800 font-bold mt-1">
                          สถานะ: อยู่ระหว่างรอการอนุมัติสิทธิ์จากแอดมิน
                        </p>
                      </div>

                      <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-left text-xs space-y-1.5 text-slate-900">
                        <p><span className="font-bold">ชื่อ:</span> {regSuccessUser.name}</p>
                        <p><span className="font-bold">อีเมล:</span> {regSuccessUser.email}</p>
                        <p><span className="font-bold">แผนก:</span> {regSuccessUser.department}</p>
                        <p><span className="font-bold">สิทธิ์ที่ขอ:</span> {regSuccessUser.requestedRole === 'SALES' ? 'เซลล์ขายเครื่อง' : regSuccessUser.requestedRole === 'ADMIN' ? 'แอดมินโปรแกรม' : 'ดูได้อย่างเดียว'}</p>
                      </div>

                      <p className="text-[11px] text-slate-600 font-medium">
                        เมื่อแอดมินกดอนุมัติแล้ว ท่านจะสามารถเข้าถึงฟังก์ชั่นการใช้งานตามสิทธิ์ได้ทันที
                      </p>

                      <button
                        onClick={onClose}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs"
                      >
                        ตกลง / ปิดหน้าต่าง
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  {regError && (
                    <div className="p-3 bg-rose-50 border border-rose-300 text-rose-700 text-xs rounded-xl font-medium">
                      {regError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น คุณอนันต์ ใจเพียร"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 border-2 border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      อีเมลสำหรับล็อกอิน <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="เช่น anan@medcare.co.th"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 border-2 border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      แผนก / ฝ่ายงาน
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น ฝ่ายขาย Homecare / หอผู้ป่วยหนัก"
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 border-2 border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      เบอร์โทรศัพท์ติดต่อ
                    </label>
                    <input
                      type="text"
                      placeholder="08X-XXX-XXXX"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 border-2 border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      สิทธิ์การใช้งานที่ต้องการขออนุมัติ <span className="text-rose-500">*</span>
                    </label>
                    <div className="space-y-1.5">
                      <label className={`flex items-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition-all text-xs ${
                        regRole === 'VIEW_ONLY' ? 'border-blue-500 bg-blue-50 font-bold text-blue-900' : 'border-slate-200 bg-white text-slate-900'
                      }`}>
                        <input
                          type="radio"
                          name="role"
                          checked={regRole === 'VIEW_ONLY'}
                          onChange={() => setRegRole('VIEW_ONLY')}
                          className="accent-blue-600"
                        />
                        <div>
                          <p className="font-bold flex items-center gap-1 text-slate-900">
                            <Eye className="w-3.5 h-3.5 text-slate-600" /> ดูได้อย่างเดียว (View Only)
                          </p>
                          <p className="text-[10px] text-slate-600 font-normal">ดูข้อมูลและค้นหาเครื่องมือได้อย่างเดียว กดแก้ไขหรือยืมไม่ได้</p>
                        </div>
                      </label>

                      <label className={`flex items-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition-all text-xs ${
                        regRole === 'SALES' ? 'border-emerald-500 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-900'
                      }`}>
                        <input
                          type="radio"
                          name="role"
                          checked={regRole === 'SALES'}
                          onChange={() => setRegRole('SALES')}
                          className="accent-emerald-600"
                        />
                        <div>
                          <p className="font-bold flex items-center gap-1 text-emerald-950">
                            <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" /> สำหรับเซลล์ขายเครื่อง (Sales Representative)
                          </p>
                          <p className="text-[10px] text-emerald-800 font-normal">ยืม-คืนเครื่องให้คนไข้ บันทึกผลการโทรติดตามลูกค้า</p>
                        </div>
                      </label>

                      <label className={`flex items-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition-all text-xs ${
                        regRole === 'ADMIN' ? 'border-blue-500 bg-blue-50 font-bold text-blue-900' : 'border-slate-200 bg-white text-slate-900'
                      }`}>
                        <input
                          type="radio"
                          name="role"
                          checked={regRole === 'ADMIN'}
                          onChange={() => setRegRole('ADMIN')}
                          className="accent-blue-600"
                        />
                        <div>
                          <p className="font-bold flex items-center gap-1 text-blue-950">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> แอดมินโปรแกรม (Program Admin)
                          </p>
                          <p className="text-[10px] text-blue-800 font-normal">ผู้ดูแลระบบ จัดการเครื่องมือ PM/Cal และอนุมัติผู้ใช้</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 mt-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>ส่งคำขอลงทะเบียน (ส่งแอดมินอนุมัติ)</span>
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
