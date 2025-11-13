'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { Profile, PlayerLog } from '@/types';
import PlayerHealthTable from '@/components/coach/PlayerHealthTable';
import { Users, TrendingUp } from 'lucide-react';

interface PlayerWithLatestLog extends Profile {
  user_id: string;
  email?: string;
  latestLog?: PlayerLog;
}

export default function CoachDashboard() {
  const supabase = createClient();
  const [players, setPlayers] = useState<PlayerWithLatestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamStats, setTeamStats] = useState({
    totalPlayers: 0,
    averageHealth: 0,
    activeToday: 0,
    averageStreak: 0,
  });

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      
      // Get all players
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('role', 'player');

      if (usersError) throw usersError;

      if (!users || users.length === 0) {
        setPlayers([]);
        return;
      }

      // Get profiles for all players
      const userIds = users.map(u => u.id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Get latest log for each player
      const playersWithLogs = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: logs } = await supabase
            .from('player_logs')
            .select('*')
            .eq('player_id', profile.user_id)
            .order('submitted_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          const user = users.find(u => u.id === profile.user_id);

          return {
            ...profile,
            email: user?.email,
            latestLog: logs || undefined,
          };
        })
      );

      setPlayers(playersWithLogs);

      // Calculate team stats
      const totalPlayers = playersWithLogs.length;
      const playersWithLogsData = playersWithLogs.filter(p => p.latestLog);
      const totalHealth = playersWithLogsData.reduce((sum, p) => sum + (p.latestLog?.health_score || 0), 0);
      const averageHealth = playersWithLogsData.length > 0 ? Math.round(totalHealth / playersWithLogsData.length) : 0;

      // Count active today (checked in today)
      const today = new Date().toDateString();
      const activeToday = playersWithLogsData.filter(p => 
        p.latestLog && new Date(p.latestLog.submitted_at).toDateString() === today
      ).length;

      setTeamStats({
        totalPlayers,
        averageHealth,
        activeToday,
        averageStreak: 0, // This would require calculating streaks for all players
      });

    } catch (error) {
      console.error('Error loading players:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-text-secondary">Loading team data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Team Overview</h1>
          <p className="text-text-secondary">Monitor player health and readiness</p>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Players</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">
              {teamStats.totalPlayers}
            </div>
            <p className="text-xs text-text-secondary">Registered players</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {teamStats.averageHealth}
            </div>
            <p className="text-xs text-text-secondary">Team average score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Users className="h-4 w-4 text-tertiary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">
              {teamStats.activeToday}
            </div>
            <p className="text-xs text-text-secondary">Checked in today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {teamStats.totalPlayers > 0 
                ? Math.round((teamStats.activeToday / teamStats.totalPlayers) * 100) 
                : 0}%
            </div>
            <p className="text-xs text-text-secondary">Daily check-in rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Player Health Table */}
      <Card>
        <CardHeader>
          <CardTitle>Player Health Status</CardTitle>
          <CardDescription>
            Color-coded health indicators for all players
          </CardDescription>
        </CardHeader>
        <CardContent>
          {players.length === 0 ? (
            <p className="text-center text-text-secondary py-8">
              No players registered yet.
            </p>
          ) : (
            <PlayerHealthTable players={players} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
