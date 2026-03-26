'use client';

import './globals.css';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  BarChart3,
  Users,
  LogOut,
  Menu,
  X,
  Activity,
  Bell,
  Search
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const isLoginPage = pathname === '/login';

  const menuGroups = [
    {
      label: 'Principal',
      items: [
        { name: 'Dashboard General', icon: LayoutDashboard, path: '/' },
        { name: 'Gestión WhatsApp',  icon: MessageSquare,   path: '/whatsapp' },
        { name: 'Meta Analytics',    icon: BarChart3,        path: '/meta' },
        { name: 'CRM Biofy',         icon: Users,            path: '/biofy' },
      ],
    },
    {
      label: 'Análisis',
      items: [
        { name: 'Estadísticas', icon: Activity, path: '/estadisticas' },
      ],
    },
  ];

  const handleLogout = () => {
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  };

  if (isLoginPage) {
    return (
      <html lang="es">
        <body>{children}</body>
      </html>
    );
  }

  return (
    <html lang="es">
      <body className="flex h-screen bg-[#F4F4FB] text-gray-900 overflow-hidden">

        {/* Mobile toggle */}
        <button
          className="lg:hidden absolute top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-sm border border-gray-200"
          onClick={() => setSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X size={18} className="text-gray-600" /> : <Menu size={18} className="text-gray-600" />}
        </button>

        {/* Sidebar */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed lg:static w-64 h-full bg-white border-r border-gray-100 flex flex-col z-40 shadow-sm"
            >
              {/* Logo */}
              <div className="px-6 py-5 border-b border-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="Culligan Biofy" style={{ width: 140, height: 'auto' }} />
              </div>

              {/* Nav */}
              <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
                {menuGroups.map((group) => (
                  <div key={group.label}>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-3 mb-2">
                      {group.label}
                    </p>
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                          <button
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group ${
                              isActive
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                          >
                            <item.icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-700'}`} size={18} />
                            <span className="text-sm font-medium">{item.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              {/* Bottom user */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 px-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow">
                    A
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">Admin Biofy</p>
                    <p className="text-[10px] text-gray-400">Administrador</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 h-screen overflow-y-auto bg-[#F4F4FB]">
          {/* Top bar */}
          <div className="sticky top-0 z-30 bg-[#F4F4FB]/90 backdrop-blur-sm border-b border-gray-200/60 px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 border border-gray-200 shadow-sm w-64">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none w-full"
              />
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 bg-white rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">
                <Bell className="w-4 h-4 text-gray-500" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">3</span>
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 shadow-sm" />
            </div>
          </div>

          <div className="p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
