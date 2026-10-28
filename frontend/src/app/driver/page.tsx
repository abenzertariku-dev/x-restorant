'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Order } from '@/types';
import {
  Bike,
  MapPin,
  Phone,
  CheckCircle2,
  Navigation,
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DriverPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsActive, setGpsActive] = useState(false);
  const { user, logout } = useAuth();
  const lastBroadcast = useRef<number>(0);

  const loadDeliveries = async () => {
    try {
      const res = await api<{ success: boolean; orders: Order[] }>('/orders?type=delivery');
      if (res.success) {
        const active = res.orders.filter((o) =>
          ['ready', 'out_for_delivery', 'preparing'].includes(o.status)
        );
        setOrders(active);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDeliveries();

    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCoords(current);
          setGpsActive(true);

          if (Date.now() - lastBroadcast.current > 15000) {
            lastBroadcast.current = Date.now();
            orders.forEach((o) => {
              if (o.status === 'out_for_delivery') {
                api(`/orders/${o._id}/driver-location`, {
                  method: 'POST',
                  body: current,
                }).catch(() => {});
              }
            });
          }
        },
        () => setGpsActive(false),
        { enableHighAccuracy: true }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [orders]);

  const updateStage = async (orderId: string, status: string) => {
    try {
      await api(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: { status },
      });
      loadDeliveries();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1015] p-4 sm:p-6 pb-24 text-[#CBD5E1] selection:bg-[#F59E0B] selection:text-[#0F1015]">
      {/* Driver Header */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-[#14151D] p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F59E0B] text-[#0F1015] shadow-sm">
            <Bike className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#F8FAFC]">DELIVERY DISPATCH</h1>
            <p className="text-xs text-[#94A3B8]">
              Active Courier: <span className="font-bold text-[#F59E0B]">{user?.name || 'Courier Staff'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin" className="flex items-center gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5 text-[#F59E0B]" /> Admin
            </Link>
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

      {/* GPS Status Indicator */}
      <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-white/5 bg-[#171821] px-4 py-3 text-xs max-w-3xl">
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
        <span className="text-[#94A3B8]">
          {gpsActive && coords
            ? `Live GPS Active: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
            : 'Acquiring GPS location for live transit tracking…'}
        </span>
      </div>

      {/* Assigned Delivery Orders */}
      <div className="space-y-4 max-w-3xl">
        {orders.length === 0 ? (
          <Card className="py-24 text-center text-[#94A3B8]">
            <Bike className="mx-auto h-12 w-12 text-[#94A3B8]/30" />
            <h3 className="mt-3 font-extrabold text-[#F8FAFC] text-base">No active delivery assignments</h3>
            <p className="text-xs text-[#94A3B8] mt-1">
              New customer delivery orders will appear here automatically.
            </p>
          </Card>
        ) : (
          orders.map((ord) => {
            const isOut = ord.status === 'out_for_delivery';

            return (
              <Card
                key={ord._id}
                className="p-5 sm:p-6 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-3.5">
                  <div>
                    <span className="text-xs font-bold font-mono text-[#F59E0B]">
                      ORDER #{ord.orderNumber}
                    </span>
                    <h2 className="text-xl font-black text-[#F8FAFC]">{ord.customer?.name || 'Guest'}</h2>
                  </div>
                  <Badge variant="outline" className="px-3.5 py-1 text-xs">
                    {ord.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="my-4 space-y-2.5 text-sm">
                  <div className="flex items-start gap-2.5 text-[#CBD5E1]">
                    <MapPin className="h-4 w-4 shrink-0 text-[#F59E0B] mt-0.5" />
                    <span className="text-xs leading-relaxed">{ord.customer?.address || 'No address specified'}</span>
                  </div>

                  {ord.customer?.phone && (
                    <a
                      href={`tel:${ord.customer.phone}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-3.5 py-1.5 text-xs font-bold text-[#F59E0B] hover:bg-[#F59E0B]/20 transition"
                    >
                      <Phone className="h-3.5 w-3.5" /> Call Customer ({ord.customer.phone})
                    </a>
                  )}
                </div>

                <div className="mt-4 border-t border-white/5 pt-3.5">
                  {!isOut ? (
                    <Button
                      onClick={() => updateStage(ord._id, 'out_for_delivery')}
                      className="w-full flex items-center justify-center gap-2 uppercase tracking-wider text-xs py-3.5 h-auto font-black"
                    >
                      <Navigation className="h-4 w-4 stroke-[2.5]" /> Start Delivery Run
                    </Button>
                  ) : (
                    <Button
                      variant="success"
                      onClick={() => updateStage(ord._id, 'delivered')}
                      className="w-full flex items-center justify-center gap-2 uppercase tracking-wider text-xs py-3.5 h-auto font-black"
                    >
                      <CheckCircle2 className="h-4 w-4 stroke-[2.5]" /> Mark Order Delivered
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
