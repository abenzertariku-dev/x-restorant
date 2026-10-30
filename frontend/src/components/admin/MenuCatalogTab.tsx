'use client';

import React from 'react';
import { Search, Plus } from 'lucide-react';
import { DishCard } from './DishCard';
import { Input } from '@/components/ui/input';
import { Category, MenuItem } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface MenuCatalogTabProps {
  categories: Array<Category & { items: MenuItem[] }>;
  selectedCatId: string;
  setSelectedCatId: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onToggleStock: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit: (item: MenuItem) => void;
  onOpenAddModalForCategory: (categoryId: string) => void;
}

export function MenuCatalogTab({
  categories,
  selectedCatId,
  setSelectedCatId,
  searchQuery,
  setSearchQuery,
  onToggleStock,
  onDelete,
  onEdit,
  onOpenAddModalForCategory,
}: MenuCatalogTabProps) {
  const { getText } = useLanguage();

  const totalDishesCount = categories.reduce(
    (acc, c) => acc + (c.items?.length || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Category Filter Tabs & Real-Time Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCatId('all')}
            className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              selectedCatId === 'all'
                ? 'bg-[#F59E0B] text-[#0F1015] shadow-md shadow-amber-500/20'
                : 'border border-slate-200 bg-[#FFFFFF] text-[#64748B] hover:border-slate-200 hover:text-[#0F172A]'
            }`}
          >
            All Items ({totalDishesCount})
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCatId(cat._id)}
              className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                selectedCatId === cat._id
                  ? 'bg-[#F59E0B] text-[#0F1015] shadow-md shadow-amber-500/20'
                  : 'border border-slate-200 bg-[#FFFFFF] text-[#64748B] hover:border-slate-200 hover:text-[#0F172A]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{getText(cat.name)}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] ${
                  selectedCatId === cat._id
                    ? 'bg-black/10 text-[#0F1015]'
                    : 'bg-slate-200 text-[#64748B]'
                }`}
              >
                {cat.items?.length || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Live Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
          <Input
            type="text"
            placeholder="Search dishes or ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
      </div>

      {/* Categorized Dishes Responsive Grid */}
      {categories
        .filter((cat) => selectedCatId === 'all' || cat._id === selectedCatId)
        .map((cat) => {
          const filteredItems = (cat.items || []).filter((item) => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            const en = (item.name?.en || '').toLowerCase();
            const am = (item.name?.am || '').toLowerCase();
            const desc = (
              item.description?.en ||
              item.description?.am ||
              ''
            ).toLowerCase();
            return en.includes(q) || am.includes(q) || desc.includes(q);
          });

          if (searchQuery.trim() && filteredItems.length === 0) return null;

          return (
            <div key={cat._id} className="space-y-4">
              {/* Category Section Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{cat.icon}</span>
                  <h3 className="text-base font-extrabold text-[#0F172A]">
                    {getText(cat.name)}
                  </h3>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-[#64748B]">
                    {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <button
                  onClick={() => onOpenAddModalForCategory(cat._id)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#B45309] hover:text-[#B45309] transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Add to {getText(cat.name)}</span>
                </button>
              </div>

              {/* Responsive Grid */}
              <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
                {filteredItems.map((it) => (
                  <DishCard
                    key={it._id}
                    item={it}
                    onToggleStock={onToggleStock}
                    onDelete={onDelete}
                    onEdit={onEdit}
                  />
                ))}

                {/* Quick Add Dish Dashed Card */}
                <button
                  onClick={() => onOpenAddModalForCategory(cat._id)}
                  className="flex flex-col items-center justify-center min-h-[260px] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-[#64748B] transition-all hover:border-[#F59E0B]/50 hover:bg-[#F59E0B]/5 hover:text-[#B45309] group cursor-pointer"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-[#64748B] transition group-hover:bg-[#F59E0B] group-hover:text-[#0F1015]">
                    <Plus className="h-6 w-6 stroke-[2.2]" />
                  </div>
                  <span className="mt-3 text-xs font-bold">Add Dish to {getText(cat.name)}</span>
                  <span className="mt-1 text-[11px] text-[#94A3B8]">Set pricing, photo & spice</span>
                </button>
              </div>
            </div>
          );
        })}
    </div>
  );
}
