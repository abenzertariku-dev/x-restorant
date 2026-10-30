'use client';

import React, { useMemo, useState } from 'react';
import {
  BellRing,
  Receipt,
  Users,
  CheckCircle2,
  Clock,
  UtensilsCrossed,
  RefreshCw,
  ChefHat,
  QrCode,
} from 'lucide-react';
import { TableQRModal } from '@/components/table/TableQRModal';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { OrderStatus, Table } from '@/types';
import { formatETB, formatClock, elapsedMinutes, statusVariant } from '@/lib/format';
import { useLanguage } from '@/context/LanguageContext';

interface FloorBoardProps {
  tables: Table[];
  onClearTable: (tableNumber: number) => Promise<void>;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

const tableStatusMeta: Record<
  Table['status'],
  { label: string; dot: string; card: string; badge: 'success' | 'warning' | 'destructive' | 'secondary' | 'info' }
> = {
  available: {
    label: 'Available',
    dot: 'bg-emerald-500',
    card: 'border-emerald-500/20 bg-emerald-500/[0.04]',
    badge: 'success',
  },
  occupied: {
    label: 'Occupied',
    dot: 'bg-sky-500',
    card: 'border-sky-500/20 bg-sky-500/[0.04]',
    badge: 'info',
  },
  call_waiter: {
    label: 'Calling waiter',
    dot: 'bg-[#F59E0B] animate-pulse',
    card: 'border-[#F59E0B]/40 bg-[#F59E0B]/[0.07]',
    badge: 'warning',
  },
  bill_requested: {
    label: 'Bill requested',
    dot: 'bg-rose-500 animate-pulse',
    card: 'border-rose-500/40 bg-rose-500/[0.07]',
    badge: 'destructive',
  },
};

const zones: (Table['zone'] | 'All')[] = ['All', 'Indoor', 'Terrace', 'VIP', 'Balcony'];

export function FloorBoard({ tables, onClearTable, onUpdateOrderStatus }: FloorBoardProps) {
  const { t } = useLanguage();
  const [zone, setZone] = useState<Table['zone'] | 'All'>('All');
  const [selected, setSelected] = useState<Table | null>(null);
  const [qrTable, setQrTable] = useState<Table | null>(null);
  const [busy, setBusy] = useState('');

  const filtered = useMemo(
    () => tables.filter((table) => (zone === 'All' ? true : table.zone === zone)),
    [tables, zone]
  );

  const summary = useMemo(() => {
    const openOrders = tables.flatMap((table) => table.orders || []);
    return {
      available: tables.filter((tb) => tb.status === 'available').length,
      occupied: tables.filter((tb) => tb.status === 'occupied').length,
      alerts: tables.filter((tb) => tb.status === 'call_waiter' || tb.status === 'bill_requested')
        .length,
      openRevenue: openOrders.reduce((sum, order) => sum + order.totalAmount, 0),
    };
  }, [tables]);

  const act = async (key: string, action: () => Promise<void>) => {
    setBusy(key);
    try {
      await action();
    } finally {
      setBusy('');
    }
  };

  const clear = async (tableNumber: number) => {
    if (!window.confirm(`Clear table ${tableNumber} and mark it available?`)) return;
    await act(`clear-${tableNumber}`, async () => {
      await onClearTable(tableNumber);
      setSelected(null);
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Available', value: summary.available, icon: CheckCircle2, tone: 'text-emerald-600' },
          { label: 'Seated', value: summary.occupied, icon: Users, tone: 'text-sky-600' },
          { label: 'Guest Alerts', value: summary.alerts, icon: BellRing, tone: 'text-[#B45309]' },
          {
            label: 'Open Bill Value',
            value: formatETB(summary.openRevenue),
            icon: Receipt,
            tone: 'text-violet-400',
          },
        ].map((item) => (
          <Card key={item.label} className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
                  {item.label}
                </p>
                <p className="mt-1 text-lg font-black text-[#0F172A]">{item.value}</p>
              </div>
              <item.icon className={`h-5 w-5 ${item.tone}`} />
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {zones.map((z) => (
          <button
            key={z}
            type="button"
            onClick={() => setZone(z)}
            className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${
              zone === z
                ? 'bg-[#F59E0B] text-[#0F1015]'
                : 'border border-slate-200 bg-[#FFFFFF] text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            {z}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filtered.map((table) => {
          const meta = tableStatusMeta[table.status];
          const orders = table.orders || [];
          const total = orders.reduce((sum, order) => sum + order.totalAmount, 0);
          const pending = orders.filter((order) => order.status === 'pending').length;
          return (
            <button
              key={table._id}
              type="button"
              onClick={() => setSelected(table)}
              className={`cursor-pointer rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${meta.card}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
                    {table.zone} · {table.capacity} seats
                  </p>
                  <h3 className="mt-0.5 text-2xl font-black text-[#0F172A]">
                    Table {table.tableNumber}
                  </h3>
                </div>
                <span className={`mt-1 flex h-2.5 w-2.5 rounded-full ${meta.dot}`} />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Badge variant={meta.badge}>{meta.label}</Badge>
                {pending > 0 && <Badge variant="warning">{pending} to approve</Badge>}
              </div>

              <div className="mt-3 flex items-end justify-between border-t border-slate-200 pt-2.5">
                <div className="text-[11px] text-[#64748B]">
                  {orders.length ? `${orders.length} open order(s)` : 'No open orders'}
                </div>
                <div className="font-mono text-xs font-black text-[#0F172A]">
                  {orders.length ? formatETB(total) : '—'}
                </div>
              </div>

              {(table.status === 'call_waiter' || table.status === 'bill_requested') &&
                table.lastCallAt && (
                  <p className="mt-1.5 text-[10px] font-bold text-[#B45309]">
                    {elapsedMinutes(table.status === 'call_waiter' ? table.lastCallAt : table.lastBillRequestAt || table.lastCallAt)} min ago
                  </p>
                )}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-200 py-14 text-center text-xs text-[#64748B]">
            No tables in this zone.
          </div>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent
          onClose={() => setSelected(null)}
          className="max-h-[90vh] overflow-y-auto sm:max-w-xl"
        >
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between gap-3 pr-6">
                  <DialogTitle>
                    Table {selected.tableNumber} · {selected.zone}
                  </DialogTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() => setQrTable(selected)}
                    className="border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#B45309] hover:bg-[#F59E0B]/20 text-xs font-bold"
                  >
                    <QrCode className="mr-1.5 h-3.5 w-3.5" />
                    <span>View / Print QR</span>
                  </Button>
                </div>
              </DialogHeader>

              <div className="mt-4 space-y-4 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={tableStatusMeta[selected.status].badge}>
                    {tableStatusMeta[selected.status].label}
                  </Badge>
                  <Badge variant="outline">{selected.capacity} seats</Badge>
                  {selected.lastCallAt && selected.status === 'call_waiter' && (
                    <Badge variant="warning">Called {formatClock(selected.lastCallAt)}</Badge>
                  )}
                  {selected.lastBillRequestAt && selected.status === 'bill_requested' && (
                    <Badge variant="destructive">
                      Bill requested {formatClock(selected.lastBillRequestAt)}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2.5">
                  {(selected.orders || []).map((order) => (
                    <div
                      key={order._id}
                      className="rounded-xl border border-slate-200 bg-[#FFFFFF] p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-mono text-sm font-black text-[#B45309]">
                            #{order.orderNumber}
                          </p>
                          <p className="text-[10px] text-[#94A3B8]">
                            <Clock className="mr-1 inline h-3 w-3" />
                            {elapsedMinutes(order.createdAt)} min · {order.items.length} items
                          </p>
                        </div>
                        <Badge variant={statusVariant(order.status)}>
                          {t(order.status === 'pending' ? 'pending' : order.status)}
                        </Badge>
                      </div>

                      <div className="mt-2 space-y-1 border-t border-slate-200 pt-2">
                        {order.items.map((item, i) => (
                          <div key={`${item.menuItem}-${i}`} className="flex justify-between gap-2">
                            <span className="text-[#334155]">
                              {item.qty}× {item.name.en}
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
                              onClick={() =>
                                act(order._id, () =>
                                  onUpdateOrderStatus(order._id, 'approved')
                                )
                              }
                            >
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve
                            </Button>
                          )}
                          {order.status === 'preparing' && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busy === order._id}
                              onClick={() =>
                                act(order._id, () => onUpdateOrderStatus(order._id, 'ready'))
                              }
                            >
                              <ChefHat className="mr-1 h-3.5 w-3.5" /> Mark Ready
                            </Button>
                          )}
                          {order.status === 'ready' && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busy === order._id}
                              onClick={() =>
                                act(order._id, () => onUpdateOrderStatus(order._id, 'served'))
                              }
                            >
                              <UtensilsCrossed className="mr-1 h-3.5 w-3.5" /> Mark Served
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {(selected.orders || []).length === 0 && (
                    <p className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-xs text-[#64748B]">
                      No open orders on this table.
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelected(null)}
                  >
                    Close
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    disabled={busy === `clear-${selected.tableNumber}`}
                    onClick={() => clear(selected.tableNumber)}
                  >
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Clear Table
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <TableQRModal
        open={!!qrTable}
        tableNumber={qrTable?.tableNumber || null}
        zone={qrTable?.zone}
        capacity={qrTable?.capacity}
        onClose={() => setQrTable(null)}
      />
    </div>
  );
}
