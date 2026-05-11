using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MentalWellnessJournal.Data;
using MentalWellnessJournal.Models;

namespace MentalWellnessJournal.Controllers.Api
{
    [ApiController]
    [Route("api/journal")]
    [Authorize]
    public class JournalApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public JournalApiController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? tag, [FromQuery] string? search)
        {
            var userId = _userManager.GetUserId(User)!;
            var query = _context.JournalEntries.Where(j => j.UserId == userId);

            if (!string.IsNullOrEmpty(tag))
                query = query.Where(j => j.Tags != null && j.Tags.Contains(tag));
            if (!string.IsNullOrEmpty(search))
                query = query.Where(j => j.Title.Contains(search) || j.Content.Contains(search));

            var entries = await query
                .OrderByDescending(j => j.EntryDate)
                .Select(j => new { j.Id, j.Title, j.EntryDate, j.Tags, j.IsPrivate, preview = j.Content.Length > 150 ? j.Content.Substring(0, 150) + "..." : j.Content })
                .ToListAsync();
            return Ok(entries);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var userId = _userManager.GetUserId(User)!;
            var entry = await _context.JournalEntries.FirstOrDefaultAsync(j => j.Id == id && j.UserId == userId);
            if (entry == null) return NotFound();
            return Ok(new { entry.Id, entry.Title, entry.Content, entry.EntryDate, entry.Tags, entry.IsPrivate });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] JournalRequest req)
        {
            var entry = new JournalEntry
            {
                UserId = _userManager.GetUserId(User)!,
                Title = req.Title,
                Content = req.Content,
                Tags = req.Tags,
                IsPrivate = req.IsPrivate,
                EntryDate = DateTime.UtcNow
            };
            _context.JournalEntries.Add(entry);
            await _context.SaveChangesAsync();
            return Ok(new { entry.Id, entry.Title, entry.EntryDate });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] JournalRequest req)
        {
            var userId = _userManager.GetUserId(User)!;
            var entry = await _context.JournalEntries.FirstOrDefaultAsync(j => j.Id == id && j.UserId == userId);
            if (entry == null) return NotFound();

            entry.Title = req.Title;
            entry.Content = req.Content;
            entry.Tags = req.Tags;
            entry.IsPrivate = req.IsPrivate;
            await _context.SaveChangesAsync();
            return Ok(new { entry.Id, entry.Title, entry.EntryDate });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = _userManager.GetUserId(User)!;
            var entry = await _context.JournalEntries.FirstOrDefaultAsync(j => j.Id == id && j.UserId == userId);
            if (entry == null) return NotFound();
            _context.JournalEntries.Remove(entry);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }

    public record JournalRequest(string Title, string Content, string? Tags, bool IsPrivate);
}
