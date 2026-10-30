'use client';

import React, { useMemo, useState } from 'react';
import { CheckCircle2, Search, BellRing, Bike, ShoppingBag, UtensilsCrossed } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import type { Order } from '@/types';
import { elapsedMinutes, formatETB, statusTranslationKey, statusVariant } from '@/lib/format';
import { useLanguage } from '@/context/LanguageContext';

interface BillListProps {
  orders: Order[];
  selectedOrder: Order | null;
  onSelectOrder: (order: Order) => void;
  loading: boolean;
  billRequestedTables?: number[];
}

type Filter = 'all' | 'alerts' | 'dine_in' | 'takeaway' | 'delivery';

export function BillList({
  orders,
  selectedOrder,
  onSelectOrder,
  loading,
  billRequestedTables = [],
}: BillListProps) {
  const { t, getText } = useLanguage();
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders
      .filter((order) => {
        if (filter === 'all') return true;
        if (filter === 'alerts') return billRequestedTables.includes(order.tableNumber || -1);
        return order.type === filter;
      })
      .filter((order) => {
        if (!q) return true;
        return (
          String(order.orderNumber).includes(q) ||
          String(order.tableNumber || '').includes(q) ||
          (order.customer?.name || '').toLowerCase().includes(q) ||
          (order.customer?.phone || '').includes(q)
        );
      })
      .sort((a, b) => {
        const aAlert = billRequestedTables.includes(a.tableNumber || -1) ? 1 : 0;
        const bAlert = billRequestedTables.includes(b.tableNumber || -1) ? 1 : 0;
        if (aAlert !== bAlert) return bAlert - aAlert;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
  }, [orders, filter, search, billRequestedTables]);

  const counts = useMemo(
    () => ({
      all: orders.length,
      alerts: orders.filter((o) => billRequestedTables.includes(o.tableNumber || -1)).length,
      dine_in: orders.filter((o) => o.type === 'dine_in').length,
      takeaway: orders.filter((o) => o.type === 'takeaway').length,
      delivery: orders.filter((o) => o.type === 'delivery').length,
    }),
    [orders, billRequestedTables]
  );

  return (
    <div className="space-y-3 lg:col-span-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-black tracking-tight text-[#F8FAFC]">
            Active Bills Pending Settlement ({orders.length})
          </h2>
          <p className="text-xs text-[#94A3B8]">
            Bills requesting the cashier are pinned to the top with an alert.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[170px] flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bill, table or guest…"
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {(
            [
              { key: 'all' as const, label: 'All', icon: CheckCircle2 },
              { key: 'alerts' as const, label: 'Alerts', icon: BellRing },
              { key: 'dine_in' as const, label: 'Dine-in', icon: UtensilsCrossed },
              { key: 'takeaway' as const, label: 'Takeaway', icon: ShoppingBag },
              { key: 'delivery' as const, label: 'Delivery', icon: Bike },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition ${
                filter === item.key
                  ? 'bg-[#F59E0B] text-[#0F1015]'
                  : 'border border-white/5 bg-[#14151D] text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <item.icon className="h-3 w-3" /> {item.label}
              <span className="opacity-70">{counts[item.key]}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl border border-white/5 bg-[#171821] shadow-sm"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center text-[#94A3B8]">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
          <p className="mt-3 font-bold text-[#F8FAFC]">No bills in this view</p>
          <p className="mt-1 text-xs text-[#94A3B8]">
            New customer bills will appear here automatically.
          </p>
        </Card>
      ) : (
        filtered.map((order) => {
          const isSelected = selectedOrder?._id === order._id;
          const needsBill = billRequestedTables.includes(order.tableNumber || -1);
          const TypeIcon =
            order.type === 'delivery' ? Bike : order.type === 'takeaway' ? ShoppingBag : UtensilsCrossed;
          return (
            <Card
              key={order._id}
              onClick={() => onSelectOrder(order)}
              className={`cursor-pointer p-4 shadow-sm transition-all ${
                isSelected
                  ? 'border-[#F59E0B] bg-[#1E202B] ring-1 ring-[#F59E0B]/50'
                  : needsBill
                    ? 'border-[#F59E0B]/40 bg-[#F59E0B]/[0.05] hover:bg-[#F59E0B]/[0.08]'
                    : 'hover:border-white/20 hover:bg-[#1A1C26]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-[#F59E0B]">
                      <TypeIcon className="h-3 w-3" />
                      {order.type === 'dine_in'
                        ? `Table ${order.tableNumber}`
                        : order.type.replace('_', ' ')}
                    </span>
                    {needsBill && (
                      <Badge variant="warning" className="animate-pulse">
                        <BellRing className="mr-1 h-3 w-3" /> Bill requested
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-base font-black text-[#F8FAFC]">
                    Order #{order.orderNumber}
                  </h3>
                  <p className="mt-0.5 text-[10px] text-[#64748B]">
                    {order.customer?.name || 'Walk-in guest'} · {elapsedMinutes(order.createdAt)} min
                    ago
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-xl font-black text-[#F59E0B]">
                    {formatETB(order.totalAmount)}
                  </p>
                  <Badge variant={statusVariant(order.status)} className="text-[10px]">
                    {t(statusTranslationKey(order.status))}
                  </Badge>
                </div>
              </div>

              <div className="mt-2 truncate text-xs text-[#94A3B8]">
                {order.items.map((item) => `${item.qty}× ${getText(item.name)}`).join(', ')}
              </div>

              <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-2 text-[10px]">
                <span className="text-[#64748B]">
                  {order.items.reduce((sum, item) => sum + item.qty, 0)} items
                </span>
                <span className="font-mono uppercase text-[#94A3B8]">
                  {order.payment?.method === 'unpaid' ? 'Payment pending' : order.payment?.method}
                </span>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}
