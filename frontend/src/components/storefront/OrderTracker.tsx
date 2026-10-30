'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ChefHat,
  Clock,
  PackageCheck,
  Bike,
  X,
  UtensilsCrossed,
  Radio,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { OrderStatus } from '@/types';
import { getSocket, joinRoom } from '@/lib/socket';
import { formatETB, statusTranslationKey, statusVariant } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';

export interface TrackingInfo {
  orderId: string;
  orderNumber: number;
  type: 'dine_in' | 'takeaway' | 'delivery';
  status: OrderStatus;
  total: number;
}

interface OrderTrackerProps {
  tracking: TrackingInfo;
  onClose: () => void;
}

const steps: { key: OrderStatus; label: string; icon: typeof Clock }[] = [
  { key: 'pending', label: 'Received', icon: Clock },
  { key: 'preparing', label: 'Cooking', icon: ChefHat },
  { key: 'ready', label: 'Ready', icon: PackageCheck },
  { key: 'out_for_delivery', label: 'On the way', icon: Bike },
  { key: 'delivered', label: 'Delivered', icon: UtensilsCrossed },
];

const progressIndex = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
    case 'approved':
      return 0;
    case 'preparing':
      return 1;
    case 'ready':
    case 'served':
      return 2;
    case 'out_for_delivery':
      return 3;
    case 'delivered':
    case 'settled':
      return 4;
    default:
      return 0;
  }
};

export function OrderTracker({ tracking, onClose }: OrderTrackerProps) {
  const { t } = useLanguage();
  const [status, setStatus] = useState<OrderStatus>(tracking.status);

  useEffect(() => {
    const socket = getSocket();
    joinRoom(`order:${tracking.orderId}`);

    const onUpdate = (payload: { status?: OrderStatus }) => {
      if (payload?.status) setStatus(payload.status);
    };
    socket.on(`order:${tracking.orderId}`, onUpdate);

    return () => {
      socket.off(`order:${tracking.orderId}`, onUpdate);
    };
  }, [tracking.orderId]);

  const current = progressIndex(status);
  const visibleSteps = tracking.type === 'delivery' ? steps : steps.filter((step) => step.key !== 'out_for_delivery');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Tracking order ${tracking.orderNumber}`}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <div className="my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-slate-200 bg-[#FFFFFF] p-5 text-[#334155] shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:p-6">
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">
              <Radio className="h-3 w-3 animate-pulse" /> Live order tracking
            </p>
            <h3 className="mt-1 text-2xl font-black text-[#0F172A]">
              Order #{tracking.orderNumber}
            </h3>
            <p className="text-xs text-[#64748B]">
              {tracking.type === 'delivery'
                ? 'Delivery to your address'
                : tracking.type === 'takeaway'
                  ? 'Takeaway pickup'
                  : 'Dine-in service'}{' '}
              · {formatETB(tracking.total)}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close tracking">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="my-5 flex flex-wrap items-center gap-2">
          <Badge variant={statusVariant(status)}>{t(statusTranslationKey(status))}</Badge>
          <span className="text-[10px] text-[#94A3B8]">
            {status === 'pending' && 'The restaurant is confirming your order.'}
            {status === 'preparing' && 'The kitchen is preparing your dishes.'}
            {status === 'ready' && 'Your order is ready.'}
            {status === 'out_for_delivery' && 'Your courier is on the way.'}
            {status === 'delivered' && 'Enjoy your meal!'}
            {status === 'settled' && 'Payment verified. Thank you!'}
            {status === 'cancelled' && 'This order was cancelled.'}
          </span>
        </div>

        <div className="space-y-0">
          {visibleSteps.map((step, index) => {
            const active = index <= current;
            const isCurrent =
              index === current ||
              (status === 'settled' && index === visibleSteps.length - 1);
            const Icon = step.icon;
            return (
              <div key={step.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                      active
                        ? 'border-[#F59E0B] bg-[#F59E0B]/15 text-[#B45309]'
                        : 'border-slate-200 bg-[#FFFFFF] text-[#94A3B8]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {index < visibleSteps.length - 1 && (
                    <span
                      className={`my-1 h-8 w-0.5 ${
                        index < current ? 'bg-[#F59E0B]' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
                <div className="pt-2">
                  <p
                    className={`text-xs font-bold ${
                      isCurrent ? 'text-[#B45309]' : active ? 'text-[#0F172A]' : 'text-[#94A3B8]'
                    }`}
                  >
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p className="text-[10px] text-[#64748B]">Current stage</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex gap-2">
          <Button className="flex-1" onClick={onClose}>
            <CheckCircle2 className="mr-1.5 h-4 w-4" /> Order More
          </Button>
        </div>
        <p className="mt-3 text-center text-[10px] text-[#94A3B8]">
          Keep this window open for live updates from the kitchen and cashier.
        </p>
      </div>
    </div>
  );
}
