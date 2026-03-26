'use client';

import { useState, useEffect, useRef } from "react";
import { Search, RefreshCcw, Filter, ChevronDown, Check, Users } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { DateRangePicker } from "@/components/crm/DateRangePicker";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

interface Campaign {
    id: string;
    name: string;
    status: string;
}

interface Account {
    id: string;
    name: string;
}

interface FiltersProps {
    onUpdate: (filters: { campaignId: string; adAccountId: string; dateStart: string; dateEnd: string; forceSync?: boolean }) => void;
    loading?: boolean;
}

export function MetaFilters({ onUpdate, loading = false }: FiltersProps) {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState("");
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [selectedCampaign, setSelectedCampaign] = useState("");
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: firstOfMonth,
        to: today
    });

    const [isCampOpen, setIsCampOpen] = useState(false);
    const [isAccOpen, setIsAccOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const dropdownRef = useRef<HTMLDivElement>(null);
    const accDropdownRef = useRef<HTMLDivElement>(null);
    const accCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const campCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        fetch("/api/meta/accounts")
            .then((res) => res.json())
            .then((data) => {
                if (data.data) setAccounts(data.data);
            });
    }, []);

    useEffect(() => {
        const params = new URLSearchParams();
        if (selectedAccount) params.set("adAccountId", selectedAccount);

        fetch(`/api/meta/campaigns?${params.toString()}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.data) setCampaigns(data.data);
                else setCampaigns([]);
            })
            .catch(() => setCampaigns([]));
    }, [selectedAccount]);

    const handleUpdate = (forceSync = false) => {
        onUpdate({
            campaignId: selectedCampaign,
            adAccountId: selectedAccount,
            dateStart: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '2026-01-01',
            dateEnd: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
            forceSync
        });
    };

    return (
        <div className="premium-card p-6 flex flex-col xl:flex-row flex-wrap items-end gap-6">
            <div className="flex flex-col gap-2 w-full md:w-64 relative" ref={accDropdownRef}
                onMouseLeave={() => { accCloseTimer.current = setTimeout(() => setIsAccOpen(false), 150); }}
                onMouseEnter={() => { if (accCloseTimer.current) clearTimeout(accCloseTimer.current); }}>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 px-1">
                    <Users className="w-3 h-3 text-indigo-500" /> Cuenta Publicitaria
                </label>
                <SelectButton
                    label={selectedAccount ? accounts.find(a => a.id === selectedAccount)?.name || "Seleccionar cuenta" : "Todas las cuentas"}
                    isOpen={isAccOpen}
                    onClick={() => setIsAccOpen(!isAccOpen)}
                />
                <AnimatePresence>
                    {isAccOpen && (
                        <DropdownMenu
                            options={[{ id: "", name: "Todas las cuentas" }, ...accounts]}
                            selectedId={selectedAccount}
                            onSelect={(id: string) => { setSelectedAccount(id); setSelectedCampaign(""); setIsAccOpen(false); }}
                        />
                    )}
                </AnimatePresence>
            </div>

            <div className="flex flex-col gap-2 w-full md:w-80 relative" ref={dropdownRef}
                onMouseLeave={() => { campCloseTimer.current = setTimeout(() => setIsCampOpen(false), 150); }}
                onMouseEnter={() => { if (campCloseTimer.current) clearTimeout(campCloseTimer.current); }}>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 px-1">
                    <Filter className="w-3 h-3 text-pink-500" /> Campaña Específica
                </label>
                <SelectButton
                    label={selectedCampaign ? campaigns.find(c => c.id === selectedCampaign)?.name || "Seleccionar campaña" : "Todas las campañas"}
                    isOpen={isCampOpen}
                    onClick={() => setIsCampOpen(!isCampOpen)}
                />
                <AnimatePresence>
                    {isCampOpen && (
                        <DropdownMenu
                            options={[{ id: "", name: "Todas las campañas" }, ...campaigns]}
                            selectedId={selectedCampaign}
                            onSelect={(id: string) => { setSelectedCampaign(id); setIsCampOpen(false); }}
                            searchable
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                        />
                    )}
                </AnimatePresence>
            </div>

            <div className="w-full md:w-64">
                <DateRangePicker
                    label="Rango de Fechas"
                    date={dateRange}
                    setDate={setDateRange}
                    defaultMonth={new Date()}
                />
            </div>

            <div className="flex gap-2 w-full md:w-auto mt-2 xl:mt-0">
                <button
                    onClick={() => handleUpdate(false)}
                    disabled={loading}
                    className="flex-1 md:w-auto bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-md shadow-indigo-200"
                >
                    <RefreshCcw className={loading ? "w-3.5 h-3.5 animate-spin" : "w-3.5 h-3.5"} />
                    Actualizar
                </button>
                <button
                    onClick={() => handleUpdate(true)}
                    disabled={loading}
                    className="flex-1 md:w-auto bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-sm"
                    title="Forzar sincronización con Meta API"
                >
                    <RefreshCcw className={loading ? "w-3.5 h-3.5 animate-spin text-pink-500" : "w-3.5 h-3.5 text-pink-500"} />
                    Sincronizar Meta
                </button>
            </div>
        </div>
    );
}

function SelectButton({ label, isOpen, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between bg-white border border-gray-200 hover:border-indigo-300 text-gray-700 p-3.5 rounded-xl transition-all duration-300 outline-none shadow-sm"
        >
            <span className="text-xs font-bold truncate pr-2">{label}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
    );
}

function DropdownMenu({ options, selectedId, onSelect, searchable, searchTerm, setSearchTerm }: any) {
    const filtered = searchable ? options.filter((o: any) => o.name.toLowerCase().includes(searchTerm.toLowerCase())) : options;
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 shadow-lg rounded-2xl z-[9999] overflow-hidden"
        >
            {searchable && (
                <div className="p-3 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-700 p-2.5 pl-9 rounded-lg outline-none text-xs placeholder:text-gray-400 font-bold focus:border-indigo-300"
                        />
                    </div>
                </div>
            )}
            <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5">
                {filtered.map((o: any) => (
                    <button
                        key={o.id}
                        onClick={() => onSelect(o.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${selectedId === o.id ? 'bg-indigo-600 text-white font-black' : 'text-gray-600 font-bold hover:bg-gray-50 hover:text-gray-900'} text-xs`}
                    >
                        <span className="truncate pr-4">{o.name}</span>
                        {selectedId === o.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                ))}
            </div>
        </motion.div>
    );
}
