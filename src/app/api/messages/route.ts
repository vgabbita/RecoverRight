import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const conversationId = searchParams.get('conversation_id');

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
    }

    // Fetch messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        *,
        message_attachments (*)
      `)
      .eq('conversation_id', conversationId)
      .order('sent_at', { ascending: true });

    if (messagesError) {
      throw messagesError;
    }

    return NextResponse.json({ messages: messages || [] });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
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
    const { conversation_id, content, attachment_file_path, attachment_file_type } = body;

    if (!conversation_id || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert message
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id,
        sender_id: user.id,
        content,
        read_by_recipient: false,
      })
      .select()
      .single();

    if (messageError) {
      throw messageError;
    }

    if (attachment_file_path && attachment_file_type) {
      const { error: attachmentError } = await supabase
        .from('message_attachments')
        .insert({
          message_id: messageData.id,
          file_path: attachment_file_path,
          file_type: attachment_file_type,
        });

      if (attachmentError) {
        console.error('Error adding attachment:', attachmentError);
      }
    }

    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversation_id);

    return NextResponse.json({ message: messageData });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
