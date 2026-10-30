'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Minus,
  Search,
  Send,
  CheckCircle2,
  ChefHat,
  UtensilsCrossed,
  Trash2,
  Clock,
  Receipt,
  RefreshCw,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Category, MenuItem, OrderStatus, Table } from '@/types';
import { formatETB, elapsedMinutes, statusVariant } from '@/lib/format';
import { useLanguage } from '@/context/LanguageContext';

interface CartEntry {
  item: MenuItem;
  qty: number;
  notes: string;
}

interface TableOrderModalProps {
  open: boolean;
  table: Table | null;
  categories: (Category & { items: MenuItem[] })[];
  onClose: () => void;
  onPlaceOrder: (
    tableNumber: number,
    items: { menuItemId: string; qty: number; notes: string }[],
    notes: string
  ) => Promise<void>;
  onOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  onClearTable: (tableNumber: number) => Promise<void>;
  placing?: boolean;
}

export function TableOrderModal({
  open,
  table,
  categories,
  onClose,
  onPlaceOrder,
  onOrderStatus,
  onClearTable,
  placing = false,
}: TableOrderModalProps) {
  const { getText, t } = useLanguage();
  const [cart, setCart] = useState<Record<string, CartEntry>>({});
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [busy, setBusy] = useState('');
  const [mode, setMode] = useState<'menu' | 'orders'>('menu');

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCart({});
      setNotes('');
      setSearch('');
      setCategory('all');
      setMode(table?.orders?.length ? 'orders' : 'menu');
    }
  }, [open, table?._id, table?.orders?.length]);

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    return categories.filter((cat) => category === 'all' || cat._id === category).map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => {
        if (!item.isAvailable) return false;
        if (!q) return true;
        return (
          item.name.en.toLowerCase().includes(q) ||
          item.name.am.includes(search.trim())
        );
      }),
    }));
  }, [categories, category, search]);

  const lines = Object.values(cart);
  const total = lines.reduce((sum, line) => sum + line.item.price * line.qty, 0);
  const itemCount = lines.reduce((sum, line) => sum + line.qty, 0);

  const add = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev[item._id];
      return {
        ...prev,
        [item._id]: existing
          ? { ...existing, qty: existing.qty + 1 }
          : { item, qty: 1, notes: '' },
      };
    });
  };

  const changeQty = (itemId: string, delta: number) => {
    setCart((prev) => {
      const existing = prev[itemId];
      if (!existing) return prev;
      const qty = existing.qty + delta;
      if (qty <= 0) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return { ...prev, [itemId]: { ...existing, qty } };
    });
  };

  const submit = async () => {
    if (!table || lines.length === 0) return;
    await onPlaceOrder(
      table.tableNumber,
      lines.map((line) => ({
        menuItemId: line.item._id,
        qty: line.qty,
        notes: line.notes,
      })),
      notes
    );
    setCart({});
    setNotes('');
    setMode('orders');
  };

  const runOrderAction = async (orderId: string, status: OrderStatus) => {
    setBusy(orderId);
    try {
      await onOrderStatus(orderId, status);
    } finally {
      setBusy('');
    }
  };

  const clear = async () => {
    if (!table) return;
    if (!window.confirm(`Clear table ${table.tableNumber} and mark it available?`)) return;
    setBusy('clear');
    try {
      await onClearTable(table.tableNumber);
      onClose();
    } finally {
      setBusy('');
    }
  };

  const orders = table?.orders || [];

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        onClose={onClose}
        className="max-h-[92vh] overflow-y-auto sm:max-w-3xl"
      >
        {table && (
          <>
            <DialogHeader>
              <DialogTitle className="flex flex-wrap items-center gap-2">
                Table {table.tableNumber}
                <Badge variant="outline" className="text-[10px]">
                  {table.zone} · {table.capacity} seats
                </Badge>
                <Badge variant={statusVariant((orders[0]?.status || 'pending') as OrderStatus)}>
                  {orders.length} open order{orders.length === 1 ? '' : 's'}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="mt-3 flex gap-1.5">
              <button
                type="button"
                onClick={() => setMode('menu')}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  mode === 'menu'
                    ? 'bg-[#F59E0B] text-[#0F1015]'
                    : 'border border-slate-200 bg-[#FFFFFF] text-[#64748B]'
                }`}
              >
                <UtensilsCrossed className="mr-1 inline h-3.5 w-3.5" /> Add Order
              </button>
              <button
                type="button"
                onClick={() => setMode('orders')}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  mode === 'orders'
                    ? 'bg-[#F59E0B] text-[#0F1015]'
                    : 'border border-slate-200 bg-[#FFFFFF] text-[#64748B]'
                }`}
              >
                <Receipt className="mr-1 inline h-3.5 w-3.5" /> Active Orders ({orders.length})
              </button>
            </div>

            {mode === 'orders' && (
              <div className="mt-4 space-y-3">
                {orders.map((order) => (
                  <div key={order._id} className="rounded-xl border border-slate-200 bg-[#FFFFFF] p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-mono text-sm font-black text-[#B45309]">
                          #{order.orderNumber}
                        </p>
                        <p className="text-[10px] text-[#94A3B8]">
                          <Clock className="mr-1 inline h-3 w-3" />
                          {elapsedMinutes(order.createdAt)} min ago · {order.items.length} items
                        </p>
                      </div>
                      <Badge variant={statusVariant(order.status)}>{t(order.status)}</Badge>
                    </div>

                    <div className="mt-2 space-y-1 border-t border-slate-200 pt-2 text-xs">
                      {order.items.map((item, i) => (
                        <div key={`${item.menuItem}-${i}`} className="flex justify-between gap-2">
                          <span className="text-[#334155]">
                            {item.qty}× {getText(item.name)}
                            {item.notes && (
                              <span className="block text-[10px] text-[#B45309]">{item.notes}</span>
                            )}
                          </span>
                          <span className="font-mono text-[#64748B]">
                            {formatETB(item.qty * item.price)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-2">
                      <span className="font-mono text-sm font-black text-[#0F172A]">
                        {formatETB(order.totalAmount)}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {order.status === 'pending' && (
                          <Button
                            size="sm"
                            disabled={busy === order._id}
                            onClick={() => runOrderAction(order._id, 'approved')}
                          >
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve
                          </Button>
                        )}
                        {order.status === 'preparing' && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy === order._id}
                            onClick={() => runOrderAction(order._id, 'ready')}
                          >
                            <ChefHat className="mr-1 h-3.5 w-3.5" /> Mark Ready
                          </Button>
                        )}
                        {order.status === 'ready' && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy === order._id}
                            onClick={() => runOrderAction(order._id, 'served')}
                          >
                            <UtensilsCrossed className="mr-1 h-3.5 w-3.5" /> Served
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-xs text-[#64748B]">
                    No active orders. Switch to “Add Order” to take a table order.
                  </div>
                )}
              </div>
            )}

            {mode === 'menu' && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  <div className="relative min-w-[180px] flex-1">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search dishes…"
                      className="pl-9"
                    />
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] outline-none focus:border-[#F59E0B]"
                  >
                    <option value="all">All categories</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {getText(cat.name)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-3 max-h-[34vh] space-y-4 overflow-y-auto pr-1">
                  {filteredCategories.map((cat) => (
                    <div key={cat._id}>
                      <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#B45309]">
                        {cat.icon} {getText(cat.name)}
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {cat.items.map((item) => (
                          <button
                            key={item._id}
                            type="button"
                            onClick={() => add(item)}
                            className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-slate-200 bg-[#FFFFFF] p-2.5 text-left transition hover:border-[#F59E0B]/40"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-[#0F172A]">
                                {getText(item.name)}
                              </p>
                              <p className="font-mono text-[10px] text-[#B45309]">
                                {formatETB(item.price)}
                              </p>
                            </div>
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F59E0B]/10 text-[#B45309]">
                              <Plus className="h-4 w-4" />
                            </span>
                          </button>
                        ))}
                        {cat.items.length === 0 && (
                          <p className="col-span-full py-2 text-[11px] text-[#94A3B8]">
                            No matching dishes.
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-[#F8FAFC] p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-extrabold text-[#0F172A]">
                      New order · {itemCount} item{itemCount === 1 ? '' : 's'}
                    </p>
                    <p className="font-mono text-sm font-black text-[#B45309]">{formatETB(total)}</p>
                  </div>

                  <div className="max-h-32 space-y-1.5 overflow-y-auto">
                    {lines.map((line) => (
                      <div key={line.item._id} className="flex items-center gap-2 text-xs">
                        <span className="min-w-0 flex-1 truncate text-[#334155]">
                          {getText(line.item.name)}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => changeQty(line.item._id, -1)}
                            className="cursor-pointer rounded-md border border-slate-200 p-1 text-[#64748B] hover:text-slate-900"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center font-mono font-bold text-[#0F172A]">
                            {line.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => changeQty(line.item._id, 1)}
                            className="cursor-pointer rounded-md border border-slate-200 p-1 text-[#64748B] hover:text-slate-900"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => changeQty(line.item._id, -line.qty)}
                            className="ml-1 cursor-pointer text-[#94A3B8] hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {lines.length === 0 && (
                      <p className="py-2 text-[11px] text-[#94A3B8]">
                        Tap dishes above to build the table order.
                      </p>
                    )}
                  </div>

                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Kitchen notes (allergies, serving preference…)"
                    rows={2}
                    className="mt-2"
                  />

                  <Button
                    className="mt-2 w-full"
                    disabled={placing || lines.length === 0}
                    onClick={submit}
                  >
                    <Send className="mr-1.5 h-4 w-4" />
                    {placing ? 'Sending…' : 'Send Order to Kitchen'}
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-4 flex gap-2 border-t border-slate-200 pt-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Close
              </Button>
              <Button
                variant="destructive"
                disabled={busy === 'clear'}
                onClick={clear}
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Clear Table
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
