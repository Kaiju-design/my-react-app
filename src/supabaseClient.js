import { createClient } from '@supabase/supabase-js';

// This code reads the secret keys we saved in Step 3
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// This creates the client that connects your app to Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);