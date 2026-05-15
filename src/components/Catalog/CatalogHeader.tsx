import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Gift } from 'lucide-react';
import { BotaoVoltar } from '../BotaoVoltar';
import { CompanyId } from '../../types';
import { FestiveBanner } from './FestiveBanner';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../ImageWithFallback';

export const CatalogHeader: React.FC<{
  companyName: string;
  logoUrl: string | null;
  theme: any;
  onCartClick: () => void;
  cartCount: number;
  onGiftListClick: () => void;
  giftListCount: number;
  onSearch: (s: string) => void;
  onGoBack: () => void;
  onLogoClick?: () => void;
  companyId?: CompanyId;
}> = ({ companyName, logoUrl, theme, onSearch, onGoBack, companyId, onGiftListClick, giftListCount, onLogoClick }) => {
  const isMimada = companyId === 'mimada' || companyName.toLowerCase().includes('mimada');
  const isPallyra = companyId === 'pallyra';

  return (
    <header className="relative z-50 w-full" style={{ backgroundColor: theme.primaryColor || '#FAF9F6' }}>
      <BotaoVoltar onClick={onGoBack} />
      
      {/* Editorial Luxury Header */}
      <div className={`w-full flex-col items-center justify-center pt-4 pb-4 px-6 transition-all duration-700 relative overflow-hidden`}
           style={{ 
             backgroundColor: theme.primaryColor || (isMimada ? '#FF007F' : (isPallyra ? '#FAF9F6' : '#ffffff')),
           }}>
        
        {/* Subtle Background Elements - Now for all brands with brand accent color */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-[0.04]">
           <div className="w-[100vw] h-[100vw] rounded-full border-[1px] absolute scale-150 animate-[spin_120s_linear_infinite]" style={{ borderColor: theme.accentColor }} />
           <div className="w-[80vw] h-[80vw] rounded-full border-[1px] absolute scale-125 animate-[spin_90s_linear_infinite_reverse]" style={{ borderColor: theme.accentColor }} />
        </div>

        <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
            {/* Logo & Name Side-by-Side arrangement standard for all */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 mb-6">
              <motion.div 
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 0.8, ease: "easeOut" }}
                 onClick={onLogoClick}
                 className={`w-32 h-32 md:w-40 md:h-40 ${isMimada ? 'bg-white shadow-lg' : 'bg-white/10 shadow-2xl'} rounded-full flex items-center justify-center relative transition-all duration-700 overflow-hidden cursor-pointer`}
                 style={{ border: `2px solid ${theme.accentColor}33` }}
              >
                {logoUrl ? (
                  <ImageWithFallback
                    src={logoUrl}
                    alt={companyName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    loading="eager"
                  />
                ) : (
                  <div className="text-2xl font-black text-gray-400 font-serif lowercase italic">
                    {companyName.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                {/* Brand Glow Overlay */}
                <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30" style={{ backgroundColor: theme.accentColor }} />
              </motion.div>
              
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <motion.h1 
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                     className={`text-5xl md:text-7xl lg:text-[100px] leading-[0.8] tracking-tight font-beauty mb-2`}
                     style={{ 
                       color: isMimada && theme.primaryColor === '#FFFFFF' ? '#FF007F' : (isMimada ? '#ffffff' : theme.accentColor),
                       textShadow: `0px 10px 40px ${theme.accentColor}33`,
                       letterSpacing: '-2px'
                     }}>
                  {companyName}
                </motion.h1>
                
                {/* Emotional Tagline unified style */}
                <motion.p 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: 0.6, duration: 1 }}
                   className={`max-w-lg text-[10px] md:text-xs tracking-[0.4em] leading-relaxed uppercase font-black opacity-60`}
                   style={{ color: (isMimada && theme.primaryColor !== '#FFFFFF') || companyId === 'guennita' ? '#ffffff' : '#000000' }}
                >
                  Exclusividade em cada detalhe. 
                  <span className="block mt-1.5 opacity-100 font-black">Edições limitadas.</span>
                </motion.p>
              </div>
            </div>
            
            {/* Minimalist Search & Access Standardized */}
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.4, duration: 0.8 }}
               className="flex items-center justify-center gap-6 w-full max-w-md group"
            >
               <div className="flex items-center gap-4 flex-1 border-b-2 pb-2 transition-all duration-500 group-focus-within:border-opacity-100" 
                    style={{ borderColor: `${theme.accentColor}33` }}>
                 <Search size={16} className="opacity-40 transition-opacity group-focus-within:opacity-100" style={{ color: (isMimada && theme.primaryColor !== '#FFFFFF') || companyId === 'guennita' ? '#ffffff' : theme.accentColor }} />
                 <input 
                   type="text" 
                   placeholder="O que você procura?" 
                   className={`bg-transparent text-[11px] md:text-xs font-sans tracking-[0.2em] uppercase outline-none w-full placeholder:text-opacity-40 transition-all text-center focus:text-left font-black`}
                   style={{ 
                     color: (isMimada && theme.primaryColor !== '#FFFFFF') || companyId === 'guennita' ? '#ffffff' : '#161616',
                   }}
                   onChange={(e) => onSearch(e.target.value)}
                 />
               </div>
               
               <button 
                 onClick={onGiftListClick}
                 className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-all duration-300 relative group/btn hover:scale-110"
                 title="Ver Lista de Presentes"
                 style={{ color: isMimada && theme.primaryColor !== '#FFFFFF' ? '#ffffff' : theme.accentColor }}
               >
                 <Gift size={20} strokeWidth={2} />
                 <span className="text-[8px] font-black uppercase tracking-tighter">Listas</span>
                 {giftListCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full text-[8px] text-white shadow-lg animate-pulse" 
                          style={{ backgroundColor: theme.accentColor }}>
                      {giftListCount}
                    </span>
                 )}
               </button>
            </motion.div>

            {/* Festive Banner Unified Positioning */}
            <FestiveBanner 
              companyId={companyId || 'pallyra'} 
              primaryColor={theme.accentColor} 
            />
        </div>
      </div>
    </header>
  );
};
