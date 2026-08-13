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
import { StorageService } from '../services/storage';

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
  const [regDepartment, setRegDepartment] = useState('ศูนย์เครื่องมือแพทย์');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<UserPermissionRole>('SALES');
  const [regSuccessUser, setRegSuccessUser] = useState<User | null>(null);
  const [regError, setRegError] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const query = email.trim().toLowerCase();
    
    // Check if logging in as Admin Khun Butsarakham
    if (
      query === 'butsarakham.tc@gmail.com' ||
      query.includes('butsarakham') ||
      query === 'admin' ||
      password === 'Mbnnbm@2204'
    ) {
      const adminUser: User = {
        id: 'USR001',
        name: 'บุษราคัม ทองเจิม',
        email: 'butsarakham.tc@gmail.com',
        password: 'Mbnnbm@2204',
        role: 'ADMIN',
        permissionRole: 'ADMIN',
        roleTitle: 'แอดมินโปรแกรม',
        department: 'ศูนย์เครื่องมือแพทย์กลาง (ผู้ดูแลระบบ)',
        phone: '0982548945',
        approvalStatus: 'APPROVED',
      };
      StorageService.setCurrentUser(adminUser);
      onSelectUser(adminUser);
      onClose();
      return;
    }

    // Search existing registered user
    const found = users.find(
      (u) => u.email.toLowerCase() === query || u.name.toLowerCase().includes(query)
    );

    if (found) {
      if (found.password && password && found.password !== password) {
        setLoginError('รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านอีกครั้ง');
        return;
      }

      if (found.approvalStatus === 'PENDING_APPROVAL') {
        setLoginError('บัญชีของคุณอยู่ระหว่างรอการอนุมัติสิทธิ์จากคุณบุษราคัม (แอดมินโปรแกรม)');
        return;
      }

      StorageService.setCurrentUser(found);
      onSelectUser(found);
      onClose();
    } else {
      setLoginError('ไม่พบบัญชีผู้ใช้งานนี้ในระบบ กรุณาตรวจสอบอีเมลหรือลงทะเบียนผู้ใช้ใหม่');
    }
  };

  const handleQuickAdminLogin = () => {
    const adminUser: User = {
      id: 'USR001',
      name: 'บุษราคัม ทองเจิม',
      email: 'butsarakham.tc@gmail.com',
      password: 'Mbnnbm@2204',
      role: 'ADMIN',
      permissionRole: 'ADMIN',
      roleTitle: 'แอดมินโปรแกรม',
      department: 'ศูนย์เครื่องมือแพทย์กลาง (ผู้ดูแลระบบ)',
      phone: '0982548945',
      approvalStatus: 'APPROVED',
    };
    StorageService.setCurrentUser(adminUser);
    onSelectUser(adminUser);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegError('กรุณากรอกชื่อ-นามสกุล, อีเมล และรหัสผ่านให้ครบถ้วน');
      return;
    }

    try {
      const newUser = onRegisterUser({
        name: regName,
        email: regEmail,
        password: regPassword,
        department: regDepartment,
        phone: regPhone,
        requestedRole: regRole,
      });

      setRegSuccessUser(newUser);
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
                  <span>🔑 เข้าใช้งานในนาม "คุณบุษราคัม ทองเจิม" (แอดมินโปรแกรม)</span>
                </button>
                <p className="text-[10px] text-slate-500 text-center mt-1">
                  (อีเมล: butsarakham.tc@gmail.com | รหัส: Mbnnbm@2204)
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
                        <h3 className="text-base font-bold text-slate-900">ลงทะเบียนสำเร็จ และได้รับการอนุมัติเรียบร้อย!</h3>
                        <p className="text-xs text-emerald-700 font-bold mt-1">
                          สถานะ: อนุมัติสิทธิ์การใช้งานเรียบร้อยแล้ว
                        </p>
                      </div>

                      <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-left text-xs space-y-1.5 text-slate-900">
                        <p><span className="font-bold">ชื่อ:</span> {regSuccessUser.name}</p>
                        <p><span className="font-bold">อีเมล:</span> {regSuccessUser.email}</p>
                        <p><span className="font-bold">แผนก:</span> {regSuccessUser.department}</p>
                        <p><span className="font-bold">สิทธิ์ที่ได้รับ:</span> <span className="text-emerald-700 font-bold">{regSuccessUser.roleTitle}</span></p>
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
                          สถานะ: ส่งคำขอไปยัง คุณบุษราคัม (แอดมินโปรแกรม) เพื่อพิจารณาอนุมัติ
                        </p>
                      </div>

                      <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-left text-xs space-y-1.5 text-slate-900">
                        <p><span className="font-bold">ชื่อ:</span> {regSuccessUser.name}</p>
                        <p><span className="font-bold">อีเมล:</span> {regSuccessUser.email}</p>
                        <p><span className="font-bold">แผนก:</span> {regSuccessUser.department}</p>
                        <p><span className="font-bold">สิทธิ์ที่ขอ:</span> {regSuccessUser.requestedRole === 'SALES' ? 'พนักงานขาย / เซลล์ (ลงทะเบียนข้อมูลได้)' : regSuccessUser.requestedRole === 'ADMIN' ? 'แอดมินโปรแกรม' : 'ดูได้อย่างเดียว'}</p>
                      </div>

                      <p className="text-[11px] text-slate-600 font-medium">
                        เมื่อ คุณบุษราคัม กดอนุมัติสิทธิ์แล้ว ท่านจะสามารถล็อกอินเข้าใช้งานตามสิทธิ์ได้ทันที
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
                      ตั้งรหัสผ่านสำหรับเข้าสู่ระบบ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="กำหนดรหัสผ่าน เช่น Mbnnbm@2204"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 border-2 border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      แผนก / ฝ่ายงาน
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น ฝ่ายขาย Homecare / ศูนย์เครื่องมือแพทย์"
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
                      placeholder="เช่น 0982548945"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 border-2 border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      เลือกสิทธิ์การใช้งานที่ต้องการ <span className="text-rose-500">*</span>
                    </label>
                    <div className="space-y-1.5">
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
                            <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" /> เซลล์ผู้แทน (Sales) - [ลงทะเบียนข้อมูลเครื่องมือแพทย์ได้]
                          </p>
                          <p className="text-[10px] text-emerald-800 font-normal">สิทธิ์สำหรับเซลล์: เพิ่มเครื่องมือแพทย์ ยืม-คืนเครื่อง บันทึกติดตามลูกค้าได้</p>
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
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> แอดมินโปรแกรม (Program Admin) - [สิทธิ์สูงสุด]
                          </p>
                          <p className="text-[10px] text-blue-800 font-normal">ผู้ดูแลระบบ: ลงทะเบียน ลบข้อมูล จัดการ PM/Cal และอนุมัติสิทธิ์สมาชิก</p>
                        </div>
                      </label>

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
                            <Eye className="w-3.5 h-3.5 text-slate-600" /> เจ้าหน้าที่ทั่วไป (View Only) - [ดูได้อย่างเดียว]
                          </p>
                          <p className="text-[10px] text-slate-600 font-normal">ค้นหาและดูข้อมูลเครื่องมือได้อย่างเดียว ไม่สามารถลงทะเบียนข้อมูลได้</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 mt-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>ส่งคำขอลงทะเบียน (ส่งให้แอดมินพิจารณาอนุมัติ)</span>
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
