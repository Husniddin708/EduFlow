using EduFlow.Domain.Enums;

namespace EduFlow.Application.DTOs;

#region Auth DTOs
public record RegisterDto(
    string OrganizationName,
    string FirstName,
    string LastName,
    string Email,
    string Password,
    string PhoneNumber,
    string? Address
);

public record LoginDto(
    string Email,
    string Password
);

public record AuthResponseDto(
    string Token,
    string RefreshToken,
    UserDto User,
    OrganizationDto Organization
);

public record UserDto(
    Guid Id,
    Guid OrganizationId,
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber,
    UserRole Role,
    bool IsActive
);

public record RefreshTokenDto(
    string Token,
    string RefreshToken
);

public record RevokeTokenDto(
    string? RefreshToken
);
#endregion

#region Organization & Subscriptions
public record OrganizationDto(
    Guid Id,
    string Name,
    string Phone,
    string Email,
    string Address,
    string? LogoUrl,
    bool IsActive,
    DateTime CreatedAt
);

public record UpdateOrganizationDto(
    string Name,
    string Phone,
    string Email,
    string Address,
    string? LogoUrl
);

public record SubscriptionPlanDto(
    Guid Id,
    string Name,
    decimal MonthlyPrice,
    int MaxStudents,
    int MaxTeachers,
    int MaxGroups,
    bool HasTelegram,
    bool HasReports,
    bool HasAdvancedAnalytics
);

public record SubscriptionDto(
    Guid Id,
    Guid OrganizationId,
    Guid SubscriptionPlanId,
    string PlanName,
    DateTime StartDate,
    DateTime EndDate,
    SubscriptionStatus Status,
    bool AutoRenew,
    int CurrentStudentsCount,
    int CurrentTeachersCount,
    int CurrentGroupsCount,
    SubscriptionPlanDto Plan
)
{
    public SubscriptionDto() : this(default, default, default, string.Empty, default, default, default, false, 0, 0, 0, null!) { }
}
#endregion

#region Student DTOs
public record StudentDto(
    Guid Id,
    Guid OrganizationId,
    string FirstName,
    string LastName,
    string FullName,
    string PhoneNumber,
    DateTime? BirthDate,
    DateTime EnrollmentDate,
    Guid? ParentId,
    string? ParentName,
    string? ParentPhone,
    bool IsActive,
    decimal AverageGrade,
    decimal AttendancePercentage,
    PaymentStatus CurrentPaymentStatus,
    List<string> GroupNames
)
{
    public StudentDto() : this(default, default, string.Empty, string.Empty, string.Empty, string.Empty, null, default, null, null, null, true, 0, 0, default, new List<string>()) { }
}

public record CreateStudentDto(
    string FirstName,
    string LastName,
    string PhoneNumber,
    DateTime? BirthDate,
    string? ParentFullName,
    string? ParentPhoneNumber,
    Guid? GroupId
);

public record UpdateStudentDto(
    string FirstName,
    string LastName,
    string PhoneNumber,
    DateTime? BirthDate,
    bool IsActive,
    string? ParentFullName,
    string? ParentPhoneNumber
);

public record StudentDetailDto(
    Guid Id,
    Guid OrganizationId,
    string FirstName,
    string LastName,
    string FullName,
    string PhoneNumber,
    DateTime? BirthDate,
    DateTime EnrollmentDate,
    bool IsActive,
    ParentDto? Parent,
    List<GroupSummaryDto> Groups,
    decimal AverageGrade,
    decimal AttendancePercentage,
    PaymentStatus CurrentPaymentStatus,
    List<AttendanceDto> RecentAttendances,
    List<GradeDto> RecentGrades,
    List<PaymentDto> RecentPayments
);
#endregion

#region Parent DTOs
public record ParentDto(
    Guid Id,
    string FullName,
    string PhoneNumber,
    string? TelegramChatId,
    bool IsTelegramConnected
)
{
    public ParentDto() : this(default, string.Empty, string.Empty, null, false) { }
}

public record CreateParentDto(
    string FullName,
    string PhoneNumber,
    string? TelegramChatId
);
#endregion

