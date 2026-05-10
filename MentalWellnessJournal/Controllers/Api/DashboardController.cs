using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MentalWellnessJournal.Data;
using MentalWellnessJournal.Models;

namespace MentalWellnessJournal.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public DashboardController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var today = DateTime.UtcNow.Date;
            var weekAgo = today.AddDays(-7);

            var recentMoods = await _context.MoodLogs
                .Where(m => m.UserId == user.Id && m.LoggedAt >= weekAgo)
                .OrderByDescending(m => m.LoggedAt)
                .Take(7)
                .Select(m => new { m.Id, m.Mood, m.StressLevel, m.AnxietyLevel, m.Notes, m.LoggedAt })
                .ToListAsync();

            var todayMood = recentMoods.FirstOrDefault(m => m.LoggedAt.Date == today);

            var recentEntries = await _context.JournalEntries
                .Where(j => j.UserId == user.Id)
                .OrderByDescending(j => j.EntryDate)
                .Take(3)
                .Select(j => new { j.Id, j.Title, j.EntryDate, j.Tags, j.IsPrivate })
                .ToListAsync();

            var todayHabits = await _context.HabitLogs
                .Where(h => h.UserId == user.Id && h.LoggedAt.Date == today)
                .Select(h => new { h.Id, h.HabitName, h.Completed, h.DurationMinutes, h.Notes })
                .ToListAsync();

            var avgMood = recentMoods.Any() ? recentMoods.Average(m => (int)m.Mood) : 0;
            var avgStress = recentMoods.Any() ? recentMoods.Average(m => m.StressLevel) : 0;
            var moodLevel = todayMood != null ? (int)todayMood.Mood : (int)Math.Round(avgMood);
            if (moodLevel < 1) moodLevel = 3;

            var tips = await _context.WellnessTips
                .Where(t => t.MinMoodLevel <= moodLevel && t.MaxMoodLevel >= moodLevel)
                .OrderBy(t => Guid.NewGuid())
                .Take(3)
                .Select(t => new { t.Id, t.Category, t.Title, t.Content })
                .ToListAsync();

            var streak = 0;
            var checkDate = today;
            while (await _context.JournalEntries.AnyAsync(j => j.UserId == user.Id && j.EntryDate.Date == checkDate))
            {
                streak++;
                checkDate = checkDate.AddDays(-1);
            }

            return Ok(new
            {
                user = new { user.FullName, user.Email, user.Department },
                todayMood,
                recentMoods,
                recentEntries,
                todayHabits,
                suggestedTips = tips,
                journalStreakDays = streak,
                averageMoodThisWeek = Math.Round(avgMood, 1),
                averageStressThisWeek = Math.Round(avgStress, 1),
                habitsCompletedToday = todayHabits.Count(h => h.Completed)
            });
        }
    }
}
