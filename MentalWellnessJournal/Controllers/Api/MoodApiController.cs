using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MentalWellnessJournal.Data;
using MentalWellnessJournal.Models;

namespace MentalWellnessJournal.Controllers.Api
{
    [ApiController]
    [Route("api/mood")]
    [Authorize]
    public class MoodApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public MoodApiController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetRecent()
        {
            var userId = _userManager.GetUserId(User)!;
            var logs = await _context.MoodLogs
                .Where(m => m.UserId == userId)
                .OrderByDescending(m => m.LoggedAt)
                .Take(30)
                .Select(m => new { m.Id, m.Mood, m.StressLevel, m.AnxietyLevel, m.Notes, m.LoggedAt })
                .ToListAsync();
            return Ok(logs);
        }

        [HttpPost]
        public async Task<IActionResult> Log([FromBody] MoodLogRequest req)
        {
            var userId = _userManager.GetUserId(User)!;
            var log = new MoodLog
            {
                UserId = userId,
                Mood = (MoodLevel)req.Mood,
                StressLevel = req.StressLevel,
                AnxietyLevel = req.AnxietyLevel,
                Notes = req.Notes,
                LoggedAt = DateTime.UtcNow
            };
            _context.MoodLogs.Add(log);
            await _context.SaveChangesAsync();
            return Ok(new { log.Id, log.Mood, log.StressLevel, log.AnxietyLevel, log.Notes, log.LoggedAt });
        }

        [HttpGet("history")]
        public async Task<IActionResult> History()
        {
            var userId = _userManager.GetUserId(User)!;
            var logs = await _context.MoodLogs
                .Where(m => m.UserId == userId)
                .OrderByDescending(m => m.LoggedAt)
                .Select(m => new { m.Id, m.Mood, m.StressLevel, m.AnxietyLevel, m.Notes, m.LoggedAt })
                .ToListAsync();
            return Ok(logs);
        }

        [HttpGet("chart-data")]
        public async Task<IActionResult> ChartData()
        {
            var userId = _userManager.GetUserId(User)!;
            var logs = await _context.MoodLogs
                .Where(m => m.UserId == userId && m.LoggedAt >= DateTime.UtcNow.AddDays(-30))
                .OrderBy(m => m.LoggedAt)
                .Select(m => new { date = m.LoggedAt.ToString("yyyy-MM-dd"), mood = (int)m.Mood, stress = m.StressLevel, anxiety = m.AnxietyLevel })
                .ToListAsync();
            return Ok(logs);
        }
    }

    public record MoodLogRequest(int Mood, int StressLevel, int AnxietyLevel, string? Notes);
}
