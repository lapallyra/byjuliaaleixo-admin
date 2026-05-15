import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Truck, CreditCard, CheckCircle, 
  Loader2, ArrowLeft, ShoppingBag, Gift, Sparkles,
  ChevronRight, Heart, Star, Shield, Lock, 
  MapPin, Gift as GiftIcon, Check, Box, DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CartItem, AppConfig, CheckoutData, CompanyId, CheckoutAddon, SiteSettings } from '../types';
import { formatCurrency } from '../lib/currencyUtils';
import { themes } from '../lib/theme';
import { sendNotifications } from '../services/notificationService';
import { saveSale, subscribeToAddons, getSiteSettings } from '../services/firebaseService';
import { ImageWithFallback } from './ImageWithFallback';

interface CheckoutViewProps {
  cart: CartItem[];
  companyId: CompanyId;
  config: AppConfig;
  onCheckoutComplete: () => void;
  onClearCart: () => void;
}

const Monogram: React.FC<{ companyId: CompanyId; color: string }> = ({ companyId, color }) => {
  const initials = { pallyra: 'LP', guennita: 'CG', mimada: 'MS' }[companyId] || 'LP';
  return (
    <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-white font-fancy text-2xl shadow-xl relative overflow-hidden group" style={{ backgroundColor: color }}>
      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent opacity-50" />
      <span className="relative z-10 group-hover:scale-110 transition-transform duration-500">{initials}</span>
    </div>
  );
};

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cart, companyId, config, onCheckoutComplete, onClearCart
}) => {
  const navigate = useNavigate();
  const theme = themes[companyId] || themes.pallyra;
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [addons, setAddons] = useState<CheckoutAddon[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CheckoutData>({
    name: "", birthDate: "", cpfCnpj: "", contact: "", deliveryType: "pickup",
    address: "", city: "", state: "", zipCode: "", paymentMethod: "pix",
    installments: 1, needsChange: "NÃO", changeAmount: "", observations: "", isEmergency: false,
    selectedAddons: [], addonMessage: ""
  });

  const atelierName = { pallyra: 'La Pallyra', guennita: 'Com Amor, Guennita', mimada: 'Mimada Sim' }[companyId] || 'Atelier';

  useEffect(() => {
    const unsub = subscribeToAddons((data) => {
      setAddons(data.filter(a => a.active) as CheckoutAddon[]);
    }, companyId);
    
    getSiteSettings(companyId).then(setSiteSettings);

    return () => unsub();
  }, [companyId]);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + (item.retail_price * item.quantity), 0), [cart]);
  const addonTotal = useMemo(() => (formData.selectedAddons || []).reduce((sum, id) => {
    const addon = addons.find(a => a.id === id);
    return sum + (addon?.price || 0);
  }, 0), [formData.selectedAddons, addons]);
  
  const emergencyFee = formData.isEmergency ? 25 : 0;
  const total = subtotal + addonTotal + emergencyFee;

  const toggleAddon = (id: string) => {
    setFormData(prev => {
      const selected = prev.selectedAddons || [];
      const newSelected = selected.includes(id) 
        ? selected.filter(i => i !== id) 
        : [...selected, id];
      return { ...prev, selectedAddons: newSelected };
    });
  };

  const isCartaoSelected = useMemo(() => {
    const cartao = addons.find(a => a.name.toLowerCase().includes('cartão com mensagem'));
    return cartao && formData.selectedAddons?.includes(cartao.id);
  }, [addons, formData.selectedAddons]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) { setStep(step + 1); window.scrollTo(0, 0); return; }
    setIsLoading(true);
    try {
      await saveSale({
        customerName: formData.name, 
        total, 
        companyId, 
        deliveryType: formData.deliveryType,
        paymentMethod: formData.paymentMethod, 
        items: cart as any, 
        isEmergency: !!formData.isEmergency,
        contact: formData.contact, 
        customerCpfCnpj: formData.cpfCnpj,
        observations: formData.observations,
        addonMessage: formData.addonMessage,
        addons: addons.filter(a => formData.selectedAddons?.includes(a.id)).map(a => a.name)
      });
      const waUrl = await sendNotifications(config, cart, formData, total, atelierName);
      if (waUrl) setTimeout(() => window.open(waUrl, '_blank'), 1500);
      setIsSuccess(true);
      onCheckoutComplete(); onClearCart();
    } catch (error) { alert("Erro ao processar pedido."); } finally { setIsLoading(false); }
  };

  if (isSuccess) return (
    <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-6 text-center`}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl space-y-8">
        <CheckCircle size={64} className="text-emerald-500 mx-auto" />
        <h1 className="text-3xl font-fancy text-gray-900">Pedido Confirmado!</h1>
        <p className="text-gray-500 text-sm">Aguardamos você no WhatsApp para os detalhes finais.</p>
        <button onClick={() => navigate('/')} className="w-full py-5 rounded-2xl text-white font-black uppercase text-xs tracking-widest shadow-lg" style={{ backgroundColor: theme.accentColor }}>Voltar ao Catálogo</button>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDF8F9] font-sans pb-20">
      <header className="bg-white border-b border-rose-100 px-6 py-8 md:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-6">
              <Monogram companyId={companyId} color={theme.accentColor} />
              <div className="flex flex-col">
                <h1 className={`text-2xl md:text-3xl font-elegant ${theme.textPrimary}`}>{atelierName}</h1>
                <p className={`text-[9px] font-black uppercase tracking-[0.3em] mt-1 ${theme.textSecondary}`}>Excelência em Cada Detalhe</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {[ 
                { s: 1, label: 'Dados', i: User }, 
                { s: 2, label: 'Toque Final', i: Sparkles },
                { s: 3, label: 'Entrega', i: Truck }, 
                { s: 4, label: 'Pagamento', i: CreditCard } 
              ].map((item, idx) => (
                <React.Fragment key={`checkout-step-${item.s}-${idx}`}>
                  <div className={`flex flex-col items-center gap-1.5 transition-all duration-500 ${step >= item.s ? 'opacity-100 scale-100' : 'opacity-30 scale-90'}`}>
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-2xl flex items-center justify-center transition-colors ${step >= item.s ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-gray-100 text-gray-400'}`} style={step >= item.s ? { backgroundColor: theme.accentColor } : {}}><item.i size={step >= item.s ? 18 : 14} /></div>
                    <span className="text-[7px] font-black uppercase tracking-widest hidden md:block">{item.label}</span>
                  </div>
                  {idx < 3 && <div className={`hidden md:block w-4 h-px transition-colors ${step > item.s ? 'bg-rose-500' : 'bg-rose-100'}`} style={step > item.s ? { backgroundColor: theme.accentColor } : {}} />}
                </React.Fragment>
              ))}
            </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        {(siteSettings?.checkout_banner || config.checkout_banner) && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full aspect-[1800/300] bg-gray-100 rounded-[2rem] overflow-hidden shadow-xl mb-10 border border-white"
          >
            <ImageWithFallback 
              src={siteSettings?.checkout_banner || config.checkout_banner || ''} 
              alt="Checkout Banner" 
              className="w-full h-full object-cover" 
            />
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-10">
            <form onSubmit={handleSubmit} className="space-y-10">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={step} 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-[3rem] p-8 md:p-14 shadow-2xl border border-rose-50 space-y-10"
                >
                  {step === 1 && (
                    <div className="space-y-10">
                      <div className="space-y-2">
                        <h2 className={`text-xl md:text-2xl font-black uppercase tracking-tighter italic ${theme.textPrimary}`}>Identificação</h2>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${theme.textMuted}`}>Preencha seus dados para começar</p>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase font-black text-rose-400 ml-5">Nome Completo</label>
                          <input 
                            required 
                            className="w-full bg-[#FDF8F9] rounded-[2rem] px-8 py-5 outline-none font-bold text-sm border-2 border-transparent focus:border-rose-100 transition-all shadow-inner" 
                            placeholder="Ex: Maria Oliveira Santos" 
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})} 
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[9px] uppercase font-black text-rose-400 ml-5">WhatsApp (Contato)</label>
                            <input 
                              required 
                              className="w-full bg-[#FDF8F9] rounded-[2rem] px-8 py-5 outline-none font-bold text-sm border-2 border-transparent focus:border-rose-100 transition-all shadow-inner" 
                              placeholder="(00) 00000-0000" 
                              value={formData.contact} 
                              onChange={e => setFormData({...formData, contact: e.target.value})} 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] uppercase font-black text-rose-400 ml-5">CPF / CNPJ</label>
                            <input 
                              required 
                              className="w-full bg-[#FDF8F9] rounded-[2rem] px-8 py-5 outline-none font-bold text-sm border-2 border-transparent focus:border-rose-100 transition-all shadow-inner" 
                              placeholder="000.000.000-00" 
                              value={formData.cpfCnpj} 
                              onChange={e => setFormData({...formData, cpfCnpj: e.target.value})} 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-10">
                      <div className="space-y-2">
                        <h2 className={`text-xl md:text-2xl font-black uppercase tracking-tighter italic ${theme.textPrimary}`}>Toque Final</h2>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${theme.textMuted}`}>Personalize ainda mais o seu pedido</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                        {addons.map((addon) => (
                          <button 
                            key={addon.id} 
                            type="button"
                            onClick={() => toggleAddon(addon.id)} 
                            className={`flex items-center gap-4 p-4 rounded-[2rem] border-2 transition-all text-left relative group overflow-hidden ${formData.selectedAddons?.includes(addon.id) ? 'border-rose-500 bg-rose-50/30' : 'border-gray-50 bg-[#FDF8F9]'}`}
                          >
                            <div className="w-14 h-14 rounded-2xl bg-white border border-rose-50 flex items-center justify-center text-2xl shrink-0 shadow-sm overflow-hidden">
                              {addon.image.length > 5 ? (
                                <ImageWithFallback src={addon.image} alt={addon.name} className="w-full h-full object-cover" />
                              ) : (
                                addon.image || '🎁'
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[9px] font-black uppercase tracking-widest text-gray-900 truncate">{addon.name}</p>
                              <p className="text-sm font-elegant text-rose-500">{formatCurrency(addon.price)}</p>
                            </div>
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${formData.selectedAddons?.includes(addon.id) ? 'bg-rose-500 text-white' : 'bg-white border border-rose-100'}`}>
                              {formData.selectedAddons?.includes(addon.id) && <Check size={14} />}
                            </div>
                          </button>
                        ))}
                      </div>

                      {isCartaoSelected && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-3"
                        >
                          <label className="text-[10px] uppercase font-black text-rose-400 ml-5">Mensagem do Cartão (Máx 150 caracteres)</label>
                          <div className="relative">
                            <textarea 
                              maxLength={150}
                              className="w-full bg-[#FDF8F9] rounded-[2rem] px-8 py-6 outline-none font-medium text-sm border-2 border-transparent focus:border-rose-100 transition-all shadow-inner h-32 resize-none"
                              placeholder="Escreva sua mensagem aqui..."
                              value={formData.addonMessage}
                              onChange={e => setFormData({...formData, addonMessage: e.target.value})}
                            />
                            <span className="absolute bottom-6 right-8 text-[9px] font-black text-gray-300 uppercase tracking-widest">
                              {formData.addonMessage?.length || 0} / 150
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-10">
                      <div className="space-y-2">
                        <h2 className={`text-xl md:text-2xl font-black uppercase tracking-tighter italic ${theme.textPrimary}`}>Forma de Entrega</h2>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${theme.textMuted}`}>Como você quer receber seu pedido?</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { id: 'pickup', label: 'Retirada', icon: MapPin },
                          { id: 'delivery', label: 'Entrega Local', icon: Truck },
                          { id: 'shipping', label: 'Envio (Correios)', icon: Box }
                        ].map(type => (
                          <button 
                            key={type.id} 
                            type="button" 
                            onClick={() => setFormData({...formData, deliveryType: type.id as any})} 
                            className={`p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-3 ${formData.deliveryType === type.id ? 'border-rose-500 bg-rose-50/30' : 'border-gray-50 bg-[#FDF8F9]'}`}
                          >
                            <type.icon size={24} className={formData.deliveryType === type.id ? 'text-rose-500' : 'text-gray-300'} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
                          </button>
                        ))}
                      </div>

                      {formData.deliveryType !== 'pickup' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="md:col-span-1 space-y-2">
                            <label className="text-[9px] uppercase font-black text-rose-400 ml-5">CEP</label>
                            <input required className="w-full bg-[#FDF8F9] rounded-[2rem] px-8 py-5 outline-none font-bold text-sm border-2 border-rose-100" placeholder="00000-000" value={formData.zipCode} onChange={e => setFormData({...formData, zipCode: e.target.value})} />
                          </div>
                          <div className="md:col-span-2 space-y-2">
                            <label className="text-[9px] uppercase font-black text-rose-400 ml-5">Endereço Completo</label>
                            <input required className="w-full bg-[#FDF8F9] rounded-[2rem] px-8 py-5 outline-none font-bold text-sm border-2 border-rose-100" placeholder="Rua, Número, Bairro, Cidade..." value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-10">
                      <div className="space-y-2">
                        <h2 className={`text-xl md:text-2xl font-black uppercase tracking-tighter italic ${theme.textPrimary}`}>Pagamento</h2>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${theme.textMuted}`}>Escolha a melhor opção para você</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { id: 'pix', label: 'PIX (À Vista)', icon: CheckCircle },
                          { id: 'pix_parcelado', label: 'PIX Parcelado', icon: Sparkles },
                          { id: 'credit_card', label: 'Cartão Crédito', icon: CreditCard },
                          { id: 'cash', label: 'Dinheiro', icon: DollarSign }
                        ].map(m => (
                          <button 
                            key={m.id} 
                            type="button" 
                            onClick={() => setFormData({...formData, paymentMethod: m.id as any})} 
                            className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${formData.paymentMethod === m.id ? 'border-rose-500 bg-rose-50/30' : 'border-gray-50 bg-[#FDF8F9]'}`}
                          >
                            <span className="text-[9px] font-black uppercase tracking-[0.1em] text-center leading-tight">{m.label}</span>
                          </button>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-rose-400 ml-5">Obervações Adicionais</label>
                        <textarea className="w-full bg-[#FDF8F9] rounded-[2.5rem] px-8 py-6 outline-none text-sm min-h-[120px] shadow-inner font-medium" placeholder="Ex: Gosto da caixa bem laqueada, adicionar flores brancas..." value={formData.observations} onChange={e => setFormData({...formData, observations: e.target.value})} />
                      </div>

                      <button type="button" onClick={() => setFormData({...formData, isEmergency: !formData.isEmergency})} className={`w-full p-8 rounded-[3rem] border-2 flex items-center gap-6 transition-all ${formData.isEmergency ? 'border-amber-500 bg-amber-50 shadow-xl shadow-amber-200/20' : 'bg-[#FDF8F9] border-gray-50'}`}>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${formData.isEmergency ? 'bg-amber-100 text-amber-600' : 'bg-white text-gray-300'}`}>
                          <Sparkles size={24} />
                        </div>
                        <div className="text-left">
                          <p className="text-[11px] font-black uppercase tracking-widest text-gray-900">Produção Flash (Urgência)</p>
                          <p className="text-[9px] text-gray-500 mt-0.5 font-bold uppercase tracking-widest">Taxa fixa de {formatCurrency(25)} para prioridade total na produção.</p>
                        </div>
                      </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="flex gap-6">
                {step > 1 && (
                  <button 
                    type="button" 
                    onClick={() => setStep(step - 1)} 
                    className="px-10 py-6 rounded-[2rem] border border-gray-200 text-gray-400 text-[10px] uppercase font-black tracking-widest hover:bg-gray-50 transition-all"
                  >
                    Voltar
                  </button>
                )}
                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="flex-1 py-6 rounded-[2rem] text-white font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center" 
                  style={{ backgroundColor: theme.accentColor }}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <span className="flex items-center gap-3">
                      {step < 4 ? 'Continuar Pedido' : 'Finalizar no WhatsApp'}
                      <ChevronRight size={18} />
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>

          <aside className="lg:col-span-4 lg:sticky lg:top-8 space-y-8 h-fit">
            <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-rose-50 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 flex items-center gap-2"><ShoppingBag size={14} className="text-rose-500" /> Resumo</h3>
                <span className="bg-rose-50 text-rose-500 text-[8px] font-black uppercase px-3 py-1 rounded-full">{cart.reduce((a, b) => a + b.quantity, 0)} Itens</span>
              </div>

              <div className="space-y-6 max-h-[35vh] overflow-y-auto pr-2 scrollbar-hide">
                {cart.map((i, idx) => (
                  <div key={`cart-item-${i.id}-${idx}`} className="flex gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 shrink-0 border border-slate-50 shadow-sm"><ImageWithFallback src={i.image} alt={i.product_name} className="w-full h-full object-cover" /></div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[10px] font-black uppercase tracking-widest truncate leading-relaxed ${theme.textPrimary}`}>{i.product_name}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${theme.textMuted}`}>{i.quantity}x</span>
                        <span className={`text-[11px] font-black ${theme.textPrimary}`}>{formatCurrency(i.retail_price * i.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {addons.filter(a => formData.selectedAddons?.includes(a.id)).map((a, idx) => (
                  <div key={`addon-resum-${a.id}-${idx}`} className="flex gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100/50">
                      {a.image.length > 5 ? <ImageWithFallback src={a.image} className="w-full h-full object-cover rounded-2xl" /> : <span className="text-2xl">{a.image || '✨'}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[9px] font-black uppercase tracking-widest truncate leading-relaxed ${theme.textSecondary}`}>Adicional: {a.name}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className={`text-[9px] font-black uppercase tracking-widest ${theme.textVeryMuted}`}>1x</span>
                        <span className={`text-[11px] font-black ${theme.textPrimary}`}>{formatCurrency(a.price)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-rose-50 space-y-4">
                <div className={`flex justify-between text-[10px] font-black uppercase tracking-widest ${theme.textSecondary}`}><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                {addonTotal > 0 && <div className="flex justify-between text-[10px] font-black uppercase tracking-widest" style={{ color: theme.accentColor }}><span>Toque Final</span><span>+{formatCurrency(addonTotal)}</span></div>}
                {emergencyFee > 0 && <div className="flex justify-between text-[10px] font-black text-amber-500 uppercase tracking-widest"><span>Urgência</span><span>+R$ 25,00</span></div>}
                <div className="pt-6 border-t-2 border-rose-50 flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${theme.textVeryMuted}`}>Total Geral</span>
                    <span className={`text-4xl font-elegant ${theme.textPrimary}`}>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-[2.5rem] p-6 border border-emerald-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100"><Shield size={20} /></div>
              <div><p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Checkout Seguro</p><p className="text-[8px] text-emerald-400 font-bold uppercase">Seus dados estão protegidos</p></div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
