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
    <Card className="group flex flex-col justify-between overflow-hidden rounded-2xl border-white/5 bg-[#171821] p-5 shadow-sm transition duration-150 hover:-translate-y-0.5 hover:border-[#F59E0B]/40">
      <div>
        <div className="relative mb-4 flex h-44 w-full items-center justify-center overflow-hidden rounded-xl bg-[#14151D]">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name.en}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-5xl">🍔</span>
              <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                Fresh Preparation
              </span>
            </div>
          )}

          <div className="absolute bottom-2.5 right-2.5 rounded-md bg-[#0F1015]/90 px-3 py-1 text-xs font-black text-[#F59E0B] border border-white/10 backdrop-blur-sm">
            {item.price} ETB
          </div>
        </div>

        <h3 className="text-base font-extrabold text-[#F8FAFC] group-hover:text-[#F59E0B] transition">
          {getText(item.name)}
        </h3>

        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#94A3B8]">
          {getText(item.description)}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.isFasting && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[10px]"
            >
              <Leaf className="h-3 w-3" /> የጾም (Vegan)
            </Badge>
          )}
          {item.spiceLevel !== 'None' && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 border-rose-500/20 bg-rose-500/10 text-rose-400 text-[10px]"
            >
              <Flame className="h-3 w-3" /> {item.spiceLevel}
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3.5">
        <span className="text-[11px] font-bold text-[#64748B]">
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
                className="h-7 w-7 rounded-full bg-[#1A1B24] text-[#F8FAFC] hover:bg-[#242634] active:scale-90"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="w-4 text-center text-xs font-black text-[#F59E0B]">
                {quantity}
              </span>
              <Button
                type="button"
                size="icon"
                onClick={() => onUpdateQuantity(1)}
                className="h-7 w-7 rounded-full bg-[#F59E0B] text-[#0F1015] hover:bg-[#D97706] active:scale-90 shadow-sm"
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
          <span className="text-xs font-bold text-[#64748B]">Unavailable</span>
        )}
      </div>
    </Card>
  );
}
