'use client';

import React from 'react';
import { Category } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Leaf, Search } from 'lucide-react';

interface StoreFilterBarProps {
  categories: Category[];
  activeCategory: string;
  fastingOnly: boolean;
  searchQuery: string;
  onSelectCategory: (id: string) => void;
  onToggleFasting: () => void;
  onSearchChange: (query: string) => void;
  getText: (field: any) => string;
}

export function StoreFilterBar({
  categories,
  activeCategory,
  fastingOnly,
  searchQuery,
  onSelectCategory,
  onToggleFasting,
  onSearchChange,
  getText,
}: StoreFilterBarProps) {
  return (
    <section className="sticky top-[69px] z-30 border-y border-white/5 bg-[#0F1015]/95 px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Button
            type="button"
            size="sm"
            variant={activeCategory === 'all' && !fastingOnly ? 'default' : 'outline'}
            onClick={() => onSelectCategory('all')}
            className={`whitespace-nowrap rounded-xl px-5 text-xs font-extrabold uppercase tracking-wider ${
              activeCategory === 'all' && !fastingOnly
                ? 'bg-[#F59E0B] text-[#0F1015]'
                : 'border-white/5 bg-[#171821] text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            All Items
          </Button>
          {categories.map((c) => {
            const isSelected = activeCategory === c._id && !fastingOnly;
            return (
              <Button
                key={c._id}
                type="button"
                size="sm"
                variant={isSelected ? 'default' : 'outline'}
                onClick={() => onSelectCategory(c._id)}
                className={`whitespace-nowrap rounded-xl px-5 text-xs font-extrabold uppercase tracking-wider ${
                  isSelected
                    ? 'bg-[#F59E0B] text-[#0F1015]'
                    : 'border-white/5 bg-[#171821] text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {c.icon && <span className="mr-1.5">{c.icon}</span>}
                {getText(c.name)}
              </Button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onToggleFasting}
            className={`flex items-center gap-1.5 rounded-xl px-4 text-xs font-bold ${
              fastingOnly
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                : 'border-white/5 bg-[#171821] text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <Leaf className="h-3.5 w-3.5 text-emerald-400" />
            <span>የጾም (Vegan)</span>
          </Button>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]" />
            <Input
              type="text"
              placeholder="Search dish..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-36 sm:w-44 rounded-xl border-white/10 bg-[#171821] py-1.5 pl-9 pr-3 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:border-[#F59E0B]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
