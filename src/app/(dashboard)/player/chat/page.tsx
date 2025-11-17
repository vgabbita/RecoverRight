'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { formatDateTime } from '@/lib/utils';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';

interface Conversation {
  id: number;
  physician_id: string;
  physician_name?: string;
  last_message_at?: string;
  unread_count?: number;
}

interface Physician {
  user_id: string;
  full_name: string;
  email?: string;
}

export default function PlayerConversationsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [availablePhysicians, setAvailablePhysicians] = useState<Physician[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      // Load existing conversations
      const { data: convs } = await supabase
        .from('conversations')
        .select('id, physician_id, last_message_at')
        .eq('player_id', user.id)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (convs) {
        // Get physician names for each conversation
        const physicianIds = convs.map(c => c.physician_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', physicianIds);

        const convsWithNames: Conversation[] = (convs as any[]).map((c) => ({
          id: c.id,
          physician_id: c.physician_id,
          physician_name: (profiles || []).find((p: any) => p.user_id === c.physician_id)?.full_name,
          last_message_at: c.last_message_at,
        }));

        // Get unread counts per conversation
        for (const conv of convsWithNames) {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('read_by_recipient', false)
            .neq('sender_id', user.id);

          conv.unread_count = count || 0;
        }

        setConversations(convsWithNames);
      }

      // Load all physicians
      const { data: physicianUsers } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('role', 'physician');

      if (physicianUsers) {
        const physicianIds = physicianUsers.map(u => u.id);
        const { data: physicianProfiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', physicianIds);

        const physicians: Physician[] = (physicianUsers as any[]).map((u) => ({
          user_id: u.id,
          email: u.email,
          full_name: (physicianProfiles || []).find((p: any) => p.user_id === u.id)?.full_name || 'Unknown',
        }));

        setAvailablePhysicians(physicians);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartConversation = async (physicianId: string) => {
    if (!currentUserId) return;

    try {
      // Check if conversation already exists
      let { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('player_id', currentUserId)
        .eq('physician_id', physicianId)
        .maybeSingle();

      if (existingConv) {
        // Navigate to existing conversation
        router.push(`/player/chat/${existingConv.id}`);
        return;
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          player_id: currentUserId,
          physician_id: physicianId,
        })
        .select()
        .single();

      if (error) throw error;

      if (newConv) {
        router.push(`/player/chat/${newConv.id}`);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const filteredPhysicians = availablePhysicians.filter(p =>
    p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get physicians that don't have conversations yet
  const physicianIdsWithConversations = new Set(conversations.map(c => c.physician_id));
  const newPhysicians = filteredPhysicians.filter(
    p => !physicianIdsWithConversations.has(p.user_id)
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-text-secondary">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Messages</h1>
          <p className="text-text-secondary">Manage conversations with physicians</p>
        </div>
        <Button onClick={() => setShowNewMessage(!showNewMessage)}>
          <Send className="mr-2 h-4 w-4" />
          New Message
        </Button>
      </div>

      {/* New Message Section */}
      {showNewMessage && (
        <Card>
          <CardHeader>
            <CardTitle>Start New Conversation</CardTitle>
            <CardDescription>Select a physician to message</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Search physicians by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {newPhysicians.length === 0 ? (
                <p className="text-center text-text-secondary">
                  {searchQuery
                    ? 'No physicians match your search'
                    : 'No new physicians available'}
                </p>
              ) : (
                <div className="space-y-2">
                  {newPhysicians.map((physician) => (
                    <div
                      key={physician.user_id}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium text-text-primary">{physician.full_name}</p>
                        <p className="text-sm text-text-secondary">{physician.email}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleStartConversation(physician.user_id)}
                      >
                        Message
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversations
          </CardTitle>
          <CardDescription>
            {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {conversations.length === 0 ? (
            <p className="text-center text-text-secondary">
              No conversations yet. Start one by clicking "New Message"
            </p>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className="flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50"
                  onClick={() => router.push(`/player/chat/${conv.id}`)}
                >
                  <div className="flex-1">
                    <p className="font-medium text-text-primary">
                      {conv.physician_name || 'Physician'}
                    </p>
                    {conv.last_message_at && (
                      <p className="text-sm text-text-secondary">
                        {formatDateTime(conv.last_message_at)}
                      </p>
                    )}
                  </div>
                  {conv.unread_count && conv.unread_count > 0 && (
                    <span className="ml-2 rounded-full bg-primary px-2 py-1 text-xs text-white">
                      {conv.unread_count} new
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
