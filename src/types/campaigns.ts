export interface Campaign {
  id: string;
  name: string;
  type: "whatsapp" | "email" | "multi-channel";
  status: "draft" | "scheduled" | "running" | "completed" | "paused";
  segment: {
    type: "active_clients" | "inactive_leads" | "vip_clients" | "custom";
    conditions: SegmentCondition[];
  };
  content: {
    whatsapp?: WhatsAppTemplate;
    email?: EmailTemplate;
  };
  schedule: {
    startDate: Date;
    endDate?: Date;
    frequency?: "once" | "daily" | "weekly" | "monthly";
    timeSlots?: string[];
  };
  analytics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    responded: number;
    converted: number;
  };
  aiSettings: {
    enabled: boolean;
    personalization: boolean;
    optimization: boolean;
    responseHandling: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SegmentCondition {
  field: string;
  operator:
    | "equals"
    | "contains"
    | "greater_than"
    | "less_than"
    | "between"
    | "in";
  value: unknown;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
  buttons?: {
    type: "url" | "phone" | "quick_reply";
    text: string;
    value: string;
  }[];
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  design: Record<string, unknown>; // Email editor JSON design
}

export interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalSent: number;
  averageOpenRate: number;
  averageClickRate: number;
  conversionRate: number;
}
