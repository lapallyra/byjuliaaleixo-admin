import React, { useMemo, useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, DollarSign, Package, 
  Calendar, Users, ShoppingCart, 
  CheckCircle, Clock, XCircle, Zap, Gift, Star,
  Box, Sparkles, BarChart as BarChartIcon,
  Tag, MessageSquare, Share2, ArrowRight, Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, Product, CompanyId, CommemorativeDate } from '../../types';
import { safeFormat } from '../../lib/dateUtils';
import { formatCurrency } from '../../lib/currencyUtils';
import { startOfDay, isToday } from 'date-fns';
import { getUpcomingDates } from '../../services/calendarService';
import { commemorativeDateService } from '../../services/commemorativeDateService';
import { getMobileDateOccurrence } from '../../lib/commemorativeDateUtils';

interface DashboardTabProps {
  orders: Order[];
  products: Product[];
  customers: any[];
  monthlyGoal: number;
  onAction: (action: 'new_order' | 'new_client' | 'new_insumo' | 'view_agenda') => void;
  onOpenOrder: (order: Order) => void;
}

const OpportunitiesWidget: React.FC = () => {
  const [dates, setDates] = useState<CommemorativeDate[]>([]);

  useEffect(() => {
    const unsub = commemorativeDateService.subscribe(setDates);
    return unsub;
  }, []);

  const getFullDate = (d: CommemorativeDate, year = new Date().getFullYear()) => {
    if (d.year_fixed) return new Date(year, d.month - 1, d.day);
    if (d.mobile_id) {
      const occurrence = getMobileDateOccurrence(d.mobile_id, year);
      return new Date(year, occurrence.month - 1, occurrence.day);
    }
    return new Date(year, d.month - 1, d.day);
  };

  const todayDates = useMemo(() => {
    return dates.filter(d => isToday(getFullDate(d)) && d.active);
  }, [dates]);

  const upcomingDates = useMemo(() => {
    const today = startOfDay(new Date());
    return dates
      .filter(d => {
        const occurrence = getFullDate(d);
        return occurrence > today && occurrence <= startOfDay(new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000));
      })
      .sort((a, b) => getFullDate(a).getTime() - getFullDate(b).getTime())
      .slice(0, 3);
  }, [dates]);

  return (
    <div className="space-y-6">
      {todayDates.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-700">
             <Sparkles size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
               <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                 <Zap size={16} className="text-yellow-300" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Destaque de Hoje</span>
            </div>
            <h3 className="text-2xl font-display font-black leading-tight mb-2">
              {todayDates.map(d => d.name).join(' & ')}
            </h3>
            <p className="text-[11px] text-white/70 font-medium leading-relaxed italic mb-6">
              "{todayDates[0].marketing_phrase}"
            </p>
            <div className="flex gap-3">
               <button className="bg-white text-indigo-600 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
                 <Tag size={12} /> Postar
               </button>
               <button className="bg-indigo-500/50 text-white border border-white/20 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500/70 transition-all flex items-center gap-2">
                 <Share2 size={12} /> Divulgar
               </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-600">
          <Calendar size={20} />
        </div>
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black">Radar de Campanhas</h3>
          <p className="text-[8px] text-gray-400 font-bold uppercase mt-1">Próximos 60 dias estratégicos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {upcomingDates.map((data, idx) => {
          const daysLeft = Math.ceil((getFullDate(data).getTime() - startOfDay(new Date()).getTime()) / (1000 * 60 * 60 * 24));
          return (
            <div 
              key={`dash-opp-${idx}`} 
              className="p-6 rounded-[2rem] bg-white border border-slate-100 transition-all hover:border-slate-300 shadow-sm flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                  <span className="text-[10px] font-black leading-none">{getFullDate(data).getDate()}</span>
                  <span className="text-[7px] font-black uppercase">{safeFormat(getFullDate(data), 'MMM')}</span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-black uppercase tracking-tight">{data.name}</h4>
                  <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest mt-1">
                    {data.category} • Faltam {daysLeft} dias
                  </p>
                </div>
              </div>
              <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-black hover:text-white transition-all">
                <ArrowRight size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const DashboardTab: React.FC<DashboardTabProps> = ({ orders, products, customers, monthlyGoal, onAction, onOpenOrder }) => {
  const [expandedSection, setExpandedSection] = React.useState<string | null>(null);

  // Stats Calculation
  const { currentMonthRevenue, currentMonthNetProfit, goalProgress, totalRevenue, pendingOrders, daysInMonth } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const revenueSinceStartOfMonth = orders.reduce((sum, o) => {
      if (o.status === 'cancelled') return sum;
      const date = new Date(o.createdAt?.toDate ? o.createdAt.toDate() : (o.createdAt || Date.now()));
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        return sum + (Number(o.total) || 0);
      }
      return sum;
    }, 0) || 0;

    const currentGoalProgress = monthlyGoal > 0 ? (revenueSinceStartOfMonth / monthlyGoal) * 100 : 0;
    const revenueTotal = orders.reduce((sum, o) => o.status !== 'cancelled' ? sum + (Number(o.total) || 0) : sum, 0) || 0;

    const netProfitEstimate = revenueSinceStartOfMonth * 0.35;

    const pending = orders.filter(o => 
      !['delivered', 'cancelled'].includes(o.status)
    ).sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() || (a.createdAt as any)?.seconds * 1000 || Date.now();
      const timeB = b.createdAt?.toMillis?.() || (b.createdAt as any)?.seconds * 1000 || Date.now();
      return timeB - timeA;
    }).slice(0, 5);

    return {
      currentMonthRevenue: revenueSinceStartOfMonth,
      currentMonthNetProfit: netProfitEstimate,
      goalProgress: currentGoalProgress,
      totalRevenue: revenueTotal,
      pendingOrders: pending,
      daysInMonth: lastDayOfMonth
    };
  }, [orders, monthlyGoal]);

  const brandConfig: Record<string, { color: string, badge: string, initial: string }> = useMemo(() => ({
    guennita: { color: '#800000', badge: 'tag-guennita', initial: 'CG' },
    pallyra: { color: '#000000', badge: 'tag-pallyra', initial: 'LP' },
    mimada: { color: '#FF007F', badge: 'tag-mimada', initial: 'MS' },
  }), []);

  const statusLabels: Record<string, string> = useMemo(() => ({
    quote: 'Orçamento',
    waiting_deposit: 'Aguardando Sinal',
    production: 'Em Produção',
    ready: 'Pronto',
    approval: 'Ver Arte',
    assembly: 'Montagem',
    pending: 'Pendente',
    delivered: 'Entregue',
    cancelled: 'Cancelado',
    'novo pedido': 'Novo Pedido'
  }), []);

  return (
     <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-300 pb-20 max-w-7xl mx-auto overflow-x-hidden">
      
      {/* 1. Cabeçalho Horizontal Compacto e Elegante */}
      <header className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
         {[
           { title: 'Volume Bruto', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-indigo-500', bg: 'bg-indigo-50' },
           { title: 'Lucro Estimado', value: formatCurrency(totalRevenue * 0.35), icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
           { title: 'Pedidos', value: orders.length.toString(), icon: ShoppingCart, color: 'text-rose-500', bg: 'bg-rose-50' },
           { title: 'Clientes', value: customers.length.toString(), icon: Users, color: 'text-violet-500', bg: 'bg-violet-50' },
         ].map((stat, idx) => (
           <div key={`ds-stat-${idx}`} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-5 shadow-sm hover:shadow-md transition-all">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">{stat.title}</p>
                <p className="text-xl font-sans font-black text-slate-900 mt-0.5">{stat.value}</p>
              </div>
           </div>
         ))}
      </header>

      {/* 2. Grid de Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Coluna Esquerda (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-10">
           <OpportunitiesWidget />
           
           {/* CLT Escape Thermometer */}
           <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Target size={60} />
              </div>
              <div className="flex justify-between items-center mb-6">
                <div>
                   <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Meta CLT</p>
                   <p className="text-[10px] font-bold text-slate-500 mt-0.5">R$ 2.000,00 por mês</p>
                </div>
                <p className="text-2xl font-sans font-black text-rose-500">{formatCurrency(currentMonthNetProfit)}</p>
              </div>
              <div className="w-full h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                 <motion.div 
                   initial={{ width: 0 }} 
                   animate={{ width: `${Math.min((currentMonthNetProfit / 2000) * 100, 100)}%` }} 
                   transition={{ duration: 1, ease: "easeOut" }}
                   className="h-full bg-gradient-to-r from-rose-400 to-rose-600 shadow-lg"
                 />
              </div>
           </div>
        </div>

        {/* Coluna Direita (lg:col-span-8) */}
        <div className="lg:col-span-8">
           <section className="glass-card p-10 h-full relative overflow-hidden">
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gold/5 blur-[100px]"></div>
              <div className="flex items-center justify-between mb-12">
                 <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-500">Pedidos em aberto</h3>
              </div>

              <div className="space-y-6">
                 {pendingOrders.length === 0 && (
                   <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-white">
                      <ShoppingCart size={48} className="mx-auto text-slate-900/5 mb-6" />
                      <p className="text-xs font-black text-slate-300 uppercase tracking-[0.4em]">Aguardando novos negócios</p>
                   </div>
                 )}
                 {pendingOrders.map((order) => {
                   const config = brandConfig[order.companyId] || brandConfig.pallyra;
                   return (
                     <motion.div 
                       key={order.id} 
                       whileHover={{ x: 10 }}
                       onClick={() => onOpenOrder(order)}
                       className={`glass-premium p-8 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden transition-all group cursor-pointer border-l-4`}
                       style={{ borderColor: config.color }}
                     >
                       <div className="flex items-center gap-6">
                          <div>
                             <h4 className="text-lg font-sans font-black text-slate-900 tracking-tight uppercase group-hover: transition-all">{order.customerName}</h4>
                             <div className="flex items-center gap-3 mt-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">#{order.code}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                <span className="text-[10px] font-black text-lilac uppercase tracking-widest">
                                  {statusLabels[order.status] || order.status}
                                </span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex items-center justify-between md:justify-end gap-10">
                          <div className="text-right">
                             <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">Valor</span>
                             <span className="text-xl font-sans font-black text-slate-900 ">{formatCurrency(Number(order.total) || 0)}</span>
                          </div>
                          <div className="bg-white group-hover:bg-lilac group-hover:text-black transition-all p-4 rounded-2xl border border-slate-100">
                             <ShoppingCart size={20} />
                          </div>
                       </div>
                     </motion.div>
                   );
                 })}
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};

