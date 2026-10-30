'use client';

import React, { useMemo, useState } from 'react';
import { Search, Download, Ban, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Order, OrderStatus } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import {
  formatETB,
  formatDateTime,
  paymentLabel,
  statusTranslationKey,
  statusVariant,
} from '@/lib/format';

interface OrdersTabProps {
  orders: Order[];
  onVoid?: (orderId: string) => Promise<void>;
}

const FILTERS: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'served', label: 'Served' },
  { key: 'out_for_delivery', label: 'On the way' },
  { key: 'settled', label: 'Settled' },
  { key: 'cancelled', label: 'Cancelled' },
];

export function OrdersTab({ orders, onVoid }: OrdersTabProps) {
  const { t, getText } = useLanguage();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);
  const [busyId, setBusyId] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders
      .filter((o) => (filter === 'all' ? true : o.status === filter))
      .filter((o) => {
        if (!q) return true;
        return (
          String(o.orderNumber).includes(q) ||
          (o.customer?.name || '').toLowerCase().includes(q) ||
          (o.customer?.phone || '').includes(q) ||
          String(o.tableNumber || '').includes(q)
        );
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, filter, search]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: orders.length };
    orders.forEach((o) => {
      map[o.status] = (map[o.status] || 0) + 1;
    });
    return map;
  }, [orders]);

  const voidOrder = async (order: Order) => {
    if (!onVoid) return;
    if (!window.confirm(`Cancel order #${order.orderNumber}? This cannot be undone.`)) return;
    setBusyId(order._id);
    try {
      await onVoid(order._id);
    } finally {
      setBusyId('');
    }
  };

  const exportCsv = () => {
    const rows = [
      ['Order', 'Type', 'Destination', 'Customer', 'Total ETB', 'Payment', 'Status', 'Created'],
      ...filtered.map((o) => [
        o.orderNumber,
        o.type,
        o.type === 'dine_in' ? `Table ${o.tableNumber}` : o.customer?.phone || '',
        o.customer?.name || '',
        o.totalAmount,
        o.payment?.splits?.length ? 'split' : o.payment?.method || 'unpaid',
        o.status,
        new Date(o.createdAt).toISOString(),
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-[#F8FAFC]">
            All Orders & Billing ({filtered.length})
          </h3>
          <p className="text-xs text-[#94A3B8]">
            Complete transactional history across dine-in table bills and digital deliveries.
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <div className="relative min-w-[180px] flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order, guest, table…"
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> CSV
          </Button>
        </div>
      </div>

      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${
              filter === f.key
                ? 'bg-[#F59E0B] text-[#0F1015]'
                : 'border border-white/5 bg-[#14151D] text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            {f.label}
            <span className="ml-1.5 opacity-70">{counts[f.key] || 0}</span>
          </button>
        ))}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Dishes</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((o, idx) => (
            <TableRow key={o._id || o.orderNumber || idx}>
              <TableCell className="font-mono font-bold text-[#F59E0B]">
                #{o.orderNumber}
              </TableCell>
              <TableCell className="font-semibold capitalize">{o.type.replace('_', ' ')}</TableCell>
              <TableCell className="font-medium">
                {o.type === 'dine_in' ? `Table ${o.tableNumber}` : o.customer?.phone || 'Guest'}
              </TableCell>
              <TableCell className="max-w-[240px] truncate text-[#94A3B8]">
                {o.items.map((i) => `${i.qty}× ${getText(i.name)}`).join(', ')}
              </TableCell>
              <TableCell className="font-mono font-extrabold text-[#F8FAFC]">
                {formatETB(o.totalAmount)}
              </TableCell>
              <TableCell className="font-mono text-[10px] uppercase text-[#94A3B8]">
                {o.payment?.splits?.length
                  ? `${o.payment.splits.length}-way split`
                  : paymentLabel(o.payment?.method)}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant(o.status)}>{t(statusTranslationKey(o.status))}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => setSelected(o)}
                    className="cursor-pointer rounded-lg p-1.5 text-[#94A3B8] transition hover:bg-white/5 hover:text-[#F8FAFC]"
                    title="View details"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  {onVoid && !['settled', 'cancelled'].includes(o.status) && (
                    <button
                      type="button"
                      disabled={busyId === o._id}
                      onClick={() => voidOrder(o)}
                      className="cursor-pointer rounded-lg p-1.5 text-[#94A3B8] transition hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-50"
                      title="Cancel order"
                    >
                      <Ban className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="py-12 text-center text-[#94A3B8]">
                No orders match this filter.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent onClose={() => setSelected(null)}>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Order #{selected.orderNumber}</DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-4 text-xs">
                <div className="flex flex-wrap gap-2">
                  <Badge variant={statusVariant(selected.status)}>
                    {t(statusTranslationKey(selected.status))}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {selected.type.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline">{formatDateTime(selected.createdAt)}</Badge>
                </div>

                <div className="rounded-xl border border-white/5 bg-[#14151D] p-3">
                  <p className="mb-1 font-bold text-[#F8FAFC]">
                    {selected.customer?.name || 'Walk-in guest'}
                  </p>
                  <p className="text-[#94A3B8]">{selected.customer?.phone || 'No phone'}</p>
                  {selected.customer?.address && (
                    <p className="mt-1 text-[#94A3B8]">{selected.customer.address}</p>
                  )}
                  {selected.customer?.notes && (
                    <p className="mt-1 text-[#F59E0B]">Note: {selected.customer.notes}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  {selected.items.map((item, i) => (
                    <div
                      key={`${item.menuItem}-${i}`}
                      className="flex justify-between gap-2 border-b border-white/5 py-1.5"
                    >
                      <span className="text-[#CBD5E1]">
                        {item.qty}× {getText(item.name)}
                        {item.notes && (
                          <span className="block text-[10px] text-[#64748B]">{item.notes}</span>
                        )}
                      </span>
                      <span className="font-mono text-[#F8FAFC]">
                        {formatETB(item.qty * item.price)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between rounded-xl bg-[#F59E0B]/10 p-3">
                  <span className="font-bold text-[#F59E0B]">Total</span>
                  <span className="font-mono text-base font-black text-[#F59E0B]">
                    {formatETB(selected.totalAmount)}
                  </span>
                </div>

                {selected.payment?.splits?.length ? (
                  <div className="space-y-1.5">
                    <p className="font-bold text-[#F8FAFC]">Split payments</p>
                    {selected.payment.splits.map((split, i) => (
                      <div key={i} className="flex justify-between text-[#94A3B8]">
                        <span>
                          {split.guestName || `Guest ${i + 1}`} · {paymentLabel(split.method)}
                        </span>
                        <span className="font-mono">{formatETB(split.amount)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#94A3B8]">
                    Payment: <span className="font-bold text-[#CBD5E1]">
                      {paymentLabel(selected.payment?.method)}
                    </span>
                  </p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
