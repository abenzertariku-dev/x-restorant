'use client';

import React from 'react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Order } from '@/types';

interface ReceiptModalProps {
  order: Order | null;
  onClose: () => void;
}

export function ReceiptModal({ order, onClose }: ReceiptModalProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <Card className="w-full max-w-sm rounded-3xl border-white/10 p-6 text-[#F8FAFC] shadow-2xl">
        <div className="border-b border-dashed border-white/10 pb-3 text-center">
          <h3 className="text-xl font-black text-[#F8FAFC]">ABYSSINIA RESTAURANT</h3>
          <p className="text-xs text-[#94A3B8]">Bole Road, Addis Ababa · TIN: 0048921098</p>
          <p className="mt-1 text-xs font-bold text-emerald-400">
            OFFICIAL FISCAL RECEIPT / ደረሰኝ
          </p>
        </div>

        <div className="my-3 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-[#94A3B8]">Receipt #:</span>
            <span className="font-mono font-bold text-[#F8FAFC]">REC-{order.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#94A3B8]">Payment:</span>
            <span className="font-bold uppercase text-[#F8FAFC]">{order.payment?.method}</span>
          </div>
          {order.payment?.referenceCode && (
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Ref Code:</span>
              <span className="font-mono font-bold text-[#F59E0B]">
                {order.payment.referenceCode}
              </span>
            </div>
          )}
        </div>

        <div className="border-y border-dashed border-white/10 py-2.5 my-2 space-y-1.5">
          {order.items.map((it, idx) => (
            <div key={idx} className="flex justify-between text-xs">
              <span className="text-[#CBD5E1]">
                {it.qty}× {it.name.en}
              </span>
              <span className="font-mono font-bold text-[#F8FAFC]">
                {it.price * it.qty} ETB
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between py-2 text-base font-black">
          <span>TOTAL PAID:</span>
          <span className="text-emerald-400 font-mono text-lg">{order.totalAmount} ETB</span>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-1.5 uppercase tracking-wider"
          >
            <Printer className="h-4 w-4" /> Print Receipt
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}
