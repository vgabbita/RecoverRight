import type { DailyReflectionInput, AIResponse } from '@/types';

export async function generateRecoveryPlan(input: DailyReflectionInput): Promise<AIResponse> {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('Failed to generate recovery plan');
  }

  return response.json();
}

export function formatPromptForGemini(input: DailyReflectionInput): string {
  return `You are a professional sports medicine AI assistant specializing in recovery planning for MLB players. Based on the following player data, generate a detailed, structured recovery plan.

Player Input:
- Reflection: ${input.reflection_text}
- Pain Locations: ${input.pain_location_tags.join(', ') || 'None reported'}
- Pain Severity (1-10): ${input.pain_severity_level}
- Energy Level (1-10): ${input.energy_level}
- Soreness Level (1-10): ${input.soreness_level}

Please provide a response in the following JSON format:
{
  "mobilityPlan": {
    "exercises": [
      {
        "name": "Exercise name",
        "duration": "Duration in minutes",
        "intensity": "Low/Medium/High",
        "equipment": "Required equipment (optional)"
      }
    ]
  },
  "nutritionRestPlan": {
    "hydration": "Hydration guidance",
    "nutrition": ["Nutritional recommendation 1", "Nutritional recommendation 2"],
    "rest": "Rest and sleep recommendations"
  }
}`;
}
