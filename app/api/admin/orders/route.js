import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * GET /api/admin/orders — list all orders, or one order: ?id=<uuid>
 * (single-order fetch fixes bill page in a new tab when client list is empty.)
 */
export async function GET(request) {
  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY missing', orders: null, order: null },
      { status: 503 }
    );
  }

  const id = request.nextUrl.searchParams.get('id');
  if (id) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('GET /api/admin/orders?id:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ order: null }, { status: 404 });
    }

    return NextResponse.json({ order: data });
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('GET /api/admin/orders:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ orders: data || [] });
}

/** Update order status — bypasses RLS for kitchen actions. */
export async function PATCH(request) {
  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY missing' },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { id, status } = body;
  if (!id || !status) {
    return NextResponse.json({ error: 'id and status required' }, { status: 400 });
  }

  const updatedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: updatedAt })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('PATCH /api/admin/orders:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ order: data });
}