#region Teacher DTOs
public record TeacherDto(
    Guid Id,
    Guid OrganizationId,
    Guid? UserId,
    string FullName,
    string PhoneNumber,
    string? Specialization,
    int GroupsCount
)
{
    public TeacherDto() : this(default, default, null, string.Empty, string.Empty, null, 0) { }
}

public record CreateTeacherDto(
    string FullName,
    string PhoneNumber,
    string? Specialization,
    string? Email,
    string? Password
);

public record UpdateTeacherDto(
    string FullName,
    string PhoneNumber,
    string? Specialization
);
#endregion

#region Subject DTOs
public record SubjectDto(
    Guid Id,
    Guid OrganizationId,
    string Name,
    int GroupsCount
)
{
    public SubjectDto() : this(default, default, string.Empty, 0) { }
}

public record CreateSubjectDto(
    string Name
);

public record UpdateSubjectDto(
    string Name
);
#endregion

#region Group DTOs
public record GroupDto(
    Guid Id,
    Guid OrganizationId,
    string Name,
    Guid? TeacherId,
    string? TeacherName,
    Guid? SubjectId,
    string? SubjectName,
    decimal MonthlyFee,
    int MaxStudents,
    int EnrolledStudentsCount,
    string? ScheduleDescription,
    string? Room,
    bool IsActive
)
{
    public GroupDto() : this(default, default, string.Empty, null, null, null, null, 0, 0, 0, null, null, true) { }
}

public record GroupSummaryDto(
    Guid Id,
    string Name,
    string? SubjectName,
    string? TeacherName
)
{
    public GroupSummaryDto() : this(default, string.Empty, null, null) { }
}

public record CreateGroupDto(
    string Name,
    Guid? TeacherId,
    Guid? SubjectId,
    decimal MonthlyFee,
    int MaxStudents,
    string? ScheduleDescription,
    string? Room
);

public record UpdateGroupDto(
    string Name,
    Guid? TeacherId,
    Guid? SubjectId,
    decimal MonthlyFee,
    int MaxStudents,
    string? ScheduleDescription,
    string? Room,
    bool IsActive
);

public record GroupDetailDto(
    Guid Id,
    Guid OrganizationId,
    string Name,
    Guid? TeacherId,
    string? TeacherName,
    Guid? SubjectId,
    string? SubjectName,
    decimal MonthlyFee,
    int MaxStudents,
    string? ScheduleDescription,
    string? Room,
    bool IsActive,
    List<StudentDto> Students,
    List<LessonDto> RecentLessons
);

public record AddStudentToGroupDto(
    Guid StudentId
);
#endregion

#region Lesson DTOs
public record LessonDto(
    Guid Id,
    Guid GroupId,
    string GroupName,
    string? SubjectName,
    string? TeacherName,
    DateTime StartTime,
    DateTime EndTime,
    string Topic,
    LessonStatus Status,
    int TotalStudents,
    int PresentCount,
    int AbsentCount
)
{
    public LessonDto() : this(default, default, string.Empty, null, null, default, default, string.Empty, default, 0, 0, 0) { }
}

public record CreateLessonDto(
    Guid GroupId,
    DateTime StartTime,
    DateTime EndTime,
    string Topic
);

public record UpdateLessonDto(
    DateTime StartTime,
    DateTime EndTime,
    string Topic,
    LessonStatus Status
);
#endregion

#region Attendance DTOs
public record AttendanceDto(
    Guid Id,
    Guid LessonId,
    Guid StudentId,
    string StudentName,
    AttendanceStatus Status,
    string? Comment,
    DateTime LessonDate
)
{
    public AttendanceDto() : this(default, default, default, string.Empty, default, null, default) { }
}

public record CreateAttendanceDto(
    Guid LessonId,
    Guid StudentId,
    AttendanceStatus Status,
    string? Comment
);

public record UpdateAttendanceDto(
    AttendanceStatus Status,
    string? Comment
);

public record BulkAttendanceItemDto(
    Guid StudentId,
    AttendanceStatus Status,
    string? Comment
);

public record BulkAttendanceDto(
    Guid LessonId,
    List<BulkAttendanceItemDto> Items
);
#endregion

