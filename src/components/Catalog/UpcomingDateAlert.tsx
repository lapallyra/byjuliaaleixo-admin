import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { commemorativeDateService } from '../../services/commemorativeDateService';
import { CommemorativeDate } from '../../types';
import { Bell, ArrowRight, Calendar, Sparkles } from 'lucide-react';
import { addDays, isAfter, isBefore, startOfToday, differenceInDays } from 'date-fns';
import { getMobileDateOccurrence } from '../../lib/commemorativeDateUtils';

export function UpcomingDateAlert({ onSearch }: { onSearch?: (val: string) => void }) {
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
    const limit = addDays(today, 20); // Show alert if it's within 20 days

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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="flex-1 min-w-[300px] rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl"
        style={{ backgroundColor: upcomingMajorDate.theme_color || '#8B5CF6' }}
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent animate-pulse" />
        </div>

        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
             <motion.div 
               animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
               transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
               className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md"
             >
               <Sparkles size={20} className="text-white" />
             </motion.div>
             <button 
               onClick={() => setClosed(true)}
               className="p-1 text-white/40 hover:text-white transition-colors"
               title="Fechar"
             >
               <X size={16} />
             </button>
          </div>

          <div>
             <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/80 leading-none mb-1.5 flex items-center gap-2">
               <Bell size={8} className="animate-bounce" /> Próxima Grande Data
             </p>
             <h4 className="text-base font-black uppercase tracking-tight text-white mb-2">
               {upcomingMajorDate.name}
             </h4>
             <span className="text-[8px] font-bold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
               Faltam {daysTo} {daysTo === 1 ? 'dia' : 'dias'}
             </span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
             <p className="text-[8px] font-black uppercase tracking-widest text-white/70 italic max-w-[120px] line-clamp-1">
               {upcomingMajorDate.marketing_phrase}
             </p>
             <button 
               onClick={() => {
                 if (onSearch) {
                   onSearch(upcomingMajorDate.name);
                   const catalogGrid = document.getElementById('catalog-grid');
                   if (catalogGrid) catalogGrid.scrollIntoView({ behavior: 'smooth' });
                 }
               }}
               className="bg-white text-gray-900 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg"
             >
               Sugestões <ArrowRight size={10} />
             </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

const X = ({ size, className = "" }: { size: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
);
