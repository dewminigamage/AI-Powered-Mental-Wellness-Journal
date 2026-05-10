using Microsoft.AspNetCore.Identity;
using MentalWellnessJournal.Models;

namespace MentalWellnessJournal.Data
{
    public static class SampleDataSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            if (context.MoodLogs.Any()) return; // already seeded

            var students = new[]
            {
                new { FullName = "Asel Perera",      Email = "asel@student.edu",   StudentId = "S1001", Department = "Computer Science",    Dob = new DateTime(2002, 3, 14), Password = "Student@123" },
                new { FullName = "Dineth Silva",      Email = "dineth@student.edu", StudentId = "S1002", Department = "Business Management", Dob = new DateTime(2001, 7, 22), Password = "Student@123" },
                new { FullName = "Kavya Fernando",   Email = "kavya@student.edu",  StudentId = "S1003", Department = "Psychology",          Dob = new DateTime(2003, 1, 5),  Password = "Student@123" },
                new { FullName = "Ruwan Jayasinghe", Email = "ruwan@student.edu",  StudentId = "S1004", Department = "Engineering",         Dob = new DateTime(2002, 9, 18), Password = "Student@123" },
                new { FullName = "Nimasha Bandara",  Email = "nimasha@student.edu",StudentId = "S1005", Department = "Medicine",            Dob = new DateTime(2001, 11, 30),Password = "Student@123" },
                new { FullName = "Tharindu Wijesinghe", Email = "tharindu@student.edu", StudentId = "S1006", Department = "Law",           Dob = new DateTime(2002, 5, 9),  Password = "Student@123" },
                new { FullName = "Sanduni Rathnayake",  Email = "sanduni@student.edu",  StudentId = "S1007", Department = "Arts",           Dob = new DateTime(2003, 8, 21), Password = "Student@123" },
            };

            var createdUsers = new List<ApplicationUser>();

