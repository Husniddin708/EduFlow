import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentApi, groupApi } from '../../services/api';
import { Student, Group } from '../../types';
import { Modal, ConfirmModal, Badge, LoadingSpinner, EmptyState, Pagination, PageHeader } from '../../components/common/UIComponents';
import { StartupBanner } from '../../components/common/StartupBanner';
import { StartupEmptyState } from '../../components/common/StartupEmptyState';
import { Plus, Search, Filter, Eye, Edit2, Trash2, Phone, Users } from 'lucide-react';

export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    birthDate: '',
    parentFullName: '',
    parentPhoneNumber: '',
    groupId: '',
  });
  const [formError, setFormError] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await studentApi.getAll({
        search: search || undefined,
        groupId: selectedGroup || undefined,
        page,
        pageSize: 10,
      });
      setStudents(res.items);
      setTotalCount(res.totalCount);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Students fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    groupApi.getAll({ pageSize: 100 }).then((res) => setGroups(res.items));
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [page, selectedGroup]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      await studentApi.create({
        ...formData,
        groupId: formData.groupId || undefined,
        birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : undefined,
      });
      setIsCreateOpen(false);
      setFormData({ firstName: '', lastName: '', phoneNumber: '', birthDate: '', parentFullName: '', parentPhoneNumber: '', groupId: '' });
      fetchStudents();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "O'quvchi qo'shishda xatolik yuz berdi.");
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setFormError('');
    try {
      await studentApi.update(selectedStudent.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : undefined,
        parentFullName: formData.parentFullName,
        parentPhoneNumber: formData.parentPhoneNumber,
        isActive: selectedStudent.isActive,
      });
      setIsEditOpen(false);
      fetchStudents();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "O'quvchini yangilashda xatolik yuz berdi.");
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;
    try {
      await studentApi.delete(selectedStudent.id);
      setIsDeleteOpen(false);
      setSelectedStudent(null);
      fetchStudents();
    } catch (err) {
      console.error('Delete student error', err);
    }
  };

  const openEditModal = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      phoneNumber: student.phoneNumber,
      birthDate: student.birthDate ? student.birthDate.split('T')[0] : '',
      parentFullName: student.parentName || '',
      parentPhoneNumber: student.parentPhone || '',
      groupId: '',
    });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Startup Animated Hub Banner */}
      <StartupBanner
        badgeText="O‘quvchilar Boshqaruvi 🚀"
        title="O‘quvchilar Markazi"
        description="O‘quv markazingizdagi barcha o‘quvchilar, guruhlar taqsimoti, ota-onalar bilan Telegram aloqasi va oylik davomat monitoringi."
        icon={<Users className="w-6 h-6" />}
        gradientTheme="blue"
        metrics={[
          { label: 'Jami ro‘yxatda', value: `${totalCount} ta` },
          { label: 'Faol guruhlar', value: `${groups.length} ta` },
          { label: 'Telegram integratsiya', value: 'Faol' },
        ]}
        actions={
          <button
            onClick={() => {
              setFormData({ firstName: '', lastName: '', phoneNumber: '', birthDate: '', parentFullName: '', parentPhoneNumber: '', groupId: '' });
              setIsCreateOpen(true);
            }}
            className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-[#0050cb] to-[#0066ff] hover:from-[#003fa4] hover:to-[#0050cb] text-white text-xs font-extrabold rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi o‘quvchi qo‘shish</span>
          </button>
        }
      />

      {/* Filters & Search Bar */}
      <div className="bg-white/80 dark:bg-slate-900/80 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-md flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism, familiya yoki telefon..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0050cb]/20 focus:border-[#0050cb]"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0050cb]/20 focus:border-[#0050cb]"
            >
              <option value="">Barcha guruhlar</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students Table or Interactive Startup Empty State */}
      <div className="bg-white/90 dark:bg-slate-900/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden backdrop-blur-md">
        {loading ? (
          <LoadingSpinner text="O'quvchilar ro'yxati yuklanmoqda..." />
        ) : students.length === 0 ? (
          <div className="p-4 sm:p-6">
            <StartupEmptyState
              title="Birinchi o‘quvchingizni qo‘shing yoki Demo ma’lumotlarni sinab ko‘ring!"
              subtitle="O‘quvchilaringizning dars jadvali, davomati, oylik to‘lovlari va ota-onalar bilan Telegram avtomatizatsiyasi shu yerda boshqariladi."
              onCreateClick={() => setIsCreateOpen(true)}
              createButtonText="Yangi o‘quvchi qo‘shish"
              onDemoLoaded={fetchStudents}
              type="students"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">O'quvchi</th>
                  <th className="py-3.5 px-6">Guruhlar</th>
                  <th className="py-3.5 px-6">Ota-ona</th>
                  <th className="py-3.5 px-6 text-center">Davomat</th>
                  <th className="py-3.5 px-6 text-center">O'rtacha Baho</th>
                  <th className="py-3.5 px-6 text-center">To'lov Holati</th>
                  <th className="py-3.5 px-6 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0050cb]/10 text-[#0050cb] flex items-center justify-center font-bold text-xs shrink-0">
                          {st.firstName[0]}
                        </div>
                        <div>
                          <Link
                            to={`/students/${st.id}`}
                            className="font-bold text-slate-800 hover:text-[#0050cb] transition-colors block"
                          >
                            {st.fullName}
                          </Link>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" /> {st.phoneNumber}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      {st.groupNames.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {st.groupNames.map((g, idx) => (
                            <Badge key={idx} variant="info">
                              {g}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Guruhsiz</span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      {st.parentName ? (
                        <div>
                          <span className="font-semibold text-slate-700 block">{st.parentName}</span>
                          <span className="text-[10px] text-slate-400">{st.parentPhone}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-center">
                      <span className="font-bold text-slate-800">{st.attendancePercentage}%</span>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <span className="font-bold text-slate-800">{st.averageGrade > 0 ? st.averageGrade : '—'}</span>
                    </td>

                    <td className="py-4 px-6 text-center">
                      {st.currentPaymentStatus === 2 ? (
                        <Badge variant="success">To'langan</Badge>
                      ) : st.currentPaymentStatus === 3 ? (
                        <Badge variant="danger">Qarzdor</Badge>
                      ) : (
                        <Badge variant="warning">Kutilmoqda</Badge>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/students/${st.id}`}
                          title="Ko'rish"
                          className="p-1.5 text-slate-400 hover:text-[#0050cb] hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openEditModal(st)}
                          title="Tahrirlash"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudent(st);
                            setIsDeleteOpen(true);
                          }}
                          title="O'chirish"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Yangi o'quvchi qo'shish">
        <form onSubmit={handleCreateStudent} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs">{formError}</div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ism *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0050cb]/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Familiya *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0050cb]/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Telefon raqam *</label>
              <input
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="+998 90 123 45 67"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0050cb]/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tug'ilgan sana</label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0050cb]/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Guruhga biriktirish</label>
            <select
              value={formData.groupId}
              onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0050cb]/20"
            >
              <option value="">Guruh tanlanmagan</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.subjectName})
                </option>
              ))}
            </select>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Ota-ona ma'lumotlari</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Ota-ona F.I.SH</label>
                <input
                  type="text"
                  value={formData.parentFullName}
                  onChange={(e) => setFormData({ ...formData, parentFullName: e.target.value })}
                  placeholder="Otabek Rahimov"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Ota-ona telefoni</label>
                <input
                  type="tel"
                  value={formData.parentPhoneNumber}
                  onChange={(e) => setFormData({ ...formData, parentPhoneNumber: e.target.value })}
                  placeholder="+998 90 999 88 77"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0050cb] hover:bg-[#003fa4] text-white text-xs font-semibold rounded-xl"
            >
              Saqlash
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="O'quvchi ma'lumotlarini tahrirlash">
        <form onSubmit={handleUpdateStudent} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs">{formError}</div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ism *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Familiya *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Telefon raqam *</label>
              <input
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tug'ilgan sana</label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Ota-ona ma'lumotlari</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Ota-ona F.I.SH</label>
                <input
                  type="text"
                  value={formData.parentFullName}
                  onChange={(e) => setFormData({ ...formData, parentFullName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Ota-ona telefoni</label>
                <input
                  type="tel"
                  value={formData.parentPhoneNumber}
                  onChange={(e) => setFormData({ ...formData, parentPhoneNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0050cb] hover:bg-[#003fa4] text-white text-xs font-semibold rounded-xl"
            >
              Yangilash
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteStudent}
        title="O'quvchini o'chirish"
        message={`${selectedStudent?.fullName} ni tizimdan o'chirishni tasdiqlaysizmi?`}
        confirmText="O'chirish"
        isDanger
      />
    </div>
  );
};
