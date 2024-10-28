import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jocjkpzbwoxjzpklqveu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvY2prcHpid294anpwa2xxdmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAwOTM3MTUsImV4cCI6MjA0NTY2OTcxNX0.Daw4gholRNC8rht1AzPdPXEN4cYnG4A4UnmZ5vBqwbw';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Profile = {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
};

export type Artwork = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  image_url: string;
  created_at: string;
};