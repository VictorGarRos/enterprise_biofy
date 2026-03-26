'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Zap,
  Tag
} from 'lucide-react';
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
  '123456789': [
    demoMsg('123456789', 'sent', '¡Hola! Gracias por interesarte en nuestros equipos 😊\n\nDime una cosa:\n\n¿Para dónde sería el equipo?\n\n1️⃣ Para mi casa\n2️⃣ Para un negocio\n3️⃣ Solo quiero información', 300),
    demoMsg('123456789', 'received', 'Para mi casa', 295),
    demoMsg('123456789', 'sent', 'Perfecto 👍\n\nPara facilitarte la información correcta necesito saber:\n\n¿Cuántas personas sois en casa?\n\n1️⃣ 1-2 personas\n2️⃣ 3-4 personas\n3️⃣ 5 o más', 290),
    demoMsg('123456789', 'received', '3-4 personas', 285),
    demoMsg('123456789', 'sent', '¿El agua que bebéis ahora es del grifo o compráis agua embotellada?\n\n1️⃣ Del grifo\n2️⃣ Agua embotellada\n3️⃣ Garrafas', 280),
    demoMsg('123456789', 'received', 'Agua embotellada', 275),
    demoMsg('123456789', 'sent', 'Te cuento algo rápido:\n\nLa mayoría de nuestros clientes nos llaman porque:\n\n💧 El agua del grifo sabe mal\n💧 Están cansados de cargar agua embotellada\n💧 Quieren agua saludable para beber y cocinar\n\nNuestros dispositivos ofrecen todo tipo de soluciones.', 260),
    demoMsg('123456789', 'sent', 'Para ayudarte necesitamos hablar contigo y concretar cuáles son tus necesidades:\n\n¿En qué horario te viene mejor?\n\n1️⃣ Mañana\n2️⃣ Tarde', 240),
    demoMsg('123456789', 'received', 'Mañana', 235),
    demoMsg('123456789', 'sent', '¡Perfecto! 📋\n\nUn asesor te contactará mañana para confirmar los detalles.\n\nPara más info visita: biofyagua.com\n\n¡Gracias!', 230),
  ],
  '987654321': [
    demoMsg('987654321', 'sent', '¡Hola! Gracias por interesarte en nuestros equipos 😊\n\nDime una cosa:\n\n¿Para dónde sería el equipo?\n\n1️⃣ Para mi casa\n2️⃣ Para un negocio\n3️⃣ Solo quiero información', 400),
    demoMsg('987654321', 'received', 'Para un negocio', 395),
    demoMsg('987654321', 'sent', 'Perfecto 👍\n\nPara enviarte la información correcta necesito saber:\n\n¿Cuántas personas trabajan allí?\n\n1️⃣ 1-5 personas\n2️⃣ 6-15 personas\n3️⃣ Más de 15', 390),
    demoMsg('987654321', 'received', '6-15 personas', 385),
    demoMsg('987654321', 'sent', '¿El agua que bebéis ahora es del grifo o compráis agua embotellada?\n\n1️⃣ Del grifo\n2️⃣ Agua embotellada\n3️⃣ Garrafas', 380),
    demoMsg('987654321', 'received', 'Del grifo', 375),
    demoMsg('987654321', 'sent', 'Te cuento algo rápido:\n\nLa mayoría de nuestros clientes nos llaman porque:\n\n💧 El agua del grifo sabe mal\n💧 Están cansados de cargar agua embotellada\n💧 Quieren agua saludable para beber y cocinar\n\nNuestros dispositivos ofrecen todo tipo de soluciones.', 350),
    demoMsg('987654321', 'sent', 'Para ayudarte necesitamos hablar contigo y concretar cuáles son tus necesidades:\n\n¿En qué horario te viene mejor?\n\n1️⃣ Mañana\n2️⃣ Tarde', 320),
    demoMsg('987654321', 'received', 'Tarde', 315),
    demoMsg('987654321', 'sent', '¡Genial! 📋\n\nUn asesor te contactará por la tarde para confirmar los detalles.\n\nPara más info visita: biofyagua.com\n\n¡Gracias!', 310),
  ],
  '555666777': [
    demoMsg('555666777', 'sent', '¡Hola! Gracias por interesarte en nuestros equipos 😊\n\nDime una cosa:\n\n¿Para dónde sería el equipo?\n\n1️⃣ Para mi casa\n2️⃣ Para un negocio\n3️⃣ Solo quiero información', 60),
    demoMsg('555666777', 'received', 'Solo quiero información', 55),
    demoMsg('555666777', 'sent', '¡Nos encanta tu curiosidad! 💧\n\n¿Te gustaría saber más sobre cómo funcionan nuestros sistemas?\n\n1️⃣ Sí, claro\n2️⃣ Ahora no puedo', 50),
    demoMsg('555666777', 'received', 'Sí, claro', 45),
    demoMsg('555666777', 'sent', '¿Cuántas personas sois en casa?\n\n1️⃣ 1-2 personas\n2️⃣ 3-4 personas\n3️⃣ 5 o más', 40),
    demoMsg('555666777', 'received', '1-2 personas', 35),
    demoMsg('555666777', 'sent', '¿El agua que bebéis ahora es del grifo o compráis agua embotellada?\n\n1️⃣ Del grifo\n2️⃣ Agua embotellada\n3️⃣ Garrafas', 30),
    demoMsg('555666777', 'received', 'Del grifo', 25),
    demoMsg('555666777', 'sent', 'Te cuento algo rápido:\n\nLa mayoría de nuestros clientes nos llaman porque:\n\n💧 El agua del grifo sabe mal\n💧 Están cansados de cargar agua embotellada\n💧 Quieren agua saludable para beber y cocinar\n\nNuestros dispositivos ofrecen todo tipo de soluciones.', 20),
    demoMsg('555666777', 'sent', 'Para ayudarte necesitamos hablar contigo:\n\n¿En qué horario te viene mejor?\n\n1️⃣ Mañana\n2️⃣ Tarde', 15),
    demoMsg('555666777', 'received', 'Mañana', 10),
    demoMsg('555666777', 'sent', '¡Perfecto! 📋\n\nUn asesor te contactará mañana.\n\nPara más info visita: biofyagua.com\n\n¡Gracias!', 5),
  ],
  '111222333': [
    demoMsg('111222333', 'sent', '¡Hola! Gracias por interesarte en nuestros equipos 😊\n\nDime una cosa:\n\n¿Para dónde sería el equipo?\n\n1️⃣ Para mi casa\n2️⃣ Para un negocio\n3️⃣ Solo quiero información', 500),
    demoMsg('111222333', 'received', 'Para mi casa', 495),
    demoMsg('111222333', 'sent', 'Perfecto 👍\n\nPara facilitarte la información correcta necesito saber:\n\n¿Cuántas personas sois en casa?\n\n1️⃣ 1-2 personas\n2️⃣ 3-4 personas\n3️⃣ 5 o más', 490),
    demoMsg('111222333', 'received', '5 o más', 485),
    demoMsg('111222333', 'sent', '¿El agua que bebéis ahora es del grifo o compráis agua embotellada?\n\n1️⃣ Del grifo\n2️⃣ Agua embotellada\n3️⃣ Garrafas', 480),
    demoMsg('111222333', 'received', 'Garrafas', 475),
    demoMsg('111222333', 'sent', 'Te cuento algo rápido:\n\nLa mayoría de nuestros clientes nos llaman porque:\n\n💧 El agua del grifo sabe mal\n💧 Están cansados de cargar agua embotellada\n💧 Quieren agua saludable para beber y cocinar\n\nNuestros dispositivos ofrecen todo tipo de soluciones.', 450),
    demoMsg('111222333', 'sent', 'Para ayudarte necesitamos hablar contigo y concretar cuáles son tus necesidades:\n\n¿En qué horario te viene mejor?\n\n1️⃣ Mañana\n2️⃣ Tarde', 420),
    demoMsg('111222333', 'received', 'Tarde', 415),
    demoMsg('111222333', 'sent', '¡Anotado! 📋\n\nUn asesor te contactará por la tarde para confirmar los detalles.\n\nPara más info visita: biofyagua.com\n\n¡Gracias!', 410),
  ],
};

