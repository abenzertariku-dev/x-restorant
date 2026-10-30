'use client';

import React from 'react';
import { BilingualText, Category } from '@/types';
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
  getText: (field?: Partial<BilingualText> | null) => string;
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
    <section className="sticky top-[68px] z-30 border-y border-slate-200 bg-[#F6F7F9]/95 px-4 py-3 shadow-lg shadow-black/20 backdrop-blur-md sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2.5">
        <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
          <Button
            type="button"
            size="sm"
            variant={activeCategory === 'all' && !fastingOnly ? 'default' : 'outline'}
            onClick={() => onSelectCategory('all')}
            className={`whitespace-nowrap rounded-xl px-5 text-xs font-extrabold uppercase tracking-wider ${
              activeCategory === 'all' && !fastingOnly
                ? 'bg-[#F59E0B] text-[#0F1015]'
                : 'border-slate-200 bg-[#FFFFFF] text-[#64748B] hover:text-[#0F172A]'
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
                    : 'border-slate-200 bg-[#FFFFFF] text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {c.icon && <span className="mr-1.5">{c.icon}</span>}
                {getText(c.name)}
              </Button>
            );
          })}
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onToggleFasting}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-bold sm:px-4 ${
              fastingOnly
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600'
                : 'border-slate-200 bg-[#FFFFFF] text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Leaf className="h-3.5 w-3.5 text-emerald-600" />
            <span>የጾም (Vegan)</span>
          </Button>

          <div className="relative min-w-0 flex-1 sm:flex-none">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="text"
              placeholder="Search dish..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-xl border-slate-200 bg-[#FFFFFF] py-1.5 pl-9 pr-3 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:border-[#F59E0B] sm:w-44"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
