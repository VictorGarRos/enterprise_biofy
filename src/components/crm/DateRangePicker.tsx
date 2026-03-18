'use client';

import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DayPicker, DateRange } from 'react-day-picker';
import { Calendar as CalendarIcon, ChevronDown, X } from 'lucide-react';

interface DateRangePickerProps {
    date: DateRange | undefined;
    setDate: (date: DateRange | undefined) => void;
    placeholder?: string;
    label?: string;
    defaultMonth?: Date;
}

export function DateRangePicker({
    date,
    setDate,
    placeholder = 'Seleccionar rango',
    label,
    defaultMonth
}: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
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

    const handleSelect = (range: DateRange | undefined) => {
        setDate(range);
        if (range?.from && range?.to) {
            setTimeout(() => setIsOpen(false), 200);
        }
    };

    const formatDateRange = (range: DateRange | undefined) => {
        if (!range?.from) return '';
        if (range.to) {
            return `${format(range.from, 'd MMM', { locale: es })} – ${format(range.to, 'd MMM yyyy', { locale: es })}`;
        }
        return format(range.from, 'd MMM yyyy', { locale: es });
    };

    return (
        <div className="flex flex-col gap-1" ref={containerRef}>
            {label && (
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">
                    {label}
                </label>
            )}

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl py-3 px-3.5 text-xs text-white font-bold flex items-center justify-between hover:bg-zinc-800 hover:border-zinc-600 transition-all focus:outline-none"
                >
                    <div className="flex items-center gap-2 truncate flex-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                        <span className={`truncate ${date?.from ? 'text-white' : 'text-zinc-500 font-medium'}`}>
                            {date?.from ? formatDateRange(date) : placeholder}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        {date?.from && (
                            <span
                                role="button"
                                onClick={(e) => { e.stopPropagation(); setDate(undefined); }}
                                className="p-0.5 text-zinc-600 hover:text-zinc-300 rounded transition-colors cursor-pointer"
                            >
                                <X className="w-3 h-3" />
                            </span>
                        )}
                        <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                </button>

                {isOpen && (
                    <div
                        className="absolute top-full mt-2 left-0 z-[9999] rounded-2xl shadow-2xl overflow-hidden"
                        style={{ background: '#18181b', border: '1px solid rgba(63,63,70,0.6)', minWidth: 288 }}
                    >
                        {/* Header decorativo */}
                        <div className="px-4 pt-3 pb-2 border-b border-zinc-800">
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                                {date?.from && date?.to
                                    ? `${format(date.from, 'd MMM', { locale: es })} → ${format(date.to, 'd MMM yyyy', { locale: es })}`
                                    : date?.from
                                    ? `Desde ${format(date.from, 'd MMM', { locale: es })} · selecciona fin`
                                    : 'Selecciona fecha inicio'}
                            </p>
                        </div>

                        <div className="p-3">
                            <style jsx global>{`
                                .dp-dark .rdp-root { color: #e4e4e7; }
                                .dp-dark .rdp-months { gap: 0; }
                                .dp-dark .rdp-month_caption {
                                    display: flex;
                                    align-items: center;
                                    justify-content: space-between;
                                    padding: 0 2px 10px 2px;
                                }
                                .dp-dark .rdp-caption_label {
                                    font-size: 13px;
                                    font-weight: 700;
                                    color: #f4f4f5;
                                    text-transform: capitalize;
                                }
                                .dp-dark .rdp-nav { display: flex; gap: 4px; }
                                .dp-dark .rdp-button_previous,
                                .dp-dark .rdp-button_next {
                                    width: 26px; height: 26px;
                                    display: flex; align-items: center; justify-content: center;
                                    border-radius: 8px;
                                    color: #71717a;
                                    background: transparent;
                                    border: none;
                                    cursor: pointer;
                                    transition: background 0.15s, color 0.15s;
                                }
                                .dp-dark .rdp-button_previous:hover,
                                .dp-dark .rdp-button_next:hover {
                                    background: #3f3f46;
                                    color: #fff;
                                }
                                .dp-dark .rdp-month_grid { width: 100%; border-collapse: collapse; }
                                .dp-dark .rdp-weekday {
                                    width: 36px; height: 28px;
                                    text-align: center;
                                    font-size: 10px;
                                    font-weight: 700;
                                    text-transform: uppercase;
                                    color: #52525b;
                                    letter-spacing: 0.05em;
                                }
                                /* Day cells */
                                .dp-dark .rdp-day {
                                    width: 36px; height: 34px;
                                    padding: 0;
                                    position: relative;
                                    text-align: center;
                                }
                                .dp-dark .rdp-day_button {
                                    width: 30px; height: 30px;
                                    border-radius: 50%;
                                    border: none;
                                    background: transparent;
                                    color: #a1a1aa;
                                    font-size: 12px;
                                    font-weight: 500;
                                    cursor: pointer;
                                    transition: background 0.12s, color 0.12s;
                                    position: relative;
                                    z-index: 1;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    margin: 0 auto;
                                }
                                .dp-dark .rdp-day_button:hover {
                                    background: #3f3f46;
                                    color: #fff;
                                }
                                /* Today */
                                .dp-dark .rdp-today .rdp-day_button {
                                    color: #60a5fa;
                                    font-weight: 800;
                                }
                                /* Outside month */
                                .dp-dark .rdp-outside .rdp-day_button {
                                    color: #3f3f46;
                                }
                                /* Disabled */
                                .dp-dark .rdp-disabled .rdp-day_button {
                                    color: #27272a;
                                    cursor: not-allowed;
                                }
                                /* === RANGE BAR === */
                                /* Middle: full-width band */
                                .dp-dark .rdp-range_middle {
                                    background: rgba(59,130,246,0.13);
                                }
                                .dp-dark .rdp-range_middle .rdp-day_button {
                                    color: #93c5fd;
                                    background: transparent;
                                    border-radius: 0;
                                    width: 100%;
                                }
                                .dp-dark .rdp-range_middle .rdp-day_button:hover {
                                    background: rgba(59,130,246,0.2);
                                }
                                /* Start: right half band + circle */
                                .dp-dark .rdp-range_start:not(.rdp-range_end) {
                                    background: linear-gradient(to right, transparent 50%, rgba(59,130,246,0.13) 50%);
                                }
                                .dp-dark .rdp-range_start .rdp-day_button {
                                    background: #3b82f6 !important;
                                    color: #fff !important;
                                    font-weight: 700;
                                    border-radius: 50% !important;
                                    width: 30px;
                                }
                                /* End: left half band + circle */
                                .dp-dark .rdp-range_end:not(.rdp-range_start) {
                                    background: linear-gradient(to left, transparent 50%, rgba(59,130,246,0.13) 50%);
                                }
                                .dp-dark .rdp-range_end .rdp-day_button {
                                    background: #3b82f6 !important;
                                    color: #fff !important;
                                    font-weight: 700;
                                    border-radius: 50% !important;
                                    width: 30px;
                                }
                                /* Single day selected (start == end) */
                                .dp-dark .rdp-range_start.rdp-range_end {
                                    background: transparent;
                                }
                                .dp-dark .rdp-selected:not(.rdp-range_middle) .rdp-day_button {
                                    background: #3b82f6 !important;
                                    color: #fff !important;
                                    border-radius: 50% !important;
                                    font-weight: 700;
                                }
                            `}</style>
                            <div className="dp-dark">
                                <DayPicker
                                    mode="range"
                                    selected={date}
                                    onSelect={handleSelect}
                                    locale={es}
                                    defaultMonth={defaultMonth ?? (date?.from || new Date())}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
