import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, CompanyId, Order, Insumo, Customer } from '../types';
import { 
  addProduct, updateProduct, deleteProduct, subscribeToProducts, 
  subscribeToSales, subscribeToInsumos, subscribeToCustomers,
  subscribeToSuggestions, markSuggestionAsRead, subscribeToAllSettings,
  addInsumo, updateInsumo, 
  deleteInsumo, updateOrderStatus, updateOrder, saveSale
} from '../services/firebaseService';
import { db } from '../lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { 
  ArrowLeft, LayoutDashboard, ShoppingBag, Calendar, 
  Archive, Box, Search, Bell, LogOut, Settings, User, X,
  DollarSign, BarChart3, Sparkles, Gift, ChevronRight
} from 'lucide-react';
import { useAuth } from './AuthProvider';

// Modular Tabs
import { DashboardTab } from './Admin/DashboardTab';
import { OrdersTab } from './Admin/OrdersTab';
import { AgendaTab } from './Admin/AgendaTab';
import { InventoryTab } from './Admin/InventoryTab';
import { ProductsTab } from './Admin/ProductsTab';
import { ClientsTab } from './Admin/ClientsTab';
import { FinanceTab } from './Admin/FinanceTab';
import { ReportsTab } from './Admin/ReportsTab';
import { SettingsTab } from './Admin/SettingsTab';
import { GiftListsTab } from './Admin/GiftListsTab';
import { CommemorativeDatesTab } from './Admin/CommemorativeDatesTab';
import { AddonsTab } from './Admin/AddonsTab';

import { AdminNotificationPortal } from './AdminNotificationPortal';
import { OrderReceiptModal } from './Admin/OrderReceiptModal';
import { safeFormatISO } from '../lib/dateUtils';
import { ErrorBoundary } from './ErrorBoundary';
import { ImageWithFallback } from './ImageWithFallback';

type TabType = 'dashboard' | 'orders' | 'agenda' | 'inventory' | 'products' | 'clients' | 'finance' | 'gift-lists' | 'commemorative-dates' | 'reports' | 'settings' | 'addons';

interface AdminDashboardProps {
  onGoBack: () => void;
}

