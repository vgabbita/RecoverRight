import type { PlayerLog, PainFrequencyData, StreakData } from '@/types';

/**
 * Calculate streak data from player logs
 */
export function calculateStreakData(logs: PlayerLog[]): StreakData {
  if (logs.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalLogs: 0 };
  }

  // Sort logs by date (newest first)
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;

  for (const log of sortedLogs) {
    const logDate = new Date(log.submitted_at);
    logDate.setHours(0, 0, 0, 0);

    if (!lastDate) {
      // First log
      currentStreak = 1;
      tempStreak = 1;
      lastDate = logDate;
    } else {
      // Check if this log is consecutive
      const dayDiff = Math.floor(
        (lastDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dayDiff === 1) {
        // Consecutive day
        tempStreak++;
        console.log(sortedLogs.indexOf(log));
        if (sortedLogs.indexOf(log) === 1) {
          currentStreak = tempStreak;
        }
      } else {
        // Streak broken
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }

      lastDate = logDate;
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  return {
    currentStreak,
    longestStreak,
    totalLogs: logs.length,
  };
}
/**
 * Calculate pain frequency from logs
 */
export function calculatePainFrequency(logs: PlayerLog[]): PainFrequencyData[] {
  const frequencyMap = new Map<string, number>();

  logs.forEach(log => {
    log.pain_location_tags.forEach(location => {
      frequencyMap.set(location, (frequencyMap.get(location) || 0) + 1);
    });
  });

  return Array.from(frequencyMap.entries())
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Generate diagnostic follow-up prompt based on previous logs
 */
export function generateFollowUpPrompt(logs: PlayerLog[]): string {
  if (logs.length === 0) {
    return "Tell me how you feel.";
  }

  // Get the most recent log
  const recentLog = logs[0];
  const daysSince = Math.floor(
    (Date.now() - new Date(recentLog.submitted_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  // If they mentioned pain, ask about it
  if (recentLog.pain_location_tags.length > 0) {
    const location = recentLog.pain_location_tags[0];
    const timeRef = daysSince === 0 ? 'earlier today' : daysSince === 1 ? 'yesterday' : `${daysSince} days ago`;
    return `You mentioned ${location.toLowerCase()} discomfort ${timeRef}. How is it feeling now?`;
  }

  // If they reported high soreness
  if (recentLog.soreness_level >= 7) {
    return `Your soreness level was high last time. Has it improved?`;
  }

  // If they reported low energy
  if (recentLog.energy_level <= 4) {
    return `How is your energy level today compared to last time?`;
  }

  // Default prompt
  return "How are you feeling today? Any changes since your last check-in?";
}
