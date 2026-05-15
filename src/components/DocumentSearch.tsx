import React, { useState } from 'react';
import { Search, ChevronLeft, AlertCircle, Gift, ArrowRight } from 'lucide-react';
import { getOrderByCode, getGiftList } from '../services/firebaseService';
import { Order, Product } from '../types';
import { OrderReceiptModal } from './Admin/OrderReceiptModal';
import { motion, AnimatePresence } from 'motion/react';
import { themes } from '../lib/theme';
import { ImageWithFallback } from './ImageWithFallback';

interface DocumentSearchProps {
  onGoBack: () => void;
}

export const DocumentSearch: React.FC<DocumentSearchProps> = ({ onGoBack }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [giftList, setGiftList] = useState<any | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError('');
    setOrder(null);
    setGiftList(null);

    const uppercaseCode = code.trim().toUpperCase();

    // Try Order first
    const fetchedOrder = await getOrderByCode(uppercaseCode);
    if (fetchedOrder) {
      setOrder(fetchedOrder);
      setLoading(false);
      return;
    }

    // Try Gift List
    const fetchedList = await getGiftList(uppercaseCode);
    if (fetchedList) {
      setGiftList(fetchedList);
      setLoading(false);
      return;
    }

    setLoading(false);
    setError('Documento ou Lista não encontrados. Verifique o código e tente novamente.');
  };

  return (
    <div className="min-h-[100dvh] bg-[#F8F6F2] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl -ml-32 -mb-32" />

      <button 
        onClick={onGoBack} 
        className="fixed top-6 left-6 p-4 rounded-full bg-white hover:bg-gray-50 transition-all z-50 text-black border border-[#D4AF37]/20 shadow-sm"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
        <div className="text-center mb-10 space-y-4">
          <div className="w-20 h-20 bg-white text-[#D4AF37] rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl border border-[#D4AF37]/20 relative overflow-hidden">
             <div className="absolute inset-0 bg-[#D4AF37]/5 animate-pulse" />
             <Search size={32} className="relative z-10" />
          </div>
          <h1 className="text-3xl font-fancy text-[#D4AF37] drop-shadow-sm">Busca no Catálogo</h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
            Localize seu pedido ou lista de presentes
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-6 bg-white/80 backdrop-blur-3xl p-8 rounded-[2.5rem] shadow-2xl border border-[#D4AF37]/10">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-2">Código (Pedido ou Lista)</label>
            <input 
              type="text" 
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ex: X12345 ou L98765P" 
              className="w-full text-center bg-white border border-gray-100 rounded-2xl px-6 py-5 text-xl font-mono font-black outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 transition-all uppercase placeholder:opacity-30"
              autoFocus
            />
          </div>

          {error && (
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-red-50 text-red-500 text-xs font-bold text-center border border-red-100">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full py-5 bg-[#D4AF37] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:bg-gray-400"
          >
            {loading ? 'Buscando...' : 'Pesquisar Agora'}
          </button>
        </form>
      </div>

      <AnimatePresence>
        {giftList && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          >
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-[#D4AF37]/5">
                <div className="flex items-center gap-3 text-[#D4AF37]">
                  <Gift size={24} />
                  <div>
                    <h2 className="text-xl font-fancy">Lista de Presentes</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Código: {giftList.code}</p>
                  </div>
                </div>
                <button onClick={() => setGiftList(null)} className="p-3 bg-white rounded-full text-gray-400 hover:text-black shadow-sm">
                  <ChevronLeft className="rotate-90 md:rotate-0" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {(giftList.items || []).map((item: Product, idx: number) => (
                  <div key={`${item.id}-${idx}`} className="flex gap-4 items-center group">
                    <div className="w-20 h-20 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <ImageWithFallback src={item.image} alt={item.product_name} className="w-full h-full object-cover transition-transform group-hover:scale-110" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-200">
                          <Gift size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-black text-black leading-tight mb-1">{item.product_name}</h3>
                      <p className="text-xs text-[#D4AF37] font-bold">R$ {item.retail_price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-8 bg-gray-50 border-t border-gray-100">
                <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                  Compartilhado via Ateliês de Julia Aleixo
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setGiftList(null)}
                    className="flex-1 py-4 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-black transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {order && (
        <OrderReceiptModal 
          order={order} 
          onClose={() => setOrder(null)} 
        />
      )}
    </div>
  );
};
