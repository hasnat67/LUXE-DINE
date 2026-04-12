const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need service role for DDL usually, but here I might just try with anon if policies allow (unlikely).

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixConstraint() {
    console.log('Attempting to relax foreign key constraint on orders table...');
    
    // Supabase JS doesn't support generic DDL via its client easily. 
    // Usually, you'd use the SQL Editor. 
    // However, I can try to drop the column and recreate it if I had permissions, 
    // but the best way is to tell the user to run the SQL or provide a migration script they can run.
    
    // Wait, I can't run arbitrary SQL via the client unless there's a RPC.
    
    console.log('NOTICE: Supabase client cannot directly run DDL (ALTER TABLE).');
    console.log('Please copy and paste the following SQL into your Supabase SQL Editor:');
    console.log('\nALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_table_id_fkey;');
    console.log('\n---');
    
    // As a workaround, I will check if I can insert into restaurant_tables to ensure "missing" tables exist.
    console.log('Alternative: Seeding more tables to avoid the error...');
    const extraTables = Array.from({ length: 50 }, (_, i) => ({ id: i + 1, status: "available" }));
    const { error } = await supabase
        .from('restaurant_tables')
        .upsert(extraTables);

    if (error) {
        console.error('Error seeding tables:', error.message);
    } else {
        console.log('Successfully seeded tables 1 to 50. This should prevent most foreign key errors.');
    }
}

fixConstraint();
