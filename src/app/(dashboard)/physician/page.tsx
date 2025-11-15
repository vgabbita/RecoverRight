'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { Profile, PlayerLog } from '@/types';
import { formatDate, formatDateTime, getHealthColor, getHealthColorHex } from '@/lib/utils';
import { Users, MessageSquare, Calendar, Activity as ActivityIcon, ChevronRight } from 'lucide-react';

interface PlayerWithLatestLog extends Profile {
  user_id: string;
  email?: string;
  latestLog?: PlayerLog;
  unreadMessages?: number;
}

export default function PhysicianDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [players, setPlayers] = useState<PlayerWithLatestLog[]>([]);
  const [conversations, setConversations] = useState<Array<{ id: number; player_id: string; player_name?: string; last_message_at?: string; unread?: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [physicianName, setPhysicianName] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerWithLatestLog | null>(null);
  const [playerLogs, setPlayerLogs] = useState<PlayerLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);
  const [aiInsights, setAiInsights] = useState<Record<number, any>>({});

  useEffect(() => {
    loadPlayers();
  }, []);

  useEffect(() => {
    loadConversationsForPhysician();
  }, []);

  useEffect(() => {
    loadPhysicianName();
  }, []);

  const loadPhysicianName = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();

      if (profile?.full_name) setPhysicianName(profile.full_name);
    } catch (error) {
      console.error('Error loading physician profile name:', error);
    }
  };

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

      // Get current physician user
      const { data: { user: currentUser } } = await supabase.auth.getUser();

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

          // Get unread message count for conversations with this physician
          let unreadCount = 0;
          if (currentUser) {
            // Find conversation between physician and player
            const { data: conversation } = await supabase
              .from('conversations')
              .select('id')
              .eq('player_id', profile.user_id)
              .eq('physician_id', currentUser.id)
              .maybeSingle();

            if (conversation) {
              // Count unread messages sent by player to physician
              const { count } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('conversation_id', conversation.id)
                .eq('read_by_recipient', false)
                .eq('sender_id', profile.user_id);

              unreadCount = count || 0;
            }
          }

          const user = users.find(u => u.id === profile.user_id);

          return {
            ...profile,
            email: user?.email,
            latestLog: logs || undefined,
            unreadMessages: unreadCount,
          };
        })
      );

      setPlayers(playersWithLogs);
    } catch (error) {
      console.error('Error loading players:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversationsForPhysician = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: convs } = await supabase
        .from('conversations')
        .select('id, player_id, last_message_at')
        .eq('physician_id', user.id)
        .order('last_message_at', { ascending: false });

      if (!convs || convs.length === 0) {
        setConversations([]);
        return;
      }

      // Fetch player names for each conversation
      const playerIds = convs.map((c: any) => c.player_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', playerIds);

      const convsWithNames: any[] = (convs as any[]).map((c) => ({
        id: c.id,
        player_id: c.player_id,
        player_name: (profiles || []).find((p: any) => p.user_id === c.player_id)?.full_name,
        last_message_at: c.last_message_at,
      }));

      // Get unread counts per conversation
      for (const conv of convsWithNames) {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('read_by_recipient', false);

        // count is messages unread by recipient; we want unread for physician (messages from player)
        conv.unread = count || 0;
      }

      setConversations(convsWithNames);
    } catch (error) {
      console.error('Error loading conversations for physician:', error);
    }
  };

  const loadPlayerLogs = async (playerId: string) => {
    try {
      setLoadingLogs(true);
      const response = await fetch(`/api/logs?player_id=${playerId}`);
      const data = await response.json();
      
      if (data.logs) {
        setPlayerLogs(data.logs);
        // Extract AI insights from logs
        const insights: Record<number, any> = {};
        data.logs.forEach((log: any) => {
          if (log.ai_insights && log.ai_insights.length > 0) {
            insights[log.id] = log.ai_insights[0];
          }
        });
        setAiInsights(insights);
      }
    } catch (error) {
      console.error('Error loading player logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handlePlayerClick = (player: PlayerWithLatestLog) => {
    setSelectedPlayer(player);
    loadPlayerLogs(player.user_id);
  };

  const handleViewLog = (logId: number) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-text-secondary">Loading players...</p>
      </div>
    );
  }

  if (selectedPlayer) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button variant="outline" onClick={() => setSelectedPlayer(null)}>
              ← Back to Players
            </Button>
            <h1 className="mt-4 text-3xl font-bold text-text-primary">
              {selectedPlayer.full_name}
            </h1>
            <p className="text-text-secondary">{selectedPlayer.email}</p>
          </div>
          <Button onClick={() => router.push(`/physician/player/${selectedPlayer.user_id}/chat`)}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Message Player
          </Button>
        </div>

        {/* Player Summary */}
        {selectedPlayer.latestLog && (
          <Card>
            <CardHeader>
              <CardTitle>Latest Check-In</CardTitle>
              <CardDescription>
                {formatDateTime(selectedPlayer.latestLog.submitted_at)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-text-secondary">Health Score</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: getHealthColorHex(getHealthColor(selectedPlayer.latestLog.health_score)) }}
                    />
                    <span className="text-2xl font-bold">{selectedPlayer.latestLog.health_score}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-secondary">Reflection</p>
                  <p className="text-text-primary">{selectedPlayer.latestLog.reflection_text}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Energy Level</p>
                    <p className="text-lg font-semibold">{selectedPlayer.latestLog.energy_level}/10</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Soreness Level</p>
                    <p className="text-lg font-semibold">{selectedPlayer.latestLog.soreness_level}/10</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Pain Severity</p>
                    <p className="text-lg font-semibold">
                      {selectedPlayer.latestLog.pain_severity_level || 'N/A'}/10
                    </p>
                  </div>
                </div>
                {selectedPlayer.latestLog.pain_location_tags &&
                  selectedPlayer.latestLog.pain_location_tags.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-text-secondary">Pain Locations</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedPlayer.latestLog.pain_location_tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Player Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Check-In History</CardTitle>
            <CardDescription>All recovery reflections from this player</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingLogs ? (
              <p className="text-text-secondary">Loading logs...</p>
            ) : playerLogs.length === 0 ? (
              <p className="text-text-secondary">No check-ins yet.</p>
            ) : (
              <div className="space-y-4">
                {playerLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const aiInsight = aiInsights[log.id];
                  
                  return (
                    <div
                      key={log.id}
                      className="rounded-lg border p-4 hover:bg-gray-50"
                    >
                      <div 
                        className="cursor-pointer"
                        onClick={() => handleViewLog(log.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-text-secondary" />
                              <p className="font-medium text-text-primary">
                                {formatDateTime(log.submitted_at)}
                              </p>
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: getHealthColorHex(getHealthColor(log.health_score)) }}
                              />
                            </div>
                            <p className="mt-2 text-sm text-text-secondary">
                              {isExpanded ? log.reflection_text : `${log.reflection_text.substring(0, 150)}${log.reflection_text.length > 150 ? '...' : ''}`}
                            </p>
                            <div className="mt-2 flex gap-4 text-xs text-text-secondary">
                              <span>Energy: {log.energy_level}/10</span>
                              <span>Soreness: {log.soreness_level}/10</span>
                              <span>Health Score: {log.health_score}</span>
                              {log.pain_severity_level && (
                                <span>Pain: {log.pain_severity_level}/10</span>
                              )}
                            </div>
                          </div>
                          <ChevronRight 
                            className={`h-5 w-5 text-text-secondary transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                          />
                        </div>
                      </div>
                      
                      {/* Expanded Log Details */}
                      {isExpanded && (
                        <div className="mt-4 border-t pt-4 space-y-4">
                          {/* Full Reflection */}
                          <div>
                            <p className="text-sm font-medium text-text-secondary mb-2">Full Reflection</p>
                            <p className="text-text-primary">{log.reflection_text}</p>
                          </div>
                          
                          {/* Pain Locations */}
                          {log.pain_location_tags && log.pain_location_tags.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-text-secondary mb-2">Pain Locations</p>
                              <div className="flex flex-wrap gap-2">
                                {log.pain_location_tags.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-800"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* AI Insights */}
                          {aiInsight && (
                            <div className="border-t pt-4">
                              <p className="text-sm font-medium text-text-secondary mb-4">AI Recovery Plan</p>
                              
                              {/* Mobility Plan */}
                              {aiInsight.mobility_plan && (
                                <div className="mb-4">
                                  <p className="font-semibold text-text-primary mb-2">Mobility & Workout Plan</p>
                                  {aiInsight.mobility_plan.exercises && (
                                    <div className="space-y-2">
                                      {aiInsight.mobility_plan.exercises.map((exercise: any, idx: number) => (
                                        <div key={idx} className="bg-gray-50 p-3 rounded">
                                          <p className="font-medium text-text-primary">{exercise.name}</p>
                                          <p className="text-sm text-text-secondary">
                                            Duration: {exercise.duration} | Intensity: {exercise.intensity}
                                            {exercise.equipment && ` | Equipment: ${exercise.equipment}`}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Nutrition & Rest Plan */}
                              {aiInsight.nutrition_rest_plan && (
                                <div>
                                  <p className="font-semibold text-text-primary mb-2">Nutrition & Rest Plan</p>
                                  <div className="space-y-2">
                                    {aiInsight.nutrition_rest_plan.hydration && (
                                      <div className="bg-gray-50 p-3 rounded">
                                        <p className="font-medium text-text-primary">Hydration</p>
                                        <p className="text-sm text-text-secondary">{aiInsight.nutrition_rest_plan.hydration}</p>
                                      </div>
                                    )}
                                    {aiInsight.nutrition_rest_plan.nutrition && (
                                      <div className="bg-gray-50 p-3 rounded">
                                        <p className="font-medium text-text-primary">Nutrition</p>
                                        <ul className="list-disc list-inside text-sm text-text-secondary">
                                          {aiInsight.nutrition_rest_plan.nutrition.map((item: string, idx: number) => (
                                            <li key={idx}>{item}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    {aiInsight.nutrition_rest_plan.rest && (
                                      <div className="bg-gray-50 p-3 rounded">
                                        <p className="font-medium text-text-primary">Rest</p>
                                        <p className="text-sm text-text-secondary">{aiInsight.nutrition_rest_plan.rest}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">{physicianName ? `${physicianName}'s Dashboard` : 'Patient Dashboard'}</h1>
          <p className="text-text-secondary">Monitor and manage all registered players</p>
        </div>
      </div>

      {/* Conversations for physician */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages
          </CardTitle>
          <CardDescription>
            Recent conversations with players
          </CardDescription>
        </CardHeader>
        <CardContent>
          {conversations.length === 0 ? (
            <p className="text-text-secondary">No conversations yet.</p>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-text-primary">{conv.player_name || 'Player'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {conv.unread && conv.unread > 0 && (
                      <span className="rounded-full bg-primary px-2 py-1 text-xs text-white">{conv.unread} new</span>
                    )}
                    <Button size="sm" onClick={() => router.push(`/physician/player/${conv.player_id}/chat`)}>
                      Message
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Players List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Registered Players
          </CardTitle>
          <CardDescription>
            {players.length} {players.length === 1 ? 'player' : 'players'} registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          {players.length === 0 ? (
            <p className="text-center text-text-secondary">No players registered yet.</p>
          ) : (
            <div className="space-y-4">
              {players.map((player) => (
                <div
                  key={player.user_id}
                  className="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-gray-50"
                  onClick={() => handlePlayerClick(player)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-text-primary">
                          {player.full_name}
                        </h3>
                        {player.unreadMessages && player.unreadMessages > 0 && (
                          <span className="rounded-full bg-primary px-2 py-1 text-xs text-white">
                            {player.unreadMessages} new
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary">{player.email}</p>
                      <p className="text-sm text-text-secondary">Age: {player.age}</p>
                      {player.latestLog ? (
                        <div className="mt-2 flex items-center gap-2">
                          <ActivityIcon className="h-4 w-4 text-text-secondary" />
                          <span className="text-sm text-text-secondary">
                            Last check-in: {formatDate(player.latestLog.submitted_at)}
                          </span>
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{
                              backgroundColor: getHealthColorHex(
                                getHealthColor(player.latestLog.health_score)
                              ),
                            }}
                          />
                          <span className="text-sm font-medium text-text-primary">
                            Health Score: {player.latestLog.health_score}
                          </span>
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-text-secondary">No check-ins yet</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/physician/player/${player.user_id}/chat`);
                        }}
                      >
                        Message
                      </Button>
                      <ChevronRight className="h-5 w-5 text-text-secondary" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

