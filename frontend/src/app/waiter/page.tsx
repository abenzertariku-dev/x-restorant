'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { getSocket } from '@/lib/socket';
import { api, playSoundAlert } from '@/lib/api';
import { Table as TableType, Order } from '@/types';
import { Bell, Receipt, CheckCircle, UtensilsCrossed, LogOut, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function WaiterPage() {
  const [tables, setTables] = useState<TableType[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const { getText } = useLanguage();

  const loadData = async () => {
    try {
      const [tableRes, orderRes] = await Promise.all([
        api<{ success: boolean; tables: TableType[] }>('/tables'),
        api<{ success: boolean; orders: Order[] }>('/orders?status=pending'),
      ]);

      if (tableRes.success) setTables(tableRes.tables);
      if (orderRes.success) setPendingOrders(orderRes.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const socket = getSocket();

    socket.emit('join:room', 'room:waiter');

    socket.on('alert:call_waiter', () => {
      playSoundAlert('urgent');
      loadData();
    });

    socket.on('alert:bill_requested', () => {
      playSoundAlert('chime');
      loadData();
    });

    socket.on('order:pending_approval', (newOrder: Order) => {
      playSoundAlert('urgent');
      setPendingOrders((prev) => [newOrder, ...prev]);
    });

    socket.on('alert:order_ready', () => {
      playSoundAlert('chime');
      loadData();
    });

    return () => {
      socket.emit('leave:room', 'room:waiter');
      socket.off('alert:call_waiter');
      socket.off('alert:bill_requested');
      socket.off('order:pending_approval');
      socket.off('alert:order_ready');
    };
  }, []);

  const approveOrder = async (orderId: string) => {
    try {
      await api(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: { status: 'approved' },
      });
      setPendingOrders((prev) => prev.filter((o) => o._id !== orderId));
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const clearTable = async (tableNumber: number) => {
    try {
      await api(`/tables/${tableNumber}/clear`, { method: 'POST' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const callsCount = tables.filter((t) => t.status === 'call_waiter').length;
  const billsCount = tables.filter((t) => t.status === 'bill_requested').length;

  return (
    <div className="min-h-screen bg-[#0F1015] p-4 sm:p-6 pb-28 text-[#CBD5E1] selection:bg-[#F59E0B] selection:text-[#0F1015]">
      {/* Waiter Header */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-[#14151D] p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F59E0B] text-[#0F1015] shadow-sm">
            <UtensilsCrossed className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#F8FAFC]">WAITER STATION</h1>
            <p className="text-xs text-[#94A3B8]">
              Active Server: <span className="font-bold text-[#F59E0B]">{user?.name || 'Staff'}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {callsCount > 0 && (
            <Badge variant="destructive" className="animate-pulse px-3.5 py-1.5 text-xs flex items-center gap-1.5">
              <Bell className="h-3.5 w-3.5" /> {callsCount} Calling
            </Badge>
          )}
          {billsCount > 0 && (
            <Badge variant="warning" className="animate-pulse px-3.5 py-1.5 text-xs flex items-center gap-1.5">
              <Receipt className="h-3.5 w-3.5" /> {billsCount} Bill Req
            </Badge>
          )}

          <Button variant="outline" size="sm" asChild>
            <Link href="/admin" className="flex items-center gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5 text-[#F59E0B]" /> Admin
            </Link>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={loadData}
            title="Refresh Floor"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={logout}
            className="flex items-center gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" /> Exit
          </Button>
        </div>
      </header>

      {/* Pending Customer QR Orders section */}
      {pendingOrders.length > 0 && (
        <Card className="mb-6 p-5 border-[#F59E0B]/30 shadow-sm">
          <h2 className="flex items-center gap-2 font-black text-[#F59E0B] text-base">
            <UtensilsCrossed className="h-5 w-5" />
            Incoming QR Orders Pending Approval ({pendingOrders.length})
          </h2>
          <div className="mt-4 grid gap-3.5 md:grid-cols-2">
            {pendingOrders.map((ord) => (
              <div
                key={ord._id}
                className="rounded-xl border border-white/5 bg-[#1D1E2A] p-4 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <span className="font-black text-lg text-[#F8FAFC]">Table {ord.tableNumber}</span>
                  <span className="font-mono text-xs font-bold text-[#F59E0B]">#{ord.orderNumber}</span>
                </div>
                <div className="my-3 space-y-1.5">
                  {ord.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-[#CBD5E1]">
                      <span>
                        <b className="text-[#F8FAFC]">{it.qty}×</b> {getText(it.name)}
                      </span>
                      <span className="font-mono font-bold text-[#F59E0B]">{it.price * it.qty} ETB</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2.5">
                  <span className="text-xs font-bold text-[#94A3B8]">Total: {ord.totalAmount} ETB</span>
                  <Button
                    onClick={() => approveOrder(ord._id)}
                    size="sm"
                    className="flex items-center gap-1.5 uppercase tracking-wider text-xs"
                  >
                    <CheckCircle className="h-4 w-4 stroke-[2.5]" /> Approve Order
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Dining Floor Tables Grid */}
      <section>
        <h2 className="mb-4 font-black tracking-tight text-[#F8FAFC] text-lg">Floor Plan & Table Status</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {tables.map((table) => {
            const isCall = table.status === 'call_waiter';
            const isBill = table.status === 'bill_requested';
            const isOccupied = table.status === 'occupied';

            return (
              <Card
                key={table._id}
                className={`flex flex-col justify-between p-4 shadow-sm transition-all ${
                  isCall
                    ? 'animate-pulse border-rose-500/50 bg-rose-500/10'
                    : isBill
                    ? 'animate-pulse border-amber-500/50 bg-amber-500/10'
                    : isOccupied
                    ? 'border-sky-500/30 bg-sky-500/5'
                    : 'border-white/5 bg-[#171821]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-[#F8FAFC]">#{table.tableNumber}</span>
                    <span className="text-[10px] font-bold uppercase text-[#94A3B8]">{table.zone}</span>
                  </div>

                  <div className="mt-2.5">
                    {isCall ? (
                      <Badge variant="destructive" className="text-[10px] font-black">
                        CALL WAITER
                      </Badge>
                    ) : isBill ? (
                      <Badge variant="warning" className="text-[10px] font-black">
                        BILL REQ
                      </Badge>
                    ) : isOccupied ? (
                      <Badge variant="info" className="text-[10px] font-bold">
                        OCCUPIED
                      </Badge>
                    ) : (
                      <Badge variant="success" className="text-[10px] font-bold">
                        AVAILABLE
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-2">
                  {table.status !== 'available' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => clearTable(table.tableNumber)}
                      className="w-full text-xs"
                    >
                      Clear Table
                    </Button>
                  ) : (
                    <div className="text-center text-[10px] font-semibold text-[#64748B]">
                      Seats {table.capacity} Guests
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
