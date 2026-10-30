'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  Flame,
  RefreshCw,
  Search,
  UtensilsCrossed,
  Bike,
  ShoppingBag,
  AlertTriangle,

  Play,
  BellRing,
} from 'lucide-react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { PortalHeader } from '@/components/shared/PortalHeader';
import { PortalLoading } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api, playSoundAlert } from '@/lib/api';
import { getSocket, joinRoom } from '@/lib/socket';
import { elapsedMinutes, formatClock, formatETB } from '@/lib/format';
import { useLanguage } from '@/context/LanguageContext';
import type { Order, OrderStatus } from '@/types';

type KdsColumn = 'new' | 'preparing' | 'ready';

const columnMeta: Record<
  KdsColumn,
  { title: string; icon: typeof Flame; accent: string; border: string }
> = {
  new: {
    title: 'New Tickets',
    icon: BellRing,
    accent: 'text-[#B45309]',
    border: 'border-[#F59E0B]/25',
  },
  preparing: {
    title: 'On the Grill',
    icon: Flame,
    accent: 'text-orange-600',
    border: 'border-orange-500/20',
  },
  ready: {
    title: 'Ready Pass',
    icon: CheckCircle2,
    accent: 'text-emerald-600',
    border: 'border-emerald-500/20',
  },
};

export default function KitchenPage() {
  return (
    <AuthGuard roles={['kitchen', 'manager', 'admin']}>
      <KitchenDisplay />
    </AuthGuard>
  );
}

