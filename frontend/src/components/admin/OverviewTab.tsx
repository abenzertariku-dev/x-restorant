'use client';

import React, { useMemo } from 'react';
import {
  Banknote,
  ClipboardList,
  CookingPot,
  CreditCard,
  LayoutGrid,
  Settings2,
  TrendingUp,
  Users,
  ChefHat,
  ArrowRight,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Order, RestaurantSetting } from '@/types';
import { formatETB, formatClock, paymentLabel, statusTranslationKey, statusVariant } from '@/lib/format';
import { useLanguage } from '@/context/LanguageContext';

interface OverviewTabProps {
  orders: Order[];
  settings: RestaurantSetting | null;
  onOpenOrders: () => void;
  onOpenMenu: () => void;
  onOpenSettings: () => void;
}

const startOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const paidOrders = (orders: Order[]) => orders.filter((o) => o.status === 'settled');

export function OverviewTab({
  orders,
  settings,
  onOpenOrders,
  onOpenMenu,
  onOpenSettings,
}: OverviewTabProps) {
  const { t } = useLanguage();

  const stats = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 6);

    const settled = paidOrders(orders);
    const todayOrders = settled.filter((o) => new Date(o.createdAt) >= today);
    const weekOrders = settled.filter((o) => new Date(o.createdAt) >= weekStart);
    const revenueToday = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const revenueWeek = weekOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const revenueAll = settled.reduce((sum, o) => sum + o.totalAmount, 0);
    const avgTicket = settled.length ? revenueAll / settled.length : 0;

    const active = orders.filter(
      (o) => o.status !== 'settled' && o.status !== 'cancelled' && o.status !== 'delivered'
    );

    const dishMap = new Map<string, { name: string; qty: number; revenue: number }>();
    orders
      .filter((o) => o.status !== 'cancelled')
      .forEach((o) =>
        o.items.forEach((line) => {
          const key = line.menuItem || line.name.en;
          const existing = dishMap.get(key) || {
            name: line.name.en,
            qty: 0,
            revenue: 0,
          };
          existing.qty += line.qty;
          existing.revenue += line.qty * line.price;
          dishMap.set(key, existing);
        })
      );
    const topDishes = [...dishMap.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);

    const paymentMap = new Map<string, number>();
    settled.forEach((o) => {
      if (o.payment?.splits?.length) {
        o.payment.splits.forEach((split) =>
          paymentMap.set(split.method, (paymentMap.get(split.method) || 0) + split.amount)
        );
      } else {
        const method = o.payment?.method || 'cash';
        paymentMap.set(method, (paymentMap.get(method) || 0) + o.totalAmount);
      }
    });
    const payments = [...paymentMap.entries()]
      .map(([method, amount]) => ({ method, amount }))
      .sort((a, b) => b.amount - a.amount);

    const days = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(today);
      day.setDate(day.getDate() - (6 - i));
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      const total = settled
        .filter((o) => new Date(o.createdAt) >= day && new Date(o.createdAt) < next)
        .reduce((sum, o) => sum + o.totalAmount, 0);
      return {
        label: day.toLocaleDateString('en-US', { weekday: 'short' }),
        total,
      };
    });

    const kitchenLoad = orders.filter((o) =>
      ['pending', 'approved', 'preparing'].includes(o.status)
    ).length;
    const readyCount = orders.filter((o) => o.status === 'ready').length;
    const recent = [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);

    return {
      revenueToday,
      revenueWeek,
      revenueAll,
      avgTicket,
      activeCount: active.length,
      totalOrders: orders.length,
      topDishes,
      payments,
      days,
      kitchenLoad,
      readyCount,
      recent,
    };
  }, [orders]);

  const maxDay = Math.max(...stats.days.map((d) => d.total), 1);
  const paymentTotal = stats.payments.reduce((sum, p) => sum + p.amount, 0) || 1;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: 'Revenue Today',
            value: formatETB(stats.revenueToday),
            icon: Banknote,
            tone: 'text-emerald-400 bg-emerald-500/10',
          },
          {
            label: 'Revenue (7 days)',
            value: formatETB(stats.revenueWeek),
            icon: TrendingUp,
            tone: 'text-[#F59E0B] bg-[#F59E0B]/10',
          },
          {
            label: 'Active Orders',
            value: String(stats.activeCount),
            icon: ClipboardList,
            tone: 'text-sky-400 bg-sky-500/10',
          },
          {
            label: 'Average Ticket',
            value: formatETB(Math.round(stats.avgTicket)),
            icon: CreditCard,
            tone: 'text-violet-400 bg-violet-500/10',
          },
        ].map((stat) => (
          <Card key={stat.label} className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
                  {stat.label}
                </p>
                <p className="mt-1.5 text-lg font-black text-[#F8FAFC] sm:text-xl">{stat.value}</p>
              </div>
              <span className={`rounded-xl p-2.5 ${stat.tone}`}>
                <stat.icon className="h-5 w-5" />
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#F8FAFC]">Weekly Revenue</h3>
              <p className="text-xs text-[#94A3B8]">Settled bills for the last 7 days</p>
            </div>
            <Badge variant="success">{formatETB(stats.revenueWeek)}</Badge>
          </div>

          <div className="flex h-44 items-end gap-2.5">
            {stats.days.map((day, i) => (
              <div key={`${day.label}-${i}`} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[9px] font-bold text-[#64748B]">
                  {day.total ? `${Math.round(day.total / 1000)}k` : ''}
                </span>
                <div className="flex h-32 w-full items-end overflow-hidden rounded-lg bg-[#12131A]">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-[#B45309] to-[#F59E0B] transition-all"
                    style={{ height: `${Math.max(4, (day.total / maxDay) * 100)}%` }}
                    title={formatETB(day.total)}
                  />
                </div>
                <span className="text-[10px] font-bold uppercase text-[#94A3B8]">{day.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#F8FAFC]">Payment Mix</h3>
            <Settings2 className="h-4 w-4 text-[#94A3B8]" />
          </div>
          <div className="space-y-3">
            {stats.payments.map((p) => (
              <div key={p.method}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#CBD5E1]">
                    {paymentLabel(p.method as never)}
                  </span>
                  <span className="font-mono font-bold text-[#F8FAFC]">{formatETB(p.amount)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-[#F59E0B]"
                    style={{ width: `${(p.amount / paymentTotal) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {stats.payments.length === 0 && (
              <p className="py-8 text-center text-xs text-[#94A3B8]">No settled payments yet.</p>
            )}
          </div>
          <Button variant="outline" size="sm" className="mt-4 w-full" onClick={onOpenSettings}>
            Manage payment channels <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#F8FAFC]">Top Selling Dishes</h3>
              <p className="text-xs text-[#94A3B8]">Ranked by total quantity ordered</p>
            </div>
            <ChefHat className="h-5 w-5 text-[#F59E0B]" />
          </div>
          <div className="space-y-3">
            {stats.topDishes.map((dish, index) => (
              <div key={dish.name} className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F59E0B]/10 text-xs font-black text-[#F59E0B]">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2 text-xs">
                    <span className="truncate font-bold text-[#F8FAFC]">{dish.name}</span>
                    <span className="shrink-0 text-[#94A3B8]">{dish.qty} sold</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#B45309] to-[#F59E0B]"
                      style={{
                        width: `${(dish.qty / (stats.topDishes[0]?.qty || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="shrink-0 font-mono text-xs font-bold text-[#CBD5E1]">
                  {formatETB(dish.revenue)}
                </span>
              </div>
            ))}
            {stats.topDishes.length === 0 && (
              <p className="py-8 text-center text-xs text-[#94A3B8]">No dish sales yet.</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#F8FAFC]">Operations Snapshot</h3>
            <LayoutGrid className="h-4 w-4 text-[#94A3B8]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/5 bg-[#14151D] p-3.5">
              <CookingPot className="mb-2 h-4 w-4 text-orange-400" />
              <p className="text-xl font-black text-[#F8FAFC]">{stats.kitchenLoad}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#94A3B8]">
                In kitchen queue
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-[#14151D] p-3.5">
              <ClipboardList className="mb-2 h-4 w-4 text-emerald-400" />
              <p className="text-xl font-black text-[#F8FAFC]">{stats.readyCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#94A3B8]">
                Ready to serve
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-[#14151D] p-3.5">
              <Users className="mb-2 h-4 w-4 text-sky-400" />
              <p className="text-xl font-black text-[#F8FAFC]">
                {settings?.tablesCount ?? 0}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#94A3B8]">
                Dining tables
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-[#14151D] p-3.5">
              <Banknote className="mb-2 h-4 w-4 text-[#F59E0B]" />
              <p className="text-xl font-black text-[#F8FAFC]">{stats.totalOrders}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#94A3B8]">
                All-time orders
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            <Button variant="outline" size="sm" onClick={onOpenOrders}>
              Review live orders <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={onOpenMenu}>
              Manage menu catalog <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-extrabold text-[#F8FAFC]">Recent Orders</h3>
          <Button variant="ghost" size="sm" onClick={onOpenOrders}>
            View all <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-[#64748B]">
                <th className="pb-2 pr-3 font-extrabold">Order</th>
                <th className="pb-2 pr-3 font-extrabold">Type</th>
                <th className="pb-2 pr-3 font-extrabold">Time</th>
                <th className="pb-2 pr-3 font-extrabold">Items</th>
                <th className="pb-2 pr-3 text-right font-extrabold">Total</th>
                <th className="pb-2 text-right font-extrabold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stats.recent.map((o) => (
                <tr key={o._id} className="text-[#CBD5E1]">
                  <td className="py-2.5 pr-3 font-mono font-bold text-[#F8FAFC]">
                    #{o.orderNumber}
                  </td>
                  <td className="py-2.5 pr-3 capitalize">{o.type.replace('_', ' ')}</td>
                  <td className="py-2.5 pr-3">{formatClock(o.createdAt)}</td>
                  <td className="py-2.5 pr-3">{o.items.length}</td>
                  <td className="py-2.5 pr-3 text-right font-mono font-bold">
                    {formatETB(o.totalAmount)}
                  </td>
                  <td className="py-2.5 text-right">
                    <Badge variant={statusVariant(o.status)}>
                      {t(statusTranslationKey(o.status))}
                    </Badge>
                  </td>
                </tr>
              ))}
              {stats.recent.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#94A3B8]">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
