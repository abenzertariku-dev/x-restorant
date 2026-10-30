'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Receipt,
  Plus,
  Trash2,
  Wallet,
  SplitSquareHorizontal,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Order, PaymentMethod, SplitPayment } from '@/types';
import { formatETB, paymentLabel } from '@/lib/format';

interface SplitRow {
  guestName: string;
  method: PaymentMethod;
  amount: string;
  referenceCode: string;
}

interface SettlementDrawerProps {
  selectedOrder: Order | null;
  busy: boolean;
  onSettle: (payload: {
    method: PaymentMethod | 'split';
    referenceCode?: string;
    splits?: SplitPayment[];
  }) => Promise<void>;
  onCancelSelection: () => void;
}

const methods: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'telebirr', label: 'Telebirr', icon: '📱' },
  { id: 'cbe_transfer', label: 'CBE', icon: '🏦' },
  { id: 'awash_transfer', label: 'Awash', icon: '🏛️' },
  { id: 'cash', label: 'Cash', icon: '💵' },
];

const isReferenceValid = (value: string) => /^[A-Za-z0-9-]{6,}$/.test(value.trim());

export function SettlementDrawer({
  selectedOrder,
  busy,
  onSettle,
  onCancelSelection,
}: SettlementDrawerProps) {
  const [mode, setMode] = useState<'full' | 'split'>('full');
  const [method, setMethod] = useState<PaymentMethod>('telebirr');
  const [reference, setReference] = useState('');
  const [splits, setSplits] = useState<SplitRow[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode('full');
    setMethod('telebirr');
    setReference('');
    setSplits([]);
    setError('');
  }, [selectedOrder?._id]);

  const splitTotal = useMemo(
    () => splits.reduce((sum, row) => sum + (Number(row.amount) || 0), 0),
    [splits]
  );
  const remaining = (selectedOrder?.totalAmount || 0) - splitTotal;

  const updateSplit = (index: number, patch: Partial<SplitRow>) => {
    setSplits((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const removeSplit = (index: number) => {
    setSplits((prev) => prev.filter((_, i) => i !== index));
  };

  const addSplit = () => {
    setSplits((prev) => [
      ...prev,
      {
        guestName: `Guest ${prev.length + 1}`,
        method: 'cash',
        amount: remaining > 0 ? String(Math.round(remaining)) : '',
        referenceCode: '',
      },
    ]);
  };

  const splitEvenly = () => {
    if (!selectedOrder) return;
    const count = Math.max(splits.length, 2);
    const base = Math.floor((selectedOrder.totalAmount / count) * 100) / 100;
    const rows: SplitRow[] = Array.from({ length: count }, (_, index) => {
      const existing = splits[index];
      const amount =
        index === count - 1
          ? Math.round((selectedOrder.totalAmount - base * (count - 1)) * 100) / 100
          : base;
      return {
        guestName: existing?.guestName || `Guest ${index + 1}`,
        method: existing?.method || 'cash',
        amount: String(amount),
        referenceCode: existing?.referenceCode || '',
      };
    });
    setSplits(rows);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedOrder) return;

    if (mode === 'full') {
      if (method !== 'cash' && !isReferenceValid(reference)) {
        setError(
          'Enter the exact Telebirr / bank transaction reference (at least 6 letters or digits) before settling.'
        );
        return;
      }
      try {
        await onSettle({
          method,
          referenceCode: method === 'cash' ? '' : reference.trim().toUpperCase(),
        });
        setReference('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Settlement failed.');
      }
      return;
    }

    if (splits.length < 2) {
      setError('A split bill needs at least two guests.');
      return;
    }
    for (let i = 0; i < splits.length; i += 1) {
      const row = splits[i];
      if (!row.guestName.trim()) {
        setError(`Guest ${i + 1} needs a name.`);
        return;
      }
      if (!(Number(row.amount) > 0)) {
        setError(`Guest ${i + 1} needs a positive amount.`);
        return;
      }
      if (row.method !== 'cash' && !isReferenceValid(row.referenceCode)) {
        setError(`Guest ${row.guestName || i + 1} needs a valid ${paymentLabel(row.method)} reference.`);
        return;
      }
    }
    if (Math.abs(remaining) > 0.01) {
      setError(
        `Split total must equal the bill. ${remaining > 0 ? 'Remaining' : 'Excess'}: ${formatETB(
          Math.abs(remaining)
        )}.`
      );
      return;
    }

    try {
      await onSettle({
        method: 'split',
        splits: splits.map((row) => ({
          guestName: row.guestName.trim(),
          method: row.method,
          amount: Number(row.amount),
          referenceCode: row.method === 'cash' ? '' : row.referenceCode.trim().toUpperCase(),
          status: 'verified',
        })),
      });
      setSplits([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Settlement failed.');
    }
  };

  const total = selectedOrder?.totalAmount || 0;

  return (
    <Card className="sticky top-6 border-white/5 bg-[#14151D] p-5 shadow-xl sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-[#F8FAFC]">Settlement & Verification</h2>
        <ShieldCheck className="h-5 w-5 text-emerald-400" />
      </div>

      {selectedOrder ? (
        <form onSubmit={submit} className="mt-4 space-y-4">
          <div className="rounded-xl border border-white/5 bg-[#171821] p-4">
            <div className="flex justify-between text-xs text-[#94A3B8]">
              <span>Bill target</span>
              <span className="font-bold text-[#F8FAFC]">
                {selectedOrder.type === 'dine_in'
                  ? `Table ${selectedOrder.tableNumber}`
                  : selectedOrder.type.replace('_', ' ')}
              </span>
            </div>
            <div className="mt-1 flex justify-between text-xs text-[#94A3B8]">
              <span>Order number</span>
              <span className="font-mono font-bold text-[#F59E0B]">
                #{selectedOrder.orderNumber}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-base font-extrabold">
              <span className="text-[#CBD5E1]">Amount due</span>
              <span className="font-mono text-2xl font-black text-[#F59E0B]">
                {formatETB(total)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode('full')}
              className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold transition ${
                mode === 'full'
                  ? 'border-[#F59E0B] bg-[#F59E0B]/15 text-[#F59E0B]'
                  : 'border-white/5 bg-[#171821] text-[#94A3B8]'
              }`}
            >
              <Wallet className="h-4 w-4" /> Full Payment
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('split');
                if (splits.length === 0) splitEvenly();
              }}
              className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold transition ${
                mode === 'split'
                  ? 'border-[#F59E0B] bg-[#F59E0B]/15 text-[#F59E0B]'
                  : 'border-white/5 bg-[#171821] text-[#94A3B8]'
              }`}
            >
              <SplitSquareHorizontal className="h-4 w-4" /> Split Bill
            </button>
          </div>

          {mode === 'full' && (
            <>
              <div>
                <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
                  Payment channel
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {methods.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border p-2 text-[10px] font-bold transition ${
                        method === m.id
                          ? 'border-[#F59E0B] bg-[#F59E0B]/15 text-[#F59E0B] ring-1 ring-[#F59E0B]/30'
                          : 'border-white/5 bg-[#171821] text-[#94A3B8] hover:text-[#F8FAFC]'
                      }`}
                    >
                      <span className="text-base">{m.icon}</span>
                      <span className="mt-0.5">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {method !== 'cash' ? (
                <div>
                  <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
                    {paymentLabel(method)} transaction reference *
                  </label>
                  <Input
                    required
                    value={reference}
                    onChange={(e) => setReference(e.target.value.toUpperCase())}
                    placeholder="e.g. TLB9F8C7D6 or CBE-TX-88421"
                    className="font-mono uppercase tracking-wide"
                  />
                  <p className="mt-1 flex items-start gap-1 text-[10px] text-[#F59E0B]">
                    <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                    Verify the exact reference in the customer’s SMS/transaction log before settling.
                  </p>
                </div>
              ) : (
                <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-[11px] text-emerald-400">
                  Cash payment does not require a transaction reference. Confirm the cash count at the
                  counter.
                </p>
              )}
            </>
          )}

          {mode === 'split' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
                  Guest payments
                </p>
                <div className="flex gap-1.5">
                  <Button type="button" variant="ghost" size="sm" onClick={splitEvenly}>
                    Split evenly
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={addSplit}>
                    <Plus className="mr-1 h-3 w-3" /> Guest
                  </Button>
                </div>
              </div>

              {splits.map((row, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-white/5 bg-[#171821] p-2.5"
                >
                  <div className="flex items-center gap-1.5">
                    <Input
                      value={row.guestName}
                      onChange={(e) => updateSplit(index, { guestName: e.target.value })}
                      placeholder={`Guest ${index + 1}`}
                      className="h-8 flex-1 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => removeSplit(index)}
                      className="cursor-pointer rounded-lg p-1.5 text-[#64748B] hover:bg-rose-500/10 hover:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-1.5 grid grid-cols-[1fr_84px] gap-1.5">
                    <select
                      value={row.method}
                      onChange={(e) =>
                        updateSplit(index, { method: e.target.value as PaymentMethod })
                      }
                      className="rounded-lg border border-white/10 bg-[#12131A] px-2 py-1.5 text-[11px] text-[#F8FAFC] outline-none focus:border-[#F59E0B]"
                    >
                      {methods.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={row.amount}
                      onChange={(e) => updateSplit(index, { amount: e.target.value })}
                      placeholder="0"
                      className="h-8 font-mono text-xs"
                    />
                  </div>
                  {row.method !== 'cash' && (
                    <Input
                      value={row.referenceCode}
                      onChange={(e) =>
                        updateSplit(index, { referenceCode: e.target.value.toUpperCase() })
                      }
                      placeholder={`${paymentLabel(row.method)} reference *`}
                      className="mt-1.5 h-8 font-mono text-[11px] uppercase"
                    />
                  )}
                </div>
              ))}

              {splits.length === 0 && (
                <p className="rounded-xl border border-dashed border-white/10 py-6 text-center text-[11px] text-[#64748B]">
                  Choose “Split evenly” or add guests to start a split bill.
                </p>
              )}

              <div
                className={`flex items-center justify-between rounded-xl border p-2.5 text-xs font-bold ${
                  Math.abs(remaining) < 0.01
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#F59E0B]'
                }`}
              >
                <span>Allocated {formatETB(splitTotal)}</span>
                <span>
                  {Math.abs(remaining) < 0.01
                    ? 'Balanced'
                    : `${remaining > 0 ? 'Remaining' : 'Excess'} ${formatETB(Math.abs(remaining))}`}
                </span>
              </div>
            </div>
          )}

          {error && (
            <p className="flex items-start gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-[11px] font-semibold text-rose-400">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={busy}
              variant="success"
              className="h-auto flex-1 py-3 text-xs font-black uppercase tracking-wider"
            >
              <Receipt className="mr-2 h-4 w-4" />
              {busy ? 'Processing…' : 'Confirm & Settle'}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onCancelSelection}
              className="h-auto py-3"
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="py-16 text-center text-xs text-[#94A3B8]">
          Select an active bill from the list to process payment, verify references and issue a fiscal
          receipt.
        </div>
      )}
    </Card>
  );
}
