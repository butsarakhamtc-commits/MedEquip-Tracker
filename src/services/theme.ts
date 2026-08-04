import { ThemeTemplate } from '../types';

export interface ThemeConfig {
  id: ThemeTemplate;
  name: string;
  description: string;
  iconName: string;
  
  // Outer container
  appBg: string;
  
  // Navbar
  navBg: string;
  navText: string;
  navBorder: string;
  
  // Sidebar
  sidebarBg: string;
  sidebarBorder: string;
  sidebarActiveItem: string;
  sidebarInactiveItem: string;

  // Main Cards
  cardBg: string;
  cardBorder: string;
  cardHeaderBorder: string;

  // Sub Boxes inside cards
  subBoxBg: string;
  subBoxBorder: string;

  // Typography
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Accents
  accentBadge: string;
  primaryBtn: string;
}

export const THEME_CONFIGS: Record<ThemeTemplate, ThemeConfig> = {
  'clinical-light': {
    id: 'clinical-light',
    name: 'สว่างพาสเทลน้ำเงิน (Soft Royal Pastel)',
    description: 'โหมดสว่างพาสเทล สบายตา เรียบหรู เหมาะสำหรับการใช้งานทางการในโรงพยาบาลและหน่วยงานราชการ',
    iconName: 'Sun',
    appBg: 'bg-[#f8fafc] text-slate-800',
    navBg: 'bg-white/95 text-slate-800 border-b border-slate-200/80 shadow-xs',
    navText: 'text-slate-800',
    navBorder: 'border-slate-200',
    sidebarBg: 'bg-white border-b lg:border-b-0 lg:border-r border-slate-200/80',
    sidebarBorder: 'border-slate-200',
    sidebarActiveItem: 'bg-blue-50/90 text-blue-800 border border-blue-200 font-bold shadow-xs',
    sidebarInactiveItem: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80',
    cardBg: 'bg-white border border-slate-200/80 shadow-xs text-slate-800',
    cardBorder: 'border-slate-200/80 hover:border-blue-300',
    cardHeaderBorder: 'border-slate-100',
    subBoxBg: 'bg-slate-50/70 border border-slate-200/80',
    subBoxBorder: 'border-slate-200/80',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-700',
    textMuted: 'text-slate-500',
    accentBadge: 'bg-blue-50 text-blue-800 border border-blue-200 font-medium',
    primaryBtn: 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs font-semibold',
  },

  'dark-slate': {
    id: 'dark-slate',
    name: 'สว่างพาสเทลครีมมี่ (Warm Cream Pastel)',
    description: 'โหมดสว่างพาสเทลโทนอุ่น นุ่มนวล ถนอมสายตา ลดแสงสะท้อน',
    iconName: 'Moon',
    appBg: 'bg-[#fafaf9] text-slate-800',
    navBg: 'bg-white/95 text-slate-800 border-b border-stone-200 shadow-xs',
    navText: 'text-slate-800',
    navBorder: 'border-stone-200',
    sidebarBg: 'bg-white border-b lg:border-b-0 lg:border-r border-stone-200',
    sidebarBorder: 'border-stone-200',
    sidebarActiveItem: 'bg-stone-100 text-stone-800 border border-stone-300 font-bold shadow-xs',
    sidebarInactiveItem: 'text-slate-600 hover:text-slate-900 hover:bg-stone-50',
    cardBg: 'bg-white border border-stone-200/90 shadow-xs text-slate-800',
    cardBorder: 'border-stone-200/90 hover:border-stone-300',
    cardHeaderBorder: 'border-stone-100',
    subBoxBg: 'bg-stone-50/70 border border-stone-200',
    subBoxBorder: 'border-stone-200',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-700',
    textMuted: 'text-slate-500',
    accentBadge: 'bg-stone-100 text-stone-800 border border-stone-300',
    primaryBtn: 'bg-slate-700 hover:bg-slate-600 text-white shadow-xs font-semibold',
  },

  'emerald-health': {
    id: 'emerald-health',
    name: 'สว่างพาสเทลเขียวสาสุข (Soft Emerald Health)',
    description: 'ธีมเขียวพาสเทลทางการ สะอาดตา รู้สึกสดชื่น สบายใจ เหมาะกับงานบริการสุขภาพ',
    iconName: 'Leaf',
    appBg: 'bg-[#f4fbf7] text-slate-800',
    navBg: 'bg-white/95 text-slate-800 border-b border-emerald-100 shadow-xs',
    navText: 'text-slate-800',
    navBorder: 'border-emerald-100',
    sidebarBg: 'bg-white border-b lg:border-b-0 lg:border-r border-emerald-100',
    sidebarBorder: 'border-emerald-100',
    sidebarActiveItem: 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold shadow-xs',
    sidebarInactiveItem: 'text-slate-600 hover:text-slate-900 hover:bg-emerald-50/60',
    cardBg: 'bg-white border border-emerald-100 shadow-xs text-slate-800',
    cardBorder: 'border-emerald-100 hover:border-emerald-200',
    cardHeaderBorder: 'border-emerald-100/60',
    subBoxBg: 'bg-emerald-50/40 border border-emerald-100',
    subBoxBorder: 'border-emerald-100',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-700',
    textMuted: 'text-slate-500',
    accentBadge: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    primaryBtn: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs font-semibold',
  },

  'ocean-blue': {
    id: 'ocean-blue',
    name: 'สว่างพาสเทลฟ้าการแพทย์ (Soft Sky Blue)',
    description: 'ธีมฟ้าพาสเทล สว่าง เรียบง่าย สไตล์ไอทีทางการแพทย์ยุคใหม่',
    iconName: 'Sparkles',
    appBg: 'bg-[#f0f7ff] text-slate-800',
    navBg: 'bg-white/95 text-slate-800 border-b border-sky-100 shadow-xs',
    navText: 'text-slate-800',
    navBorder: 'border-sky-100',
    sidebarBg: 'bg-white border-b lg:border-b-0 lg:border-r border-sky-100',
    sidebarBorder: 'border-sky-100',
    sidebarActiveItem: 'bg-sky-50 text-sky-800 border border-sky-200 font-bold shadow-xs',
    sidebarInactiveItem: 'text-slate-600 hover:text-slate-900 hover:bg-sky-50/60',
    cardBg: 'bg-white border border-sky-100 shadow-xs text-slate-800',
    cardBorder: 'border-sky-100 hover:border-sky-200',
    cardHeaderBorder: 'border-sky-100/60',
    subBoxBg: 'bg-sky-50/40 border border-sky-100',
    subBoxBorder: 'border-sky-100',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-700',
    textMuted: 'text-slate-500',
    accentBadge: 'bg-sky-50 text-sky-800 border border-sky-200',
    primaryBtn: 'bg-sky-600 hover:bg-sky-500 text-white shadow-xs font-semibold',
  },
};
