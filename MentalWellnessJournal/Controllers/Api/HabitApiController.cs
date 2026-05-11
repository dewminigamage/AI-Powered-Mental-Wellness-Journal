using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MentalWellnessJournal.Data;
using MentalWellnessJournal.Models;

namespace MentalWellnessJournal.Controllers.Api
{
    [ApiController]
    [Route("api/habit")]
    [Authorize]
    public class HabitApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public HabitApiController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetToday()
        {
            var userId = _userManager.GetUserId(User)!;
            var today = DateTime.UtcNow.Date;
            var logs = await _context.HabitLogs
                .Where(h => h.UserId == userId && h.LoggedAt.Date == today)
                .Select(h => new { h.Id, h.HabitName, h.Completed, h.DurationMinutes, h.Notes, h.LoggedAt })
                .ToListAsync();
            return Ok(logs);
        }

        [HttpPost]
        public async Task<IActionResult> Log([FromBody] HabitRequest req)
        {
            var log = new HabitLog
            {
                UserId = _userManager.GetUserId(User)!,
                HabitName = req.HabitName,
                Completed = req.Completed,
                DurationMinutes = req.DurationMinutes,
                Notes = req.Notes,
                LoggedAt = DateTime.UtcNow
            };
            _context.HabitLogs.Add(log);
            await _context.SaveChangesAsync();
            return Ok(new { log.Id, log.HabitName, log.Completed, log.DurationMinutes, log.Notes, log.LoggedAt });
        }

        [HttpGet("history")]
        public async Task<IActionResult> History()
        {
            var userId = _userManager.GetUserId(User)!;
            var logs = await _context.HabitLogs
                .Where(h => h.UserId == userId)
                .OrderByDescending(h => h.LoggedAt)
                .Select(h => new { h.Id, h.HabitName, h.Completed, h.DurationMinutes, h.Notes, h.LoggedAt })
                .ToListAsync();
            return Ok(logs);
        }

        [HttpGet("weekly-stats")]
        public async Task<IActionResult> WeeklyStats()
        {
            var userId = _userManager.GetUserId(User)!;
            var weekAgo = DateTime.UtcNow.AddDays(-7).Date;
            var stats = await _context.HabitLogs
                .Where(h => h.UserId == userId && h.LoggedAt.Date >= weekAgo)
                .GroupBy(h => h.HabitName)
                .Select(g => new { habit = g.Key, completed = g.Count(h => h.Completed), total = g.Count() })
                .ToListAsync();
            return Ok(stats);
        }
    }

    public record HabitRequest(string HabitName, bool Completed, int? DurationMinutes, string? Notes);
}
