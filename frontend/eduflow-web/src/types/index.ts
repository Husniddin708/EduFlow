export type UserRole = 1 | 2 | 3; // 1: SuperAdmin, 2: CenterAdmin, 3: Teacher
export type AttendanceStatus = 1 | 2 | 3 | 4; // 1: Present, 2: Absent, 3: Late, 4: Excused
export type PaymentStatus = 1 | 2 | 3 | 4 | 5; // 1: Pending, 2: Paid, 3: Overdue, 4: Cancelled, 5: Partial
export type PaymentMethod = 1 | 2 | 3 | 4; // 1: Cash, 2: Payme, 3: Click, 4: BankTransfer
export type LessonStatus = 1 | 2 | 3; // 1: Scheduled, 2: Completed, 3: Cancelled
export type SubscriptionStatus = 1 | 2 | 3 | 4; // 1: Trial, 2: Active, 3: Expired, 4: Cancelled

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface User {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  isActive: boolean;
}

export interface Organization {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
  organization: Organization;
}

export interface Student {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber: string;
  birthDate?: string;
  enrollmentDate: string;
  parentId?: string;
  parentName?: string;
  parentPhone?: string;
  isActive: boolean;
  averageGrade: number;
  attendancePercentage: number;
  currentPaymentStatus: PaymentStatus;
  groupNames: string[];
}

export interface StudentDetail extends Student {
  parent?: {
    id: string;
    fullName: string;
    phoneNumber: string;
    telegramChatId?: string;
    isTelegramConnected: boolean;
  };
  groups: {
    id: string;
    name: string;
    subjectName?: string;
    teacherName?: string;
  }[];
  recentAttendances: Attendance[];
  recentGrades: Grade[];
  recentPayments: Payment[];
}

export interface Teacher {
  id: string;
  organizationId: string;
  userId?: string;
  fullName: string;
  phoneNumber: string;
  specialization?: string;
  groupsCount: number;
}

export interface Subject {
  id: string;
  organizationId: string;
  name: string;
  groupsCount: number;
}

export interface Group {
  id: string;
  organizationId: string;
  name: string;
  teacherId?: string;
  teacherName?: string;
  subjectId?: string;
  subjectName?: string;
  monthlyFee: number;
  maxStudents: number;
  enrolledStudentsCount: number;
  scheduleDescription?: string;
  room?: string;
  isActive: boolean;
}

export interface GroupDetail extends Group {
  students: Student[];
  recentLessons: Lesson[];
}

export interface Lesson {
  id: string;
  groupId: string;
  groupName: string;
  subjectName?: string;
  teacherName?: string;
  startTime: string;
  endTime: string;
  topic: string;
  status: LessonStatus;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
}

export interface Attendance {
  id: string;
  lessonId: string;
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  comment?: string;
  lessonDate: string;
}

export interface Grade {
  id: string;
  lessonId: string;
  studentId: string;
  studentName: string;
  subjectName?: string;
  score: number;
  comment?: string;
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  paymentId: string;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  idempotencyKey?: string;
  notes?: string;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone?: string;
  amount: number;
  basePrice?: number;
  discountPercent?: number;
  discountAmount?: number;
  finalAmount?: number;
  paidAmount?: number;
  debtAmount?: number;
  teacherSharePercent?: number;
  teacherShareAmount?: number;
  centerShareAmount?: number;
  groupId?: string;
  groupName?: string;
  teacherId?: string;
  teacherName?: string;
  paymentDate?: string;
  dueDate: string;
  status: PaymentStatus;
  description?: string;
  createdAt: string;
  transactions?: PaymentTransaction[];
}

export interface FinanceSetting {
  id: string;
  organizationId: string;
  defaultTeacherSharePercentage: number;
  familyDiscount2ndStudent: number;
  familyDiscount3rdStudent: number;
  familyDiscount4thPlusStudent: number;
  discountConflictRule: 1 | 2;
  excusedAbsenceRefundEnabled: boolean;
}

export interface StudentDiscount {
  id: string;
  studentId: string;
  studentName: string;
  discountPercentage: number;
  startDate: string;
  endDate?: string;
  reason: string;
  isActive: boolean;
}

export interface CenterExpense {
  id: string;
  organizationId: string;
  category: string;
  amount: number;
  expenseDate: string;
  description: string;
}

export interface PaymentCalculationPreview {
  studentId: string;
  studentName: string;
  groupId?: string;
  groupName?: string;
  teacherId?: string;
  teacherName?: string;
  basePrice: number;
  familyStudentOrder: number;
  familyDiscountPercent: number;
  individualDiscountPercent: number;
  appliedDiscountPercent: number;
  discountType: string;
  discountAmount: number;
  finalAmount: number;
  teacherSharePercent: number;
  estimatedTeacherShare: number;
  estimatedCenterShare: number;
}

export interface TeacherSalaryReportItem {
  teacherId: string;
  teacherName: string;
  phoneNumber?: string;
  sharePercentage: number;
  activeGroupsCount: number;
  totalStudentsCount: number;
  totalCourseFees: number;
  totalCollectedFromStudents: number;
  teacherSalaryAmount: number;
  centerRetainedAmount: number;
}

export interface FinanceSummaryReport {
  totalExpectedRevenue: number;
  totalCollectedRevenue: number;
  totalDebtAmount: number;
  totalTeacherShares: number;
  centerGrossMargin: number;
  totalCenterExpenses: number;
  netProfit: number;
  teacherSalaries: TeacherSalaryReportItem[];
  recentExpenses: CenterExpense[];
}

export interface DashboardStats {
  studentsCount: number;
  teachersCount: number;
  groupsCount: number;
  todayLessonsCount: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  pendingPaymentsCount: number;
  overduePaymentsCount: number;
  monthlyRevenue: number;
  attendanceRate: number;
  todayLessons: Lesson[];
  recentPayments: Payment[];
  overduePayments: Payment[];
  monthlyRevenueChart: { month: string; amount: number }[];
  studentGrowthChart: { month: string; count: number }[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  maxStudents: number;
  maxTeachers: number;
  maxGroups: number;
  hasTelegram: boolean;
  hasReports: boolean;
  hasAdvancedAnalytics: boolean;
}

export interface Subscription {
  id: string;
  organizationId: string;
  subscriptionPlanId: string;
  planName: string;
  startDate: string;
  endDate: string;
  status: SubscriptionStatus;
  autoRenew: boolean;
  currentStudentsCount: number;
  currentTeachersCount: number;
  currentGroupsCount: number;
  plan: SubscriptionPlan;
}

export interface AttendanceReport {
  totalLessons: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalExcused: number;
  attendancePercentage: number;
  groupSummaries: {
    groupId: string;
    groupName: string;
    totalRecords: number;
    presentCount: number;
    percentage: number;
  }[];
}

export interface PaymentReport {
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  paidTransactionsCount: number;
  pendingTransactionsCount: number;
  overdueTransactionsCount: number;
  monthlyTrend: { month: string; amount: number }[];
}

export interface StudentReport {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  averageOverallGrade: number;
  averageOverallAttendance: number;
  students: Student[];
}

export interface SuperAdminStats {
  totalOrganizations: number;
  activeOrganizations: number;
  trialOrganizations: number;
  totalStudents: number;
  totalMonthlyRevenue: number;
  recentOrganizations: {
    id: string;
    name: string;
    email: string;
    phone: string;
    isActive: boolean;
    planName: string;
    subscriptionStatus: SubscriptionStatus;
    createdAt: string;
  }[];
}
