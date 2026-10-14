import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  !supabaseUrl.includes('your-project');

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Initial sample data fallback for immediate UI testing before keys are populated
export const MOCK_PROPERTY = {
  id: 'a0000000-0000-0000-0000-000000000001',
  name: 'Sunset Heights Apartments',
  slug: 'sunset-heights',
  address: '104 Ocean View Ave, Miami, FL',
  emergency_contact: '+1 (555) 911-0022',
};

export const MOCK_TICKETS = [
  {
    id: 't-101',
    property_id: 'a0000000-0000-0000-0000-000000000001',
    unit_number: 'Unit 304',
    tenant_name: 'Alex Johnson',
    category: 'Plumbing',
    severity: 'High',
    title: 'Leaking faucet',
    description: 'Hot water valve leaking heavily under kitchen sink vanity.',
    status: 'In Progress',
    source: 'voice_call',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 't-102',
    property_id: 'a0000000-0000-0000-0000-000000000001',
    unit_number: 'Unit 112',
    tenant_name: 'Sarah Miller',
    category: 'HVAC',
    severity: 'Medium',
    title: 'AC not working',
    description: 'Thermostat display is active but outdoor condenser is blowing warm air.',
    status: 'In Progress',
    source: 'chat',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 't-103',
    property_id: 'a0000000-0000-0000-0000-000000000001',
    unit_number: 'Building A',
    tenant_name: 'Building Common',
    category: 'Structural',
    severity: 'Low',
    title: 'Elevator issue',
    description: 'East elevator doors shuddering and making squeaking sound on floor 4.',
    status: 'Pending',
    source: 'web_call',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 't-104',
    property_id: 'a0000000-0000-0000-0000-000000000001',
    unit_number: 'Unit 201',
    tenant_name: 'David Lee',
    category: 'Electrical',
    severity: 'Low',
    title: 'Bathroom GFCI tripped',
    description: 'Resolved via AI guidance: tenant pressed reset button on outlet.',
    status: 'Resolved',
    source: 'voice_call',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
  },
];
