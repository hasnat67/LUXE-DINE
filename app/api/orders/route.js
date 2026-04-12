import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * POST /api/orders — create an order (server-side so we can use the service role
 * and ensure restaurant_tables rows exist for table_id foreign keys).
 */
export async function POST(request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const key = serviceKey || anonKey;

  if (!supabaseUrl || !key) {
    return NextResponse.json(
      {
        error:
          'Server missing Supabase config. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local. Add SUPABASE_SERVICE_ROLE_KEY so table rows can be created automatically.',
      },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { cartItems, subtotal, tax, serviceCharge, total, tableNum, instructions } = body;

  const items = Array.isArray(cartItems) ? cartItems : [];
  if (items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
  }

  const normalizedItems = items.map((ci) => ({
    id: ci.id,
    name: ci.name,
    qty: ci.quantity || 1,
    price: Number(ci.price) || 0,
  }));

  const tableStr = String(tableNum ?? '').trim();
  if (!tableStr) {
    return NextResponse.json({ error: 'Table number is required' }, { status: 400 });
  }

  const parsedTableId = parseInt(tableStr, 10);
  const validTableId =
    Number.isInteger(parsedTableId) && parsedTableId > 0 ? parsedTableId : null;

  const parsedTax = Number(tax);
  const parsedServiceCharge = Number(serviceCharge);
  const parsedTotal = Number(total);
  const finalTotal = !Number.isNaN(parsedTotal)
    ? parsedTotal
    : Number(subtotal || 0) +
      (Number.isNaN(parsedTax) ? 0 : parsedTax) +
      (Number.isNaN(parsedServiceCharge) ? 0 : parsedServiceCharge);

  const itemsPayload = {
    lines: normalizedItems,
    tableLabel: tableStr,
    specialInstructions: typeof instructions === 'string' ? instructions : '',
  };

  const dbOrderBase = {
    status: 'received',
    items: itemsPayload,
    total_price: Number.isNaN(finalTotal) ? 0 : finalTotal,
    tax: Number.isNaN(parsedTax) ? 0 : parsedTax,
    service_charge: Number.isNaN(parsedServiceCharge) ? 0 : parsedServiceCharge,
    table_id: validTableId,
  };

  const supabase = createClient(supabaseUrl, key);

  if (validTableId && serviceKey) {
    const { error: upsertErr } = await supabase.from('restaurant_tables').upsert(
      { id: validTableId, status: 'available' },
      { onConflict: 'id' }
    );
    if (upsertErr) {
      console.error('restaurant_tables upsert:', upsertErr);
    }
  }

  async function tryInsert(orderRow) {
    return supabase.from('orders').insert([orderRow]).select().single();
  }

  let { data, error } = await tryInsert(dbOrderBase);

  if (error?.code === '23503' && dbOrderBase.table_id != null) {
    const second = await tryInsert({
      ...dbOrderBase,
      table_id: null,
    });
    data = second.data;
    error = second.error;
  }

  if (error) {
    console.error('orders insert:', error);
    return NextResponse.json(
      {
        error:
          error.message ||
          'Could not save the order. If this persists, add SUPABASE_SERVICE_ROLE_KEY to .env.local and run the seed so tables 1–12 exist.',
        code: error.code,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ order: data });
}
