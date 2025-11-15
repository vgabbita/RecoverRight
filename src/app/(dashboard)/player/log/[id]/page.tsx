'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { PlayerLog } from '@/types';
import { formatDateTime, getHealthColor, getHealthColorHex } from '@/lib/utils';
import { ArrowLeft, Calendar, Activity } from 'lucide-react';

export default function LogDetailPage() {
  const router = useRouter();
  const params = useParams();
  const logId = params.id as string;
  const supabase = createClient();
  
  const [log, setLog] = useState<PlayerLog | null>(null);
  const [aiInsight, setAiInsight] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogDetail();
  }, [logId]);

  const loadLogDetail = async () => {
    try {
      setLoading(true);
      const { data: aiData, error: aiError } = await supabase
        .from("ai_insights")
        .select("*")
        .eq("id", logId)
        .single();
      if (aiError) {
        console.error("Error fetching AI insight:", aiError);
      } else {
        setAiInsight(aiData);
      }
      
      // Fetch log with AI insights (use explicit relationship name to avoid ambiguous embed)
      const { data: logData, error: logError } = await supabase
        .from('player_logs')
        .select(`
          *,
          ai_insights!ai_insights_log_id_fkey(*)
        `)
        .eq('id', logId)
        .single();

      if (logError) throw logError;

      if (logData) {
        setLog(logData);
      }
      console.log("logData", logData)
      console.log("aiData", aiData)
    } catch (error) {
      console.error('Error loading log detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-text-secondary">Loading...</p>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-text-secondary">Log not found</p>
        <Button onClick={() => router.push('/player')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const healthColor = getHealthColor(log.health_score);
  const healthColorHex = getHealthColorHex(healthColor);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push('/player')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      {/* Log Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <Calendar className="h-5 w-5" />
                {formatDateTime(log.submitted_at)}
              </CardTitle>
              <CardDescription>Daily Recovery Check-In</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="h-8 w-8 rounded-full border-2 border-white shadow-md"
                style={{ backgroundColor: healthColorHex }}
              />
              <div>
                <p className="text-sm font-medium text-text-secondary">Health Score</p>
                <p className="text-2xl font-bold" style={{ color: healthColorHex }}>
                  {log.health_score}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Reflection Card */}
      <Card>
        <CardHeader>
          <CardTitle>Your Reflection</CardTitle>
          <CardDescription>How you felt on this day</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-text-primary">{log.reflection_text}</p>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Energy Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {log.energy_level}/10
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Soreness Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-tertiary">
              {log.soreness_level}/10
            </div>
          </CardContent>
        </Card>

        {log.pain_severity_level && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pain Severity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-danger">
                {log.pain_severity_level}/10
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pain Locations */}
      {log.pain_location_tags && log.pain_location_tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pain Locations</CardTitle>
            <CardDescription>Areas reporting discomfort</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {log.pain_location_tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
  
  {/* AI Recovery Plan - only show when a stored AI insight exists AND health score is below 70 */}
  {aiInsight && log.health_score < 70 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>AI Recovery Plan</CardTitle>
              <CardDescription>Personalized recommendations for optimal recovery</CardDescription>
            </CardHeader>
          </Card>

          {/* Mobility Plan */}
          {aiInsight.mobility_plan && aiInsight.mobility_plan.exercises && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Mobility & Workout Plan
                </CardTitle>
                <CardDescription>Specific exercises and stretches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiInsight.mobility_plan.exercises.map((exercise: any, idx: number) => (
                    <div key={idx} className="rounded-lg border p-4">
                      <h3 className="mb-2 font-semibold text-text-primary">{exercise.name}</h3>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-text-secondary">Duration</p>
                          <p className="font-medium text-text-primary">{exercise.duration}</p>
                        </div>
                        <div>
                          <p className="text-text-secondary">Intensity</p>
                          <p className="font-medium text-text-primary">{exercise.intensity}</p>
                        </div>
                        {exercise.equipment && (
                          <div>
                            <p className="text-text-secondary">Equipment</p>
                            <p className="font-medium text-text-primary">{exercise.equipment}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Nutrition & Rest Plan */}
          {aiInsight.nutrition_rest_plan && (
            <Card>
              <CardHeader>
                <CardTitle>Nutrition & Rest Plan</CardTitle>
                <CardDescription>Optimize your recovery with proper nutrition and rest</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiInsight.nutrition_rest_plan.hydration && (
                    <div>
                      <h4 className="mb-2 font-semibold text-text-primary">Hydration</h4>
                      <p className="text-text-secondary">{aiInsight.nutrition_rest_plan.hydration}</p>
                    </div>
                  )}
                  
                  {aiInsight.nutrition_rest_plan.nutrition && (
                    <div>
                      <h4 className="mb-2 font-semibold text-text-primary">Nutrition</h4>
                      <ul className="list-inside list-disc space-y-1">
                        {aiInsight.nutrition_rest_plan.nutrition.map((item: string, idx: number) => (
                          <li key={idx} className="text-text-secondary">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {aiInsight.nutrition_rest_plan.rest && (
                    <div>
                      <h4 className="mb-2 font-semibold text-text-primary">Rest</h4>
                      <p className="text-text-secondary">{aiInsight.nutrition_rest_plan.rest}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
