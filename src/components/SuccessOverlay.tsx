import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle } from 'lucide-react';
import { CompanyId } from '../types';

interface SuccessOverlayProps {
  company: CompanyId;
  onContinue: () => void;
}

export const SuccessOverlay: React.FC<SuccessOverlayProps> = ({ company, onContinue }) => {
  const logos = {
    pallyra: '🎨',
    guennita: '👑',
    mimada: '💅'
  };

  const pixieChars = ['·', '✦', '✧', '•', '⋆', '💫', '🌟', '⭐'];
  
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999] overflow-hidden">
      <div className="relative flex flex-col items-center justify-center text-center px-6">
        {/* Burst Animation */}
        {[...Array(60)].map((_, i) => {
          const angle = (i / 60) * Math.PI * 2;
          const distance = 350 + Math.random() * 300;
          const tx = Math.cos(angle) * distance;
          const ty = Math.sin(angle) * distance;
          return (
            <div
              key={`burst-${i}`}
              className="absolute pointer-events-none text-[#d4af37] text-2xl burst-sparkle"
              style={{
                '--tx': `${tx}px`,
                '--ty': `${ty}px`,
              } as any}
            >
              {pixieChars[Math.floor(Math.random() * pixieChars.length)]}
            </div>
          );
        })}

        <motion.div
          initial={{ opacity: 0, scale: 0, rotate: -45 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', delay: 0.6, duration: 0.8 }}
          className="text-9xl mb-10 filter drop-shadow-[0_0_30px_rgba(212,175,55,0.6)]"
        >
          {logos[company] || '✨'}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="text-white space-y-4 max-w-2xl text-center"
        >
          <p className="text-3xl md:text-5xl font-hand tracking-wide leading-tight">
            Agradecemos pela oportunidade de participar desse momento especial. 💖
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          whileHover={{ scale: 1.08 }}
          onClick={onContinue}
          className="mt-12 py-4 px-12 bg-gradient-to-r from-[#d4af37] to-[#ffd700] text-black font-sans font-bold text-xl rounded-full uppercase tracking-widest shadow-xl hover:shadow-[#d4af37]/50"
          style={{ fontFamily: 'Tahoma, sans-serif' }}
        >
          Voltar ao Catálogo
        </motion.button>
      </div>
    </div>
  );
};
