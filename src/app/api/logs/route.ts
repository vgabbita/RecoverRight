import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DailyReflectionInput } from '@/types';
import { calculateHealthScore, getHealthSummary } from '@/lib/services/healthScoring';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const playerId = searchParams.get('player_id') || user.id;

    // Fetch player logs with AI insights
    const { data: logs, error: logsError } = await supabase
      .from('player_logs')
      .select(`
        *,
        ai_insights (*)
      `)
      .eq('player_id', playerId)
      .order('submitted_at', { ascending: false });

    if (logsError) {
      throw logsError;
    }

    return NextResponse.json({ logs: logs || [] });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { input, aiResponse } = body;

    // Calculate health score
    const healthScore = calculateHealthScore(input);

    // Insert player log
    const { data: logData, error: logError } = await supabase
      .from('player_logs')
      .insert({
        player_id: user.id,
        reflection_text: input.reflection_text,
        pain_location_tags: input.pain_location_tags,
        pain_severity_level: input.pain_severity_level,
        energy_level: input.energy_level,
        soreness_level: input.soreness_level,
        health_score: healthScore,
      })
      .select()
      .single();

    if (logError) {
      throw logError;
    }

    // Insert AI insight
    const { data: insightData, error: insightError } = await supabase
      .from('ai_insights')
      .insert({
        log_id: logData.id,
        mobility_plan: aiResponse.mobilityPlan,
        nutrition_rest_plan: aiResponse.nutritionRestPlan,
      })
      .select()
      .single();

    if (insightError) {
      throw insightError;
    }

    // Update log with ai_insight_id
    await supabase
      .from('player_logs')
      .update({ ai_insight_id: insightData.id })
      .eq('id', logData.id);

    return NextResponse.json({
      log: logData,
      insight: insightData,
    });
  } catch (error) {
    console.error('Error creating log:', error);
    return NextResponse.json(
      { error: 'Failed to create log' },
      { status: 500 }
    );
  }
}
