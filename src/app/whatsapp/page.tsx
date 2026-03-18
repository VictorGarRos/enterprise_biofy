'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Filter, 
  Phone, 
  Mail, 
  ExternalLink, 
  Calendar,
  CheckCircle2,
  Clock,
  MoreVertical,
  Check,
  Zap,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { IPhoneMockup } from '@/components/whatsapp/iPhoneMockup';
import axios from 'axios';

interface Lead {
  id: string;
  full_name: string;
  phone_number: string;
  email: string;
  campaign_name: string;
  status: string;
  assigned_to?: string;
  created_at: string;
}

interface Message {
  id: string;
  lead_phone: string;
  content: string;
  type: 'sent' | 'received';
  timestamp: string;
}

const DEMO_LEADS: Lead[] = [
  { id: '1', full_name: 'Juan Pérez',   phone_number: '123456789', email: 'juan@demo.com',   campaign_name: 'Campaña Agua Pura · FB',  status: 'new',       created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: '2', full_name: 'María García', phone_number: '987654321', email: 'maria@demo.com',  campaign_name: 'Campaña Agua Pura · IG',  status: 'contacted', created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: '3', full_name: 'Carlos Ruiz',  phone_number: '555666777', email: 'carlos@demo.com', campaign_name: 'Campaña Agua Pura · FB',  status: 'new',       created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
  { id: '4', full_name: 'Ana López',    phone_number: '111222333', email: 'ana@demo.com',    campaign_name: 'Campaña Agua Pura · WA',  status: 'closed',    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
];

function demoMsg(leadPhone: string, type: 'sent' | 'received', content: string, minutesAgo: number): Message {
  return { id: `demo_${leadPhone}_${minutesAgo}`, lead_phone: leadPhone, content, type, timestamp: new Date(Date.now() - 1000 * 60 * minutesAgo).toISOString() };
}

const DEMO_MESSAGES: Record<string, Message[]> = {
  // Juan Pérez — nuevo, acaba de dejar datos, primeras 2 respuestas
  '123456789': [
    demoMsg('123456789', 'sent',     '¡Hola Juan! 👋 Acabamos de recibir tus datos a través de nuestra campaña de agua purificada y queríamos contactarte enseguida.\n\nSoy del equipo de *Biofy Agua* y me gustaría hacerte una pregunta rápida: ¿actualmente bebes agua del grifo, embotellada o de garrafa?', 28),
    demoMsg('123456789', 'received', 'Hola, de garrafa mayormente. El grifo no me fío mucho.', 24),
    demoMsg('123456789', 'sent',     'Te entiendo perfectamente, es algo muy habitual 💧 De hecho, esa es exactamente la razón por la que muchos de nuestros clientes nos contactan.\n\nCon un sistema *Biofy* eliminas la garrafa para siempre: agua purificada al instante desde tu propio grifo, sin plásticos y con un ahorro real desde el primer mes.\n\n¿Qué tipo de vivienda tienes? ¿Piso o casa? Así te recomiendo el dispositivo que mejor se adapta.', 20),
    demoMsg('123456789', 'received', 'Tengo un piso, somos 3 personas.', 15),
  ],

  // María García — contactada, conversación avanzada, cerrando cita
  '987654321': [
    demoMsg('987654321', 'sent',     '¡Hola María! 👋 Acabamos de recibir tus datos y te escribimos desde *Biofy Agua*. Vimos que te interesaste por nuestros sistemas de agua purificada, ¡muchas gracias por confiar en nosotros! 🙌\n\n¿Tienes un momento? Me gustaría hacerte un par de preguntas para recomendarte el sistema más adecuado para tu hogar.', 118),
    demoMsg('987654321', 'received', 'Hola! Sí, vi el anuncio en Instagram y me llamó la atención. Adelante.', 112),
    demoMsg('987654321', 'sent',     'Perfecto 😊 Primera pregunta: ¿actualmente usas agua embotellada, de garrafa o del grifo?\n\nY segunda: ¿tienes piso propio o de alquiler? Esto es importante para saber qué tipo de instalación es mejor para ti.', 106),
    demoMsg('987654321', 'received', 'Embotellada, y el piso es mío. Ya estoy harta de cargar botellas 😅', 99),
    demoMsg('987654321', 'sent',     '¡Te entiendo perfectamente! 😄 Eso es pan de cada día para muchos de nuestros clientes antes de conocernos.\n\nPara tu caso — piso propio, sin querer seguir cargando botellas — nuestro *Vitaqua Ultraslim* es la solución ideal:\n\n✅ Se instala bajo el fregadero, sin obras\n✅ Agua purificada fría al instante\n✅ Elimina cloro, metales y bacterias\n✅ Se amortiza en menos de 12 meses vs botellas\n\n¿Te gustaría que un asesor te llame para explicarte el precio y condiciones sin compromiso? Solo 15 minutos.', 87),
    demoMsg('987654321', 'received', 'Sí, me interesa. ¿Cuándo podríais llamarme?', 80),
  ],

  // Carlos Ruiz — muy nuevo, acaba de llegar
  '555666777': [
    demoMsg('555666777', 'sent',     '¡Hola Carlos! 👋 Acabamos de recibir tus datos a través de nuestra campaña y queríamos escribirte de inmediato.\n\nSoy del equipo de *Biofy Agua*. Para poder ayudarte mejor, ¿me dices cómo consumes el agua actualmente en casa? ¿Grifo, botella o garrafa?', 9),
    demoMsg('555666777', 'received', 'Del grifo, aunque no me convence mucho. A veces sabe raro.', 5),
    demoMsg('555666777', 'sent',     'Ese sabor raro que notas es exactamente el cloro y los minerales que trae el agua de red 🧪 Es muy común, especialmente en zonas con agua dura.\n\nCon un sistema *Biofy* ese problema desaparece desde el primer día: filtras directamente en casa y obtienes agua de calidad mineral sin gastar más.\n\n¿En qué ciudad vives? El nivel de dureza varía mucho y quiero darte la información más precisa posible.', 2),
  ],

  // Ana López — cerrada, cita confirmada, flujo completo
  '111222333': [
    demoMsg('111222333', 'sent',     '¡Hola Ana! 👋 Acabamos de recibir tus datos a través de nuestra campaña y nos ponemos en contacto enseguida, como prometemos siempre.\n\nSoy del equipo de *Biofy Agua*. ¿Puedo preguntarte cómo gestionáis el agua en casa actualmente? ¿Grifo, botella o garrafa?', 298),
    demoMsg('111222333', 'received', 'Hola! Compramos garrafas, vivimos en Córdoba y el agua es malísima.', 291),
    demoMsg('111222333', 'sent',     'Totalmente comprensible 😔 Córdoba tiene una de las aguas más duras de España, con valores que superan los 400 mg/l de carbonato cálcico. Eso afecta al sabor, a los electrodomésticos y a la salud a largo plazo.\n\nPara vuestra situación tengo una pregunta clave: ¿vivís en piso o en casa? Y ¿cuántas personas sois?', 280),
    demoMsg('111222333', 'received', 'Casa adosada, somos 4 en familia.', 268),
    demoMsg('111222333', 'sent',     'Perfecto, con esa información ya puedo recomendaros claramente 👇\n\nPara una *casa adosada con 4 personas en Córdoba*, el sistema indicado es el *Descal Pro 3.0*:\n\n🔧 Descalcifica toda la instalación de la vivienda\n💧 Purifica el agua de consumo a nivel de osmosis\n🏠 Protege lavadora, lavavajillas, caldera y tuberías\n\nEl ahorro respecto a garrafas + mantenimiento de electrodomésticos es enorme. ¿Queréis que un asesor os llame para explicaros precio y condiciones? Son solo 15 minutos.', 252),
    demoMsg('111222333', 'received', 'Sí, nos interesa mucho. ¿Cuándo podéis llamarnos?', 241),
    demoMsg('111222333', 'sent',     '¡Genial! 🙌 Para cerrar la llamada, ¿qué os viene mejor, mañana por la mañana o el jueves por la tarde?', 237),
    demoMsg('111222333', 'received', 'El jueves por la tarde mejor.', 233),
    demoMsg('111222333', 'sent',     '¡Anotado! 📅 *Jueves por la tarde* confirmado.\n\nOs llamará nuestro asesor *Miguel*, que lleva años especializándose en zonas de agua dura como Córdoba. Os dará precio final, condiciones de instalación y responderá cualquier duda, sin ningún compromiso.\n\n¿Hay algo más en lo que pueda ayudaros mientras tanto?', 230),
    demoMsg('111222333', 'received', 'No, todo perfecto. ¡Muchas gracias! 😊', 226),
    demoMsg('111222333', 'sent',     '¡Gracias a vosotros por la confianza! 🙏 Hablamos el jueves. Que paséis un buen día 👋', 224),
  ],
};

export default function WhatsAppPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Initial Fetch
  useEffect(() => {
    const fetchLeads = async () => {
      setLoadingLeads(true);
      try {
        const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setLeads(data && data.length > 0 ? data : DEMO_LEADS);
      } catch (err) {
        setLeads(DEMO_LEADS);
      } finally {
        setLoadingLeads(false);
      }
    };
    fetchLeads();

    // REAL-TIME: Leads
    const leadsChannel = supabase.channel('leads_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, (payload) => {
        setLeads(prev => [payload.new as Lead, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'leads' }, (payload) => {
        setLeads(prev => prev.map(l => l.id === payload.new.id ? payload.new as Lead : l));
      })
      .subscribe();

    return () => { supabase.removeChannel(leadsChannel); };
  }, []);

  // Fetch Messages when lead changes
  useEffect(() => {
    if (!selectedLead) return;

    const fetchMsg = async () => {
      setLoadingMessages(true);
      try {
        const { data } = await supabase.from('messages').select('*').eq('lead_phone', selectedLead.phone_number).order('timestamp', { ascending: true });
        setMessages(data && data.length > 0 ? data : (DEMO_MESSAGES[selectedLead.phone_number] || []));
      } catch (e) {
        setMessages(DEMO_MESSAGES[selectedLead.phone_number] || []);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMsg();

    // REAL-TIME: Messages
    const msgChannel = supabase.channel(`msg_${selectedLead.phone_number}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `lead_phone=eq.${selectedLead.phone_number}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(msgChannel); };
  }, [selectedLead]);

  const handleSendMessage = async (content: string) => {
    if (!selectedLead) return;
    try {
      await axios.post('/api/whatsapp/messages/send', {
        to: selectedLead.phone_number,
        message: content
      });
    } catch (err) {
      console.error('Send Error:', err);
    }
  };

  const filteredLeads = leads.filter(l => 
    l.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.phone_number.includes(searchTerm)
  );

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Sidebar: Leads List */}
      <div className="w-full lg:w-[400px] flex flex-col premium-card overflow-hidden">
        <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Leads Entrantes</h2>
            <div className="px-2 py-1 bg-blue-600/10 rounded-lg border border-blue-600/20 text-[10px] font-black text-blue-500 italic">
              LIVE {leads.length}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
            <input 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-white placeholder:text-zinc-700 outline-none focus:border-blue-500/50 transition-all"
              placeholder="Buscar por nombre o móvil..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar-hide p-2 space-y-1">
          {loadingLeads ? (
            <div className="p-12 text-center text-[10px] font-black text-zinc-600 uppercase tracking-widest animate-pulse italic">
              Conectando con Supabase...
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <LeadItem 
                key={lead.id} 
                lead={lead} 
                active={selectedLead?.id === lead.id} 
                onClick={() => setSelectedLead(lead)} 
              />
            ))
          )}
        </div>
      </div>

      {/* Main Area: Chat + Details */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 h-full min-h-0">
        {selectedLead ? (
          <>
            {/* iPhone Mockup */}
            <div className="flex-1 flex items-center justify-center premium-card bg-zinc-950/20 p-8">
              <IPhoneMockup 
                receiverName={selectedLead.full_name} 
                receiverPhone={selectedLead.phone_number}
                messages={messages}
                onSendMessage={handleSendMessage}
                loading={loadingMessages}
              />
            </div>

            {/* Right Panel: Lead Details */}
            <div className="w-full lg:w-[320px] premium-card p-6 flex flex-col gap-8 bg-zinc-900/30 overflow-y-auto">
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-blue-600/10 border-2 border-blue-600/20 flex items-center justify-center text-blue-500">
                  <Tag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">{selectedLead.full_name}</h3>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{selectedLead.campaign_name}</p>
                </div>
              </div>

              <div className="space-y-6">
                <DetailRow icon={Phone} label="Móvil" value={selectedLead.phone_number} />
                <DetailRow icon={Mail} label="Email" value={selectedLead.email} />
                <DetailRow icon={Calendar} label="Fecha de Entrada" value={new Date(selectedLead.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })} />
                <DetailRow icon={Zap} label="Estado Comercial" value={selectedLead.status} badge />
              </div>

              <div className="pt-6 border-t border-zinc-800 space-y-4">
                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Asignación de Asesor</h4>
                <div className="grid grid-cols-1 gap-2">
                  <button className="flex items-center justify-between p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl hover:bg-zinc-800 transition-colors text-xs font-bold text-zinc-300">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-[9px]">JC</div>
                      <span>Jose A. Cepas</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 opacity-50" />
                  </button>
                  <button className="flex items-center justify-between p-3 bg-zinc-950 border border-transparent rounded-xl hover:bg-zinc-900 transition-colors text-xs font-bold text-zinc-500">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-600 text-[9px]">AL</div>
                      <span>Almudena</span>
                    </div>
                  </button>
                </div>
              </div>

              <button className="mt-auto w-full py-4 bg-zinc-800 border border-zinc-700 text-[10px] font-black text-white uppercase tracking-widest rounded-xl hover:bg-zinc-700 transition-all active:scale-95 shadow-lg">
                Convertir a Venta
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 premium-card flex flex-col items-center justify-center gap-6 p-12 text-center bg-zinc-950/10 border-dashed border-2 border-zinc-800/50">
            <div className="w-20 h-20 bg-zinc-900 rounded-[2rem] flex items-center justify-center border border-zinc-800 shadow-2xl">
              <MessageSquare className="w-10 h-10 text-zinc-700" />
            </div>
            <div className="max-w-[280px]">
              <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-2">Selecciona un Lead</h3>
              <p className="text-xs text-zinc-600 font-bold tracking-widest uppercase">Haz clic en una conversación para abrir la terminal de gestión y el chat seguro.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LeadItem({ lead, active, onClick }: { lead: Lead, active: boolean, onClick: () => void }) {
  const initials = lead.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  return (
    <button 
      onClick={onClick}
      className={`
        w-full p-4 rounded-2xl flex items-center gap-4 transition-all duration-300 border
        ${active ? 'bg-blue-600/10 border-blue-600/50 shadow-xl' : 'bg-transparent border-transparent hover:bg-zinc-800/50'}
      `}
    >
      <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center text-xs font-black shadow-inner italic ${active ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
        {initials}
      </div>
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h4 className={`text-sm font-black truncate ${active ? 'text-white' : 'text-zinc-300'}`}>{lead.full_name}</h4>
          <span className="text-[9px] font-bold text-zinc-600 shrink-0">12:30</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold text-zinc-600 truncate uppercase tracking-widest">{lead.campaign_name}</p>
          {lead.status === 'new' && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50 animate-pulse" />}
        </div>
      </div>
    </button>
  );
}

function DetailRow({ icon: Icon, label, value, badge }: any) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-zinc-600" />
        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">{label}</span>
      </div>
      {badge ? (
        <span className="inline-block px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-[10px] font-black text-white uppercase italic tracking-widest">
          {value}
        </span>
      ) : (
        <p className="text-sm font-black text-zinc-200 truncate">{value}</p>
      )}
    </div>
  );
}
