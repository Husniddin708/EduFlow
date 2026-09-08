using AutoMapper;
using EduFlow.Application.Common.Exceptions;
using EduFlow.Application.Common.Models;
using EduFlow.Application.DTOs;
using EduFlow.Application.Interfaces;
using EduFlow.Domain.Entities;
using EduFlow.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace EduFlow.Application.Services;

public class LessonService : ILessonService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditLogService _auditLogService;
    private readonly IMapper _mapper;

    public LessonService(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IAuditLogService auditLogService,
        IMapper mapper)
    {
        _context = context;
        _currentUser = currentUser;
        _auditLogService = auditLogService;
        _mapper = mapper;
    }

    public async Task<PagedResult<LessonDto>> GetLessonsAsync(Guid? groupId, DateTime? date, int page = 1, int pageSize = 20)
    {
        pageSize = Math.Clamp(pageSize, 1, 100);
        var query = _context.Lessons
            .Include(l => l.Group).ThenInclude(g => g.Subject)
            .Include(l => l.Group).ThenInclude(g => g.Teacher)
            .Include(l => l.Group).ThenInclude(g => g.GroupStudents)
            .Include(l => l.Attendances)
            .AsQueryable();

        if (groupId.HasValue) query = query.Where(l => l.GroupId == groupId.Value);
        if (date.HasValue)
        {
            var d = date.Value.Date;
            query = query.Where(l => l.StartTime.Date == d);
        }

        var totalCount = await query.CountAsync();
        var lessons = await query
            .OrderByDescending(l => l.StartTime)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<LessonDto>(_mapper.Map<List<LessonDto>>(lessons), totalCount, page, pageSize);
    }

    public async Task<List<LessonDto>> GetTodayLessonsAsync()
    {
        var today = DateTime.UtcNow.Date;
        var lessons = await _context.Lessons
            .Include(l => l.Group).ThenInclude(g => g.Subject)
            .Include(l => l.Group).ThenInclude(g => g.Teacher)
            .Include(l => l.Group).ThenInclude(g => g.GroupStudents)
            .Include(l => l.Attendances)
            .Where(l => l.StartTime.Date == today)
            .OrderBy(l => l.StartTime)
            .ToListAsync();

        return _mapper.Map<List<LessonDto>>(lessons);
    }

    public async Task<ApiResponse<LessonDto>> GetLessonByIdAsync(Guid id)
    {
        var lesson = await _context.Lessons
            .Include(l => l.Group).ThenInclude(g => g.Subject)
            .Include(l => l.Group).ThenInclude(g => g.Teacher)
            .Include(l => l.Group).ThenInclude(g => g.GroupStudents)
            .Include(l => l.Attendances)
            .FirstOrDefaultAsync(l => l.Id == id);

        if (lesson == null) throw new NotFoundException("Dars topilmadi.");
        return ApiResponse<LessonDto>.Ok(_mapper.Map<LessonDto>(lesson));
    }

    public async Task<ApiResponse<LessonDto>> CreateLessonAsync(CreateLessonDto dto)
    {
        var group = await _context.Groups.FirstOrDefaultAsync(g => g.Id == dto.GroupId);
        if (group == null) throw new NotFoundException("Guruh topilmadi.");

        if (_currentUser.Role != UserRole.SuperAdmin && _currentUser.OrganizationId.HasValue && group.OrganizationId != _currentUser.OrganizationId.Value)
        {
            throw new ForbiddenException("Ushbu guruh boshqa markazga tegishli.");
        }

        var lesson = new Lesson
        {
            OrganizationId = group.OrganizationId,
            GroupId = dto.GroupId,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            Topic = dto.Topic.Trim(),
            Status = LessonStatus.Scheduled
        };
        _context.Lessons.Add(lesson);
        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync("CreateLesson", "Lesson", lesson.Id.ToString(), $"Created lesson: {lesson.Topic}");

        return await GetLessonByIdAsync(lesson.Id);
    }

    public async Task<ApiResponse<LessonDto>> UpdateLessonAsync(Guid id, UpdateLessonDto dto)
    {
        var lesson = await _context.Lessons.FirstOrDefaultAsync(l => l.Id == id);
        if (lesson == null) throw new NotFoundException("Dars topilmadi.");

        if (_currentUser.Role != UserRole.SuperAdmin && _currentUser.OrganizationId.HasValue && lesson.OrganizationId != _currentUser.OrganizationId.Value)
        {
            throw new ForbiddenException();
        }

        lesson.StartTime = dto.StartTime;
        lesson.EndTime = dto.EndTime;
        lesson.Topic = dto.Topic.Trim();
        lesson.Status = dto.Status;
        lesson.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        await _auditLogService.LogAsync("UpdateLesson", "Lesson", lesson.Id.ToString(), $"Updated lesson: {lesson.Topic}");

        return await GetLessonByIdAsync(lesson.Id);
    }

    public async Task<ApiResponse<bool>> DeleteLessonAsync(Guid id)
    {
        var lesson = await _context.Lessons.FirstOrDefaultAsync(l => l.Id == id);
        if (lesson == null) throw new NotFoundException("Dars topilmadi.");

        if (_currentUser.Role != UserRole.SuperAdmin && _currentUser.OrganizationId.HasValue && lesson.OrganizationId != _currentUser.OrganizationId.Value)
        {
            throw new ForbiddenException();
        }

        _context.Lessons.Remove(lesson);
        await _context.SaveChangesAsync();
        await _auditLogService.LogAsync("DeleteLesson", "Lesson", lesson.Id.ToString(), $"Deleted lesson: {lesson.Topic}");

        return ApiResponse<bool>.Ok(true, "Dars o'chirildi.");
    }
}

