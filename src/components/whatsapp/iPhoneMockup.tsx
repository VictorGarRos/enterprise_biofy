'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Camera, Mic, Paperclip, MoreVertical, ChevronLeft, Phone, Video, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  lead_phone: string;
  content: string;
  type: 'sent' | 'received';
  timestamp: string | Date;
}

interface IPhoneMockupProps {
  messages: Message[];
  onSendMessage: (msg: string) => void;
  receiverName: string;
  receiverPhone: string;
  loading?: boolean;
}

export function IPhoneMockup({ 
  messages, 
  onSendMessage, 
  receiverName, 
  receiverPhone, 
  loading 
}: IPhoneMockupProps) {
  const [inputMsg, setInputMsg] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const handleSend = () => {
    if (!inputMsg.trim()) return;
    onSendMessage(inputMsg);
    setInputMsg('');
  };

  const formatTime = (ts: any) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    /* Carcasa del iPhone */
    <div className="relative mx-auto w-[320px] h-[640px] rounded-[3rem] border-[10px] border-[#1a1a1a] shadow-[0_0_0_2px_#3a3a3a,0_30px_80px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-700" style={{ background: '#1a1a1a' }}>

      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8 rounded-b-[1.5rem] z-50" style={{ background: '#1a1a1a' }}>
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-black rounded-full" />
        <div className="absolute top-2 right-8 w-2.5 h-2.5 rounded-full bg-black" />
      </div>

      {/* Header WhatsApp */}
      <div className="pt-10 pb-2 px-3 flex items-center justify-between" style={{ background: '#075E54' }}>
        <div className="flex items-center gap-2">
          <ChevronLeft className="w-5 h-5 text-white" />
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white" style={{ background: '#128C7E' }}>
            {receiverName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white truncate w-28">{receiverName}</h4>
            <p className="text-[9px] text-green-200">en línea</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-white">
          <Video className="w-4 h-4" />
          <Phone className="w-4 h-4" />
          <MoreVertical className="w-4 h-4" />
        </div>
      </div>

      {/* Fondo del chat — patrón real de WhatsApp */}
      <div
        className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar-hide"
        ref={scrollRef}
        style={{
          backgroundColor: '#0a1014',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23182229' fill-opacity='0.9'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {loading && (
          <div className="flex justify-center py-4">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={m.id || i}
              initial={{ opacity: 0, scale: 0.95, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className={`flex ${m.type === 'sent' ? 'justify-end' : 'justify-start'} mb-1`}
            >
              <div
                className="max-w-[82%] px-2.5 pt-1.5 pb-1 text-[11px] leading-relaxed shadow-sm"
                style={{
                  background: m.type === 'sent' ? '#005c4b' : '#202c33',
                  color: '#e9edef',
                  borderRadius: m.type === 'sent'
                    ? '8px 8px 2px 8px'
                    : '8px 8px 8px 2px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {m.content}
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <span style={{ color: '#8696a0', fontSize: '9px' }}>{formatTime(m.timestamp)}</span>
                  {m.type === 'sent' && (
                    <span style={{ color: '#53bdeb', fontSize: '10px' }}>✓✓</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input bar */}
      <div className="px-2 py-2 pb-7 flex items-center gap-2" style={{ background: '#0a1014' }}>
        <div className="flex-1 flex items-center gap-2 rounded-full px-3 py-2" style={{ background: '#202c33' }}>
          <input
            className="flex-1 bg-transparent text-[11px] outline-none placeholder:text-gray-500"
            style={{ color: '#e9edef' }}
            placeholder="Mensaje"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Paperclip className="w-4 h-4 text-gray-500" />
          <Camera className="w-4 h-4 text-gray-500" />
        </div>
        <button
          onClick={handleSend}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white active:scale-90 transition-transform"
          style={{ background: '#00a884' }}
        >
          {inputMsg.trim() ? <Send className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
      </div>

      {/* Home indicator */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full" style={{ background: '#ffffff30' }} />
    </div>
  );
}
