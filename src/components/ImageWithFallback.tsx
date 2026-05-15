import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  containerClassName?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = "Imagem",
  className = "",
  fallbackSrc = '/logo_placeholder.png', // this should be a valid fallback image
  containerClassName = "",
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    if (fallbackSrc && img.src !== new URL(fallbackSrc, window.location.href).href) {
      img.src = fallbackSrc;
    } else if (!error) {
       setError(true);
       setLoading(false);
    }
    
    if (loading) setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  const hasSrc = Boolean(src && src.trim() !== '');
  const isObjectFitProvided = className.includes('object-');

  if (!hasSrc || error) {
    return (
      <div className={`relative overflow-hidden flex-shrink-0 flex items-center justify-center bg-gray-50/50 ${className} ${containerClassName}`} style={props.style}>
        <div className={`flex flex-col items-center justify-center w-full h-full text-gray-400 p-2 text-center`}>
           <ImageOff className="w-6 h-6 mb-1 opacity-40 shrink-0" />
           <span className="text-[9px] uppercase font-bold tracking-widest opacity-40 leading-tight">Indisponível</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden flex-shrink-0 flex items-center justify-center bg-transparent ${className} ${containerClassName}`} style={props.style}>
      {loading && (
        <div className="absolute inset-0 bg-gray-200/50 animate-pulse z-10" />
      )}
      
      <img
        src={src}
        alt={alt}
        className={`w-full h-full transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'} ${isObjectFitProvided ? '' : 'object-cover'} ${className}`}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
        {...props}
      />
    </div>
  );
};