public class AttendanceService : IAttendanceService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditLogService _auditLogService;
    private readonly ITelegramService _telegramService;
    private readonly INotificationService _notificationService;
    private readonly IMapper _mapper;

    public AttendanceService(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IAuditLogService auditLogService,
        ITelegramService telegramService,
        INotificationService notificationService,
        IMapper mapper)
    {
        _context = context;
        _currentUser = currentUser;
        _auditLogService = auditLogService;
        _telegramService = telegramService;
        _notificationService = notificationService;
        _mapper = mapper;
    }

    public async Task<List<AttendanceDto>> GetLessonAttendanceAsync(Guid lessonId)
    {
        var attendances = await _context.Attendances
            .Include(a => a.Student)
            .Include(a => a.Lesson)
            .Where(a => a.LessonId == lessonId)
            .ToListAsync();

        return _mapper.Map<List<AttendanceDto>>(attendances);
    }

    public async Task<ApiResponse<AttendanceDto>> MarkAttendanceAsync(CreateAttendanceDto dto)
    {
        var lesson = await _context.Lessons.FirstOrDefaultAsync(l => l.Id == dto.LessonId);
        if (lesson == null) throw new NotFoundException("Dars topilmadi.");

        var student = await _context.Students.FirstOrDefaultAsync(s => s.Id == dto.StudentId);
        if (student == null) throw new NotFoundException("O'quvchi topilmadi.");

        if (student.OrganizationId != lesson.OrganizationId)
        {
            throw new ForbiddenException("O'quvchi va dars turli markazlarga tegishli.");
        }

        if (_currentUser.Role != UserRole.SuperAdmin && _currentUser.OrganizationId.HasValue && lesson.OrganizationId != _currentUser.OrganizationId.Value)
        {
            throw new ForbiddenException();
        }

        var existing = await _context.Attendances
            .Include(a => a.Student)
            .Include(a => a.Lesson)
            .FirstOrDefaultAsync(a => a.LessonId == dto.LessonId && a.StudentId == dto.StudentId);

        if (existing != null)
        {
            existing.Status = dto.Status;
            existing.Comment = dto.Comment;
            existing.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            existing = new Attendance
            {
                OrganizationId = lesson.OrganizationId,
                LessonId = dto.LessonId,
                StudentId = dto.StudentId,
                Status = dto.Status,
                Comment = dto.Comment
            };
            _context.Attendances.Add(existing);
        }

        await _context.SaveChangesAsync();

        // Trigger parent telegram alert if absent or late
        if (dto.Status == AttendanceStatus.Absent || dto.Status == AttendanceStatus.Late)
        {
            await _telegramService.SendStudentAttendanceAlertAsync(dto.StudentId, lesson.Topic ?? "Dars", dto.Status);
        }

        return ApiResponse<AttendanceDto>.Ok(_mapper.Map<AttendanceDto>(existing), "Davomat saqlandi.");
    }

    public async Task<ApiResponse<AttendanceDto>> UpdateAttendanceAsync(Guid id, UpdateAttendanceDto dto)
    {
        var attendance = await _context.Attendances
            .Include(a => a.Student)
            .Include(a => a.Lesson)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (attendance == null) throw new NotFoundException("Davomat yozuvi topilmadi.");

        if (_currentUser.Role != UserRole.SuperAdmin && _currentUser.OrganizationId.HasValue && attendance.OrganizationId != _currentUser.OrganizationId.Value)
        {
            throw new ForbiddenException();
        }

        attendance.Status = dto.Status;
        attendance.Comment = dto.Comment;
        attendance.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return ApiResponse<AttendanceDto>.Ok(_mapper.Map<AttendanceDto>(attendance));
    }

    public async Task<ApiResponse<bool>> SaveBulkAttendanceAsync(BulkAttendanceDto dto)
    {
        var lesson = await _context.Lessons.FirstOrDefaultAsync(l => l.Id == dto.LessonId);
        if (lesson == null) throw new NotFoundException("Dars topilmadi.");

        if (_currentUser.Role != UserRole.SuperAdmin && _currentUser.OrganizationId.HasValue && lesson.OrganizationId != _currentUser.OrganizationId.Value)
        {
            throw new ForbiddenException();
        }

        var existingList = await _context.Attendances
            .Where(a => a.LessonId == dto.LessonId)
            .ToListAsync();

        var studentIds = dto.Items.Select(i => i.StudentId).Distinct().ToList();
        var validStudents = await _context.Students
            .Where(s => studentIds.Contains(s.Id) && s.OrganizationId == lesson.OrganizationId)
            .Select(s => s.Id)
            .ToListAsync();
        var validStudentSet = validStudents.ToHashSet();

        foreach (var item in dto.Items)
        {
            if (!validStudentSet.Contains(item.StudentId)) continue;

            var existing = existingList.FirstOrDefault(a => a.StudentId == item.StudentId);
            if (existing != null)
            {
                existing.Status = item.Status;
                existing.Comment = item.Comment;
                existing.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                var newAtt = new Attendance
                {
                    OrganizationId = lesson.OrganizationId,
                    LessonId = dto.LessonId,
                    StudentId = item.StudentId,
                    Status = item.Status,
                    Comment = item.Comment
                };
                _context.Attendances.Add(newAtt);
            }

            // Send notification for Absent or Late students
            if (item.Status == AttendanceStatus.Absent || item.Status == AttendanceStatus.Late)
            {
                _ = Task.Run(async () =>
                {
                    try
                    {
                        await _telegramService.SendStudentAttendanceAlertAsync(item.StudentId, lesson.Topic, item.Status);
                    }
                    catch { }
                });
            }
        }

        lesson.Status = LessonStatus.Completed;
        lesson.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        await _auditLogService.LogAsync("BulkAttendance", "Lesson", lesson.Id.ToString(), $"Bulk attendance recorded for {dto.Items.Count} students");

        return ApiResponse<bool>.Ok(true, "Barcha o'quvchilar davomati muvaffaqiyatli saqlandi.");
    }
}

