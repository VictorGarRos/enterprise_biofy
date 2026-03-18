'use client';

import './globals.css';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  BarChart3, 
  Users, 
  LogOut,
  Menu,
  X,
  Plus
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const isLoginPage = pathname === '/login';

  const menuItems = [
    { name: 'Dashboard General', icon: LayoutDashboard, path: '/' },
    { name: 'Gestión WhatsApp', icon: MessageSquare, path: '/whatsapp' },
    { name: 'Meta Analytics', icon: BarChart3, path: '/meta' },
    { name: 'CRM Biofy', icon: Users, path: '/biofy' },
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
      <body className="flex h-screen bg-[#09090b] text-zinc-100 overflow-hidden">
        {/* Toggle Mobile Menu */}
        <button 
          className="lg:hidden absolute top-4 left-4 z-50 p-2 bg-zinc-800 rounded-lg"
          onClick={() => setSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Sidebar */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.aside 
              initial={{ x: -250 }}
              animate={{ x: 0 }}
              exit={{ x: -250 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed lg:static w-72 h-full glass border-r border-zinc-900 flex flex-col z-40"
            >
              <div className="p-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20">
                    B
                  </div>
                  <span className="text-xl font-bold tracking-tight">Culligan Biofy</span>
                </div>
              </div>

              <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 px-4 mb-4">Principal</p>
                {menuItems.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => router.push(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                        isActive 
                        ? 'bg-blue-600/10 text-blue-500 border border-blue-600/20' 
                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-500' : 'group-hover:text-blue-100'}`} />
                      <span className="text-sm font-medium">{item.name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="p-4 mt-auto border-t border-zinc-900">
                <div className="mb-4 glass p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border border-white/10" />
                    <div>
                      <p className="text-xs font-bold">Admin Biofy</p>
                      <p className="text-[10px] text-zinc-500">Administrador</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-all font-medium text-sm"
                >
                  <LogOut className="w-5 h-5" />
                  Cerrar Sesión
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 h-screen overflow-y-auto bg-[#09090b] relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="p-8 max-w-7xl mx-auto min-h-full">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
