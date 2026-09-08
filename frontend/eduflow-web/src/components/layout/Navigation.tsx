import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UsersRound,
  BookOpen,
  CalendarCheck2,
  ClipboardCheck,
  Award,
  CreditCard,
  Bell,
  BarChart3,
  Settings,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Search,
  Plus,
} from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user, organization, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(isSuperAdmin ? [{ to: '/admin', label: 'SuperAdmin Boshqaruvi', icon: ShieldCheck }] : []),
    { to: '/students', label: 'O‘quvchilar', icon: Users },
    { to: '/teachers', label: 'O‘qituvchilar', icon: GraduationCap },
    { to: '/groups', label: 'Guruhlar', icon: UsersRound },
    { to: '/subjects', label: 'Fanlar', icon: BookOpen },
    { to: '/lessons', label: 'Darslar', icon: CalendarCheck2 },
    { to: '/attendance', label: 'Davomat', icon: ClipboardCheck },
    { to: '/grades', label: 'Baholar', icon: Award },
    { to: '/payments', label: 'To‘lovlar', icon: CreditCard },
    { to: '/reports', label: 'Hisobotlar', icon: BarChart3 },
    { to: '/settings', label: 'Sozlamalar', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0050cb] to-[#0066ff] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              E
            </div>
            <div>
              <h1 className="font-bold text-base text-slate-800 tracking-tight leading-none">EduFlow</h1>
              <p className="text-[11px] text-slate-500 font-medium mt-1 truncate max-w-[130px]">
                {organization?.name || "O'quv Markazi"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-[#d0e1fb]/60 text-[#0050cb] font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#0050cb] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user?.firstName?.[0] || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {user?.role === 3 ? 'O‘qituvchi' : 'Administrator'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Chiqish"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const { user, organization } = useAuth();
  const navigate = useNavigate();
  const [isQuickOpen, setIsQuickOpen] = useState(false);

  return (
    <header className="sticky top-0 right-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 md:px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 text-slate-500 hover:text-slate-800 md:hidden rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative hidden sm:block w-64 md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Qidirish (o'quvchi, guruh, dars)..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 rounded-full text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0050cb]/20 focus:border-[#0050cb] transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Add Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsQuickOpen(!isQuickOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#0050cb] to-[#0066ff] hover:from-[#003fa4] hover:to-[#0050cb] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer hover:-translate-y-0.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Qo‘shish</span>
          </button>

          {isQuickOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsQuickOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={() => { setIsQuickOpen(false); navigate('/students'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                >
                  <Users className="w-4 h-4 text-[#0050cb]" />
                  <span>Yangi O‘quvchi</span>
                </button>
                <button
                  onClick={() => { setIsQuickOpen(false); navigate('/teachers'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4 text-purple-600" />
                  <span>Yangi O‘qituvchi</span>
                </button>
                <button
                  onClick={() => { setIsQuickOpen(false); navigate('/groups'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                >
                  <UsersRound className="w-4 h-4 text-amber-500" />
                  <span>Yangi Guruh</span>
                </button>
                <button
                  onClick={() => { setIsQuickOpen(false); navigate('/attendance'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                >
                  <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                  <span>Davomat Qilish</span>
                </button>
              </div>
            </>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 rounded-full text-xs text-[#0050cb] dark:text-blue-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{organization?.name || 'EduFlow'}</span>
        </div>

        <ThemeToggle />

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0050cb] to-[#0066ff] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {user?.firstName?.[0] || 'A'}
          </div>
          <div className="hidden sm:block text-left">
            <span className="block text-xs font-bold text-slate-800 dark:text-white leading-tight">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="text-[10px] text-slate-400">
              {user?.role === 3 ? 'O‘qituvchi' : 'Administrator'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
