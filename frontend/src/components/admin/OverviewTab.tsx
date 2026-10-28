'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Armchair,
  ChefHat,
  UtensilsCrossed,
  CreditCard,
  Bike,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Order, RestaurantSetting } from '@/types';

interface OverviewTabProps {
  orders: Order[];
  settings: RestaurantSetting | null;
  onViewAllOrders: () => void;
}

export function OverviewTab({ orders, settings, onViewAllOrders }: OverviewTabProps) {
  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.status === 'settled' ? o.totalAmount : 0),
    0
  );
  const settledOrders = orders.filter((o) => o.status === 'settled').length;
  const activeOrders = orders.filter(
    (o) => !['settled', 'cancelled'].includes(o.status)
  );

  const kpis = [
    {
      title: 'Total Settled Revenue',
      value: `${totalRevenue.toLocaleString()} ETB`,
      sub: `From ${settledOrders} verified transactions`,
      icon: TrendingUp,
      color: 'text-[#F59E0B]',
      bg: 'bg-[#F59E0B]/10',
    },
    {
      title: 'Active Orders',
      value: activeOrders.length.toString(),
      sub: 'Live tickets in prep & delivery',
      icon: Clock,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
    },
    {
      title: 'Settled Bills',
      value: settledOrders.toString(),
      sub: 'Completed dining and delivery bills',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Floor Capacity',
      value: `${settings?.tablesCount || 16} Tables`,
      sub: 'Active QR dine-in seating',
      icon: Armchair,
      color: 'text-[#F8FAFC]',
      bg: 'bg-white/5',
    },
  ];

  const stations = [
    {
      href: '/kitchen',
      title: 'Kitchen KDS',
      sub: 'Live ticket prep',
      icon: ChefHat,
      color: 'text-[#F59E0B]',
      bg: 'bg-orange-500/10',
    },
    {
      href: '/waiter',
      title: 'Waiter Station',
      sub: 'Table calls & bill requests',
      icon: UtensilsCrossed,
      color: 'text-[#F59E0B]',
      bg: 'bg-amber-500/10',
    },
    {
      href: '/cashier',
      title: 'Cashier POS',
      sub: 'Telebirr & CBE settlement',
      icon: CreditCard,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      href: '/driver',
      title: 'Driver Dispatch',
      sub: 'Live GPS transit',
      icon: Bike,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* 4 KPI Metrics */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
                  {kpi.title}
                </span>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.bg} ${kpi.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-black text-[#F8FAFC]">{kpi.value}</p>
              <p className="mt-2 text-xs text-[#94A3B8]">{kpi.sub}</p>
            </Card>
          );
        })}
      </div>

      {/* Operations Quick Launch Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stations.map((st) => {
          const Icon = st.icon;
          return (
            <Link
              key={st.href}
              href={st.href}
              className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#171821] p-4.5 transition hover:border-[#F59E0B]/40 hover:bg-[#1D1E2A] group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${st.bg} ${st.color} group-hover:scale-105 transition`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#F8FAFC]">{st.title}</h4>
                  <p className="text-[11px] text-[#94A3B8]">{st.sub}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[#64748B] group-hover:text-[#F59E0B] transition" />
            </Link>
          );
        })}
      </div>

      {/* Recent Activity & Table Sessions Table */}
      <Card className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#F8FAFC]">
              Recent Activity & Table Sessions
            </h3>
            <p className="text-xs text-[#94A3B8]">Live dining and delivery transactions</p>
          </div>
          <Button
            variant="link"
            onClick={onViewAllOrders}
            className="p-0 text-xs"
          >
            View All Orders →
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.slice(0, 8).map((o, idx) => (
              <TableRow key={o._id || o.orderNumber || idx}>
                <TableCell className="font-mono font-bold text-[#F59E0B]">
                  #{o.orderNumber}
                </TableCell>
                <TableCell className="capitalize font-semibold">
                  {o.type.replace('_', ' ')}
                </TableCell>
                <TableCell>
                  {o.type === 'dine_in'
                    ? `Table ${o.tableNumber}`
                    : o.customer?.phone || 'Guest'}
                </TableCell>
                <TableCell className="font-extrabold text-[#F8FAFC]">
                  {o.totalAmount} ETB
                </TableCell>
                <TableCell className="font-mono uppercase text-[#94A3B8]">
                  {o.payment?.method || 'Unpaid'}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      o.status === 'settled'
                        ? 'success'
                        : o.status === 'preparing'
                        ? 'warning'
                        : 'secondary'
                    }
                  >
                    {o.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-[#94A3B8]">
                  No transactions recorded yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
