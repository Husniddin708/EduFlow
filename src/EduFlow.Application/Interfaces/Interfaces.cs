using EduFlow.Application.Common.Models;
using EduFlow.Application.DTOs;
using EduFlow.Domain.Entities;
using EduFlow.Domain.Enums;

namespace EduFlow.Application.Interfaces;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    Guid? OrganizationId { get; }
    UserRole? Role { get; }
    string? Email { get; }
    bool IsAuthenticated { get; }
}

public interface ITenantService
{
    Guid? CurrentOrganizationId { get; }
    void SetTenant(Guid organizationId);
}

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
    string GenerateRefreshToken();
    System.Security.Claims.ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}

public interface ITelegramService
{
    Task<bool> SendMessageAsync(string chatId, string message);
    Task<bool> SendStudentAttendanceAlertAsync(Guid studentId, string lessonTopic, AttendanceStatus status);
    Task<bool> SendPaymentReminderAsync(Guid paymentId);
    Task<bool> SendGradeAlertAsync(Guid gradeId);
}

public interface INotificationService
{
    Task CreateNotificationAsync(Guid? studentId, Guid? parentId, string message, NotificationType type);
    Task<PagedResult<NotificationDto>> GetNotificationsAsync(int page = 1, int pageSize = 20);
}

public interface IAuthService
{
    Task<ApiResponse<AuthResponseDto>> RegisterAsync(RegisterDto dto);
    Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginDto dto);
    Task<ApiResponse<UserDto>> GetCurrentUserProfileAsync();
    Task<ApiResponse<AuthResponseDto>> RefreshTokenAsync(RefreshTokenDto dto);
    Task<ApiResponse<bool>> RevokeTokenAsync(RevokeTokenDto dto);
    Task<ApiResponse<bool>> LogoutAsync();
}

public interface IStudentService
{
    Task<PagedResult<StudentDto>> GetStudentsAsync(string? search, Guid? groupId, bool? isActive, int page = 1, int pageSize = 10);
    Task<ApiResponse<StudentDetailDto>> GetStudentByIdAsync(Guid id);
    Task<ApiResponse<StudentDto>> CreateStudentAsync(CreateStudentDto dto);
    Task<ApiResponse<StudentDto>> UpdateStudentAsync(Guid id, UpdateStudentDto dto);
    Task<ApiResponse<bool>> DeleteStudentAsync(Guid id);
}

public interface ITeacherService
{
    Task<PagedResult<TeacherDto>> GetTeachersAsync(string? search, int page = 1, int pageSize = 20);
    Task<ApiResponse<TeacherDto>> GetTeacherByIdAsync(Guid id);
    Task<ApiResponse<TeacherDto>> CreateTeacherAsync(CreateTeacherDto dto);
    Task<ApiResponse<TeacherDto>> UpdateTeacherAsync(Guid id, UpdateTeacherDto dto);
    Task<ApiResponse<bool>> DeleteTeacherAsync(Guid id);
}

public interface IGroupService
{
    Task<PagedResult<GroupDto>> GetGroupsAsync(string? search, Guid? subjectId, bool? isActive, int page = 1, int pageSize = 20);
    Task<ApiResponse<GroupDetailDto>> GetGroupByIdAsync(Guid id);
    Task<ApiResponse<GroupDto>> CreateGroupAsync(CreateGroupDto dto);
    Task<ApiResponse<GroupDto>> UpdateGroupAsync(Guid id, UpdateGroupDto dto);
    Task<ApiResponse<bool>> DeleteGroupAsync(Guid id);
    Task<ApiResponse<bool>> AddStudentToGroupAsync(Guid groupId, Guid studentId);
    Task<ApiResponse<bool>> RemoveStudentFromGroupAsync(Guid groupId, Guid studentId);
    Task<List<StudentDto>> GetGroupStudentsAsync(Guid groupId);
}

public interface ISubjectService
{
    Task<List<SubjectDto>> GetSubjectsAsync();
    Task<ApiResponse<SubjectDto>> GetSubjectByIdAsync(Guid id);
    Task<ApiResponse<SubjectDto>> CreateSubjectAsync(CreateSubjectDto dto);
    Task<ApiResponse<SubjectDto>> UpdateSubjectAsync(Guid id, UpdateSubjectDto dto);
    Task<ApiResponse<bool>> DeleteSubjectAsync(Guid id);
}

public interface ILessonService
{
    Task<PagedResult<LessonDto>> GetLessonsAsync(Guid? groupId, DateTime? date, int page = 1, int pageSize = 20);
    Task<List<LessonDto>> GetTodayLessonsAsync();
    Task<ApiResponse<LessonDto>> GetLessonByIdAsync(Guid id);
    Task<ApiResponse<LessonDto>> CreateLessonAsync(CreateLessonDto dto);
    Task<ApiResponse<LessonDto>> UpdateLessonAsync(Guid id, UpdateLessonDto dto);
    Task<ApiResponse<bool>> DeleteLessonAsync(Guid id);
}

