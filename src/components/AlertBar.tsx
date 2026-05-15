import React, { useState, useEffect } from 'react';

export const AlertBar: React.FC = () => {
  const [index, setIndex] = useState(0);
  const messages = [
    "Pedidos acima de R$300 ganham brinde exclusivo",
    "APROVEITE: Produto com alta procura hoje",
    "Confira nossos Produtos Novos"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[1000] bg-[#D4AF37] text-black text-center py-2 text-xs font-bold uppercase tracking-widest">
      {messages[index]}
    </div>
  );
};
