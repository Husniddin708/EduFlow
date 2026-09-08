import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { groupApi, studentApi, lessonApi } from '../../services/api';
import { GroupDetail, Student } from '../../types';
import { Modal, ConfirmModal, Badge, LoadingSpinner, EmptyState } from '../../components/common/UIComponents';
import {
  ArrowLeft,
  Users,
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Play,
  Award,
} from 'lucide-react';

export const GroupDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isCreateLessonOpen, setIsCreateLessonOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [lessonData, setLessonData] = useState({
    topic: '',
    startTime: '',
    endTime: '',
  });

  const fetchGroup = async () => {
    if (!id) return;
    try {
      const res = await groupApi.getById(id);
      if (res.success) setGroup(res.data);
    } catch (err) {
      console.error('Group fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
    studentApi.getAll({ pageSize: 100 }).then((res) => setAllStudents(res.items));
  }, [id]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedStudentId) return;
    try {
      await groupApi.addStudent(id, selectedStudentId);
      setIsAddStudentOpen(false);
      setSelectedStudentId('');
      fetchGroup();
    } catch (err) {
      console.error('Add student error', err);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!id) return;
    try {
      await groupApi.removeStudent(id, studentId);
      fetchGroup();
    } catch (err) {
      console.error('Remove student error', err);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await lessonApi.create({
        groupId: id,
        topic: lessonData.topic,
        startTime: new Date(lessonData.startTime).toISOString(),
        endTime: new Date(lessonData.endTime).toISOString(),
      });
      setIsCreateLessonOpen(false);
      setLessonData({ topic: '', startTime: '', endTime: '' });
      fetchGroup();
    } catch (err) {
      console.error('Create lesson error', err);
    }
  };

  if (loading) return <LoadingSpinner text="Guruh ma'lumotlari yuklanmoqda..." />;
  if (!group) return <EmptyState title="Guruh topilmadi" />;

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/groups"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0050cb] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Guruhlar ro'yxatiga qaytish</span>
        </Link>
      </div>

      {/* Header Info */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            {group.subjectName && <Badge variant="info">{group.subjectName}</Badge>}
            <h1 className="text-xl font-bold text-slate-800">{group.name}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
            <span>O'qituvchi: <strong className="text-slate-800">{group.teacherName || 'Biriktirilmagan'}</strong></span>
            <span>•</span>
            <span>Oylik to'lov: <strong className="text-slate-800">{group.monthlyFee.toLocaleString()} UZS</strong></span>
            {group.scheduleDescription && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {group.scheduleDescription}</span>
              </>
            )}
            {group.room && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {group.room}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsAddStudentOpen(true)}
            className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-[#0050cb] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>O'quvchi qo'shish</span>
          </button>
          <button
            onClick={() => setIsCreateLessonOpen(true)}
            className="px-3.5 py-2 bg-[#0050cb] hover:bg-[#003fa4] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Dars yaratish</span>
          </button>
        </div>
      </div>

      {/* Grid: Students list and Lessons history */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Students List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0050cb]" />
              <span>Guruh o'quvchilari ({group.students.length} / {group.maxStudents})</span>
            </h3>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {group.students.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Ushbu guruhga hali o'quvchilar qo'shilmagan.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {group.students.map((st) => (
                  <div key={st.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0050cb]/10 text-[#0050cb] flex items-center justify-center font-bold text-xs">
                        {st.firstName[0]}
                      </div>
                      <div>
                        <Link to={`/students/${st.id}`} className="font-bold text-slate-800 hover:text-[#0050cb]">
                          {st.fullName}
                        </Link>
                        <span className="text-[11px] text-slate-400 block">{st.phoneNumber}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-600 font-semibold">{st.attendancePercentage}% davomat</span>
                      <button
                        onClick={() => handleRemoveStudent(st.id)}
                        title="Guruhdan chiqarish"
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Lessons History */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0050cb]" />
            <span>Darslar jadvali ({group.recentLessons.length})</span>
          </h3>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {group.recentLessons.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Darslar mavjud emas.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {group.recentLessons.map((lesson) => (
                  <div key={lesson.id} className="p-3.5 hover:bg-slate-50/50 transition-colors space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <strong className="text-slate-800 block text-xs">{lesson.topic}</strong>
                        <span className="text-[11px] text-slate-400">
                          {new Date(lesson.startTime).toLocaleDateString()} • {new Date(lesson.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <Badge variant={lesson.status === 2 ? 'success' : 'warning'}>
                        {lesson.status === 2 ? 'Tugallangan' : 'Kutilmoqda'}
                      </Badge>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <Link
                        to={`/attendance/${lesson.id}`}
                        className="px-2.5 py-1 bg-[#0050cb] hover:bg-[#003fa4] text-white text-[11px] font-semibold rounded-lg shadow-xs flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Davomat</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      <Modal isOpen={isAddStudentOpen} onClose={() => setIsAddStudentOpen(false)} title="Guruhga o'quvchi qo'shish">
        <form onSubmit={handleAddStudent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">O'quvchini tanlang</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            >
              <option value="">O'quvchini tanlang</option>
              {allStudents
                .filter((s) => !group.students.some((gs) => gs.id === s.id))
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.phoneNumber})
                  </option>
                ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddStudentOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0050cb] hover:bg-[#003fa4] text-white text-xs font-semibold rounded-xl"
            >
              Qo'shish
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Lesson Modal */}
      <Modal isOpen={isCreateLessonOpen} onClose={() => setIsCreateLessonOpen(false)} title="Yangi dars yaratish">
        <form onSubmit={handleCreateLesson} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Dars mavzusi *</label>
            <input
              type="text"
              required
              value={lessonData.topic}
              onChange={(e) => setLessonData({ ...lessonData, topic: e.target.value })}
              placeholder="Writing Task 1: Overview"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Boshlanish vaqti *</label>
              <input
                type="datetime-local"
                required
                value={lessonData.startTime}
                onChange={(e) => setLessonData({ ...lessonData, startTime: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tugash vaqti *</label>
              <input
                type="datetime-local"
                required
                value={lessonData.endTime}
                onChange={(e) => setLessonData({ ...lessonData, endTime: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateLessonOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0050cb] hover:bg-[#003fa4] text-white text-xs font-semibold rounded-xl"
            >
              Yaratish
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
