'use client';

import React, { useState } from 'react';
import { X, Send, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatETB } from '@/lib/format';
import { useLanguage } from '@/context/LanguageContext';

export interface TableOrderLine {
  id: string;
  name: string;
  price: number;
  qty: number;
}

interface TableSendModalProps {
  isOpen: boolean;
  tableNumber: string;
  lines: TableOrderLine[];
  totalPrice: number;
  busy: boolean;
  onClose: () => void;
  onSubmit: (data: { guestName: string; notes: string }) => Promise<void>;
}

export function TableSendModal({
  isOpen,
  tableNumber,
  lines,
  totalPrice,
  busy,
  onClose,
  onSubmit,
}: TableSendModalProps) {
  const { t, getText } = useLanguage();
  const [guestName, setGuestName] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm sm:items-center sm:p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({ guestName: guestName.trim(), notes: notes.trim() });
        }}
        className="my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-slate-200 bg-[#FFFFFF] p-5 text-[#334155] shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:p-6"
      >
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#B45309]">
              Table #{tableNumber}
            </p>
            <h3 className="mt-0.5 text-xl font-black text-[#0F172A]">Review your order</h3>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="my-4 max-h-40 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-[#FFFFFF] p-3">
          {lines.map((line) => (
            <div key={line.id} className="flex justify-between text-xs">
              <span className="text-[#334155]">
                {line.qty} × {line.name}
              </span>
              <span className="font-mono text-[#64748B]">{formatETB(line.price * line.qty)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black text-[#0F172A]">
            <span>{t('total')}</span>
            <span className="text-[#B45309]">{formatETB(totalPrice)}</span>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              {t('fullName')} ({t('optional')})
            </label>
            <Input
              placeholder="Name on the order"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="border-slate-200 bg-[#FFFFFF] text-xs text-[#0F172A] placeholder-[#94A3B8] focus:border-[#F59E0B]"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              {t('notes')} / {t('specialInstructions')}
            </label>
            <Textarea
              placeholder="Allergies, spice preference, no onions…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="border-slate-200 bg-[#FFFFFF] text-xs text-[#0F172A] placeholder-[#94A3B8] focus:border-[#F59E0B]"
            />
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <Button
            type="submit"
            disabled={busy}
            className="flex-1 rounded-full bg-[#F59E0B] py-3.5 text-xs font-black uppercase tracking-wider text-[#0F1015] hover:bg-[#FBBF24] disabled:opacity-50"
          >
            <Send className="mr-1.5 h-4 w-4" />
            {busy ? 'Sending…' : t('sendToKitchen')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-slate-100 px-5 text-xs font-bold text-[#64748B] hover:text-[#0F172A]"
          >
            {t('cancel')}
          </Button>
        </div>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[10px] text-[#94A3B8]">
          <UtensilsCrossed className="h-3 w-3" />
          {getText({ en: 'Your waiter will confirm the order.', am: 'አስተናጋጅዎ ትዕዛዙን ያረጋግጣል።' })}
        </p>
      </form>
    </div>
  );
}
