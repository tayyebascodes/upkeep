export type TicketCategory =
  | 'Plumbing'
  | 'Electrical'
  | 'HVAC'
  | 'Appliance'
  | 'Structural'
  | 'Other';

export type TicketSeverity = 'Emergency' | 'High' | 'Medium' | 'Low';

export type TicketStatus = 'Pending' | 'In Progress' | 'Resolved';

export type TicketSource = 'chat' | 'voice_call' | 'web_call';

export interface Property {
  id: string;
  name: string;
  slug: string;
  address?: string;
  emergency_contact?: string;
  created_at?: string;
}

export interface Ticket {
  id: string;
  property_id: string;
  unit_number: string;
  tenant_name?: string;
  tenant_phone?: string;
  category: TicketCategory;
  severity: TicketSeverity;
  title: string;
  description?: string;
  status: TicketStatus;
  source: TicketSource;
  audio_recording_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface KnowledgeChunk {
  id: string;
  property_id: string;
  content: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
}
