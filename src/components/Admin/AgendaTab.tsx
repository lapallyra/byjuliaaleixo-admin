import React from 'react';
import { 
  startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameDay, addMonths
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Order } from '../../types';
import { safeFormat, safeFormatISO } from '../../lib/dateUtils';
import { ChevronLeft, ChevronRight, User, Hash } from 'lucide-react';

interface AgendaTabProps {
  orders: Order[];
  onSelectOrder?: (orderId: string) => void;
}

export const AgendaTab: React.FC<AgendaTabProps> = ({ orders, onSelectOrder }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const filteredOrders = orders.filter(o => 
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (o.code && o.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Create a function to get a nice background color based on the customer name
  const getOrderStyle = (customerName: string) => {
    const colors = [
      'bg-emerald-500 border-emerald-600', 
      'bg-blue-500 border-blue-600', 
      'bg-rose-500 border-rose-600', 
      'bg-amber-500 border-amber-600', 
      'bg-indigo-500 border-indigo-600',
      'bg-violet-500 border-violet-600',
      'bg-orange-500 border-orange-600',
      'bg-purple-500 border-purple-600'
    ];
    let hash = 0;
    for (let i = 0; i < customerName.length; i++) {
      hash = customerName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Tahoma, Verdana, Segoe UI, sans-serif' }}>
      {/* Top Bar with Search */}
      <div className="relative w-full max-w-xl mx-auto mb-10">
        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Pesquisar na agenda por cliente ou código..." 
          className="w-full pl-12 pr-4 py-4 rounded-3xl bg-white border border-lilac/30 text-[10px] uppercase font-bold tracking-widest outline-none focus:border-lilac transition-all shadow-sm text-black"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main Calendar - Span full width now */}
        <div className="xl:col-span-4 space-y-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-black uppercase tracking-tighter">
              {safeFormat(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, -1))} 
                className="p-3 rounded-xl bg-white border border-lilac/20 hover:bg-lilac text-black hover:text-white transition-all shadow-sm group"
              >
                <ChevronLeft size={18} className="group-hover:text-white" />
              </button>
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} 
                className="p-3 rounded-xl bg-white border border-lilac/20 hover:bg-lilac text-black hover:text-white transition-all shadow-sm group"
              >
                <ChevronRight size={18} className="group-hover:text-white" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-lilac/20 rounded-3xl overflow-hidden border border-lilac/20 shadow-xl">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} className="bg-white p-4 text-center text-[10px] font-black uppercase tracking-widest text-black">{d}</div>
            ))}
            {days.map((day, i) => {
              const dayOrders = filteredOrders.filter(o => {
                if (!o.deliveryDate) return false;
                const endD = new Date(o.deliveryDate + 'T12:00:00');
                if (isNaN(endD.getTime())) return false;
                
                let startD = endD;
                if (o.createdAt) {
                   startD = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
                }
                startD.setHours(0,0,0,0);
                
                // Check if day is between startD and endD (inclusive, day is at 00:00)
                return day.getTime() >= startD.getTime() && day.getTime() <= endD.getTime();
              });

              return (
                <div key={day.toISOString()} className="min-h-[140px] bg-white p-2 hover:bg-lilac/5 transition-all group flex flex-col gap-1 border border-transparent">
                  <span className="text-[10px] font-black text-gray-400 group-hover:text-black transition-colors mb-2">
                    {safeFormat(day, 'd')}
                  </span>
                  <div className="space-y-1.5 overflow-y-auto max-h-[100px] overflow-x-visible">
                    {dayOrders.map((order, oIdx) => {
                      const startD = order.createdAt ? (order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt)) : new Date(order.deliveryDate + 'T12:00:00');
                      const endD = new Date(order.deliveryDate + 'T12:00:00');
                      const isStart = isSameDay(day, startD);
                      const isEnd = isSameDay(day, endD);
                      const showLabel = isStart || day.getDay() === 0; // Show text on start day or Sunday
                      
                      return (
                        <div 
                          key={`${day.toISOString()}-${order.id}-${oIdx}`} 
                          onClick={() => onSelectOrder?.(order.id)}
                          className={`p-1 px-2 border flex items-center gap-1.5 cursor-pointer shadow-sm ${getOrderStyle(order.customerName)} ${isStart ? 'rounded-l-lg' : 'border-l-0'} ${isEnd ? 'rounded-r-lg border-r' : 'border-r-0'} ${!isStart && !isEnd ? 'rounded-none' : ''}`}
                          title={`${order.customerName} - ${order.code} (${safeFormatISO(startD.toISOString(), 'dd/MM')} a ${safeFormatISO(endD.toISOString(), 'dd/MM')})`}
                        >
                           {isStart && <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />}
                           <span className="text-[8px] font-black uppercase text-white truncate">
                             {showLabel ? order.customerName : '\u00A0'}
                           </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend / Upcoming Orders in Focus */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {filteredOrders.filter(o => o.status === 'production' || o.status === 'pending').slice(0, 6).map(order => {
              const style = getOrderStyle(order.customerName);
              const colorBase = style.split(' ')[0].replace('bg-', '');
              
              return (
              <div 
                key={order.id} 
                onClick={() => onSelectOrder?.(order.id)}
                className="p-5 rounded-3xl bg-white border border-lilac/10 flex items-center gap-4 group hover:border-lilac/40 transition-all shadow-sm cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center text-white ${style}`}>
                   <User size={18} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-black text-black uppercase truncate">{order.customerName}</span>
                    <span className={`text-[8px] font-mono font-black text-${colorBase === 'lilac' ? 'lilac' : colorBase}`}>#{order.code}</span>
                  </div>
                  <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Entrega: {safeFormatISO(order.deliveryDate || '', 'dd/MM/yyyy')}</p>
                </div>
              </div>
            );})}
          </div>
        </div>
      </div>
    </div>
  );
};