public interface IAttendanceService
{
    Task<List<AttendanceDto>> GetLessonAttendanceAsync(Guid lessonId);
    Task<ApiResponse<AttendanceDto>> MarkAttendanceAsync(CreateAttendanceDto dto);
    Task<ApiResponse<AttendanceDto>> UpdateAttendanceAsync(Guid id, UpdateAttendanceDto dto);
    Task<ApiResponse<bool>> SaveBulkAttendanceAsync(BulkAttendanceDto dto);
}

public interface IGradeService
{
    Task<List<GradeDto>> GetStudentGradesAsync(Guid studentId);
    Task<List<GradeDto>> GetLessonGradesAsync(Guid lessonId);
    Task<ApiResponse<GradeDto>> AddGradeAsync(CreateGradeDto dto);
    Task<ApiResponse<GradeDto>> UpdateGradeAsync(Guid id, UpdateGradeDto dto);
    Task<ApiResponse<bool>> SaveBulkGradesAsync(BulkGradeDto dto);
}

public interface IPaymentService
{
    Task<PagedResult<PaymentDto>> GetPaymentsAsync(PaymentStatus? status, Guid? studentId, int page = 1, int pageSize = 20);
    Task<List<PaymentDto>> GetOverduePaymentsAsync();
    Task<List<PaymentDto>> GetUpcomingPaymentsAsync();
    Task<ApiResponse<PaymentDto>> GetPaymentByIdAsync(Guid id);
    Task<ApiResponse<PaymentDto>> CreatePaymentAsync(CreatePaymentDto dto);
    Task<ApiResponse<PaymentDto>> UpdatePaymentAsync(Guid id, UpdatePaymentDto dto);
    Task<ApiResponse<PaymentDto>> UpdatePromiseDueDateAsync(Guid id, DateTime newDueDate, string? note);
    Task<ApiResponse<bool>> MarkAsPaidAsync(Guid id);
    Task<ApiResponse<bool>> DeletePaymentAsync(Guid id);
}

public interface IDashboardService
{
    Task<ApiResponse<DashboardStatsDto>> GetDashboardStatsAsync();
}

public interface IReportService
{
    Task<ApiResponse<AttendanceReportDto>> GetAttendanceReportAsync(DateTime? startDate, DateTime? endDate, Guid? groupId);
    Task<ApiResponse<PaymentReportDto>> GetPaymentReportAsync(DateTime? startDate, DateTime? endDate);
    Task<ApiResponse<StudentReportDto>> GetStudentReportAsync();
}

public interface ISubscriptionService
{
    Task<ApiResponse<SubscriptionDto>> GetCurrentSubscriptionAsync();
    Task<List<SubscriptionPlanDto>> GetPlansAsync();
    Task ValidatePlanLimitAsync(string entityType);
    Task<ApiResponse<bool>> UpgradePlanAsync(Guid planId);
}

public interface IOrganizationService
{
    Task<ApiResponse<OrganizationDto>> GetOrganizationDetailsAsync();
    Task<ApiResponse<OrganizationDto>> UpdateOrganizationDetailsAsync(UpdateOrganizationDto dto);
}

public interface ISuperAdminService
{
    Task<ApiResponse<SuperAdminStatsDto>> GetPlatformStatsAsync();
    Task<List<OrganizationSummaryDto>> GetAllOrganizationsAsync();
    Task<ApiResponse<bool>> ToggleOrganizationStatusAsync(Guid organizationId);
    Task<ApiResponse<bool>> ChangeOrganizationPlanAsync(Guid organizationId, Guid planId);
}

public interface IFinanceService
{
    Task<ApiResponse<FinanceSettingDto>> GetFinanceSettingsAsync();
    Task<ApiResponse<FinanceSettingDto>> UpdateFinanceSettingsAsync(UpdateFinanceSettingDto dto);

    Task<ApiResponse<PaymentCalculationPreviewDto>> PreviewPaymentCalculationAsync(Guid studentId, Guid? groupId, decimal? customDiscountPercent);

    Task<ApiResponse<PaymentTransactionDto>> AddPaymentTransactionAsync(CreatePaymentTransactionDto dto);
    Task<ApiResponse<List<PaymentTransactionDto>>> GetPaymentTransactionsAsync(Guid paymentId);

    Task<ApiResponse<List<StudentDiscountDto>>> GetStudentDiscountsAsync(Guid? studentId);
    Task<ApiResponse<StudentDiscountDto>> CreateStudentDiscountAsync(CreateStudentDiscountDto dto);
    Task<ApiResponse<bool>> DeleteStudentDiscountAsync(Guid id);

    Task<ApiResponse<List<CenterExpenseDto>>> GetCenterExpensesAsync(DateTime? startDate, DateTime? endDate);
    Task<ApiResponse<CenterExpenseDto>> CreateCenterExpenseAsync(CreateCenterExpenseDto dto);
    Task<ApiResponse<bool>> DeleteCenterExpenseAsync(Guid id);

    Task<ApiResponse<FinanceSummaryReportDto>> GetFinanceSummaryReportAsync(DateTime? startDate, DateTime? endDate);
    Task<ApiResponse<List<TeacherSalaryReportItemDto>>> GetTeacherSalaryReportAsync(DateTime? startDate, DateTime? endDate);
}

