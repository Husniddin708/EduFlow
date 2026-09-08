using System.Security.Claims;
using AutoMapper;
using EduFlow.Application.Common.Exceptions;
using EduFlow.Application.Common.Models;
using EduFlow.Application.DTOs;
using EduFlow.Application.Interfaces;
using EduFlow.Domain.Entities;
using EduFlow.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace EduFlow.Application.Services;

public class AuthService : IAuthService
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtTokenGenerator _jwtGenerator;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;
    private readonly IAuditLogService _auditLogService;

    public AuthService(
        IApplicationDbContext context,
        IJwtTokenGenerator jwtGenerator,
        ICurrentUserService currentUser,
        IMapper mapper,
        IAuditLogService auditLogService)
    {
        _context = context;
        _jwtGenerator = jwtGenerator;
        _currentUser = currentUser;
        _mapper = mapper;
        _auditLogService = auditLogService;
    }

    public async Task<ApiResponse<AuthResponseDto>> RegisterAsync(RegisterDto dto)
    {
        // Check if user email already exists
        if (await _context.Users.IgnoreQueryFilters().AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower()))
        {
            throw new ValidationException("Ushbu email manziliga ega foydalanuvchi allaqachon mavjud.");
        }

        // 1. Create Organization
        var organization = new Organization
        {
            Name = dto.OrganizationName.Trim(),
            Phone = dto.PhoneNumber.Trim(),
            Email = dto.Email.Trim().ToLower(),
            Address = dto.Address ?? "Toshkent shahri",
            IsActive = true
        };
        _context.Organizations.Add(organization);

        var initialRefreshToken = _jwtGenerator.GenerateRefreshToken();

        // 2. Create CenterAdmin User
        var user = new User
        {
            OrganizationId = organization.Id,
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            Email = dto.Email.Trim().ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            PhoneNumber = dto.PhoneNumber.Trim(),
            Role = UserRole.CenterAdmin,
            IsActive = true,
            RefreshToken = initialRefreshToken,
            RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7)
        };
        _context.Users.Add(user);

        // 3. Find or Create Default Trial Plan and Subscription
        var trialPlan = await _context.SubscriptionPlans.IgnoreQueryFilters().FirstOrDefaultAsync(p => p.Name == "TRIAL" || p.Name == "FREE");
        if (trialPlan == null)
        {
            trialPlan = new SubscriptionPlan
            {
                Name = "TRIAL",
                MonthlyPrice = 0,
                MaxStudents = 50,
                MaxTeachers = 5,
                MaxGroups = 10,
                HasTelegram = true,
                HasReports = true,
                HasAdvancedAnalytics = true
            };
            _context.SubscriptionPlans.Add(trialPlan);
        }

        var subscription = new Subscription
        {
            OrganizationId = organization.Id,
            SubscriptionPlanId = trialPlan.Id,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(30),
            Status = SubscriptionStatus.Trial,
            AutoRenew = true
        };
        _context.Subscriptions.Add(subscription);

        await _context.SaveChangesAsync();

        var token = _jwtGenerator.GenerateToken(user);

        await _auditLogService.LogAsync(
            action: "REGISTER",
            resource: "User",
            resourceId: user.Id.ToString(),
            details: $"Tashkilot '{organization.Name}' va administrator '{user.Email}' muvaffaqiyatli ro'yxatdan o'tdi.",
            organizationId: organization.Id,
            userId: user.Id,
            userEmail: user.Email
        );

        var userDto = _mapper.Map<UserDto>(user);
        var orgDto = _mapper.Map<OrganizationDto>(organization);

        return ApiResponse<AuthResponseDto>.Ok(new AuthResponseDto(token, initialRefreshToken, userDto, orgDto), "Muvaffaqiyatli ro'yxatdan o'tildi!");
    }

    public async Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginDto dto)
    {
        var email = dto.Email.Trim().ToLower();
        var user = await _context.Users
            .IgnoreQueryFilters()
            .Include(u => u.Organization)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            await _auditLogService.LogAsync(
                action: "LOGIN_FAILED",
                resource: "User",
                resourceId: null,
                details: $"Noto'g'ri email yoki parol kiritildi: {email}",
                organizationId: user?.OrganizationId,
                userId: user?.Id,
                userEmail: email
            );

            throw new ValidationException("Email yoki parol noto'g'ri kiritildi.");
        }

        // Active checks
        if (!user.IsActive || (user.Role != UserRole.SuperAdmin && !user.Organization.IsActive))
        {
            await _auditLogService.LogAsync(
                action: "LOGIN_BLOCKED",
                resource: "User",
                resourceId: user.Id.ToString(),
                details: "Nofaol hisob yoki nofaol markaz orqali kirish bloklandi.",
                organizationId: user.OrganizationId,
                userId: user.Id,
                userEmail: user.Email
            );

            throw new ForbiddenException("Hisobingiz yoki o'quv markazingiz faol emas. Administratorga murojaat qiling.");
        }

        var token = _jwtGenerator.GenerateToken(user);
        var refreshToken = _jwtGenerator.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync(
            action: "LOGIN_SUCCESS",
            resource: "User",
            resourceId: user.Id.ToString(),
            details: $"Foydalanuvchi tizimga kirdi (Role: {user.Role}).",
            organizationId: user.OrganizationId,
            userId: user.Id,
            userEmail: user.Email
        );

        var userDto = _mapper.Map<UserDto>(user);
        var orgDto = _mapper.Map<OrganizationDto>(user.Organization);

        return ApiResponse<AuthResponseDto>.Ok(new AuthResponseDto(token, refreshToken, userDto, orgDto), "Tizimga muvaffaqiyatli kirildi!");
    }

    public async Task<ApiResponse<AuthResponseDto>> RefreshTokenAsync(RefreshTokenDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Token) || string.IsNullOrWhiteSpace(dto.RefreshToken))
        {
            throw new ValidationException("Token yoki RefreshToken taqdim etilmadi.");
        }

        var principal = _jwtGenerator.GetPrincipalFromExpiredToken(dto.Token);
        if (principal == null)
        {
            throw new ValidationException("Yaroqsiz token formati.");
        }

        var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            throw new ValidationException("Token ichidan foydalanuvchi identifikatori topilmadi.");
        }

        var user = await _context.Users
            .IgnoreQueryFilters()
            .Include(u => u.Organization)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null || user.RefreshToken != dto.RefreshToken || !user.RefreshTokenExpiryTime.HasValue || user.RefreshTokenExpiryTime.Value <= DateTime.UtcNow)
        {
            await _auditLogService.LogAsync(
                action: "TOKEN_REFRESH_FAILED",
                resource: "User",
                resourceId: userId.ToString(),
                details: "Yaroqsiz yoki muddati o'tgan refresh token orqali yangilash urinishi.",
                organizationId: user?.OrganizationId,
                userId: user?.Id,
                userEmail: user?.Email
            );

            throw new ValidationException("Yaroqsiz yoki muddati o'tgan refresh token.");
        }

        if (!user.IsActive || (user.Role != UserRole.SuperAdmin && !user.Organization.IsActive))
        {
            throw new ForbiddenException("Hisobingiz yoki o'quv markazingiz faol emas.");
        }

        // Rotate tokens
        var newAccessToken = _jwtGenerator.GenerateToken(user);
        var newRefreshToken = _jwtGenerator.GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync(
            action: "TOKEN_REFRESH_SUCCESS",
            resource: "User",
            resourceId: user.Id.ToString(),
            details: "Tokenlar muvaffaqiyatli yangilandi va rotatsiya qilindi.",
            organizationId: user.OrganizationId,
            userId: user.Id,
            userEmail: user.Email
        );

        var userDto = _mapper.Map<UserDto>(user);
        var orgDto = _mapper.Map<OrganizationDto>(user.Organization);

        return ApiResponse<AuthResponseDto>.Ok(new AuthResponseDto(newAccessToken, newRefreshToken, userDto, orgDto), "Token yangilandi.");
    }

    public async Task<ApiResponse<bool>> RevokeTokenAsync(RevokeTokenDto dto)
    {
        var userId = _currentUser.UserId;
        if (!userId.HasValue)
        {
            throw new ForbiddenException();
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId.Value);
        if (user != null)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            await _context.SaveChangesAsync();

            await _auditLogService.LogAsync(
                action: "TOKEN_REVOKED",
                resource: "User",
                resourceId: user.Id.ToString(),
                details: "Foydalanuvchining refresh tokeni bekor qilindi.",
                organizationId: user.OrganizationId,
                userId: user.Id,
                userEmail: user.Email
            );
        }

        return ApiResponse<bool>.Ok(true, "Token bekor qilindi.");
    }

    public async Task<ApiResponse<bool>> LogoutAsync()
    {
        var userId = _currentUser.UserId;
        if (userId.HasValue)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId.Value);
            if (user != null)
            {
                user.RefreshToken = null;
                user.RefreshTokenExpiryTime = null;
                await _context.SaveChangesAsync();

                await _auditLogService.LogAsync(
                    action: "LOGOUT",
                    resource: "User",
                    resourceId: user.Id.ToString(),
                    details: "Foydalanuvchi tizimdan chiqdi.",
                    organizationId: user.OrganizationId,
                    userId: user.Id,
                    userEmail: user.Email
                );
            }
        }

        return ApiResponse<bool>.Ok(true, "Tizimdan muvaffaqiyatli chiqildi.");
    }

    public async Task<ApiResponse<UserDto>> GetCurrentUserProfileAsync()
    {
        if (!_currentUser.UserId.HasValue)
        {
            throw new ForbiddenException();
        }

        var user = await _context.Users
            .Include(u => u.Organization)
            .FirstOrDefaultAsync(u => u.Id == _currentUser.UserId.Value);

        if (user == null)
        {
            throw new NotFoundException("Foydalanuvchi topilmadi.");
        }

        return ApiResponse<UserDto>.Ok(_mapper.Map<UserDto>(user));
    }
}
