import React, { useEffect, useState } from 'react';
import { lessonApi, groupApi, gradeApi } from '../../services/api';
import { Lesson, Student, Grade } from '../../types';
import { Badge, LoadingSpinner, EmptyState } from '../../components/common/UIComponents';
import { StartupBanner } from '../../components/common/StartupBanner';
import { StartupEmptyState } from '../../components/common/StartupEmptyState';
import { Award, Save, CheckCircle2 } from 'lucide-react';

export const GradesPage: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [gradeMap, setGradeMap] = useState<Record<string, { score: number; comment?: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    lessonApi.getAll({ pageSize: 50 }).then((res) => {
      setLessons(res.items);
      if (res.items.length > 0) setSelectedLessonId(res.items[0].id);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedLessonId) return;
    const loadLessonGrades = async () => {
      setLoading(true);
      setSuccessMessage('');
      try {
        const lRes = await lessonApi.getById(selectedLessonId);
        if (lRes.success) {
          const gStudents = await groupApi.getStudents(lRes.data.groupId);
          setStudents(gStudents);

          const existingGrades = await gradeApi.getByLesson(selectedLessonId);
          const map: Record<string, { score: number; comment?: string }> = {};

          gStudents.forEach((st) => {
            const found = existingGrades.find((g) => g.studentId === st.id);
            map[st.id] = {
              score: found ? found.score : 85,
              comment: found?.comment || '',
            };
          });

          setGradeMap(map);
        }
      } catch (err) {
        console.error('Error loading lesson grades', err);
      } finally {
        setLoading(false);
      }
    };

    loadLessonGrades();
  }, [selectedLessonId]);

  const handleScoreChange = (studentId: string, score: number) => {
    setGradeMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], score },
    }));
  };

  const handleCommentChange = (studentId: string, comment: string) => {
    setGradeMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], comment },
    }));
  };

  const handleSaveGrades = async () => {
    if (!selectedLessonId) return;
    setSaving(true);
    setSuccessMessage('');

    try {
      const items = Object.entries(gradeMap).map(([studentId, data]) => ({
        studentId,
        score: Number(data.score),
        comment: data.comment,
      }));

      await gradeApi.saveBulk({
        lessonId: selectedLessonId,
        items,
      });

      setSuccessMessage("Baholar saqlandi! Ota-onalar Telegram orqali xabardor qilindi.");
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Save grades error', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      <StartupBanner
        badgeText="Baholar va Reyting 🏆"
        title="Baholar Jurnali Markazi"
        description="O‘quvchilarning darslardagi o‘zlashtirish ko‘rsatkichlari, ballar, test natijalari va ota-onalarga avtomatik yuboriluvchi baholar."
        icon={<Award className="w-6 h-6" />}
        gradientTheme="amber"
        metrics={[
          { label: 'Baholangan darslar', value: `${lessons.length} ta` },
          { label: 'Telegram integratsiya', value: 'Faol' },
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
        <LoadingSpinner text="Baholar yuklanmoqda..." />
      ) : (
        <div className="space-y-4">
          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">O'quvchilar ro'yxati ({students.length})</span>
              <button
                onClick={handleSaveGrades}
                disabled={saving}
                className="px-4 py-2 bg-[#0050cb] hover:bg-[#003fa4] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saqlanmoqda...' : 'Baholarni Saqlash'}</span>
              </button>
            </div>

            {students.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">Guruhda o'quvchilar mavjud emas.</div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {students.map((st, idx) => (
                  <div key={st.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/40">
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-slate-400 font-semibold">{idx + 1}.</span>
                      <strong className="text-slate-800 text-sm">{st.fullName}</strong>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-medium">Ball:</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={gradeMap[st.id]?.score ?? 85}
                          onChange={(e) => handleScoreChange(st.id, Number(e.target.value))}
                          className="w-20 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-black text-sm text-[#0050cb] focus:bg-white"
                        />
                      </div>

                      <input
                        type="text"
                        value={gradeMap[st.id]?.comment ?? ''}
                        onChange={(e) => handleCommentChange(st.id, e.target.value)}
                        placeholder="Izoh (masalan: Test 100%)..."
                        className="flex-1 sm:w-64 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
