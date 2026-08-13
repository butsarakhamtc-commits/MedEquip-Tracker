import React, { useState } from 'react';
import { 
  Stethoscope, 
  Search, 
  QrCode, 
  Bell, 
  RotateCcw, 
  User as UserIcon, 
  ChevronDown,
  PhoneCall,
  ShieldAlert,
  Sparkles,
  Palette,
  Sun,
  Moon,
  Leaf,
  Check,
  LogOut
} from 'lucide-react';
import { User, Equipment, BorrowRecord, ThemeTemplate } from '../types';
import { THEME_CONFIGS } from '../services/theme';

interface NavbarProps {
  currentUser: User;
  users: User[];
  currentTheme: ThemeTemplate;
  onSelectTheme: (theme: ThemeTemplate) => void;
  onSelectUser: (user: User) => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onResetData: () => void;
  onOpenScanner: () => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  equipmentList: Equipment[];
  borrowRecords: BorrowRecord[];
  onOpenEquipmentDetail: (equipment: Equipment) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  users,
  currentTheme,
  onSelectTheme,
  onSelectUser,
  onOpenAuthModal,
  onLogout,
  onResetData,
  onOpenScanner,
  onSearchChange,
  searchQuery,
  equipmentList,
  borrowRecords,
  onOpenEquipmentDetail,
}) => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);

  // Compute urgent notifications
  const todayStr = new Date().toISOString().split('T')[0];

  // Overdue PM/Cal
  const overduePmCal = equipmentList.filter((eq) => {
    return (eq.nextPmDate && eq.nextPmDate < todayStr) || (eq.nextCalDate && eq.nextCalDate < todayStr);
  });

  // Pending customer phone calls for overdue/due returns
  const pendingCalls = borrowRecords.filter((b) => {
    return b.status === 'ACTIVE' && !b.isCustomerCalled && b.expectedReturnDate <= todayStr;
  });

  const totalAlerts = overduePmCal.length + pendingCalls.length;
  const activeThemeConfig = THEME_CONFIGS[currentTheme] || THEME_CONFIGS['clinical-light'];

  return (
    <header className={`sticky top-0 z-30 ${activeThemeConfig.navBg} transition-all`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-500 shadow-inner">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight">MedEquip</span>
                <span className="text-xs bg-teal-500/20 text-teal-600 dark:text-teal-300 font-semibold px-2 py-0.5 rounded-full border border-teal-500/30">
                  Tracker
                </span>
              </div>
              <p className="text-xs opacity-70 hidden sm:block">ระบบทะเบียน & ยืม-คืน เครื่องมือแพทย์</p>
            </div>
          </div>

          {/* Quick Search Bar */}
          <div className="flex-1 max-w-md mx-2 relative hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาตามรหัส (EQ000001), ชื่อเครื่อง, Serial, ชื่อคนไข้..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white text-slate-900 placeholder:text-slate-500 border-2 border-slate-300 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded"
                >
                  ล้าง
                </button>
              )}
            </div>
          </div>

          {/* Actions & User Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Template Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsThemeDropdownOpen(!isThemeDropdownOpen);
                  setIsNotificationsOpen(false);
                  setIsUserDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm"
                title="เปลี่ยนรูปแบบเทมเพลต / ธีม"
              >
                <Palette className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="hidden sm:inline">เปลี่ยนเทมเพลต</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {/* Theme Dropdown */}
              {isThemeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-3 z-50 text-slate-800 dark:text-slate-200">
                  <div className="px-2 py-1.5 border-b border-slate-200 dark:border-slate-700 mb-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span>เลือกเทมเพลต / รูปแบบธีมระบบ</span>
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      ปรับเปลี่ยนหน้าตาโทนสีตามความเหมาะสมของการใช้งาน
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    {(Object.keys(THEME_CONFIGS) as ThemeTemplate[]).map((themeKey) => {
                      const cfg = THEME_CONFIGS[themeKey];
                      const isSelected = currentTheme === themeKey;

                      return (
                        <button
                          key={themeKey}
                          onClick={() => {
                            onSelectTheme(themeKey);
                            setIsThemeDropdownOpen(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs flex items-start gap-2.5 ${
                            isSelected
                              ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-900 dark:text-teal-200 font-semibold shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg shrink-0 ${
                            isSelected ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}>
                            {themeKey === 'clinical-light' && <Sun className="w-4 h-4" />}
                            {themeKey === 'dark-slate' && <Moon className="w-4 h-4" />}
                            {themeKey === 'emerald-health' && <Leaf className="w-4 h-4" />}
                            {themeKey === 'ocean-blue' && <Sparkles className="w-4 h-4" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold">{cfg.name}</span>
                              {isSelected && <Check className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                              {cfg.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* QR Code Scanner Button */}
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs sm:text-sm font-medium transition-all shadow-sm active:scale-95"
              title="สแกน QR Code ค้นหาเครื่อง"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">สแกน QR Code</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsThemeDropdownOpen(false);
                  setIsUserDropdownOpen(false);
                }}
                className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all"
                title="การแจ้งเตือน"
              >
                <Bell className="w-5 h-5" />
                {totalAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {totalAlerts}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-4 z-50 text-slate-800 dark:text-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3 mb-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Bell className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      รายการที่ต้องดำเนินการ ({totalAlerts})
                    </h4>
                    <button
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      ปิด
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {totalAlerts === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">ไม่มีรายการแจ้งเตือนด่วน</p>
                    ) : (
                      <>
                        {pendingCalls.map((b) => (
                          <div
                            key={`notif-call-${b.id}`}
                            className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-xs flex items-start gap-2.5"
                          >
                            <PhoneCall className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                            <div className="flex-1">
                              <p className="font-semibold text-amber-900 dark:text-amber-200">
                                ยังไม่ได้โทรติดตามคนไข้ ({b.equipmentCode})
                              </p>
                              <p className="text-amber-700 dark:text-amber-300/80 mt-0.5">
                                คนไข้: {b.patientName} ({b.patientPhone})
                              </p>
                              <p className="text-slate-500 dark:text-slate-400 mt-1">กำหนดคืน: {b.expectedReturnDate}</p>
                            </div>
                          </div>
                        ))}

                        {overduePmCal.map((eq) => (
                          <div
                            key={`notif-pm-${eq.id}`}
                            onClick={() => {
                              onOpenEquipmentDetail(eq);
                              setIsNotificationsOpen(false);
                            }}
                            className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-xs flex items-start gap-2.5 cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all"
                          >
                            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
                            <div className="flex-1">
                              <p className="font-semibold text-rose-900 dark:text-rose-200">
                                ถึงกำหนด PM / Calibration ({eq.code})
                              </p>
                              <p className="text-slate-700 dark:text-slate-300 mt-0.5 line-clamp-1">{eq.name}</p>
                              <p className="text-rose-600 dark:text-rose-400 mt-1">รอบต่อไป: {eq.nextPmDate || eq.nextCalDate}</p>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Reset Data Button */}
            <button
              onClick={() => {
                if (confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้น (Sample Data) หรือไม่?')) {
                  onResetData();
                }
              }}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all text-xs flex items-center gap-1 hidden lg:flex"
              title="รีเซ็ตเป็นข้อมูลตัวอย่าง"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-xs">รีเซ็ตข้อมูล</span>
            </button>

            {/* User Profile / Role Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsUserDropdownOpen(!isUserDropdownOpen);
                  setIsThemeDropdownOpen(false);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-white text-slate-900 hover:bg-slate-50 rounded-xl border-2 border-slate-300 transition-all shadow-xs"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    currentUser.name.charAt(0)
                  )}
                </div>
                <div className="text-left hidden lg:block pr-1">
                  <p className="text-xs font-black leading-none text-slate-900">{currentUser.name}</p>
                  <p className="text-[10px] text-teal-700 font-extrabold mt-0.5">{currentUser.roleTitle}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-800 font-bold" />
              </button>

              {/* User Selector Dropdown */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 border-2 border-blue-300 dark:border-blue-700 rounded-2xl shadow-2xl p-3 z-50">
                  <div className="pb-2 border-b border-slate-200 dark:border-slate-700 mb-2">
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">บัญชีผู้ใช้งานปัจจุบัน:</p>
                    <div className="flex items-center gap-2.5 mt-1.5 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold overflow-hidden shrink-0">
                        {currentUser.avatar ? (
                          <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                        ) : (
                          currentUser.name.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs truncate text-slate-900 dark:text-white">{currentUser.name}</p>
                        <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold truncate">{currentUser.roleTitle}</p>
                        <p className="text-[10px] text-slate-400 truncate">{currentUser.department}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <button
                      onClick={() => {
                        onOpenAuthModal();
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border border-blue-200 dark:border-blue-800"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                      <span>เข้าสู่ระบบอื่น / ลงทะเบียนผู้ใช้ใหม่</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border border-rose-200 dark:border-rose-800"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>ออกจากระบบ (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};

