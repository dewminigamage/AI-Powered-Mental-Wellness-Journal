namespace MentalWellnessJournal.Models
{
    public class WellnessReminder
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public TimeSpan ReminderTime { get; set; }
        public bool IsActive { get; set; } = true;
        public string DaysOfWeek { get; set; } = "Mon,Tue,Wed,Thu,Fri"; // comma-separated

        public ApplicationUser User { get; set; } = null!;
    }
}