#region Grade DTOs
public record GradeDto(
    Guid Id,
    Guid LessonId,
    Guid StudentId,
    string StudentName,
    string? SubjectName,
    decimal Score,
    string? Comment,
    DateTime CreatedAt
);

public record CreateGradeDto(
    Guid LessonId,
    Guid StudentId,
    decimal Score,
    string? Comment
);

public record UpdateGradeDto(
    decimal Score,
    string? Comment
);

public record BulkGradeItemDto(
    Guid StudentId,
    decimal Score,
    string? Comment
);

public record BulkGradeDto(
    Guid LessonId,
    List<BulkGradeItemDto> Items
);
#endregion

#region Payment & Finance DTOs
public record PaymentDto(
    Guid Id,
    Guid StudentId,
    string StudentName,
    string? StudentPhone,
    decimal Amount,
    decimal BasePrice,
    decimal DiscountPercent,
    decimal DiscountAmount,
    decimal FinalAmount,
    decimal PaidAmount,
    decimal DebtAmount,
    decimal TeacherSharePercent,
    decimal TeacherShareAmount,
    decimal CenterShareAmount,
    Guid? GroupId,
    string? GroupName,
    Guid? TeacherId,
    string? TeacherName,
    DateTime? PaymentDate,
    DateTime DueDate,
    PaymentStatus Status,
    string? Description,
    DateTime CreatedAt,
    List<PaymentTransactionDto>? Transactions
)
{
    public PaymentDto() : this(default, default, string.Empty, null, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, null, null, null, null, null, default, default, null, default, new List<PaymentTransactionDto>()) { }
}

public record PaymentTransactionDto(
    Guid Id,
    Guid PaymentId,
    decimal Amount,
    DateTime PaymentDate,
    PaymentMethod Method,
    string? IdempotencyKey,
    string? Notes
);

public record CreatePaymentTransactionDto(
    Guid PaymentId,
    decimal Amount,
    PaymentMethod Method,
    string? IdempotencyKey,
    string? Notes
);

public record CreatePaymentDto(
    Guid StudentId,
    Guid? GroupId,
    Guid? TeacherId,
    decimal? Amount,
    decimal? CustomDiscountPercent,
    DateTime DueDate,
    DateTime? PaymentDate,
    PaymentStatus Status,
    string? Description,
    decimal? InitialPaidAmount,
    PaymentMethod? InitialMethod
);

public record UpdatePaymentDto(
    decimal Amount,
    DateTime? PaymentDate,
    DateTime DueDate,
    PaymentStatus Status,
    string? Description
);

public record UpdatePromiseDateDto(
    DateTime NewDueDate,
    string? Note
);

public record FinanceSettingDto(
    Guid Id,
    Guid OrganizationId,
    decimal DefaultTeacherSharePercentage,
    decimal FamilyDiscount2ndStudent,
    decimal FamilyDiscount3rdStudent,
    decimal FamilyDiscount4thPlusStudent,
    DiscountConflictRule DiscountConflictRule,
    bool ExcusedAbsenceRefundEnabled
);

public record UpdateFinanceSettingDto(
    decimal DefaultTeacherSharePercentage,
    decimal FamilyDiscount2ndStudent,
    decimal FamilyDiscount3rdStudent,
    decimal FamilyDiscount4thPlusStudent,
    DiscountConflictRule DiscountConflictRule,
    bool ExcusedAbsenceRefundEnabled
);

public record StudentDiscountDto(
    Guid Id,
    Guid StudentId,
    string StudentName,
    decimal DiscountPercentage,
    DateTime StartDate,
    DateTime? EndDate,
    string Reason,
    bool IsActive
);

public record CreateStudentDiscountDto(
    Guid StudentId,
    decimal DiscountPercentage,
    DateTime StartDate,
    DateTime? EndDate,
    string Reason
);

public record CenterExpenseDto(
    Guid Id,
    Guid OrganizationId,
    string Category,
    decimal Amount,
    DateTime ExpenseDate,
    string Description
);

public record CreateCenterExpenseDto(
    string Category,
    decimal Amount,
    DateTime ExpenseDate,
    string Description
);

