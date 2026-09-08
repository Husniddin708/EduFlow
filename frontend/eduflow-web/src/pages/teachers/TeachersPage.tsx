import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { teacherApi, groupApi, financeApi } from '../../services/api';
import { Teacher, Group, TeacherSalaryReportItem } from '../../types';
import { Modal, ConfirmModal, Badge, LoadingSpinner, EmptyState, PageHeader } from '../../components/common/UIComponents';
import { StartupBanner } from '../../components/common/StartupBanner';
import { StartupEmptyState } from '../../components/common/StartupEmptyState';
import {
  Plus,
  GraduationCap,
  Phone,
  Edit2,
  Trash2,
  Mail,
  Lock,
  Eye,
  BookOpen,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Layers
} from 'lucide-react';

export const TeachersPage: React.FC = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit / Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // Teacher Detail Modal
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailTeacher, setDetailTeacher] = useState<Teacher | null>(null);
  const [teacherGroups, setTeacherGroups] = useState<Group[]>([]);
  const [teacherSalary, setTeacherSalary] = useState<TeacherSalaryReportItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    specialization: '',
    email: '',
    password: '',
  });
  const [formError, setFormError] = useState('');

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await teacherApi.getAll({ pageSize: 50 });
      setTeachers(res.items);
    } catch (err) {
      console.error('Teachers fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const openDetailModal = async (t: Teacher) => {
    setDetailTeacher(t);
    setIsDetailOpen(true);
    setDetailLoading(true);
    try {
      const [groupRes, salaryRes] = await Promise.all([
        groupApi.getAll({ pageSize: 100 }),
        financeApi.getTeacherSalaries(),
      ]);
      if (groupRes?.items) {
        setTeacherGroups(groupRes.items.filter((g: Group) => g.teacherId === t.id));
      }
      if (salaryRes?.data) {
        const sal = salaryRes.data.find((s: TeacherSalaryReportItem) => s.teacherId === t.id);
        setTeacherSalary(sal || null);
      }
    } catch (err) {
      console.error('Error loading teacher details', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      if (selectedTeacher) {
        await teacherApi.update(selectedTeacher.id, {
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          specialization: formData.specialization,
        });
      } else {
        await teacherApi.create(formData);
      }
      setIsModalOpen(false);
      fetchTeachers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "O'qituvchini saqlashda xatolik.");
    }
  };

  const handleDeleteTeacher = async () => {
    if (!selectedTeacher) return;
    try {
      await teacherApi.delete(selectedTeacher.id);
      setIsDeleteOpen(false);
      setIsDetailOpen(false);
      fetchTeachers();
    } catch (err) {
      console.error('Delete teacher error', err);
    }
  };

  const openCreateModal = () => {
    setSelectedTeacher(null);
    setFormData({ fullName: '', phoneNumber: '', specialization: '', email: '', password: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (t: Teacher) => {
    setSelectedTeacher(t);
    setFormData({ fullName: t.fullName, phoneNumber: t.phoneNumber, specialization: t.specialization || '', email: '', password: '' });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <StartupBanner
        badgeText="Mentorlar va Mutaxassislar 🎓"
        title="O‘qituvchilar Tarkibi"
        description="O‘quv markazingiz mutaxassislari, ularning dars guruhlari, mutaxassisliklari va o‘qituvchi akkauntlari boshqaruvi."
        icon={<GraduationCap className="w-6 h-6" />}
        gradientTheme="purple"
        metrics={[
          { label: 'Faol o‘qituvchilar', value: `${teachers.length} nafar` },
          { label: 'Tizimga kirish huquqi', value: 'Faol' },
        ]}
        actions={
          <button
            onClick={openCreateModal}
            className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-extrabold rounded-2xl shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi o‘qituvchi qo‘shish</span>
          </button>
        }
      />

      {loading ? (
        <LoadingSpinner text="O'qituvchilar yuklanmoqda..." />
      ) : teachers.length === 0 ? (
        <StartupEmptyState
          title="Hozircha o‘qituvchilar qo‘shilmagan"
          subtitle="O‘quv markazingiz o‘qituvchilarini qo‘shing va ularga o‘z guruhlarini boshqarish uchun shaxsiy kabinet ochib bering."
          onCreateClick={openCreateModal}
          createButtonText="Yangi o‘qituvchi qo‘shish"
          type="teachers"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {teachers.map((t) => (
            <div
              key={t.id}
              onClick={() => openDetailModal(t)}
              className="group relative bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 p-6 flex flex-col justify-between overflow-hidden cursor-pointer"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-80 group-hover:h-1.5 transition-all" />
              <div>
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                    {t.fullName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {t.fullName}
                    </h3>
                    <Badge variant="info">{t.specialization || 'Fan o‘qituvchisi'}</Badge>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{t.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-slate-400" />
                    <span>
                      Biriktirilgan guruhlar:{' '}
                      <strong className="text-slate-800 dark:text-white">{t.groupsCount} ta</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDetailModal(t);
                  }}
                  className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-all cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Batafsil ko‘rish</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(t);
                    }}
                    title="Tahrirlash"
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTeacher(t);
                      setIsDeleteOpen(true);
                    }}
                    title="O‘chirish"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Teacher Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="O‘qituvchi Ma’lumotlari va Guruhlari"
      >
        {detailTeacher && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Header info */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-indigo-500/25">
                {detailTeacher.fullName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-slate-800 dark:text-white truncate">
                    {detailTeacher.fullName}
                  </h3>
                  <Badge variant="info">{detailTeacher.specialization || 'Fan o‘qituvchisi'}</Badge>
                  <Badge variant="success">Faol</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <a href={`tel:${detailTeacher.phoneNumber}`} className="hover:underline text-indigo-600 dark:text-indigo-400 font-semibold">
                      {detailTeacher.phoneNumber}
                    </a>
                  </span>
                  <span>EduFlow Markaz Ustozi</span>
                </div>
              </div>
            </div>

            {/* Financial & Performance Bento Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/50 rounded-2xl">
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">Guruhlar</span>
                <span className="text-lg font-black text-purple-700 dark:text-purple-300 mt-0.5 block">
                  {teacherGroups.length} ta
                </span>
              </div>

              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/50 rounded-2xl">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">O‘quvchilar</span>
                <span className="text-lg font-black text-blue-700 dark:text-blue-300 mt-0.5 block">
                  {teacherSalary?.totalStudentsCount ?? teacherGroups.reduce((acc, g) => acc + (g.enrolledStudentsCount || 0), 0)} nafar
                </span>
              </div>

              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/50 rounded-2xl col-span-2 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Oylik Maoshi</span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {teacherSalary?.sharePercentage || 20}% ulush
                  </span>
                </div>
                <span className="text-lg font-black text-emerald-700 dark:text-emerald-300 mt-0.5 block">
                  {(teacherSalary?.teacherSalaryAmount || 0).toLocaleString()} <span className="text-xs font-semibold">UZS</span>
                </span>
              </div>
            </div>

            {/* Groups list */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  <span>Biriktirilgan Dars Guruhlari ({teacherGroups.length})</span>
                </h4>
                <Link
                  to="/groups"
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  Barcha guruhlar <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {detailLoading ? (
                <LoadingSpinner text="Guruhlar yuklanmoqda..." />
              ) : teacherGroups.length === 0 ? (
                <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ushbu o‘qituvchiga hozircha guruh biriktirilmagan.
                  </p>
                  <Link
                    to="/groups"
                    className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-xl hover:bg-purple-200 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Guruh biriktirish</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {teacherGroups.map((g) => (
                    <div
                      key={g.id}
                      className="p-3.5 bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl flex items-center justify-between gap-3 hover:border-purple-300 dark:hover:border-purple-700 transition-all"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                            {g.name}
                          </span>
                          {g.subjectName && <Badge variant="info">{g.subjectName}</Badge>}
                          <Badge variant={g.isActive ? 'success' : 'warning'}>
                            {g.isActive ? 'Faol' : 'Nofaol'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-slate-400" />
                            {g.enrolledStudentsCount || 0} / {g.maxStudents || 15} o‘quvchi
                          </span>
                          <span>•</span>
                          <span>{g.monthlyFee?.toLocaleString() || 0} UZS/oy</span>
                          {g.room && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {g.room}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <Link
                        to={`/groups/${g.id}`}
                        className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-purple-100 hover:text-purple-600 dark:hover:bg-purple-900/50 dark:hover:text-purple-300 text-slate-600 dark:text-slate-300 rounded-xl transition-all shrink-0 cursor-pointer"
                        title="Guruh sahifasini ochish"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setIsDetailOpen(false);
                  setSelectedTeacher(detailTeacher);
                  setIsDeleteOpen(true);
                }}
                className="px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>O‘chirish</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDetailOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Yopish
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailOpen(false);
                    openEditModal(detailTeacher);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Tahrirlash</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit / Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTeacher ? "O'qituvchini tahrirlash" : "Yangi o'qituvchi qo'shish"}
      >
        <form onSubmit={handleSaveTeacher} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs">{formError}</div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">To'liq F.I.SH *</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Azizbek Karimov"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefon raqami *</label>
              <input
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="+998 90 123 45 67"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mutaxassisligi</label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="IELTS & Ingliz tili"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
              />
            </div>
          </div>

          {!selectedTeacher && (
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white">Tizimga kirish akkaunti (ixtiyoriy)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="teacher@smartedu.uz"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Parol</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Saqlash
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteTeacher}
        title="O'qituvchini o'chirish"
        message={`${selectedTeacher?.fullName} ni o'chirishni tasdiqlaysizmi?`}
        confirmText="O'chirish"
        isDanger
      />
    </div>
  );
};
