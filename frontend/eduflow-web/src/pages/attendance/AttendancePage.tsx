import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { lessonApi, groupApi, attendanceApi } from '../../services/api';
import { Lesson, Attendance, Student } from '../../types';
import { Badge, LoadingSpinner, EmptyState } from '../../components/common/UIComponents';
import { StartupBanner } from '../../components/common/StartupBanner';
import { StartupEmptyState } from '../../components/common/StartupEmptyState';
import {
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  Save,
  CheckCheck,
  ArrowLeft,
  Calendar,
  UserCheck,
  Send,
} from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>(lessonId || '');
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: number; comment?: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Load list of today's / recent lessons
  useEffect(() => {
    const loadLessons = async () => {
      try {
        const todayLessons = await lessonApi.getToday();
        setLessons(todayLessons);
        if (!selectedLessonId && todayLessons.length > 0) {
          setSelectedLessonId(todayLessons[0].id);
        }
      } catch (err) {
        console.error('Error fetching lessons', err);
      } finally {
        setLoading(false);
      }
    };
    loadLessons();
  }, []);

  // When selectedLessonId changes, load group students & existing attendance
  useEffect(() => {
    if (!selectedLessonId) return;

    const loadLessonDetails = async () => {
      setLoading(true);
      setSuccessMessage('');
      try {
        const lRes = await lessonApi.getById(selectedLessonId);
        if (lRes.success) {
          setCurrentLesson(lRes.data);
          // Load students of this group
          const gStudents = await groupApi.getStudents(lRes.data.groupId);
          setStudents(gStudents);

          // Load existing attendance
          const existingAtt = await attendanceApi.getByLesson(selectedLessonId);
          const map: Record<string, { status: number; comment?: string }> = {};

          // Populate with existing or default to Present (1)
          gStudents.forEach((st) => {
            const found = existingAtt.find((a) => a.studentId === st.id);
            map[st.id] = {
              status: found ? found.status : 1, // Default to Present
              comment: found?.comment || '',
            };
          });

          setAttendanceMap(map);
        }
      } catch (err) {
        console.error('Error loading lesson attendance', err);
      } finally {
        setLoading(false);
      }
    };

    loadLessonDetails();
  }, [selectedLessonId]);

  const handleStatusChange = (studentId: string, status: number) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleCommentChange = (studentId: string, comment: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        comment,
      },
    }));
  };

  const handleMarkAllPresent = () => {
    setAttendanceMap((prev) => {
      const updated: Record<string, { status: number; comment?: string }> = {};
      Object.keys(prev).forEach((id) => {
        updated[id] = { ...prev[id], status: 1 };
      });
      return updated;
    });
  };

  const handleSaveAttendance = async () => {
    if (!selectedLessonId) return;
    setSaving(true);
    setSuccessMessage('');

    try {
      const items = Object.entries(attendanceMap).map(([studentId, data]) => ({
        studentId,
        status: data.status,
        comment: data.comment,
      }));

      await attendanceApi.saveBulk({
        lessonId: selectedLessonId,
        items,
      });

      setSuccessMessage("Davomat muvaffaqiyatli saqlandi! Kelmagan o'quvchilar ota-onalariga Telegram orqali xabar yuborildi.");
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Save attendance error', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Startup Animated Attendance Hub Banner */}
      <StartupBanner
        badgeText="Tezkor Davomat ⚡"
        title="Davomat Belgilash Markazi"
        description="O‘quvchilarning darsga qatnashishi, sababli yoki kechikkanlar hisobi va ota-onalarga avtomatik Telegram xabari."
        icon={<UserCheck className="w-6 h-6" />}
        gradientTheme="blue"
        metrics={[
          { label: 'Bugungi darslar', value: `${lessons.length} ta` },
          { label: 'Telegram ogohlantirish', value: 'Faol' },
        ]}
        actions={
          <div className="w-full sm:w-72">
            <select
              value={selectedLessonId}
              onChange={(e) => setSelectedLessonId(e.target.value)}
              className="w-full px-4 py-3 bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-md rounded-2xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0050cb]/20"
            >
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.groupName} — {l.topic}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {loading ? (
        <LoadingSpinner text="Davomat ma'lumotlari yuklanmoqda..." />
      ) : !currentLesson ? (
        <EmptyState
          title="Dars tanlanmagan"
          description="Davomat belgilash uchun darslar ro'yxatidan darsni tanlang."
          actionText="Darslar jadvaliga o'tish"
          onAction={() => navigate('/lessons')}
        />
      ) : (
        <div className="space-y-6">
          {/* Lesson Header Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="info">{currentLesson.subjectName || 'Fan'}</Badge>
                <h2 className="text-lg font-extrabold text-slate-800">{currentLesson.groupName}</h2>
              </div>
              <p className="text-sm font-semibold text-slate-700 mt-1">{currentLesson.topic}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {new Date(currentLesson.startTime).toLocaleDateString()}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(currentLesson.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                  {new Date(currentLesson.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span>•</span>
                <span>O'qituvchi: {currentLesson.teacherName || 'Biriktirilmagan'}</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
              >
                <CheckCheck className="w-4 h-4 text-emerald-600" />
                <span>Barchani qatnashdi qilish</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={saving}
                className="px-5 py-2.5 bg-[#0050cb] hover:bg-[#003fa4] text-white text-xs font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saqlanmoqda...' : 'Saqlash'}</span>
              </button>
            </div>
          </div>

          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Student Attendance List */}
          {students.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-500 text-xs">
              Ushbu guruhda o'quvchilar mavjud emas.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {students.map((st, idx) => {
                const currentStatus = attendanceMap[st.id]?.status || 1;
                const currentComment = attendanceMap[st.id]?.comment || '';

                return (
                  <div
                    key={st.id}
                    className={`bg-white rounded-2xl border p-5 shadow-xs transition-all space-y-4 ${
                      currentStatus === 1
                        ? 'border-emerald-200/80 bg-emerald-50/10'
                        : currentStatus === 2
                        ? 'border-rose-200/80 bg-rose-50/20'
                        : currentStatus === 3
                        ? 'border-amber-200/80 bg-amber-50/20'
                        : 'border-blue-200/80 bg-blue-50/20'
                    }`}
                  >
                    {/* Student Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </div>
                        <div>
                          <Link to={`/students/${st.id}`} className="font-bold text-slate-800 text-sm hover:text-[#0050cb]">
                            {st.fullName}
                          </Link>
                          <span className="text-[11px] text-slate-400 block">{st.phoneNumber}</span>
                        </div>
                      </div>

                      {st.parentPhone && (
                        <span className="text-[11px] text-slate-400 font-medium">
                          Ota-ona: {st.parentPhone}
                        </span>
                      )}
                    </div>

                    {/* 4 Status Segment Buttons */}
                    <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(st.id, 1)}
                        className={`py-2 px-0.5 text-center rounded-xl text-[10px] sm:text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                          currentStatus === 1
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-700/60'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="truncate max-w-full">Qatnashdi</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(st.id, 2)}
                        className={`py-2 px-0.5 text-center rounded-xl text-[10px] sm:text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                          currentStatus === 2
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-700/60'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span className="truncate max-w-full">Kelmadi</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(st.id, 3)}
                        className={`py-2 px-0.5 text-center rounded-xl text-[10px] sm:text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                          currentStatus === 3
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-700/60'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span className="truncate max-w-full">Kechikdi</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(st.id, 4)}
                        className={`py-2 px-0.5 text-center rounded-xl text-[10px] sm:text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                          currentStatus === 4
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-700/60'
                        }`}
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span className="truncate max-w-full">Sababli</span>
                      </button>
                    </div>

                    {/* Optional Comment Input */}
                    <input
                      type="text"
                      value={currentComment}
                      onChange={(e) => handleCommentChange(st.id, e.target.value)}
                      placeholder="Izoh qoldirish (masalan: 10 daqiqa kechikdi, kasal bo'lgan)..."
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0050cb]"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Sticky Bottom Save Bar for Mobile */}
          <div className="sticky bottom-4 z-20 flex justify-end">
            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="w-full sm:w-auto px-8 py-3 bg-[#0050cb] hover:bg-[#003fa4] active:scale-[0.99] text-white text-sm font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saqlanmoqda...' : 'Davomatni Saqlash'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const LessonsPage: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    lessonApi.getAll({ pageSize: 50 }).then((res) => {
      setLessons(res.items);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <StartupBanner
        badgeText="Akademik Dars Jadvali 📅"
        title="Darslar Jadvali Markazi"
        description="Rejalashtirilgan, bugungi va o‘tilgan barcha darslar, xonalar va o‘qituvchilar monitoringi."
        icon={<Calendar className="w-6 h-6" />}
        gradientTheme="emerald"
        metrics={[
          { label: 'Rejalashtirilgan darslar', value: `${lessons.length} ta` },
          { label: 'Xonalar taqsimoti', value: 'Faol' },
        ]}
        actions={
          <Link
            to="/attendance"
            className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold rounded-2xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
          >
            <UserCheck className="w-4 h-4" />
            <span>Davomat belgilash</span>
          </Link>
        }
      />

      {loading ? (
        <LoadingSpinner text="Darslar jadvali yuklanmoqda..." />
      ) : lessons.length === 0 ? (
        <StartupEmptyState
          title="Darslar jadvali hali mavjud emas"
          subtitle="Guruhlarga dars jadvallarini biriktiring yoki davomat sahifasiga o‘ting."
          onCreateClick={() => window.location.href = '/groups'}
          createButtonText="Guruhlar jadvalini sozlash"
          type="groups"
        />
      ) : (
        <div className="bg-white/90 dark:bg-slate-900/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Guruh va Fan</th>
                  <th className="py-3.5 px-6">Mavzu</th>
                  <th className="py-3.5 px-6">O'qituvchi</th>
                  <th className="py-3.5 px-6">Sana va Vaqt</th>
                  <th className="py-3.5 px-6 text-center">Davomat</th>
                  <th className="py-3.5 px-6 text-center">Holat</th>
                  <th className="py-3.5 px-6 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {lessons.map((lesson) => (
                  <tr key={lesson.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <strong className="text-slate-800 block font-bold">{lesson.groupName}</strong>
                      <span className="text-[11px] text-slate-400">{lesson.subjectName}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-slate-700 font-semibold">{lesson.topic}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-600">{lesson.teacherName || '—'}</td>
                    <td className="py-4 px-6">
                      <span className="text-slate-800 font-bold block">
                        {new Date(lesson.startTime).toLocaleDateString()}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(lesson.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {new Date(lesson.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-emerald-600 font-bold">{lesson.presentCount}</span> /{' '}
                      <span className="text-slate-600">{lesson.totalStudents}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Badge variant={lesson.status === 2 ? 'success' : 'warning'}>
                        {lesson.status === 2 ? 'Tugallangan' : 'Rejalashtirilgan'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/attendance/${lesson.id}`}
                        className="px-3 py-1.5 bg-blue-50 text-[#0050cb] hover:bg-blue-100 font-bold rounded-lg text-xs transition-colors"
                      >
                        Davomat
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
