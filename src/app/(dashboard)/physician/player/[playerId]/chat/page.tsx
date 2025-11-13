'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { formatDateTime } from '@/lib/utils';
import { ArrowLeft, Send, Paperclip, FileText } from 'lucide-react';

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

interface PlayerProfile {
  full_name: string;
  email?: string;
}

export default function PhysicianPlayerChat() {
  const router = useRouter();
  const params = useParams();
  const playerId = params.playerId as string;
  const supabase = createClient();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat();
  }, [playerId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (conversationId) {
      // Subscribe to new messages
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
            
            // Mark as read if sender is not current user
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

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      // Get player profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', playerId)
        .single();

      if (profile) {
        setPlayerProfile(profile);
      }

      // Get or create conversation
      let { data: conversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('player_id', playerId)
        .eq('physician_id', user.id)
        .maybeSingle();

      if (!conversation) {
        // Create new conversation
        const { data: newConversation } = await supabase
          .from('conversations')
          .insert({
            player_id: playerId,
            physician_id: user.id,
          })
          .select()
          .single();

        conversation = newConversation;
      }

      if (conversation) {
        setConversationId(conversation.id);
        
        // Load messages
        const { data: messagesData } = await supabase
          .from('messages')
          .select(`
            *,
            message_attachments (*)
          `)
          .eq('conversation_id', conversation.id)
          .order('sent_at', { ascending: true });

        if (messagesData) {
          setMessages(messagesData);
          
          // Mark unread messages as read
          const unreadMessages = messagesData.filter(
            (msg) => msg.sender_id !== user.id && !msg.read_by_recipient
          );
          
          for (const msg of unreadMessages) {
            await markMessageAsRead(msg.id);
          }
        }
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
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

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: messageInput.trim(),
        });

      if (error) throw error;

      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/physician')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Chat with {playerProfile?.full_name}
            </h1>
            <p className="text-sm text-text-secondary">Private conversation</p>
          </div>
        </div>
      </div>

      {/* Chat Card */}
      <Card className="flex flex-col" style={{ height: 'calc(100vh - 250px)' }}>
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Messages</CardTitle>
        </CardHeader>
        
        {/* Messages Area */}
        <CardContent className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-text-secondary">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isCurrentUser = message.sender_id === currentUserId;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isCurrentUser
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-text-primary'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      
                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.attachments.map((attachment) => (
                            <a
                              key={attachment.id}
                              href={attachment.file_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm underline"
                            >
                              <FileText className="h-4 w-4" />
                              View Attachment
                            </a>
                          ))}
                        </div>
                      )}
                      
                      <p
                        className={`mt-1 text-xs ${
                          isCurrentUser ? 'text-white/70' : 'text-text-secondary'
                        }`}
                      >
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

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={sending}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || sending}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-xs text-text-secondary">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </Card>
    </div>
  );
}