function KitchenDisplay() {
  const { getText } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'dine_in' | 'takeaway' | 'delivery'>('all');
  const [zoom, setZoom] = useState<'normal' | 'large'>('normal');
  const [now, setNow] = useState(0);
  const [busyId, setBusyId] = useState('');

  const loadOrders = useCallback(async () => {
    const res = await api<{ success: boolean; orders: Order[] }>('/orders?limit=100');
    if (res.success) {
      setOrders(
        res.orders.filter((order) => ['pending', 'approved', 'preparing', 'ready'].includes(order.status))
      );
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load kitchen queue.');
    } finally {
      setLoading(false);
    }
  }, [loadOrders]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 15000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const socket = getSocket();
    joinRoom('kitchen');

    const reload = () => loadOrders();

    socket.on('kds:new_ticket', (newOrder: Order) => {
      playSoundAlert('urgent');
      setOrders((prev) => [newOrder, ...prev.filter((o) => o._id !== newOrder._id)]);
    });
    socket.on('order:created', reload);
    socket.on('order:updated', reload);
    socket.on('order:settled', reload);

    return () => {
      socket.off('kds:new_ticket');
      socket.off('order:created', reload);
      socket.off('order:updated', reload);
      socket.off('order:settled', reload);
    };
  }, [loadOrders]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setBusyId(orderId);
    setError('');
    try {
      await api(`/orders/${orderId}/status`, { method: 'PATCH', body: { status } });
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ticket.');
    } finally {
      setBusyId('');
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders
      .filter((order) => (typeFilter === 'all' ? true : order.type === typeFilter))
      .filter((order) => {
        if (!q) return true;
        return (
          String(order.orderNumber).includes(q) ||
          String(order.tableNumber || '').includes(q) ||
          (order.customer?.name || '').toLowerCase().includes(q) ||
          order.items.some(
            (item) =>
              item.name.en.toLowerCase().includes(q) || item.name.am.includes(search.trim())
          )
        );
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [orders, search, typeFilter]);

  const columns = useMemo<Record<KdsColumn, Order[]>>(() => {
    return {
      new: filtered.filter((order) => order.status === 'pending' || order.status === 'approved'),
      preparing: filtered.filter((order) => order.status === 'preparing'),
      ready: filtered.filter((order) => order.status === 'ready'),
    };
  }, [filtered]);

  const stats = useMemo(() => {
    const delayed = orders.filter(
      (order) => order.status !== 'ready' && elapsedMinutes(order.createdAt, now) >= 15
    ).length;
    const itemCount = orders.reduce(
      (sum, order) => sum + order.items.reduce((lineSum, item) => lineSum + item.qty, 0),
      0
    );
    return { delayed, itemCount };
  }, [orders, now]);

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-[#334155] selection:bg-[#F59E0B] selection:text-[#0F1015]">
      <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
        <PortalHeader
          title="Kitchen Display System"
          subtitle={`${orders.length} active tickets · ${stats.itemCount} dishes in progress · ${stats.delayed} delayed`}
          icon={ChefHat}
          roleLabel="Kitchen"
          showLanguage
        >
          <Button variant="outline" size="sm" onClick={load} title="Refresh tickets">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom((z) => (z === 'normal' ? 'large' : 'normal'))}
          >
            {zoom === 'normal' ? 'Large Text' : 'Normal Text'}
          </Button>
        </PortalHeader>

        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: 'New Tickets', value: columns.new.length, icon: BellRing, tone: 'text-[#B45309]' },
            { label: 'Preparing', value: columns.preparing.length, icon: Flame, tone: 'text-orange-600' },
            { label: 'Ready Pass', value: columns.ready.length, icon: CheckCircle2, tone: 'text-emerald-600' },
            { label: 'Delayed (>15m)', value: stats.delayed, icon: AlertTriangle, tone: 'text-rose-600' },
          ].map((stat) => (
            <Card key={stat.label} className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-lg font-black text-[#0F172A]">{stat.value}</p>
                </div>
                <stat.icon className={`h-5 w-5 ${stat.tone}`} />
              </div>
            </Card>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order, table or dish…"
              className="pl-9"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
            {[
              { key: 'all' as const, label: 'All', icon: UtensilsCrossed },
              { key: 'dine_in' as const, label: 'Dine-in', icon: UtensilsCrossed },
              { key: 'takeaway' as const, label: 'Takeaway', icon: ShoppingBag },
              { key: 'delivery' as const, label: 'Delivery', icon: Bike },
            ].map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setTypeFilter(filter.key)}
                className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-bold transition ${
                  typeFilter === filter.key
                    ? 'bg-[#F59E0B] text-[#0F1015]'
                    : 'border border-slate-200 bg-[#FFFFFF] text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <filter.icon className="h-3.5 w-3.5" /> {filter.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-600">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={() => setError('')}
              className="cursor-pointer text-rose-700 hover:text-slate-900"
            >
              Dismiss
            </button>
          </div>
        )}

        {loading ? (
          <PortalLoading label="Loading kitchen tickets" />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ChefHat}
            tone="success"
            title="Kitchen is all clear"
            description="Approved orders appear automatically with an audio alert."
            className="py-20"
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {(Object.keys(columnMeta) as KdsColumn[]).map((key) => {
              const meta = columnMeta[key];
              const ColumnIcon = meta.icon;
              return (
                <div
                  key={key}
                  className={`rounded-2xl border bg-[#F8FAFC]/60 p-3 ${meta.border}`}
                >
                  <div className="mb-3 flex items-center justify-between px-1">
                    <h2 className={`flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider ${meta.accent}`}>
                      <ColumnIcon className="h-4 w-4" /> {meta.title}
                    </h2>
                    <Badge variant="outline">{columns[key].length}</Badge>
                  </div>

                  <div className="space-y-3">
                    {columns[key].map((order) => {
                      const elapsed = elapsedMinutes(order.createdAt, now);
                      const isLate = order.status !== 'ready' && elapsed >= 15;
                      const typeIcon =
                        order.type === 'delivery'
                          ? Bike
                          : order.type === 'takeaway'
                            ? ShoppingBag
                            : UtensilsCrossed;
                      const TypeIcon = typeIcon;

                      return (
                        <Card
                          key={order._id}
                          className={`border bg-[#FFFFFF] p-4 shadow-lg transition ${
                            isLate ? 'border-rose-500/40' : 'border-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-2.5">
                            <div>
                              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#B45309]">
                                <TypeIcon className="h-3 w-3" />
                                {order.type === 'dine_in'
                                  ? `Table ${order.tableNumber}`
                                  : order.type.replace('_', ' ')}
                              </div>
                              <h3
                                className={`font-black text-[#0F172A] ${
                                  zoom === 'large' ? 'text-2xl' : 'text-xl'
                                }`}
                              >
                                #{order.orderNumber}
                              </h3>
                            </div>
                            <div className="text-right">
                              <Badge variant={isLate ? 'destructive' : key === 'ready' ? 'success' : 'warning'}>
                                {isLate ? 'DELAYED' : `${elapsed}m`}
                              </Badge>
                              <p className="mt-1 text-[9px] text-[#94A3B8]">
                                {formatClock(order.createdAt)}
                              </p>
                            </div>
                          </div>

                          <div className="my-3 space-y-2">
                            {order.items.map((item, idx) => (
                              <div key={`${item.menuItem}-${idx}`}>
                                <p
                                  className={`font-bold leading-tight text-[#0F172A] ${
                                    zoom === 'large' ? 'text-base' : 'text-sm'
                                  }`}
                                >
                                  <span className="mr-1.5 inline-block rounded bg-[#F1F5F9] px-1.5 py-0.5 text-xs font-black text-[#B45309]">
                                    {item.qty}×
                                  </span>
                                  {getText(item.name)}
                                </p>
                                {item.notes && (
                                  <p className="mt-0.5 pl-7 text-[11px] font-semibold text-[#B45309]">
                                    Note: {item.notes}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>

                          {order.customer?.notes && (
                            <p className="mb-2 rounded-lg border border-[#F59E0B]/20 bg-[#F59E0B]/10 px-2 py-1.5 text-[11px] font-semibold text-[#B45309]">
                              Guest note: {order.customer.notes}
                            </p>
                          )}

                          <div className="flex items-center justify-between border-t border-slate-200 pt-2.5">
                            <span className="font-mono text-xs font-bold text-[#64748B]">
                              {formatETB(order.totalAmount)}
                            </span>
                            {order.status === 'pending' || order.status === 'approved' ? (
                              <Button
                                size="sm"
                                disabled={busyId === order._id}
                                onClick={() => updateStatus(order._id, 'preparing')}
                              >
                                <Play className="mr-1 h-3.5 w-3.5" /> Start
                              </Button>
                            ) : order.status === 'preparing' ? (
                              <Button
                                variant="success"
                                size="sm"
                                disabled={busyId === order._id}
                                onClick={() => updateStatus(order._id, 'ready')}
                              >
                                <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Mark Ready
                              </Button>
                            ) : (
                              <span className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-600">
                                <CheckCircle2 className="h-3 w-3" /> Awaiting pickup
                              </span>
                            )}
                          </div>
                        </Card>
                      );
                    })}

                    {columns[key].length === 0 && (
                      <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-[11px] text-[#94A3B8]">
                        No tickets here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-[#94A3B8]">
          <Clock className="h-3 w-3" />
          Timers refresh every 15 seconds · audio alerts enabled
        </div>
      </div>
    </div>
  );
}
