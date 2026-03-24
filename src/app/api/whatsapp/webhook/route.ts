import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import axios from 'axios';

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'hulkes_meta_2026';

const BIOFY_PAGE_ID = process.env.BIOFY_PAGE_ID || '2023428868099937';
const AQUASIMPLY_PAGE_ID = process.env.AQUASIMPLY_PAGE_ID || '1837203023713578';

const WELCOME_MESSAGES: Record<string, string> = {
  biofy: `Hola 👋\nGracias por contactar con Culligan Biofy.\n\nHemos recibido correctamente tus datos. En breve, uno/a de nuestros/as asesores/as se pondrá en contacto contigo para ayudarte y resolver cualquier duda.\n\nMientras tanto, si necesitas algo más, puedes responder a este mensaje 😊`,
  aquasimply: `Hola 👋\nGracias por contactar con Aquasimply.\n\nHemos recibido correctamente tus datos. En breve, uno/a de nuestros/as asesores/as se pondrá en contacto contigo para ayudarte y resolver cualquier duda.\n\nMientras tanto, si necesitas algo más, puedes responder a este mensaje 😊`,
};

function detectCampaign(pageId: string): { brand: string; campaignName: string } {
  if (pageId === AQUASIMPLY_PAGE_ID) {
    return { brand: 'aquasimply', campaignName: 'Aquasimply' };
  }
  if (pageId === BIOFY_PAGE_ID) {
    return { brand: 'biofy', campaignName: 'Biofy' };
  }
  // Default: Biofy
  return { brand: 'biofy', campaignName: 'Biofy' };
}

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

    // Handle incoming WhatsApp messages
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
          content: message.text?.body || 'Mensaje sin texto',
          type: 'received',
          timestamp: new Date()
        }]);
      }
    }

    // Handle new Leads (Meta Lead Ads) — comes with object: 'page'
    const allEntries = body.entry || [];
    for (const entry of allEntries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change?.field === 'leadgen') {
          const value = change?.value;
          const leadgenId = value?.leadgen_id;
          const pageId = value?.page_id || entry?.id || '';
          console.log('New Lead Ads — ID:', leadgenId, '| Page:', pageId);

          const { brand, campaignName } = detectCampaign(pageId);
          const metaToken = process.env.META_ACCESS_TOKEN;
          const phoneId = process.env.WHATSAPP_PHONE_ID;

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
                campaign_name: campaignName,
                status: 'new'
              }]);

              console.log(`Lead guardado: ${fullName} | ${campaignName} | ${cleanPhone}`);

              // AUTO-SEND: mensaje de bienvenida según campaña
              if (phoneId && cleanPhone) {
                const welcomeMessage = WELCOME_MESSAGES[brand];
                try {
                  await axios.post(
                    `https://graph.facebook.com/v21.0/${phoneId}/messages`,
                    {
                      messaging_product: 'whatsapp',
                      to: cleanPhone,
                      type: 'text',
                      text: { body: welcomeMessage }
                    },
                    {
                      headers: {
                        'Authorization': `Bearer ${metaToken}`,
                        'Content-Type': 'application/json'
                      }
                    }
                  );

                  await supabase.from('messages').insert([{
                    lead_phone: cleanPhone,
                    content: welcomeMessage,
                    type: 'sent',
                    timestamp: new Date()
                  }]);

                  console.log(`Mensaje enviado a ${cleanPhone} (${campaignName})`);
                } catch (err: any) {
                  console.error('Error al enviar mensaje:', err.response?.data || err.message);
                }
              }

            } catch (err: any) {
              console.error('Error Meta API:', err.response?.data || err.message);
            }
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
