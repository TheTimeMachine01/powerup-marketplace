import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hbgsasjhhfbprzejwsbl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZ3Nhc2poaGZicHJ6ZWp3c2JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMTk3ODAsImV4cCI6MjA4NTc5NTc4MH0.placeholder_key';

async function debugSupabase() {
  console.log('🔍 Starting Supabase Debug...\n');

  try {
    // Step 1: Check environment
    console.log('Step 1: Checking environment variables...');
    console.log('✓ SUPABASE_URL:', SUPABASE_URL);
    console.log('✓ Key exists:', !!SUPABASE_ANON_KEY);
    console.log('');

    // Step 2: Create client
    console.log('Step 2: Creating Supabase client...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
    console.log('✓ Client created successfully');
    console.log('');

    // Step 3: Try to fetch products
    console.log('Step 3: Fetching products from database...');
    const { data, error, status, statusText } = await supabase
      .from('products')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Error fetching products:');
      console.error('   Message:', error.message);
      console.error('   Code:', error.code);
      console.error('   Details:', error.details);
      console.error('   Hint:', error.hint);
    } else {
      console.log('✓ Products fetched successfully');
      console.log('  Total records:', data?.length || 0);
      if (data && data.length > 0) {
        console.log('  First product:', JSON.stringify(data[0], null, 2));
      } else {
        console.log('  ⚠️ No products found in table');
      }
    }
    console.log('');

    // Step 4: Get count
    console.log('Step 4: Getting total product count...');
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error getting count:', countError.message);
    } else {
      console.log('✓ Total products in database:', count);
    }
    console.log('');

    // Step 5: Check table structure
    console.log('Step 5: Checking table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('products')
      .select('')
      .limit(0);

    if (tableError) {
      console.error('❌ Table not found:', tableError.message);
    } else {
      console.log('✓ Products table exists');
    }

  } catch (err: any) {
    console.error('❌ Fatal error:', err.message);
  }
}

debugSupabase();
