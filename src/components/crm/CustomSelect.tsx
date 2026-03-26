import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option { value: string; label: string; description?: string; }

interface CustomSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    icon?: React.ReactNode;
    searchable?: boolean;
}

export function CustomSelect({ options, value, onChange, placeholder = 'Todos', label, searchable = false }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
        };
        if (isOpen) { document.addEventListener('mousedown', handler); return () => document.removeEventListener('mousedown', handler); }
    }, [isOpen]);

    const filtered = options.filter(o => o.label.toLowerCase().includes(searchTerm.toLowerCase()));
    const selected = options.find(o => o.value === value);

    return (
        <div className="flex flex-col gap-1" ref={containerRef}>
            {label && <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</label>}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm text-gray-700 font-medium flex items-center justify-between hover:border-indigo-300 transition-colors focus:outline-none shadow-sm"
                >
                    <span className="truncate">{selected?.label || placeholder}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute top-full mt-1.5 left-0 right-0 z-[9999] bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                        {searchable && (
                            <div className="p-2 border-b border-gray-100">
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-indigo-300"
                                    placeholder="Buscar..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    autoFocus
                                    onClick={e => e.stopPropagation()}
                                />
                            </div>
                        )}
                        <div className="max-h-64 overflow-y-auto py-1">
                            {filtered.length > 0 ? filtered.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => { onChange(opt.value); setIsOpen(false); setSearchTerm(''); }}
                                    className={`w-full px-3.5 py-2 text-left text-sm transition-colors ${
                                        opt.value === value ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            )) : (
                                <div className="p-3 text-center text-xs text-gray-400">Sin resultados</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
