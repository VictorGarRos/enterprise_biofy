import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
    value: string;
    label: string;
    description?: string;
}

interface CustomSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    icon?: React.ReactNode;
    searchable?: boolean;
}

export function CustomSelect({
    options,
    value,
    onChange,
    placeholder = 'Todos',
    label,
    icon,
    searchable = false
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="flex flex-col gap-1" ref={containerRef}>
            {label && (
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                    {label}
                </label>
            )}
            
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-sm text-zinc-300 font-medium flex items-center justify-between hover:border-zinc-600 transition-colors focus:outline-none"
                >
                    <span className="truncate">
                        {selectedOption?.label || placeholder}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute top-full mt-1 left-0 right-0 z-[9999] bg-zinc-950 border border-zinc-700 rounded-lg shadow-xl overflow-hidden">
                        {searchable && (
                            <div className="p-2 border-b border-zinc-700 bg-zinc-900">
                                <input
                                    type="text"
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                                    placeholder="Buscar..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        )}
                        
                        <div className="max-h-64 overflow-y-auto">
                            {filteredOptions.length > 0 ? (
                                <div className="py-1">
                                    {filteredOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                onChange(option.value);
                                                setIsOpen(false);
                                                setSearchTerm('');
                                            }}
                                            className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                                                option.value === value
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-zinc-300 hover:bg-zinc-700'
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-3 text-center text-xs text-zinc-500">Sin resultados</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
