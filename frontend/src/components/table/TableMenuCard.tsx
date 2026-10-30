'use client';

import React from 'react';
import { MenuItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Flame, Leaf, UtensilsCrossed } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { formatETB } from '@/lib/format';

interface TableMenuCardProps {
  item: MenuItem;
  quantity: number;
  onUpdateQuantity: (delta: number) => void;
}

export function TableMenuCard({ item, quantity, onUpdateQuantity }: TableMenuCardProps) {
  const { t, getText } = useLanguage();

  return (
    <Card className="border-slate-200 bg-[#FFFFFF] shadow-sm transition hover:border-[#F59E0B]/40 hover:bg-[#F8FAFC]">
      <CardContent className="flex items-start gap-3 p-3 sm:p-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-[#F8FAFC] sm:h-24 sm:w-24">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.imageUrl}
              alt={getText(item.name)}
              loading="lazy"
              decoding="async"
              className={`h-full w-full object-cover ${item.isAvailable ? '' : 'opacity-50 grayscale'}`}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-[#94A3B8]">
              <UtensilsCrossed className="h-6 w-6" />
              <span className="text-[8px] font-bold uppercase tracking-wider">No photo</span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="text-sm font-bold text-[#0F172A]">{getText(item.name)}</h3>
            {item.isFasting && (
              <Badge variant="success" className="gap-0.5 px-1.5 py-0 text-[9px]">
                <Leaf className="h-2.5 w-2.5" /> {t('fasting')}
              </Badge>
            )}
            {item.spiceLevel && item.spiceLevel !== 'None' && (
              <Badge variant="destructive" className="gap-0.5 px-1.5 py-0 text-[9px]">
                <Flame className="h-2.5 w-2.5" /> {item.spiceLevel}
              </Badge>
            )}
          </div>

          {item.description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-[#64748B]">
              {getText(item.description)}
            </p>
          )}

          <div className="mt-2 flex items-end justify-between gap-2">
            <span className="inline-block font-mono text-xs font-black text-[#B45309]">
              {formatETB(item.price)}
            </span>

            {!item.isAvailable ? (
              <span className="shrink-0 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-[#94A3B8]">
                {t('outOfStock')}
              </span>
            ) : quantity > 0 ? (
              <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#F59E0B]/40 bg-[#F59E0B]/15 p-1">
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  onClick={() => onUpdateQuantity(-1)}
                  aria-label={`Remove one ${getText(item.name)}`}
                  className="h-7 w-7 rounded-full bg-[#F1F5F9] text-[#0F172A] hover:bg-[#E2E8F0] active:scale-90"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-5 text-center text-xs font-black text-[#B45309]">
                  {quantity}
                </span>
                <Button
                  type="button"
                  size="icon"
                  onClick={() => onUpdateQuantity(1)}
                  aria-label={`Add one ${getText(item.name)}`}
                  className="h-7 w-7 rounded-full bg-[#F59E0B] text-[#0F1015] hover:bg-[#D97706] active:scale-90"
                >
                  <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={() => onUpdateQuantity(1)}
                aria-label={`Add ${getText(item.name)}`}
                className="shrink-0 rounded-full bg-[#F59E0B] px-3 font-black uppercase text-[#0F1015] hover:bg-[#D97706] sm:px-4"
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> {t('add')}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
