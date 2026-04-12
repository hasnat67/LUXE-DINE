const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrders() {
  console.log('--- Supabase Diagnostic ---');
  
  // 1. Check if tables exist
  const { data: tables, error: tablesError } = await supabase
    .from('orders')
    .select('id')
    .limit(1);

  if (tablesError) {
    console.error('Error selecting from orders table:', tablesError.message);
    if (tablesError.message.includes('relation "public.orders" does not exist')) {
      console.log('HINT: The orders table has not been created yet. Run the schema.sql in Supabase SQL Editor.');
    }
  } else {
    console.log('Orders table exists and is accessible.');
  }

  // 2. Check restaurant_tables
  const { data: rt, error: rtError } = await supabase
    .from('restaurant_tables')
    .select('id')
    .limit(5);

  if (rtError) {
    console.error('Error selecting from restaurant_tables:', rtError.message);
  } else {
    console.log(`Found ${rt?.length || 0} tables in restaurant_tables.`);
    if ((rt?.length || 0) === 0) {
      console.log('HINT: No tables found! Orders with table_id will fail due to Foreign Key constraint.');
    }
  }

  // 3. Try a test insert (with a non-existent table ID to see if it fails)
  console.log('Testing insert with table_id=999 (likely non-existent)...');
  const { data: insertData, error: insertError } = await supabase
    .from('orders')
    .insert([{
      items: [{ name: 'Test Item', qty: 1, price: 10 }],
      total_price: 10,
      table_id: 999,
      status: 'pending'
    }]);

  if (insertError) {
    console.log('Insert failed as expected or with error:', insertError.message);
  } else {
    console.log('Insert unexpectedly succeeded with table_id=999. Foreign key constraint might not be active.');
  }
}

checkOrders();