export default function WhatsAppPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLeads = async () => {
      setLoadingLeads(true);
      try {
        const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setLeads(data && data.length > 0 ? data : DEMO_LEADS);
      } catch {
        setLeads(DEMO_LEADS);
      } finally {
        setLoadingLeads(false);
      }
    };
    fetchLeads();

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

  useEffect(() => {
    if (!selectedLead) return;

    const fetchMsg = async () => {
      setLoadingMessages(true);
      try {
        const { data } = await supabase.from('messages').select('*').eq('lead_phone', selectedLead.phone_number).order('timestamp', { ascending: true });
        setMessages(data && data.length > 0 ? data : (DEMO_MESSAGES[selectedLead.phone_number] || []));
      } catch {
        setMessages(DEMO_MESSAGES[selectedLead.phone_number] || []);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMsg();

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
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Sidebar: Leads List */}
      <div className="w-full lg:w-[360px] xl:w-[400px] flex flex-col premium-card overflow-hidden" style={{ height: 'calc(100vh - 140px)', minHeight: 320 }}>
        <div className="p-6 border-b border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Leads Entrantes</h2>
            <div className="px-2 py-1 bg-indigo-50 rounded-lg border border-indigo-100 text-[10px] font-black text-indigo-600">
              LIVE {leads.length}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-gray-700 placeholder:text-gray-400 outline-none focus:border-indigo-300 transition-all"
              placeholder="Buscar por nombre o móvil..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingLeads ? (
            <div className="p-12 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">
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
      <div className="flex-1 flex flex-col lg:flex-row gap-4 md:gap-6 min-h-0" style={{ height: 'calc(100vh - 140px)', minHeight: 400 }}>
        {selectedLead ? (
          <>
            {/* iPhone Mockup */}
            <div className="flex-1 flex items-center justify-center premium-card p-8">
              <IPhoneMockup
                receiverName={selectedLead.full_name}
                receiverPhone={selectedLead.phone_number}
                messages={messages}
                onSendMessage={handleSendMessage}
                loading={loadingMessages}
              />
            </div>

            {/* Right Panel: Lead Details */}
            <div className="w-full lg:w-[300px] xl:w-[320px] premium-card p-4 md:p-6 flex flex-col gap-6 md:gap-8 overflow-y-auto">
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-indigo-500">
                  <Tag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">{selectedLead.full_name}</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedLead.campaign_name}</p>
                </div>
              </div>

              <div className="space-y-6">
                <DetailRow icon={Phone} label="Móvil" value={selectedLead.phone_number} />
                <DetailRow icon={Mail} label="Email" value={selectedLead.email} />
                <DetailRow icon={Calendar} label="Fecha de Entrada" value={new Date(selectedLead.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })} />
                <DetailRow icon={Zap} label="Estado Comercial" value={selectedLead.status} badge />
              </div>

              <div className="pt-6 border-t border-gray-100 space-y-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Asignación de Asesor</h4>
                <div className="grid grid-cols-1 gap-2">
                  <button className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition-colors text-xs font-bold text-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[9px]">JC</div>
                      <span>Jose A. Cepas</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </button>
                  <button className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors text-xs font-bold text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-[9px]">AL</div>
                      <span>Almudena</span>
                    </div>
                  </button>
                </div>
              </div>

              <button className="mt-auto w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-[10px] font-black text-white uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-md shadow-indigo-200">
                Convertir a Venta
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 premium-card flex flex-col items-center justify-center gap-6 p-12 text-center border-dashed border-2 border-gray-200">
            <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center border border-indigo-100 shadow-sm">
              <MessageSquare className="w-10 h-10 text-indigo-300" />
            </div>
            <div className="max-w-[280px]">
              <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">Selecciona un Lead</h3>
              <p className="text-xs text-gray-400 font-bold tracking-widest uppercase">Haz clic en una conversación para abrir la terminal de gestión y el chat seguro.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LeadItem({ lead, active, onClick }: { lead: Lead, active: boolean, onClick: () => void }) {
  const initials = lead.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  return (
    <button
      onClick={onClick}
      className={`
        w-full p-4 rounded-2xl flex items-center gap-4 transition-all duration-300 border
        ${active ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-transparent border-transparent hover:bg-gray-50'}
      `}
    >
      <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center text-xs font-black shadow-inner ${active ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
        {initials}
      </div>
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h4 className={`text-sm font-black truncate ${active ? 'text-indigo-700' : 'text-gray-800'}`}>{lead.full_name}</h4>
          <span className="text-[9px] font-bold text-gray-400 shrink-0">12:30</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold text-gray-400 truncate uppercase tracking-widest">{lead.campaign_name}</p>
          {lead.status === 'new' && <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-sm animate-pulse" />}
        </div>
      </div>
    </button>
  );
}

function DetailRow({ icon: Icon, label, value, badge }: any) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
      </div>
      {badge ? (
        <span className="inline-block px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] font-black text-indigo-600 uppercase tracking-widest">
          {value}
        </span>
      ) : (
        <p className="text-sm font-black text-gray-800 truncate">{value}</p>
      )}
    </div>
  );
}
