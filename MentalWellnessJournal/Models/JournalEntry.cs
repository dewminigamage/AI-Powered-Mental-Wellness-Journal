namespace MentalWellnessJournal.Models
{
    public class JournalEntry
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime EntryDate { get; set; } = DateTime.UtcNow;
        public string? Tags { get; set; }
        public bool IsPrivate { get; set; } = true;

        public ApplicationUser User { get; set; } = null!;
    }
}
