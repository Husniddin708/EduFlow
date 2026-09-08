using AutoMapper;
using EduFlow.Application.Common.Exceptions;
using EduFlow.Application.Common.Models;
using EduFlow.Application.DTOs;
using EduFlow.Application.Interfaces;
using EduFlow.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduFlow.Application.Services;

public class SubjectService : ISubjectService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public SubjectService(IApplicationDbContext context, ICurrentUserService currentUser, IMapper mapper)
    {
        _context = context;
        _currentUser = currentUser;
        _mapper = mapper;
    }

    public async Task<List<SubjectDto>> GetSubjectsAsync()
    {
        var subjects = await _context.Subjects
            .Include(s => s.Groups)
            .OrderBy(s => s.Name)
            .ToListAsync();

        return _mapper.Map<List<SubjectDto>>(subjects);
    }

    public async Task<ApiResponse<SubjectDto>> GetSubjectByIdAsync(Guid id)
    {
        var orgId = _currentUser.OrganizationId;
        var subject = await _context.Subjects
            .Include(s => s.Groups)
            .FirstOrDefaultAsync(s => s.Id == id && (!orgId.HasValue || s.OrganizationId == orgId.Value));

        if (subject == null) throw new NotFoundException("Fan topilmadi.");
        return ApiResponse<SubjectDto>.Ok(_mapper.Map<SubjectDto>(subject));
    }

    public async Task<ApiResponse<SubjectDto>> CreateSubjectAsync(CreateSubjectDto dto)
    {
        if (!_currentUser.OrganizationId.HasValue) throw new ForbiddenException();

        var subject = new Subject
        {
            OrganizationId = _currentUser.OrganizationId.Value,
            Name = dto.Name.Trim()
        };
        _context.Subjects.Add(subject);
        await _context.SaveChangesAsync();

        return ApiResponse<SubjectDto>.Ok(_mapper.Map<SubjectDto>(subject), "Fan muvaffaqiyatli yaratildi.");
    }

    public async Task<ApiResponse<SubjectDto>> UpdateSubjectAsync(Guid id, UpdateSubjectDto dto)
    {
        var orgId = _currentUser.OrganizationId;
        var isSuperAdmin = _currentUser.Role == EduFlow.Domain.Enums.UserRole.SuperAdmin;
        if (!orgId.HasValue && !isSuperAdmin) throw new ForbiddenException();

        var subject = await _context.Subjects
            .FirstOrDefaultAsync(s => s.Id == id && (isSuperAdmin || (orgId.HasValue && s.OrganizationId == orgId.Value)));
        if (subject == null) throw new NotFoundException("Fan topilmadi.");

        subject.Name = dto.Name.Trim();
        subject.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return ApiResponse<SubjectDto>.Ok(_mapper.Map<SubjectDto>(subject), "Fan nomi yangilandi.");
    }

    public async Task<ApiResponse<bool>> DeleteSubjectAsync(Guid id)
    {
        var orgId = _currentUser.OrganizationId;
        var isSuperAdmin = _currentUser.Role == EduFlow.Domain.Enums.UserRole.SuperAdmin;
        if (!orgId.HasValue && !isSuperAdmin) throw new ForbiddenException();

        var subject = await _context.Subjects
            .FirstOrDefaultAsync(s => s.Id == id && (isSuperAdmin || (orgId.HasValue && s.OrganizationId == orgId.Value)));
        if (subject == null) throw new NotFoundException("Fan topilmadi.");

        // Unlink any groups referencing this subject
        var groups = await _context.Groups.Where(g => g.SubjectId == id).ToListAsync();
        foreach (var group in groups)
        {
            group.SubjectId = null;
        }

        _context.Subjects.Remove(subject);
        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Fan o'chirildi.");
    }
}

