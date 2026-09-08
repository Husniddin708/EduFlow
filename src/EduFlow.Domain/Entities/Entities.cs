using EduFlow.Domain.Common;
using EduFlow.Domain.Enums;

namespace EduFlow.Domain.Entities;

public class Organization : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Teacher> Teachers { get; set; } = new List<Teacher>();
    public ICollection<Student> Students { get; set; } = new List<Student>();
    public ICollection<Group> Groups { get; set; } = new List<Group>();
    public ICollection<Subject> Subjects { get; set; } = new List<Subject>();
    public ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();
}

public class User : AuditableEntity, ITenantEntity
{
    public Guid OrganizationId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.CenterAdmin;
    public bool IsActive { get; set; } = true;
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }

    // Navigation
    public Organization Organization { get; set; } = null!;
    public Teacher? Teacher { get; set; }
}

public class Teacher : AuditableEntity, ITenantEntity
{
    public Guid OrganizationId { get; set; }
    public Guid? UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Specialization { get; set; }
    public decimal? CustomSharePercentage { get; set; }

    // Navigation
    public Organization Organization { get; set; } = null!;
    public User? User { get; set; }
    public ICollection<Group> Groups { get; set; } = new List<Group>();
}

public class Parent : AuditableEntity, ITenantEntity
{
    public Guid OrganizationId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? TelegramChatId { get; set; }

    // Navigation
    public Organization Organization { get; set; } = null!;
    public ICollection<Student> Students { get; set; } = new List<Student>();
    public TelegramAccount? TelegramAccount { get; set; }
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}

public class Student : AuditableEntity, ITenantEntity
{
    public Guid OrganizationId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public DateTime? BirthDate { get; set; }
    public DateTime EnrollmentDate { get; set; } = DateTime.UtcNow;
    public Guid? ParentId { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public Organization Organization { get; set; } = null!;
    public Parent? Parent { get; set; }
    public ICollection<GroupStudent> GroupStudents { get; set; } = new List<GroupStudent>();
    public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
    public ICollection<Grade> Grades { get; set; } = new List<Grade>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}

public class Subject : AuditableEntity, ITenantEntity
{
    public Guid OrganizationId { get; set; }
    public string Name { get; set; } = string.Empty;

    // Navigation
    public Organization Organization { get; set; } = null!;
    public ICollection<Group> Groups { get; set; } = new List<Group>();
}

public class Group : AuditableEntity, ITenantEntity
{
    public Guid OrganizationId { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid? TeacherId { get; set; }
    public Guid? SubjectId { get; set; }
    public decimal MonthlyFee { get; set; }
    public int MaxStudents { get; set; } = 15;
    public string? ScheduleDescription { get; set; }
    public string? Room { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public Organization Organization { get; set; } = null!;
    public Teacher? Teacher { get; set; }
    public Subject? Subject { get; set; }
    public ICollection<GroupStudent> GroupStudents { get; set; } = new List<GroupStudent>();
    public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
}

public class GroupStudent : BaseEntity
{
    public Guid GroupId { get; set; }
    public Guid StudentId { get; set; }
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Group Group { get; set; } = null!;
    public Student Student { get; set; } = null!;
}

public class Lesson : AuditableEntity, ITenantEntity
{
    public Guid OrganizationId { get; set; }
    public Guid GroupId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Topic { get; set; } = string.Empty;
    public LessonStatus Status { get; set; } = LessonStatus.Scheduled;

    // Navigation
    public Organization Organization { get; set; } = null!;
    public Group Group { get; set; } = null!;
    public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
    public ICollection<Grade> Grades { get; set; } = new List<Grade>();
}

public class Attendance : AuditableEntity, ITenantEntity
{
    public Guid OrganizationId { get; set; }
    public Guid LessonId { get; set; }
    public Guid StudentId { get; set; }
    public AttendanceStatus Status { get; set; } = AttendanceStatus.Present;
    public string? Comment { get; set; }

    // Navigation
    public Organization Organization { get; set; } = null!;
    public Lesson Lesson { get; set; } = null!;
    public Student Student { get; set; } = null!;
}

public class Grade : AuditableEntity, ITenantEntity
{
    public Guid OrganizationId { get; set; }
    public Guid LessonId { get; set; }
    public Guid StudentId { get; set; }
    public decimal Score { get; set; }
    public string? Comment { get; set; }

    // Navigation
    public Organization Organization { get; set; } = null!;
    public Lesson Lesson { get; set; } = null!;
    public Student Student { get; set; } = null!;
}

public class Payment : AuditableEntity, ITenantEntity
{
    public Guid OrganizationId { get; set; }
    public Guid StudentId { get; set; }
    public Guid? GroupId { get; set; }
    public Guid? TeacherId { get; set; }

    public decimal Amount { get; set; } // Historical/Current total due (FinalAmount)
    public decimal BasePrice { get; set; } // Course/Group monthly fee snapshot
    public decimal DiscountPercent { get; set; } // Applied discount percentage snapshot
    public decimal DiscountAmount { get; set; } // Discount amount snapshot
    public decimal FinalAmount { get; set; } // BasePrice - DiscountAmount
    public decimal PaidAmount { get; set; } // Total sum paid so far
    public decimal DebtAmount { get; set; } // Remaining debt: FinalAmount - PaidAmount

    // Teacher & Center Share snapshot
    public decimal TeacherSharePercent { get; set; } // e.g. 20% or 25% snapshot
    public decimal TeacherShareAmount { get; set; } // Calculated from paid amount
    public decimal CenterShareAmount { get; set; } // Calculated from paid amount

    public DateTime? PaymentDate { get; set; }
    public DateTime DueDate { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public string? Description { get; set; }

    // Navigation
    public Organization Organization { get; set; } = null!;
    public Student Student { get; set; } = null!;
    public Group? Group { get; set; }
    public Teacher? Teacher { get; set; }
    public ICollection<PaymentTransaction> Transactions { get; set; } = new List<PaymentTransaction>();
}

public class Notification : AuditableEntity, ITenantEntity
{
    public Guid OrganizationId { get; set; }
    public Guid? StudentId { get; set; }
    public Guid? ParentId { get; set; }
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; } = NotificationType.General;
    public bool IsSent { get; set; } = false;
    public DateTime? SentAt { get; set; }

    // Navigation
    public Organization Organization { get; set; } = null!;
    public Student? Student { get; set; }
    public Parent? Parent { get; set; }
}

public class TelegramAccount : AuditableEntity, ITenantEntity
{
    public Guid OrganizationId { get; set; }
    public Guid ParentId { get; set; }
    public string ChatId { get; set; } = string.Empty;
    public string? Username { get; set; }
    public bool IsConnected { get; set; } = true;

    // Navigation
    public Organization Organization { get; set; } = null!;
    public Parent Parent { get; set; } = null!;
}

public class SubscriptionPlan : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public decimal MonthlyPrice { get; set; }
    public int MaxStudents { get; set; } = 20;
    public int MaxTeachers { get; set; } = 2;
    public int MaxGroups { get; set; } = 3;
    public bool HasTelegram { get; set; } = true;
    public bool HasReports { get; set; } = true;
    public bool HasAdvancedAnalytics { get; set; } = false;

    // Navigation
    public ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();
}

public class Subscription : AuditableEntity, ITenantEntity
{
    public Guid OrganizationId { get; set; }
    public Guid SubscriptionPlanId { get; set; }
    public DateTime StartDate { get; set; } = DateTime.UtcNow;
    public DateTime EndDate { get; set; } = DateTime.UtcNow.AddMonths(1);
    public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Trial;
    public bool AutoRenew { get; set; } = true;

