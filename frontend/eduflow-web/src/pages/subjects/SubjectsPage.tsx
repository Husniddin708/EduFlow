import React, { useEffect, useState } from 'react';
import { subjectApi } from '../../services/api';
import { Subject } from '../../types';
import { Modal, ConfirmModal, LoadingSpinner, EmptyState, PageHeader } from '../../components/common/UIComponents';
import { StartupBanner } from '../../components/common/StartupBanner';
import { Plus, BookOpen, Edit2, Trash2 } from 'lucide-react';

export const SubjectsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [name, setName] = useState('');
  const [formError, setFormError] = useState('');

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await subjectApi.getAll();
      setSubjects(res);
    } catch (err) {
      console.error('Subjects fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      if (selectedSubject) {
        await subjectApi.update(selectedSubject.id, { name });
      } else {
        await subjectApi.create({ name });
      }
      setIsModalOpen(false);
      setSelectedSubject(null);
      setName('');
      await fetchSubjects();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Fanni saqlashda xatolik.');
    }
  };

  const handleDelete = async () => {
    if (!selectedSubject) return;
    const targetId = selectedSubject.id;
    setIsDeleteOpen(false);
    setSelectedSubject(null);

    // Optimistik tarzda ekrandan darhol o'chirish
    setSubjects((prev) => prev.filter((s) => s.id !== targetId));

    try {
      await subjectApi.delete(targetId);
      await fetchSubjects();
    } catch (err: any) {
      console.error('Delete subject error', err);
      alert(err.response?.data?.message || "Fanni o'chirishda xatolik yuz berdi.");
      await fetchSubjects();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <StartupBanner
        badgeText="Fanlar va Kurslar 📚"
        title="O‘quv Fanlari Markazi"
        description="O‘quv markazida o‘qitiladigan barcha fanlar, kurs yo‘nalishlari va guruhlar biriktirilishi."
        icon={<BookOpen className="w-6 h-6" />}
        gradientTheme="purple"
        metrics={[
          { label: 'Jami fanlar', value: `${subjects.length} ta` },
          { label: 'Kurslar holati', value: 'Faol' },
        ]}
        actions={
          <button
            onClick={() => {
              setSelectedSubject(null);
              setName('');
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-extrabold rounded-2xl shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi fan qo‘shish</span>
          </button>
        }
      />

      {loading ? (
        <LoadingSpinner text="Fanlar yuklanmoqda..." />
      ) : subjects.length === 0 ? (
        <EmptyState
          title="Fanlar mavjud emas"
          description="Hozircha fanlar kiritilmagan."
          actionText="Yangi fan qo'shish"
          onAction={() => {
            setSelectedSubject(null);
            setName('');
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-[#0050cb]/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0050cb] flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{sub.name}</h3>
                  <span className="text-[11px] text-slate-400">{sub.groupsCount} ta guruh</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setSelectedSubject(sub);
                    setName(sub.name);
                    setIsModalOpen(true);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedSubject(sub);
                    setIsDeleteOpen(true);
                  }}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedSubject ? 'Fanni tahrirlash' : 'Yangi fan qo‘shish'}>
        <form onSubmit={handleSave} className="space-y-4">
          {formError && <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl">{formError}</div>}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Fan nomi *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan: IELTS Writing"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
            >
              Bekor qilish
            </button>
            <button type="submit" className="px-4 py-2 bg-[#0050cb] text-white text-xs font-semibold rounded-xl">
              Saqlash
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Fanni o'chirish"
        message={`${selectedSubject?.name} fanini o'chirishni tasdiqlaysizmi?`}
        confirmText="O'chirish"
        isDanger
      />
    </div>
  );
};
