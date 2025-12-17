import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { secureStorage } from './secureStorage';

const supabaseUrl = 
  Constants.expoConfig?.extra?.supabaseUrl ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  '';
  
const supabaseAnonKey = 
  Constants.expoConfig?.extra?.supabaseAnonKey ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  '';

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_project_url_here' || supabaseAnonKey === 'your_supabase_anon_key_here') {
  const errorMessage = `
Missing or invalid Supabase environment variables!

Please create a .env file in the root directory with:
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

To get these values:
1. Go to https://supabase.com and create a project
2. Go to Settings > API
3. Copy the "Project URL" and "anon public" key
4. Add them to your .env file
5. Restart the Expo development server

Current values:
URL: ${supabaseUrl || 'NOT SET'}
KEY: ${supabaseAnonKey ? '***' + supabaseAnonKey.slice(-4) : 'NOT SET'}
`;
  throw new Error(errorMessage);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

