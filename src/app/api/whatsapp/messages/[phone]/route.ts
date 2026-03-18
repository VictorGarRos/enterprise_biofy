import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ phone: string }> }
) {
  const { phone } = await params;
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('lead_phone', phone)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
