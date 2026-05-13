using Microsoft.AspNetCore.Identity;

namespace MentalWellnessJournal.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string FullName { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public string? StudentId { get; set; }
        public string? Department { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;

        public ICollection<JournalEntry> JournalEntries { get; set; } = new List<JournalEntry>();
        public ICollection<MoodLog> MoodLogs { get; set; } = new List<MoodLog>();
        public ICollection<HabitLog> HabitLogs { get; set; } = new List<HabitLog>();
        public ICollection<WellnessReminder> Reminders { get; set; } = new List<WellnessReminder>();
    }
}
