'use client';

import React from 'react';
import { Printer, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Order, RestaurantSetting } from '@/types';
import { formatDateTime, formatETB, paymentLabel } from '@/lib/format';

interface ReceiptModalProps {
  order: Order | null;
  settings?: RestaurantSetting | null;
  onClose: () => void;
}

export function ReceiptModal({ order, settings, onClose }: ReceiptModalProps) {
  if (!order) return null;

  const splits = order.payment?.splits || [];
  const name = settings?.name?.en || 'ABYSSINIA RESTAURANT';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md no-print">
      <div className="receipt-print w-full max-w-sm rounded-2xl border border-slate-200 bg-[#FFFFFF] p-6 text-[#0F172A] shadow-2xl">
        <div className="border-b border-dashed border-slate-200 pb-3 text-center">
          <h3 className="text-lg font-black uppercase text-[#0F172A]">{name}</h3>
          <p className="receipt-muted text-[11px] text-[#64748B]">
            Addis Ababa, Ethiopia · TIN: 0048921098
          </p>
          <p className="receipt-accent mt-1 text-xs font-black tracking-wide text-emerald-600">
            OFFICIAL FISCAL RECEIPT / ደረሰኝ
          </p>
        </div>

        <div className="my-3 space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span className="receipt-muted text-[#64748B]">Receipt #</span>
            <span className="font-mono font-bold">REC-{order.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="receipt-muted text-[#64748B]">Order</span>
            <span className="font-mono font-bold">#{order.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="receipt-muted text-[#64748B]">Date</span>
            <span className="font-bold">{formatDateTime(order.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="receipt-muted text-[#64748B]">Service</span>
            <span className="font-bold capitalize">
              {order.type === 'dine_in'
                ? `Table ${order.tableNumber}`
                : order.type.replace('_', ' ')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="receipt-muted text-[#64748B]">Guest</span>
            <span className="font-bold">{order.customer?.name || 'Walk-in guest'}</span>
          </div>
          <div className="flex justify-between">
            <span className="receipt-muted text-[#64748B]">Payment</span>
            <span className="font-bold uppercase">
              {splits.length ? `Split (${splits.length})` : paymentLabel(order.payment?.method)}
            </span>
          </div>
          {order.payment?.referenceCode && (
            <div className="flex justify-between">
              <span className="receipt-muted text-[#64748B]">Ref code</span>
              <span className="font-mono font-bold text-[#B45309]">
                {order.payment.referenceCode}
              </span>
            </div>
          )}
        </div>

        <div className="my-2 space-y-1.5 border-y border-dashed border-slate-200 py-2.5">
          {order.items.map((item, index) => (
            <div key={`${item.menuItem}-${index}`} className="flex justify-between gap-2 text-[11px]">
              <span className="text-[#334155]">
                {item.qty}× {item.name.en}
              </span>
              <span className="font-mono font-bold">{formatETB(item.price * item.qty)}</span>
            </div>
          ))}
        </div>

        {splits.length > 0 && (
          <div className="my-2 space-y-1 border-b border-dashed border-slate-200 pb-2.5 text-[10px]">
            <p className="receipt-muted font-bold uppercase text-[#64748B]">Split settlement</p>
            {splits.map((split, index) => (
              <div key={index} className="flex justify-between gap-2">
                <span className="text-[#334155]">
                  {split.guestName || `Guest ${index + 1}`} · {paymentLabel(split.method)}
                  {split.referenceCode ? ` · ${split.referenceCode}` : ''}
                </span>
                <span className="font-mono">{formatETB(split.amount)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between py-2 text-base font-black">
          <span>TOTAL PAID</span>
          <span className="receipt-accent font-mono text-lg text-emerald-600">
            {formatETB(order.totalAmount)}
          </span>
        </div>

        <p className="receipt-muted mt-1 text-center text-[10px] text-[#94A3B8]">
          Thank you for dining with us · እንኳን ደህና መጡ
        </p>

        <div className="mt-4 flex gap-2 no-print">
          <Button
            onClick={() => window.print()}
            className="flex flex-1 items-center justify-center gap-1.5 uppercase tracking-wider"
          >
            <Printer className="h-4 w-4" /> Print Receipt
          </Button>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
