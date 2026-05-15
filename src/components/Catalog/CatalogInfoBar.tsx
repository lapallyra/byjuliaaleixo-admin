import React, { useState } from 'react';
import { Truck, AlertCircle, CreditCard, ShieldCheck, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export const CatalogInfoBar: React.FC<{theme: any}> = ({ theme }) => {
  const items = [
    { icon: Truck, title: "Envio Nacional", text: "Envio pelos correios" },
    { icon: AlertCircle, title: "Taxa Emergencial", text: "Será adicionado R$ 25,00 no valor final." },
    { icon: CreditCard, title: "Parcelamento", text: "Taxa adicional da máquina de cartão" },
    { icon: ShieldCheck, title: "Compra Segura", text: "Site seguro para compras" },
    { icon: Zap, title: "Sob Encomenda", text: "Produtos feitos apenas sob encomenda 03-20 dias uteis." },
  ];

  const isPallyra = theme.primaryColor === '#F8F8F6';
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className={`flex overflow-visible gap-10 py-10 px-4 scrollbar-hide items-center justify-center relative flex-wrap`}>
      {items.map((item, i) => (
        <div 
          key={item.title} 
          className={`relative flex-shrink-0 flex flex-col items-center gap-3 transition-opacity opacity-70 hover:opacity-100 cursor-help group z-10`}
          onMouseEnter={() => setHoveredIndex(i)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <item.icon size={18} strokeWidth={1} className={theme.textPrimary} />
          <div className="flex flex-col items-center">
            <span className={`text-[8px] font-medium uppercase tracking-[0.3em] ${theme.textPrimary}`}>{item.title}</span>
          </div>

          <AnimatePresence>
            {hoveredIndex === i && (
              <motion.div
                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                animate={{ opacity: 1, y: 5, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full mt-2 w-48 p-3 bg-black text-white text-[10px] leading-relaxed font-sans text-center rounded-xl shadow-2xl z-[100] pointer-events-none"
              >
                {item.text}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-black"></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};
