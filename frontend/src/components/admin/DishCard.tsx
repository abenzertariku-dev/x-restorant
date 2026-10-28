'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MenuItem } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface DishCardProps {
  item: MenuItem;
  onToggleStock: (id: string) => void;
  onDelete: (id: string) => void;
}

export function DishCard({ item, onToggleStock, onDelete }: DishCardProps) {
  const { getText } = useLanguage();

  return (
    <Card className="flex flex-col justify-between p-4 transition-all hover:border-[#F59E0B]/40 hover:bg-[#1A1C26] shadow-sm group">
      <div>
        {/* Dish Image */}
        <div className="relative mb-3 flex h-44 w-full items-center justify-center overflow-hidden rounded-xl bg-[#12131A]">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name.en}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="text-4xl">🍔</span>
          )}
          <div className="absolute bottom-2.5 right-2.5 rounded-lg bg-[#0F1015]/90 px-3 py-1 font-mono text-xs font-black text-[#F59E0B] border border-white/10 backdrop-blur-md shadow-lg">
            {item.price} ETB
          </div>
        </div>

        <h4 className="font-extrabold text-[#F8FAFC] text-sm">{getText(item.name)}</h4>
        <p className="mt-1 line-clamp-2 text-xs text-[#94A3B8] leading-relaxed">
          {getText(item.description)}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
          {item.isFasting && (
            <Badge variant="success">
              የጾም (Vegan)
            </Badge>
          )}
          {item.spiceLevel && item.spiceLevel !== 'None' && (
            <Badge variant="destructive">
              {item.spiceLevel}
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
        <button
          onClick={() => onToggleStock(item._id)}
          className={`rounded-full px-3 py-1 text-xs font-bold transition cursor-pointer ${
            item.isAvailable
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-white/5 text-[#94A3B8] border border-white/5 hover:bg-white/10'
          }`}
        >
          {item.isAvailable ? 'In Stock' : 'Out of Stock'}
        </button>

        <button
          onClick={() => onDelete(item._id)}
          className="rounded-lg p-2 text-[#94A3B8] hover:bg-rose-500/10 hover:text-rose-400 transition cursor-pointer"
          title="Delete dish"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}
