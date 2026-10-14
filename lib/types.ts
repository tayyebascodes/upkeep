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

export type UserRole = 'company' | 'tenant';

export interface Company {
  id: string;
  name: string;
  owner_id: string;
  created_at?: string;
}

export interface Property {
  id: string;
  company_id?: string;
  name: string;
  slug: string;
  address?: string | null;
  emergency_contact?: string | null;
  agent_voice?: string;
  agent_language?: string;
  agent_tone?: string;
  is_demo?: boolean;
  created_at?: string;
}

export interface Profile {
  id: string;
  role: UserRole;
  email?: string | null;
  full_name?: string | null;
  phone?: string | null;
  company_id?: string | null;
  property_id?: string | null;
  unit_number?: string | null;
  created_at?: string;
}

export interface Ticket {
  id: string;
  property_id: string;
  tenant_id?: string | null;
  unit_number: string;
  tenant_name?: string | null;
  tenant_phone?: string | null;
  category: TicketCategory;
  severity: TicketSeverity;
  title: string;
  description?: string | null;
  status: TicketStatus;
  source: TicketSource;
  audio_recording_url?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface PropertyDocument {
  id: string;
  property_id: string;
  name: string;
  storage_path: string;
  created_at: string;
}
