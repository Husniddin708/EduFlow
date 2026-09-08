using EduFlow.Domain.Entities;
using EduFlow.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EduFlow.Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task SeedAsync(EduFlowDbContext context, ILogger logger)
    {
        try
        {
            try
            {
                await context.Database.MigrateAsync();
            }
            catch (Exception ex)
            {
                logger.LogWarning("MigrateAsync xatolik berdi, EnsureCreatedAsync qo'llanilmoqda: {Msg}", ex.Message);
                await context.Database.EnsureCreatedAsync();
            }

            // Ensure tables and columns exist
            var createTableStatements = new[]
            {
                @"CREATE TABLE IF NOT EXISTS FinanceSettings (
                    Id TEXT PRIMARY KEY,
                    OrganizationId TEXT NOT NULL,
                    DefaultTeacherSharePercentage TEXT NOT NULL DEFAULT '20',
                    FamilyDiscount2ndStudent TEXT NOT NULL DEFAULT '10',
                    FamilyDiscount3rdStudent TEXT NOT NULL DEFAULT '15',
                    FamilyDiscount4thPlusStudent TEXT NOT NULL DEFAULT '20',
                    DiscountConflictRule INTEGER NOT NULL DEFAULT 1,
                    ExcusedAbsenceRefundEnabled INTEGER NOT NULL DEFAULT 1,
                    CreatedAt TEXT NOT NULL,
                    UpdatedAt TEXT NULL,
                    CreatedBy TEXT NULL,
                    UpdatedBy TEXT NULL
                );",
                @"CREATE TABLE IF NOT EXISTS StudentDiscounts (
                    Id TEXT PRIMARY KEY,
                    OrganizationId TEXT NOT NULL,
                    StudentId TEXT NOT NULL,
                    DiscountPercentage TEXT NOT NULL DEFAULT '0',
                    StartDate TEXT NOT NULL,
                    EndDate TEXT NULL,
                    Reason TEXT NOT NULL,
                    IsActive INTEGER NOT NULL DEFAULT 1,
                    CreatedAt TEXT NOT NULL,
                    UpdatedAt TEXT NULL,
                    CreatedBy TEXT NULL,
                    UpdatedBy TEXT NULL
                );",
                @"CREATE TABLE IF NOT EXISTS PaymentTransactions (
                    Id TEXT PRIMARY KEY,
                    OrganizationId TEXT NOT NULL,
                    PaymentId TEXT NOT NULL,
                    Amount TEXT NOT NULL DEFAULT '0',
                    PaymentDate TEXT NOT NULL,
                    Method INTEGER NOT NULL DEFAULT 1,
                    IdempotencyKey TEXT NULL,
                    Notes TEXT NULL,
                    CreatedAt TEXT NOT NULL,
                    UpdatedAt TEXT NULL,
                    CreatedBy TEXT NULL,
                    UpdatedBy TEXT NULL
                );",
                @"CREATE TABLE IF NOT EXISTS CenterExpenses (
                    Id TEXT PRIMARY KEY,
                    OrganizationId TEXT NOT NULL,
                    Category TEXT NOT NULL,
                    Amount TEXT NOT NULL DEFAULT '0',
                    ExpenseDate TEXT NOT NULL,
                    Description TEXT NOT NULL,
                    CreatedAt TEXT NOT NULL,
                    UpdatedAt TEXT NULL,
                    CreatedBy TEXT NULL,
                    UpdatedBy TEXT NULL
                );",
                @"CREATE TABLE IF NOT EXISTS AuditLogs (
                    Id TEXT PRIMARY KEY,
                    OrganizationId TEXT NULL,
                    UserId TEXT NULL,
                    UserEmail TEXT NULL,
                    Action TEXT NOT NULL,
                    Resource TEXT NOT NULL,
                    ResourceId TEXT NULL,
                    Details TEXT NULL,
                    IpAddress TEXT NULL,
                    CreatedAt TEXT NOT NULL
                );"
            };

            foreach (var stmt in createTableStatements)
            {
                try
                {
                    await context.Database.ExecuteSqlRawAsync(stmt);
                }
                catch (Exception ex)
                {
                    logger.LogWarning("Table creation warning: {Msg}", ex.Message);
                }
            }

            var columns = new[] {
                "ALTER TABLE Teachers ADD COLUMN CustomSharePercentage TEXT NULL;",
                "ALTER TABLE Payments ADD COLUMN OrganizationId TEXT NULL;",
                "ALTER TABLE Payments ADD COLUMN GroupId TEXT NULL;",
                "ALTER TABLE Payments ADD COLUMN BasePrice TEXT NOT NULL DEFAULT '0';",
                "ALTER TABLE Payments ADD COLUMN DiscountPercent TEXT NOT NULL DEFAULT '0';",
                "ALTER TABLE Payments ADD COLUMN DiscountAmount TEXT NOT NULL DEFAULT '0';",
                "ALTER TABLE Payments ADD COLUMN FinalAmount TEXT NOT NULL DEFAULT '0';",
                "ALTER TABLE Payments ADD COLUMN PaidAmount TEXT NOT NULL DEFAULT '0';",
                "ALTER TABLE Payments ADD COLUMN DebtAmount TEXT NOT NULL DEFAULT '0';",
                "ALTER TABLE Payments ADD COLUMN TeacherSharePercent TEXT NOT NULL DEFAULT '20';",
                "ALTER TABLE Payments ADD COLUMN TeacherShareAmount TEXT NOT NULL DEFAULT '0';",
                "ALTER TABLE Payments ADD COLUMN CenterShareAmount TEXT NOT NULL DEFAULT '0';",
                "ALTER TABLE Payments ADD COLUMN TeacherId TEXT NULL;",
                "ALTER TABLE Users ADD COLUMN RefreshToken TEXT NULL;",
                "ALTER TABLE Users ADD COLUMN RefreshTokenExpiryTime TEXT NULL;",
                "ALTER TABLE Parents ADD COLUMN OrganizationId TEXT NULL;",
                "ALTER TABLE Lessons ADD COLUMN OrganizationId TEXT NULL;",
                "ALTER TABLE Attendances ADD COLUMN OrganizationId TEXT NULL;",
                "ALTER TABLE Grades ADD COLUMN OrganizationId TEXT NULL;",
                "ALTER TABLE Notifications ADD COLUMN OrganizationId TEXT NULL;",
                "ALTER TABLE TelegramAccounts ADD COLUMN OrganizationId TEXT NULL;"
            };
            foreach (var col in columns)
            {
                try { await context.Database.ExecuteSqlRawAsync(col); } catch { }
            }

            var backfillStatements = new[] {
                "UPDATE Parents SET OrganizationId = (SELECT OrganizationId FROM Students WHERE Students.ParentId = Parents.Id LIMIT 1) WHERE OrganizationId IS NULL;",
                "UPDATE Lessons SET OrganizationId = (SELECT OrganizationId FROM Groups WHERE Groups.Id = Lessons.GroupId LIMIT 1) WHERE OrganizationId IS NULL;",
                "UPDATE Attendances SET OrganizationId = (SELECT OrganizationId FROM Students WHERE Students.Id = Attendances.StudentId LIMIT 1) WHERE OrganizationId IS NULL;",
                "UPDATE Grades SET OrganizationId = (SELECT OrganizationId FROM Students WHERE Students.Id = Grades.StudentId LIMIT 1) WHERE OrganizationId IS NULL;",
                "UPDATE Notifications SET OrganizationId = (SELECT OrganizationId FROM Students WHERE Students.Id = Notifications.StudentId LIMIT 1) WHERE OrganizationId IS NULL;",
                "UPDATE TelegramAccounts SET OrganizationId = (SELECT OrganizationId FROM Parents WHERE Parents.Id = TelegramAccounts.ParentId LIMIT 1) WHERE OrganizationId IS NULL;",
                "UPDATE Payments SET OrganizationId = (SELECT OrganizationId FROM Students WHERE Students.Id = Payments.StudentId LIMIT 1) WHERE OrganizationId IS NULL;",
                "UPDATE Payments SET OrganizationId = (SELECT Id FROM Organizations LIMIT 1) WHERE OrganizationId IS NULL;",
                "UPDATE Parents SET OrganizationId = (SELECT Id FROM Organizations LIMIT 1) WHERE OrganizationId IS NULL;",
                "UPDATE Students SET OrganizationId = (SELECT Id FROM Organizations LIMIT 1) WHERE OrganizationId IS NULL;",
                "UPDATE Teachers SET OrganizationId = (SELECT Id FROM Organizations LIMIT 1) WHERE OrganizationId IS NULL;",
                "UPDATE Groups SET OrganizationId = (SELECT Id FROM Organizations LIMIT 1) WHERE OrganizationId IS NULL;",
                "UPDATE Lessons SET OrganizationId = (SELECT Id FROM Organizations LIMIT 1) WHERE OrganizationId IS NULL;",
                "UPDATE Attendances SET OrganizationId = (SELECT Id FROM Organizations LIMIT 1) WHERE OrganizationId IS NULL;",
                "UPDATE Grades SET OrganizationId = (SELECT Id FROM Organizations LIMIT 1) WHERE OrganizationId IS NULL;",
                "UPDATE Notifications SET OrganizationId = (SELECT Id FROM Organizations LIMIT 1) WHERE OrganizationId IS NULL;",
                "UPDATE TelegramAccounts SET OrganizationId = (SELECT Id FROM Organizations LIMIT 1) WHERE OrganizationId IS NULL;",
                "UPDATE Users SET Role = 1 WHERE Email IN ('admin@eduflow.uz', 'superadmin@eduflow.uz', 'admin@smartedu.uz');"
            };
            foreach (var bf in backfillStatements)
            {
                try { await context.Database.ExecuteSqlRawAsync(bf); } catch { }
            }

            // 1. Seed Subscription Plans
            if (!await context.SubscriptionPlans.AnyAsync())
            {
                var plans = new List<SubscriptionPlan>
                {
                    new()
                    {
                        Name = "FREE",
                        MonthlyPrice = 0,
                        MaxStudents = 20,
                        MaxTeachers = 1,
                        MaxGroups = 2,
                        HasTelegram = false,
                        HasReports = false,
                        HasAdvancedAnalytics = false
                    },
                    new()
                    {
                        Name = "STARTER",
                        MonthlyPrice = 290000,
                        MaxStudents = 100,
                        MaxTeachers = 5,
                        MaxGroups = 10,
                        HasTelegram = true,
                        HasReports = true,
                        HasAdvancedAnalytics = false
                    },
                    new()
                    {
                        Name = "PRO",
                        MonthlyPrice = 590000,
                        MaxStudents = 10000,
                        MaxTeachers = 100,
                        MaxGroups = 500,
                        HasTelegram = true,
                        HasReports = true,
                        HasAdvancedAnalytics = true
                    }
                };

                await context.SubscriptionPlans.AddRangeAsync(plans);
                await context.SaveChangesAsync();
            }

            // 2. Seed Single Learning Center Organization "EduFlow O'quv Markazi"
            var mainOrg = await context.Organizations.IgnoreQueryFilters().FirstOrDefaultAsync(o => o.Email == "info@smartedu.uz" || o.Name == "EduFlow O'quv Markazi" || o.Name == "Smart Education");
            if (mainOrg == null)
            {
                mainOrg = new Organization
                {
                    Name = "EduFlow O'quv Markazi",
                    Phone = "+998901234567",
                    Email = "info@smartedu.uz",
                    Address = "Toshkent sh., Yunusobod tumani, 4-mavze, 12-uy",
                    IsActive = true
                };
                await context.Organizations.AddAsync(mainOrg);
                await context.SaveChangesAsync();
            }
            else
            {
                mainOrg.Name = "EduFlow O'quv Markazi";
            }

            try
            {
                var defaultAdminPass = Environment.GetEnvironmentVariable("SEED_ADMIN_PASSWORD") ?? "admin123";
                var adminHash = BCrypt.Net.BCrypt.HashPassword(defaultAdminPass);

                // Unified Master Admin
                var masterAdmin = await context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == "admin@eduflow.uz");
                if (masterAdmin == null)
                {
                    masterAdmin = new User
                    {
                        OrganizationId = mainOrg.Id,
                        FirstName = "Bosh",
                        LastName = "Administrator",
                        Email = "admin@eduflow.uz",
                        PasswordHash = adminHash,
                        PhoneNumber = "+998901234567",
                        Role = UserRole.SuperAdmin,
                        IsActive = true
                    };
                    await context.Users.AddAsync(masterAdmin);
                }
                else
                {
                    masterAdmin.Role = UserRole.SuperAdmin;
                    masterAdmin.PasswordHash = adminHash;
                }

                // Superadmin alias
                var superAdmin = await context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == "superadmin@eduflow.uz");
                if (superAdmin == null)
                {
                    superAdmin = new User
                    {
                        OrganizationId = mainOrg.Id,
                        FirstName = "Admin",
                        LastName = "EduFlow",
                        Email = "superadmin@eduflow.uz",
                        PasswordHash = adminHash,
                        PhoneNumber = "+998900000000",
                        Role = UserRole.SuperAdmin,
                        IsActive = true
                    };
                    await context.Users.AddAsync(superAdmin);
                }
                else
                {
                    superAdmin.Role = UserRole.SuperAdmin;
                    superAdmin.PasswordHash = adminHash;
                }

                await context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                logger.LogWarning("Admin seed check: {Msg}", ex.Message);
            }

            var smartOrg = mainOrg;
            var proPlan = await context.SubscriptionPlans.FirstAsync(p => p.Name == "PRO");

            var subscription = await context.Subscriptions.IgnoreQueryFilters().FirstOrDefaultAsync(s => s.OrganizationId == smartOrg.Id);
            if (subscription == null)
            {
                subscription = new Subscription
                {
                    OrganizationId = smartOrg.Id,
                    SubscriptionPlanId = proPlan.Id,
                    StartDate = DateTime.UtcNow.AddMonths(-1),
                    EndDate = DateTime.UtcNow.AddMonths(11),
                    Status = SubscriptionStatus.Active,
                    AutoRenew = true
                };
                await context.Subscriptions.AddAsync(subscription);

                // Teachers
                var teacher1User = await context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == "teacher@smartedu.uz");
                if (teacher1User == null)
                {
                    teacher1User = new User
                    {
                        OrganizationId = smartOrg.Id,
                        FirstName = "Azizbek",
                        LastName = "Karimov",
                        Email = "teacher@smartedu.uz",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                        PhoneNumber = "+998911112233",
                        Role = UserRole.Teacher,
                        IsActive = true
                    };
                    await context.Users.AddAsync(teacher1User);
                    await context.SaveChangesAsync();
                }

                var teacher1 = new Teacher
                {
                    OrganizationId = smartOrg.Id,
                    UserId = teacher1User.Id,
                    FullName = "Azizbek Karimov",
                    PhoneNumber = "+998911112233",
                    Specialization = "IELTS & Ingliz tili"
                };
                var teacher2 = new Teacher
                {
                    OrganizationId = smartOrg.Id,
                    FullName = "Rustam Qodirov",
                    PhoneNumber = "+998934445566",
                    Specialization = "Oliy Matematika"
                };
                var teacher3 = new Teacher
                {
                    OrganizationId = smartOrg.Id,
                    FullName = "Malika Tursunova",
                    PhoneNumber = "+998947778899",
                    Specialization = "General English"
                };
                await context.Teachers.AddRangeAsync(teacher1, teacher2, teacher3);

                // Subjects
                var subEnglish = new Subject { OrganizationId = smartOrg.Id, Name = "Ingliz tili" };
                var subIelts = new Subject { OrganizationId = smartOrg.Id, Name = "IELTS" };
                var subMath = new Subject { OrganizationId = smartOrg.Id, Name = "Matematika" };
                var subIT = new Subject { OrganizationId = smartOrg.Id, Name = "IT va Dasturlash" };
                await context.Subjects.AddRangeAsync(subEnglish, subIelts, subMath, subIT);

                // Groups
                var group1 = new Group
                {
                    OrganizationId = smartOrg.Id,
                    Name = "IELTS Intermediate",
                    Teacher = teacher1,
                    Subject = subIelts,
                    MonthlyFee = 450000,
                    MaxStudents = 15,
                    ScheduleDescription = "Du, Chor, Jum | 14:00 - 15:30",
                    Room = "Xona-4",
                    IsActive = true
                };
                var group2 = new Group
                {
                    OrganizationId = smartOrg.Id,
                    Name = "Oliy Matematika",
                    Teacher = teacher2,
                    Subject = subMath,
                    MonthlyFee = 400000,
                    MaxStudents = 20,
                    ScheduleDescription = "Se, Pay, Sha | 16:00 - 17:30",
                    Room = "Xona-2",
                    IsActive = true
                };
                var group3 = new Group
                {
                    OrganizationId = smartOrg.Id,
                    Name = "General English (Beginner)",
                    Teacher = teacher3,
                    Subject = subEnglish,
                    MonthlyFee = 350000,
                    MaxStudents = 15,
                    ScheduleDescription = "Du, Chor, Jum | 10:00 - 11:30",
                    Room = "Xona-1",
                    IsActive = true
                };
                await context.Groups.AddRangeAsync(group1, group2, group3);

                // Parents & Students
                var students = new List<Student>();
                var names = new (string f, string l, string pf, string pp)[]
                {
                    ("Azizbek", "Rahimov", "Otabek Rahimov", "+998901110011"),
                    ("Malika", "Qodirova", "Nargiza Qodirova", "+998902220022"),
                    ("Javohir", "Do'smatov", "Anvar Do'smatov", "+998903330033"),
                    ("Sardor", "Aliyev", "Bahrom Aliyev", "+998904440044"),
                    ("Nilufar", "Karimova", "Dilnoza Karimova", "+998905550055"),
                    ("Bobur", "Yusupov", "Ravshan Yusupov", "+998906660066"),
                    ("Jasur", "Umarov", "Shuhrat Umarov", "+998907770077"),
                    ("Shaxnoza", "Olimova", "Gulbahor Olimova", "+998908880088"),
                    ("Diyorbek", "Saidov", "Jamshid Saidov", "+998909990099"),
                    ("Madina", "Xoliqova", "Feruza Xoliqova", "+998911223344"),
                    ("Shohrux", "Mirzayev", "Mansur Mirzayev", "+998912233445"),
                    ("Zilola", "Nazarova", "Saida Nazarova", "+998913344556")
                };

                int studentIndex = 1;
                foreach (var item in names)
                {
                    var parent = new Parent
                    {
                        FullName = item.pf,
                        PhoneNumber = item.pp,
                        TelegramAccount = new TelegramAccount
                        {
                            ChatId = $"9876543{studentIndex}",
                            Username = $"parent_{studentIndex}",
                            IsConnected = true
                        }
                    };
                    await context.Parents.AddAsync(parent);

                    var student = new Student
                    {
                        OrganizationId = smartOrg.Id,
                        FirstName = item.f,
                        LastName = item.l,
                        PhoneNumber = $"+99890{studentIndex:D7}",
                        BirthDate = new DateTime(2006, 5, studentIndex),
                        EnrollmentDate = DateTime.UtcNow.AddMonths(-studentIndex),
                        Parent = parent,
                        IsActive = true
                    };
                    students.Add(student);
                    studentIndex++;
                }
                await context.Students.AddRangeAsync(students);

                // Assign students to group1 & group2
                foreach (var st in students.Take(8))
                {
                    await context.GroupStudents.AddAsync(new GroupStudent { Group = group1, Student = st });
                }
                foreach (var st in students.Skip(4).Take(8))
                {
                    await context.GroupStudents.AddAsync(new GroupStudent { Group = group2, Student = st });
                }

                // Lessons
                var now = DateTime.UtcNow;
                var lessonToday1 = new Lesson
                {
                    Group = group1,
                    StartTime = new DateTime(now.Year, now.Month, now.Day, 14, 0, 0, DateTimeKind.Utc),
                    EndTime = new DateTime(now.Year, now.Month, now.Day, 15, 30, 0, DateTimeKind.Utc),
                    Topic = "IELTS Writing Task 2: Opinion Essays",
                    Status = LessonStatus.Completed
                };
                var lessonToday2 = new Lesson
                {
                    Group = group2,
                    StartTime = new DateTime(now.Year, now.Month, now.Day, 16, 0, 0, DateTimeKind.Utc),
                    EndTime = new DateTime(now.Year, now.Month, now.Day, 17, 30, 0, DateTimeKind.Utc),
                    Topic = "Matritsalar va Determinantlar",
                    Status = LessonStatus.Scheduled
                };
                await context.Lessons.AddRangeAsync(lessonToday1, lessonToday2);

                // Attendance for lessonToday1
                var attStatusList = new[] { AttendanceStatus.Present, AttendanceStatus.Present, AttendanceStatus.Excused, AttendanceStatus.Absent, AttendanceStatus.Present, AttendanceStatus.Late, AttendanceStatus.Present, AttendanceStatus.Present };
                int aIdx = 0;
                foreach (var st in students.Take(8))
                {
                    var stStatus = attStatusList[aIdx % attStatusList.Length];
                    await context.Attendances.AddAsync(new Attendance
                    {
                        Lesson = lessonToday1,
                        Student = st,
                        Status = stStatus,
                        Comment = stStatus == AttendanceStatus.Excused ? "Kasal bo'lib qolgan" : (stStatus == AttendanceStatus.Late ? "10 daqiqa kech qoldi" : null)
                    });

                    // Grades
                    await context.Grades.AddAsync(new Grade
                    {
                        Lesson = lessonToday1,
                        Student = st,
                        Score = 80 + (aIdx * 2) % 20,
                        Comment = "Uy vazifasi to'liq bajarildi"
                    });
                    aIdx++;
                }

                // Payments
                foreach (var st in students)
                {
                    // Paid payment
                    await context.Payments.AddAsync(new Payment
                    {
                        Student = st,
                        Amount = 450000,
                        PaymentDate = DateTime.UtcNow.AddDays(-10),
                        DueDate = DateTime.UtcNow.AddDays(-15),
                        Status = PaymentStatus.Paid,
                        Description = "Oylik to'lov (Payme orqali)"
                    });
                }
                // Add 2 pending and 2 overdue payments
                await context.Payments.AddAsync(new Payment
                {
                    Student = students[2],
                    Amount = 450000,
                    DueDate = DateTime.UtcNow.AddDays(-5),
                    Status = PaymentStatus.Overdue,
                    Description = "Kechikkan oylik to'lov"
                });
                await context.Payments.AddAsync(new Payment
                {
                    Student = students[3],
                    Amount = 450000,
                    DueDate = DateTime.UtcNow.AddDays(2),
                    Status = PaymentStatus.Pending,
                    Description = "Navbatdagi oylik to'lov"
                });

                await context.SaveChangesAsync();
                logger.LogInformation("Demo seed data muvaffaqiyatli yuklandi!");
            }

            var centerOrgId = Guid.Parse("527b6130-000f-45a0-b791-fdf6f09fc72d");
            if (!await context.FinanceSettings.AnyAsync(fs => fs.OrganizationId == centerOrgId))
            {
                context.FinanceSettings.Add(new FinanceSetting
                {
                    OrganizationId = centerOrgId,
                    DefaultTeacherSharePercentage = 20m,
                    FamilyDiscount2ndStudent = 10m,
                    FamilyDiscount3rdStudent = 15m,
                    FamilyDiscount4thPlusStudent = 20m,
                    DiscountConflictRule = DiscountConflictRule.HighestDiscount,
                    ExcusedAbsenceRefundEnabled = true
                });
                await context.SaveChangesAsync();
            }

            // Populate snapshot fields for existing payments if unpopulated
            var existingPayments = await context.Payments.Where(p => p.FinalAmount == 0).ToListAsync();
            foreach (var p in existingPayments)
            {
                p.OrganizationId = centerOrgId;
                p.BasePrice = p.Amount > 0 ? p.Amount : 450000m;
                p.FinalAmount = p.BasePrice;
                p.PaidAmount = p.Status == PaymentStatus.Paid ? p.FinalAmount : 0m;
                p.DebtAmount = p.FinalAmount - p.PaidAmount;
                p.TeacherSharePercent = 20m;
                p.TeacherShareAmount = Math.Round(p.PaidAmount * 0.20m, 2, MidpointRounding.AwayFromZero);
                p.CenterShareAmount = p.PaidAmount - p.TeacherShareAmount;
            }
            if (existingPayments.Any())
            {
                await context.SaveChangesAsync();
            }

            var pWithGroup = await context.Payments.Include(p => p.Group).Where(p => p.TeacherId == null && p.GroupId != null).ToListAsync();
            foreach (var p in pWithGroup)
            {
                if (p.Group != null) p.TeacherId = p.Group.TeacherId;
            }
            if (pWithGroup.Any())
            {
                await context.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ma'lumotlar bazasini initsializatsiya qilishda xatolik yuz berdi.");
        }
    }
}
