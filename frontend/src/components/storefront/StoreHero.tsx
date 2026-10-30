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
    <section className="relative mx-auto max-w-6xl px-4 pt-8 pb-10 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#171821] p-8 sm:p-12 shadow-xl">
        <div className="grid items-center gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <Badge
              variant="warning"
              className="border-[#F59E0B]/30 bg-[#F59E0B]/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[#F59E0B]"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5 inline" />
              Chef&apos;s Signature Spotlight
            </Badge>

            <div>
              <p className="text-3xl font-black tracking-tight text-[#F59E0B] sm:text-4xl">
                {featuredItem ? `${featuredItem.price} ETB` : '350 ETB'}
                <span className="ml-3 text-xs font-semibold uppercase tracking-widest text-[#94A3B8]">
                  Only for limited time
                </span>
              </p>
              <h2 className="mt-2 text-4xl font-black tracking-tight uppercase text-[#F8FAFC] sm:text-5xl md:text-6xl">
                {featuredItem ? getText(featuredItem.name) : 'HOUSE BURGER'}
              </h2>
            </div>

            <p className="max-w-xl text-sm leading-relaxed text-[#94A3B8] sm:text-base">
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
                  className="rounded-full bg-[#F59E0B] px-8 py-6 text-sm font-black uppercase tracking-wider text-[#0F1015] shadow-lg shadow-amber-500/20 hover:bg-[#FBBF24] active:scale-95"
                >
                  <span>ORDER NOW</span>
                  <ArrowRight className="ml-2 h-4 w-4 stroke-[2.5]" />
                </Button>
              )}

              <div className="flex items-center gap-2 text-xs font-bold text-[#94A3B8]">
                <span className="rounded-full bg-[#1A1B24] p-2.5 border border-white/5">
                  <Bike className="h-4 w-4 text-[#F59E0B]" />
                </span>
                <span>Fast Delivery Across Addis Ababa</span>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center lg:col-span-5">
            <div className="relative flex h-64 w-64 items-center justify-center rounded-3xl border border-white/10 bg-[#1D1E2A] p-4 shadow-xl sm:h-80 sm:w-80">
              {featuredItem?.imageUrl ? (
                <img
                  src={featuredItem.imageUrl}
                  alt={featuredItem.name.en}
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                <div className="text-center">
                  <span className="text-7xl sm:text-8xl">🍔</span>
                  <p className="mt-3 text-xs font-black uppercase tracking-widest text-[#F59E0B]">
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
