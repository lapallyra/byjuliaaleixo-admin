import React, { useState } from 'react';
import { MessageSquare, Send, X, CheckCircle2, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CompanyId } from '../types';
import { addSuggestion } from '../services/firebaseService';

interface SuggestionBoxProps {
  companyId: CompanyId;
}

export const SuggestionBox: React.FC<SuggestionBoxProps> = ({ companyId }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !subject.trim() || loading) return;

    setLoading(true);
    try {
      await addSuggestion(companyId, `ASSUNTO: ${subject}\n\nSUGESTÃO: ${message}`);
      setSent(true);
      setMessage('');
      setSubject('');
      setTimeout(() => {
        setSent(false);
        setIsFormOpen(false);
      }, 3000);
    } catch (e) {
      console.error(e);
      alert('Erro ao enviar sugestão.');
    } finally {
      setLoading(false);
    }
  };

  const themes = {
    pallyra: {
      bg: 'bg-black/95 border-[#D4AF37]/30 text-[#D4AF37]',
      btn: 'bg-[#D4AF37] text-white',
      input: 'bg-white/5 border-[#D4AF37]/20 text-white',
      floating: 'bg-[#D4AF37] text-white shadow-[#D4AF37]/40 ring-[#D4AF37]',
      text: 'text-white'
    },
    guennita: {
      bg: 'bg-[#451225]/95 border-[#D4AF37]/30 text-[#D4AF37]',
      btn: 'bg-[#56070c] text-[#D4AF37]',
      input: 'bg-white/5 border-[#D4AF37]/20 text-white',
      floating: 'bg-[#56070c] text-[#D4AF37] shadow-[#56070c]/40 ring-[#56070c]',
      text: 'text-[#D4AF37]'
    },
    mimada: {
      bg: 'bg-white/95 border-[#FF007F]/20 text-gray-900',
      btn: 'bg-[#FF007F] text-white',
      input: 'bg-gray-50 border-[#FF007F]/10 text-black',
      floating: 'bg-[#FF007F] text-white shadow-[#FF007F]/40 ring-[#FF007F]',
      text: 'text-white'
    }
  };

  const theme = themes[companyId as keyof typeof themes] || themes.mimada;

  return (
    <div className="fixed bottom-[154px] md:bottom-[180px] right-6 md:right-10 z-[1000] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`mb-4 w-72 ${theme.bg} rounded-[2rem] border shadow-2xl p-6 relative overflow-hidden backdrop-blur-md`}
          >
            <button 
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 opacity-40 hover:opacity-100 transition-opacity"
            >
              <X size={18} />
            </button>

            {sent ? (
              <div className="py-8 text-center animate-in zoom-in-95 duration-300">
                 <div className={`w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <CheckCircle2 size={24} />
                 </div>
                 <h4 className={`text-xs font-black uppercase tracking-widest`}>Obrigado!</h4>
                 <p className={`text-[9px] opacity-60 font-bold uppercase tracking-widest mt-2`}>Sua sugestão foi enviada com sucesso.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                   <div className={`p-2 rounded-xl bg-current/10`}>
                      <MessageSquare size={16} />
                   </div>
                   <h4 className={`text-[10px] font-black uppercase tracking-widest`}>Sugestões</h4>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="ASSUNTO..."
                    className={`w-full ${theme.input} rounded-2xl px-4 py-3 text-[10px] font-bold outline-none focus:ring-1 ring-current transition-all placeholder:opacity-30`}
                    required
                  />
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="ESCREVA SUA SUGESTÃO..."
                    className={`w-full ${theme.input} rounded-2xl px-4 py-3 text-[10px] font-bold outline-none h-24 resize-none focus:ring-1 ring-current transition-all placeholder:opacity-30`}
                    required
                  />
                  <button
                    disabled={loading}
                    type="submit"
                    className={`w-full py-3 ${theme.btn} rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50`}
                  >
                    {loading ? 'ENVIANDO...' : 'ENVIAR SUGESTÃO'}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-2 w-48 ${theme.bg} rounded-2xl border shadow-2xl p-2 backdrop-blur-md`}
          >
            <button
              onClick={() => {
                setIsFormOpen(true);
                setIsMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 text-[10px] font-bold hover:bg-white/5 rounded-xl transition-all`}
            >
              Sugestões
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`relative w-12 h-12 md:w-16 md:h-16 ${theme.floating} rounded-[1.8rem] shadow-2xl border flex items-center justify-center hover:scale-110 active:scale-95 transition-all group backdrop-blur-md overflow-hidden`}
      >
        <motion.div 
          className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-[45deg]"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 2 }}
        />
        {isMenuOpen ? <ChevronDown size={24} /> : <MessageSquare size={20} className="group-hover:rotate-12 transition-transform relative z-10" />}
      </button>
    </div>
  );
};
