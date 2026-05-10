using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MentalWellnessJournal.Data;
using MentalWellnessJournal.Models;

namespace MentalWellnessJournal.Controllers.Api
{
    [ApiController]
    [Route("api/reminder")]
    [Authorize]
    public class ReminderApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public ReminderApiController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userId = _userManager.GetUserId(User)!;
            var reminders = await _context.WellnessReminders
                .Where(r => r.UserId == userId)
                .OrderBy(r => r.ReminderTime)
                .Select(r => new { r.Id, r.Title, r.Message, r.ReminderTime, r.IsActive, r.DaysOfWeek })
                .ToListAsync();
            return Ok(reminders);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ReminderRequest req)
        {
            if (!TimeSpan.TryParse(req.ReminderTime, out var time))
                return BadRequest(new { message = "Invalid time format." });

            var reminder = new WellnessReminder
            {
                UserId = _userManager.GetUserId(User)!,
                Title = req.Title,
                Message = req.Message,
                ReminderTime = time,
                DaysOfWeek = req.DaysOfWeek,
                IsActive = true
            };
            _context.WellnessReminders.Add(reminder);
            await _context.SaveChangesAsync();
            return Ok(new { reminder.Id, reminder.Title, reminder.Message, reminder.ReminderTime, reminder.IsActive, reminder.DaysOfWeek });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ReminderRequest req)
        {
            var userId = _userManager.GetUserId(User)!;
            var reminder = await _context.WellnessReminders.FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);
            if (reminder == null) return NotFound();

            if (!TimeSpan.TryParse(req.ReminderTime, out var time))
                return BadRequest(new { message = "Invalid time format." });

            reminder.Title = req.Title;
            reminder.Message = req.Message;
            reminder.ReminderTime = time;
            reminder.DaysOfWeek = req.DaysOfWeek;
            await _context.SaveChangesAsync();
            return Ok(new { reminder.Id, reminder.Title, reminder.Message, reminder.ReminderTime, reminder.IsActive, reminder.DaysOfWeek });
        }

        [HttpPatch("{id}/toggle")]
        public async Task<IActionResult> Toggle(int id)
        {
            var userId = _userManager.GetUserId(User)!;
            var reminder = await _context.WellnessReminders.FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);
            if (reminder == null) return NotFound();
            reminder.IsActive = !reminder.IsActive;
            await _context.SaveChangesAsync();
            return Ok(new { reminder.Id, reminder.IsActive });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = _userManager.GetUserId(User)!;
            var reminder = await _context.WellnessReminders.FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);
            if (reminder == null) return NotFound();
            _context.WellnessReminders.Remove(reminder);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }

    public record ReminderRequest(string Title, string Message, string ReminderTime, string DaysOfWeek);
}
