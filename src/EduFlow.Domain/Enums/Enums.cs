namespace EduFlow.Domain.Enums;

public enum UserRole
{
    SuperAdmin = 1,
    CenterAdmin = 2,
    Teacher = 3
}

public enum AttendanceStatus
{
    Present = 1,
    Absent = 2,
    Late = 3,
    Excused = 4
}

public enum PaymentStatus
{
    Pending = 1,
    Paid = 2,
    Overdue = 3,
    Cancelled = 4,
    Partial = 5
}

public enum PaymentMethod
{
    Cash = 1,
    Payme = 2,
    Click = 3,
    BankTransfer = 4
}

public enum DiscountConflictRule
{
    HighestDiscount = 1,
    IndividualPriority = 2
}

public enum LessonStatus
{
    Scheduled = 1,
    Completed = 2,
    Cancelled = 3
}

public enum SubscriptionStatus
{
    Trial = 1,
    Active = 2,
    Expired = 3,
    Cancelled = 4
}

public enum NotificationType
{
    Attendance = 1,
    Payment = 2,
    Grade = 3,
    General = 4
}

