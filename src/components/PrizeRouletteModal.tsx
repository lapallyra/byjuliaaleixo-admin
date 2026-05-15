import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, X } from 'lucide-react';
import { CompanyId } from '../types';

export const PrizeRouletteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onResult?: (prize: string) => void;
  prizes: { id: string; name: string; active: boolean; weight: number }[];
  theme: any;
}> = ({ isOpen, onClose, onResult, prizes, theme }) => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const rouletteRef = useRef<HTMLDivElement>(null);

  // Filter only active prizes, or use defaults if empty
  const defaultPrizes = Array.from({length: 7}).map((_, i) => ({ id: `default-${i}`, name: `Brinde ${i+1}`, active: true, weight: 10 }));
  const activePrizes = (prizes && prizes.length > 0) ? prizes.filter(p => p.active).slice(0, 7) : defaultPrizes;
  
  if (!isOpen || activePrizes.length === 0) return null;

  const accentColor = theme.accentColor || '#d4af37';

  const totalWeight = activePrizes.reduce((sum, p) => sum + (p.weight || 10), 0);
  const slices = activePrizes.length;
  const sliceAngles = 360 / slices;

  const spin = () => {
    if (spinning || result) return;
    
    setSpinning(true);
    
    // Choose winner based on weight
    let randomNum = Math.random() * totalWeight;
    let winnerIndex = 0;
    
    for (let i = 0; i < activePrizes.length; i++) {
        randomNum -= (activePrizes[i].weight || 10);
        if (randomNum <= 0) {
            winnerIndex = i;
            break;
        }
    }

    // Calculate rotation to stop exactly at the winner slice
    const baseRotations = 360 * 5; // 5 full spins
    // the pointer is at the top (0 degrees). We want the winner slice to end up at the top.
    // winner slice center is at winnerIndex * sliceAngles + sliceAngles/2
    const targetAngle = 360 - (winnerIndex * sliceAngles + sliceAngles/2);
    const totalRotation = rotation + baseRotations + targetAngle - (rotation % 360);
    
    setRotation(totalRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(activePrizes[winnerIndex].name);
      if (onResult) onResult(activePrizes[winnerIndex].name);
    }, 2000); // 2s
  };

  const getSliceColor = (idx: number) => {
      // Solid colors based on the theme (no gradients)
      if (accentColor === '#d4af37' || accentColor === '#FFD700') {
          // Pallyra (gold/black)
          return idx % 2 === 0 ? '#1a1a1a' : '#d4af37';
      } else if (accentColor === '#ec4899' || accentColor === '#ec4899') {
          // Mimada (pink)
          return idx % 2 === 0 ? '#fbcfe8' : '#f472b6';
      } else {
          // Guennita (red/gold)
          return idx % 2 === 0 ? '#7a0a11' : '#fca5a5';
      }
  };

  const getTextColor = (idx: number) => {
      if (accentColor === '#d4af37' || accentColor === '#FFD700') {
          return idx % 2 === 0 ? '#FFD700' : '#1a1a1a';
      } else if (accentColor === '#ec4899') {
          return idx % 2 === 0 ? '#831843' : '#fff';
      } else {
          return idx % 2 === 0 ? '#fca5a5' : '#7a0a11';
      }
  };

  const conicStops = activePrizes.map((_, idx) => {
    const start = idx * sliceAngles;
    const end = start + sliceAngles;
    return `${getSliceColor(idx)} ${start}deg ${end}deg`;
  }).join(', ');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[5000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      >
        <div className={`relative bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center p-8`} style={{ border: `2px solid ${accentColor}` }}>
          
          <div className="absolute top-4 right-4">
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors" disabled={spinning && !result}>
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: accentColor + '20' }}>
              <Gift size={32} style={{ color: accentColor }} />
            </div>
          </div>

          {result ? (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center w-full">
              <h2 className="text-3xl font-fancy mb-4 tracking-widest text-black" style={{ color: accentColor }}>Um presente para você!</h2>
              <div className="py-8 px-6 rounded-[2rem] mb-8 border-2 border-dashed" style={{ backgroundColor: accentColor + '05', borderColor: accentColor + '30' }}>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-gray-400">Brinde Especial Conquistado</p>
                  <p className="text-2xl font-black mb-2" style={{ color: accentColor }}>{result}</p>
                  <div className="h-px w-12 bg-gray-200 mx-auto my-4" />
                  <p className="text-sm italic text-gray-600 leading-relaxed font-serif">
                    "Você ganhou um brinde especial preparado com carinho para tornar seu momento ainda mais inesquecível."
                  </p>
                  <p className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37] mt-4 opacity-60">(Limite de 1 unidade por pedido)</p>
              </div>
              <p className="text-[10px] text-gray-400 mb-8 font-black uppercase tracking-widest leading-relaxed">O resgate é automático no seu pedido! ♡</p>
              <button
                onClick={onClose}
                className="w-full py-5 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
                style={{ backgroundColor: accentColor, boxShadow: `0 10px 25px ${accentColor}33` }}
              >
                Continuar Navegando
              </button>
            </motion.div>
          ) : (
            <div className="text-center w-full">
              <h2 className="text-2xl font-fancy mb-2 tracking-widest text-black" style={{ color: accentColor }}>Pedido Registrado!</h2>
              <p className="text-xs text-gray-500 mb-8 font-bold leading-relaxed uppercase tracking-widest">
                Você acaba de ganhar uma chance na nossa roleta de mimos
              </p>

              <div className="relative w-64 h-64 mx-auto mb-8">
                {/* Pointer */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px]" style={{ borderTopColor: accentColor }}></div>
                
                {/* Wheel */}
                <div 
                  ref={rouletteRef}
                  className="w-full h-full rounded-full shadow-inner overflow-hidden border-8"
                  style={{ 
                    borderColor: '#fff',
                    background: `conic-gradient(${conicStops})`,
                    transform: `rotate(${rotation}deg)`,
                    transition: spinning ? 'transform 2s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none'
                  }}
                >
                    {/* Items text overlay */}
                    {activePrizes.map((prize, idx) => {
                        const angle = idx * sliceAngles + sliceAngles / 2;
                        return (
                            <div 
                                key={prize.id} 
                                className="absolute w-full h-full flex items-center justify-center font-bold text-[10px] uppercase tracking-wider"
                                style={{ 
                                    transform: `rotate(${angle}deg)`, 
                                    transformOrigin: '50% 50%',
                                    color: getTextColor(idx),
                                }}
                            >
                                <div className="absolute top-4 text-center leading-tight whitespace-pre-wrap w-20 line-clamp-2">
                                    {prize.name}
                                </div>
                            </div>
                        );
                    })}
                </div>
                {/* Center dot */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md z-10 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: accentColor }}></div>
                </div>
              </div>

              <button
                onClick={spin}
                disabled={spinning}
                className={`w-full py-4 text-white font-black uppercase tracking-widest rounded-xl transition-transform hover:scale-[1.02] active:scale-95 shadow-xl disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2`}
                style={{ backgroundColor: accentColor }}
              >
                {spinning ? 'Girando...' : 'Girar Roleta'}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
