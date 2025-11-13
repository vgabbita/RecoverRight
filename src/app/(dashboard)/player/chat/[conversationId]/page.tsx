'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { formatDateTime } from '@/lib/utils';
import { ArrowLeft, Send, FileText } from 'lucide-react';

interface Message {
  id: number;
  conversation_id: number;
  sender_id: string;
  content: string;
  sent_at: string;
  read_by_recipient: boolean;
  attachments?: {
    id: number;
    file_path: string;
    file_type: string;
  }[];
}

export default function PlayerChatPage() {
  const router = useRouter();
  const params = useParams();
  const conversationIdParam = params.conversationId as string;
  const conversationId = Number(conversationIdParam);
  const supabase = createClient();

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [physicianName, setPhysicianName] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat();
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (conversationId) {
      const channel = supabase
        .channel(`conversation-${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            const newMessage = payload.new as Message;
            setMessages((prev) => [...prev, newMessage]);

            // If someone else sent it, mark it read
            if (newMessage.sender_id !== currentUserId) {
              markMessageAsRead(newMessage.id);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [conversationId, currentUserId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      // Load conversation metadata to show physician name
      try {
        const { data: conversation } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .single();

        if (conversation && conversation.physician_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', conversation.physician_id)
            .single();

          if (profile?.full_name) setPhysicianName(profile.full_name);
        }
      } catch (e) {
        // non-fatal
      }

      // Load messages
      const { data: messagesData } = await supabase
        .from('messages')
        .select(`*, message_attachments(*)`)
        .eq('conversation_id', conversationId)
        .order('sent_at', { ascending: true });

      if (messagesData) {
        setMessages(messagesData);

        // Mark unread messages as read (those not sent by current user)
        const unread = messagesData.filter((m: any) => m.sender_id !== user.id && !m.read_by_recipient);
        for (const m of unread) {
          await markMessageAsRead(m.id);
        }
      }
    } catch (error) {
      console.error('Error initializing player chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const markMessageAsRead = async (messageId: number) => {
    await supabase
      .from('messages')
      .update({ read_by_recipient: true })
      .eq('id', messageId);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !conversationId || !currentUserId) return;

    try {
      setSending(true);

      const { data: insertedMessage, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: messageInput.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      if (insertedMessage) {
        setMessages((prev) => [...prev, insertedMessage as Message]);
      }

      setMessageInput('');
    } catch (error) {
      console.error('Error sending message (player):', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-text-secondary">Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/player')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{physicianName ? `Chat with ${physicianName}` : 'Messages'}</h1>
            <p className="text-sm text-text-secondary">Private conversation</p>
          </div>
        </div>
      </div>

      <Card className="flex flex-col" style={{ height: 'calc(100vh - 250px)' }}>
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Messages</CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-text-secondary">No messages yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isCurrentUser = message.sender_id === currentUserId;

                return (
                  <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-lg p-3 ${isCurrentUser ? 'bg-primary text-white' : 'bg-gray-100 text-text-primary'}`}>
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>

                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.attachments.map((attachment) => (
                            <a key={attachment.id} href={attachment.file_path} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm underline">
                              <FileText className="h-4 w-4" />
                              View Attachment
                            </a>
                          ))}
                        </div>
                      )}

                      <p className={`mt-1 text-xs ${isCurrentUser ? 'text-white/70' : 'text-text-secondary'}`}>
                        {formatDateTime(message.sent_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </CardContent>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={messageInput}
              onChange={(e: any) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={sending}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!messageInput.trim() || sending} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-xs text-text-secondary">Press Enter to send, Shift+Enter for new line</p>
        </div>
      </Card>
    </div>
  );
}
