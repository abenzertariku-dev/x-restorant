'use client';

import React from 'react';
import { MenuItem, BilingualText } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Leaf, Flame } from 'lucide-react';

interface StoreDishCardProps {
  item: MenuItem;
  quantity: number;
  onUpdateQuantity: (delta: number) => void;
  getText: (field?: Partial<BilingualText> | null) => string;
}

export function StoreDishCard({
  item,
  quantity,
  onUpdateQuantity,
  getText,
}: StoreDishCardProps) {
  return (
    <Card className="group flex flex-col justify-between overflow-hidden rounded-2xl border-slate-200 bg-[#FFFFFF] p-5 shadow-sm transition duration-150 hover:-translate-y-0.5 hover:border-[#F59E0B]/40">
      <div>
        <div className="relative mb-4 flex h-40 w-full items-center justify-center overflow-hidden rounded-xl bg-[#FFFFFF] sm:h-44">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name.en}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-5xl">🍔</span>
              <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                Fresh Preparation
              </span>
            </div>
          )}

          <div className="absolute bottom-2.5 right-2.5 rounded-md bg-[#F6F7F9]/90 px-3 py-1 text-xs font-black text-[#B45309] border border-slate-200 backdrop-blur-sm">
            {item.price} ETB
          </div>
        </div>

        <h3 className="line-clamp-1 text-base font-extrabold text-[#0F172A] transition group-hover:text-[#B45309]">
          {getText(item.name)}
        </h3>

        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#64748B]">
          {getText(item.description)}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.isFasting && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 border-emerald-500/20 bg-emerald-500/10 text-emerald-600 text-[10px]"
            >
              <Leaf className="h-3 w-3" /> የጾም (Vegan)
            </Badge>
          )}
          {item.spiceLevel !== 'None' && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 border-rose-500/20 bg-rose-500/10 text-rose-600 text-[10px]"
            >
              <Flame className="h-3 w-3" /> {item.spiceLevel}
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-3.5">
        <span className="text-[11px] font-bold text-[#94A3B8]">
          {item.isAvailable ? 'Available Now' : 'Out of Stock'}
        </span>

        {item.isAvailable ? (
          quantity > 0 ? (
            <div className="flex items-center gap-2 rounded-full border border-[#F59E0B]/40 bg-[#F59E0B]/10 p-1">
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={() => onUpdateQuantity(-1)}
                aria-label={`Remove one ${getText(item.name)}`}
                className="h-8 w-8 rounded-full bg-[#F1F5F9] text-[#0F172A] hover:bg-[#E2E8F0] active:scale-90 sm:h-7 sm:w-7"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="w-4 text-center text-xs font-black text-[#B45309]">
                {quantity}
              </span>
              <Button
                type="button"
                size="icon"
                onClick={() => onUpdateQuantity(1)}
                aria-label={`Add one ${getText(item.name)}`}
                className="h-8 w-8 rounded-full bg-[#F59E0B] text-[#0F1015] shadow-sm hover:bg-[#D97706] active:scale-90 sm:h-7 sm:w-7"
              >
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={() => onUpdateQuantity(1)}
              className="rounded-full bg-[#F59E0B] px-4 py-2 text-xs font-black uppercase tracking-wider text-[#0F1015] shadow-sm hover:bg-[#FBBF24] active:scale-95"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5 stroke-[2.5]" />
              <span>Add</span>
            </Button>
          )
        ) : (
          <span className="text-xs font-bold text-[#94A3B8]">Unavailable</span>
        )}
      </div>
    </Card>
  );
}
