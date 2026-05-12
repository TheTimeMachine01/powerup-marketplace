import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = 'https://hbgsasjhhfbprzejwsbl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZ3Nhc2poaGZicHJ6ZWp3c2JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMDQ0NjksImV4cCI6MjA4NTc4MDQ2OX0.bPf7ENcO98V9Htia0PAjWLfVfPvCcLB1bYt74MvZbhc';

// Parse CSV manually
function parseCSV(csvContent: string) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj: any = {};
    headers.forEach((header, i) => {
      const value = values[i];
      // Convert numeric strings to numbers
      if (!isNaN(Number(value)) && value !== '') {
        obj[header] = Number(value);
      } else {
        obj[header] = value;
      }
    });
    return obj;
  });
}

async function importProducts() {
  console.log('🚀 Starting product import...\n');

  try {
    // Read CSV file
    const csvPath = path.join(__dirname, 'Media', 'data.csv');
    console.log('📖 Reading CSV file:', csvPath);
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const products = parseCSV(csvContent);
    console.log(`✓ Found ${products.length} products in CSV\n`);

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Clear existing products (optional)
    console.log('🧹 Clearing existing products...');
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError && deleteError.code !== 'PGRST116') {
      console.error('⚠️ Warning clearing products:', deleteError.message);
    } else {
      console.log('✓ Cleared existing products');
    }
    console.log('');

    // Insert products
    console.log('📤 Inserting products into Supabase...');
    const { data, error, count } = await supabase
      .from('products')
      .insert(products)
      .select();

    if (error) {
      console.error('❌ Error inserting products:', error);
      console.error('   Code:', error.code);
      console.error('   Message:', error.message);
      console.error('   Details:', error.details);
      return false;
    }

    console.log(`✓ Successfully inserted ${data?.length || 0} products\n`);

    // Verify
    console.log('🔍 Verifying import...');
    const { data: allProducts, error: verifyError } = await supabase
      .from('products')
      .select('*');

    if (verifyError) {
      console.error('❌ Verification error:', verifyError.message);
    } else {
      console.log(`✓ Database now contains ${allProducts?.length || 0} products`);
      if (allProducts && allProducts.length > 0) {
        console.log('\n📋 Sample products:');
        allProducts.slice(0, 3).forEach((product, i) => {
          console.log(`  ${i + 1}. ${product.name} (${product.brand}) - ₹${product.price}`);
        });
      }
    }

    return true;
  } catch (err: any) {
    console.error('❌ Fatal error:', err.message);
    return false;
  }
}

const success = await importProducts();
process.exit(success ? 0 : 1);
