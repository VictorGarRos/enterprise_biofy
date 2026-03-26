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
  Search
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const isLoginPage = pathname === '/login';

  // Open sidebar by default on large screens, closed on mobile
  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, [pathname]);

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

        {/* Mobile backdrop */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/30 z-[90]"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed lg:static w-64 h-full bg-white border-r border-gray-100 flex flex-col z-[100] shadow-lg"
            >
              {/* Logo */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="Culligan Biofy" style={{ width: 130, height: 'auto' }} />
                <button
                  className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X size={16} className="text-gray-500" />
                </button>
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
        <main className="flex-1 h-screen overflow-y-auto bg-[#F4F4FB] min-w-0">
          {/* Top bar */}
          <div className="sticky top-0 z-20 bg-[#F4F4FB]/90 backdrop-blur-sm border-b border-gray-200/60 px-4 md:px-8 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                className="p-2 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors flex-shrink-0"
                onClick={() => setSidebarOpen(!isSidebarOpen)}
              >
                <Menu size={16} className="text-gray-600" />
              </button>
              <div className="hidden sm:flex items-center gap-2 bg-white rounded-xl px-4 py-2 border border-gray-200 shadow-sm w-48 md:w-64">
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none w-full"
                />
              </div>
            </div>
          </div>

          <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
