'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DailyReflectionForm from '@/components/player/DailyReflectionForm';
import { createClient } from '@/lib/supabase/client';
import { PlayerLog, DailyReflectionInput } from '@/types';
import { generateRecoveryPlan } from '@/lib/services/aiService';
import { calculateStreakData, generateFollowUpPrompt } from '@/lib/services/logProcessor';
import { MOTIVATIONAL_MESSAGES } from '@/lib/constants';
import { formatDate, getHealthColorHex } from '@/lib/utils';
import { Calendar, TrendingUp, Activity as ActivityIcon } from 'lucide-react';

export default function PlayerDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [showForm, setShowForm] = useState(false);
  const [logs, setLogs] = useState<PlayerLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [streakData, setStreakData] = useState({ currentStreak: 0, longestStreak: 0, totalLogs: 0 });
  const [followUpPrompt, setFollowUpPrompt] = useState('Tell me how you feel.');
  const [motivationalMessage, setMotivationalMessage] = useState('');

  useEffect(() => {
    loadLogs();
    setMotivationalMessage(
      MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]
    );
  }, []);

  const loadLogs = async () => {
    try {
      const response = await fetch('/api/logs');
      const data = await response.json();
      
      if (data.logs) {
        setLogs(data.logs);
        setStreakData(calculateStreakData(data.logs));
        setFollowUpPrompt(generateFollowUpPrompt(data.logs));
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReflection = async (input: DailyReflectionInput) => {
    setSubmitting(true);
    try {
      // Generate AI recovery plan
      const aiResponse = await generateRecoveryPlan(input);

      // Save to database
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input,
          aiResponse,
        }),
      });

      if (response.ok) {
        setShowForm(false);
        loadLogs();
      }
    } catch (error) {
      console.error('Error submitting reflection:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-text-secondary">Loading...</p>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-text-primary">Daily Check-In</h1>
          <Button variant="outline" onClick={() => setShowForm(false)}>
            Cancel
          </Button>
        </div>
        <DailyReflectionForm onSubmit={handleSubmitReflection} isSubmitting={submitting} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
        <Button onClick={() => setShowForm(true)} size="lg">
          New Daily Check-In
        </Button>
      </div>

      {/* Motivational Message */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardContent className="py-6">
          <p className="text-center text-lg font-medium text-text-primary">
            {motivationalMessage}
          </p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <ActivityIcon className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {streakData.currentStreak} {streakData.currentStreak === 1 ? 'day' : 'days'}
            </div>
            <p className="text-xs text-text-secondary">Keep it going!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {streakData.longestStreak} {streakData.longestStreak === 1 ? 'day' : 'days'}
            </div>
            <p className="text-xs text-text-secondary">Personal best</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Check-Ins</CardTitle>
            <Calendar className="h-4 w-4 text-tertiary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">
              {streakData.totalLogs}
            </div>
            <p className="text-xs text-text-secondary">All time</p>
          </CardContent>
        </Card>
      </div>
