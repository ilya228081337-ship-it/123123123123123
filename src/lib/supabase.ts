import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'employee' | 'manager';
  department_name: string;
  created_at: string;
}

export interface WorkloadReport {
  id: string;
  user_id: string;
  workload_level: number;
  notes: string;
  created_at: string;
}
