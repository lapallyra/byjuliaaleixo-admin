import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gift, ShoppingBag, ArrowRight } from 'lucide-react';
import { Product, CartItem } from '../types';
import { formatCurrency } from '../lib/currencyUtils';
import { ImageWithFallback } from './ImageWithFallback';

export const SearchedGiftListModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  giftList: { 
    id?: string;
    code: string;
    items: Product[];
    customerName?: string;
  } | null;
  theme: any;
  onAddToCart: (product: Product, quantity?: number) => void;
  onViewProduct: (product: Product) => void;
  companyId: string;
}> = ({ isOpen, onClose, giftList, theme, onAddToCart, onViewProduct, companyId }) => {
  if (!giftList) return null;

  const totalValue = giftList.items.reduce((acc, item) => acc + (item.retail_price || 0), 0);
  const accentColor = theme.accentColor;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white shadow-2xl z-[1001] overflow-hidden md:rounded-[2.5rem] flex flex-col max-h-[90vh]`}
          >
            <div className="p-8 md:p-10 border-b border-black/5 relative overflow-hidden">
               {/* Decorative Background */}
               <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 pointer-events-none rounded-full" style={{ backgroundColor: accentColor }} />
               
               <div className="flex justify-between items-start relative z-10">
                  <div className="space-y-1">
                    <h2 className="text-3xl md:text-4xl font-serif font-black text-[#161616]">Lista de Presentes</h2>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">Código:</span>
                       <span className="text-sm font-black tracking-widest text-[#161616] bg-black/5 px-2 py-0.5 rounded leading-none">{giftList.code}</span>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-3 rounded-full hover:bg-black/5 transition-colors text-[#161616]">
                    <X size={24} />
                  </button>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 bg-[#F9F9F8]">
              {giftList.items.map((item, idx) => (
                <motion.div 
                  key={`${item.id}-${idx}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => onViewProduct(item)}
                  className="bg-white p-4 md:p-5 rounded-3xl border border-black/5 flex items-center gap-5 group cursor-pointer hover:shadow-xl transition-all duration-500"
                >
                  {/* Mini Foto */}
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-[#F9F9F8] overflow-hidden flex-shrink-0 border border-black/5 relative group-hover:scale-105 transition-transform duration-500">
                    {item.image ? (
                      <ImageWithFallback src={item.image} alt={item.product_name} className="w-full h-full object-contain p-0" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-black/10">
                        <Gift size={24} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm md:text-base font-black text-[#161616] leading-tight line-clamp-1 mb-1 group-hover:text-amber-600 transition-colors">
                      {item.product_name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                       <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-black uppercase tracking-widest text-black/30">Valor:</span>
                          <span className="text-xs font-bold text-[#161616]">{formatCurrency(item.retail_price)}</span>
                       </div>
                       <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-black uppercase tracking-widest text-black/30">Qtd:</span>
                          <span className="text-xs font-bold text-[#161616]">01</span>
                       </div>
                       <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-black uppercase tracking-widest text-black/30">Total:</span>
                          <span className="text-xs font-black text-[#161616] p-1 px-2 bg-black/5 rounded">{formatCurrency(item.retail_price)}</span>
                       </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(item, 1);
                      }}
                      className="p-3 rounded-2xl text-white shadow-lg shadow-black/10 transition-all hover:scale-110 active:scale-95"
                      style={{ backgroundColor: accentColor }}
                      title="Comprar este presente"
                    >
                      <ShoppingBag size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-8 md:p-10 border-t border-black/5 bg-white">
              <div className="flex justify-between items-center mb-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Valor Total da Lista</p>
                  <p className="text-3xl md:text-4xl font-serif font-black text-[#161616]">{formatCurrency(totalValue)}</p>
                </div>
                <div className="flex flex-col items-end">
                   <span className="flex items-center gap-2 text-emerald-600 font-bold text-xs bg-emerald-50 px-3 py-1.5 rounded-full">
                     <Gift size={14} />
                     Lista Validada
                   </span>
                </div>
              </div>
              
              <button 
                onClick={onClose}
                className="w-full py-5 rounded-2xl bg-[#161616] text-white text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl active:scale-95"
              >
                Continuar Navegando
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
