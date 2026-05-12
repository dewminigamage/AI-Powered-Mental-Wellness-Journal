namespace MentalWellnessJournal.Models
{
    public class HabitLog
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string HabitName { get; set; } = string.Empty;
        public bool Completed { get; set; }
        public int? DurationMinutes { get; set; }
        public string? Notes { get; set; }
        public DateTime LoggedAt { get; set; } = DateTime.UtcNow;

        public ApplicationUser User { get; set; } = null!;
    }
}
