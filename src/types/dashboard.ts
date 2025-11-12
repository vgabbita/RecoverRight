export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalLogs: number;
}

export interface PainFrequencyData {
  location: string;
  count: number;
}

export interface PlayerHealthStatus {
  player_id: string;
  player_name: string;
  health_score: number;
  color: 'green' | 'yellow' | 'orange' | 'red';
  summary: string;
  last_check_in: string;
}
