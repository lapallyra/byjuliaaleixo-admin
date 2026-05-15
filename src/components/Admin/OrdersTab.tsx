import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Phone, Calendar, Truck, CreditCard, 
  Edit, Trash2, User, 
  Clock, X, CheckCircle, Eye, Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, CompanyId, Product, Insumo } from '../../types';
import { safeFormat, safeFormatISO } from '../../lib/dateUtils';
import { formatCurrency } from '../../lib/currencyUtils';
import { OrderReceiptModal } from './OrderReceiptModal';

interface OrdersTabProps {
  orders: Order[];
  products: Product[];
  insumos: Insumo[];
  companyId: CompanyId;
  onUpdateStatus: (id: string, status: Order['status']) => void;
  onSaveOrder: (order: Partial<Order>) => void;
  onDeleteOrder: (id: string) => void;
  initialOrderId?: string | null;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({ 
  orders, products, insumos, companyId, onUpdateStatus, onSaveOrder, onDeleteOrder, initialOrderId
}) => {
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  const confirmDelete = () => {
    if (orderToDelete) {
      onDeleteOrder(orderToDelete);
      setOrderToDelete(null);
    }
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Partial<Order> | null>(null);
  const [selectedAteliers, setSelectedAteliers] = useState<string[]>([]);
  const [selectedPaymentStatuses, setSelectedPaymentStatuses] = useState<string[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState<string | null>(initialOrderId || null);

  const atelieres = [
    { id: 'all', name: 'TODOS', prefix: 'ALL' },
    { id: 'pallyra', name: 'La Pallyra', prefix: 'LP' },
    { id: 'guennita', name: 'com amor, Guennita', prefix: 'CG' },
    { id: 'mimada', name: 'Mimada Sim', prefix: 'MS' },
  ];

  const statusOptions = [
    { value: 'novo pedido', label: 'NOVO PEDIDO', color: 'bg-purple-100 text-purple-600 border-purple-200' },
    { value: 'quote', label: 'ORÇAMENTO', color: 'bg-orange-100 text-orange-600 border-orange-200' },
    { value: 'approval', label: 'APROVAÇÃO DA ARTE', color: 'bg-indigo-100 text-indigo-600 border-indigo-200' },
    { value: 'waiting_deposit', label: 'AGUARDANDO SINAL', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    { value: 'production', label: 'EM PRODUÇÃO', color: 'bg-blue-100 text-blue-600 border-blue-200' },
    { value: 'assembly', label: 'EM MONTAGEM', color: 'bg-pink-100 text-pink-600 border-pink-200' },
    { value: 'ready', label: 'PRONTO PARA ENTREGA', color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
    { value: 'pending', label: 'PENDENTE', color: 'bg-yellow-100 text-yellow-600 border-yellow-200' },
    { value: 'delivered', label: 'ENTREGUE', color: 'bg-gray-100 text-gray-400 border-gray-200' },
    { value: 'cancelled', label: 'CANCELADO', color: 'bg-rose-100 text-rose-600 border-rose-200' },
  ];

  const getDeliveryStatus = (deliveryDate: string, currentStatus: string) => {
    if (currentStatus === 'delivered' || currentStatus === 'cancelled') return null;
    if (!deliveryDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const delivery = new Date(deliveryDate + 'T12:00:00');
    delivery.setHours(0, 0, 0, 0);
    
    const diffTime = delivery.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 3) {
      return { label: 'ATRASADO', color: 'bg-red-600 text-yellow-300 border-red-700 animate-pulse' };
    }
    if (diffDays <= 7) {
      return { label: 'ATENÇÃO', color: 'bg-yellow-400 text-red-700 border-yellow-500' };
    }
    return null;
  };

  const generateOrderCode = (cId: CompanyId) => {
    const prefixMap: Record<string, string> = {
      'pallyra': 'LP',
      'guennita': 'CG',
      'mimada': 'MS'
    };
    const prefix = prefixMap[cId] || 'XX';
    const randomNumbers = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}${randomNumbers}`;
  };

  const maskPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 3) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)} ${numbers.slice(3)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)} ${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    return value;
  };

  useEffect(() => {
    if (initialOrderId) {
      setIsDetailOpen(initialOrderId);
      setSearchTerm(''); // Clear search if expanding a specific order
      setSelectedAteliers([]); // Show all by clearing selection
    }
  }, [initialOrderId]);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  
  const filteredOrders = orders.filter(o => {
    const matchesSearch = (o.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (o.code || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAtelier = selectedAteliers.length === 0 ? true : selectedAteliers.includes(o.companyId || '');
    const matchesPayment = selectedPaymentStatuses.length === 0 ? true : selectedPaymentStatuses.includes(o.paymentStatus || 'pending');
    return matchesSearch && matchesAtelier && matchesPayment;
  }).sort((a, b) => {
    // Priority 1: Incomplete orders (not delivered/cancelled)
    const isInactiveA = ['delivered', 'cancelled'].includes(a.status);
    const isInactiveB = ['delivered', 'cancelled'].includes(b.status);
    if (isInactiveA !== isInactiveB) return isInactiveA ? 1 : -1;

    // Priority 2: Creation date (newest first) - To fix user's concern about "not appearing"
    const timeA = a.createdAt?.toMillis?.() || (a.createdAt as any)?.seconds * 1000 || Date.now();
    const timeB = b.createdAt?.toMillis?.() || (b.createdAt as any)?.seconds * 1000 || Date.now();
    return timeB - timeA;
  });

  return (
    <div className="space-y-6 bg-white p-4 md:p-8 rounded-[2.5rem]">
      {/* Top Bar */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-10">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar pedido..." 
            className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-white border border-lilac/30 text-[10px] uppercase font-bold tracking-widest outline-none focus:border-lilac transition-all text-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Traditional Checkbox Filters */}
        <div className="flex flex-wrap gap-8 items-center bg-gray-50/50 p-4 rounded-2xl border border-lilac/5">
          <div className="flex flex-col gap-2">
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Filtrar por Ateliê</span>
            <div className="flex gap-4">
              {atelieres.filter(a => a.id !== 'all').map(atl => {
                const isSelected = selectedAteliers.includes(atl.id);
                return (
                  <label key={atl.id} className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-black border-black' : 'border-lilac/30 group-hover:border-lilac'}`}>
                      {isSelected && <CheckCircle className="text-white" size={10} />}
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={isSelected} 
                      onChange={() => {
                        setSelectedAteliers(prev => 
                          prev.includes(atl.id) ? prev.filter(a => a !== atl.id) : [...prev, atl.id]
                        );
                      }} 
                    />
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${isSelected ? 'text-black' : 'text-gray-400'}`}>
                      {atl.name.replace('Ateliê ', '')}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="w-px h-8 bg-lilac/10"></div>

          <div className="flex flex-col gap-2">
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Pagamento</span>
            <div className="flex gap-4">
              {[
                { id: 'pending', label: 'PENDENTE' },
                { id: 'paid', label: 'PAGO' },
                { id: 'partial', label: 'PARCIAL' }
              ].map(st => {
                const isSelected = selectedPaymentStatuses.includes(st.id);
                return (
                  <label key={st.id} className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-black border-black' : 'border-lilac/30 group-hover:border-lilac'}`}>
                      {isSelected && <CheckCircle className="text-white" size={10} />}
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={isSelected} 
                      onChange={() => {
                         setSelectedPaymentStatuses(prev => 
                           prev.includes(st.id) ? prev.filter(s => s !== st.id) : [...prev, st.id]
                         );
                      }} 
                    />
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${isSelected ? 'text-black' : 'text-gray-400'}`}>
                      {st.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <button 
          onClick={() => { setEditingOrder({ companyId: selectedAteliers.length === 1 ? (selectedAteliers[0] as CompanyId) : companyId }); setIsModalOpen(true); }}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-black text-white font-black py-4 px-8 rounded-xl hover:scale-105 transition-all shadow-lg text-[9px] uppercase tracking-widest border border-black/10"
        >
          <Plus size={16} /> Novo Pedido
        </button>
      </div>

      {/* Orders Modern List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 && (
          <div className="py-20 text-center bg-white rounded-3xl border border-lilac/10 text-gray-400 italic text-sm">
            Nenhum pedido encontrado.
          </div>
        )}
        
        {filteredOrders.map((order, idx) => {
          const delStatus = getDeliveryStatus(order.deliveryDate || '', order.status);
          const currentStatus = statusOptions.find(s => s.value === order.status);
          
          return (
            <div 
              key={`order-card-${order.id}`}
              className={`bg-white rounded-3xl border border-lilac/10 shadow-sm transition-all hover:shadow-md overflow-hidden animate-in fade-in slide-in-from-bottom-2`}
              style={{ animationDelay: `${idx * 0.02}s` }}
            >
              <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Left: Code & Client */}
                <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="w-16 h-16 rounded-2xl bg-white flex flex-col items-center justify-center border border-lilac/5">
                        <span className="text-[8px] font-black uppercase text-gray-400 tracking-tighter">Pedido</span>
                        <span className="font-mono text-[11px] font-black text-black">#{order.code}</span>
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-[13px] font-black text-black uppercase tracking-tight flex items-center gap-2">
                          {order.customerName}
                          {order.source === 'catalog' && (
                            <span className="bg-pink-50 text-pink-500 text-[7px] px-1.5 py-0.5 rounded-full font-black">CATÁLOGO</span>
                          )}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 underline-offset-4">
                          <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><Phone size={10}/> {order.contact}</span>
                          <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><Calendar size={10}/> {order.deliveryDate ? safeFormatISO(order.deliveryDate, 'dd/MM/yyyy') : 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Middle: Status & Alerts */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-center md:justify-start">
                   {delStatus && (
                     <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest border uppercase ${delStatus.color}`}>
                       {delStatus.label}
                     </span>
                   )}
                   <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest border uppercase ${currentStatus?.color || 'bg-gray-100'}`}>
                     {currentStatus?.label || order.status}
                   </span>
                </div>
                   <span className={`px-3 py-1.5 rounded-full text-[8px] font-black tracking-widest border uppercase ${
                            order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-600 border-emerald-200' :
                            order.paymentStatus === 'cancelled' ? 'bg-rose-100 text-rose-600 border-rose-200' :
                            order.paymentStatus === 'partial' ? 'bg-amber-100 text-amber-600 border-amber-200' :
                            order.paymentStatus === 'refunded' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                            'bg-yellow-100 text-yellow-600 border-yellow-200'
                          }`}>
                     {order.paymentStatus === 'paid' ? 'PAGO' : order.paymentStatus === 'partial' ? 'PARCIAL' : order.paymentStatus === 'cancelled' ? 'CANC' : order.paymentStatus === 'refunded' ? 'REEM' : 'PENDENTE'}
                   </span>


                {/* Right: Price & Actions */}
                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                   <div className="text-right">
                      <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Total</p>
                      <p className="text-sm font-black text-black">{formatCurrency(order.total || 0)}</p>
                   </div>
                   <div className="flex items-center gap-2">
                     <button 
                        onClick={() => setPrintingOrder(order)}
                        className="p-3 rounded-xl bg-white text-gray-400 hover:text-black hover:bg-gray-100 transition-all" 
                        title="Imprimir"
                      >
                        <Printer size={18} />
                      </button>
                      <button 
                        onClick={() => setIsDetailOpen(isDetailOpen === order.id ? null : order.id)}
                        className={`p-3 rounded-xl transition-all ${isDetailOpen === order.id ? 'bg-black text-white' : 'bg-white text-gray-400 hover:text-black hover:bg-gray-100'}`}
                      >
                        {isDetailOpen === order.id ? <X size={18} /> : <Eye size={18} />}
                      </button>
                      <button 
                        onClick={() => { setEditingOrder(order); setIsModalOpen(true); }}
                        className="p-3 rounded-xl bg-white text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => setOrderToDelete(order.id)}
                        className="p-3 rounded-xl bg-white text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                   </div>
                </div>
              </div>

              {/* Dynamic Detail Integration */}
              <AnimatePresence>
                {isDetailOpen === order.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-lilac/5 bg-white/50"
                  >
                    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-10">
                       <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase text-black border-b border-lilac/10 pb-2">Cliente & Entrega</h4>
                          {order.isWholesale && (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                               <p className="text-[9px] font-black text-amber-800 uppercase tracking-widest flex items-center gap-2">⚠️ ATACADO ATIVADO</p>
                               <p className="text-[8px] text-amber-700 font-bold mt-1 uppercase">Preços aplicados conforme tabela de atacado.</p>
                            </div>
                          )}
                          <div className="grid gap-2">
                             <div className="flex justify-between"><span className="text-[9px] font-black text-gray-400 uppercase">Documento</span> <span className="text-[10px] font-bold text-gray-700">{order.customerCpfCnpj || '-'}</span></div>
                             <div className="flex justify-between"><span className="text-[9px] font-black text-gray-400 uppercase">Tipo</span> <span className="text-[10px] font-black text-indigo-500 uppercase">{order.deliveryType}</span></div>
                             <div className="flex justify-between"><span className="text-[9px] font-black text-gray-400 uppercase">Endereço</span> <span className="text-[10px] font-bold text-gray-700 text-right max-w-[150px] truncate">{order.address || '-'}</span></div>
                          </div>
                       </div>
                       
                       <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase text-black border-b border-lilac/10 pb-2">Produtos ({order.items?.length || 0})</h4>
                          <div className="space-y-2">
                             {order.items?.map((item, i) => (
                               <div key={`order-detail-item-${order.id || 'order'}-${item.productId || item.id || i}-${i}`} className="flex justify-between text-[10px] font-bold">
                                  <span className="text-gray-600">{item.quantity}x {item.product_name}</span>
                                  <span className="text-black">{formatCurrency(item.retail_price * item.quantity)}</span>
                               </div>
                             ))}
                          </div>
                       </div>

                       <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase text-black border-b border-lilac/10 pb-2">Status da Arte & Produção</h4>
                          <div className="flex flex-wrap gap-2">
                             {statusOptions.map(opt => (
                               <button
                                 key={`status-opt-${opt.value}`}
                                 onClick={() => onUpdateStatus(order.id, opt.value as any)}
                                 className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase border transition-all ${order.status === opt.value ? opt.color + ' ring-2 ring-indigo-500/20' : 'bg-white text-gray-300 border-gray-100 hover:border-indigo-400 hover:text-indigo-400'}`}
                               >
                                 {opt.label}
                               </button>
                             ))}
                          </div>
                          
                          {/* Histórico de Status */}
                          <div className="mt-6 pt-6 border-t border-[#161616]/5">
                             <div className="flex items-center gap-2 mb-6">
                               <Clock size={14} className="text-[#161616]" />
                               <h5 className="text-[10px] font-black uppercase text-[#161616] tracking-widest">Linha do Tempo</h5>
                             </div>
                             
                             <div className="relative pl-4 space-y-6 before:absolute before:top-2 before:bottom-0 before:left-[4px] before:w-px before:bg-gradient-to-b before:from-[#161616]/20 before:to-transparent">
                                {order.history?.length ? (
                                  order.history.sort((a: any, b: any) => {
                                      const tA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : (a.timestamp || 0);
                                      const tB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : (b.timestamp || 0);
                                      return tB - tA;
                                  }).map((h, i) => (
                                    <div key={`order-hist-${order.id}-${h.status}-${h.timestamp?.toDate?.()?.getTime() || h.timestamp}-${i}`} className="relative">
                                       <div className="absolute -left-[20px] top-1.5 w-2 h-2 rounded-full bg-white border-2 border-[#161616] shadow-sm z-10" />
                                       <div className="bg-[#F8F8F6] p-4 rounded-xl border border-[#161616]/5 shadow-sm">
                                          <div className="flex justify-between items-start mb-2 gap-4">
                                             <p className="text-[10px] font-black uppercase text-[#161616]">
                                               {statusOptions.find(o => o.value === h.status)?.label || h.status}
                                             </p>
                                             <p className="text-[8px] font-bold text-[#161616]/40 uppercase tracking-widest whitespace-nowrap">
                                               {new Date(h.timestamp?.toDate ? h.timestamp.toDate() : (h.timestamp || Date.now())).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                             </p>
                                          </div>
                                          {h.notes && (
                                            <p className="text-[10px] text-[#161616]/80 mt-1 italic leading-relaxed">"{h.notes}"</p>
                                          )}
                                       </div>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-[9px] text-[#161616]/40 italic uppercase tracking-widest">Sem histórico detalhado</p>
                                )}
                             </div>
                          </div>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Manual Order Modal */}
      {isModalOpen && (
        <OrderFormModal 
          editingOrder={editingOrder}
          products={products}
          companyId={companyId}
          onClose={() => setIsModalOpen(false)}
          onSave={async (data) => {
            const atelier = data.companyId || companyId;
            const fullData = {
              ...data,
              id: editingOrder?.id,
              code: editingOrder?.code || generateOrderCode(atelier as any),
              companyId: atelier as CompanyId,
              source: (editingOrder?.source || 'admin') as any
            };
            await onSaveOrder(fullData);
            setIsModalOpen(false);
          }}
        />
      )}

      {printingOrder && (
        <OrderReceiptModal 
          order={printingOrder} 
          onClose={() => setPrintingOrder(null)} 
        />
      )}
      {orderToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full rounded-3xl p-8 text-center animate-in zoom-in-95">
            <Trash2 size={48} className="mx-auto text-rose-500 mb-6" />
            <h3 className="text-xl font-black mb-2 uppercase">Excluir Pedido?</h3>
            <p className="text-sm text-gray-500 mb-8">Essa ação não pode ser desfeita.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setOrderToDelete(null)}
                className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-gray-500 uppercase text-xs"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black uppercase text-xs shadow-lg shadow-rose-500/30"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface OrderFormModalProps {
  editingOrder: Partial<Order> | null;
  products: Product[];
  companyId: string;
  onClose: () => void;
  onSave: (data: Partial<Order>) => void;
}

const OrderFormModal: React.FC<OrderFormModalProps> = ({ editingOrder, products, companyId, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>(editingOrder?.items || []);
  const [shipping, setShipping] = useState(editingOrder?.shippingCost || 0);
  const [isDepositPaid, setIsDepositPaid] = useState(editingOrder?.hasSignal || false);
  const [observations, setObservations] = useState(editingOrder?.observations || '');
  const [selectedAtelier, setSelectedAtelier] = useState<CompanyId>((editingOrder?.companyId as CompanyId) || (companyId as CompanyId));
  const [cpfCnpj, setCpfCnpj] = useState(editingOrder?.customerCpfCnpj || '');
  const [deliveryType, setDeliveryType] = useState(editingOrder?.deliveryType || 'pickup');
  const [isWholesale, setIsWholesale] = useState(editingOrder?.isWholesale || false);

  const subtotal = items.reduce((sum, it) => sum + (it.retail_price * it.quantity), 0);
  const totalWithShipping = subtotal + shipping;
  const depositValue = subtotal * 0.5;

  const maskCpfCnpj = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length <= 11) return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4").slice(0, 14);
    return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5").slice(0, 18);
  };

  const companiesList = [
    { id: 'pallyra', name: 'La Pallyra' },
    { id: 'guennita', name: 'com amor, Guennita' },
    { id: 'mimada', name: 'Mimada Sim' },
  ];

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
       <div className="bg-white   w-full   max-w-4xl   max-h-[90vh] overflow-y-auto rounded-[2rem] border border-lilac/30 p-8 md:p-10 shadow-2xl   relative max-h-[90vh] overflow-y-auto max-h-[90vh] overflow-y-auto">
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-8 right-8 p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-all"
          ><X size={24} /></button>

          <h2 className="text-xl font-black text-black uppercase tracking-widest mb-8">
            {editingOrder?.id ? 'Editar Pedido' : 'Novo Pedido'}
          </h2>
          
          <form onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            try {
              const formData = new FormData(e.currentTarget);
              await onSave({
                customerName: formData.get('customerName') as string,
                contact: formData.get('contact') as string,
                customerCpfCnpj: cpfCnpj,
                address: formData.get('address') as string,
                total: totalWithShipping,
                status: formData.get('status') as any,
                deliveryDate: formData.get('deliveryDate') as string,
                deliveryType: deliveryType as any,
                shippingCost: shipping,
                observations: observations,
                hasSignal: isDepositPaid,
                signalValue: depositValue,
                items,
                isWholesale: isWholesale,
                isEmergency: formData.get('isEmergency') === 'on',
                companyId: selectedAtelier
              });
              onClose();
            } catch (err) {
              console.error("Erro ao salvar pedido:", err);
              alert("Erro ao salvar pedido.");
            } finally {
              setLoading(false);
            }
          }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-gray-400 tracking-widest pl-2">Escolher Ateliê</label>
                <select 
                  value={selectedAtelier}
                  onChange={(e) => setSelectedAtelier(e.target.value as CompanyId)}
                  className="w-full bg-white border border-lilac/20 rounded-xl px-5 py-3 text-[11px] font-bold outline-none text-black"
                >
                  {companiesList.map((c, cIdx) => <option key={`company-opt-${c.id}-${cIdx}`} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-gray-400 tracking-widest pl-2">Nome do Cliente</label>
                <input name="customerName" defaultValue={editingOrder?.customerName} required type="text" className="w-full bg-white border border-lilac/20 rounded-xl px-5 py-3 text-[11px] font-bold outline-none text-black" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-gray-400 tracking-widest pl-2">CPF / CNPJ</label>
                <input 
                  value={cpfCnpj} 
                  onChange={(e) => setCpfCnpj(maskCpfCnpj(e.target.value))}
                  placeholder="000.000.000-00"
                  required
                  type="text" 
                  className="w-full bg-white border border-lilac/20 rounded-xl px-5 py-3 text-[11px] font-bold outline-none text-black" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-gray-400 tracking-widest pl-2">Contato</label>
                <input name="contact" defaultValue={editingOrder?.contact} required type="text" placeholder="(44) 9 9999-9999" className="w-full bg-white border border-lilac/20 rounded-xl px-5 py-3 text-[11px] font-bold outline-none text-black" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-gray-400 tracking-widest pl-2">Endereço Completo</label>
                <input name="address" defaultValue={editingOrder?.address} required type="text" placeholder="Rua, Número, Bairro, Cidade" className="w-full bg-white border border-lilac/20 rounded-xl px-5 py-3 text-[11px] font-bold outline-none text-black" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-gray-400 tracking-widest pl-2">Tipo de Entrega</label>
                <select 
                  value={deliveryType}
                  onChange={(e) => setDeliveryType(e.target.value as any)}
                  className="w-full bg-white border border-lilac/20 rounded-xl px-5 py-3 text-[11px] font-black outline-none text-black"
                >
                  <option value="pickup">RETIRADA</option>
                  <option value="delivery">DELIVERY</option>
                  <option value="shipping">ENVIO</option>
                </select>
              </div>
            </div>

            {deliveryType === 'shipping' && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 animate-in fade-in slide-in-from-top-2">
                 <label className="text-[9px] uppercase font-black text-blue-400 tracking-widest block mb-2">Custo do Frete (R$)</label>
                 <input 
                   type="number" 
                   step="0.01" 
                   value={shipping} 
                   onChange={(e) => setShipping(Number(e.target.value))}
                   className="w-full bg-white border border-blue-200 rounded-xl px-5 py-3 text-[11px] font-black outline-none font-mono text-blue-600" 
                 />
              </div>
            )}

            {/* Incluir Produto Select */}
            <div className="p-6 rounded-2xl bg-lilac/5 border border-lilac/10 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-[10px] font-black uppercase text-lilac tracking-widest">Produtos Selecionados</h4>
                <div className="text-[10px] font-black text-black">Ateliê: {selectedAtelier.toUpperCase()}</div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <select 
                  onChange={(e) => {
                    const p = products.find(prod => prod.id === e.target.value);
                    if (p) {
                      const existingIdx = items.findIndex(i => i.id === p.id);
                      if (existingIdx !== -1) {
                        const newItems = [...items];
                        newItems[existingIdx].quantity = (newItems[existingIdx].quantity || 1) + 1;
                        setItems(newItems);
                      } else {
                        setItems([...items, { ...p, quantity: 1 }]);
                      }
                    }
                    e.target.value = "";
                  }}
                  className="w-full bg-white border border-lilac/20 rounded-xl px-4 py-3 text-[11px] font-bold outline-none"
                >
                  <option value="">+ Adicionar Produto do Catálogo...</option>
                  {products.filter(p => p.company === selectedAtelier).map((p, pIdx) => <option key={`prod-opt-${p.id}-${pIdx}`} value={p.id}>{p.product_name} - {formatCurrency(p.retail_price)}</option>)}
                </select>
              </div>

              {items.map((item, idx) => (
                <div key={`edit-cart-item-${item.id || 'new'}-${idx}`} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-lilac/10 shadow-sm">
                   <span className="flex-1 text-[11px] font-bold text-gray-700">{item.product_name}</span>
                   <div className="flex items-center gap-2">
                     <span className="text-[9px] font-bold text-gray-400">QTD:</span>
                     <input 
                      type="number" 
                      value={item.quantity} 
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[idx].quantity = Number(e.target.value);
                        setItems(newItems);
                      }}
                      className="w-16 bg-white border border-lilac/10 rounded-lg px-2 py-1 text-[11px] font-black text-center"
                     />
                   </div>
                   <span className="text-[11px] font-mono font-black text-black w-24 text-right">{formatCurrency((item.retail_price || 0) * (item.quantity || 0))}</span>
                   <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-rose-400 hover:text-rose-600 p-1"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-gray-400 tracking-widest pl-2">Data de Entrega / Evento</label>
                <input name="deliveryDate" defaultValue={editingOrder?.deliveryDate || safeFormat(new Date(), 'yyyy-MM-dd')} required type="date" className="w-full bg-white border border-lilac/20 rounded-xl px-5 py-3 text-[11px] font-bold outline-none text-black" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-gray-400 tracking-widest pl-2">Status Inicial</label>
                <select name="status" defaultValue={editingOrder?.status || 'novo pedido'} className="w-full bg-white border border-lilac/20 rounded-xl px-5 py-3 text-[11px] font-black outline-none text-black">
                  <option value="novo pedido" className="text-purple-500">NOVO PEDIDO</option>
                  <option value="quote" className="text-gray-500">ORÇAMENTO</option>
                  <option value="approval" className="text-indigo-500">APROVAÇÃO DA ARTE</option>
                  <option value="waiting_deposit" className="text-amber-500">AGUARDANDO SINAL</option>
                  <option value="production" className="text-blue-500">EM PRODUÇÃO</option>
                  <option value="assembly" className="text-pink-500">EM MONTAGEM</option>
                  <option value="ready" className="text-emerald-500">PRONTO PARA ENTREGA</option>
                  <option value="delivered" className="text-black">ENTREGUE</option>
                  <option value="cancelled" className="text-rose-500">CANCELADO</option>
                </select>
              </div>
            </div>

            {/* Checkcards for Payment/Delivery */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div 
                 onClick={() => setIsWholesale(!isWholesale)}
                 className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${isWholesale ? 'bg-amber-50 border-amber-500' : 'bg-white border-lilac/10 text-gray-400'}`}
               >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isWholesale ? 'bg-amber-500 border-amber-500' : 'border-gray-200'}`}>
                    {isWholesale && <CheckCircle className="text-white" size={12} />}
                  </div>
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isWholesale ? 'text-amber-700' : ''}`}>Pedido de Atacado</p>
                    <p className={`text-[8px] font-bold ${isWholesale ? 'text-amber-600' : ''}`}>Aplica aviso de atacado no comprovante</p>
                  </div>
               </div>

               <div 
                onClick={() => setIsDepositPaid(!isDepositPaid)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${isDepositPaid ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-lilac/10 text-gray-400'}`}
               >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isDepositPaid ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200'}`}>
                    {isDepositPaid && <CheckCircle className="text-white" size={12} />}
                  </div>
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isDepositPaid ? 'text-emerald-700' : ''}`}>Sinal Pago (50%)</p>
                    <p className={`text-[9px] font-bold ${isDepositPaid ? 'text-emerald-600' : ''}`}>{formatCurrency(depositValue || 0)}</p>
                  </div>
               </div>
               
               <div className="p-4 rounded-xl border border-lilac/10 bg-black text-white flex justify-between items-center">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Total a Pagar</p>
                    <p className="text-lg font-mono font-black">{formatCurrency(totalWithShipping || 0)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-bold text-gray-400">{isDepositPaid ? 'Restante' : 'Subtotal'}</p>
                    <p className="text-[11px] font-mono font-black text-lilac">{formatCurrency((isDepositPaid ? totalWithShipping - depositValue : totalWithShipping) || 0)}</p>
                  </div>
               </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-black text-gray-400 tracking-widest pl-2">Observações do Pedido</label>
              <textarea 
                value={observations} 
                onChange={(e) => setObservations(e.target.value)}
                className="w-full bg-white border border-lilac/20 rounded-xl px-5 py-3 text-[11px] font-bold outline-none h-24 text-black resize-none" 
                placeholder="Ex regular: Tamanho M, Cor Rosa, Nome Julia..." 
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={onClose} disabled={loading} className="flex-1 py-4 border border-lilac/10 rounded-xl font-bold uppercase text-[10px] tracking-widest text-gray-400 hover:bg-white transition-all">Cancelar</button>
              <button type="submit" disabled={loading} className="flex-1 py-4 bg-black text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] shadow-xl transition-all disabled:opacity-50">
                {loading ? 'Salvando...' : 'Salvar Pedido'}
              </button>
            </div>
          </form>
       </div>
    </div>
  );
};
