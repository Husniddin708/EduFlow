import React, { useEffect, useState } from 'react';
import { settingsApi, telegramApi, financeApi } from '../../services/api';
import { Organization, Subscription, SubscriptionPlan, FinanceSetting } from '../../types';
import { LoadingSpinner, Badge, Modal } from '../../components/common/UIComponents';
import { StartupBanner } from '../../components/common/StartupBanner';
import { Building, Send, Shield, User, Check, Sparkles, Sun, Moon, Clock, Palette, Settings, DollarSign, Percent, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'org' | 'telegram' | 'sub' | 'theme' | 'finance'>('org');
  const { themeMode, activeTheme, setThemeMode, toggleTheme, isMorning, isNight } = useTheme();
  const [org, setOrg] = useState<Organization | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [financeSettings, setFinanceSettings] = useState<FinanceSetting | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Org Form
  const [orgForm, setOrgForm] = useState({ name: '', phone: '', email: '', address: '', logoUrl: '' });
  const [financeForm, setFinanceForm] = useState({
    defaultTeacherSharePercentage: 20,
    familyDiscount2ndStudent: 10,
    familyDiscount3rdStudent: 15,
    familyDiscount4thPlusStudent: 20,
    discountConflictRule: 1 as 1 | 2,
    excusedAbsenceRefundEnabled: true,
  });
  const [isSuccess, setIsSuccess] = useState('');

  // Upgrade Modal
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const [orgRes, subRes, plansRes, finRes] = await Promise.all([
          settingsApi.getOrganization(),
          settingsApi.getSubscription(),
          settingsApi.getPlans(),
          financeApi.getSettings().catch(() => ({ success: false, data: null })),
        ]);
        if (orgRes.success) {
          setOrg(orgRes.data);
          setOrgForm({
            name: orgRes.data.name,
            phone: orgRes.data.phone,
            email: orgRes.data.email,
            address: orgRes.data.address,
            logoUrl: orgRes.data.logoUrl || '',
          });
        }
        if (subRes.success) setSubscription(subRes.data);
        setPlans(plansRes);

        if (finRes.success && finRes.data) {
          setFinanceSettings(finRes.data);
          setFinanceForm({
            defaultTeacherSharePercentage: finRes.data.defaultTeacherSharePercentage,
            familyDiscount2ndStudent: finRes.data.familyDiscount2ndStudent,
            familyDiscount3rdStudent: finRes.data.familyDiscount3rdStudent,
            familyDiscount4thPlusStudent: finRes.data.familyDiscount4thPlusStudent,
            discountConflictRule: finRes.data.discountConflictRule,
            excusedAbsenceRefundEnabled: finRes.data.excusedAbsenceRefundEnabled,
          });
        }
      } catch (err) {
        console.error('Settings fetch error', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleUpdateFinance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await financeApi.updateSettings(financeForm);
      if (res.success && res.data) {
        setFinanceSettings(res.data);
        setIsSuccess('Moliyaviy parametrlar va foizlar muvaffaqiyatli saqlandi!');
        setTimeout(() => setIsSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Update finance error', err);
    }
  };

  const handleUpdateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await settingsApi.updateOrganization(orgForm);
      if (res.success) {
        setOrg(res.data);
        setIsSuccess("Tashkilot ma'lumotlari saqlandi!");
        setTimeout(() => setIsSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Update org error', err);
    }
  };

  const handleUpgradePlan = async (planId: string) => {
    try {
      await settingsApi.upgradePlan(planId);
      setIsUpgradeOpen(false);
      const subRes = await settingsApi.getSubscription();
      if (subRes.success) setSubscription(subRes.data);
    } catch (err) {
      console.error('Upgrade error', err);
    }
  };

  if (loading) return <LoadingSpinner text="Sozlamalar yuklanmoqda..." />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      <StartupBanner
        badgeText="Markaz Boshqaruvi ⚙️"
        title="O‘quv Markazi Sozlamalari"
        description="O‘quv markazingiz rekvizitlari, aloqa ma’lumotlari, Telegram bot avtomatizatsiyasi va interfeys mavzulari."
        icon={<Settings className="w-6 h-6" />}
        gradientTheme="blue"
        metrics={[
          { label: 'Markaz', value: org?.name || 'EduFlow' },
          { label: 'Telegram Bot', value: 'Faol' },
        ]}
      />

      {/* Settings Navigation Tabs */}
      <div className="flex bg-white/90 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs max-w-md gap-1 overflow-x-auto backdrop-blur-md">
        {[
          { id: 'org', label: 'O‘quv Markazi', icon: Building },
          { id: 'finance', label: 'Moliya & Foizlar', icon: DollarSign },
          { id: 'telegram', label: 'Telegram Bot', icon: Send },
          { id: 'theme', label: 'Mavzu (Theme)', icon: Palette },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeSection === tab.id
                  ? 'bg-gradient-to-r from-[#0050cb] to-[#0066ff] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Organization Section */}
      {activeSection === 'org' && org && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-800">Tashkilot rekvizitlari</h3>
            <p className="text-xs text-slate-500 mt-0.5">O'quv markazingizning asosiy ma'lumotlari</p>
          </div>

          {isSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
              {isSuccess}
            </div>
          )}

          <form onSubmit={handleUpdateOrg} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">O'quv markazi nomi *</label>
                <input
                  type="text"
                  required
                  value={orgForm.name}
                  onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Telefon raqami *</label>
                <input
                  type="text"
                  required
                  value={orgForm.phone}
                  onChange={(e) => setOrgForm({ ...orgForm, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={orgForm.email}
                  onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Logotip URL</label>
                <input
                  type="url"
                  value={orgForm.logoUrl}
                  onChange={(e) => setOrgForm({ ...orgForm, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Manzil</label>
              <input
                type="text"
                value={orgForm.address}
                onChange={(e) => setOrgForm({ ...orgForm, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0050cb] hover:bg-[#003fa4] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
              >
                Saqlash
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Finance Settings Section */}
      {activeSection === 'finance' && (
        <div className="bg-white/90 dark:bg-slate-900/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xs space-y-6 backdrop-blur-md">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Moliyaviy Hisob-Kitob Qoidalari & Foizlar</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                O‘qituvchi ulushlari, oilaviy chegirma shkalasi va markazning moliyaviy siyosati
              </p>
            </div>
          </div>

          <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/60 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed font-medium">
              <strong>Tarixiy himoya kafolati:</strong> Bu yerdagi kurs narxlari, chegirma yoki o‘qituvchi foizlarini istalgan vaqt o‘zgartirishingiz mumkin. O‘zgarishlar faqat keyingi yangi to‘lovlarga ta’sir qiladi — o‘tmishdagi to‘lovlar va hisobotlar 100% o‘zgarishsiz saqlanadi.
            </p>
          </div>

          <form onSubmit={handleUpdateFinance} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Teacher Share */}
              <div className="p-5 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-purple-600" />
                  O‘qituvchining Standart Ulushi
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  O‘quvchilar to‘lagan haqiqiy summadan o‘qituvchiga ajratiladigan standart foiz. Har bir o‘qituvchiga alohida maxsus foiz belgilash ham mumkin.
                </p>
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      required
                      min={0}
                      max={100}
                      value={financeForm.defaultTeacherSharePercentage}
                      onChange={(e) => setFinanceForm({ ...financeForm, defaultTeacherSharePercentage: Number(e.target.value) })}
                      className="w-24 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-extrabold text-slate-800 dark:text-white"
                    />
                    <span className="text-xs font-bold text-slate-500">% ulush</span>
                  </div>
                </div>
              </div>

              {/* Conflict Rule */}
              <div className="p-5 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Chegirmalar To‘qnashuvi Qoidasi
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  O‘quvchida ham oilaviy chegirma (masalan 15%), ham shaxsiy chegirma (masalan 20%) bo‘lsa, qaysi qoida asosida hisoblansin?
                </p>
                <select
                  value={financeForm.discountConflictRule}
                  onChange={(e) => setFinanceForm({ ...financeForm, discountConflictRule: Number(e.target.value) as 1 | 2 })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white"
                >
                  <option value={1}>Eng katta chegirma qo‘llansin (Tavsiya etiladi)</option>
                  <option value={2}>Individual maxsus chegirma har doim ustuvor</option>
                </select>
              </div>
            </div>

            {/* Family Discount Tiers */}
            <div className="p-5 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-white block">
                  👨‍👩‍👧‍👦 Oilaviy Chegirma Shkalasi (Bir oiladan kelgan farzandlar uchun)
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Bitta ota-onaga biriktirilgan 2-farzand, 3-farzand va keyingi farzandlarga avtomatik beriladigan chegirma foizi:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">2-farzand uchun:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={financeForm.familyDiscount2ndStudent}
                      onChange={(e) => setFinanceForm({ ...financeForm, familyDiscount2ndStudent: Number(e.target.value) })}
                      className="w-20 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-800 dark:text-white"
                    />
                    <span className="text-xs font-bold text-slate-500">%</span>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">3-farzand uchun:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={financeForm.familyDiscount3rdStudent}
                      onChange={(e) => setFinanceForm({ ...financeForm, familyDiscount3rdStudent: Number(e.target.value) })}
                      className="w-20 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-800 dark:text-white"
                    />
                    <span className="text-xs font-bold text-slate-500">%</span>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">4+ farzandlar uchun:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={financeForm.familyDiscount4thPlusStudent}
                      onChange={(e) => setFinanceForm({ ...financeForm, familyDiscount4thPlusStudent: Number(e.target.value) })}
                      className="w-20 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-800 dark:text-white"
                    />
                    <span className="text-xs font-bold text-slate-500">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Excused Absences Policy */}
            <div className="p-5 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-white block">
                  Sababli Qoldirilgan Darslar Kompensatsiyasi
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-lg leading-relaxed">
                  O‘quvchi yoki o‘qituvchi sababli darsga kela olmasa, kelmagan darslar keyingi oylik to‘lovga avtomatik chegirilsinmi?
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={financeForm.excusedAbsenceRefundEnabled}
                  onChange={(e) => setFinanceForm({ ...financeForm, excusedAbsenceRefundEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Moliyaviy Sozlamalarni Saqlash
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Telegram Bot Section */}
      {activeSection === 'telegram' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0088cc]/10 text-[#0088cc] flex items-center justify-center">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Telegram Xabarnomalar Boti</h3>
              <p className="text-xs text-slate-500">Ota-onalar va o'quvchilar bilan avtomatlashtirilgan muloqot</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2">
            <h4 className="font-bold text-slate-800">Qanday ishlaydi?</h4>
            <p className="text-slate-600 leading-relaxed">
              O'quvchi darsga kelmaganda yoki kechikib kelganda, baho qo'yilganda yoki to'lov muddati yaqinlashganda
              tizim avtomatik ravishda ota-onaga Telegram bot orqali bildirishnoma yuboradi.
            </p>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-semibold flex items-center gap-2 mt-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>EduFlow Telegram Notification Service faol holatda.</span>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Section */}
      {activeSection === 'sub' && subscription && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase">Joriy Tarif Rejangiz</span>
                <div className="flex items-center gap-3 mt-1">
                  <h3 className="text-2xl font-black text-slate-800">{subscription.planName} Tarif</h3>
                  <Badge variant={subscription.status === 2 ? 'success' : 'warning'}>
                    {subscription.status === 1 ? 'Sinov muddati' : 'Faol'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Amal qilish muddati: {new Date(subscription.endDate).toLocaleDateString()} gacha
                </p>
              </div>

              <button
                onClick={() => setIsUpgradeOpen(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-[#0050cb] to-[#0066ff] hover:from-[#003fa4] hover:to-[#0050cb] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Tarifni yangilash</span>
              </button>
            </div>

            {/* Limits Progress */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs font-semibold text-slate-500">O'quvchilar limiti</span>
                <div className="text-xl font-black text-slate-800 mt-1">
                  {subscription.currentStudentsCount} / {subscription.plan.maxStudents >= 1000 ? 'Cheksiz' : subscription.plan.maxStudents}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs font-semibold text-slate-500">Guruhlar limiti</span>
                <div className="text-xl font-black text-slate-800 mt-1">
                  {subscription.currentGroupsCount} / {subscription.plan.maxGroups >= 500 ? 'Cheksiz' : subscription.plan.maxGroups}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs font-semibold text-slate-500">O'qituvchilar limiti</span>
                <div className="text-xl font-black text-slate-800 mt-1">
                  {subscription.currentTeachersCount} / {subscription.plan.maxTeachers >= 100 ? 'Cheksiz' : subscription.plan.maxTeachers}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Theme Customization Section */}
      {activeSection === 'theme' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-[#0050cb]" />
                  <span>Interfeys Mavzusi va Ko‘z Himoyasi</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Kunning vaqtiga qarab ko‘zingizni asraydigan, charchatmaydigan va jozibador dizayn
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Faol rejim:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    isNight
                      ? 'bg-indigo-950/60 text-indigo-300 border-indigo-800'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {isMorning ? '🌅 Ertalabki rejim (Tong)' : '🌙 Kechki rejim (Tun)'}
                </span>
              </div>
            </div>

            {/* Theme Selector Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
              {/* Morning Card */}
              <div
                onClick={() => setThemeMode('morning')}
                className={`relative rounded-2xl p-5 border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between overflow-hidden group ${
                  themeMode === 'morning'
                    ? 'border-amber-400 bg-gradient-to-b from-amber-50/70 to-white shadow-md'
                    : 'border-slate-200 hover:border-amber-300 bg-white hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-400 text-white flex items-center justify-center shadow-xs">
                      <Sun className="w-5 h-5" />
                    </div>
                    {themeMode === 'morning' && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-300/60">
                        <Check className="w-3 h-3" /> Tanlangan
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-800">
                    🌅 Tong / Ertalabki tema
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Tiniq, quyoshli va yangi kun nafasi ufurib turgan yengil dizayn. Kun bo‘yi samarali ishlash va ma'lumotlarni oson o‘qish uchun moslashtirilgan.
                  </p>
                </div>

                {/* Visual Mini Mockup */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="bg-slate-100/80 p-2.5 rounded-xl space-y-1.5">
                    <div className="h-2 w-16 bg-amber-400/80 rounded-full"></div>
                    <div className="h-2 w-24 bg-slate-300 rounded-full"></div>
                    <div className="flex gap-1.5 pt-1">
                      <div className="h-3 w-8 bg-blue-500/80 rounded"></div>
                      <div className="h-3 w-8 bg-emerald-500/80 rounded"></div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setThemeMode('morning');
                    }}
                    className={`w-full mt-3 py-2 text-xs font-bold rounded-xl transition-all ${
                      themeMode === 'morning'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {themeMode === 'morning' ? 'Faol rejim' : 'Tong rejimini yoqish'}
                  </button>
                </div>
              </div>

              {/* Night Card */}
              <div
                onClick={() => setThemeMode('night')}
                className={`relative rounded-2xl p-5 border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between overflow-hidden group ${
                  themeMode === 'night'
                    ? 'border-indigo-500 bg-gradient-to-b from-slate-900 to-slate-950 text-white shadow-lg shadow-indigo-950/30'
                    : 'border-slate-200 hover:border-indigo-400 bg-white hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-xs">
                      <Moon className="w-5 h-5" />
                    </div>
                    {themeMode === 'night' && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-700">
                        <Check className="w-3 h-3" /> Tanlangan
                      </span>
                    )}
                  </div>

                  <h3 className={`font-extrabold text-sm ${themeMode === 'night' ? 'text-white' : 'text-slate-800'}`}>
                    🌙 Tun / Kechki tema (Eye-Care)
                  </h3>
                  <p className={`text-xs mt-1.5 leading-relaxed ${themeMode === 'night' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Kechasi va qorong‘u xonalarda ko‘zni og‘ritmaydigan, zararli ko‘k nurni (blue-light) minimal darajaga tushiruvchi chuqur sokin dizayn.
                  </p>
                </div>

                {/* Visual Mini Mockup */}
                <div className="mt-6 pt-4 border-t border-slate-100/20">
                  <div className="bg-slate-800/80 p-2.5 rounded-xl space-y-1.5 border border-slate-700">
                    <div className="h-2 w-16 bg-indigo-400 rounded-full"></div>
                    <div className="h-2 w-24 bg-slate-600 rounded-full"></div>
                    <div className="flex gap-1.5 pt-1">
                      <div className="h-3 w-8 bg-cyan-500/80 rounded"></div>
                      <div className="h-3 w-8 bg-purple-500/80 rounded"></div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setThemeMode('night');
                    }}
                    className={`w-full mt-3 py-2 text-xs font-bold rounded-xl transition-all ${
                      themeMode === 'night'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {themeMode === 'night' ? 'Faol rejim' : 'Tun rejimini yoqish'}
                  </button>
                </div>
              </div>

              {/* Auto Card */}
              <div
                onClick={() => setThemeMode('auto')}
                className={`relative rounded-2xl p-5 border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between overflow-hidden group ${
                  themeMode === 'auto'
                    ? 'border-emerald-500 bg-gradient-to-b from-emerald-50/70 to-white shadow-md'
                    : 'border-slate-200 hover:border-emerald-400 bg-white hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs">
                      <Clock className="w-5 h-5" />
                    </div>
                    {themeMode === 'auto' && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300/60">
                        <Check className="w-3 h-3" /> Tanlangan
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-800">
                    ⚡ Aqlli avtomatik rejim
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Haqiqiy mahalliy vaqtga qarab ishlaydi: kunduzi (06:00 - 19:00) ertalabki rejim, kechqurun (19:00 - 05:59) esa avtomatik tun rejimiga o‘tadi.
                  </p>
                </div>

                {/* Visual Mini Mockup */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-800 text-[11px] font-medium flex items-center justify-between">
                    <span>Joriy vaqt holati:</span>
                    <span className="font-bold">{isMorning ? '☀️ Kunduz' : '🌙 Tun'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setThemeMode('auto');
                    }}
                    className={`w-full mt-3 py-2 text-xs font-bold rounded-xl transition-all ${
                      themeMode === 'auto'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {themeMode === 'auto' ? 'Faol rejim' : 'Avtomatika yoqish'}
                  </button>
                </div>
              </div>
            </div>

            {/* Health & Ergonomics Note */}
            <div className="mt-8 p-4 rounded-2xl bg-blue-50/60 border border-blue-100/80 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#0050cb] shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800 block mb-0.5">
                  Nima uchun bu muhim?
                </span>
                O'qituvchilar va ma'murlar tizimda ko'p vaqt o'tkazishadi. 
                Tonggi yorug'lik kunduzi diqqatni 25% gacha oshirsa, kechki sokin tun rejimi ko'z to'r pardasiga tushadigan yuklamani 60% ga kamaytiradi va qizarishdan himoya qiladi.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      <Modal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} title="Tarif rejasini tanlang" maxWidth="max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                subscription?.subscriptionPlanId === p.id
                  ? 'border-[#0050cb] bg-blue-50/40 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <span className="text-xs font-extrabold text-slate-800 uppercase block">{p.name}</span>
                <div className="text-xl font-black text-[#0050cb] mt-2">
                  {p.monthlyPrice === 0 ? 'Bepul' : `${p.monthlyPrice.toLocaleString()} UZS`}
                  <span className="text-[10px] text-slate-400 font-normal"> /oy</span>
                </div>

                <ul className="space-y-2 text-xs text-slate-600 mt-4">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{p.maxStudents >= 1000 ? 'Cheksiz' : p.maxStudents} o'quvchilar</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{p.maxGroups >= 500 ? 'Cheksiz' : p.maxGroups} guruhlar</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{p.maxTeachers >= 100 ? 'Cheksiz' : p.maxTeachers} o'qituvchilar</span>
                  </li>
                  {p.hasTelegram && (
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Telegram Bot bildirishnomalari</span>
                    </li>
                  )}
                  {p.hasReports && (
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Kengaytirilgan hisobotlar</span>
                    </li>
                  )}
                </ul>
              </div>

              <button
                onClick={() => handleUpgradePlan(p.id)}
                disabled={subscription?.subscriptionPlanId === p.id}
                className={`w-full mt-6 py-2 rounded-xl text-xs font-bold transition-all ${
                  subscription?.subscriptionPlanId === p.id
                    ? 'bg-slate-200 text-slate-500 cursor-default'
                    : 'bg-[#0050cb] hover:bg-[#003fa4] text-white shadow-xs'
                }`}
              >
                {subscription?.subscriptionPlanId === p.id ? 'Joriy Tarif' : 'Ushbu Tarifni Tanlash'}
              </button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};