const TabLoader = () => (
  <div className="h-64 flex flex-col items-center justify-center gap-4 animate-in fade-in">
    <div className="w-12 h-12 border-4 border-lilac border-t-transparent rounded-full animate-spin" />
    <span className="text-[10px] font-black uppercase text-lilac tracking-widest">Carregando...</span>
  </div>
);

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onGoBack }) => {
  const { user, isAdmin, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedCompanyId, setSelectedCompanyId] = useState<CompanyId>('pallyra'); // Default to first
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [tabError, setTabError] = useState<string | null>(null);

  // Clear tab error when switching tabs
  useEffect(() => {
    setTabError(null);
  }, [activeTab]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Order[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [globalSearch, setGlobalSearch] = useState('');
  const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!isAdmin || !user) return;
    
    console.log('Attaching admin listeners as:', user.email);
    
    const unsubProducts = subscribeToProducts(setProducts);
    const unsubSales = subscribeToSales((loaded) => setSales(loaded as Order[]));
    const unsubSettings = subscribeToAllSettings(setSettings);
    const unsubInsumos = subscribeToInsumos(setInsumos);
    const unsubCustomers = subscribeToCustomers(setCustomers); 
    const unsubSuggestions = subscribeToSuggestions(setSuggestions);
    
    return () => {
      unsubProducts();
      unsubSales();
      unsubSettings();
      unsubInsumos();
      unsubCustomers();
      unsubSuggestions();
    };
  }, [isAdmin, user]);

  if (loading) {
    return (
      <div className="feminine-admin min-h-screen admin-bg flex flex-col items-center justify-center p-8">
        <TabLoader />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="feminine-admin min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-gold/10 rounded-[2rem] flex items-center justify-center mb-6 border border-gold/20">
          <Box className="text-gold" size={40} />
        </div>
        <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Acesso Restrito</h2>
        <p className="text-slate-400 mb-8 max-w-sm font-sans text-xs uppercase tracking-widest leading-loose">
          Este painel é exclusivo para a administração. Faça login com as credenciais autorizadas.
        </p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button 
            onClick={() => import('../lib/firebase').then(m => m.login())}
            className="bg-gold text-black font-bold py-4 px-10 rounded-2xl hover:scale-105 transition-all shadow-[0_20px_60px_rgba(212,175,55,0.3)]"
          >
            Acessar com Google
          </button>
          <button 
            onClick={onGoBack} 
            className="text-slate-500 hover:text-white transition-all text-[9px] uppercase font-black tracking-[0.3em] mt-4"
          >
            ← Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  const menuItems: { id: TabType, label: string, icon: any }[] = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
    { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'inventory', label: 'Estoque', icon: Archive },
    { id: 'products', label: 'Produtos', icon: Box },
    { id: 'clients', label: 'Clientes', icon: User },
    { id: 'addons', label: 'Adicionais', icon: Sparkles },
    { id: 'commemorative-dates', label: 'Datas Comemorativas', icon: Calendar },
    { id: 'finance', label: 'Financeiro', icon: DollarSign },
    { id: 'gift-lists', label: 'Lista de Presentes', icon: Gift },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="feminine-admin min-h-screen bg-white text-slate-900 flex font-sans overflow-hidden relative scroll-smooth">
      <AdminNotificationPortal />

      {/* Sidebar navigation - Desktop */}
      <aside className={`bg-white border-r border-rose-100 flex flex-col hidden lg:flex flex-shrink-0 relative z-[60] shadow-xl shadow-rose-200/20 transition-all duration-300 ${isSidebarCollapsed ? "w-24 items-center" : "w-72"}`}>
        
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-10 bg-white border border-rose-200 p-1.5 rounded-full shadow-md z-50 text-rose-400 hover:text-rose-600 transition-all"
          >
            <ChevronRight size={14} className={`transition-transform duration-300 ${!isSidebarCollapsed ? "rotate-180" : ""}`} />
          </button>

        <div className={`p-8 ${isSidebarCollapsed ? "px-4" : ""}`}>
          <div className="flex items-center gap-4 mb-14 px-2">
             <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FF007F] to-rose-50 flex items-center justify-center text-white shadow-[0_10px_30px_rgba(255,0,127,0.3)]">
                <Sparkles size={22} />
             </div>
             {!isSidebarCollapsed && (
               <div>
                  <h1 className="font-sans font-black text-sm tracking-[0.1em] uppercase bg-gradient-to-r from-[#FF007F] to-rose-400 bg-clip-text text-transparent italic">Sistema Premium</h1>
                  <p className="text-[9px] text-[#FF007F]/60 uppercase tracking-widest font-black text-rose-500">AI & Business Control</p>
               </div>
             )}
          </div>

          <nav className="space-y-1">
            {menuItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all relative group overflow-hidden ${activeTab === item.id ? 'text-[#FF007F]' : 'text-rose-300 hover:text-[#FF007F] hover:bg-rose-50'}`}
              >
                {activeTab === item.id && (
                  <motion.div 
                    layoutId="activeNavBg"
                    className="absolute inset-0 bg-gradient-to-r from-rose-50 to-transparent border-l-4 border-[#FF007F] rounded-r-xl"
                  />
                )}
                <item.icon size={18} className={`${activeTab === item.id ? 'text-[#FF007F] drop-shadow-[0_0_8px_rgba(255,0,127,0.4)]' : 'text-rose-200 group-hover:text-rose-300'} transition-all`} />
                <span className={`text-[10px] uppercase font-black tracking-[0.15em] relative z-10 ${activeTab === item.id ? 'font-black' : ''}`}>{!isSidebarCollapsed && item.label}</span>
                {activeTab === item.id && !isSidebarCollapsed && (
                  <motion.div layoutId="activeDot" className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF007F] shadow-[0_0_10px_rgba(255,0,127,1)]" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-rose-50 space-y-3">
           <button onClick={onGoBack} className="w-full flex items-center justify-center gap-3 py-4 rounded-full text-rose-300 hover:text-[#FF007F] hover:bg-rose-50 transition-all text-[9px] font-black uppercase tracking-[0.2em] bg-white border border-rose-100">
              <ArrowLeft size={14} /> {isSidebarCollapsed ? "" : "Voltar à Loja"}
           </button>
           <button onClick={logout} className="w-full flex items-center justify-center gap-3 py-4 rounded-full text-rose-400 hover:bg-rose-50 transition-all text-[9px] font-black uppercase tracking-[0.2em] border border-rose-100 bg-white">
              <LogOut size={14} /> {isSidebarCollapsed ? "" : "Sair do Sistema"}
           </button>
        </div>
      </aside>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] lg:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white z-[110] lg:hidden border-r border-rose-100 flex flex-col shadow-2xl"
            >
              <div className="p-8 flex flex-col h-full">
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#FF007F] text-white flex items-center justify-center shadow-lg shadow-rose-200">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <h1 className="font-sans font-black text-sm tracking-[0.1em] uppercase text-slate-900">Admin</h1>
                      <p className="text-[8px] text-[#FF007F] uppercase tracking-widest font-black">Business Control</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-3 bg-rose-50 rounded-xl text-rose-400 hover:text-rose-600 active:scale-95 transition-transform"
                  >
                    <X size={24} />
                  </button>
                </div>

                <nav className="space-y-2 overflow-y-auto pr-2 scrollbar-hide">
                  {menuItems.map((item, idx) => (
                    <button
                      key={`mob-${item.id}`}
                      onClick={() => { 
                        setActiveTab(item.id); 
                        setTimeout(() => setIsMobileMenuOpen(false), 100); 
                      }}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-rose-50 text-[#FF007F]' : 'text-rose-300 hover:text-[#FF007F] hover:bg-rose-50'}`}
                    >
                      <item.icon size={18} className={activeTab === item.id ? 'text-[#FF007F]' : 'text-rose-200 group-hover:text-rose-300'} />
                      <span className="text-[9px] uppercase font-black tracking-[0.2em]">{item.label}</span>
                    </button>
                  ))}
                </nav>

                <div className="mt-auto pt-8 border-t border-rose-100 space-y-2">
                   <button onClick={() => { setIsMobileMenuOpen(false); onGoBack(); }} className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-rose-400 border border-rose-100 transition-all text-[9px] font-black uppercase tracking-[0.2em]">
                      <ArrowLeft size={14} /> Voltar à Loja
                   </button>
                   <button onClick={() => { setIsMobileMenuOpen(false); logout(); }} className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-rose-600 bg-rose-50 transition-all text-[9px] font-black uppercase tracking-[0.2em]">
                      <LogOut size={14} /> Encerrar
                   </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        {/* Top Header Bar */}
        <header className="h-24 bg-white border-b border-slate-100 px-10 flex items-center justify-between z-50 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-6 flex-1">
             <button 
               onClick={() => setIsMobileMenuOpen(true)}
               className="lg:hidden p-4 -ml-4 text-slate-400 active:scale-90 transition-transform"
             >
               <LayoutDashboard size={24} />
             </button>
             <div className="relative w-full max-w-lg md:block hidden">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  placeholder="BUSCA INTELIGENTE..." 
                  className="w-full bg-white border border-slate-100 focus:bg-white focus:border-lilac focus:ring-4 focus:ring-lilac/5 rounded-2xl pl-14 pr-6 py-4 text-[10px] uppercase font-black tracking-[0.2em] outline-none transition-all text-slate-900 placeholder:text-slate-300"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                />
             </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="relative">
                <button 
                  onClick={() => setIsSuggestionsModalOpen(true)}
                  className={`p-3 rounded-2xl transition-all relative border ${suggestions.some(s => !s.read) ? 'text-lilac border-lilac bg-lilac/5 shadow-[0_0_20px_rgba(233,213,255,0.4)]' : 'text-slate-400 border-slate-100 hover:bg-white'}`}
                >
                   <Bell size={20} />
                </button>
                {suggestions.filter(s => !s.read).length > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full border-2 border-white shadow-[0_0_10px_rgba(244,63,94,0.5)]" 
                  />
                )}
             </div>
             
             <div className="h-8 w-px bg-slate-100 mx-4" />
             
             <div className="flex items-center gap-4 bg-white border border-slate-100 px-4 py-2 rounded-2xl">
                <div className="flex flex-col items-end mr-1 hidden sm:flex">
                   <span className="text-[10px] font-black uppercase text-slate-900 tracking-widest">{user?.displayName?.split(' ')[0]}</span>
                   <span className="text-[7px] font-bold uppercase text-lilac tracking-[0.2em]">PRINCIPAL CEO</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-lilac to-white border border-lilac/20 p-px shadow-lg shadow-lilac/10">
                  <div className="w-full h-full rounded-xl bg-white flex items-center justify-center overflow-hidden">
                    {user?.photoURL ? (
                      <ImageWithFallback src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User size={16} className="text-slate-400" />
                    )}
                  </div>
                </div>
             </div>
          </div>
        </header>

        {/* Content Tabs Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 scrollbar-hide scroll-smooth">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.3 }}
               className="min-h-full"
             >
                <React.Suspense fallback={<TabLoader />}>
                   <ErrorBoundary 
                     key={activeTab} 
                     fallback={
                       <div className="h-full flex flex-col items-center justify-center p-10 text-center animate-in fade-in">
                          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
                             <X size={32} />
                          </div>
                          <h3 className="text-sm font-black uppercase text-black tracking-widest mb-2">Ops! Algo deu errado nesta aba</h3>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest max-w-xs">Encontramos um erro ao carregar as informações. Tente recarregar a página.</p>
                          <button 
                            onClick={() => window.location.reload()}
                            className="mt-8 px-8 py-3 bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest"
                          >
                            Recarregar Painel
                          </button>
                       </div>
                     }
                   >
                    {activeTab === 'dashboard' && (
                      <DashboardTab 
                        orders={sales} 
                        products={products}
                        customers={customers}
                        monthlyGoal={settings[selectedCompanyId]?.monthly_goal || 0}
                        onAction={(action) => {
                          if (action === 'view_agenda') setActiveTab('agenda');
                          else if (action === 'new_order') setActiveTab('orders');
                          else if (action === 'new_client') setActiveTab('clients');
                          else if (action === 'new_insumo') setActiveTab('inventory');
                        }}
                        onOpenOrder={(order) => setPrintingOrder(order)}
                      />
                    )}
                    {printingOrder && (
                      <OrderReceiptModal 
                        order={printingOrder} 
                        onClose={() => setPrintingOrder(null)} 
                      />
                    )}
                    {activeTab === 'orders' && (
                      <OrdersTab 
                        orders={sales} 
                        products={products} 
                        insumos={insumos} 
                        companyId={selectedCompanyId}
                        onUpdateStatus={async (id, status) => await updateOrderStatus(id, status)}
                        onSaveOrder={async (data) => {
                          if (data.id) {
                            await updateOrder(data.id, data);
                          } else {
                            await saveSale(data);
                          }
                        }}
                        onDeleteOrder={async (id) => {
                          await deleteDoc(doc(db, 'sales', id));
                        }}
                        initialOrderId={selectedOrderId}
                      />
                    )}
                    {activeTab === 'agenda' && <AgendaTab orders={sales} onSelectOrder={(id) => {
                      setSelectedOrderId(id);
                      setActiveTab('orders');
                    }} />}
                    {activeTab === 'inventory' && (
                      <InventoryTab 
                        insumos={insumos} 
                        onSaveInsumo={async (data) => {
                          if (data.id) {
                            await updateInsumo(data.id, data);
                          } else {
                            await addInsumo(data as any);
                          }
                        }} 
                        onDeleteInsumo={(id) => deleteInsumo(id)} 
                      />
                    )}
                    {activeTab === 'products' && (
                      <ProductsTab 
                        products={products} 
                        insumos={insumos} 
                        companyId={selectedCompanyId} 
                        onSaveProduct={async (p) => {
                          if (p.id) {
                            await updateProduct(p.id, p);
                          } else {
                            await addProduct(p as any);
                          }
                        }} 
                        onDeleteProduct={(id) => deleteProduct(id)} 
                      />
                    )}
                    {activeTab === 'clients' && (
                      <ClientsTab 
                        companyId={selectedCompanyId} 
                        customers={customers} 
                      />
                    )}
                    {activeTab === 'gift-lists' && (
                      <GiftListsTab companyId={selectedCompanyId} />
                    )}
                    {activeTab === 'commemorative-dates' && (
                      <CommemorativeDatesTab />
                    )}
                    {activeTab === 'finance' && (
                      <FinanceTab 
                        companyId={selectedCompanyId} 
                        orders={sales} 
                      />
                    )}
                    {activeTab === 'reports' && (
                      <ReportsTab 
                        companyId={selectedCompanyId} 
                        orders={sales} 
                        products={products} 
                        customers={customers} 
                        insumos={insumos}
                      />
                    )}
                    {activeTab === 'settings' && <SettingsTab companyId={selectedCompanyId} />}
                    {activeTab === 'addons' && <AddonsTab companyId={selectedCompanyId} />}
                  </ErrorBoundary>
                </React.Suspense>
             </motion.div>
           </AnimatePresence>
        </div>

        {/* Suggestions Modal Overlay */}
        <AnimatePresence>
          {isSuggestionsModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-end p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSuggestionsModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
              />
              <motion.div 
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-lg bg-white h-full rounded-l-[3rem] border-l border-slate-100 shadow-2xl flex flex-col overflow-hidden"
              >
                <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-lilac/10 text-lilac flex items-center justify-center border border-lilac/20 shadow-[0_10px_30px_rgba(233,213,255,0.3)]">
                        <Sparkles size={24} />
                      </div>
                      <div>
                        <h2 className="text-base font-sans font-black uppercase tracking-tighter text-slate-900 italic">Central de Sugestões</h2>
                        <p className="text-[9px] text-lilac font-bold uppercase tracking-[0.2em] mt-1">Inteligência de Feedback</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => setIsSuggestionsModalOpen(false)} 
                     className="p-3 bg-white hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all active:scale-95"
                   >
                      <X size={24} />
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-6 scrollbar-hide">
                   {suggestions.length === 0 && (
                     <div className="h-full flex flex-col items-center justify-center text-center p-10">
                        <div className="p-8 bg-white rounded-[2.5rem] mb-6">
                           <Box size={48} className="text-slate-200" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Ouvindo o silêncio... Sem feedbacks.</p>
                     </div>
                   )}
                   {[...suggestions].sort((a, b) => {
                     const timeA = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0;
                     const timeB = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0;
                     return timeB - timeA;
                   }).map((s, idx) => (
                     <motion.div 
                       key={s.id} 
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: idx * 0.1 }}
                       onClick={() => { if(!s.read) markSuggestionAsRead(s.id); }}
                       className={`p-8 rounded-[2rem] border transition-all cursor-pointer relative overflow-hidden group ${s.read ? 'bg-white border-slate-100 opacity-60' : 'bg-white border-lilac/30 shadow-xl shadow-lilac/5 hover:bg-white'}`}
                     >
                        <div className="flex justify-between items-center mb-5">
                           <span className={`text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1.5 rounded-lg ${s.read ? 'bg-slate-100 text-slate-400' : 'bg-lilac text-black'}`}>
                             {s.companyId}
                           </span>
                           <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{s.createdAt?.toDate ? s.createdAt.toDate().toLocaleDateString() : 'RECENTE'}</span>
                        </div>
                        <p className="text-[12px] font-bold text-slate-700 leading-relaxed whitespace-pre-wrap">{s.message}</p>
                        {!s.read && (
                          <div className="mt-5 flex items-center gap-3">
                             <div className="w-2.5 h-2.5 rounded-full bg-lilac shadow-[0_0_10px_rgba(233,213,255,1)] animate-pulse" />
                             <span className="text-[8px] font-black uppercase text-lilac tracking-[0.2em] italic">Análise Requerida</span>
                          </div>
                        )}
                     </motion.div>
                   ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
</div>
  );
};

