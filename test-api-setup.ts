/**
 * Test script to diagnose API data fetching issues
 * Run with: npx tsx test-api-setup.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hbgsasjhhfbprzejwsbl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZ3Nhc2poaGZicHJ6ZWp3c2JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMDQ0NjksImV4cCI6MjA4NTc4MDQ2OX0.bPf7ENcO98V9Htia0PAjWLfVfPvCcLB1bYt74MvZbhc';

async function testAPI() {
  console.log('='.repeat(60));
  console.log('🧪 POWERUP MARKETPLACE - API DIAGNOSTIC TEST');
  console.log('='.repeat(60));
  console.log('');

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Test 1: Connection
  console.log('📡 Test 1: Supabase Connection');
  console.log('-'.repeat(60));
  try {
    const { data: { session } } = await supabase.auth.getSession();
    console.log('✓ Connection successful');
    console.log(`   Status: ${session ? 'Authenticated' : 'Anonymous'}`);
    console.log('');
  } catch (error) {
    console.error('✗ Connection failed:', error);
    return;
  }

  // Test 2: Check if table exists and has data
  console.log('📊 Test 2: Products Table Status');
  console.log('-'.repeat(60));
  try {
    const { data: products, error, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .limit(1);

    if (error) {
      console.error('✗ Error querying products:', error.message);
      console.error('   Code:', error.code);
      
      if (error.code === '42501') {
        console.error('');
        console.error('🔒 RLS POLICY ISSUE DETECTED!');
        console.error('   The products table has Row Level Security enabled');
        console.error('   but no public read policy exists.');
      }
    } else {
      console.log(`✓ Products table accessible`);
      console.log(`   Total records: ${count || 0}`);
      
      if (count === 0) {
        console.log('   ⚠️  WARNING: Table is empty - data import needed');
      } else {
        console.log(`   Sample product: ${products?.[0]?.name}`);
      }
    }
    console.log('');
  } catch (error) {
    console.error('✗ Unexpected error:', error);
  }

  // Summary and next steps
  console.log('📋 DIAGNOSTIC SUMMARY');
  console.log('='.repeat(60));
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*', { count: 'exact' });

  const hasRLSError = error?.code === '42501';
  const hasData = products && products.length > 0;

  if (hasRLSError) {
    console.log('');
    console.log('❌ ISSUE: RLS Policy Blocking Access');
    console.log('');
    console.log('SOLUTION:');
    console.log('1. Go to: https://app.supabase.com');
    console.log('2. Select project and navigate to SQL Editor');
    console.log('3. Run this SQL command:');
    console.log('');
    console.log('   CREATE POLICY "Allow public read" ON public.products');
    console.log('   FOR SELECT USING (true);');
    console.log('');
    console.log('4. Then run: npx tsx import-products.ts');
    console.log('');
  } else if (!hasData) {
    console.log('');
    console.log('⚠️  Empty Table Detected');
    console.log('');
    console.log('SOLUTION:');
    console.log('Run: npx tsx import-products.ts');
    console.log('');
  } else {
    console.log('');
    console.log('✅ API is fully configured!');
    console.log('   - RLS policy: ✓ Allows public read');
    console.log('   - Products data: ✓ ' + products.length + ' records');
    console.log('');
  }

  console.log('='.repeat(60));
}

testAPI().catch(console.error);