public record PaymentCalculationPreviewDto(
    Guid StudentId,
    string StudentName,
    Guid? GroupId,
    string? GroupName,
    Guid? TeacherId,
    string? TeacherName,
    decimal BasePrice,
    int FamilyStudentOrder,
    decimal FamilyDiscountPercent,
    decimal IndividualDiscountPercent,
    decimal AppliedDiscountPercent,
    string DiscountType,
    decimal DiscountAmount,
    decimal FinalAmount,
    decimal TeacherSharePercent,
    decimal EstimatedTeacherShare,
    decimal EstimatedCenterShare
);

public record TeacherSalaryReportItemDto(
    Guid TeacherId,
    string TeacherName,
    string? PhoneNumber,
    decimal SharePercentage,
    int ActiveGroupsCount,
    int TotalStudentsCount,
    decimal TotalCourseFees,
    decimal TotalCollectedFromStudents,
    decimal TeacherSalaryAmount,
    decimal CenterRetainedAmount
);

public record FinanceSummaryReportDto(
    decimal TotalExpectedRevenue,
    decimal TotalCollectedRevenue,
    decimal TotalDebtAmount,
    decimal TotalTeacherShares,
    decimal CenterGrossMargin,
    decimal TotalCenterExpenses,
    decimal NetProfit,
    List<TeacherSalaryReportItemDto> TeacherSalaries,
    List<CenterExpenseDto> RecentExpenses
);
#endregion

#region Notification & Telegram DTOs
public record NotificationDto(
    Guid Id,
    Guid? StudentId,
    string? StudentName,
    Guid? ParentId,
    string? ParentName,
    string Message,
    NotificationType Type,
    bool IsSent,
    DateTime? SentAt,
    DateTime CreatedAt
);

public record TelegramConnectDto(
    Guid ParentId,
    string ChatId,
    string? Username
);

public record TelegramSendDto(
    Guid ParentId,
    string Message
);

public record TelegramStatusDto(
    bool IsConnected,
    string? ChatId,
    string? Username
);
#endregion

#region Dashboard & Reports DTOs
public record DashboardStatsDto(
    int StudentsCount,
    int TeachersCount,
    int GroupsCount,
    int TodayLessonsCount,
    int PresentToday,
    int AbsentToday,
    int LateToday,
    int PendingPaymentsCount,
    int OverduePaymentsCount,
    decimal MonthlyRevenue,
    decimal AttendanceRate,
    List<LessonDto> TodayLessons,
    List<PaymentDto> RecentPayments,
    List<PaymentDto> OverduePayments,
    List<MonthlyRevenueItemDto> MonthlyRevenueChart,
    List<StudentGrowthItemDto> StudentGrowthChart
);

public record MonthlyRevenueItemDto(
    string Month,
    decimal Amount
);

public record StudentGrowthItemDto(
    string Month,
    int Count
);

public record AttendanceReportDto(
    int TotalLessons,
    int TotalPresent,
    int TotalAbsent,
    int TotalLate,
    int TotalExcused,
    decimal AttendancePercentage,
    List<GroupAttendanceSummaryDto> GroupSummaries
);

public record GroupAttendanceSummaryDto(
    Guid GroupId,
    string GroupName,
    int TotalRecords,
    int PresentCount,
    decimal Percentage
);

public record PaymentReportDto(
    decimal TotalPaid,
    decimal TotalPending,
    decimal TotalOverdue,
    int PaidTransactionsCount,
    int PendingTransactionsCount,
    int OverdueTransactionsCount,
    List<MonthlyRevenueItemDto> MonthlyTrend
);

public record StudentReportDto(
    int TotalStudents,
    int ActiveStudents,
    int InactiveStudents,
    decimal AverageOverallGrade,
    decimal AverageOverallAttendance,
    List<StudentDto> Students
);
#endregion

#region SuperAdmin DTOs
public record SuperAdminStatsDto(
    int TotalOrganizations,
    int ActiveOrganizations,
    int TrialOrganizations,
    int TotalStudents,
    decimal TotalMonthlyRevenue,
    List<OrganizationSummaryDto> RecentOrganizations
);

public record OrganizationSummaryDto(
    Guid Id,
    string Name,
    string Email,
    string Phone,
    bool IsActive,
    string PlanName,
    SubscriptionStatus SubscriptionStatus,
    DateTime CreatedAt
);
#endregion
