import React, { useState, useEffect } from 'react';
import { Package, ImageOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SafeImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  containerClassName?: string;
  transformSettings?: {
    scale?: number;
    translateX?: number;
    translateY?: number;
    rotate?: number;
  };
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  showLoading?: boolean;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = "Imagem do produto",
  className = "",
  containerClassName = "",
  transformSettings,
  objectFit = 'contain',
  showLoading = true
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);

  useEffect(() => {
    if (src) {
      setIsLoading(true);
      setIsError(false);
      setCurrentSrc(src);
    } else {
      setIsLoading(false);
      setIsError(true);
      setCurrentSrc(null);
    }
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    setIsError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setIsError(true);
    console.warn(`SafeImage: Failed to load image: ${src}`);
  };

  const transformStyle = transformSettings ? {
    transform: `scale(${transformSettings.scale ?? 1}) translate(${transformSettings.translateX ?? 0}px, ${transformSettings.translateY ?? 0}px) rotate(${transformSettings.rotate ?? 0}deg)`
  } : undefined;

  return (
    <div className={`relative overflow-hidden flex items-center justify-center rounded-2xl ${containerClassName}`}>
      <AnimatePresence mode="wait">
        {isLoading && showLoading && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-100/50 flex flex-col items-center justify-center rounded-2xl"
          >
            <div className="w-full h-full bg-linear-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse" />
            <Loader2 className="absolute text-gray-300 animate-spin" size={24} />
          </motion.div>
        )}

        {isError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center text-gray-300 space-y-2 p-8 text-center"
          >
            <div className="p-4 bg-gray-50 rounded-full">
              <ImageOff size={32} strokeWidth={1} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Imagem indisp.</p>
          </motion.div>
        ) : currentSrc ? (
          <motion.img
            key={currentSrc}
            src={currentSrc}
            alt={alt}
            loading="lazy"
            onLoad={handleLoad}
            onError={handleError}
            className={`rounded-2xl ${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
            style={{ 
              objectFit,
              width: '100%',
              height: '100%',
              ...transformStyle
            }}
            referrerPolicy="no-referrer"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: isLoading ? 0 : 1, scale: isLoading ? 0.98 : 1 }}
            transition={{ duration: 0.4 }}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
};
