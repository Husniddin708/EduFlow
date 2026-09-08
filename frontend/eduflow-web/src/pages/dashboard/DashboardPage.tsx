import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../services/api';
import { DashboardStats } from '../../types';
import { LoadingSpinner, Badge, EmptyState } from '../../components/common/UIComponents';
import { DashboardHero } from '../../components/dashboard/DashboardHero';
import {
  Users,
  GraduationCap,
  UsersRound,
  CalendarCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
  Play,
  UserPlus,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardApi.getStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Dashboard stats fetch error', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Dashboard ma'lumotlari yuklanmoqda..." />;
  }

  if (!stats) {
    return <EmptyState title="Ma'lumot topilmadi" description="Dashboard statistikasi mavjud emas." />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Animated Interactive Dashboard Hero Banner */}
      <DashboardHero />

      {/* Quick Actions for Learning Center Admin */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/students"
          className="group relative overflow-hidden bg-white/80 dark:bg-slate-900/80 hover:bg-blue-50/70 dark:hover:bg-blue-950/40 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex items-center gap-3 backdrop-blur-md cursor-pointer hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/60 text-[#0050cb] dark:text-blue-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-white block">+ O‘quvchi qo‘shish</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Ro‘yxatga olish</span>
          </div>
        </Link>

        <Link
          to="/teachers"
          className="group relative overflow-hidden bg-white/80 dark:bg-slate-900/80 hover:bg-purple-50/70 dark:hover:bg-purple-950/40 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex items-center gap-3 backdrop-blur-md cursor-pointer hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-white block">+ O‘qituvchi qo‘shish</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Mentor biriktirish</span>
          </div>
        </Link>

        <Link
          to="/groups"
          className="group relative overflow-hidden bg-white/80 dark:bg-slate-900/80 hover:bg-amber-50/70 dark:hover:bg-amber-950/40 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex items-center gap-3 backdrop-blur-md cursor-pointer hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <UsersRound className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-white block">+ Yangi Guruh</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Kurs ochish</span>
          </div>
        </Link>

        <Link
          to="/attendance"
          className="group relative overflow-hidden bg-white/80 dark:bg-slate-900/80 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex items-center gap-3 backdrop-blur-md cursor-pointer hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <CalendarCheck2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-white block">Davomat qilish</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Tezkor belgilash</span>
          </div>
        </Link>
      </div>

      {/* Main Stats Bento Grid with Animated Accents */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <Link
          to="/students"
          className="group relative bg-white dark:bg-slate-900/90 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-80 group-hover:h-1.5 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">O'quvchilar</span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white flex items-center justify-center shadow-md shadow-blue-500/30 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white tracking-tight">{stats.studentsCount}</div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Faol o'quvchilar
            </span>
          </div>
        </Link>

        {/* Teachers */}
        <Link
          to="/teachers"
          className="group relative bg-white dark:bg-slate-900/90 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-80 group-hover:h-1.5 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">O'qituvchilar</span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/30 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white tracking-tight">{stats.teachersCount}</div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1.5 block">Barcha mutaxassislar</span>
          </div>
        </Link>

        {/* Groups */}
        <Link
          to="/groups"
          className="group relative bg-white dark:bg-slate-900/90 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-80 group-hover:h-1.5 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">Guruhlar</span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center shadow-md shadow-purple-500/30 group-hover:scale-110 transition-transform">
              <UsersRound className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white tracking-tight">{stats.groupsCount}</div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1.5 block">Faol guruhlar</span>
          </div>
        </Link>

        {/* Monthly Revenue */}
        <Link
          to="/payments"
          className="group relative bg-white dark:bg-slate-900/90 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-80 group-hover:h-1.5 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Oylik Tushum</span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white truncate tracking-tight">
              {stats.monthlyRevenue.toLocaleString()} <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">UZS</span>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-1.5">
              Joriy oy tushumi
            </span>
          </div>
        </Link>
      </div>

      {/* Daily Attendance Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/attendance"
          className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-900 dark:text-emerald-200">{stats.presentToday}</div>
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Bugun darsda qatnashdi</span>
          </div>
        </Link>

        <Link
          to="/attendance"
          className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/50 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-rose-900 dark:text-rose-200">{stats.absentToday}</div>
            <span className="text-xs font-medium text-rose-700 dark:text-rose-400">Bugun kelmadi (Sababsiz)</span>
          </div>
        </Link>

        <Link
          to="/attendance"
          className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-900 dark:text-amber-200">{stats.lateToday}</div>
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Kechikib kelganlar</span>
          </div>
        </Link>
      </div>

      {/* Grid: Today's Lessons & Overdue Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Today's Lessons */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CalendarCheck2 className="w-5 h-5 text-[#0050cb]" />
              <span>Bugungi darslar ({stats.todayLessons.length})</span>
            </h3>
            <Link to="/lessons" className="text-xs font-bold text-[#0050cb] hover:underline flex items-center gap-1">
              Barchasi <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats.todayLessons.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-sm text-slate-500">
              Bugun uchun rejalashtirilgan darslar yo'q.
            </div>
          ) : (
            <div className="space-y-3">
              {stats.todayLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#0050cb]/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-[#0050cb] transition-colors">
                        {lesson.groupName}
                      </span>
                      {lesson.subjectName && <Badge variant="info">{lesson.subjectName}</Badge>}
                      <Badge variant={lesson.status === 2 ? 'success' : 'warning'}>
                        {lesson.status === 2 ? 'Tugallangan' : 'Rejalashtirilgan'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">{lesson.topic}</p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-3">
                      <span>O'qituvchi: {lesson.teacherName || 'Biriktirilmagan'}</span>
                      <span>•</span>
                      <span>O'quvchilar: {lesson.totalStudents} nafar</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-800 block">
                        {new Date(lesson.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[10px] text-slate-400">Vaqt</span>
                    </div>
                    <Link
                      to={`/attendance/${lesson.id}`}
                      className="px-3 py-1.5 bg-[#0050cb] hover:bg-[#003fa4] text-white text-xs font-semibold rounded-lg shadow-xs transition-all whitespace-nowrap"
                    >
                      Davomat
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Overdue Payments & Revenue Summary */}
        <div className="lg:col-span-5 space-y-6">
          {/* Overdue Alert Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <span>Qarzdorliklar ({stats.overduePayments.length})</span>
              </h3>
              <Link to="/payments" className="text-xs font-bold text-[#0050cb] hover:underline">
                To'lovlar
              </Link>
            </div>

            {stats.overduePayments.length === 0 ? (
              <p className="text-xs text-slate-500">Hozirda muddati o'tgan qarzdorliklar mavjud emas.</p>
            ) : (
              <div className="space-y-2.5">
                {stats.overduePayments.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">{p.studentName}</span>
                      <span className="text-[10px] text-rose-600 font-semibold">
                        Muddat: {new Date(p.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-rose-700 block">
                        {p.amount.toLocaleString()} UZS
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attendance Overview Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-800">O'rtacha Davomat Ko'rsatkichi</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-[#0050cb] flex items-center justify-center font-black text-lg text-slate-800">
                {stats.attendanceRate}%
              </div>
              <div className="text-xs text-slate-500 space-y-1">
                <p>O'quv markazidagi o'quvchilarning umumiy darslarga qatnashish intizomi ko'rsatkichi.</p>
                <Link to="/reports" className="text-[#0050cb] font-bold hover:underline inline-block mt-1">
                  Batafsil hisobotni ko'rish →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
