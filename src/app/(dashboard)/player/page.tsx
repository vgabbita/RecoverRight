'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DailyReflectionForm from '@/components/player/DailyReflectionForm';
import PainFrequencyChart from '@/components/dataViz/PainFrequencyChart';
import { createClient } from '@/lib/supabase/client';
import { PlayerLog, DailyReflectionInput } from '@/types';
import { generateRecoveryPlan } from '@/lib/services/aiService';
import { calculateStreakData, generateFollowUpPrompt } from '@/lib/services/logProcessor';
import { MOTIVATIONAL_MESSAGES } from '@/lib/constants';
import { formatDate, getHealthColor, getHealthColorHex } from '@/lib/utils';
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
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [firstConversationId, setFirstConversationId] = useState<number | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);

  useEffect(() => {
    loadLogs();
    setMotivationalMessage(
      MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]
    );
    loadConversations();
    loadProfileName();
  }, []);

  const loadProfileName = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();

      if (profile?.full_name) setPlayerName(profile.full_name);
    } catch (error) {
      console.error('Error loading player profile name:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get conversations for this player
      const { data: conversations } = await supabase
        .from('conversations')
        .select('*')
        .eq('player_id', user.id);

      if (!conversations || conversations.length === 0) {
        setUnreadMessagesCount(0);
        setFirstConversationId(null);
        return;
      }

      // Record first conversation id for quick access
      setFirstConversationId(conversations[0].id);

      // Count unread messages across conversations (messages sent by physician to player)
      let totalUnread = 0;
      for (const conv of conversations) {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('read_by_recipient', false)
          .neq('sender_id', user.id);

        totalUnread += count || 0;
      }

      setUnreadMessagesCount(totalUnread);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

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
    <div>
      <h1 className="text-3xl font-bold text-text-primary">{playerName ? `${playerName}'s Dashboard` : 'Dashboard'}</h1>
      {playerName && <p className="text-text-secondary">Welcome back, {playerName.split(' ')[0]}.</p>}
    </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  if (firstConversationId) {
                    router.push(`/player/chat/${firstConversationId}`);
                  } else {
                    router.push('/player');
                  }
                }}
              >
                Messages {unreadMessagesCount > 0 && `(${unreadMessagesCount})`}
              </Button>
              <Button onClick={() => setShowForm(true)} size="lg">
                New Daily Check-In
              </Button>
            </div>
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

      {/* Follow-Up Prompt */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Check-In Prompt</CardTitle>
          <CardDescription>{followUpPrompt}</CardDescription>
        </CardHeader>
      </Card>

      {/* Pain Frequency Visualization */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pain Tracking</CardTitle>
            <CardDescription>Frequency of pain locations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <PainFrequencyChart logs={logs} />
          </CardContent>
        </Card>
      )}

      {/* Past Logs */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Check-Ins</CardTitle>
            <CardDescription>Your recent recovery reflections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="cursor-pointer rounded-lg border p-4 hover:bg-gray-50"
                  onClick={() => router.push(`/player/log/${log.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-text-primary">
                        {formatDate(log.submitted_at)}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {log.reflection_text.substring(0, 100)}...
                      </p>
                    </div>
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: getHealthColorHex(getHealthColor(log.health_score)) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
