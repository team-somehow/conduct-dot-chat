// API Response Types
export interface Chatbot {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  chatbot_id: string;
  visitor_id: string;
  title: string;
  created_at: string;
  message_count: number;
  last_message_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  index: number;
}

// API Request Types
export interface CreateConversationRequest {
  title: string;
  visitor_id: string;
}

export interface SendMessageRequest {
  content: string;
  visitor_id: string;
}

// API Response Wrappers
export interface ChatbotsResponse {
  success: boolean;
  data: {
    chatbots: Chatbot[];
  };
}

export interface ConversationsResponse {
  success: boolean;
  data: {
    conversations: Conversation[];
  };
}

export interface SingleConversationResponse {
  success: boolean;
  data: Conversation;
}

export interface MessagesResponse {
  success: boolean;
  data: {
    messages: Message[];
  };
}

// Error Types
export interface ApiError {
  message: string;
  status: number;
}
