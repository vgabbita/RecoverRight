export interface MobilityPlan {
  exercises: Array<{
    name: string;
    duration: string;
    intensity: string;
    equipment?: string;
  }>;
}

export interface NutritionRestPlan {
  hydration: string;
  nutrition: string[];
  rest: string;
}

export interface AIInsight {
  id: number;
  log_id: number;
  mobility_plan: MobilityPlan;
  nutrition_rest_plan: NutritionRestPlan;
  generated_at: string;
}

export interface AIResponse {
  mobilityPlan: MobilityPlan;
  nutritionRestPlan: NutritionRestPlan;
  healthScore: number;
}