    // Navigation
    public Organization Organization { get; set; } = null!;
    public SubscriptionPlan SubscriptionPlan { get; set; } = null!;
}

public class PaymentTransaction : AuditableEntity, ITenantEntity
{
    public Guid OrganizationId { get; set; }
    public Guid PaymentId { get; set; }
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
    public PaymentMethod Method { get; set; } = PaymentMethod.Cash;
    public string? IdempotencyKey { get; set; }
    public string? Notes { get; set; }

    // Navigation
    public Organization Organization { get; set; } = null!;
    public Payment Payment { get; set; } = null!;
}

public class FinanceSetting : AuditableEntity, ITenantEntity
{
    public Guid OrganizationId { get; set; }
    public decimal DefaultTeacherSharePercentage { get; set; } = 20m;
    public decimal FamilyDiscount2ndStudent { get; set; } = 10m;
    public decimal FamilyDiscount3rdStudent { get; set; } = 15m;
    public decimal FamilyDiscount4thPlusStudent { get; set; } = 20m;
    public DiscountConflictRule DiscountConflictRule { get; set; } = DiscountConflictRule.HighestDiscount;
    public bool ExcusedAbsenceRefundEnabled { get; set; } = true;

    // Navigation
    public Organization Organization { get; set; } = null!;
}

public class StudentDiscount : AuditableEntity, ITenantEntity
{
    public Guid OrganizationId { get; set; }
    public Guid StudentId { get; set; }
    public decimal DiscountPercentage { get; set; }
    public DateTime StartDate { get; set; } = DateTime.UtcNow;
    public DateTime? EndDate { get; set; }
    public string Reason { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    // Navigation
    public Organization Organization { get; set; } = null!;
    public Student Student { get; set; } = null!;
}

public class CenterExpense : AuditableEntity, ITenantEntity
{
    public Guid OrganizationId { get; set; }
    public string Category { get; set; } = "Boshqa"; // Ijara, Kommunal, Internet, Reklama, Boshqa
    public decimal Amount { get; set; }
    public DateTime ExpenseDate { get; set; } = DateTime.UtcNow;
    public string Description { get; set; } = string.Empty;

    // Navigation
    public Organization Organization { get; set; } = null!;
}

public class AuditLog : BaseEntity
{
    public Guid? OrganizationId { get; set; }
    public Guid? UserId { get; set; }
    public string? UserEmail { get; set; }
    public string Action { get; set; } = string.Empty;
    public string Resource { get; set; } = string.Empty;
    public string? ResourceId { get; set; }
    public string? Details { get; set; }
    public string? IpAddress { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Organization? Organization { get; set; }
    public User? User { get; set; }
}

