export interface PlayerLog {
  id: number;
  player_id: string;
  reflection_text: string;
  pain_location_tags: string[];
  pain_severity_level: number;
  energy_level: number;
  soreness_level: number;
  submitted_at: string;
  health_score: number;
  ai_insight_id?: number;
}

export interface DailyReflectionInput {
  reflection_text: string;
  pain_location_tags: string[];
  pain_severity_level: number;
  energy_level: number;
  soreness_level: number;
}
