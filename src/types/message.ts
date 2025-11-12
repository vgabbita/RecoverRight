export interface Message {
  id: number;
  conversation_id: number;
  sender_id: string;
  content: string;
  sent_at: string;
  read_by_recipient: boolean;
}

export interface Conversation {
  id: number;
  player_id: string;
  physician_id: string;
  created_at: string;
  last_message_at: string;
}

export interface MessageAttachment {
  id: number;
  message_id: number;
  file_path: string;
  file_type: string;
  uploaded_at: string;
}
