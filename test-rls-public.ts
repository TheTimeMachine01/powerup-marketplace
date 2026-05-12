
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRLS() {
    console.log('Testing RLS...');

    // 1. Sign in (you'll need a valid user email/password or existing session token, 
    // but for RLS check we can try fetching public products first)

    console.log('Fetching products (public)...');
    const { data: products, error: prodError } = await supabase.from('products').select('*').limit(5);
    if (prodError) console.error('Product fetch error:', prodError);
    else console.log('Products fetched:', products?.length);

    // 2. Test user_roles access (requires auth)
    // We can't easily test authenticated RLS from this script without a real user token.
    // But we can check if the public policy exists by querying pg_policies if we had admin access.
    // Since we use the potential anon key, we are limited.

    // Let's rely on the user's report.
}

testRLS();
