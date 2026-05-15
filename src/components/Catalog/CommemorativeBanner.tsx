import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { commemorativeDateService } from '../../services/commemorativeDateService';
import { CommemorativeDate } from '../../types';
import { Bell, ArrowRight, Sparkles } from 'lucide-react';
import { addDays, isAfter, isBefore, startOfToday, differenceInDays } from 'date-fns';
import { getMobileDateOccurrence } from '../../lib/commemorativeDateUtils';

export function CommemorativeBanner({ onSearch }: { onSearch?: (val: string) => void }) {
  const [dates, setDates] = useState<CommemorativeDate[]>([]);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const unsub = commemorativeDateService.subscribe(setDates);
    return unsub;
  }, []);

  const getFullDate = (d: CommemorativeDate, year = new Date().getFullYear()) => {
    if (d.year_fixed) return new Date(year, d.month - 1, d.day);
    if (d.mobile_id) {
      const occurrence = getMobileDateOccurrence(d.mobile_id, year);
      return new Date(year, occurrence.month - 1, occurrence.day);
    }
    return new Date(year, d.month - 1, d.day);
  };

  const upcomingMajorDate = useMemo(() => {
    const today = startOfToday();
    const limit = addDays(today, 60); // Show alert if it's within 60 days

    const upcoming = dates
      .filter(d => {
        const occurrence = getFullDate(d);
        return d.active && isAfter(occurrence, today) && isBefore(occurrence, limit);
      })
      .sort((a, b) => getFullDate(a).getTime() - getFullDate(b).getTime());

    return upcoming[0] || null;
  }, [dates]);

  if (!upcomingMajorDate || closed) return null;

  const daysTo = differenceInDays(getFullDate(upcomingMajorDate), startOfToday());

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="relative w-full rounded-2xl p-6 text-white overflow-hidden shadow-lg border border-white/10"
        style={{ backgroundColor: upcomingMajorDate.theme_color || '#8B5CF6' }}
      >
        {/* Subtle Animated Background */}
        <div className="absolute inset-0 bg-white/5 opacity-50 animate-pulse pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
               <Sparkles size={24} className="text-white" />
             </div>
             <div>
               <p className="text-[10px] uppercase tracking-[0.2em] opacity-80 mb-0.5">
                   Data Comemorativa
               </p>
               <h3 className="text-lg font-black uppercase tracking-tight">
                 {upcomingMajorDate.name}
               </h3>
             </div>
          </div>

          <div className="flex-1 text-center md:text-left px-4">
            <p className="text-xs italic opacity-90 leading-tight">
              "{upcomingMajorDate.marketing_phrase}"
            </p>
          </div>

          <div className="flex items-center gap-4">
             <div className="text-right">
                <p className="text-[10px] uppercase font-bold tracking-widest opacity-70">Faltam</p>
                <p className="text-xl font-black">{daysTo} <span className="text-xs font-medium">dias</span></p>
             </div>
             <button 
               onClick={() => {
                 if (onSearch) {
                   onSearch(upcomingMajorDate.name);
                   const catalogGrid = document.getElementById('catalog-grid');
                   if (catalogGrid) catalogGrid.scrollIntoView({ behavior: 'smooth' });
                 }
               }}
               className="bg-white text-gray-900 px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-md flex items-center gap-2"
             >
               Sugestões <ArrowRight size={14} />
             </button>
             <button 
               onClick={() => setClosed(true)}
               className="p-1 hover:bg-white/10 rounded-full transition-colors"
               title="Fechar"
             >
               <X size={16} />
             </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

const X = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
);
