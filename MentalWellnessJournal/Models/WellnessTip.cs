namespace MentalWellnessJournal.Models
{
    public class WellnessTip
    {
        public int Id { get; set; }
        public string Category { get; set; } = string.Empty; // stress, anxiety, mood, sleep, etc.
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public int MinMoodLevel { get; set; } = 1;
        public int MaxMoodLevel { get; set; } = 5;
    }
}
