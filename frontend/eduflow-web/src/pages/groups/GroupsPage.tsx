import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { groupApi, teacherApi, subjectApi } from '../../services/api';
import { Group, Teacher, Subject } from '../../types';
import { Modal, ConfirmModal, Badge, LoadingSpinner, EmptyState, PageHeader } from '../../components/common/UIComponents';
import { StartupBanner } from '../../components/common/StartupBanner';
import { StartupEmptyState } from '../../components/common/StartupEmptyState';
import { Plus, Users, Clock, MapPin, Edit2, Trash2, ArrowRight } from 'lucide-react';

export const GroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    teacherId: '',
    subjectId: '',
    monthlyFee: 400000,
    maxStudents: 15,
    scheduleDescription: '',
    room: '',
  });
  const [formError, setFormError] = useState('');

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await groupApi.getAll({ pageSize: 50 });
      setGroups(res.items);
    } catch (err) {
      console.error('Groups fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
    teacherApi.getAll({ pageSize: 100 }).then((res) => setTeachers(res.items));
    subjectApi.getAll().then((res) => setSubjects(res));
  }, []);

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      if (selectedGroup) {
        await groupApi.update(selectedGroup.id, {
          ...formData,
          teacherId: formData.teacherId || undefined,
          subjectId: formData.subjectId || undefined,
          isActive: selectedGroup.isActive,
        });
      } else {
        await groupApi.create({
          ...formData,
          teacherId: formData.teacherId || undefined,
          subjectId: formData.subjectId || undefined,
        });
      }
      setIsModalOpen(false);
      fetchGroups();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Guruhni saqlashda xatolik.');
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;
    try {
      await groupApi.delete(selectedGroup.id);
      fetchGroups();
    } catch (err) {
      console.error('Delete group error', err);
    }
  };

  const openCreateModal = () => {
    setSelectedGroup(null);
    setFormData({
      name: '',
      teacherId: '',
      subjectId: '',
      monthlyFee: 400000,
      maxStudents: 15,
      scheduleDescription: '',
      room: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (group: Group) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      teacherId: group.teacherId || '',
      subjectId: group.subjectId || '',
      monthlyFee: group.monthlyFee,
      maxStudents: group.maxStudents,
      scheduleDescription: group.scheduleDescription || '',
      room: group.room || '',
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <StartupBanner
        badgeText="Akademik Guruhlar 👥"
        title="O‘quv Guruhlari Markazi"
        description="O‘quv yo‘nalishlari, jadvallar, dars xonalari, o‘qituvchilar va har bir guruhdagi o‘quvchilar sig‘imi."
        icon={<Users className="w-6 h-6" />}
        gradientTheme="amber"
        metrics={[
          { label: 'Jami guruhlar', value: `${groups.length} ta` },
          { label: 'Dars jadvallari', value: 'Faol' },
        ]}
        actions={
          <button
            onClick={openCreateModal}
            className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-extrabold rounded-2xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi guruh ochish</span>
          </button>
        }
      />

      {loading ? (
        <LoadingSpinner text="Guruhlar yuklanmoqda..." />
      ) : groups.length === 0 ? (
        <StartupEmptyState
          title="Hozircha guruhlar mavjud emas"
          subtitle="Yangi o‘quv guruhi oching, unga fan va o‘qituvchi biriktiring hamda dars vaqtlarini belgilang."
          onCreateClick={openCreateModal}
          createButtonText="Yangi guruh ochish"
          type="groups"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map((group) => (
            <div
              key={group.id}
              className="group relative bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 p-6 flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-80 group-hover:h-1.5 transition-all" />
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    {group.subjectName && <Badge variant="info">{group.subjectName}</Badge>}
                    <h3 className="text-base font-bold text-slate-800 mt-1.5 group-hover:text-[#0050cb] transition-colors">
                      {group.name}
                    </h3>
                  </div>
                  <Badge variant={group.isActive ? 'success' : 'neutral'}>
                    {group.isActive ? 'Faol' : 'Nofaol'}
                  </Badge>
                </div>

                <div className="space-y-2 text-xs text-slate-600 my-4 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>
                      O'qituvchi: <strong className="text-slate-800">{group.teacherName || 'Biriktirilmagan'}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>
                      O'quvchilar: <strong className="text-slate-800">{group.enrolledStudentsCount} / {group.maxStudents}</strong>
                    </span>
                  </div>
                  {group.scheduleDescription && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{group.scheduleDescription}</span>
                    </div>
                  )}
                  {group.room && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{group.room}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Oylik to'lov</span>
                  <span className="text-xs font-extrabold text-slate-800">
                    {group.monthlyFee.toLocaleString()} UZS
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(group)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedGroup(group);
                      setIsDeleteOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Link
                    to={`/groups/${group.id}`}
                    className="p-1.5 px-3 bg-blue-50 text-[#0050cb] hover:bg-blue-100 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span>Batafsil</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedGroup ? 'Guruhni tahrirlash' : 'Yangi guruh ochish'}
      >
        <form onSubmit={handleSaveGroup} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs">{formError}</div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Guruh nomi *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="IELTS Intermediate - Guruh 1"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0050cb]/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Fan</label>
              <select
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="">Fan tanlang</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">O'qituvchi</label>
              <select
                value={formData.teacherId}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="">O'qituvchi tanlang</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Oylik to'lov (UZS) *</label>
              <input
                type="number"
                required
                value={formData.monthlyFee}
                onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Maksimal o'quvchilar *</label>
              <input
                type="number"
                required
                value={formData.maxStudents}
                onChange={(e) => setFormData({ ...formData, maxStudents: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Dars jadvali</label>
              <input
                type="text"
                value={formData.scheduleDescription}
                onChange={(e) => setFormData({ ...formData, scheduleDescription: e.target.value })}
                placeholder="Du, Chor, Jum | 14:00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Xona</label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="Xona-4"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
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

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteGroup}
        title="Guruhni o'chirish"
        message={`${selectedGroup?.name} guruhini o'chirishni tasdiqlaysizmi?`}
        confirmText="O'chirish"
        isDanger
      />
    </div>
  );
};
