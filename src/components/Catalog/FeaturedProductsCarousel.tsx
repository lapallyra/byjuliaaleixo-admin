import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Product } from '../../types';
import { ImageWithFallback } from '../ImageWithFallback';

interface FeaturedProductsCarouselProps {
  products: Product[];
  theme: any;
  companyId: string;
  onSelectProduct: (product: Product) => void;
}


export const FeaturedProductsCarousel: React.FC<FeaturedProductsCarouselProps> = ({ products, theme, companyId, onSelectProduct }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="max-w-[1600px] mx-auto px-4 mt-20 relative group">
      <h2 className="text-[10px] font-black mb-10 flex items-center gap-2 uppercase tracking-[0.3em] opacity-40 justify-center">
        Destaques da Semana
      </h2>
      
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-8 pb-10 scrollbar-none scroll-smooth snap-x"
      >
        {products.map((product, idx) => (
          <motion.div
            key={`featured-${product.id}-${idx}`}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onClick={() => onSelectProduct(product)}
            className="flex-shrink-0 w-48 cursor-pointer group flex flex-col gap-4 snap-start"
          >
            {/* Imagem com glow suave ao hover */}
            <div className="h-60 rounded-[1rem] bg-[#F5F5F3] flex items-center justify-center relative overflow-hidden transition-all duration-700 group-hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)]">
                <ImageWithFallback 
                  src={product.image || ''}
                  alt={product.product_name}
                  className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-105" 
                  style={{
                    transform: product.imageSettings ? `scale(${product.imageSettings.scale ?? 1}) translate(${product.imageSettings.translateX ?? 0}px, ${product.imageSettings.translateY ?? 0}px) rotate(${product.imageSettings.rotate ?? 0}deg)` : undefined
                  }}
                />
            </div>
            {/* Informações mínimas */}
            <div className="px-1 text-center flex flex-col items-center">
              <h3 className="font-light text-[11px] uppercase tracking-[0.2em] text-slate-500 line-clamp-1">{product.product_name}</h3>
              <div className="w-6 h-[1px] bg-slate-200 mt-2 opacity-50 transition-all group-hover:w-10"></div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
