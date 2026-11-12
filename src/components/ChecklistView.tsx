import React, { useState } from 'react';
import { ChecklistItem, Department } from '../types/kpi';

interface ChecklistViewProps {
  checklistItems: ChecklistItem[];
  onAdd: (item: Omit<ChecklistItem, 'id' | 'createdAt'>) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({ checklistItems, onAdd, onToggle, onDelete }) => {
  const [newItemJudul, setNewItemJudul] = useState('');
  const [newItemDeskripsi, setNewItemDeskripsi] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemJudul.trim()) return;
    onAdd({
      judul: newItemJudul,
      selesai: false,
      bidang: 'Semua', // Default for now
    });
    setNewItemJudul('');
    setNewItemDeskripsi('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Daftar Checklist</h2>
      <form onSubmit={handleSubmit} className="bg-white p-4 border rounded-2xl shadow-sm space-y-3">
        <input
          type="text"
          value={newItemJudul}
          onChange={(e) => setNewItemJudul(e.target.value)}
          placeholder="Judul poin checklist..."
          className="w-full p-2 border rounded-lg"
        />
        <button type="submit" className="w-full px-4 py-2 bg-emerald-700 text-white rounded-lg font-semibold">Tambah Poin</button>
      </form>
      <ul className="space-y-3">
        {checklistItems.map(item => (
          <li key={item.id} className="flex items-start gap-3 p-4 bg-white border rounded-2xl shadow-sm">
            <input type="checkbox" className="mt-1 w-5 h-5 accent-emerald-600" checked={item.selesai} onChange={() => onToggle(item.id)} />
            <div className="flex-1">
              <span className={`font-semibold text-slate-900 ${item.selesai ? 'line-through text-slate-500' : ''}`}>{item.judul}</span>
            </div>
            <button onClick={() => onDelete(item.id)} className="text-rose-600 hover:text-rose-800 text-sm font-medium">Hapus</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
