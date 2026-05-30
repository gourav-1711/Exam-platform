---
name: Streak System
description: DB-backed streak tracking with leaderboard. Auto-records activity once per day when signed in.
---

**Tables:** `user_streaks` (user_id unique, display_name, current_streak, longest_streak, total_points, quiz_count, mock_count, pyq_count, last_activity_date text YYYY-MM-DD, timestamps)

**API endpoints:**
- `GET /api/streaks/me` — requires Clerk auth (checks req.auth via getAuth(req)), returns UserStreakData
- `POST /api/streaks/activity` — requires auth; body: { activityType: "quiz"|"mock"|"pyq", displayName }; updates streak + points; returns ActivityResult with streakIncremented boolean
- `GET /api/leaderboard?limit=N` — public; returns LeaderboardEntry[]

**Points:** quiz=5, mock=50, pyq=3 per activity call

**Streak logic:** lastActivityDate === today → no streak change, just add points. === yesterday → increment. older/null → reset to 1.

**Frontend:**
- `StreakTracker` component mounted in AppLayout inside `<Show when="signed-in">`. Uses localStorage key `mk_last_streak_date` to fire once per day. Shows StreakToast (bottom center, 5s) when streakIncremented === true.
- Profile page: uses `useGetMyStreak` hook; shows streak/longest/points banner + quiz/mock/pyq stat cards
- Leaderboard page: uses `useGetLeaderboard`; shows empty state when no entries; podium for top 3, ranked list for rest; streak flame badges per user

**Why:** User wanted daily streak tracking with badges on profile + leaderboard.

**How to apply:** When adding new activity types (e.g., notes read), add the type to POINTS map in streaks route and to the RecordActivityInput enum in OpenAPI spec. Run codegen after spec changes.
