import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { getSiteSettings } from '../../services/firebaseService';

import { CompanyId } from '../../types';

export const DateHighlights: React.FC<{theme: any, companyId?: CompanyId}> = ({ theme, companyId }) => {
  const [customDates, setCustomDates] = useState<any[]>([]);

  useEffect(() => {
    const fetchDates = async () => {
      try {
        if (!companyId) return;
        const settings = await getSiteSettings(companyId);
        if (settings?.customDates) {
          setCustomDates(settings.customDates);
        } else {
          setCustomDates([
            { name: "Dia da Planta", day: 17, month: 3 },
            { name: "Dia do Café", day: 14, month: 3 },
            { name: "Dia da Árvore", day: 21, month: 8 },
            { name: "Dia do Professor", day: 15, month: 9 },
            { name: "Dia do Cliente", day: 15, month: 8 },
            { name: "Dia da Flor", day: 22, month: 8 }
          ]);
        }
      } catch (e) {
        setCustomDates([
          { name: "Dia da Planta", day: 17, month: 3 },
          { name: "Dia do Café", day: 14, month: 3 },
          { name: "Dia da Árvore", day: 21, month: 8 },
          { name: "Dia do Professor", day: 15, month: 9 },
          { name: "Dia do Cliente", day: 15, month: 8 },
          { name: "Dia da Flor", day: 22, month: 8 }
        ]);
      }
    };
    fetchDates();
  }, [companyId]);

  const dates = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const year = today.getFullYear();

    const getSecondSunday = (month: number) => {
      const d = new Date(year, month, 1);
      const day = d.getDay();
      const firstSunday = day === 0 ? 1 : 8 - day;
      return new Date(year, month, firstSunday + 7);
    };

    const getEaster = (y: number) => {
      const f = Math.floor, G = y % 19, C = f(y / 100),
            H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
            I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
            J = (y + f(y / 4) + I + 2 - C + f(C / 4)) % 7,
            L = I - J, month = 3 + f((L + 40) / 44), day = L + 28 - 31 * f(month / 4);
      return new Date(y, month - 1, day);
    };

    const eventDates = [
      { name: "Carnaval", date: new Date(getEaster(year).getTime() - 47 * 24 * 60 * 60 * 1000) },
      { name: "Dia da Mulher", date: new Date(year, 2, 8) },
      { name: "Páscoa", date: getEaster(year) },
      { name: "Dia das Mães", date: getSecondSunday(4) },
      { name: "Dia dos Namorados", date: new Date(year, 5, 12) },
      { name: "Dia dos Avós", date: new Date(year, 6, 26) },
      { name: "Dia dos Pais", date: getSecondSunday(7) },
      { name: "Dia das Crianças", date: new Date(year, 9, 12) },
      { name: "Halloween", date: new Date(year, 9, 31) },
      { name: "Natal", date: new Date(year, 11, 25) }
    ];
    
    customDates.forEach(cd => {
      if (cd && cd.name) {
        eventDates.push({ name: cd.name, date: new Date(year, cd.month, cd.day) });
      }
    });

    return eventDates
      .map(e => {
        let target = e.date;
        if (target < today) {
          target = new Date(year + 1, e.date.getMonth(), e.date.getDate());
        }
        const diffTime = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return { ...e, diffDays: diffTime };
      })
      .filter(e => e.diffDays <= 45 && e.diffDays >= 0)
      .sort((a, b) => a.diffDays - b.diffDays);
  }, [customDates]);

  if (dates.length === 0) return null;

  const closest = dates[0];

  return (
    <section className="px-4 pb-4 max-w-[1600px] mx-auto w-full space-y-4">
      {/* 2. Cards das Datas Comemorativas (Polish) */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {dates.map((d, i) => {
          const isNear = d.diffDays < 7;
          const accentColor = companyId === 'mimada' ? '#FF007F' : (theme.accentColor || '#000000');
          
          return (
            <motion.div 
              key={`date-highlight-${d.name}-${i}`} 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className={`p-4 rounded-[2rem] bg-white border flex flex-col items-center justify-center gap-1 shadow-sm text-center min-h-[120px] transition-all relative overflow-hidden group`}
              style={{ 
                borderColor: isNear ? accentColor : '#eee',
                boxShadow: isNear ? `0 15px 30px ${accentColor}15` : 'none',
                transform: isNear ? 'scale(1.05)' : 'none',
                zIndex: isNear ? 10 : 1
              }}
            >
              {isNear && (
                <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center bg-transparent">
                  <div className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: accentColor }} />
                </div>
              )}
              
              <div className={`text-[10px] uppercase tracking-tighter font-black line-clamp-1 mb-1 ${isNear ? 'opacity-100' : 'opacity-40'}`}
                   style={{ color: isNear ? accentColor : '#000' }}>
                {d.name}
              </div>
              <div className="text-[10px] font-black text-black/20 uppercase tracking-widest mb-3">
                {d.date.getDate().toString().padStart(2, '0')}/{(d.date.getMonth() + 1).toString().padStart(2, '0')}
              </div>
              
              <div 
                className={`text-[11px] font-black px-4 py-1.5 rounded-full shadow-sm transition-all group-hover:scale-110`} 
                style={{ 
                  color: isNear ? '#fff' : accentColor, 
                  backgroundColor: isNear ? accentColor : `${accentColor}10` 
                }}
              >
                {d.diffDays} dias
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
