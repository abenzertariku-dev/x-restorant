'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BilingualText, Category, RestaurantSetting } from '@/types';
import { UtensilsCrossed, Globe, ShoppingBag, Lock } from 'lucide-react';

interface StoreNavbarProps {
  settings: RestaurantSetting | null;
  categories: Category[];
  activeCategory: string;
  fastingOnly: boolean;
  totalCount: number;
  language: string;
  onSelectCategory: (id: string) => void;
  onToggleFasting: () => void;
  onToggleLanguage: () => void;
  onOpenCheckout: () => void;
  getText: (field?: Partial<BilingualText> | null) => string;
}

export function StoreNavbar({
  settings,
  categories,
  activeCategory,
  fastingOnly,
  totalCount,
  language,
  onSelectCategory,
  onToggleFasting,
  onToggleLanguage,
  onOpenCheckout,
  getText,
}: StoreNavbarProps) {
  return (
    <header className="sticky top-0 z-40 h-[68px] border-b border-slate-200 bg-[#FFFFFF]/90 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="group flex min-w-0 items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F59E0B] text-[#0F1015] shadow-sm transition group-hover:scale-105">
            <UtensilsCrossed className="h-5 w-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-extrabold tracking-tight text-[#0F172A] sm:text-lg">
              {getText(settings?.name) || 'X-RESTORANT'}
            </h1>
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#B45309]">
              <span className="h-1.5 w-1.5 shrink-0 animate-ping rounded-full bg-emerald-400" />
              <span className="truncate">Fine Dining &amp; Delivery</span>
            </span>
          </div>
        </Link>

        {/* Center Category Nav Tabs */}
        <nav className="hidden items-center gap-4 text-xs font-bold uppercase tracking-wider lg:flex xl:gap-6">
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className={`transition pb-1 ${
              activeCategory === 'all' && !fastingOnly
                ? 'text-[#B45309] border-b-2 border-[#F59E0B] font-extrabold'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            PROMOTIONS
          </button>
          {categories.slice(0, 4).map((c) => (
            <button
              key={c._id}
              type="button"
              onClick={() => onSelectCategory(c._id)}
              className={`max-w-[9rem] truncate transition pb-1 ${
                activeCategory === c._id && !fastingOnly
                  ? 'text-[#B45309] border-b-2 border-[#F59E0B] font-extrabold'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {getText(c.name)}
            </button>
          ))}
          <button
            type="button"
            onClick={onToggleFasting}
            className={`transition pb-1 ${
              fastingOnly
                ? 'text-emerald-600 border-b-2 border-emerald-400 font-extrabold'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            የጾም (VEGAN)
          </button>
        </nav>

        {/* Right Action Icons */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggleLanguage}
            aria-label="Switch language"
            className="border-slate-200 bg-[#F1F5F9] px-1.5 text-xs font-bold text-[#334155] hover:border-[#F59E0B] hover:text-[#0F172A] sm:px-3"
          >
            <Globe className="h-3.5 w-3.5 text-[#B45309] sm:mr-1.5" />
            <span className="hidden sm:inline">{language === 'en' ? 'አማርኛ' : 'EN'}</span>
            <span className="sm:hidden">{language === 'en' ? 'አ' : 'EN'}</span>
          </Button>

          <Link href="/login">
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label="Staff portal"
              className="border-slate-200 bg-[#F1F5F9] px-2 text-xs font-bold text-[#334155] hover:border-[#F59E0B] hover:text-[#0F172A] sm:px-3"
            >
              <Lock className="h-3.5 w-3.5 text-[#B45309] sm:mr-1.5" />
              <span className="hidden sm:inline">Staff Portal</span>
            </Button>
          </Link>

          {totalCount > 0 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onOpenCheckout}
              aria-label={`Open cart, ${totalCount} items`}
              className="relative h-8 w-8 border-[#F59E0B] bg-[#F59E0B]/10 text-[#B45309] hover:bg-[#F59E0B]/20"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#F59E0B] text-[10px] font-black text-[#0F1015]">
                {totalCount}
              </span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
