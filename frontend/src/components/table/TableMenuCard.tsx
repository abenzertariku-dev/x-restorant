'use client';

import React from 'react';
import { MenuItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';

interface TableMenuCardProps {
  item: MenuItem;
  quantity: number;
  onUpdateQuantity: (delta: number) => void;
  getText: (field: any) => string;
}

export function TableMenuCard({ item, quantity, onUpdateQuantity, getText }: TableMenuCardProps) {
  return (
    <Card className="border-white/5 bg-[#171821] hover:border-[#F59E0B]/40 hover:bg-[#1A1C26] transition shadow-sm">
      <CardContent className="p-4 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-[#F8FAFC] text-sm">{getText(item.name)}</h3>
          {item.description && (
            <p className="line-clamp-1 text-xs text-[#94A3B8] mt-0.5">{getText(item.description)}</p>
          )}
          <span className="mt-1.5 inline-block font-mono text-xs font-black text-[#F59E0B]">
            {item.price} ETB
          </span>
        </div>

        {quantity > 0 ? (
          <div className="flex items-center gap-1.5 rounded-full border border-[#F59E0B]/40 bg-[#F59E0B]/15 p-1">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={() => onUpdateQuantity(-1)}
              className="h-7 w-7 rounded-full bg-[#1E202B] text-[#F8FAFC] hover:bg-[#242634] active:scale-90"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-5 text-center text-xs font-black text-[#F59E0B]">
              {quantity}
            </span>
            <Button
              type="button"
              size="icon"
              onClick={() => onUpdateQuantity(1)}
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
            className="rounded-full bg-[#F59E0B] px-4 font-black uppercase text-[#0F1015] hover:bg-[#D97706] hover:text-[#FFFFFF]"
          >
            Add
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
