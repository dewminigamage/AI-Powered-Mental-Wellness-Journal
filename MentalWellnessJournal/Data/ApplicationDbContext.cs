using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MentalWellnessJournal.Models;

namespace MentalWellnessJournal.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<JournalEntry> JournalEntries => Set<JournalEntry>();
        public DbSet<MoodLog> MoodLogs => Set<MoodLog>();
        public DbSet<HabitLog> HabitLogs => Set<HabitLog>();
        public DbSet<WellnessReminder> WellnessReminders => Set<WellnessReminder>();
        public DbSet<WellnessTip> WellnessTips => Set<WellnessTip>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<JournalEntry>()
                .HasOne(j => j.User)
                .WithMany(u => u.JournalEntries)
                .HasForeignKey(j => j.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<MoodLog>()
                .HasOne(m => m.User)
                .WithMany(u => u.MoodLogs)
                .HasForeignKey(m => m.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<HabitLog>()
                .HasOne(h => h.User)
                .WithMany(u => u.HabitLogs)
                .HasForeignKey(h => h.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<WellnessReminder>()
                .HasOne(r => r.User)
                .WithMany(u => u.Reminders)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<WellnessTip>().HasData(
                new WellnessTip { Id = 1, Category = "stress", Title = "Try Deep Breathing", Content = "Take 5 slow deep breaths, inhaling for 4 counts and exhaling for 6. This activates your parasympathetic nervous system.", MinMoodLevel = 1, MaxMoodLevel = 3 },
                new WellnessTip { Id = 2, Category = "mood", Title = "Go for a Short Walk", Content = "Even a 10-minute walk outside can boost serotonin levels and improve your mood significantly.", MinMoodLevel = 1, MaxMoodLevel = 3 },
                new WellnessTip { Id = 3, Category = "sleep", Title = "Maintain a Sleep Schedule", Content = "Try going to bed and waking up at the same time each day, even on weekends. Consistency regulates your body clock.", MinMoodLevel = 1, MaxMoodLevel = 5 },
                new WellnessTip { Id = 4, Category = "anxiety", Title = "Practice Grounding", Content = "Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste to stay present.", MinMoodLevel = 1, MaxMoodLevel = 3 },
                new WellnessTip { Id = 5, Category = "mood", Title = "Connect with Others", Content = "Reach out to a friend or family member. Social connection is one of the strongest predictors of emotional wellbeing.", MinMoodLevel = 1, MaxMoodLevel = 5 },
                new WellnessTip { Id = 6, Category = "stress", Title = "Limit Screen Time Before Bed", Content = "Avoid screens at least 30 minutes before sleep. Blue light interferes with melatonin production.", MinMoodLevel = 1, MaxMoodLevel = 5 },
                new WellnessTip { Id = 7, Category = "mood", Title = "Celebrate Small Wins", Content = "Acknowledge your progress, no matter how small. Each step forward is worth recognizing.", MinMoodLevel = 3, MaxMoodLevel = 5 },
                new WellnessTip { Id = 8, Category = "stress", Title = "Break Tasks into Steps", Content = "Feeling overwhelmed? Write down your tasks and tackle them one at a time. Progress builds momentum.", MinMoodLevel = 1, MaxMoodLevel = 3 }
            );
        }
    }
}
