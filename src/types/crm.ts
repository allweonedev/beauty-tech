export type LeadStage =
  | "new_contact"
  | "interested"
  | "negotiation"
  | "payment"
  | "closed";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  stage: LeadStage;
  profile: {
    type: "hot" | "warm" | "cold";
    potentialValue: number;
    interests: string[];
    responseTime: number; // in hours
  };
  interactions: Interaction[];
  automations: AutomationTask[];
  createdAt: Date;
  updatedAt: Date;
  lastContactDate?: Date;
  nextFollowUp?: Date;
  assignedTo?: string;
  tags: string[];
  notes: string;
}

export interface Interaction {
  id: string;
  type: "email" | "call" | "meeting" | "whatsapp" | "form" | "other";
  direction: "inbound" | "outbound";
  subject: string;
  content: string;
  date: Date;
  outcome?: string;
  nextSteps?: string;
}

export interface AutomationTask {
  id: string;
  type:
    | "schedule_link"
    | "payment_link"
    | "reengagement"
    | "reminder"
    | "promotion";
  status: "pending" | "sent" | "completed" | "failed";
  scheduledFor: Date;
  completedAt?: Date;
  template: string;
  data: Record<string, unknown>;
}

export interface LeadStats {
  totalLeads: number;
  stageDistribution: Record<LeadStage, number>;
  conversionRate: number;
  averageResponseTime: number;
  topSources: Array<{ source: string; count: number }>;
}
