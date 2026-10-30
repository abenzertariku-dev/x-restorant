'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bike,
  MapPin,
  Phone,
  CheckCircle2,
  Navigation,
  RefreshCw,
  ExternalLink,
  Clock,
  PackageCheck,
  Route,
  AlertTriangle,

  Wallet,
} from 'lucide-react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { PortalHeader } from '@/components/shared/PortalHeader';
import { PortalLoading } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { getSocket, joinRoom } from '@/lib/socket';
import { elapsedMinutes, formatETB, paymentLabel, statusVariant } from '@/lib/format';
import { useLanguage } from '@/context/LanguageContext';
import type { Order } from '@/types';

export default function DriverPage() {
  return (
    <AuthGuard roles={['driver', 'manager', 'admin']}>
      <DriverDispatch />
    </AuthGuard>
  );
}

function DriverDispatch() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsActive, setGpsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const lastBroadcast = useRef(0);
  const ordersRef = useRef<Order[]>([]);

  const loadDeliveries = useCallback(async () => {
    const res = await api<{ success: boolean; orders: Order[] }>('/orders?type=delivery&limit=100');
    if (res.success) {
      const active = res.orders.filter((order) =>
        ['preparing', 'ready', 'out_for_delivery'].includes(order.status)
      );
      setOrders(active);
      ordersRef.current = active;
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await loadDeliveries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deliveries.');
    } finally {
      setLoading(false);
    }
  }, [loadDeliveries]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  useEffect(() => {
    const socket = getSocket();
    joinRoom('driver');
    const reload = () => loadDeliveries();
    socket.on('order:created', reload);
    socket.on('order:updated', reload);
    socket.on('order:settled', reload);
    return () => {
      socket.off('order:created', reload);
      socket.off('order:updated', reload);
      socket.off('order:settled', reload);
    };
  }, [loadDeliveries]);

  useEffect(() => {
    if (!('geolocation' in navigator)) return;

    const broadcast = (current: { lat: number; lng: number }) => {
      const inTransit = ordersRef.current.filter((order) => order.status === 'out_for_delivery');
      if (inTransit.length === 0) return;
      if (Date.now() - lastBroadcast.current < 15000) return;
      lastBroadcast.current = Date.now();
      inTransit.forEach((order) => {
        api(`/orders/${order._id}/driver-location`, {
          method: 'POST',
          body: current,
        }).catch(() => {});
      });
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const current = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCoords(current);
        setGpsActive(true);
        broadcast(current);
      },
      () => setGpsActive(false),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const updateStage = async (orderId: string, status: 'out_for_delivery' | 'delivered') => {
    setBusyId(orderId);
    setError('');
    try {
      await api(`/orders/${orderId}/status`, { method: 'PATCH', body: { status } });
      await loadDeliveries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update delivery.');
    } finally {
      setBusyId('');
    }
  };

  const stats = useMemo(
    () => ({
      ready: orders.filter((order) => order.status === 'ready').length,
      transit: orders.filter((order) => order.status === 'out_for_delivery').length,
      preparing: orders.filter((order) => order.status === 'preparing').length,
      value: orders.reduce((sum, order) => sum + order.totalAmount, 0),
    }),
    [orders]
  );

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-[#334155] selection:bg-[#F59E0B] selection:text-[#0F1015]">
      <div className="mx-auto w-full max-w-4xl p-4 pb-24 sm:p-6 lg:p-8">
        <PortalHeader
          title="Delivery Dispatch"
          subtitle={`${orders.length} active runs · ${stats.transit} in transit · GPS ${
            gpsActive ? 'live' : 'acquiring'
          }`}
          icon={Bike}
          roleLabel="Driver"
          showLanguage
        >
          <Button variant="outline" size="sm" onClick={load} title="Refresh deliveries">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </PortalHeader>

        <div
          className={`mb-5 flex flex-wrap items-center gap-2.5 rounded-xl border px-4 py-3 text-xs ${
            gpsActive
              ? 'border-emerald-500/20 bg-emerald-500/[0.04]'
              : 'border-[#F59E0B]/20 bg-[#F59E0B]/[0.04]'
          }`}
        >
          <span className="relative flex h-3 w-3">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                gpsActive ? 'animate-ping bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex h-3 w-3 rounded-full ${
                gpsActive ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </span>
          <span className="text-[#64748B]">
            {gpsActive && coords
              ? `Live GPS broadcasting to customers · ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
              : 'Acquiring GPS location for live transit tracking…'}
          </span>
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

        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Preparing', value: stats.preparing, icon: Clock, tone: 'text-orange-600' },
            { label: 'Ready', value: stats.ready, icon: PackageCheck, tone: 'text-emerald-600' },
            { label: 'On the road', value: stats.transit, icon: Route, tone: 'text-sky-600' },
            {
              label: 'Run value',
              value: formatETB(stats.value),
              icon: Wallet,
              tone: 'text-[#B45309]',
            },
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

        {loading ? (
          <PortalLoading label="Loading dispatch" columns={2} />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={Bike}
            title="No active delivery assignments"
            description="New delivery orders will appear here automatically."
            className="py-20"
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isOut = order.status === 'out_for_delivery';
              const isReady = order.status === 'ready';
              const address = order.customer?.address || '';
              const mapsUrl = address
                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
                : '#';

              return (
                <Card key={order._id} className="p-5 shadow-sm sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-3.5">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#B45309]">
                        ORDER #{order.orderNumber}
                      </span>
                      <h2 className="text-xl font-black text-[#0F172A]">
                        {order.customer?.name || 'Guest'}
                      </h2>
                      <p className="mt-0.5 text-[10px] text-[#94A3B8]">
                        <Clock className="mr-1 inline h-3 w-3" />
                        {elapsedMinutes(order.createdAt)} min ago · {order.items.length} items
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <Badge variant={statusVariant(order.status)}>{t(order.status)}</Badge>
                      <span className="font-mono text-sm font-black text-[#0F172A]">
                        {formatETB(order.totalAmount)}
                      </span>
                      <span className="text-[10px] uppercase text-[#94A3B8]">
                        {paymentLabel(order.payment?.method)}
                      </span>
                    </div>
                  </div>

                  <div className="my-4 space-y-2.5 text-sm">
                    <div className="flex items-start gap-2.5 text-[#334155]">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#B45309]" />
                      <span className="text-xs leading-relaxed">
                        {address || 'No address specified'}
                      </span>
                    </div>

                    {order.customer?.notes && (
                      <p className="rounded-lg border border-[#F59E0B]/20 bg-[#F59E0B]/10 px-3 py-2 text-[11px] text-[#B45309]">
                        Delivery note: {order.customer.notes}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {order.customer?.phone && (
                        <a
                          href={`tel:${order.customer.phone}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-3 py-1.5 text-xs font-bold text-[#B45309] transition hover:bg-[#F59E0B]/20"
                        >
                          <Phone className="h-3.5 w-3.5" /> {order.customer.phone}
                        </a>
                      )}
                      {address && (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-[#FFFFFF] px-3 py-1.5 text-xs font-bold text-[#334155] transition hover:border-slate-300"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> Open in Maps
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="mb-3 rounded-xl border border-slate-200 bg-[#FFFFFF] p-3 text-[11px]">
                    {order.items.map((item, index) => (
                      <div key={`${item.menuItem}-${index}`} className="flex justify-between text-[#64748B]">
                        <span>
                          {item.qty}× {item.name.en}
                        </span>
                        <span className="font-mono">{formatETB(item.qty * item.price)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mb-4 flex items-center gap-1">
                    {['preparing', 'out_for_delivery', 'delivered'].map((step, index) => {
                      const labels = ['Kitchen', 'On the road', 'Delivered'];
                      const progress =
                        order.status === 'preparing'
                          ? 0
                          : order.status === 'ready'
                            ? 0.5
                            : order.status === 'out_for_delivery'
                              ? 1
                              : 2;
                      const reached = index <= progress;
                      return (
                        <div key={step} className="flex flex-1 items-center gap-1">
                          <div className="flex flex-1 flex-col items-center gap-1">
                            <span
                              className={`h-1.5 w-full rounded-full ${
                                reached ? 'bg-[#F59E0B]' : 'bg-slate-100'
                              }`}
                            />
                            <span
                              className={`text-[9px] font-bold uppercase ${
                                reached ? 'text-[#B45309]' : 'text-[#94A3B8]'
                              }`}
                            >
                              {labels[index]}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-200 pt-3.5">
                    {isOut ? (
                      <Button
                        variant="success"
                        disabled={busyId === order._id}
                        onClick={() => updateStage(order._id, 'delivered')}
                        className="h-auto w-full py-3.5 text-xs font-black uppercase tracking-wider"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4 stroke-[2.5]" /> Mark Order Delivered
                      </Button>
                    ) : (
                      <Button
                        disabled={busyId === order._id || !isReady}
                        onClick={() => updateStage(order._id, 'out_for_delivery')}
                        className="h-auto w-full py-3.5 text-xs font-black uppercase tracking-wider"
                      >
                        <Navigation className="mr-2 h-4 w-4 stroke-[2.5]" />
                        {isReady ? 'Start Delivery Run' : 'Waiting for kitchen to finish'}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
