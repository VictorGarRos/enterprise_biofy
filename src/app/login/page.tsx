'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(data.redirect || '/');
      } else {
        setError(data.error || 'Credenciales inválidas.');
      }
    } catch {
      setError('Error en el servidor. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F4FB] relative overflow-hidden px-4 py-8">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[40%] rounded-full bg-indigo-200/40 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[40%] rounded-full bg-violet-200/30 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-gray-100 relative z-10 overflow-hidden"
      >
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />

        <div className="p-6 sm:p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Culligan Biofy"
              className="mb-3"
              style={{ width: 'clamp(140px, 50vw, 180px)', height: 'auto' }}
            />
            <p className="text-gray-400 text-sm text-center">Bienvenido/a al Enterprise Hub</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">
                Email Corporativo
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="nombre@empresa.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center bg-red-50 py-2.5 rounded-xl border border-red-100">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all group active:scale-[0.98] shadow-md shadow-indigo-200 mt-2 text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Accediendo...
                </span>
              ) : (
                <>
                  Iniciar Sesión
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
              Soluciones Integradas de Datos
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
