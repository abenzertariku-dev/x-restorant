'use client';

import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MenuItem } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { formatETB } from '@/lib/format';

interface DishCardProps {
  item: MenuItem;
  onToggleStock: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit: (item: MenuItem) => void;
}

export function DishCard({ item, onToggleStock, onDelete, onEdit }: DishCardProps) {
  const { getText } = useLanguage();

  return (
    <Card className="group flex flex-col justify-between overflow-hidden p-4 shadow-sm transition-all hover:border-[#F59E0B]/40 hover:bg-[#F8FAFC]">
      <div>
        <div className="relative mb-3 flex h-44 w-full items-center justify-center overflow-hidden rounded-xl bg-[#F8FAFC]">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.imageUrl}
              alt={item.name.en}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="text-4xl">🍽️</span>
          )}
          <div className="absolute bottom-2.5 right-2.5 rounded-lg border border-slate-200 bg-[#F6F7F9]/90 px-3 py-1 font-mono text-xs font-black text-[#B45309] shadow-lg backdrop-blur-md">
            {formatETB(item.price)}
          </div>
          {!item.isAvailable && (
            <span className="absolute left-2.5 top-2.5 rounded-lg border border-rose-500/40 bg-rose-500/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
              Sold Out
            </span>
          )}
        </div>

        <h4 className="text-sm font-extrabold text-[#0F172A]">{getText(item.name)}</h4>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#64748B]">
          {getText(item.description)}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
          {item.isFasting && <Badge variant="success">የጾም (Vegan)</Badge>}
          {item.spiceLevel && item.spiceLevel !== 'None' && (
            <Badge variant="destructive">{item.spiceLevel}</Badge>
          )}
          {item.prepTimeMinutes ? (
            <Badge variant="secondary">{item.prepTimeMinutes} min</Badge>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
        <button
          type="button"
          onClick={() => onToggleStock(item._id)}
          className={`cursor-pointer rounded-full px-3 py-1 text-xs font-bold transition ${
            item.isAvailable
              ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
              : 'border border-slate-200 bg-slate-100 text-[#64748B] hover:bg-slate-200'
          }`}
        >
          {item.isAvailable ? 'In Stock' : 'Out of Stock'}
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="cursor-pointer rounded-lg p-2 text-[#64748B] transition hover:bg-[#F59E0B]/10 hover:text-[#B45309]"
            title="Edit dish"
          >
            <Pencil className="h-4 w-4" />
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(item._id)}
              className="cursor-pointer rounded-lg p-2 text-[#64748B] transition hover:bg-rose-500/10 hover:text-rose-600"
              title="Delete dish"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
