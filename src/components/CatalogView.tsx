import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  ShoppingBag, 
  Package, 
  ChevronLeft, 
  ChevronRight,
  X,
  Sparkle,
  Diamond,
  Heart,
  Flower2,
  Stamp,
  Briefcase,
  ShoppingBasket,
  Coffee,
  Palette,
  LayoutGrid,
  Database,
  LogIn,
  Flame,
  Star,
  TrendingUp,
  Sparkles,
  Gift,
  Share2,
  MessageCircle,
  Wand2,
  Loader2
} from 'lucide-react';
import { CompanyId, AppConfig, Product, CartItem, SiteSettings } from '../types';
import { CartSidebar } from './CartSidebar';
import { GiftListSidebar } from './GiftListSidebar';
import { ProductDetailModal } from './ProductDetailModal';
import { CheckoutModal } from './CheckoutModal';

import { CatalogHeader } from './Catalog/CatalogHeader';
import { CatalogInfoBar } from './Catalog/CatalogInfoBar';
import { DateHighlights } from './Catalog/DateHighlights';
import { FeaturedProductsCarousel } from './Catalog/FeaturedProductsCarousel';
import { SearchedGiftListModal } from './SearchedGiftListModal';
import { PriceDisplay } from './ui/PriceDisplay';
import { subscribeToProducts, addProduct, getSiteSettings, getGiftList } from '../services/firebaseService';
import { PRODUCTS, INITIAL_CONFIG } from '../constants';
import { useAuth } from './AuthProvider';
import { login } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { themes } from '../lib/theme';
import { formatCurrency } from '../lib/currencyUtils';
import { ImageWithFallback } from './ImageWithFallback';

