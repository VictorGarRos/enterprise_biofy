import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { to, message } = await request.json();
    const token = process.env.META_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;

    if (!token || !phoneId) throw new Error('Missing Meta API config');

    const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;
    
    // Send message to WhatsApp Cloud API
    const response = await axios.post(url, {
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: { body: message }
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Save to database
    await supabase.from('messages').insert([{
      lead_phone: to,
      content: message,
      type: 'sent',
      timestamp: new Date()
    }]);

    return NextResponse.json({ success: true, response: response.data });
  } catch (err: any) {
    console.error('WhatsApp Send Error:', err.response?.data || err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