public class GroupService : IGroupService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly ISubscriptionService _subscriptionService;
    private readonly IMapper _mapper;

    public GroupService(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        ISubscriptionService subscriptionService,
        IMapper mapper)
    {
        _context = context;
        _currentUser = currentUser;
        _subscriptionService = subscriptionService;
        _mapper = mapper;
    }

    public async Task<PagedResult<GroupDto>> GetGroupsAsync(string? search, Guid? subjectId, bool? isActive, int page = 1, int pageSize = 20)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _context.Groups
            .Include(g => g.Teacher)
            .Include(g => g.Subject)
            .Include(g => g.GroupStudents)
            .AsQueryable();

        if (isActive.HasValue) query = query.Where(g => g.IsActive == isActive.Value);
        if (subjectId.HasValue) query = query.Where(g => g.SubjectId == subjectId.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(g => g.Name.ToLower().Contains(s) || (g.Teacher != null && g.Teacher.FullName.ToLower().Contains(s)));
        }

        var totalCount = await query.CountAsync();
        var groups = await query
            .OrderByDescending(g => g.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<GroupDto>(_mapper.Map<List<GroupDto>>(groups), totalCount, page, pageSize);
    }

    public async Task<ApiResponse<GroupDetailDto>> GetGroupByIdAsync(Guid id)
    {
        var orgId = _currentUser.OrganizationId;
        var group = await _context.Groups
            .Include(g => g.Teacher)
            .Include(g => g.Subject)
            .Include(g => g.GroupStudents).ThenInclude(gs => gs.Student)
            .Include(g => g.Lessons)
            .FirstOrDefaultAsync(g => g.Id == id && (!orgId.HasValue || g.OrganizationId == orgId.Value));

        if (group == null) throw new NotFoundException("Guruh topilmadi.");

        var students = _mapper.Map<List<StudentDto>>(group.GroupStudents.Select(gs => gs.Student).ToList());
        var lessons = _mapper.Map<List<LessonDto>>(group.Lessons.OrderByDescending(l => l.StartTime).Take(20).ToList());

        var detailDto = new GroupDetailDto(
            group.Id,
            group.OrganizationId,
            group.Name,
            group.TeacherId,
            group.Teacher?.FullName,
            group.SubjectId,
            group.Subject?.Name,
            group.MonthlyFee,
            group.MaxStudents,
            group.ScheduleDescription,
            group.Room,
            group.IsActive,
            students,
            lessons
        );

        return ApiResponse<GroupDetailDto>.Ok(detailDto);
    }

    public async Task<ApiResponse<GroupDto>> CreateGroupAsync(CreateGroupDto dto)
    {
        await _subscriptionService.ValidatePlanLimitAsync("group");

        if (!_currentUser.OrganizationId.HasValue) throw new ForbiddenException();
        var orgId = _currentUser.OrganizationId.Value;

        if (dto.TeacherId.HasValue)
        {
            var teacherExists = await _context.Teachers.AnyAsync(t => t.Id == dto.TeacherId.Value && t.OrganizationId == orgId);
            if (!teacherExists) throw new ValidationException("Tanlangan o'qituvchi topilmadi.");
        }

        if (dto.SubjectId.HasValue)
        {
            var subjectExists = await _context.Subjects.AnyAsync(s => s.Id == dto.SubjectId.Value && s.OrganizationId == orgId);
            if (!subjectExists) throw new ValidationException("Tanlangan fan topilmadi.");
        }

        var group = new Group
        {
            OrganizationId = orgId,
            Name = dto.Name.Trim(),
            TeacherId = dto.TeacherId,
            SubjectId = dto.SubjectId,
            MonthlyFee = dto.MonthlyFee,
            MaxStudents = dto.MaxStudents > 0 ? dto.MaxStudents : 15,
            ScheduleDescription = dto.ScheduleDescription,
            Room = dto.Room,
            IsActive = true
        };
        _context.Groups.Add(group);
        await _context.SaveChangesAsync();

        return await GetGroupDtoByIdAsync(group.Id);
    }

    public async Task<ApiResponse<GroupDto>> UpdateGroupAsync(Guid id, UpdateGroupDto dto)
    {
        var orgId = _currentUser.OrganizationId;
        if (!orgId.HasValue) throw new ForbiddenException();

        var group = await _context.Groups.FirstOrDefaultAsync(g => g.Id == id && g.OrganizationId == orgId.Value);
        if (group == null) throw new NotFoundException("Guruh topilmadi.");

        if (dto.TeacherId.HasValue)
        {
            var teacherExists = await _context.Teachers.AnyAsync(t => t.Id == dto.TeacherId.Value && t.OrganizationId == orgId.Value);
            if (!teacherExists) throw new ValidationException("Tanlangan o'qituvchi topilmadi.");
        }

        if (dto.SubjectId.HasValue)
        {
            var subjectExists = await _context.Subjects.AnyAsync(s => s.Id == dto.SubjectId.Value && s.OrganizationId == orgId.Value);
            if (!subjectExists) throw new ValidationException("Tanlangan fan topilmadi.");
        }

        group.Name = dto.Name.Trim();
        group.TeacherId = dto.TeacherId;
        group.SubjectId = dto.SubjectId;
        group.MonthlyFee = dto.MonthlyFee;
        group.MaxStudents = dto.MaxStudents;
        group.ScheduleDescription = dto.ScheduleDescription;
        group.Room = dto.Room;
        group.IsActive = dto.IsActive;
        group.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetGroupDtoByIdAsync(group.Id);
    }

    public async Task<ApiResponse<bool>> DeleteGroupAsync(Guid id)
    {
        var orgId = _currentUser.OrganizationId;
        if (!orgId.HasValue) throw new ForbiddenException();

        var group = await _context.Groups.FirstOrDefaultAsync(g => g.Id == id && g.OrganizationId == orgId.Value);
        if (group == null) throw new NotFoundException("Guruh topilmadi.");

        group.IsActive = false;
        group.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Guruh o'chirildi.");
    }

    public async Task<ApiResponse<bool>> AddStudentToGroupAsync(Guid groupId, Guid studentId)
    {
        var orgId = _currentUser.OrganizationId;
        if (!orgId.HasValue) throw new ForbiddenException();

        var group = await _context.Groups.Include(g => g.GroupStudents).FirstOrDefaultAsync(g => g.Id == groupId && g.OrganizationId == orgId.Value);
        if (group == null) throw new NotFoundException("Guruh topilmadi.");

        var student = await _context.Students.FirstOrDefaultAsync(s => s.Id == studentId && s.OrganizationId == orgId.Value);
        if (student == null) throw new NotFoundException("O'quvchi topilmadi.");

        if (group.GroupStudents.Any(gs => gs.StudentId == studentId))
        {
            return ApiResponse<bool>.Ok(true, "O'quvchi allaqachon ushbu guruhda.");
        }

        if (group.GroupStudents.Count >= group.MaxStudents)
        {
            throw new ValidationException($"Guruh maksimal sig'imiga ({group.MaxStudents} nafar) yetgan.");
        }

        _context.GroupStudents.Add(new GroupStudent
        {
            GroupId = groupId,
            StudentId = studentId,
            JoinedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
        return ApiResponse<bool>.Ok(true, "O'quvchi guruhga qo'shildi.");
    }

    public async Task<ApiResponse<bool>> RemoveStudentFromGroupAsync(Guid groupId, Guid studentId)
    {
        var orgId = _currentUser.OrganizationId;
        if (!orgId.HasValue) throw new ForbiddenException();

        var group = await _context.Groups.FirstOrDefaultAsync(g => g.Id == groupId && g.OrganizationId == orgId.Value);
        if (group == null) throw new NotFoundException("Guruh topilmadi.");

        var record = await _context.GroupStudents.FirstOrDefaultAsync(gs => gs.GroupId == groupId && gs.StudentId == studentId);
        if (record != null)
        {
            _context.GroupStudents.Remove(record);
            await _context.SaveChangesAsync();
        }
        return ApiResponse<bool>.Ok(true, "O'quvchi guruhdan chiqarildi.");
    }

    public async Task<List<StudentDto>> GetGroupStudentsAsync(Guid groupId)
    {
        var orgId = _currentUser.OrganizationId;
        var students = await _context.GroupStudents
            .Where(gs => gs.GroupId == groupId && (!orgId.HasValue || gs.Group.OrganizationId == orgId.Value))
            .Include(gs => gs.Student).ThenInclude(s => s.Parent)
            .Include(gs => gs.Student).ThenInclude(s => s.Attendances)
            .Include(gs => gs.Student).ThenInclude(s => s.Grades)
            .Include(gs => gs.Student).ThenInclude(s => s.Payments)
            .Select(gs => gs.Student)
            .ToListAsync();

        return _mapper.Map<List<StudentDto>>(students);
    }

    private async Task<ApiResponse<GroupDto>> GetGroupDtoByIdAsync(Guid id)
    {
        var group = await _context.Groups
            .Include(g => g.Teacher)
            .Include(g => g.Subject)
            .Include(g => g.GroupStudents)
            .FirstOrDefaultAsync(g => g.Id == id);

        return ApiResponse<GroupDto>.Ok(_mapper.Map<GroupDto>(group!));
    }
}
