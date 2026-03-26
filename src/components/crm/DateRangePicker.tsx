'use client';

import { useState, useRef, useEffect } from 'react';
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
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide px-1">
                    {label}
                </label>
            )}

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm text-gray-700 font-medium flex items-center justify-between hover:border-indigo-300 transition-colors focus:outline-none shadow-sm"
                >
                    <div className="flex items-center gap-2 truncate flex-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className={`truncate text-xs font-bold ${date?.from ? 'text-gray-700' : 'text-gray-400'}`}>
                            {date?.from ? formatDateRange(date) : placeholder}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        {date?.from && (
                            <span
                                role="button"
                                onClick={(e) => { e.stopPropagation(); setDate(undefined); }}
                                className="p-0.5 text-gray-400 hover:text-gray-600 rounded transition-colors cursor-pointer"
                            >
                                <X className="w-3 h-3" />
                            </span>
                        )}
                        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                </button>

                {isOpen && (
                    <div
                        className="absolute top-full mt-2 left-0 z-[9999] rounded-2xl shadow-xl overflow-hidden bg-white border border-gray-200"
                        style={{ minWidth: 288 }}
                    >
                        <div className="px-4 pt-3 pb-2 border-b border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {date?.from && date?.to
                                    ? `${format(date.from, 'd MMM', { locale: es })} → ${format(date.to, 'd MMM yyyy', { locale: es })}`
                                    : date?.from
                                    ? `Desde ${format(date.from, 'd MMM', { locale: es })} · selecciona fin`
                                    : 'Selecciona fecha inicio'}
                            </p>
                        </div>

                        <div className="p-3">
                            <style jsx global>{`
                                .dp-light .rdp-root { color: #374151; }
                                .dp-light .rdp-months { gap: 0; }
                                .dp-light .rdp-month_caption {
                                    display: flex;
                                    align-items: center;
                                    justify-content: space-between;
                                    padding: 0 2px 10px 2px;
                                }
                                .dp-light .rdp-caption_label {
                                    font-size: 13px;
                                    font-weight: 700;
                                    color: #111827;
                                    text-transform: capitalize;
                                }
                                .dp-light .rdp-nav { display: flex; gap: 4px; }
                                .dp-light .rdp-button_previous,
                                .dp-light .rdp-button_next {
                                    width: 26px; height: 26px;
                                    display: flex; align-items: center; justify-content: center;
                                    border-radius: 8px;
                                    color: #9CA3AF;
                                    background: transparent;
                                    border: none;
                                    cursor: pointer;
                                    transition: background 0.15s, color 0.15s;
                                }
                                .dp-light .rdp-button_previous:hover,
                                .dp-light .rdp-button_next:hover {
                                    background: #F3F4F6;
                                    color: #374151;
                                }
                                .dp-light .rdp-month_grid { width: 100%; border-collapse: collapse; }
                                .dp-light .rdp-weekday {
                                    width: 36px; height: 28px;
                                    text-align: center;
                                    font-size: 10px;
                                    font-weight: 700;
                                    text-transform: uppercase;
                                    color: #9CA3AF;
                                    letter-spacing: 0.05em;
                                }
                                .dp-light .rdp-day {
                                    width: 36px; height: 34px;
                                    padding: 0;
                                    position: relative;
                                    text-align: center;
                                }
                                .dp-light .rdp-day_button {
                                    width: 30px; height: 30px;
                                    border-radius: 50%;
                                    border: none;
                                    background: transparent;
                                    color: #6B7280;
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
                                .dp-light .rdp-day_button:hover {
                                    background: #F3F4F6;
                                    color: #111827;
                                }
                                .dp-light .rdp-today .rdp-day_button {
                                    color: #6366F1;
                                    font-weight: 800;
                                }
                                .dp-light .rdp-outside .rdp-day_button {
                                    color: #D1D5DB;
                                }
                                .dp-light .rdp-disabled .rdp-day_button {
                                    color: #E5E7EB;
                                    cursor: not-allowed;
                                }
                                .dp-light .rdp-range_middle {
                                    background: rgba(99,102,241,0.08);
                                }
                                .dp-light .rdp-range_middle .rdp-day_button {
                                    color: #6366F1;
                                    background: transparent;
                                    border-radius: 0;
                                    width: 100%;
                                }
                                .dp-light .rdp-range_middle .rdp-day_button:hover {
                                    background: rgba(99,102,241,0.15);
                                }
                                .dp-light .rdp-range_start:not(.rdp-range_end) {
                                    background: linear-gradient(to right, transparent 50%, rgba(99,102,241,0.08) 50%);
                                }
                                .dp-light .rdp-range_start .rdp-day_button {
                                    background: #6366F1 !important;
                                    color: #fff !important;
                                    font-weight: 700;
                                    border-radius: 50% !important;
                                    width: 30px;
                                }
                                .dp-light .rdp-range_end:not(.rdp-range_start) {
                                    background: linear-gradient(to left, transparent 50%, rgba(99,102,241,0.08) 50%);
                                }
                                .dp-light .rdp-range_end .rdp-day_button {
                                    background: #6366F1 !important;
                                    color: #fff !important;
                                    font-weight: 700;
                                    border-radius: 50% !important;
                                    width: 30px;
                                }
                                .dp-light .rdp-range_start.rdp-range_end {
                                    background: transparent;
                                }
                                .dp-light .rdp-selected:not(.rdp-range_middle) .rdp-day_button {
                                    background: #6366F1 !important;
                                    color: #fff !important;
                                    border-radius: 50% !important;
                                    font-weight: 700;
                                }
                            `}</style>
                            <div className="dp-light">
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
