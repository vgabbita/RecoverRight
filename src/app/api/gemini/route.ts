import { NextRequest, NextResponse } from 'next/server';
import { DailyReflectionInput, AIResponse } from '@/types';
import { calculateHealthScore } from '@/lib/services/healthScoring';

export async function POST(request: NextRequest) {
  try {
    const input: DailyReflectionInput = await request.json();

    // Format the prompt for Gemini
    const prompt = formatPromptForGemini(input);

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        }),
      }
    );

    if (!geminiResponse.ok) {
      throw new Error('Gemini API request failed');
    }

    const geminiData = await geminiResponse.json();
    const generatedText = geminiData.candidates[0].content.parts[0].text;

    // Parse the JSON response from Gemini
    let aiPlan;
    try {
      // Remove markdown code blocks if present
      const cleanedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      aiPlan = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', generatedText);
      throw new Error('Invalid AI response format');
    }

    // Calculate health score
    const healthScore = calculateHealthScore(input);

    const response: AIResponse = {
      mobilityPlan: aiPlan.mobilityPlan,
      nutritionRestPlan: aiPlan.nutritionRestPlan,
      healthScore,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recovery plan' },
      { status: 500 }
    );
  }
}

function formatPromptForGemini(input: DailyReflectionInput): string {
  return `You are a professional sports medicine AI assistant specializing in recovery planning for MLB players. Based on the following player data, generate a detailed, structured recovery plan.

Player Input:
- Reflection: ${input.reflection_text}
- Pain Locations: ${input.pain_location_tags.join(', ') || 'None reported'}
- Pain Severity (1-10): ${input.pain_severity_level}
- Energy Level (1-10): ${input.energy_level}
- Soreness Level (1-10): ${input.soreness_level}

Please provide a response in the following JSON format (respond ONLY with valid JSON, no additional text):
{
  "mobilityPlan": {
    "exercises": [
      {
        "name": "Exercise name",
        "duration": "Duration in minutes",
        "intensity": "Low/Medium/High",
        "equipment": "Required equipment or None"
      }
    ]
  },
  "nutritionRestPlan": {
    "hydration": "Specific hydration guidance with amounts",
    "nutrition": ["Specific nutritional recommendation 1", "Specific nutritional recommendation 2"],
    "rest": "Specific rest and sleep recommendations"
  }
}`;
}
