import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// This API route handles restaurant settings updates using the SERVICE_ROLE_KEY
// to bypass RLS securely on the server-side.
export async function POST(request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabaseAdmin
      .from('restaurants')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('API Settings Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('API Server Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
