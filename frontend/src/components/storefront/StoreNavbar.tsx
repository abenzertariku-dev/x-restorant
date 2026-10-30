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
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#14151D]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F59E0B] text-[#0F1015] shadow-sm transition group-hover:scale-105">
            <UtensilsCrossed className="h-5 w-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-[#F8FAFC] sm:text-lg">
              {getText(settings?.name) || 'X-RESTORANT'}
            </h1>
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#F59E0B]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              Fine Dining & Delivery
            </span>
          </div>
        </Link>

        {/* Center Category Nav Tabs */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-bold tracking-wider uppercase">
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className={`transition pb-1 ${
              activeCategory === 'all' && !fastingOnly
                ? 'text-[#F59E0B] border-b-2 border-[#F59E0B] font-extrabold'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            PROMOTIONS
          </button>
          {categories.slice(0, 4).map((c) => (
            <button
              key={c._id}
              type="button"
              onClick={() => onSelectCategory(c._id)}
              className={`transition pb-1 ${
                activeCategory === c._id && !fastingOnly
                  ? 'text-[#F59E0B] border-b-2 border-[#F59E0B] font-extrabold'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
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
                ? 'text-emerald-400 border-b-2 border-emerald-400 font-extrabold'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            የጾም (VEGAN)
          </button>
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggleLanguage}
            className="border-white/10 bg-[#1A1B24] text-xs font-bold text-[#CBD5E1] hover:border-[#F59E0B] hover:text-[#F8FAFC]"
          >
            <Globe className="mr-1.5 h-3.5 w-3.5 text-[#F59E0B]" />
            <span>{language === 'en' ? 'አማርኛ' : 'EN'}</span>
          </Button>

          <Link href="/login">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-white/10 bg-[#1A1B24] text-xs font-bold text-[#CBD5E1] hover:border-[#F59E0B] hover:text-[#F8FAFC]"
            >
              <Lock className="mr-1.5 h-3.5 w-3.5 text-[#F59E0B]" />
              <span className="hidden sm:inline">Staff Portal</span>
            </Button>
          </Link>

          {totalCount > 0 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onOpenCheckout}
              className="relative border-[#F59E0B] bg-[#F59E0B]/10 text-[#F59E0B] hover:bg-[#F59E0B]/20"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#F59E0B] text-[10px] font-black text-[#0F1015]">
                {totalCount}
              </span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
