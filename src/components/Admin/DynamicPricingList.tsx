import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check } from 'lucide-react';

interface ListItem {
  id: string;
  name: string;
  value: number;
}

interface DynamicPricingListProps {
  title: string;
  subtitle: string;
  items: ListItem[];
  onChange: (items: ListItem[]) => void;
  isPercentage?: boolean;
}

export const DynamicPricingList: React.FC<DynamicPricingListProps> = ({ title, subtitle, items = [], onChange, isPercentage }) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemValue, setNewItemValue] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newItemName || !newItemValue) return;
    onChange([
      ...items,
      { id: crypto.randomUUID(), name: newItemName, value: Number(newItemValue) }
    ]);
    setNewItemName('');
    setNewItemValue('');
  };

  const handleRemove = (id: string) => {
    onChange(items.filter(i => i.id !== id));
  };

  const handleUpdate = (id: string, newName: string, newValue: number) => {
    onChange(items.map(i => i.id === id ? { ...i, name: newName, value: newValue } : i));
    setEditingId(null);
  };

  const total = items.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

  return (
    <div className="p-8 rounded-[2rem] bg-gray-50 border border-lilac/10 space-y-6">
      <div className="space-y-1">
        <h4 className="text-[12px] font-black uppercase text-gray-600 tracking-widest">{title}</h4>
        <p className="text-[9px] font-bold text-gray-400">{subtitle}</p>
      </div>

      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-lilac/5">
            {editingId === item.id ? (
              <>
                <input 
                  type="text" 
                  defaultValue={item.name}
                  className="flex-1 bg-gray-50 border-none rounded-lg px-3 py-2 text-xs font-bold text-black outline-none"
                  onBlur={(e) => handleUpdate(item.id, e.target.value, item.value)}
                  autoFocus
                />
                <input 
                  type="number" 
                  defaultValue={item.value}
                  className="w-24 bg-gray-50 border-none rounded-lg px-3 py-2 text-xs font-bold text-black outline-none"
                  onBlur={(e) => handleUpdate(item.id, item.name, Number(e.target.value))}
                />
                <button onClick={() => setEditingId(null)} className="p-2 text-green-500 hover:bg-green-50 rounded-lg">
                  <Check size={14} />
                </button>
              </>
            ) : (
              <>
                <div className="flex-1">
                  <span className="text-xs font-bold text-black block">{item.name}</span>
                </div>
                <div className="font-mono text-xs font-bold text-gray-600">
                  {!isPercentage && 'R$'} {item.value} {isPercentage && '%'}
                </div>
                <button onClick={() => setEditingId(item.id)} className="p-2 text-gray-400 hover:text-blue-500">
                  <Edit2 size={12} />
                </button>
                <button onClick={() => handleRemove(item.id)} className="p-2 text-gray-400 hover:text-red-500">
                  <Trash2 size={12} />
                </button>
              </>
            )}
          </div>
        ))}
        
        {items.length === 0 && (
          <div className="text-center p-4 text-[10px] text-gray-400 font-bold border border-dashed rounded-xl">
            Nenhum item cadastrado.
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <input 
            type="text"
            placeholder="Nome (Ex: Aluguel)"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold outline-none text-black"
          />
          <input 
            type="number"
            placeholder={isPercentage ? "Valor %" : "R$"}
            value={newItemValue}
            onChange={(e) => setNewItemValue(e.target.value)}
            className="w-28 bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold outline-none text-black"
          />
          <button 
            onClick={handleAdd}
            className="p-3 bg-black text-white rounded-xl hover:scale-105 transition-all shadow-md"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="pt-4 flex justify-between items-center text-xs font-black uppercase tracking-widest text-black">
        <span>Total:</span>
        <span className="text-lilac">{!isPercentage && 'R$'} {total} {isPercentage && '%'}</span>
      </div>
    </div>
  );
};
