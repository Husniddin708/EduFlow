import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { studentApi } from '../../services/api';
import { StudentDetail } from '../../types';
import { Badge, LoadingSpinner, EmptyState } from '../../components/common/UIComponents';
import {
  User,
  Phone,
  Calendar,
  Send,
  ArrowLeft,
  GraduationCap,
  ClipboardCheck,
  CreditCard,
  Award,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'grades' | 'payments'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      studentApi
        .getById(id)
        .then((res) => {
          if (res.success) setStudent(res.data);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <LoadingSpinner text="O'quvchi ma'lumotlari yuklanmoqda..." />;
  if (!student) return <EmptyState title="O'quvchi topilmadi" description="Bunday ID ga ega o'quvchi mavjud emas." />;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/students"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0050cb] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>O'quvchilar ro'yxatiga qaytish</span>
        </Link>
      </div>

      {/* Student Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0050cb] to-[#0066ff] text-white flex items-center justify-center font-black text-2xl shadow-sm">
            {student.firstName[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-800">{student.fullName}</h1>
              <Badge variant={student.isActive ? 'success' : 'neutral'}>
                {student.isActive ? 'Faol' : 'Nofaol'}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> {student.phoneNumber}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> A'zo bo'lgan: {new Date(student.enrollmentDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {student.parent?.isTelegramConnected && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-[#0050cb]">
              <Send className="w-3.5 h-3.5 text-[#0088cc]" />
              <span>Telegram Ulangan</span>
            </div>
          )}
        </div>
      </div>

      {/* Profile Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white px-6 rounded-t-2xl">
        {[
          { id: 'overview', label: 'Umumiy Ma’lumot', icon: User },
          { id: 'attendance', label: 'Davomat Tarixi', icon: ClipboardCheck },
          { id: 'grades', label: 'Baholar', icon: Award },
          { id: 'payments', label: 'To‘lovlar', icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-4 font-bold text-xs border-b-2 transition-all ${
                isActive
                  ? 'border-[#0050cb] text-[#0050cb]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-b-2xl border-x border-b border-slate-200/80 p-6 shadow-xs">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">O'rtacha Baho</span>
                <div className="text-2xl font-black text-[#0050cb] mt-1">
                  {student.averageGrade > 0 ? student.averageGrade : '—'}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Davomat Foizi</span>
                <div className="text-2xl font-black text-emerald-700 mt-1">{student.attendancePercentage}%</div>
              </div>
              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">To'lov Holati</span>
                <div className="mt-1">
                  <Badge variant={student.currentPaymentStatus === 2 ? 'success' : student.currentPaymentStatus === 3 ? 'danger' : 'warning'}>
                    {student.currentPaymentStatus === 2 ? "To'langan" : student.currentPaymentStatus === 3 ? 'Qarzdor' : 'Kutilmoqda'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Parent & Groups Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#0050cb]" />
                  <span>Ota-ona Ma'lumotlari</span>
                </h3>
                {student.parent ? (
                  <div className="space-y-2 text-xs">
                    <div><span className="text-slate-400">F.I.SH:</span> <strong className="text-slate-800">{student.parent.fullName}</strong></div>
                    <div><span className="text-slate-400">Telefon:</span> <strong className="text-slate-800">{student.parent.phoneNumber}</strong></div>
                    <div><span className="text-slate-400">Telegram:</span> {student.parent.isTelegramConnected ? <span className="text-emerald-600 font-semibold">Ulangan (@{student.parent.telegramChatId})</span> : <span className="text-slate-400 italic">Ulanmagan</span>}</div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Ota-ona ma'lumotlari kiritilmagan.</p>
                )}
              </div>

              <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#0050cb]" />
                  <span>A'zo bo'lgan Guruhlari</span>
                </h3>
                {student.groups.length > 0 ? (
                  <div className="space-y-2">
                    {student.groups.map((g) => (
                      <div key={g.id} className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                        <div>
                          <strong className="text-slate-800 block">{g.name}</strong>
                          <span className="text-slate-400">{g.subjectName} • {g.teacherName}</span>
                        </div>
                        <Link to={`/groups/${g.id}`} className="text-[#0050cb] font-bold hover:underline">
                          Guruhga o'tish →
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Hech qanday guruhga biriktirilmagan.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Oxirgi davomat qaydlari</h3>
            {student.recentAttendances.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Hozircha davomat qaydlari mavjud emas.</p>
            ) : (
              <div className="space-y-2">
                {student.recentAttendances.map((att) => (
                  <div key={att.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-800 block">Dars sanasi: {new Date(att.lessonDate).toLocaleDateString()}</span>
                      {att.comment && <span className="text-slate-400 italic">Izoh: {att.comment}</span>}
                    </div>
                    <Badge variant={att.status === 1 ? 'success' : att.status === 2 ? 'danger' : att.status === 3 ? 'warning' : 'info'}>
                      {att.status === 1 ? 'Qatnashdi' : att.status === 2 ? 'Kelmadi' : att.status === 3 ? 'Kechikdi' : 'Sababli'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'grades' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Oxirgi baholar</h3>
            {student.recentGrades.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Hozircha baholar qo'yilmagan.</p>
            ) : (
              <div className="space-y-2">
                {student.recentGrades.map((gr) => (
                  <div key={gr.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block">{gr.subjectName || 'Dars'}</span>
                      <span className="text-slate-400">{new Date(gr.createdAt).toLocaleDateString()} {gr.comment ? `• ${gr.comment}` : ''}</span>
                    </div>
                    <div className="text-base font-black text-[#0050cb] bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">
                      {gr.score} ball
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800">To'lovlar tarixi</h3>
            {student.recentPayments.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Hozircha to'lov qaydlari mavjud emas.</p>
            ) : (
              <div className="space-y-2">
                {student.recentPayments.map((pm) => (
                  <div key={pm.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block">{pm.amount.toLocaleString()} UZS</span>
                      <span className="text-slate-400">Muddat: {new Date(pm.dueDate).toLocaleDateString()} {pm.description ? `• ${pm.description}` : ''}</span>
                    </div>
                    <Badge variant={pm.status === 2 ? 'success' : pm.status === 3 ? 'danger' : 'warning'}>
                      {pm.status === 2 ? "To'langan" : pm.status === 3 ? 'Qarzdor' : 'Kutilmoqda'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
