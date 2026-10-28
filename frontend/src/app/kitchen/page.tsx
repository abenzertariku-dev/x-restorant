'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { getSocket } from '@/lib/socket';
import { api, playSoundAlert } from '@/lib/api';
import { Order } from '@/types';
import { ChefHat, Clock, CheckCircle2, Flame, LogOut, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const { getText } = useLanguage();

  const loadOrders = async () => {
    try {
      const res = await api<{ success: boolean; orders: Order[] }>('/orders');
      if (res.success) {
        const active = res.orders.filter((o) =>
          ['preparing', 'approved', 'ready', 'pending'].includes(o.status)
        );
        setOrders(active);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const socket = getSocket();

    socket.emit('join:room', 'room:kitchen');

    socket.on('kds:new_ticket', (newOrder: Order) => {
      playSoundAlert('urgent');
      setOrders((prev) => [newOrder, ...prev.filter((o) => o._id !== newOrder._id)]);
    });

    return () => {
      socket.emit('leave:room', 'room:kitchen');
      socket.off('kds:new_ticket');
    };
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await api(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: { status: newStatus },
      });
      loadOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const getElapsedMinutes = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    return Math.max(0, diff);
  };

  return (
    <div className="min-h-screen bg-[#0F1015] p-4 sm:p-6 text-[#CBD5E1] selection:bg-[#F59E0B] selection:text-[#0F1015]">
      {/* KDS Dark Operational Header */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/5 bg-[#14151D] p-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F59E0B] text-[#0F1015] shadow">
            <ChefHat className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#F8FAFC] tracking-tight">KITCHEN DISPLAY SYSTEM (KDS)</h1>
            <p className="text-xs text-[#94A3B8]">
              Live Prep Tickets · Station Chef:{' '}
              <span className="font-bold text-[#F59E0B]">{user?.name || 'Chef'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin" className="flex items-center gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5 text-[#F59E0B]" /> Admin Dashboard
            </Link>
          </Button>

          <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#1E202B] px-4 py-2 text-xs font-bold text-[#F8FAFC]">
            <Flame className="h-4 w-4 text-[#F59E0B]" />
            Active Tickets: <b className="text-[#F59E0B]">{orders.length}</b>
          </span>

          <Button
            variant="destructive"
            size="sm"
            onClick={logout}
            className="flex items-center gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            Exit
          </Button>
        </div>
      </header>

      {/* Ticket Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-[#171821] border border-white/5" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-28 text-[#94A3B8]">
          <ChefHat className="h-16 w-16 stroke-1 text-white/20" />
          <h2 className="mt-4 text-xl font-bold text-[#F8FAFC]">Kitchen is all clear!</h2>
          <p className="text-xs text-[#94A3B8]">Incoming approved orders will appear here automatically with audio alert.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {orders.map((order) => {
            const elapsed = getElapsedMinutes(order.createdAt);
            const isLate = elapsed >= 15;
            const isReady = order.status === 'ready';
            const isNew = order.status === 'pending' || order.status === 'approved';

            const badgeVariant = isReady
              ? 'success'
              : isLate
              ? 'destructive'
              : isNew
              ? 'info'
              : 'warning';

            const statusLabel = isReady
              ? 'Ready'
              : isLate
              ? 'Delayed'
              : isNew
              ? 'New'
              : 'Preparing';

            return (
              <Card
                key={order._id}
                className={`flex flex-col justify-between p-5 shadow-xl transition-all ${
                  isReady
                    ? 'border-emerald-500/40 bg-[#171821]'
                    : isLate
                    ? 'border-rose-500/40 bg-[#171821]'
                    : 'border-white/5 bg-[#171821]'
                }`}
              >
                {/* Ticket Top */}
                <div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#F59E0B]">
                        {order.type === 'dine_in' ? `Table ${order.tableNumber}` : 'Delivery / Online'}
                      </span>
                      <h3 className="text-xl font-black text-[#F8FAFC]">#{order.orderNumber}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={badgeVariant} className={isLate ? 'animate-pulse' : ''}>
                        {statusLabel}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-[#94A3B8] font-mono">
                        <Clock className="h-3.5 w-3.5 text-[#F59E0B]" />
                        <span>{elapsed}m</span>
                      </div>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="my-4 space-y-2.5">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold leading-tight text-[#F8FAFC]">
                            <span className="mr-2 inline-block rounded bg-[#1E202B] px-2 py-0.5 text-xs font-black text-[#F59E0B]">
                              {item.qty}×
                            </span>
                            {getText(item.name)}
                          </p>
                          {item.notes && (
                            <p className="mt-1 text-xs font-semibold text-[#F59E0B]">
                              ⚠️ Note: {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ticket Bottom Actions */}
                <div className="pt-3 border-t border-white/5">
                  {!isReady ? (
                    <Button
                      variant="success"
                      onClick={() => updateStatus(order._id, 'ready')}
                      className="w-full flex items-center justify-center gap-2 uppercase tracking-wider text-xs py-3 h-auto font-black"
                    >
                      <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
                      MARK READY
                    </Button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2.5 text-xs font-bold text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" /> Ready for Waiter Pickup
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
