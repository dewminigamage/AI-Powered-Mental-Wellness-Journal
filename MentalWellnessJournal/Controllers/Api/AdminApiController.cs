using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MentalWellnessJournal.Data;
using MentalWellnessJournal.Models;

namespace MentalWellnessJournal.Controllers.Api
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin,Counselor")]
    public class AdminApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public AdminApiController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> Dashboard()
        {
            var weekAgo = DateTime.UtcNow.AddDays(-7);
            var allUsers = await _userManager.Users.ToListAsync();
            var studentUsers = new List<ApplicationUser>();
            foreach (var u in allUsers)
                if (await _userManager.IsInRoleAsync(u, "Student")) studentUsers.Add(u);

            var recentMoods = await _context.MoodLogs.Where(m => m.LoggedAt >= weekAgo).ToListAsync();

            var moodDist = recentMoods
                .GroupBy(m => m.Mood.ToString())
                .ToDictionary(g => g.Key, g => g.Count());

            var highStressUserIds = recentMoods.Where(m => m.StressLevel >= 8).Select(m => m.UserId).Distinct().ToList();
            var highStressUsers = studentUsers
                .Where(u => highStressUserIds.Contains(u.Id))
                .Select(u => new { name = $"{u.FullName.Split(' ')[0]}.", department = u.Department ?? "N/A" })
                .ToList();

            var activeUserIds = await _context.MoodLogs
                .Where(m => m.LoggedAt >= weekAgo).Select(m => m.UserId)
                .Union(_context.JournalEntries.Where(j => j.EntryDate >= weekAgo).Select(j => j.UserId))
                .Distinct().CountAsync();

            var recentUsers = studentUsers.OrderByDescending(u => u.CreatedAt).Take(5)
                .Select(u => new { u.Id, u.FullName, u.Email, u.Department, u.CreatedAt, u.IsActive })
                .ToList();

            return Ok(new
            {
                totalUsers = studentUsers.Count,
                activeUsersThisWeek = activeUserIds,
                totalJournalEntries = await _context.JournalEntries.CountAsync(),
                totalMoodLogs = await _context.MoodLogs.CountAsync(),
                platformAverageMood = recentMoods.Any() ? Math.Round(recentMoods.Average(m => (int)m.Mood), 1) : 0,
                platformAverageStress = recentMoods.Any() ? Math.Round(recentMoods.Average(m => m.StressLevel), 1) : 0,
                recentUsers,
                moodDistribution = moodDist,
                highStressUsers
            });
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _userManager.Users
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new { u.Id, u.FullName, u.Email, u.StudentId, u.Department, u.CreatedAt, u.IsActive })
                .ToListAsync();
            return Ok(users);
        }

        [HttpPost("toggle-user/{userId}")]
        public async Task<IActionResult> ToggleUser(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound();
            user.IsActive = !user.IsActive;
            await _userManager.UpdateAsync(user);
            return Ok(new { user.Id, user.IsActive });
        }

        [HttpGet("trends")]
        public async Task<IActionResult> Trends()
        {
            var data = await _context.MoodLogs
                .Where(m => m.LoggedAt >= DateTime.UtcNow.AddDays(-30))
                .GroupBy(m => m.LoggedAt.Date)
                .OrderBy(g => g.Key)
                .Select(g => new { date = g.Key.ToString("yyyy-MM-dd"), avgMood = g.Average(m => (int)m.Mood), avgStress = g.Average(m => m.StressLevel), count = g.Count() })
                .ToListAsync();
            return Ok(data);
        }
    }
}
