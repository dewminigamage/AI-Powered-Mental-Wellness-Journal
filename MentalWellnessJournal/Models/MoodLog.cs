namespace MentalWellnessJournal.Models
{
    public enum MoodLevel
    {
        VerySad = 1,
        Sad = 2,
        Neutral = 3,
        Happy = 4,
        VeryHappy = 5
    }

    public class MoodLog
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public MoodLevel Mood { get; set; }
        public int StressLevel { get; set; } // 1-10
        public int AnxietyLevel { get; set; } // 1-10
        public string? Notes { get; set; }
        public DateTime LoggedAt { get; set; } = DateTime.UtcNow;

        public ApplicationUser User { get; set; } = null!;
    }
}
