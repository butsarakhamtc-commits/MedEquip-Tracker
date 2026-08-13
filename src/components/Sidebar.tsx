import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  Wrench, 
  QrCode, 
  PhoneCall, 
  Users,
  PlusCircle,
  Hammer,
  FileBarChart
} from 'lucide-react';
import { ThemeTemplate } from '../types';
import { THEME_CONFIGS } from '../services/theme';

export type ActiveTab = 'dashboard' | 'equipment' | 'borrows' | 'pm_cal' | 'maintenance' | 'calls' | 'reports' | 'users' | 'stickers';

interface SidebarProps {
  activeTab: ActiveTab;
  currentTheme: ThemeTemplate;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAddEquipment: () => void;
  pendingCallsCount: number;
  duePmCalCount: number;
  pendingRepairsCount?: number;
  pendingUsersCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  currentTheme,
  onTabChange,
  onOpenAddEquipment,
  pendingCallsCount,
  duePmCalCount,
  pendingRepairsCount,
  pendingUsersCount,
}) => {
  const activeThemeConfig = THEME_CONFIGS[currentTheme] || THEME_CONFIGS['clinical-light'];

  const menuItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'equipment' as ActiveTab,
      label: 'ทะเบียนเครื่องมือแพทย์',
      icon: Package,
      badge: null,
    },
    {
      id: 'borrows' as ActiveTab,
      label: 'ระบบยืม-คืน & ค้นหา',
      icon: ArrowLeftRight,
      badge: null,
    },
    {
      id: 'pm_cal' as ActiveTab,
      label: 'แจ้งเตือน PM/Cal',
      icon: Wrench,
      badge: duePmCalCount > 0 ? duePmCalCount : null,
      badgeColor: 'bg-rose-500 text-white font-bold',
    },
    {
      id: 'maintenance' as ActiveTab,
      label: 'แจ้งซ่อม & งานซ่อม',
      icon: Hammer,
      badge: (pendingRepairsCount && pendingRepairsCount > 0) ? pendingRepairsCount : null,
      badgeColor: 'bg-orange-500 text-white font-bold',
    },
    {
      id: 'calls' as ActiveTab,
      label: 'การโทรติดตามลูกค้า',
      icon: PhoneCall,
      badge: pendingCallsCount > 0 ? pendingCallsCount : null,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
    },
    {
      id: 'reports' as ActiveTab,
      label: 'รายงาน & Executive KPI',
      icon: FileBarChart,
      badge: null,
    },
    {
      id: 'users' as ActiveTab,
      label: 'ผู้ใช้งาน & อนุมัติสิทธิ์',
      icon: Users,
      badge: (pendingUsersCount && pendingUsersCount > 0) ? pendingUsersCount : null,
      badgeColor: 'bg-blue-600 text-white font-bold animate-pulse',
    },
    {
      id: 'stickers' as ActiveTab,
      label: 'พิมพ์ QR Code สติ๊กเกอร์',
      icon: QrCode,
      badge: null,
    },
  ];

  return (
    <aside className={`w-full lg:w-64 ${activeThemeConfig.sidebarBg} shrink-0 p-3 lg:p-4 transition-all`}>
      {/* Quick Action: Register New Device */}
      <div className="mb-4 hidden lg:block">
        <button
          onClick={onOpenAddEquipment}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <PlusCircle className="w-4 h-4" />
          <span>ลงทะเบียนเครื่องใหม่</span>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 scrollbar-none">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all ${
                isActive
                  ? activeThemeConfig.sidebarActiveItem
                  : activeThemeConfig.sidebarInactiveItem
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== null && (
                <span className={`px-2 py-0.5 text-[11px] rounded-full ${item.badgeColor || 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Mobile Add Button */}
      <div className="mt-3 lg:hidden">
        <button
          onClick={onOpenAddEquipment}
          className="w-full py-2 bg-teal-600 text-white text-xs font-medium rounded-xl flex items-center justify-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>ลงทะเบียนเครื่องมือแพทย์</span>
        </button>
      </div>
    </aside>
  );
};

