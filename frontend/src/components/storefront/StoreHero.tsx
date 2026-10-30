'use client';

import React from 'react';
import { BilingualText, MenuItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, Bike } from 'lucide-react';

interface StoreHeroProps {
  featuredItem?: MenuItem;
  onOrderNow: (itemId: string) => void;
  getText: (field?: Partial<BilingualText> | null) => string;
}

export function StoreHero({ featuredItem, onOrderNow, getText }: StoreHeroProps) {
  return (
    <section className="relative mx-auto max-w-6xl px-4 pb-8 pt-5 sm:px-6 sm:pt-8 sm:pb-10">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-[#FFFFFF] p-6 shadow-xl sm:p-10 lg:p-12">
        <div className="grid items-center gap-7 lg:grid-cols-12 lg:gap-8">
          <div className="space-y-4 lg:col-span-7">
            <Badge
              variant="warning"
              className="border-[#F59E0B]/30 bg-[#F59E0B]/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[#B45309]"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5 inline" />
              Chef&apos;s Signature Spotlight
            </Badge>

            <div>
              <p className="text-3xl font-black tracking-tight text-[#B45309] sm:text-4xl">
                {featuredItem ? `${featuredItem.price} ETB` : '350 ETB'}
                <span className="mt-1 block text-[10px] font-semibold uppercase tracking-widest text-[#64748B] sm:ml-3 sm:mt-0 sm:inline sm:text-xs">
                  Only for limited time
                </span>
              </p>
              <h2 className="mt-2 break-words text-3xl font-black uppercase tracking-tight text-[#0F172A] sm:text-5xl md:text-6xl">
                {featuredItem ? getText(featuredItem.name) : 'HOUSE BURGER'}
              </h2>
            </div>

            <p className="max-w-xl text-sm leading-relaxed text-[#64748B] sm:text-base">
              {featuredItem
                ? getText(featuredItem.description)
                : 'Handcrafted with prime cuts, aged melted cheddar, crispy caramelized shallots, crisp greens, and authentic Ethiopian spice blend.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              {featuredItem && (
                <Button
                  type="button"
                  size="lg"
                  onClick={() => onOrderNow(featuredItem._id)}
                  className="w-full rounded-full bg-[#F59E0B] px-8 py-6 text-sm font-black uppercase tracking-wider text-[#0F1015] shadow-lg shadow-amber-500/20 hover:bg-[#FBBF24] active:scale-95 sm:w-auto"
                >
                  <span>ORDER NOW</span>
                  <ArrowRight className="ml-2 h-4 w-4 stroke-[2.5]" />
                </Button>
              )}

              <div className="flex items-center gap-2 text-xs font-bold text-[#64748B]">
                <span className="rounded-full bg-[#F1F5F9] p-2.5 border border-slate-200">
                  <Bike className="h-4 w-4 text-[#B45309]" />
                </span>
                <span>Fast Delivery Across Addis Ababa</span>
              </div>
            </div>
          </div>

          <div className="relative mx-auto flex w-full items-center justify-center lg:col-span-5">
            <div className="relative flex h-52 w-52 items-center justify-center rounded-3xl border border-slate-200 bg-[#F1F5F9] p-4 shadow-xl sm:h-72 sm:w-72 lg:h-80 lg:w-80">
              {featuredItem?.imageUrl ? (
                <img
                  src={featuredItem.imageUrl}
                  alt={featuredItem.name.en}
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                <div className="text-center">
                  <span className="text-7xl sm:text-8xl">🍔</span>
                  <p className="mt-3 text-xs font-black uppercase tracking-widest text-[#B45309]">
                    Freshly Prepared
                  </p>
                </div>
              )}

              <div className="absolute -bottom-3 -right-3 rounded-xl bg-[#F59E0B] px-4 py-2 text-xs font-black text-[#0F1015] shadow-lg">
                ★ TOP RATED
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
