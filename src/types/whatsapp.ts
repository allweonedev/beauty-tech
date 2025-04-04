export interface WhatsAppMessage {
  id: string;
  type: "inbound" | "outbound";
  content: string;
  timestamp: Date;
  status: "sent" | "delivered" | "read" | "failed";
  metadata?: {
    intent?: string;
    confidence?: number;
    entities?: Record<string, unknown>;
  };
}

export interface WhatsAppContact {
  id: string;
  name: string;
  phone: string;
  status: "active" | "inactive" | "blocked";
  lastMessage?: WhatsAppMessage;
  lastActivity: Date;
  tags: string[];
  stage: "new" | "engaged" | "qualified" | "converted" | "lost";
  assignedTo?: string;
  notes?: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
  category: "welcome" | "follow_up" | "scheduling" | "payment" | "reengagement";
  language: string;
  status: "approved" | "pending" | "rejected";
}

export interface WhatsAppStats {
  totalContacts: number;
  activeChats: number;
  averageResponseTime: number;
  messagesSent: number;
  messagesReceived: number;
  conversionRate: number;
}

export interface AIResponse {
  intent: string;
  confidence: number;
  reply: string;
  actions?: {
    type: "schedule" | "payment" | "crm_update" | "notification";
    data: Record<string, unknown>;
  }[];
  entities?: Record<string, unknown>;
}
