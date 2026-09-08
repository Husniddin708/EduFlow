using System.Reflection;
using EduFlow.Application.Interfaces;
using EduFlow.Application.Mapping;
using EduFlow.Application.Services;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace EduFlow.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddAutoMapper(cfg =>
        {
            cfg.AddProfile<MappingProfile>();
        });
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        // Application Services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IStudentService, StudentService>();
        services.AddScoped<ITeacherService, TeacherService>();
        services.AddScoped<IGroupService, GroupService>();
        services.AddScoped<ISubjectService, SubjectService>();
        services.AddScoped<ILessonService, LessonService>();
        services.AddScoped<IAttendanceService, AttendanceService>();
        services.AddScoped<IGradeService, GradeService>();
        services.AddScoped<IPaymentService, PaymentService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IReportService, ReportService>();
        services.AddScoped<ISubscriptionService, SubscriptionService>();
        services.AddScoped<IOrganizationService, OrganizationService>();
        services.AddScoped<ISuperAdminService, SuperAdminService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IFinanceService, FinanceService>();

        return services;
    }
}
