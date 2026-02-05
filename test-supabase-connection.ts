import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hbgsasjhhfbprzejwsbl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZ3Nhc2poaGZicHJ6ZWp3c2JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMTk3ODAsImV4cCI6MjA4NTc5NTc4MH0.placeholder_key';

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    console.log('URL:', SUPABASE_URL);
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Try to fetch from a table or check health
    const { data, error } = await supabase.from('*').select('*').limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Connection successful!');
    return true;
  } catch (err) {
    console.error('❌ Error:', err);
    return false;
  }
}

testConnection();
