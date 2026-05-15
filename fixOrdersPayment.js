import fs from 'fs';

let content = fs.readFileSync('src/components/Admin/OrdersTab.tsx', 'utf8');

if (!content.includes('paymentStatusFilter')) {
  // Add state for paymentStatusFilter
  content = content.replace(
    /const \[selectedAtelier, setSelectedAtelier\] = useState<CompanyId \| 'all'>\('all'\);/,
    "const [selectedAtelier, setSelectedAtelier] = useState<CompanyId | 'all'>('all');\n  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');"
  );
  
  // Add to filtering logic
  content = content.replace(
    /const matchesAtelier = selectedAtelier === 'all' \? true : o\.companyId === selectedAtelier;\n    return matchesSearch && matchesAtelier;/,
    "const matchesAtelier = selectedAtelier === 'all' ? true : o.companyId === selectedAtelier;\n    const matchesPayment = paymentStatusFilter === 'all' ? true : (o.paymentStatus === paymentStatusFilter || (!o.paymentStatus && paymentStatusFilter === 'pending'));\n    return matchesSearch && matchesAtelier && matchesPayment;"
  );
  
  // Add UI for the filter
  const filterUI = `
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {[
            { id: 'all', label: 'TODOS' },
            { id: 'pending', label: 'PENDENTE' },
            { id: 'paid', label: 'PAGO' },
            { id: 'partial', label: 'PARCIAL' },
            { id: 'cancelled', label: 'CANCELADO' },
            { id: 'refunded', label: 'REEMBOLSADO' }
          ].map(st => (
            <button 
              key={st.id}
              onClick={() => setPaymentStatusFilter(st.id)}
              className={\`px-4 py-2 rounded-lg border text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap \${paymentStatusFilter === st.id ? 'bg-black text-white border-black shadow-md' : 'bg-white text-gray-400 border-lilac/20 hover:border-lilac'}\`}
            >
              {st.label}
            </button>
          ))}
        </div>
        <button 
  `;
  content = content.replace(
    /<\/div>\s*<button \s*onClick=\{\(\) => \{ setEditingOrder/m,
    `</div>\n${filterUI}\n        onClick={() => { setEditingOrder`
  );

  // Add the payment_status field in the Details expanded view or Modal
  // Let's add it to the edit modal. Let's find the status select.
  // Wait, I can just create a select for payment status below the status select.
  const modalStatusSelectIdx = content.indexOf('<option value="novo pedido">NOVO PEDIDO</option>');
  if (modalStatusSelectIdx !== -1) {
    // Find the enclosing select block
    const editStatusBlockEnd = content.indexOf('</select>', modalStatusSelectIdx) + 9;
    const newSelectBlock = `
                 <div className="space-y-3">
                   <label className="text-[10px] uppercase font-black text-gray-400 ml-2">Status de Pagamento</label>
                   <select 
                     value={editingOrder?.paymentStatus || 'pending'}
                     onChange={(e) => setEditingOrder({ ...editingOrder, paymentStatus: e.target.value as any })}
                     className="w-full bg-gray-50 border border-lilac/20 rounded-xl px-5 py-3 text-[11px] font-bold outline-none text-black cursor-pointer uppercase"
                   >
                     <option value="pending">PENDENTE</option>
                     <option value="paid">PAGO</option>
                     <option value="partial">PARCIAL</option>
                     <option value="cancelled">CANCELADO</option>
                     <option value="refunded">REEMBOLSADO</option>
                   </select>
                 </div>
`;
    // inject after the `</div>` closing the status select block.
    // Let's do it via regex.
    const regexStatus = /(<label className="text-\[10px\] uppercase font-black text-gray-400 ml-2">Status do Pedido<\/label>[\s\S]*?<\/select>\s*<\/div>)/;
    content = content.replace(regexStatus, `$1\n${newSelectBlock}`);
  }

  // Also add it in the details view
  const rightColumnDetails = /(<h4 className="text-\[9px\] font-black uppercase text-gray-400 tracking-widest mb-4">Ações Rápidas<\/h4>)/;
  const paymentBadge = `
                        <div className="mb-6 flex gap-2 items-center">
                          <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Pagamento:</span>
                          <span className={\`px-2 py-1 rounded text-[8px] font-black uppercase border \${
                            order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-600 border-emerald-200' :
                            order.paymentStatus === 'cancelled' ? 'bg-rose-100 text-rose-600 border-rose-200' :
                            order.paymentStatus === 'partial' ? 'bg-amber-100 text-amber-600 border-amber-200' :
                            order.paymentStatus === 'refunded' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                            'bg-yellow-100 text-yellow-600 border-yellow-200'
                          }\`}>
                            {order.paymentStatus || 'PENDENTE'}
                          </span>
                        </div>
  `;
  content = content.replace(rightColumnDetails, `${paymentBadge}\n$1`);
  
  // also visible in the list:
  const middleBadges = /({\/\* Middle: Status & Alerts \*\/}[\s\S]*?<span className=\{\`px-4 py-1\.5 rounded-full text-\[9px\] font-black tracking-widest border uppercase \$\{currentStatus\?\.color \|\| 'bg-gray-100'\}\`\}>\s*\{currentStatus\?\.label \|\| order\.status\}\s*<\/span>\s*<\/div>)/;

  const listBadge = `
                   <span className={\`px-3 py-1.5 rounded-full text-[8px] font-black tracking-widest border uppercase \${
                            order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-600 border-emerald-200' :
                            order.paymentStatus === 'cancelled' ? 'bg-rose-100 text-rose-600 border-rose-200' :
                            order.paymentStatus === 'partial' ? 'bg-amber-100 text-amber-600 border-amber-200' :
                            order.paymentStatus === 'refunded' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                            'bg-yellow-100 text-yellow-600 border-yellow-200'
                          }\`}>
                     {order.paymentStatus === 'paid' ? 'PAGO' : order.paymentStatus === 'partial' ? 'PARCIAL' : order.paymentStatus === 'cancelled' ? 'CANC' : order.paymentStatus === 'refunded' ? 'REEM' : 'PENDENTE'}
                   </span>
`;
  // Let's inject inside the `<div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-center md:justify-start">`
  content = content.replace(middleBadges, `$1${listBadge}`);

  fs.writeFileSync('src/components/Admin/OrdersTab.tsx', content);
  console.log('done orders payment filter');
}

