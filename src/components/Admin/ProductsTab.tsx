import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Plus, Filter, Edit, Trash2, 
  Eye, EyeOff, Star, Camera, Link, 
  Layers, Settings, Calculator, Check,
  ChevronRight, X, Image as ImageIcon, 
  Package, Info, TrendingUp, DollarSign,
  Maximize2
} from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { uploadImage, compressImage } from '../../services/firebaseStorageService';
import { Product, CompanyId, Insumo, Variation } from '../../types';
import { formatCurrency } from '../../lib/currencyUtils';
import { getSiteSettings } from '../../services/firebaseService';
import { ImageWithFallback } from '../ImageWithFallback';

interface ProductsTabProps {
  products: Product[];
  insumos: Insumo[];
  companyId: CompanyId;
  onSaveProduct: (product: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({ products, insumos, companyId, onSaveProduct, onDeleteProduct }) => {
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (productToDelete) {
      await onDeleteProduct(productToDelete);
      setProductToDelete(null);
    }
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [selectedAtelier, setSelectedAtelier] = useState<CompanyId>(companyId);

  const atelieres = [
    { id: 'pallyra', name: 'La Pallyra', prefix: 'LP' },
    { id: 'guennita', name: 'com amor, Guennita', prefix: 'CG' },
    { id: 'mimada', name: 'Mimada Sim', prefix: 'MS' },
  ];

  const generateProductCode = (prefix: string) => {
    const companyProducts = products.filter(p => p.company === selectedAtelier);
    let max = 0;
    for (const p of companyProducts) {
      if (p.code && p.code.startsWith(prefix)) {
        const num = parseInt(p.code.replace(prefix + '-', ''), 10);
        if (!isNaN(num) && num > max) max = num;
      } else if (p.id && p.id.startsWith(prefix)) {
        const num = parseInt(p.id.replace(prefix + '-', ''), 10);
        if (!isNaN(num) && num > max) max = num;
      }
    }
    return `${prefix}-${String(max + 1).padStart(4, '0')}`;
  };

  const [showAllInList, setShowAllInList] = useState(true);

  const filtered = products.filter(p => {
    const matchesSearch = p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAtelier = showAllInList || p.company === selectedAtelier;
    return matchesSearch && matchesAtelier;
  });

  const getCompanyColor = (compId: string) => {
    switch (compId) {
      case 'pallyra': return 'bg-amber-400';
      case 'guennita': return 'bg-[#801020]'; // Marsala
      case 'mimada': return 'bg-[#FF1493]'; // Pink
      default: return 'bg-gray-400';
    }
  };

  const getCompanyBadge = (compId: string) => {
    switch (compId) {
      case 'pallyra': return 'LP';
      case 'guennita': return 'CG';
      case 'mimada': return 'MS';
      default: return 'LP';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 overflow-x-hidden">
      {/* Header with Search and Atelier Select */}
      <div className="flex flex-col xl:flex-row gap-6 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="BUSCAR PRODUTO NO SISTEMA..." 
            className="w-full pl-16 pr-6 py-5 rounded-2xl bg-white border border-slate-200 text-[10px] uppercase font-black tracking-[0.2em] outline-none focus:border-lilac/40 transition-all text-slate-900 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <select
            value={showAllInList ? 'all' : selectedAtelier}
            onChange={(e) => {
              if (e.target.value === 'all') {
                setShowAllInList(true);
              } else {
                setShowAllInList(false);
                setSelectedAtelier(e.target.value as CompanyId);
              }
            }}
            className="px-8 py-4 rounded-2xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none focus:border-lilac/30 cursor-pointer transition-all"
          >
            <option value="all" className="bg-[#050505]">TODOS OS ATELIÊS</option>
            {atelieres.map(atl => (
              <option key={atl.id} value={atl.id} className="bg-[#050505]">{atl.name}</option>
            ))}
          </select>
          <div className="w-px h-8 bg-white/10 mx-2 hidden md:block" />
          <button 
            onClick={async () => { setEditingProduct({ company: showAllInList ? companyId : selectedAtelier, isVisible: true, isFeatured: false }); setIsModalOpen(true); }}
            className="flex items-center gap-4 bg-gradient-to-r from-lilac to-lilac/80 text-black font-black py-5 px-10 rounded-2xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(233,213,255,0.3)] text-[10px] uppercase tracking-[0.3em] glow-border"
          >
            <Plus size={20} /> Novo Produto
          </button>
        </div>
      </div>

      {/* Product List Grid */}
      <div className="glass-card overflow-hidden overflow-x-auto relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lilac/50 to-transparent"></div>
        <table className="w-full text-left uppercase">
          <thead>
            <tr className="bg-white border-b border-slate-100">
              <th className="py-8 px-10 text-[10px] font-black text-slate-500 tracking-[0.3em]">Cód / Foto</th>
              <th className="py-8 text-[10px] font-black text-slate-500 tracking-[0.3em]">Produto / Categoria</th>
              <th className="py-8 text-[10px] font-black text-slate-500 tracking-[0.3em] text-center">Varejo</th>
              <th className="py-8 text-[10px] font-black text-slate-500 tracking-[0.3em] text-center">Atacado</th>
              <th className="py-8 text-[10px] font-black text-slate-500 tracking-[0.3em] text-right pr-10">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-32 text-center text-slate-400 italic font-black text-[11px] tracking-[0.4em] uppercase">Expanda sua linha de produtos</td>
              </tr>
            )}
            {filtered.map((p, idx) => {
              const profitMargin = p.estimatedCost && p.retail_price ? (((p.retail_price - p.estimatedCost) / p.retail_price) * 100).toFixed(0) : 'N/A';
              const companyColor = getCompanyColor(p.company || '');
              const companyPrefix = getCompanyBadge(p.company || '');
              
              return (
                <tr key={`${p.id}-${idx}`} className="group hover:bg-white transition-all">
                  <td className="py-6 px-10">
                    <div className="flex items-center gap-6">
                       <div className="flex flex-col items-center gap-2">
                         <div className={`w-8 h-8 rounded-xl text-[8px] font-black text-white flex items-center justify-center shadow-lg ${companyColor} glow-border`}>
                           {companyPrefix}
                         </div>
                         <span className="font-mono text-[8px] font-black text-slate-400 tracking-widest">#{p.code}</span>
                       </div>
                       <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 overflow-hidden flex items-center justify-center relative group-hover:border-lilac/30 transition-all shadow-xl">
                          <ImageWithFallback src={p.image || ''} alt={p.product_name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-lilac/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center pointer-events-none">
                             <Maximize2 size={16} className="text-slate-900" />
                          </div>
                       </div>
                    </div>
                  </td>
                  <td className="py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-sm text-slate-900 tracking-tight group-hover:glow-text transition-all">{p.product_name}</span>
                      <span className="text-[9px] font-black text-lilac/40 mt-1 uppercase tracking-[0.2em]">{p.category} {p.subcategory && `• ${p.subcategory}`}</span>
                    </div>
                  </td>
                  <td className="py-6 text-center">
                    <span className="text-sm font-sans font-black text-slate-900">{formatCurrency(p.retail_price || 0)}</span>
                  </td>
                  <td className="py-6 text-center">
                    <div className="flex flex-col">
                      <span className="text-sm font-sans font-black text-lilac italic">{formatCurrency(p.wholesale_price || 0)}</span>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Mín: {p.wholesale_min_qty}</span>
                    </div>
                  </td>
                  <td className="py-6 text-right pr-10">
                     <div className="flex justify-end gap-3">
                        <button 
                          onClick={async () => { setEditingProduct(p); setIsModalOpen(true); }} 
                          className="p-4 rounded-xl bg-white text-slate-400 hover:text-white hover:bg-lilac transition-all border border-slate-100 hover:border-lilac/40 hover:text-black group/btn"
                          title="Editar"
                        >
                           <Edit size={18} />
                        </button>
                        <button 
                          onClick={async () => { setEditingProduct(p); setIsModalOpen(true); }}                
                          className="p-4 rounded-xl bg-white text-slate-400 hover:text-white hover:bg-gold transition-all border border-slate-100 hover:border-gold/40 hover:text-black"
                          title="Ver Detalhes"
                        >
                           <Eye size={18} />
                        </button>
                        <button onClick={() => setProductToDelete(p.id)} className="p-4 rounded-xl bg-white text-slate-400 hover:text-white hover:bg-rose-500 transition-all border border-slate-100 hover:border-rose-400 group/del">
                           <Trash2 size={18} />
                        </button>
                     </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <ProductFormModal 
          editingProduct={editingProduct}
          existingProducts={products}
          onClose={() => setIsModalOpen(false)}
          onSave={async (data) => {
            const currentPrefix = atelieres.find(a => a.id === (data.company || selectedAtelier))?.prefix || 'LP';
            await onSaveProduct({
              ...data,
              code: editingProduct?.id ? editingProduct.code : generateProductCode(currentPrefix)
            });
          }}
          companyId={selectedAtelier}
          atelieres={atelieres}
          insumos={insumos}
        />
      )}
      {productToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="glass-card max-w-md w-full p-10 text-center animate-in zoom-in-95 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-rose-500/50"></div>
            <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-rose-500/20 glow-border">
               <Trash2 size={32} />
            </div>
            <h3 className="text-2xl font-sans font-black mb-3 uppercase tracking-tighter text-white">Excluir Produto?</h3>
            <p className="text-[10px] text-slate-400 mb-10 font-bold uppercase tracking-[0.2em]">Esta operação é irreversível e removerá o item de todos os catálogos ativos.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-5 bg-white rounded-2xl font-black text-slate-500 uppercase text-[9px] tracking-widest hover:bg-white/10 transition-all border border-slate-100"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-5 bg-rose-500 text-white rounded-2xl font-black uppercase text-[9px] tracking-widest shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:scale-105 active:scale-95 transition-all border border-rose-400"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ProductFormModalProps {
  editingProduct: Partial<Product> | null;
  insumos: Insumo[];
  onClose: () => void;
  onSave: (data: Partial<Product>) => Promise<void>;
  companyId: CompanyId;
  atelieres: { id: string, name: string, prefix: string }[];
}

const ProductFormModal: React.FC<ProductFormModalProps & { existingProducts: Product[] }> = ({ editingProduct, onClose, onSave, companyId, atelieres, existingProducts, insumos }) => {
  const [loading, setLoading] = useState(false);
  const [uploadsInProgress, setUploadsInProgress] = useState(0);
  
  const handleUploadStarted = () => setUploadsInProgress(prev => prev + 1);
  const handleUploadFinished = () => setUploadsInProgress(prev => Math.max(0, prev - 1));

  const [activeSubTab, setActiveSubTab] = useState<'info' | 'insumos' | 'pricing' | 'photos'>(editingProduct?.id ? 'info' : 'info');
  const [selectedAtelier, setSelectedAtelier] = useState<CompanyId>((editingProduct?.company as CompanyId) || companyId);
  const [images, setImages] = useState<string[]>(editingProduct?.images || (editingProduct?.image ? [editingProduct.image] : []));
  const [isFeatured, setIsFeatured] = useState(editingProduct?.isFeatured || false);
  const [activeInCatalog, setActiveInCatalog] = useState(editingProduct?.activeInCatalog ?? true);
  
  // Basic Info State
  const [productName, setProductName] = useState(editingProduct?.product_name || '');
  const [description, setDescription] = useState(editingProduct?.description || '');
  const [category, setCategory] = useState(editingProduct?.category || '');
  const [subcategory, setSubcategory] = useState(editingProduct?.subcategory || '');
  const [newCat, setNewCat] = useState('');
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newSubcat, setNewSubcat] = useState('');
  const [showNewSubcatInput, setShowNewSubcatInput] = useState(false);
  
  const [addedInsumos, setAddedInsumos] = useState<{insumoId: string; quantity: number}[]>(editingProduct?.insumos || []);
  
  const [selectedInsumoId, setSelectedInsumoId] = useState('');
  const [insumoQty, setInsumoQty] = useState(1);

  // Image Transformation Settings
  const [imgScale, setImgScale] = useState(editingProduct?.imageSettings?.scale ?? 1);
  const [imgX, setImgX] = useState(editingProduct?.imageSettings?.translateX ?? 0);
  const [imgY, setImgY] = useState(editingProduct?.imageSettings?.translateY ?? 0);
  const [imgRotate, setImgRotate] = useState(editingProduct?.imageSettings?.rotate ?? 0);
  
  // Pricing Fields
  const [retailPrice, setRetailPrice] = useState(editingProduct?.retail_price || 0);
  const [isWholesaleEnabled, setIsWholesaleEnabled] = useState(!!editingProduct?.wholesale_price);
  const [wholesalePrice, setWholesalePrice] = useState(editingProduct?.wholesale_price || 0);
  const [costPrice, setCostPrice] = useState(editingProduct?.estimatedCost || 0);
  const [wholesaleMinQty, setWholesaleMinQty] = useState(editingProduct?.wholesale_min_qty || 12);
  const [wholesaleMaxQty, setWholesaleMaxQty] = useState(editingProduct?.wholesale_max_qty || 100);

  // Intelligent Pricing state
  const [laborHours, setLaborHours] = useState(0);
  const [globalCosts, setGlobalCosts] = useState({ fixed: 0, labor: 0, tax: 0 });

  useEffect(() => {
    getSiteSettings(companyId).then(settings => {
      if (settings) {
        setGlobalCosts({
          fixed: settings.global_fixed_costs || 0,
          labor: settings.global_labor_cost_per_hour || 0,
          tax: settings.global_tax_rate || 0
        });
      }
    });
  }, [companyId]);

  const intelligentRetailPrice = useMemo(() => {
    // Math logic based on user inputs
    const baseCost = costPrice; // Usually insumos cost + other variable items
    const labor = globalCosts.labor * (laborHours / 60);
    const taxesMultiplier = globalCosts.tax > 0 ? (1 - (globalCosts.tax / 100)) : 1; 
    
    // We add a piece of the fixed costs? Since it's monthly, it's hard to pro-rata per product without volume.
    // Let's just add it as a margin overhead, or the user decides. Let's just sum it for now as a "overhead estimation" (dividing by 100 products maybe?), or just ignore and present the labor + cost / tax.
    const overhead = globalCosts.fixed / 100; // rough estimation
    
    const suggested = (baseCost + labor + overhead) / taxesMultiplier;
    return suggested * 1.5; // Adding 50% profit margin logic as suggestion
  }, [costPrice, laborHours, globalCosts]);

  const categories = Array.from(new Set(existingProducts.map(p => p.category).filter(Boolean)));
  const subcategories = Array.from(new Set(existingProducts.filter(p => p.category === category).map(p => p.subcategory).filter(Boolean)));

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const [isPasting, setIsPasting] = useState(false);

  const generateProductCode = (prefix: string) => {
    return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          setIsPasting(true);
          try {
            const compressedFile = await compressImage(file);
            const { promise } = uploadImage(compressedFile, `produtos/${selectedAtelier}`, () => {});
            const url = await promise;
            setImages(prev => prev.length < 7 ? [...prev, url] : prev);
          } catch (err) {
            console.error('Error uploading pasted image:', err);
          } finally {
            setIsPasting(false);
          }
        }
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const profit = retailPrice - costPrice;
  const profitMargin = retailPrice > 0 ? (profit / retailPrice) * 100 : 0;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
       <div className="bg-white w-full max-w-4xl h-[90vh] flex flex-col rounded-[3rem] border border-lilac/30 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
          
          {/* Modal Header */}
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
             <div>
                <h2 className="text-2xl font-black text-black uppercase tracking-tighter">{editingProduct?.id ? 'Configurações de Produto' : 'Cadastrar Novo Produto'}</h2>
                <div className="flex gap-2 mt-3">
                   {atelieres.map(atl => (
                     <button 
                       key={atl.id} 
                       type="button"
                       onClick={() => setSelectedAtelier(atl.id as CompanyId)}
                       className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${selectedAtelier === atl.id ? 'bg-black border-black text-white' : 'bg-white border-transparent text-gray-400 hover:border-lilac/20'}`}
                     >
                       {atl.name}
                     </button>
                   ))}
                </div>
             </div>
             <button type="button" onClick={onClose} className="p-4 rounded-full hover:bg-white text-gray-300">
                <X size={24} />
             </button>
          </div>

          {/* Sub-Tabs Navigation */}
          <div className="flex bg-white/50 p-2 gap-2 border-b border-gray-50">
             {[
               { id: 'info', label: 'Dados Básicos', icon: Info },
               { id: 'photos', label: 'Galeria (7)', icon: Camera },
               { id: 'insumos', label: 'Ficha Técnica / Insumos', icon: Layers },
               { id: 'pricing', label: 'Precificação Inteligente', icon: Calculator },
             ].map(tab => (
               <button 
                 key={tab.id}
                 type="button"
                 onClick={() => setActiveSubTab(tab.id as any)}
                 className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${activeSubTab === tab.id ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-black'}`}
               >
                 <tab.icon size={16} />
                 <span>{tab.label}</span>
               </button>
             ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-10">
             {activeSubTab === 'info' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in duration-300">
                   <div className="space-y-6">
                      <div className="space-y-2 text-left">
                        <label className="text-[10px] uppercase font-black text-gray-400 ml-2">Título do Produto</label>
                        <input 
                           id="product-name" 
                           value={productName} 
                           onChange={(e) => setProductName(e.target.value)}
                           required 
                           type="text" 
                           className="w-full bg-white border border-lilac/20 rounded-2xl px-6 py-4 text-sm font-bold focus:border-lilac outline-none text-black" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-black text-gray-400 ml-2">Categoria</label>
                          {!showNewCatInput ? (
                            <div className="flex gap-2">
                              <select 
                                value={category} 
                                onChange={(e) => setCategory(e.target.value)}
                                className="flex-1 bg-white border border-lilac/20 rounded-2xl px-4 py-4 text-[10px] font-black uppercase tracking-widest outline-none text-black"
                              >
                                <option value="">Selecionar...</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                              </select>
                              <button type="button" onClick={() => setShowNewCatInput(true)} className="p-4 bg-black text-white rounded-2xl shadow-lg hover:scale-105 transition-all"><Plus size={16} /></button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                               <input autoFocus placeholder="Nova Categoria..." value={newCat} onChange={e => setNewCat(e.target.value)} className="flex-1 bg-white border border-lilac/20 rounded-2xl px-4 py-4 text-[10px] font-black uppercase outline-none text-black transition-all" />
                               <button type="button" onClick={() => setShowNewCatInput(false)} className="px-3 bg-rose-50 text-rose-500 rounded-xl border border-rose-100"><X size={16} /></button>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-black text-gray-400 ml-2">Sub-Categoria</label>
                          {!showNewSubcatInput ? (
                            <div className="flex gap-2">
                              <select 
                                value={subcategory} 
                                onChange={(e) => setSubcategory(e.target.value)}
                                className="flex-1 bg-white border border-lilac/20 rounded-2xl px-4 py-4 text-[10px] font-black uppercase tracking-widest outline-none text-black focus:border-lilac"
                              >
                                <option value="">Nenhuma</option>
                                {subcategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                              </select>
                              <button type="button" onClick={() => setShowNewSubcatInput(true)} className="p-4 bg-black text-white rounded-2xl shadow-lg hover:scale-105 transition-all"><Plus size={16} /></button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                               <input autoFocus placeholder="Nova Sub-Categoria..." value={newSubcat} onChange={e => setNewSubcat(e.target.value)} className="flex-1 bg-white border border-lilac/20 rounded-2xl px-4 py-4 text-[10px] font-black uppercase outline-none text-black transition-all" />
                               <button type="button" onClick={() => setShowNewSubcatInput(false)} className="px-3 bg-rose-50 text-rose-500 rounded-xl border border-rose-100"><X size={16} /></button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-gray-400 ml-2">Descrição Visual / Venda</label>
                        <textarea 
                          id="product-desc" 
                          value={description} 
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full bg-white border border-lilac/20 rounded-2xl px-6 py-4 text-sm font-bold outline-none h-40 text-black resize-none" 
                        />
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="p-6 bg-white rounded-3xl border border-lilac/10">
                         <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Mídia Principal</h3>
                         <ImageUpload
                           label="Foto Principal"
                           path={`produtos/${selectedAtelier}`}
                           currentUrl={images[0] || ''}
                           onUploadComplete={(url) => {
                             const newImages = [...images];
                             newImages[0] = url;
                             setImages(newImages);
                           }}
                           onRemove={() => {
                             const newImages = [...images];
                             newImages[0] = '';
                             setImages(newImages);
                           }}
                           onUploadStarted={handleUploadStarted}
                           onUploadFinished={handleUploadFinished}
                         />
                      </div>

                      <div className="p-8 rounded-[2rem] bg-white/50 border border-lilac/20">
                         <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-6">Controle de Visualização</h3>
                         <div className="space-y-4">
                            <label className="flex items-center justify-between p-4 bg-white rounded-2xl border border-transparent hover:border-lilac/40 transition-all cursor-pointer">
                               <div className="flex items-center gap-4">
                                  <div className={`p-3 rounded-xl ${isFeatured ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-300'}`}><Star size={16} fill={isFeatured ? 'currentColor' : 'none'} /></div>
                                  <span className="text-[10px] font-black uppercase text-black tracking-widest">Destaque no Catálogo</span>
                               </div>
                               <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="hidden" />
                               <div className={`w-12 h-6 rounded-full relative transition-all ${isFeatured ? 'bg-black' : 'bg-gray-200'}`}>
                                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isFeatured ? 'left-7' : 'left-1'}`} />
                               </div>
                            </label>

                            <label className="flex items-center justify-between p-4 bg-white rounded-2xl border border-transparent hover:border-lilac/40 transition-all cursor-pointer">
                               <div className="flex items-center gap-4">
                                  <div className={`p-3 rounded-xl ${activeInCatalog ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-300'}`}><Eye size={16} /></div>
                                  <span className="text-[10px] font-black uppercase text-black tracking-widest">Ativo no Catálogo</span>
                               </div>
                               <input type="checkbox" checked={activeInCatalog} onChange={e => setActiveInCatalog(e.target.checked)} className="hidden" />
                               <div className={`w-12 h-6 rounded-full relative transition-all ${activeInCatalog ? 'bg-black' : 'bg-gray-200'}`}>
                                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${activeInCatalog ? 'left-7' : 'left-1'}`} />
                               </div>
                            </label>
                         </div>
                      </div>
                   </div>
                </div>
             )}

             {activeSubTab === 'photos' && (
                <div className="animate-in fade-in duration-300 space-y-10">
                   <div className="space-y-4">
                      <h3 className="text-sm font-black text-black uppercase tracking-widest">Galeria do Produto</h3>
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Selecione até 7 imagens para o catálogo. A primeira será a principal.</p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {Array.from({ length: 7 }).map((_, idx) => (
                        <div key={`img-${idx}`}>
                          <ImageUpload
                            label={idx === 0 ? "Imagem Principal" : `Destaque ${idx + 1}`}
                            path={`produtos/${selectedAtelier}`}
                            currentUrl={images[idx]}
                            onUploadComplete={(url) => {
                              const newImages = [...images];
                              newImages[idx] = url;
                              setImages(newImages);
                            }}
                            onRemove={() => {
                              const newImages = [...images];
                              newImages[idx] = '';
                              setImages(newImages);
                            }}
                          />
                          {images[idx] && (
                            <>
                              <div className="absolute top-[34px] left-4 px-2 py-1 bg-black/60 rounded-md backdrop-blur-md pointer-events-none z-10 shadow-sm border border-slate-200" style={idx === 0 ? {backgroundColor: '#FF007F', color: '#FFF'} : {}}>
                                <span className="text-[7px] font-black text-white uppercase tracking-widest flex items-center gap-1">{idx === 0 ? <Star size={8} fill="currentColor"/> : null} {idx === 0 ? 'CAPA PRINCIPAL' : 'EXTRA'}</span>
                              </div>
                              {idx !== 0 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const newImages = [...images];
                                    const temp = newImages[0] || '';
                                    newImages[0] = newImages[idx];
                                    newImages[idx] = temp;
                                    setImages(newImages);
                                  }}
                                  className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/80 hover:bg-black text-white rounded-full text-[7px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all z-20 shadow-xl"
                                >
                                  Tornar Capa
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                   </div>

                   {images[0] && (
                      <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-lilac/10 text-lilac rounded-lg"><Maximize2 size={18} /></div>
                          <h3 className="text-xs font-black text-black uppercase tracking-widest">Ajuste Fino da Imagem Principal</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                          <div className="space-y-4">
                            <div className="space-y-2">
                               <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400 tracking-wider">
                                 <span>Zoom / Escala</span>
                                 <span>{imgScale.toFixed(2)}x</span>
                               </div>
                               <input type="range" min="0.1" max="4" step="0.05" value={imgScale} onChange={e => setImgScale(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-lilac" />
                            </div>
                            <div className="space-y-2">
                               <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400 tracking-wider">
                                 <span>Rotação</span>
                                 <span>{imgRotate}°</span>
                                </div>
                               <input type="range" min="-180" max="180" step="1" value={imgRotate} onChange={e => setImgRotate(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-lilac" />
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-2">
                               <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400 tracking-wider">
                                 <span>Deslocamento X</span>
                                 <span>{imgX}px</span>
                               </div>
                               <input type="range" min="-200" max="200" step="1" value={imgX} onChange={e => setImgX(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-lilac" />
                            </div>
                            <div className="space-y-2">
                               <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400 tracking-wider">
                                 <span>Deslocamento Y</span>
                                 <span>{imgY}px</span>
                               </div>
                               <input type="range" min="-200" max="200" step="1" value={imgY} onChange={e => setImgY(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-lilac" />
                            </div>
                          </div>
                          <div className="md:col-span-2 flex items-center justify-center bg-white rounded-3xl border border-slate-200 overflow-hidden relative group aspect-video md:aspect-auto">
                             <ImageWithFallback 
                                src={images[0] || ''} 
                                alt="Ajuste" 
                                className="w-full h-full object-contain"
                                style={{
                                  transform: `scale(${imgScale}) translate(${imgX}px, ${imgY}px) rotate(${imgRotate}deg)`
                                }}
                             />
                             <div className="absolute inset-0 border-2 border-dashed border-lilac/20 pointer-events-none" />
                             <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-md rounded text-[7px] font-black text-white uppercase tracking-widest">Preview de Ajuste</div>
                          </div>
                        </div>
                      </div>
                   )}
                </div>
             )}

             {activeSubTab === 'insumos' && (
                <div className="animate-in fade-in duration-300 space-y-8">
                   <div className="flex flex-col gap-6">
                      <div className="flex gap-4">
                         <select 
                           value={selectedInsumoId} 
                           onChange={e => setSelectedInsumoId(e.target.value)}
                           className="flex-1 bg-white border border-lilac/20 rounded-2xl px-4 py-4 text-[10px] font-black uppercase outline-none text-black"
                         >
                           <option value="">Selecionar Insumo do Estoque...</option>
                           {insumos.map(i => <option key={i.id} value={i.id}>{i.name} (R$ {i.unitValue}/unid)</option>)}
                         </select>
                         <input 
                           type="number" 
                           min="1"
                           value={insumoQty} 
                           onChange={e => setInsumoQty(Number(e.target.value))}
                           className="w-24 bg-white border border-lilac/20 rounded-2xl px-4 py-4 text-[10px] font-black uppercase outline-none text-black"
                           placeholder="Qtd"
                         />
                         <button 
                           type="button" 
                           onClick={async () => {
                             if (!selectedInsumoId || insumoQty <= 0) return;
                             const ins = insumos.find(i => i.id === selectedInsumoId);
                             if (!ins) return;
                             setAddedInsumos([...addedInsumos, { insumoId: selectedInsumoId, quantity: insumoQty }]);
                             setCostPrice(prev => prev + (ins.unitValue * insumoQty));
                             setSelectedInsumoId('');
                             setInsumoQty(1);
                           }}
                           className="px-6 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] shadow-md hover:scale-105 transition-all"
                         >
                           Adicionar
                         </button>
                      </div>
                      
                      <div className="bg-white rounded-[2rem] p-6 space-y-2">
                        {addedInsumos.length === 0 && <p className="text-[10px] font-black text-gray-400 uppercase text-center p-4">Nenhum insumo adicionado</p>}
                        {addedInsumos.map((ai, index) => {
                           const ins = insumos.find(i => i.id === ai.insumoId);
                           if (!ins) return null;
                           return (
                             <div key={`${ai.insumoId}-${index}`} className="flex items-center justify-between p-4 bg-white rounded-xl border border-lilac/10 flex-wrap gap-2">
                               <div>
                                 <span className="font-bold text-xs uppercase text-black">{ins.name}</span>
                                 <span className="text-[10px] font-black text-lilac uppercase ml-2 bg-lilac/10 px-2 py-1 rounded-md">Qtd: {ai.quantity}</span>
                               </div>
                               <div className="flex items-center gap-4">
                                 <span className="font-mono font-black text-sm text-gray-400">R$ {(ins.unitValue * ai.quantity).toFixed(2)}</span>
                                 <button type="button" onClick={async () => {
                                   setAddedInsumos(addedInsumos.filter((_, i) => i !== index));
                                   setCostPrice(prev => Math.max(0, prev - (ins.unitValue * ai.quantity)));
                                 }} className="text-rose-300 hover:text-rose-500 bg-rose-50 p-2 rounded-lg">
                                   <X size={16} />
                                 </button>
                               </div>
                             </div>
                           );
                        })}
                      </div>
                   </div>
                </div>
             )}

             {activeSubTab === 'pricing' && (
                <div className="animate-in fade-in duration-300 space-y-10">
                   <div className="p-8 rounded-[2rem] bg-white border border-lilac/20 space-y-6">
                      <div className="flex items-center gap-4 mb-4">
                         <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><Calculator size={24} /></div>
                         <h3 className="text-sm font-black uppercase tracking-widest text-black">Precificação Inteligente</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-2">
                           <label className="text-[10px] uppercase font-black text-gray-400 ml-2">Minutos dedicados ao produto</label>
                           <input 
                             type="number"
                             step="1"
                             min="0"
                             value={laborHours || ''}
                             onChange={e => setLaborHours(Number(e.target.value))} 
                             className="w-full bg-white border border-lilac/20 rounded-2xl px-6 py-4 text-xs font-black outline-none tracking-widest focus:border-lilac shadow-sm"
                             placeholder="Ex: 30, 45, 120"
                           />
                         </div>
                         <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-2">
                            <p className="text-[9px] font-black uppercase text-amber-500 tracking-widest">Base de Cálculo Automática</p>
                            <ul className="text-[10px] space-y-1 font-bold text-gray-400">
                               <li>Taxa Fixa/mês: <span className="text-black">R$ {globalCosts.fixed.toFixed(2)}</span></li>
                               <li>Mão de Obra: <span className="text-black">R$ {globalCosts.labor.toFixed(2)}/h</span></li>
                               <li>Impostos Venda: <span className="text-black">{globalCosts.tax.toFixed(2)}%</span></li>
                            </ul>
                            <div className="pt-2 mt-2 border-t border-amber-100">
                               <p className="text-[11px] font-black text-amber-600 uppercase">Sugestão de Preço: <span className="text-xl ml-2">R$ {intelligentRetailPrice.toFixed(2)}</span></p>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="p-8 rounded-[2rem] bg-rose-50 border border-rose-100">
                         <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-2"><TrendingUp size={14} /> Custo Variável Total</p>
                         <p className="text-[8px] font-bold text-rose-400 mb-4">(Custo dos Insumos / Produção Direta)</p>
                         <div className="flex items-center gap-2">
                           <span className="text-[11px] font-black text-rose-300">R$</span>
                           <input type="number" step="0.01" value={costPrice || ''} onChange={e => setCostPrice(Number(e.target.value))} className="bg-transparent border-b border-rose-200 outline-none text-3xl font-mono font-black text-rose-600 w-full" />
                         </div>
                      </div>
                      <div className="p-8 rounded-[2rem] bg-emerald-50 border border-emerald-100 relative">
                         <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2"><DollarSign size={14} /> Preço de Venda Varejo</p>
                         <p className="text-[8px] font-bold text-emerald-400 mb-4">(Valor final cobrado do cliente)</p>
                         <button 
                           type="button" 
                           onClick={() => setRetailPrice(Number(intelligentRetailPrice.toFixed(2)))}
                           className="absolute top-8 right-8 text-[9px] px-3 py-2 bg-emerald-200/50 text-emerald-700 font-black uppercase tracking-widest rounded-lg hover:bg-emerald-200"
                         >
                           Usar Sugerido
                         </button>
                         <div className="flex items-center gap-2">
                           <span className="text-[11px] font-black text-emerald-300">R$</span>
                           <input type="number" step="0.01" value={retailPrice || ''} onChange={e => setRetailPrice(Number(e.target.value))} className="bg-transparent border-b border-emerald-200 outline-none text-3xl font-mono font-black text-emerald-600 w-full" />
                         </div>
                      </div>
                      <div className="p-8 rounded-[2rem] bg-black border border-black shadow-xl">
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Margem Bruta (Varejo)</p>
                         <div className="flex items-baseline gap-2 mt-4">
                           <span className={`text-4xl font-mono font-black ${retailPrice && costPrice ? (((retailPrice - costPrice) / retailPrice) * 100) > 30 ? 'text-emerald-400' : 'text-amber-400' : 'text-gray-400'}`}>
                             {retailPrice && costPrice ? (((retailPrice - costPrice) / retailPrice) * 100).toFixed(0) : '0'}
                           </span>
                           <span className="text-gray-400 font-bold">%</span>
                         </div>
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">Líquido Bruto: <span className="font-mono text-slate-800">R$ {(retailPrice - costPrice).toFixed(2)}</span></p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="p-8 rounded-[2rem] bg-white border border-lilac/10 shadow-sm space-y-6">
                       <div className="flex items-center gap-4 mb-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={isWholesaleEnabled} 
                              onChange={(e) => setIsWholesaleEnabled(e.target.checked)}
                              className="w-5 h-5 accent-black" 
                            />
                            <span className="text-[10px] font-black uppercase tracking-widest text-black">Ativar Atacado</span>
                          </label>
                       </div>
                       
                       {isWholesaleEnabled && (
                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Valor Unitário</label>
                               <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 border border-lilac/10">
                                  <span className="text-[10px] font-black text-gray-400">R$</span>
                                  <input type="number" step="0.01" value={wholesalePrice || ''} onChange={e => setWholesalePrice(Number(e.target.value))} className="bg-transparent outline-none text-sm font-black text-black w-full" />
                               </div>
                            </div>
                            <div className="space-y-2">
                               <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Margem Atacado</label>
                               <div className="flex items-center justify-center h-[46px] px-4 bg-lilac/5 text-lilac rounded-xl border border-lilac/10 font-bold text-xs italic">
                                  {costPrice > 0 && wholesalePrice > 0 ? (((wholesalePrice - costPrice) / wholesalePrice) * 100).toFixed(0) : 0}%
                               </div>
                            </div>
                         </div>
                       )}

                       {isWholesaleEnabled && <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Mínimo Produtos</label>
                               <input 
                                 value={wholesaleMinQty} 
                                 onChange={e => setWholesaleMinQty(Number(e.target.value))} 
                                 type="number" 
                                 className="w-full bg-white border border-lilac/20 rounded-xl px-4 py-3 text-sm font-black outline-none text-black" 
                               />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Máximo Produtos</label>
                               <input 
                                 value={wholesaleMaxQty} 
                                 onChange={e => setWholesaleMaxQty(Number(e.target.value))} 
                                 type="number" 
                                 className="w-full bg-white border border-lilac/20 rounded-xl px-4 py-3 text-sm font-black outline-none text-black" 
                               />
                            </div>
                       </div>}
                      </div>

                      <div className="p-8 rounded-[2rem] bg-white/50 border border-transparent shadow-inner flex flex-col justify-center">
                         <div className="text-center space-y-2">
                            <Calculator size={32} className="text-lilac mx-auto mb-4" />
                            <h5 className="text-[10px] font-black text-black uppercase tracking-widest">Simulação de Venda Varejo</h5>
                            <p className="text-2xl font-mono font-black text-black">{formatCurrency(retailPrice)}</p>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-loose">
                               Custo: {formatCurrency(costPrice)} <br />
                               Impostos/Taxas (aprox): {formatCurrency(retailPrice * 0.1)} <br />
                               <span className="text-emerald-500 font-bold">LUCRO REAL ESTIMADO: {formatCurrency(profit - (retailPrice * 0.1))}</span>
                            </p>
                         </div>
                      </div>
                   </div>
                </div>
             )}
          </div>

          {/* Modal Footer */}
          <div className="p-8 border-t border-gray-50 bg-white/30 flex gap-4 justify-end">
             <button type="button" onClick={onClose} className="px-10 py-5 rounded-2xl bg-white border border-lilac/10 text-[10px] uppercase font-black tracking-widest text-gray-400 hover:text-black transition-all">Cancelar</button>
             <button 
                type="button"
                disabled={loading || uploadsInProgress > 0}
                onClick={async () => {
                  if (!productName) {
                     alert("Campo Obrigatório: Escreva o nome do produto.");
                     setActiveSubTab('info');
                     return;
                  }

                  setLoading(true);
                  const finalCode = editingProduct?.code || generateProductCode(atelieres.find(a => a.id === selectedAtelier)?.prefix || 'PRD');
                  
                  try {
                    await onSave({
                      id: editingProduct?.id,
                      code: finalCode,
                      product_name: productName,
                      description: description,
                      category: showNewCatInput ? newCat : category,
                      subcategory: showNewSubcatInput ? newSubcat : subcategory,
                      wholesale_price: isWholesaleEnabled ? (wholesalePrice || 0) : 0,
                      wholesale_min_qty: isWholesaleEnabled ? (wholesaleMinQty || 1) : 0,
                      wholesale_max_qty: isWholesaleEnabled ? (wholesaleMaxQty || 0) : 0,
                      isWholesaleEnabled: isWholesaleEnabled,
                      retail_price: retailPrice || 0,
                      original_price: retailPrice || 0,
                      current_price: retailPrice || 0,
                      estimatedCost: costPrice || 0,
                      insumos: addedInsumos || [],
                      image: images[0] || 'https://via.placeholder.com/300?text=Sem+Foto',
                      images: images.filter(img => img && img.trim() !== ''),
                      imageSettings: {
                        scale: imgScale,
                        translateX: imgX,
                        translateY: imgY,
                        rotate: imgRotate
                      },
                      isFeatured: isFeatured || false,
                      activeInCatalog: activeInCatalog,
                      isVisible: activeInCatalog,
                      company: selectedAtelier
                    });
                    onClose();
                  } catch (err: any) {
                    alert("Erro ao salvar produto: " + err.message);
                  } finally {
                    setLoading(false);
                  }

                }}
                className="px-10 py-5 rounded-2xl bg-black text-white text-[10px] uppercase font-black tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
             >
                {loading ? 'Processando...' : (editingProduct?.id ? 'Salvar Alterações' : 'Criar Produto no Sistema')}
             </button>
          </div>

       </div>
    </div>
  );
};