public class GradeService : IGradeService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditLogService _auditLogService;
    private readonly ITelegramService _telegramService;
    private readonly IMapper _mapper;

    public GradeService(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IAuditLogService auditLogService,
        ITelegramService telegramService,
        IMapper mapper)
    {
        _context = context;
        _currentUser = currentUser;
        _auditLogService = auditLogService;
        _telegramService = telegramService;
        _mapper = mapper;
    }

    public async Task<List<GradeDto>> GetStudentGradesAsync(Guid studentId)
    {
        var grades = await _context.Grades
            .Include(g => g.Student)
            .Include(g => g.Lesson).ThenInclude(l => l.Group).ThenInclude(g => g.Subject)
            .Where(g => g.StudentId == studentId)
            .OrderByDescending(g => g.CreatedAt)
            .ToListAsync();

        return _mapper.Map<List<GradeDto>>(grades);
    }

    public async Task<List<GradeDto>> GetLessonGradesAsync(Guid lessonId)
    {
        var grades = await _context.Grades
            .Include(g => g.Student)
            .Include(g => g.Lesson).ThenInclude(l => l.Group).ThenInclude(g => g.Subject)
            .Where(g => g.LessonId == lessonId)
            .ToListAsync();

        return _mapper.Map<List<GradeDto>>(grades);
    }

    public async Task<ApiResponse<GradeDto>> AddGradeAsync(CreateGradeDto dto)
    {
        if (dto.Score < 0 || dto.Score > 100)
        {
            throw new ValidationException("Baho 0 va 100 oralig'ida bo'lishi kerak.");
        }

        var lesson = await _context.Lessons.FirstOrDefaultAsync(l => l.Id == dto.LessonId);
        if (lesson == null) throw new NotFoundException("Dars topilmadi.");

        var student = await _context.Students.FirstOrDefaultAsync(s => s.Id == dto.StudentId);
        if (student == null) throw new NotFoundException("O'quvchi topilmadi.");

        if (student.OrganizationId != lesson.OrganizationId)
        {
            throw new ForbiddenException("O'quvchi va dars turli markazlarga tegishli.");
        }

        if (_currentUser.Role != UserRole.SuperAdmin && _currentUser.OrganizationId.HasValue && lesson.OrganizationId != _currentUser.OrganizationId.Value)
        {
            throw new ForbiddenException();
        }

        var existing = await _context.Grades
            .FirstOrDefaultAsync(g => g.LessonId == dto.LessonId && g.StudentId == dto.StudentId);

        if (existing != null)
        {
            existing.Score = dto.Score;
            existing.Comment = dto.Comment;
            existing.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            existing = new Grade
            {
                OrganizationId = lesson.OrganizationId,
                LessonId = dto.LessonId,
                StudentId = dto.StudentId,
                Score = dto.Score,
                Comment = dto.Comment
            };
            _context.Grades.Add(existing);
        }

        await _context.SaveChangesAsync();

        _ = Task.Run(async () =>
        {
            try { await _telegramService.SendGradeAlertAsync(existing.Id); } catch { }
        });

        return ApiResponse<GradeDto>.Ok(_mapper.Map<GradeDto>(existing), "Baho saqlandi.");
    }

    public async Task<ApiResponse<GradeDto>> UpdateGradeAsync(Guid id, UpdateGradeDto dto)
    {
        if (dto.Score < 0 || dto.Score > 100)
        {
            throw new ValidationException("Baho 0 va 100 oralig'ida bo'lishi kerak.");
        }

        var grade = await _context.Grades.FirstOrDefaultAsync(g => g.Id == id);
        if (grade == null) throw new NotFoundException("Baho topilmadi.");

        if (_currentUser.Role != UserRole.SuperAdmin && _currentUser.OrganizationId.HasValue && grade.OrganizationId != _currentUser.OrganizationId.Value)
        {
            throw new ForbiddenException();
        }

        grade.Score = dto.Score;
        grade.Comment = dto.Comment;
        grade.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return ApiResponse<GradeDto>.Ok(_mapper.Map<GradeDto>(grade), "Baho yangilandi.");
    }

    public async Task<ApiResponse<bool>> SaveBulkGradesAsync(BulkGradeDto dto)
    {
        var lesson = await _context.Lessons.FirstOrDefaultAsync(l => l.Id == dto.LessonId);
        if (lesson == null) throw new NotFoundException("Dars topilmadi.");

        if (_currentUser.Role != UserRole.SuperAdmin && _currentUser.OrganizationId.HasValue && lesson.OrganizationId != _currentUser.OrganizationId.Value)
        {
            throw new ForbiddenException();
        }

        var studentIds = dto.Items.Select(i => i.StudentId).Distinct().ToList();
        var validStudents = await _context.Students
            .Where(s => studentIds.Contains(s.Id) && s.OrganizationId == lesson.OrganizationId)
            .Select(s => s.Id)
            .ToListAsync();
        var validStudentSet = validStudents.ToHashSet();

        var existingList = await _context.Grades
            .Where(g => g.LessonId == dto.LessonId)
            .ToListAsync();

        foreach (var item in dto.Items)
        {
            if (!validStudentSet.Contains(item.StudentId)) continue;
            if (item.Score < 0 || item.Score > 100) continue;

            var existing = existingList.FirstOrDefault(g => g.StudentId == item.StudentId);
            if (existing != null)
            {
                existing.Score = item.Score;
                existing.Comment = item.Comment;
                existing.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                var newGrade = new Grade
                {
                    OrganizationId = lesson.OrganizationId,
                    LessonId = dto.LessonId,
                    StudentId = item.StudentId,
                    Score = item.Score,
                    Comment = item.Comment
                };
                _context.Grades.Add(newGrade);
            }
        }

        await _context.SaveChangesAsync();
        await _auditLogService.LogAsync("BulkGrade", "Lesson", lesson.Id.ToString(), $"Bulk grades recorded for {dto.Items.Count} students");

        return ApiResponse<bool>.Ok(true, "Baholar muvaffaqiyatli saqlandi.");
    }
}
