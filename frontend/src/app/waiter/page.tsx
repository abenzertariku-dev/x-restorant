'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Receipt,
  CheckCircle,
  UtensilsCrossed,
  RefreshCw,
  ChefHat,
  Clock,
  XCircle,
  AlertTriangle,
  Loader2,
  Users,
  ArrowRight,
} from 'lucide-react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { PortalHeader } from '@/components/shared/PortalHeader';
import { TableOrderModal } from '@/components/waiter/TableOrderModal';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api, playSoundAlert } from '@/lib/api';
import { getSocket, joinRoom } from '@/lib/socket';
import { elapsedMinutes, formatETB } from '@/lib/format';
import { useLanguage } from '@/context/LanguageContext';
import type { Category, MenuItem, Order, OrderStatus, Table } from '@/types';

type CategoryWithItems = Category & { items: MenuItem[] };

export default function WaiterPage() {
  return (
    <AuthGuard roles={['waiter', 'manager', 'admin']}>
      <WaiterStation />
    </AuthGuard>
  );
}

function WaiterStation() {
  const { getText } = useLanguage();
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<CategoryWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [busyId, setBusyId] = useState('');
  const [placing, setPlacing] = useState(false);

  const loadTables = useCallback(async () => {
    const res = await api<{ success: boolean; tables: Table[] }>('/tables');
    if (res.success) setTables(res.tables);
  }, []);

  const loadOrders = useCallback(async () => {
    const res = await api<{ success: boolean; orders: Order[] }>('/orders?limit=100');
    if (res.success) setOrders(res.orders);
  }, []);

  const loadMenu = useCallback(async () => {
    const res = await api<{ success: boolean; categories: CategoryWithItems[] }>('/menu');
    if (res.success) setCategories(res.categories);
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([loadTables(), loadOrders()]);
  }, [loadTables, loadOrders]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([loadTables(), loadOrders(), loadMenu()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load floor data.');
    } finally {
      setLoading(false);
    }
  }, [loadTables, loadOrders, loadMenu]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    const socket = getSocket();
    joinRoom('waiter');

    const reload = () => {
      loadTables();
      loadOrders();
    };

    socket.on('alert:call_waiter', () => {
      playSoundAlert('urgent');
      reload();
    });
    socket.on('alert:bill_requested', () => {
      playSoundAlert('chime');
      reload();
    });
    socket.on('order:pending_approval', () => {
      playSoundAlert('urgent');
      reload();
    });
    socket.on('alert:order_ready', () => {
      playSoundAlert('chime');
      reload();
    });
    socket.on('table:status', reload);
    socket.on('order:created', reload);
    socket.on('order:settled', reload);

    return () => {
      socket.off('alert:call_waiter');
      socket.off('alert:bill_requested');
      socket.off('order:pending_approval');
      socket.off('alert:order_ready');
      socket.off('table:status', reload);
      socket.off('order:created', reload);
      socket.off('order:settled', reload);
    };
  }, [loadTables, loadOrders]);

  const pendingOrders = useMemo(
    () =>
      orders
        .filter((order) => order.status === 'pending')
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [orders]
  );
  const readyOrders = useMemo(
    () => orders.filter((order) => order.status === 'ready'),
    [orders]
  );
  const calls = tables.filter((table) => table.status === 'call_waiter');
  const bills = tables.filter((table) => table.status === 'bill_requested');
  const selectedTable = useMemo(
    () => tables.find((table) => table.tableNumber === selectedNumber) || null,
    [tables, selectedNumber]
  );

  const action = async (id: string, fn: () => Promise<void>) => {
    setBusyId(id);
    setError('');
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setBusyId('');
    }
  };

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    await api(`/orders/${orderId}/status`, { method: 'PATCH', body: { status } });
    await refresh();
  };

  const clearTable = async (tableNumber: number) => {
    await api(`/tables/${tableNumber}/clear`, { method: 'POST' });
    await refresh();
  };

  const placeOrder = async (
    tableNumber: number,
    items: { menuItemId: string; qty: number; notes: string }[],
    notes: string
  ) => {
    setPlacing(true);
    setError('');
    try {
      const res = await api<{ success: boolean; order: Order }>('/orders', {
        method: 'POST',
        body: {
          type: 'dine_in',
          tableNumber,
          customer: {
            name: `Table ${tableNumber}`,
            notes,
          },
          items,
          payment: { method: 'unpaid', status: 'pending' },
        },
      });
      if (res.order?.status === 'pending') {
        await api(`/orders/${res.order._id}/status`, {
          method: 'PATCH',
          body: { status: 'approved' },
        });
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not place order.');
      throw err;
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1015] text-[#CBD5E1] selection:bg-[#F59E0B] selection:text-[#0F1015]">
      <div className="mx-auto w-full max-w-[1500px] p-4 pb-28 sm:p-6 lg:p-8">
        <PortalHeader
          title="Waiter Floor Service"
          subtitle={`${tables.length} tables · ${pendingOrders.length} approvals · ${readyOrders.length} ready to pick up`}
          icon={UtensilsCrossed}
          roleLabel="Waiter"
          showLanguage
        >
          {(calls.length > 0 || bills.length > 0) && (
            <Badge variant="destructive" className="animate-pulse">
              <Bell className="mr-1 h-3.5 w-3.5" /> {calls.length + bills.length} alerts
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={refresh} title="Refresh floor">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </PortalHeader>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-400">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={() => setError('')}
              className="cursor-pointer text-rose-300 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[55vh] flex-col items-center justify-center gap-3 text-[#94A3B8]">
            <Loader2 className="h-8 w-8 animate-spin text-[#F59E0B]" />
            <p className="text-xs font-bold uppercase tracking-widest">Loading floor…</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                {
                  label: 'Calling Waiter',
                  value: calls.length,
                  icon: Bell,
                  tone: 'text-rose-400',
                },
                {
                  label: 'Bill Requests',
                  value: bills.length,
                  icon: Receipt,
                  tone: 'text-[#F59E0B]',
                },
                {
                  label: 'Pending Approval',
                  value: pendingOrders.length,
                  icon: Clock,
                  tone: 'text-orange-400',
                },
                {
                  label: 'Ready to Serve',
                  value: readyOrders.length,
                  icon: ChefHat,
                  tone: 'text-emerald-400',
                },
              ].map((stat) => (
                <Card key={stat.label} className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
                        {stat.label}
                      </p>
                      <p className="mt-1 text-lg font-black text-[#F8FAFC]">{stat.value}</p>
                    </div>
                    <stat.icon className={`h-5 w-5 ${stat.tone}`} />
                  </div>
                </Card>
              ))}
            </div>

            {(calls.length > 0 || bills.length > 0) && (
              <Card className="border-[#F59E0B]/30 bg-[#F59E0B]/[0.05] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-xs font-extrabold text-[#F59E0B]">
                    <Bell className="h-4 w-4 animate-pulse" /> Guest requests need attention
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {calls.map((table) => (
                      <button
                        key={table._id}
                        type="button"
                        onClick={() => setSelectedNumber(table.tableNumber)}
                        className="cursor-pointer rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-[11px] font-bold text-rose-300 hover:bg-rose-500/20"
                      >
                        Table {table.tableNumber} · Call
                      </button>
                    ))}
                    {bills.map((table) => (
                      <button
                        key={table._id}
                        type="button"
                        onClick={() => setSelectedNumber(table.tableNumber)}
                        className="cursor-pointer rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-2.5 py-1.5 text-[11px] font-bold text-[#F59E0B] hover:bg-[#F59E0B]/20"
                      >
                        Table {table.tableNumber} · Bill
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {pendingOrders.length > 0 && (
              <Card className="border-[#F59E0B]/25 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-base font-extrabold text-[#F59E0B]">
                    <Clock className="h-5 w-5" /> Orders Waiting for Approval
                  </h2>
                  <Badge variant="warning">{pendingOrders.length}</Badge>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {pendingOrders.map((order) => (
                    <div
                      key={order._id}
                      className="rounded-xl border border-white/5 bg-[#1D1E2A] p-3.5"
                    >
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="font-mono text-xs font-black text-[#F59E0B]">
                          #{order.orderNumber}
                        </span>
                        <span className="text-[10px] font-bold text-[#94A3B8]">
                          {order.type === 'dine_in'
                            ? `Table ${order.tableNumber}`
                            : order.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="my-2 space-y-1 text-xs">
                        {order.items.map((item, i) => (
                          <div key={`${item.menuItem}-${i}`} className="flex justify-between gap-2">
                            <span className="text-[#CBD5E1]">
                              {item.qty}× {getText(item.name)}
                            </span>
                            <span className="font-mono text-[#94A3B8]">
                              {formatETB(item.qty * item.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between border-t border-white/5 pt-2">
                        <span className="font-mono text-xs font-black text-[#F8FAFC]">
                          {formatETB(order.totalAmount)}
                        </span>
                        <div className="flex gap-1.5">
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={busyId === order._id}
                            onClick={() =>
                              action(order._id, () => updateStatus(order._id, 'cancelled'))
                            }
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            disabled={busyId === order._id}
                            onClick={() =>
                              action(order._id, () => updateStatus(order._id, 'approved'))
                            }
                          >
                            <CheckCircle className="mr-1 h-3.5 w-3.5" /> Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {readyOrders.length > 0 && (
              <Card className="border-emerald-500/25 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-base font-extrabold text-emerald-400">
                    <ChefHat className="h-5 w-5" /> Ready for Pickup
                  </h2>
                  <Badge variant="success">{readyOrders.length}</Badge>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {readyOrders.map((order) => (
                    <div
                      key={order._id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3.5"
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-sm font-black text-emerald-400">
                          #{order.orderNumber}
                        </p>
                        <p className="truncate text-[11px] text-[#CBD5E1]">
                          {order.type === 'dine_in'
                            ? `Table ${order.tableNumber}`
                            : order.customer?.name || 'Guest'}{' '}
                          · {order.items.length} items
                        </p>
                        <p className="text-[10px] text-[#64748B]">
                          {elapsedMinutes(order.createdAt)} min total
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === order._id}
                        onClick={() =>
                          action(order._id, () => updateStatus(order._id, 'served'))
                        }
                      >
                        <UtensilsCrossed className="mr-1 h-3.5 w-3.5" /> Served
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <section>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-[#F8FAFC]">
                    Dining Floor & Table Status
                  </h2>
                  <p className="text-xs text-[#94A3B8]">
                    Tap a table to take an order, serve food or clear the table.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {tables.map((table) => {
                  const isCall = table.status === 'call_waiter';
                  const isBill = table.status === 'bill_requested';
                  const isOccupied = table.status === 'occupied';
                  const activeOrders = table.orders || [];
                  const orderTotal = activeOrders.reduce((sum, o) => sum + o.totalAmount, 0);

                  return (
                    <button
                      key={table._id}
                      type="button"
                      onClick={() => setSelectedNumber(table.tableNumber)}
                      className={`flex cursor-pointer flex-col justify-between rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${
                        isCall
                          ? 'animate-pulse border-rose-500/50 bg-rose-500/10'
                          : isBill
                            ? 'border-[#F59E0B]/50 bg-[#F59E0B]/10'
                            : isOccupied
                              ? 'border-sky-500/30 bg-sky-500/5'
                              : 'border-white/5 bg-[#171821]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-black text-[#F8FAFC]">
                            #{table.tableNumber}
                          </span>
                          <span className="text-[9px] font-bold uppercase text-[#94A3B8]">
                            {table.zone}
                          </span>
                        </div>
                        <div className="mt-2">
                          {isCall ? (
                            <Badge variant="destructive">CALL WAITER</Badge>
                          ) : isBill ? (
                            <Badge variant="warning">BILL REQ</Badge>
                          ) : isOccupied ? (
                            <Badge variant="info">OCCUPIED</Badge>
                          ) : (
                            <Badge variant="success">AVAILABLE</Badge>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 border-t border-white/5 pt-2 text-[10px] text-[#94A3B8]">
                        {activeOrders.length > 0 ? (
                          <div className="flex items-center justify-between">
                            <span>
                              <Users className="mr-1 inline h-3 w-3" />
                              {activeOrders.length} order(s)
                            </span>
                            <span className="font-mono font-bold text-[#F8FAFC]">
                              {formatETB(orderTotal)}
                            </span>
                          </div>
                        ) : (
                          <span>Seats {table.capacity} guests</span>
                        )}
                      </div>
                    </button>
                  );
                })}
                {tables.length === 0 && (
                  <p className="col-span-full rounded-2xl border border-dashed border-white/10 py-12 text-center text-xs text-[#94A3B8]">
                    No tables returned by the server.
                  </p>
                )}
              </div>

              <div className="mt-4 flex justify-center">
                <Button variant="outline" size="sm" onClick={refresh}>
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh floor
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
            </section>
          </div>
        )}
      </div>

      <TableOrderModal
        open={selectedNumber !== null}
        table={selectedTable}
        categories={categories}
        onClose={() => setSelectedNumber(null)}
        onPlaceOrder={placeOrder}
        onOrderStatus={async (orderId, status) => {
          await updateStatus(orderId, status);
        }}
        onClearTable={clearTable}
        placing={placing}
      />
    </div>
  );
}
