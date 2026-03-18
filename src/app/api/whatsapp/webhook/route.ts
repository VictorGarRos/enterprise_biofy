import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import axios from 'axios';

// Verification Token for Webhook Setup
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'hulkes_meta_2026';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook Verified');
      return new Response(challenge, { status: 200 });
    } else {
      return new Response('Verification failed', { status: 403 });
    }
  }
  return new Response('No data', { status: 400 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Webhook Received:', JSON.stringify(body, null, 2));

    // Handle incoming messages
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const messages = value?.messages;

      if (messages && messages.length > 0) {
        const message = messages[0];
        console.log('Message Received from:', message.from, 'Content:', message.text?.body);
        
        await supabase.from('messages').insert([{
          lead_phone: message.from,
          content: message.text?.body || 'Un messaggio senza testo',
          type: 'received',
          timestamp: new Date()
        }]);
      }

      // Handle new Leads (Meta Lead Ads)
      if (change?.field === 'leadgen') {
        const leadgenId = value?.leadgen_id;
        console.log('New Lead Ads Webhook with ID:', leadgenId);

        // Fetch lead details from Meta with leadgenId
        const metaToken = process.env.META_ACCESS_TOKEN;
        if (metaToken && leadgenId) {
          try {
            const metaRes = await axios.get(`https://graph.facebook.com/v21.0/${leadgenId}`, {
              params: { access_token: metaToken }
            });

            const fieldData = metaRes.data?.field_data || [];
            let fullName = 'Nuevo Lead';
            let phoneNumber = '';
            let email = '';

            fieldData.forEach((field: any) => {
              if (field.name === 'full_name' || field.name === 'first_name') fullName = field.values[0];
              if (field.name === 'phone_number') phoneNumber = field.values[0];
              if (field.name === 'email') email = field.values[0];
            });

            const cleanPhone = phoneNumber.replace(/\+/g, '').replace(/\s/g, '');

            await supabase.from('leads').insert([{
              id: leadgenId,
              full_name: fullName,
              phone_number: cleanPhone,
              email: email,
              campaign_name: 'Meta Ads Campaign',
              status: 'new'
            }]);

          } catch (err: any) {
            console.error('Meta API Error Fetching Lead Details:', err.response?.data || err.message);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Webhook POST error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
