'use client';

import React from 'react';
import { Receipt } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Order } from '@/types';

interface SettlementDrawerProps {
  selectedOrder: Order | null;
  paymentMethod: 'telebirr' | 'cbe_transfer' | 'cash';
  setPaymentMethod: (m: 'telebirr' | 'cbe_transfer' | 'cash') => void;
  refCode: string;
  setRefCode: (val: string) => void;
  busy: boolean;
  onSettle: (e: React.FormEvent) => void;
  onCancelSelection: () => void;
}

export function SettlementDrawer({
  selectedOrder,
  paymentMethod,
  setPaymentMethod,
  refCode,
  setRefCode,
  busy,
  onSettle,
  onCancelSelection,
}: SettlementDrawerProps) {
  return (
    <Card className="sticky top-6 p-6 shadow-xl border-white/5 bg-[#14151D]">
      <h2 className="text-lg font-black text-[#F8FAFC]">Settlement & Verification</h2>

      {selectedOrder ? (
        <form onSubmit={onSettle} className="mt-4 space-y-4">
          <div className="rounded-xl border border-white/5 bg-[#171821] p-4">
            <div className="flex justify-between text-xs text-[#94A3B8]">
              <span>Target:</span>
              <span className="font-bold text-[#F8FAFC]">
                {selectedOrder.type === 'dine_in'
                  ? `Table ${selectedOrder.tableNumber}`
                  : 'Delivery Order'}
              </span>
            </div>
            <div className="mt-1.5 flex justify-between text-base font-extrabold">
              <span className="text-[#CBD5E1]">Order Total:</span>
              <span className="text-2xl font-mono text-[#F59E0B] font-black">
                {selectedOrder.totalAmount} ETB
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase text-[10px] tracking-wider text-[#94A3B8]">
              Payment Channel
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'telebirr' as const, label: 'Telebirr', icon: '📱' },
                { id: 'cbe_transfer' as const, label: 'CBE Bank', icon: '🏦' },
                { id: 'cash' as const, label: 'Cash', icon: '💵' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-xs font-bold transition-all cursor-pointer ${
                    paymentMethod === m.id
                      ? 'border-[#F59E0B] bg-[#F59E0B]/15 text-[#F59E0B] ring-1 ring-[#F59E0B]/30'
                      : 'border-white/5 bg-[#171821] text-[#94A3B8] hover:border-white/20 hover:text-[#F8FAFC]'
                  }`}
                >
                  <span className="text-lg">{m.icon}</span>
                  <span className="mt-1">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reference Code Verification */}
          {paymentMethod !== 'cash' && (
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-[10px] tracking-wider text-[#94A3B8]">
                Telebirr / Bank Transaction Ref Code *
              </label>
              <Input
                type="text"
                required
                value={refCode}
                onChange={(e) => setRefCode(e.target.value)}
                placeholder="e.g. TLB987654321 or CBE-TX-99"
                className="font-mono uppercase"
              />
              <p className="mt-1 text-[10px] text-[#94A3B8]">
                Confirm transaction log match before issuing receipt.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={busy}
              variant="success"
              className="flex-1 flex items-center justify-center gap-2 uppercase tracking-wider text-xs py-3.5 h-auto font-black"
            >
              <Receipt className="h-4 w-4 stroke-[2.5]" />
              {busy ? 'Processing...' : 'CONFIRM PAYMENT'}
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={onCancelSelection}
              className="px-4 py-3.5 h-auto"
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="py-16 text-center text-xs text-[#94A3B8]">
          👈 Select a table or delivery bill from the list to process payment.
        </div>
      )}
    </Card>
  );
}
