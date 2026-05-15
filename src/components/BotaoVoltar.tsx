import React from 'react';
import { ArrowLeft } from 'lucide-react';

export const BotaoVoltar: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick || (() => window.location.href = '/')}
    className="fixed top-4 left-4 z-[9999] w-10 h-10 flex items-center justify-center bg-white/70 backdrop-blur-md border border-[#161616]/10 rounded-full text-[#161616] hover:bg-white transition-all shadow-lg active:scale-95"
    title="Voltar"
  >
    <ArrowLeft size={16} />
  </button>
);