            foreach (var s in students)
            {
                if (await userManager.FindByEmailAsync(s.Email) != null) continue;

                var user = new ApplicationUser
                {
                    FullName = s.FullName,
                    Email = s.Email,
                    UserName = s.Email,
                    StudentId = s.StudentId,
                    Department = s.Department,
                    DateOfBirth = s.Dob,
                    CreatedAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(20, 45)),
                    IsActive = true
                };
                var result = await userManager.CreateAsync(user, s.Password);
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(user, "Student");
                    createdUsers.Add(user);
                }
            }

            if (!createdUsers.Any()) return;

            var now = DateTime.UtcNow;

            // --- MOOD LOGS (last 30 days per user, with realistic weekly patterns) ---
            var moodData = new List<MoodLog>();
            // Mood profiles per user: (base mood, stress tendency)
            var moodProfiles = new[]
            {
                (baseMood: 3.5, stressTend: 6),  // Asel - generally positive, moderate stress
                (baseMood: 2.8, stressTend: 7),  // Dineth - more stressed
                (baseMood: 4.0, stressTend: 4),  // Kavya - happier, lower stress
                (baseMood: 3.0, stressTend: 8),  // Ruwan - high stress engineering
                (baseMood: 3.2, stressTend: 7),  // Nimasha - medical pressure
                (baseMood: 3.8, stressTend: 5),  // Tharindu - steady
                (baseMood: 4.2, stressTend: 3),  // Sanduni - generally happy
            };

            for (int u = 0; u < createdUsers.Count; u++)
            {
                var user = createdUsers[u];
                var (baseMood, stressTend) = moodProfiles[u % moodProfiles.Length];

                for (int day = 29; day >= 0; day--)
                {
                    var date = now.AddDays(-day).Date;
                    // Skip some days (realistic — not every day logged)
                    if (day > 3 && Random.Shared.Next(0, 5) == 0) continue;

                    var logTime = date.AddHours(Random.Shared.Next(7, 23));

                    // Weekends are slightly better mood
                    bool isWeekend = date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday;
                    double moodVariance = (Random.Shared.NextDouble() * 2 - 1) + (isWeekend ? 0.5 : 0);
                    int moodInt = Math.Clamp((int)Math.Round(baseMood + moodVariance), 1, 5);

                    // Stress peaks mid-week
                    bool isMidWeek = date.DayOfWeek == DayOfWeek.Tuesday || date.DayOfWeek == DayOfWeek.Wednesday || date.DayOfWeek == DayOfWeek.Thursday;
                    int stress = Math.Clamp(stressTend + Random.Shared.Next(-3, 4) + (isMidWeek ? 1 : 0) - (isWeekend ? 2 : 0), 1, 10);
                    int anxiety = Math.Clamp(stress + Random.Shared.Next(-2, 3), 1, 10);

                    moodData.Add(new MoodLog
                    {
                        UserId = user.Id,
                        Mood = (MoodLevel)moodInt,
                        StressLevel = stress,
                        AnxietyLevel = anxiety,
                        Notes = GetMoodNote((MoodLevel)moodInt, stress),
                        LoggedAt = logTime
                    });
                }
            }
            context.MoodLogs.AddRange(moodData);

            // --- JOURNAL ENTRIES (rich, per user) ---
            var journals = new List<JournalEntry>
            {
                // Asel - Computer Science
                new() { UserId = createdUsers[0].Id, Title = "First week of semester", Content = "Started the new semester today. Feeling a mix of excitement and nervousness. The computer science workload looks intense but I'm ready to push through. Met some new classmates in the algorithms class.", Tags = "semester,excited,goals", IsPrivate = true, EntryDate = now.AddDays(-28) },
                new() { UserId = createdUsers[0].Id, Title = "Struggling with assignments", Content = "Had three assignments due this week and barely slept. I know I need to manage my time better. The stress is getting to me but I submitted everything on time. Proud of that at least.", Tags = "stress,study,proud", IsPrivate = true, EntryDate = now.AddDays(-24) },
                new() { UserId = createdUsers[0].Id, Title = "Had a great study session", Content = "Finally cracked the concept I've been struggling with for days! Spent 3 hours at the library with my study group and everything clicked. Feeling really accomplished.", Tags = "study,happy,breakthrough", IsPrivate = true, EntryDate = now.AddDays(-20) },
                new() { UserId = createdUsers[0].Id, Title = "Went for a morning run", Content = "Woke up early and went for a 30 minute run. The morning air was so refreshing. I feel more energised today than I have in weeks. Going to try to make this a daily habit.", Tags = "exercise,morning,healthy", IsPrivate = false, EntryDate = now.AddDays(-16) },
                new() { UserId = createdUsers[0].Id, Title = "Debugging marathon", Content = "Spent 6 hours hunting a bug in my web project. Turns out it was a single missing semicolon deep in a nested function. Frustrating but also kind of satisfying when it finally worked.", Tags = "coding,frustrated,satisfied", IsPrivate = true, EntryDate = now.AddDays(-12) },
                new() { UserId = createdUsers[0].Id, Title = "Group project concerns", Content = "One member of our group hasn't submitted their part yet and the deadline is tomorrow. I don't want to be the one who does everything again. Need to have a direct conversation about accountability.", Tags = "groupwork,stress,communication", IsPrivate = true, EntryDate = now.AddDays(-8) },
                new() { UserId = createdUsers[0].Id, Title = "Reflecting on my week", Content = "This week was tough but manageable. I logged my mood every day and noticed I feel better on days I exercise. The pattern analysis is actually helping me see what affects my wellbeing.", Tags = "reflection,pattern,growth", IsPrivate = true, EntryDate = now.AddDays(-3) },
                new() { UserId = createdUsers[0].Id, Title = "Internship application sent", Content = "Finally submitted my CV for the summer internship at the tech startup. It took me two weeks to write the cover letter but I'm happy with it. Fingers crossed!", Tags = "career,hopeful,milestone", IsPrivate = false, EntryDate = now.AddDays(-1) },

                // Dineth - Business Management
                new() { UserId = createdUsers[1].Id, Title = "Exam preparation begins", Content = "Started preparing for mid-terms. Business strategy exam is in two weeks. Created a study schedule and going to stick to it. Feeling motivated today.", Tags = "exam,study,motivated", IsPrivate = true, EntryDate = now.AddDays(-27) },
                new() { UserId = createdUsers[1].Id, Title = "Overwhelmed today", Content = "Too many deadlines at once. Group project is falling apart because some members aren't contributing. Feeling frustrated and anxious. Need to talk to the lecturer about the situation.", Tags = "stress,frustrated,groupwork", IsPrivate = true, EntryDate = now.AddDays(-22) },
                new() { UserId = createdUsers[1].Id, Title = "Better day", Content = "Took a walk at lunch instead of eating at my desk. Made such a difference. Had a productive afternoon session. Small changes really do help.", Tags = "walk,productive,better", IsPrivate = false, EntryDate = now.AddDays(-18) },
                new() { UserId = createdUsers[1].Id, Title = "Networking event was great", Content = "Attended a business networking event on campus. Met a few professionals from accounting firms. Collected business cards and had great conversations. Feeling inspired about my future career.", Tags = "networking,career,inspired", IsPrivate = false, EntryDate = now.AddDays(-13) },
                new() { UserId = createdUsers[1].Id, Title = "Mid-term results in", Content = "Got my business strategy result — 74%. Not my best but better than I feared after that rough week. Economics was harder at 61%. Need to rethink my study approach for that subject.", Tags = "results,study,improvement", IsPrivate = true, EntryDate = now.AddDays(-9) },
                new() { UserId = createdUsers[1].Id, Title = "Family visit helped a lot", Content = "Mum came to visit this weekend. We went out for lunch and just talked for hours. I realised how much I'd been keeping bottled up. Feeling lighter and more grounded now.", Tags = "family,support,refreshed", IsPrivate = true, EntryDate = now.AddDays(-4) },

                // Kavya - Psychology
                new() { UserId = createdUsers[2].Id, Title = "Learning about cognitive therapy", Content = "Today's psychology lecture was incredible. We studied CBT techniques and I realised I've been using some of these naturally. Understanding the theory behind it helps so much.", Tags = "learning,psychology,insight", IsPrivate = false, EntryDate = now.AddDays(-26) },
                new() { UserId = createdUsers[2].Id, Title = "Practised meditation", Content = "Tried a 10 minute guided meditation before bed last night. Slept much better than usual. Going to add this to my evening routine permanently.", Tags = "meditation,sleep,routine", IsPrivate = true, EntryDate = now.AddDays(-21) },
                new() { UserId = createdUsers[2].Id, Title = "Volunteered at counselling helpline", Content = "Spent 3 hours volunteering at the student counselling listening service. It was emotionally demanding but deeply rewarding. I know this is the career I want.", Tags = "volunteering,purpose,counselling", IsPrivate = false, EntryDate = now.AddDays(-17) },
                new() { UserId = createdUsers[2].Id, Title = "Gratitude journal", Content = "Three things I am grateful for today: 1) Good friends who check in on me. 2) A comfortable place to study. 3) Progress I can actually see in my grades. Life is good.", Tags = "gratitude,positive,friends", IsPrivate = true, EntryDate = now.AddDays(-11) },
                new() { UserId = createdUsers[2].Id, Title = "Research paper submitted", Content = "Submitted my paper on mindfulness-based stress reduction in university students. Took 3 weeks of research and writing but I'm genuinely proud of the final result. Now to rest.", Tags = "achievement,research,proud", IsPrivate = false, EntryDate = now.AddDays(-6) },
                new() { UserId = createdUsers[2].Id, Title = "Processing a hard conversation", Content = "A close friend opened up to me about struggling with their mental health. I want to support them but I also need to make sure I'm not absorbing too much. Setting boundaries with compassion is hard.", Tags = "friendship,boundaries,empathy", IsPrivate = true, EntryDate = now.AddDays(-2) },

                // Ruwan - Engineering
                new() { UserId = createdUsers[3].Id, Title = "Lab report deadline stress", Content = "Engineering lab report due tomorrow and I'm only halfway through. Why do I always leave things to the last minute? No sleep tonight but I'll get it done.", Tags = "deadline,stress,engineering", IsPrivate = true, EntryDate = now.AddDays(-25) },
                new() { UserId = createdUsers[3].Id, Title = "Submitted on time!", Content = "Got it done! Submitted at 11:58pm but it's in. Going to reward myself with a proper breakfast tomorrow and a workout. Never again will I leave things this late (probably).", Tags = "relieved,done,reward", IsPrivate = false, EntryDate = now.AddDays(-24) },
                new() { UserId = createdUsers[3].Id, Title = "Circuit design project", Content = "Our team's circuit design actually worked first try in the lab today. Everyone was shocked. We've been working on it for three weeks. The look on our lecturer's face was priceless.", Tags = "engineering,teamwork,success", IsPrivate = false, EntryDate = now.AddDays(-19) },
                new() { UserId = createdUsers[3].Id, Title = "Exhausted this week", Content = "Three consecutive 14-hour days in the lab. I love the work but my body is telling me to slow down. Skipped the gym all week. That always makes my mood worse too.", Tags = "exhausted,balance,health", IsPrivate = true, EntryDate = now.AddDays(-14) },
                new() { UserId = createdUsers[3].Id, Title = "Back to the gym", Content = "Finally went back to the gym after 10 days off. Did a light session but it felt incredible. Exercise is non-negotiable — I need to protect that time no matter how busy study gets.", Tags = "gym,health,discipline", IsPrivate = false, EntryDate = now.AddDays(-7) },
                new() { UserId = createdUsers[3].Id, Title = "Thinking about postgrad", Content = "Had coffee with one of my lecturers who encouraged me to consider an MSc. I hadn't thought seriously about postgrad before but the idea is growing on me. Lots to think about.", Tags = "future,postgrad,career", IsPrivate = true, EntryDate = now.AddDays(-2) },

                // Nimasha - Medicine
                new() { UserId = createdUsers[4].Id, Title = "Medical school pressure", Content = "The amount of content we need to memorise is overwhelming. Sometimes I wonder if I chose the right path. Then I remember why I started — to help people. That keeps me going.", Tags = "pressure,purpose,medicine", IsPrivate = true, EntryDate = now.AddDays(-29) },
                new() { UserId = createdUsers[4].Id, Title = "Study group really helped", Content = "Joined a study group for anatomy. Explaining concepts to others solidifies my own understanding so much. Two of us have been struggling with the same topics — it helps to know I'm not alone.", Tags = "studygroup,anatomy,support", IsPrivate = false, EntryDate = now.AddDays(-23) },
                new() { UserId = createdUsers[4].Id, Title = "Clinical placement starts Monday", Content = "Got my placement assignment — I'll be in the general ward for 4 weeks. Nervous and excited in equal measure. Finally applying everything from lectures in a real setting.", Tags = "placement,clinical,nervous", IsPrivate = true, EntryDate = now.AddDays(-18) },
                new() { UserId = createdUsers[4].Id, Title = "First day in the ward", Content = "Observed three consultations today. The doctors were patient and explained everything to us. One patient thanked me personally for listening attentively to their concerns. I almost cried.", Tags = "clinical,meaningful,emotional", IsPrivate = true, EntryDate = now.AddDays(-14) },
                new() { UserId = createdUsers[4].Id, Title = "Difficult case today", Content = "Witnessed a challenging diagnosis today that really affected me. I understand now why doctors need to develop emotional resilience alongside medical skill. Talked to my supervisor — that helped.", Tags = "medicine,resilience,emotional", IsPrivate = true, EntryDate = now.AddDays(-10) },
                new() { UserId = createdUsers[4].Id, Title = "Self care Sunday", Content = "Took today completely off. Read a novel, cooked a proper meal, called my parents. Fully recharged and ready for the week ahead. Rest is not wasted time — it is necessary.", Tags = "selfcare,rest,family", IsPrivate = true, EntryDate = now.AddDays(-4) },
                new() { UserId = createdUsers[4].Id, Title = "Anatomy exam passed", Content = "Passed the anatomy practical with 78%. I was aiming for 80 but considering how stressful the placement has been simultaneously, I am genuinely proud. Treating myself to a nice dinner tonight.", Tags = "exam,passed,proud", IsPrivate = false, EntryDate = now.AddDays(-1) },

                // Tharindu - Law
                new() { UserId = createdUsers[5].Id, Title = "Moot court preparation", Content = "Our moot court competition is next month. I've been assigned the prosecution side on a contract dispute case. The research alone is taking hours each day but I love the challenge.", Tags = "moot,law,challenge", IsPrivate = false, EntryDate = now.AddDays(-27) },
                new() { UserId = createdUsers[5].Id, Title = "Library deep dive", Content = "Spent 5 hours in the law library going through case precedents. Found three cases that perfectly support our argument. This is what I love about law — the detective work of finding the right precedent.", Tags = "research,law,satisfied", IsPrivate = true, EntryDate = now.AddDays(-21) },
                new() { UserId = createdUsers[5].Id, Title = "Moot court went well", Content = "The competition went better than expected. Our team won the preliminary round. The judges complimented our preparation and the clarity of our arguments. Feeling very proud today.", Tags = "moot,win,proud", IsPrivate = false, EntryDate = now.AddDays(-15) },
                new() { UserId = createdUsers[5].Id, Title = "Feeling the pressure", Content = "Three essay deadlines in two weeks and the moot court finals coming up. I'm organised but the volume is getting to me. Going for a run tonight to clear my head.", Tags = "pressure,organised,coping", IsPrivate = true, EntryDate = now.AddDays(-9) },
                new() { UserId = createdUsers[5].Id, Title = "Internship offer!", Content = "Received an email today offering me a summer placement at a city law firm! I've been working towards this for two years. This is a huge step and I couldn't be more excited.", Tags = "internship,career,excited", IsPrivate = false, EntryDate = now.AddDays(-3) },

                // Sanduni - Arts
                new() { UserId = createdUsers[6].Id, Title = "Exhibition opening night", Content = "My artwork was selected for the faculty exhibition. Standing there watching people engage with my piece was surreal. One viewer teared up — that's the moment every artist works towards.", Tags = "art,exhibition,emotional", IsPrivate = false, EntryDate = now.AddDays(-26) },
                new() { UserId = createdUsers[6].Id, Title = "Creative block hitting hard", Content = "Haven't been able to produce anything I'm happy with for two weeks. Every time I sit down to work the ideas just won't come. Feeling frustrated and questioning myself. This is the hardest part of being an artist.", Tags = "creative,block,frustrated", IsPrivate = true, EntryDate = now.AddDays(-20) },
                new() { UserId = createdUsers[6].Id, Title = "Breakthrough!", Content = "Went to a gallery in the city yesterday just for fun, no agenda. Came home and worked until 2am without noticing the time. Sometimes you just need to fill the well back up.", Tags = "creative,breakthrough,inspired", IsPrivate = false, EntryDate = now.AddDays(-14) },
                new() { UserId = createdUsers[6].Id, Title = "Art therapy workshop", Content = "Led a small art therapy session for first year students as part of a wellbeing initiative. Watching people who say they can't draw create something meaningful was beautiful. Want to do more of this.", Tags = "arttherapy,wellbeing,meaningful", IsPrivate = false, EntryDate = now.AddDays(-8) },
                new() { UserId = createdUsers[6].Id, Title = "Dissertation topic confirmed", Content = "My supervisor approved my dissertation topic: exploring the role of visual art in emotional regulation among young adults. It's exactly at the intersection of what I care about most.", Tags = "dissertation,research,excited", IsPrivate = true, EntryDate = now.AddDays(-3) },
            };
            context.JournalEntries.AddRange(journals);

            // --- HABIT LOGS (last 14 days per user) ---
            var allHabits = new[] { "Exercise / Workout", "Meditation", "Healthy Eating", "Adequate Sleep (7-9 hrs)", "Hydration (8 glasses)", "Reading", "Study / Learning", "Journaling", "No Social Media" };

            // Each user has a fixed set of habits they track
            var userHabits = new[]
            {
                new[] { "Exercise / Workout", "Study / Learning", "Hydration (8 glasses)", "Adequate Sleep (7-9 hrs)", "Journaling" },
                new[] { "Healthy Eating", "Study / Learning", "Adequate Sleep (7-9 hrs)", "Meditation", "Hydration (8 glasses)" },
                new[] { "Meditation", "Reading", "Journaling", "Healthy Eating", "No Social Media" },
                new[] { "Exercise / Workout", "Study / Learning", "Adequate Sleep (7-9 hrs)", "Hydration (8 glasses)", "No Social Media" },
                new[] { "Study / Learning", "Meditation", "Adequate Sleep (7-9 hrs)", "Healthy Eating", "Exercise / Workout" },
                new[] { "Reading", "Study / Learning", "Exercise / Workout", "Journaling", "Adequate Sleep (7-9 hrs)" },
                new[] { "Journaling", "Reading", "Meditation", "Healthy Eating", "No Social Media" },
            };

            var habitLogs = new List<HabitLog>();
            for (int u = 0; u < createdUsers.Count; u++)
            {
                var user = createdUsers[u];
                var habits = userHabits[u % userHabits.Length];

                for (int day = 13; day >= 0; day--)
                {
                    var date = now.AddDays(-day).Date.AddHours(Random.Shared.Next(18, 23));
                    // Track 3-5 habits per day
                    int habitCount = Random.Shared.Next(3, habits.Length + 1);
                    var selected = habits.OrderBy(_ => Random.Shared.Next()).Take(habitCount);

                    foreach (var habit in selected)
                    {
                        // Completion rate varies by user and habit type
                        bool isWeekend = now.AddDays(-day).DayOfWeek == DayOfWeek.Saturday || now.AddDays(-day).DayOfWeek == DayOfWeek.Sunday;
                        bool completed = habit.Contains("Study") && isWeekend
                            ? Random.Shared.Next(0, 3) > 0   // 67% on weekends
                            : Random.Shared.Next(0, 5) > 0;  // 80% normally

                        habitLogs.Add(new HabitLog
                        {
                            UserId = user.Id,
                            HabitName = habit,
                            Completed = completed,
                            DurationMinutes = habit.Contains("Exercise") ? Random.Shared.Next(25, 75) :
                                              habit.Contains("Meditation") ? Random.Shared.Next(10, 30) :
                                              habit.Contains("Reading") || habit.Contains("Study") ? Random.Shared.Next(30, 120) :
                                              habit.Contains("Journaling") ? Random.Shared.Next(10, 25) : null,
                            Notes = GetHabitNote(habit, completed),
                            LoggedAt = date
                        });
                    }
                }
            }
            context.HabitLogs.AddRange(habitLogs);

            // --- WELLNESS REMINDERS ---
            var reminders = new List<WellnessReminder>
            {
                // Asel
                new() { UserId = createdUsers[0].Id, Title = "Morning Mood Check-in",  Message = "Take 2 minutes to log how you're feeling before the day gets busy.",                       ReminderTime = new TimeSpan(8, 0, 0),  DaysOfWeek = "Mon,Tue,Wed,Thu,Fri",          IsActive = true },
                new() { UserId = createdUsers[0].Id, Title = "Evening Journal",         Message = "Write at least 3 sentences about your day. Reflection builds self-awareness.",           ReminderTime = new TimeSpan(21, 0, 0), DaysOfWeek = "Mon,Tue,Wed,Thu,Fri,Sat,Sun", IsActive = true },
                new() { UserId = createdUsers[0].Id, Title = "Hydration Check",         Message = "How many glasses of water today? Aim for 8. Your brain needs it.",                       ReminderTime = new TimeSpan(15, 0, 0), DaysOfWeek = "Mon,Tue,Wed,Thu,Fri",          IsActive = true },
                // Dineth
                new() { UserId = createdUsers[1].Id, Title = "Lunch Walk",              Message = "Step away from the screen. A 10 minute walk will reset your focus.",                     ReminderTime = new TimeSpan(12, 30, 0),DaysOfWeek = "Mon,Tue,Wed,Thu,Fri",          IsActive = true },
                new() { UserId = createdUsers[1].Id, Title = "Study Block Start",       Message = "Time to begin your 2-hour study block. Phone off, notes open, let's go.",                ReminderTime = new TimeSpan(18, 0, 0), DaysOfWeek = "Mon,Tue,Wed,Thu",             IsActive = true },
                new() { UserId = createdUsers[1].Id, Title = "Weekend Mood Log",        Message = "Quick check-in — how are you feeling this weekend? Log your mood.",                       ReminderTime = new TimeSpan(10, 0, 0), DaysOfWeek = "Sat,Sun",                      IsActive = false },
                // Kavya
                new() { UserId = createdUsers[2].Id, Title = "Meditation Time",         Message = "Close your eyes for 10 minutes. Breathe deeply and let go of tension.",                  ReminderTime = new TimeSpan(22, 0, 0), DaysOfWeek = "Mon,Tue,Wed,Thu,Fri,Sat,Sun", IsActive = true },
                new() { UserId = createdUsers[2].Id, Title = "Gratitude Moment",        Message = "Name 3 things you are grateful for today. Gratitude rewires the brain for positivity.", ReminderTime = new TimeSpan(20, 0, 0), DaysOfWeek = "Mon,Wed,Fri,Sun",             IsActive = true },
                // Ruwan
                new() { UserId = createdUsers[3].Id, Title = "Hydration Reminder",      Message = "Have you drunk enough water today? Aim for 8 glasses.",                                  ReminderTime = new TimeSpan(14, 0, 0), DaysOfWeek = "Mon,Tue,Wed,Thu,Fri",          IsActive = false },
                new() { UserId = createdUsers[3].Id, Title = "Gym Time",                Message = "Protect your workout time. Even 30 minutes helps. Get moving!",                          ReminderTime = new TimeSpan(17, 30, 0),DaysOfWeek = "Mon,Wed,Fri",                  IsActive = true },
                new() { UserId = createdUsers[3].Id, Title = "Sleep Reminder",          Message = "Aim to be in bed by 11pm. Sleep is when your brain consolidates what you studied.",      ReminderTime = new TimeSpan(22, 30, 0),DaysOfWeek = "Mon,Tue,Wed,Thu,Fri,Sat,Sun", IsActive = true },
                // Nimasha
                new() { UserId = createdUsers[4].Id, Title = "Weekly Reflection",       Message = "Review your mood and habit logs for the week. What patterns do you notice?",             ReminderTime = new TimeSpan(19, 0, 0), DaysOfWeek = "Sun",                          IsActive = true },
                new() { UserId = createdUsers[4].Id, Title = "Self-Care Check",         Message = "Are you taking care of yourself? Drink water, eat well, rest when needed.",              ReminderTime = new TimeSpan(13, 0, 0), DaysOfWeek = "Mon,Wed,Fri",                  IsActive = true },
                new() { UserId = createdUsers[4].Id, Title = "Evening Wind Down",       Message = "Step away from medicine notes. Do something enjoyable for 30 minutes before sleep.",     ReminderTime = new TimeSpan(21, 30, 0),DaysOfWeek = "Mon,Tue,Wed,Thu,Fri,Sat,Sun", IsActive = true },
                // Tharindu
                new() { UserId = createdUsers[5].Id, Title = "Case Law Review",         Message = "15 minutes reviewing today's case readings keeps knowledge fresh.",                       ReminderTime = new TimeSpan(19, 30, 0),DaysOfWeek = "Mon,Tue,Wed,Thu,Fri",          IsActive = true },
                new() { UserId = createdUsers[5].Id, Title = "Morning Intentions",      Message = "Set 3 intentions for today before you open your laptop. What matters most?",             ReminderTime = new TimeSpan(7, 30, 0), DaysOfWeek = "Mon,Tue,Wed,Thu,Fri",          IsActive = true },
                // Sanduni
                new() { UserId = createdUsers[6].Id, Title = "Creative Time",           Message = "Block 1 hour for free creative work — no assignments, just expression.",                  ReminderTime = new TimeSpan(16, 0, 0), DaysOfWeek = "Tue,Thu,Sat",                  IsActive = true },
                new() { UserId = createdUsers[6].Id, Title = "Digital Detox Evening",   Message = "No social media after 9pm. Protect your mental space before sleep.",                     ReminderTime = new TimeSpan(21, 0, 0), DaysOfWeek = "Mon,Tue,Wed,Thu,Fri,Sat,Sun", IsActive = true },
                new() { UserId = createdUsers[6].Id, Title = "Gallery / Museum Visit",  Message = "Monthly reminder: visit a gallery or museum to keep your creative well full.",           ReminderTime = new TimeSpan(10, 0, 0), DaysOfWeek = "Sat",                          IsActive = false },
            };
            context.WellnessReminders.AddRange(reminders);

            await context.SaveChangesAsync();
        }

        private static string? GetMoodNote(MoodLevel mood, int stress) => (mood, stress) switch
        {
            (MoodLevel.VerySad, >= 8) => "Really tough day. Feeling completely drained.",
            (MoodLevel.VerySad, _)    => "Not feeling great. Need some rest.",
            (MoodLevel.Sad, >= 7)     => "Stressed and low energy today.",
            (MoodLevel.Sad, _)        => "A bit down today, nothing specific.",
            (MoodLevel.Neutral, >= 8) => "Okay but stressed about deadlines.",
            (MoodLevel.Neutral, _)    => null,
            (MoodLevel.Happy, _)      => "Had a good productive day!",
            (MoodLevel.VeryHappy, _)  => "Feeling amazing today. Everything clicked.",
            _                         => null
        };

        private static string? GetHabitNote(string habit, bool completed) => completed switch
        {
            false when habit.Contains("Exercise") => "Skipped today — too tired after classes.",
            false when habit.Contains("Meditation") => "Couldn't settle my mind tonight.",
            false when habit.Contains("Sleep") => "Late night studying again.",
            false => null,
            true when habit.Contains("Exercise") => null,
            true when habit.Contains("Meditation") => "Feeling calmer after the session.",
            _ => null
        };
    }
}
