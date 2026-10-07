import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nvwcdmxiwmvxgpwjntxc.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_5G_1ogZ8vqihfEHBjy31ZA_W-i8CQTY';

export const supabase = createClient(supabaseUrl, supabaseKey);
