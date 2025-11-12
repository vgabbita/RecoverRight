import type { DailyReflectionInput } from '@/types';

/**
 * Calculate a health score (0-100) based on player input
 * Higher score = better health
 */
export function calculateHealthScore(input: DailyReflectionInput): number {
  // Start with base score of 100
  let score = 100;

  // Pain severity deduction (0-40 points)
  // Higher pain = more deduction
  const painDeduction = (input.pain_severity_level / 10) * 40;
  score -= painDeduction;

  // Energy level contribution (0-20 points)
  // Lower energy = more deduction
  const energyBonus = (input.energy_level / 10) * 20;
  score -= (20 - energyBonus);

  // Soreness level deduction (0-25 points)
  const sorenessDeduction = (input.soreness_level / 10) * 25;
  score -= sorenessDeduction;

  // Pain location count penalty (0-15 points)
  const locationPenalty = Math.min(input.pain_location_tags.length * 3, 15);
  score -= locationPenalty;

  // Ensure score stays within 0-100 range
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Generate health summary text based on score
 */
export function getHealthSummary(score: number, input: DailyReflectionInput): string {
  if (score >= 80) {
    return 'Fully healthy and ready to play';
  } else if (score >= 60) {
    const locations = input.pain_location_tags.slice(0, 2).join(' and ');
    return locations 
      ? `Minor ${locations.toLowerCase()} discomfort reported`
      : 'Slight soreness, monitor closely';
  } else if (score >= 40) {
    const locations = input.pain_location_tags.slice(0, 2).join(' and ');
    return locations
      ? `Moderate ${locations.toLowerCase()} pain, activity modification needed`
      : 'Significant soreness, careful monitoring required';
  } else {
    return 'High pain/fatigue levels, medical evaluation recommended';
  }
}