interface CatalogViewProps {
  companyId: CompanyId;
  config: AppConfig;
  allProducts: Product[]; // Keep for initial/fallback, but we'll use state
  cart: CartItem[];
  giftList: Product[];
  onAddToCart: (product: Product, quantity?: number) => void;
  onRemoveFromCart: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onSetQuantity: (id: string, quantity: number) => void;
  onAddToGiftList: (product: Product) => void;
  onRemoveFromGiftList: (id: string) => void;
  onGoBack: () => void;
  onCheckoutComplete: () => void;
  onOpenAdmin: () => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  companyId,
  config,
  allProducts,
  cart,
  giftList,
  onAddToCart,
  onRemoveFromCart,
  onUpdateQuantity,
  onSetQuantity,
  onAddToGiftList,
  onRemoveFromGiftList,
  onGoBack,
  onCheckoutComplete,
  onOpenAdmin
}) => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const theme = themes[companyId] || themes['pallyra'];
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const highlights = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay()); // go back to Sunday
    const weekSeed = d.getTime();

    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    const sortedProducts = [...allProducts].sort((a,b) => (a.id || '').localeCompare(b.id || '')); 
    
    const lowTicket = sortedProducts.filter(p => p.retail_price < 100);
    const midTicket = sortedProducts.filter(p => p.retail_price >= 100 && p.retail_price < 200);
    const highTicket = sortedProducts.filter(p => p.retail_price >= 200);

    const pickRandom = (arr: Product[], count: number, startSeed: number) => {
      if (arr.length === 0) return [];
      const result = [];
      let currentSeed = startSeed;
      const pool = [...arr];
      for(let i=0; i<count; i++) {
        if (pool.length === 0) break;
        const index = Math.floor(seededRandom(currentSeed) * pool.length);
        result.push(pool[index]);
        pool.splice(index, 1);
        currentSeed++;
      }
      return result;
    }

    const hl = [
      ...pickRandom(lowTicket.length > 0 ? lowTicket : sortedProducts, 1, weekSeed),
      ...pickRandom(midTicket.length > 0 ? midTicket : sortedProducts, 2, weekSeed + 10),
      ...pickRandom(highTicket.length > 0 ? highTicket : sortedProducts, 2, weekSeed + 20)
    ].slice(0, 5);
    
    const uniqueHl = [];
    const seenIds = new Set();
    for (const p of hl) {
      if (!seenIds.has(p.id)) {
        seenIds.add(p.id);
        uniqueHl.push(p);
      }
    }
    
    // If we don't have enough unique highlights, fill from sortedProducts
    let currentSeed = weekSeed + 100;
    while (uniqueHl.length < 5 && uniqueHl.length < sortedProducts.length) {
      const idx = Math.floor(seededRandom(currentSeed) * sortedProducts.length);
      const p = sortedProducts[idx];
      if (!seenIds.has(p.id)) {
        seenIds.add(p.id);
        uniqueHl.push(p);
      }
      currentSeed++;
    }
    
    return uniqueHl;
  }, [allProducts]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isGiftListOpen, setIsGiftListOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isReadOnlyProduct, setIsReadOnlyProduct] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);
  const [isAdminLoggingIn, setIsAdminLoggingIn] = useState(false);
  const highlightsScrollRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startScrolling = (direction: 'left' | 'right') => {
    if (scrollIntervalRef.current) return;
    scrollIntervalRef.current = setInterval(() => {
      if (highlightsScrollRef.current) {
        highlightsScrollRef.current.scrollBy({
          left: direction === 'right' ? 5 : -5,
          behavior: 'auto'
        });
      }
    }, 10);
  };

  const stopScrolling = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  const [searchedGiftList, setSearchedGiftList] = useState<any | null>(null);
  const [isSearchingList, setIsSearchingList] = useState(false);
  const [listSearchCode, setListSearchCode] = useState('');
  const [isSearchingLoading, setIsSearchingLoading] = useState(false);

  const handleListSearch = async () => {
    if (!listSearchCode || listSearchCode.length < 5) return;
    setIsSearchingLoading(true);
    try {
      const code = listSearchCode.trim().toUpperCase();
      const list = await getGiftList(code);
      if (list) {
        setSearchedGiftList(list);
        setIsSearchingList(false);
        setListSearchCode('');
      } else {
        alert("Lista não encontrada. Verifique o código.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingLoading(false);
    }
  };

  // Dynamic Theme Injection
  useEffect(() => {
    if (!siteSettings) return;
    
    const root = document.documentElement;
    const prefix = companyId === 'mimada' ? 'mimadasim' : companyId === 'pallyra' ? 'lapallyra' : 'guennita';
    
    if (siteSettings.theme_primary_color) root.style.setProperty(`--theme-primary-${prefix}`, siteSettings.theme_primary_color);
    if (siteSettings.theme_accent_color) root.style.setProperty(`--theme-accent-${prefix}`, siteSettings.theme_accent_color);
    if (siteSettings.theme_text_color) root.style.setProperty(`--theme-text-${prefix}`, siteSettings.theme_text_color);
    
    // Inject global variables for usage in tailwind or inline styles
    root.style.setProperty('--dynamic-accent', siteSettings.theme_accent_color || theme.accentColor);
    root.style.setProperty('--dynamic-primary', siteSettings.theme_primary_color || theme.primaryColor);
    root.style.setProperty('--dynamic-text', siteSettings.theme_text_color || theme.textPrimary);
    
    // Mimada Sim special case injection
    if (companyId === 'mimada') {
      root.style.setProperty('--theme-mimada-pink', '#FF007F');
    }
  }, [siteSettings, companyId, theme]);

  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
    
    // Check for gift list code
    if (val.length >= 7 && val.toUpperCase().startsWith('L') && val.toUpperCase().endsWith('P')) {
      const list = await getGiftList(val.toUpperCase());
      if (list) {
        setSearchedGiftList(list);
      }
    }
  };

  const handleBuyNow = (product: Product, quantity: number) => {
    onAddToCart(product, quantity);
    setIsCartOpen(true);
    setSelectedProduct(null);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: companyName,
          text: 'Confira nosso catálogo de produtos!',
          url: url
        });
      } catch (err) {
        console.error('Erro ao compartilhar', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copiado para a área de transferência!');
    }
  };

  const handleHiddenAdminClick = () => {
    setAdminClickCount(prev => {
      const next = prev + 1;
      if (next >= 5) {
        onOpenAdmin();
        return 0;
      }
      return next;
    });
  };

  const createSparkles = (e: React.MouseEvent) => {
    const pixieChars = ['✦', '✧', '•', '⋆'];
    const accentColor = siteSettings?.theme_accent_color || theme.accentColor;
    
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        const pixie = document.createElement('div');
        pixie.className = 'pixie-dust';
        pixie.innerHTML = pixieChars[Math.floor(Math.random() * pixieChars.length)];
        
        const size = Math.random() * 10 + 5;
        pixie.style.fontSize = `${size}px`;
        pixie.style.left = `${e.clientX + (Math.random() - 0.5) * 20}px`;
        pixie.style.top = `${e.clientY + (Math.random() - 0.5) * 20}px`;
        pixie.style.color = accentColor;
        pixie.style.position = 'fixed';
        pixie.style.pointerEvents = 'none';
        pixie.style.zIndex = '100000';
        pixie.style.filter = `drop-shadow(0 0 5px ${accentColor}88)`;
        
        pixie.style.setProperty('--dx', `${(Math.random() - 0.5) * 100}px`);
        pixie.style.setProperty('--dy', `${(Math.random() - 0.5) * 100}px`);
        
        document.body.appendChild(pixie);
        setTimeout(() => pixie.remove(), 800);
      }, i * 50);
    }
  };

  useEffect(() => {
    // Force allow scroll
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      const data = await getSiteSettings(companyId);
      if (data) setSiteSettings(data);
    };
    loadSettings();
  }, [companyId]);

  const seedDatabase = async () => {
    if (!isAdmin || isSeeding) return;
    setIsSeeding(true);
    try {
      const productsToSeed = PRODUCTS;
      for (const p of productsToSeed) {
        await addProduct(p);
      }
      alert('Produtos sincronizados com sucesso!');
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
      console.error(e);
      alert('Erro ao sincronizar produtos.');
    } finally {
      setIsSeeding(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      'Papelaria': Stamp,
      'Corporativo': Briefcase,
      'Decoração': Palette,
      'Home Decor': Flower2,
      'Luxo': Diamond,
      'Beleza': Sparkle,
      'Fashion': ShoppingBasket,
      'Acessórios': Heart,
      'Utensílios': Coffee,
    };
    const Icon = icons[category] || Sparkle;
    return <Icon size={14} className="opacity-70" />;
  };

  const companyName = companyId === 'pallyra' ? config.company_1_name : companyId === 'guennita' ? config.company_2_name : config.company_3_name;
  const defaultLogo = companyId === 'pallyra' ? config.company_1_logo : companyId === 'guennita' ? config.company_2_logo : config.company_3_logo;
  
  const categories = useMemo(() => {
    return Array.from(new Set(allProducts.map(p => p.category))).sort();
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      const matchesCategory = !selectedCategory || p.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allProducts, selectedCategory, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const isPallyra = companyId === 'pallyra';

  const cartTotal = cart.reduce((sum, item) => sum + (item.retail_price * item.quantity), 0);

  const renderProductImage = (image: string | undefined | null, className: string = "", transform?: any) => {
    return (
      <ImageWithFallback 
        src={image || ''} 
        alt="Product"
        className={`${className} object-cover w-full h-full`}
        containerClassName="w-full h-full absolute inset-0"
      />
    );
  };

  return (
    <div 
      className={`min-h-[100dvh] pt-0 ${theme.bg} flex flex-col relative theme-${companyId === 'mimada' ? 'mimadasim' : companyId === 'pallyra' ? 'lapallyra' : 'guennita'}`}
    >
      {/* New Header */}
      <CatalogHeader 
        companyName={companyName}
        logoUrl={siteSettings?.store_logo || defaultLogo || null}
        theme={theme}
        onCartClick={() => setIsCartOpen(true)}
        cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
        onSearch={handleSearch}
        onGoBack={onGoBack}
        onGiftListClick={() => setIsSearchingList(true)}
        giftListCount={giftList.length} 
        companyId={companyId}
        onLogoClick={handleHiddenAdminClick}
      />
      
      <div className="pt-0"> 
        {/* Editorial Hero Section for Pallyra */}



        <div className="max-w-[1600px] mx-auto px-4 mt-1">
           <CatalogInfoBar theme={theme} />
        </div>

        <DateHighlights theme={theme} companyId={companyId} />

        <FeaturedProductsCarousel 
          products={allProducts.filter(p => p.isFeatured)} 
          theme={theme} 
          companyId={companyId}
          onSelectProduct={(product) => setSelectedProduct(product)}
        />

        {/* Horizontal Category Menu - Unified Premium Design */}
        <div className={`sticky top-0 z-[100] ${theme.bg} border-b ${theme.borderLine} shadow-sm backdrop-blur-xl bg-opacity-90`}>
          <div className="max-w-[1600px] mx-auto px-4">
            <div className="flex items-center gap-8 py-5 overflow-x-auto scrollbar-none snap-x h-16">
              <button
                onClick={() => { setSelectedCategory(null); setCurrentPage(1); }}
                className={`flex-shrink-0 text-[11px] font-sans font-black uppercase tracking-[0.3em] transition-all relative pb-2`}
                style={{ 
                  color: !selectedCategory ? theme.accentColor : theme.textPrimary.replace('text-', ''),
                  opacity: !selectedCategory ? 1 : 0.4
                }}
              >
                Início
                {!selectedCategory && (
                  <motion.div layoutId="cat-glow" className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: theme.accentColor, boxShadow: `0 0 10px ${theme.accentColor}` }} />
                )}
              </button>
              {categories.map((category) => {
                const isActive = selectedCategory === category;
                return (
                  <button
                    key={`cat-${category}`}
                    onClick={() => { setSelectedCategory(category); setCurrentPage(1); }}
                    className={`flex-shrink-0 text-[11px] font-sans font-black uppercase tracking-[0.3em] transition-all relative pb-2`}
                    style={{ 
                      color: isActive ? theme.accentColor : theme.textPrimary.replace('text-', ''),
                      opacity: isActive ? 1 : 0.4
                    }}
                  >
                    {category}
                    {isActive && (
                      <motion.div layoutId="cat-glow" className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: theme.accentColor, boxShadow: `0 0 10px ${theme.accentColor}` }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:px-8 md:py-2 relative">
          <div className="max-w-[1700px] mx-auto h-full flex flex-col">
            {/* Search */}
            <div className={`${theme.searchBg} border ${theme.borderLine} rounded-xl px-4 md:px-6 py-3 md:py-4 mb-2 md:mb-4 flex items-center gap-4 transition-all focus-within:border-[#C6A664]/40 focus-within:shadow-md`}>
              <Search className={theme.textMuted} size={18} />
              <input 
                type="text" 
                placeholder="Buscar produtos..." 
                className={`bg-transparent border-none ${theme.textPrimary} outline-none flex-1 ${theme.inputPlaceholder} text-sm`}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>

            {/* Grid */}
            {paginatedProducts.length > 0 ? (
              <>
              <div id="catalog-grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 pb-20">
                {paginatedProducts.map((product, idx) => {
                  const today = new Date();
                  const createdAtDate = product.createdAt?.toMillis ? new Date(product.createdAt.toMillis()) : product.createdAt instanceof Date ? product.createdAt : new Date();
                  const diffDays = Math.floor((today.getTime() - createdAtDate.getTime()) / (1000 * 60 * 60 * 24));
                  const isNew = diffDays <= 10 || idx % 8 === 0;

                  return (
                  <motion.div
                    key={`prod-${product.id}-${idx}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: (idx % 4) * 0.05 }}
                    onClick={() => setSelectedProduct(product)}
                    className={`group relative flex flex-col cursor-pointer ${companyId === 'guennita' ? 'bg-[#2A0A0A] border-white/5' : 'bg-white border-black/5'} rounded-[2.5rem] overflow-hidden transition-all duration-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl border hover:-translate-y-2`}
                    style={{ '--hover-glow': `${theme.accentColor}33` } as any}
                  >
                    {/* Image Section - Main Focus */}
                    <div className="relative w-full aspect-[4/5] overflow-hidden bg-gray-50 group/img">
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full h-full"
                      >
                        {(() => {
                          const secondaryImage = product.images && product.images.length > 1 ? product.images[1] : product.image_hover;
                          if (secondaryImage) {
                            return (
                              <>
                                {renderProductImage(product.image, "absolute inset-0 transition-all duration-700 group-hover/img:scale-105")}
                                {renderProductImage(secondaryImage, "absolute inset-0 transition-opacity duration-700 opacity-0 group-hover/img:opacity-100")}
                              </>
                            );
                          }
                          return renderProductImage(product.image, "transition-all duration-700 group-hover/img:scale-105");
                        })()}
                      </motion.div>

                      {/* Premium/New Badge */}
                      {(product.retail_price > 200 || isNew) && (
                        <div className="absolute top-5 left-5 z-20">
                          <span className="px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] backdrop-blur-md border border-white/20 shadow-lg text-white" style={{ backgroundColor: theme.accentColor }}>
                            {product.retail_price > 200 ? '⭐ Exclusive' : '✨ Novo'}
                          </span>
                        </div>
                      )}

                      {/* Espiar Button Overlay */}
                      <div className="absolute inset-x-0 bottom-0 py-8 px-6 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex justify-center translate-y-4 group-hover:translate-y-0">
                         <span className="bg-white/90 backdrop-blur-md text-[#161616] text-[10px] font-black uppercase tracking-[0.3em] px-8 py-3 rounded-2xl shadow-xl">
                            Detalhes
                         </span>
                      </div>
                    </div>

                    {/* Info Section */}
                    <div className={`p-4 md:p-5 flex flex-col gap-1.5 relative z-10 ${companyId === 'guennita' ? 'bg-[#2A0A0A]' : 'bg-white'}`}>
                         <h3 
                          className="font-dancing text-lg md:text-xl leading-none line-clamp-1 transition-colors group-hover:scale-[1.02] origin-left duration-300" 
                          style={{ color: theme.accentColor }}
                         >
                           {product.product_name}
                         </h3>
                         
                         <div className="mt-1">
                            <PriceDisplay 
                              price={product.retail_price} 
                              originalPrice={product.original_price} 
                              installments={2}
                              accentColor={theme.accentColor}
                              isDark={companyId === 'guennita'}
                            />
                         </div>
                    </div>

                    {/* Hover Actions */}
                    <div className="absolute top-5 right-5 z-30 flex flex-col gap-3 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onAddToCart(product, 1); }}
                            className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl text-[#161616] hover:scale-110 transition-transform active:scale-95"
                            style={{ color: theme.accentColor }}
                        >
                          <ShoppingBag size={20} />
                        </button>
                    </div>
                  </motion.div>
                )})}
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 py-8 pb-32">
                  <button 
                    onClick={() => {
                      setCurrentPage(p => Math.max(1, p - 1));
                      document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-full ${theme.btnSecondary} disabled:opacity-30 disabled:cursor-not-allowed`}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className={`${theme.textPrimary} font-bold text-sm`}>
                    Página {currentPage} de {totalPages}
                  </span>
                  <button 
                    onClick={() => {
                      setCurrentPage(p => Math.min(totalPages, p + 1));
                      document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-full ${theme.btnSecondary} disabled:opacity-30 disabled:cursor-not-allowed`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
              </>
            ) : (
              <div className={`flex flex-col items-center justify-center py-32 ${theme.textMuted}`}>
                <Package size={60} className="mb-6 opacity-20" />
                <h3 className={`text-lg font-medium text-center ${theme.textPrimary}`}>Nenhum produto encontrado</h3>
                <p className="text-sm text-center">Tente ajustar sua busca ou filtro de categoria</p>
              </div>
            )}
          </div>
          
          {/* Footer Legal & Copyright */}
          <footer className={`mt-10 pt-8 pb-16 border-t ${theme.borderLine} text-center space-y-4 px-6`}>
             <div className="max-w-4xl mx-auto">
                <p className={`text-[8px] md:text-[10px] uppercase font-black tracking-[0.2em] mb-2 ${theme.textPrimary}`}>Aspectos Legais e de Conformidade</p>
                <p className={`text-[7px] md:text-[9px] leading-relaxed font-bold ${theme.textMuted}`}>
                  Ao realizar um pedido, você concorda com nossos termos de produção artesanal. Os prazos de entrega podem variar de acordo com a complexidade da personalização. 
                  Imagens meramente ilustrativas. As cores podem sofrer variações dependendo da calibração do seu monitor ou tela. 
                  Proteção de Dados: Seus dados são utilizados exclusivamente para o processamento e entrega do seu pedido.
                </p>
                <div className={`mt-6 pt-4 border-t ${theme.borderLine} flex flex-col md:flex-row justify-between items-center gap-4`}>
                   <span className={`text-[8px] font-black uppercase tracking-widest ${theme.textVeryMuted}`}>
                     © {new Date().getFullYear()} {companyName} • Todos os direitos reservados
                   </span>
                   <span className={`text-[8px] font-black uppercase tracking-widest ${theme.textVeryMuted} flex items-center gap-1`}>
                     Desenvolvido com <Heart size={8} className="text-rose-500 fill-rose-500" /> por Ateliês da Ju
                   </span>
                </div>
             </div>
          </footer>
        </main>
      </div>

      <AnimatePresence>
        {isCartOpen && (
          <CartSidebar 
            cart={cart}
            onClose={() => setIsCartOpen(false)}
            onRemove={onRemoveFromCart}
            onUpdateQty={onUpdateQuantity}
            onSetQty={onSetQuantity}
            onCheckout={() => {
              navigate('/checkout', { state: { companyId } });
            }}
            companyId={companyId}
          />
        )}
        
        {isGiftListOpen && (
          <GiftListSidebar 
            giftList={giftList}
            onClose={() => setIsGiftListOpen(false)}
            onRemove={onRemoveFromGiftList}
            theme={theme}
            companyId={companyId}
          />
        )}

        {giftList.length > 0 && !isGiftListOpen && (
          <motion.button
            initial={{ opacity: 0, x: 100, scale: 0.5 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.5 }}
            onClick={() => setIsGiftListOpen(true)}
            className="fixed bottom-24 right-6 md:bottom-28 md:right-12 z-[1001] flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl text-white font-black uppercase tracking-widest text-[10px] transition-all hover:scale-105 active:scale-95 group"
            style={{ backgroundColor: theme.accentColor, boxShadow: `0 10px 30px -10px ${theme.accentColor}` }}
          >
            <span className="relative">
              <Gift size={18} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white animate-ping" />
            </span>
            <span className={theme.primaryColor === '#FFFFFF' || theme.primaryColor === '#F8F8F6' ? 'text-white' : 'text-current'}>Ver Lista ({giftList.length})</span>
          </motion.button>
        )}

        <SearchedGiftListModal 
          isOpen={searchedGiftList !== null}
          onClose={() => setSearchedGiftList(null)}
          giftList={searchedGiftList}
          theme={theme}
          onAddToCart={onAddToCart}
          onViewProduct={(p) => {
            setSelectedProduct(p);
            setIsReadOnlyProduct(true);
          }}
          companyId={companyId}
        />

        {/* List Search Overlay */}
        {isSearchingList && (
           <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSearchingList(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1100]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white p-8 rounded-3xl z-[1101] shadow-2xl overflow-hidden"
              >
                  <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 pointer-events-none rounded-full" style={{ backgroundColor: theme.accentColor }} />
                  
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black uppercase tracking-widest text-[#161616]">Buscar Lista</h3>
                    <button onClick={() => setIsSearchingList(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="space-y-4 relative z-10">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-2">Código da Lista</label>
                       <input 
                         type="text"
                         placeholder="Ex: L12345P"
                         value={listSearchCode}
                         onChange={(e) => setListSearchCode(e.target.value.toUpperCase())}
                         className="w-full bg-[#F9F9F8] border border-black/5 rounded-2xl px-5 py-4 text-sm font-bold uppercase tracking-widest focus:ring-4 transition-all focus:bg-white"
                         style={{ '--tw-ring-color': `${theme.accentColor}22` } as any}
                         onKeyDown={(e) => e.key === 'Enter' && handleListSearch()}
                       />
                    </div>
                    
                    <button 
                      onClick={handleListSearch}
                      disabled={isSearchingLoading || !listSearchCode}
                      className="w-full py-5 rounded-2xl text-white text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl disabled:opacity-50"
                      style={{ backgroundColor: theme.accentColor, boxShadow: `0 10px 30px -10px ${theme.accentColor}` }}
                    >
                      {isSearchingLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} strokeWidth={2.5} />}
                      Buscar Agora
                    </button>
                    
                    <p className="text-[9px] text-center font-bold text-black/40 uppercase tracking-tight px-4">
                      Insira o código gerado pelo criador da lista para visualizar os produtos.
                    </p>
                  </div>
              </motion.div>
           </>
        )}

        {selectedProduct && (
          <ProductDetailModal 
            product={selectedProduct}
            onClose={() => {
              setSelectedProduct(null);
              setIsReadOnlyProduct(false);
            }}
            onAddToCart={onAddToCart}
            onBuyNow={handleBuyNow}
            onAddToGiftList={isReadOnlyProduct ? undefined : onAddToGiftList}
            companyId={companyId}
            isReadOnly={isReadOnlyProduct}
          />
        )}

        {isCheckoutOpen && (
          <CheckoutModal 
            cart={checkoutItems}
            config={config}
            onClose={() => setIsCheckoutOpen(false)}
            onSubmit={() => {
              setIsCheckoutOpen(false);
              setIsCartOpen(false);
              onCheckoutComplete();
            }}
            companyName={companyName}
            companyId={companyId}
            siteSettings={siteSettings}
          />
        )}
      </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: (isCartOpen || isGiftListOpen || isCheckoutOpen || isSearchingList || selectedProduct) ? 0 : 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[1000] flex flex-col gap-2"
        >
            <button 
              onClick={() => setIsGiftListOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full text-[#161616]/70 bg-white/20 backdrop-blur-md border border-white/20 shadow-md hover:text-[#161616] active:scale-95 transition-all"
              title="Lista de Presentes"
            >
              <Gift size={14} strokeWidth={1.5} />
              {giftList.length > 0 && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.accentColor }} />
              )}
            </button>
            
            <button 
              onClick={() => setIsCartOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full text-[#161616]/70 bg-white/20 backdrop-blur-md border border-white/20 shadow-md hover:text-[#161616] active:scale-95 transition-all"
              title="Carrinho"
            >
              <ShoppingBag size={14} strokeWidth={1.5} />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 text-[7px] font-black flex items-center justify-center rounded-full text-white pointer-events-none shadow-sm" style={{ backgroundColor: theme.accentColor }}>
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>

            <a 
              href={`https://wa.me/${config.whatsapp_number.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center rounded-full text-[#161616]/70 bg-white/20 backdrop-blur-md border border-white/20 shadow-md hover:text-[#161616] active:scale-95 transition-all"
              title="Fale Comigo"
            >
              <MessageCircle size={14} strokeWidth={1.5} />
            </a>
        </motion.div>
    </div>
  );
};
